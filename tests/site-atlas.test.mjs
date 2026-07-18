import assert from "node:assert/strict";
import { gzipSync } from "node:zlib";
import test from "node:test";
import { ATLAS_LIMITS, buildSemanticAtlas } from "../site/graph/atlas.mjs";

function node(id, domain, extra = {}) {
  return {
    id,
    title: `문서 ${id}`,
    aliases: [],
    url: `/concepts/${id}/`,
    category: "concepts",
    domains: domain ? [domain] : [],
    status: "active",
    summary: `${id} 요약`,
    visibility: "public",
    historical: { layer: extra.historicalLayer || null },
    capabilityLayers: extra.capabilityLayers || [],
    degree: { incoming: 1, outgoing: 1, total: extra.degree || 2 },
    ...extra
  };
}

function edge(id, source, target, kind = "mentions", extra = {}) {
  return {
    id,
    source,
    target,
    kind,
    family: kind === "supports" ? "evidence" : kind === "path_next" ? "learning" : "navigation",
    directed: kind !== "related",
    origin: extra.origin || "derived",
    weight: kind === "supports" ? 5 : kind === "path_next" ? 4 : kind === "related" ? 2 : 1,
    occurrences: 1,
    evidence: [],
    contexts: extra.contexts || [{ pageId: source, section: "본문", excerpt: `${source}에서 ${target}을 언급한다.` }],
    ...extra
  };
}

function graph(nodes, edges) {
  return {
    schemaVersion: "1.0.0",
    contentVersion: "source-version",
    nodes,
    edges,
    legend: {
      mentions: { label: "본문에서 언급" },
      related: { label: "관련 항목" },
      supports: { label: "근거로 뒷받침" },
      path_next: { label: "학습 경로의 다음 단계" }
    }
  };
}

test("semantic atlas starts with bounded clusters and explainable corridor shards", () => {
  const nodes = [
    node("a", "domain/history", { capabilityLayers: ["computability"] }),
    node("b", "domain/history"),
    node("c", "domain/software", { historicalLayer: "software" }),
    node("d", "domain/software"),
    node("hidden", "domain/history", { visibility: "hidden" })
  ];
  const edges = [
    edge("a-b", "a", "b", "related"),
    edge("a-c", "a", "c", "mentions"),
    edge("b-c", "b", "c", "supports", { contexts: [{ note: "c의 직접 근거다." }] }),
    edge("b-d", "b", "d", "path_next"),
    edge("hidden-a", "hidden", "a")
  ];
  const atlas = buildSemanticAtlas(graph(nodes, edges), {
    domainLabels: { "domain/history": "컴퓨팅사", "domain/software": "소프트웨어" }
  });

  assert.equal(atlas.manifest.stats.documents, 4);
  assert.equal(atlas.manifest.stats.clusters, 2);
  assert.equal(atlas.manifest.stats.corridors, 1);
  assert.equal(atlas.overview.nodes.length, 2);
  assert.equal(atlas.overview.edges.length, 1);
  assert.ok(atlas.overview.nodes.every((item) => Number.isFinite(item.x) && Number.isFinite(item.y)));
  const corridor = Object.values(atlas.corridors)[0];
  assert.equal(corridor.stats.totalRelations, 3);
  assert.deepEqual(corridor.relationships.map((item) => item.kind), ["supports", "path_next", "mentions"]);
  assert.equal(corridor.relationships[0].contexts[0].note, "c의 직접 근거다.");
  assert.equal(corridor.relationships[0].sourceTitle, "문서 b");
  assert.ok(!JSON.stringify(atlas).includes("hidden-a"));
});

test("context documents stay out of global discovery and appear only beside directly linked public documents", () => {
  const nodes = [
    node("public-a", "domain/history"),
    node("public-b", "domain/software"),
    node("context-meta", "domain/meta", { visibility: "context" }),
    node("context-far", "domain/meta", { visibility: "context" })
  ];
  const edges = [
    edge("a-b", "public-a", "public-b", "related"),
    edge("a-context", "public-a", "context-meta", "supports"),
    edge("context-chain", "context-meta", "context-far", "mentions")
  ];
  const atlas = buildSemanticAtlas(graph(nodes, edges));

  assert.equal(atlas.manifest.stats.documents, 2);
  assert.deepEqual(atlas.lookup.entries.map((entry) => entry.id), ["public-a", "public-b"]);
  assert.ok(atlas.overview.nodes.every((cluster) => cluster.domain !== "domain/meta"));
  assert.equal(atlas.manifest.focusShards["context-meta"], undefined);
  const focusPath = atlas.manifest.focusShards["public-a"];
  const focusKey = focusPath.match(/([^/]+)\.json$/)[1];
  const focus = atlas.focusShards[focusKey].records["public-a"];
  assert.ok(focus.nodes.some((item) => item.id === "context-meta" && item.context === true && item.hop === 1));
  assert.ok(!focus.nodes.some((item) => item.id === "context-far"));
});

test("lookup and per-document focus shards keep lazy requests stable as documents grow", () => {
  const nodes = [node("focus", "domain/a"), node("one", "domain/a"), node("two", "domain/b"), node("far", "domain/b")];
  const edges = [
    edge("f-one", "focus", "one", "supports"),
    edge("f-two", "focus", "two", "related"),
    edge("two-far", "two", "far", "mentions")
  ];
  const atlas = buildSemanticAtlas(graph(nodes, edges));
  const focusLookup = atlas.lookup.entries.find((item) => item.id === "focus");
  assert.match(focusLookup.focus.url, /^focus\/node-[a-f0-9]{16}\.json$/);
  const shardKey = focusLookup.focus.url.match(/([^/]+)\.json$/)[1];
  const shard = atlas.focusShards[shardKey];
  assert.deepEqual(Object.keys(shard.records), ["focus"]);
  assert.equal(shard.records.focus.nodes[0].id, "focus");
  assert.ok(shard.records.focus.nodes.some((item) => item.id === "far" && item.hop === 2));
  assert.equal(Object.keys(atlas.focusShards).length, nodes.length);
});

test("atlas output is deterministic when graph input order changes", () => {
  const nodes = [node("a", "domain/a"), node("b", "domain/b"), node("c", "domain/a")];
  const edges = [edge("a-b", "a", "b"), edge("a-c", "a", "c", "supports")];
  const first = buildSemanticAtlas(graph(nodes, edges));
  const second = buildSemanticAtlas(graph([...nodes].reverse(), [...edges].reverse()));
  assert.deepEqual(second, first);
});

test("every rendered shard respects node, edge, label, and corridor ceilings", () => {
  const nodes = Array.from({ length: 320 }, (_, index) => node(`n-${index}`, index < 270 ? "domain/large" : "domain/other", { degree: 320 - index }));
  const edges = [];
  for (let index = 1; index < nodes.length; index += 1) {
    edges.push(edge(`chain-${index}`, nodes[index - 1].id, nodes[index].id, index % 5 ? "mentions" : "related"));
    if (index > 4) edges.push(edge(`skip-${index}`, nodes[index - 4].id, nodes[index].id, "supports"));
  }
  const atlas = buildSemanticAtlas(graph(nodes, edges));
  for (const shard of Object.values(atlas.shards)) {
    assert.ok(shard.nodes.length <= ATLAS_LIMITS.clusterNodes);
    assert.ok(shard.edges.length <= ATLAS_LIMITS.clusterEdges);
    assert.ok(shard.labels.length <= ATLAS_LIMITS.labels);
  }
  for (const shard of Object.values(atlas.focusShards)) {
    const record = Object.values(shard.records)[0];
    assert.ok(record.nodes.length <= ATLAS_LIMITS.focusNodes);
    assert.ok(record.edges.length <= ATLAS_LIMITS.focusEdges);
    assert.ok(record.labels.length <= ATLAS_LIMITS.labels);
  }
  for (const shard of Object.values(atlas.corridors)) {
    assert.ok(shard.relationships.length <= ATLAS_LIMITS.corridorRelations);
  }
});

test("large sparse graphs scale by adding bounded focus shards instead of one monolith", () => {
  const count = 5_000;
  const nodes = Array.from({ length: count }, (_, index) => node(`scale-${index}`, `domain/${index % 20}`));
  const edges = Array.from({ length: count }, (_, index) => edge(`ring-${index}`, `scale-${index}`, `scale-${(index + 1) % count}`));
  const atlas = buildSemanticAtlas(graph(nodes, edges), {
    limits: { clusterNodes: 80, clusterEdges: 160, focusNodes: 8, focusEdges: 16, corridorRelations: 12 }
  });
  assert.equal(atlas.lookup.entries.length, count);
  assert.equal(Object.keys(atlas.focusShards).length, count);
  assert.ok(Object.values(atlas.focusShards).every((shard) => gzipSync(JSON.stringify(shard)).length < 8_000));
  assert.ok(atlas.overview.nodes.length <= ATLAS_LIMITS.overviewNodes);
});
