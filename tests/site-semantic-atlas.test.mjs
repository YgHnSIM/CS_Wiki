import assert from "node:assert/strict";
import test from "node:test";
import {
  atlasActivation,
  atlasFiltersFromState,
  atlasManifestAsset,
  atlasSearchResultIndex,
  atlasVersionedAssetUrl,
  createAtlasRequestGate,
  normalizeSemanticAtlasView
} from "../site/assets/semantic-atlas.js";

test("lazy atlas shards inherit the active build version instead of reusing stale cache entries", () => {
  assert.equal(
    atlasVersionedAssetUrl("clusters/history.json", "https://example.test/data/atlas/manifest.json?v=old", "new-build"),
    "https://example.test/data/atlas/clusters/history.json?v=new-build"
  );
  assert.equal(
    atlasVersionedAssetUrl("overview.json?lang=ko", "https://example.test/data/atlas/manifest.json", "v2"),
    "https://example.test/data/atlas/overview.json?lang=ko&v=v2"
  );
  assert.throws(
    () => atlasVersionedAssetUrl("https://outside.test/shard.json", "https://example.test/data/atlas/manifest.json", "v2"),
    /site origin/
  );
});

test("manifest assets resolve direct, mapped, array, and nested shard records", () => {
  const manifest = {
    overview: { url: "overview.json" },
    lookupUrl: "lookup.json",
    clusters: { machines: { url: "clusters/machines.json" } },
    corridorShards: [{ id: "a-b", path: "corridors/a-b.json" }],
    shards: { focus: { document: "focus/document.json" } }
  };
  assert.equal(atlasManifestAsset(manifest, "overview"), "overview.json");
  assert.equal(atlasManifestAsset(manifest, "lookup"), "lookup.json");
  assert.equal(atlasManifestAsset(manifest, "cluster", "machines"), "clusters/machines.json");
  assert.equal(atlasManifestAsset(manifest, "corridor", "a-b"), "corridors/a-b.json");
  assert.equal(atlasManifestAsset(manifest, "focus", "document"), "focus/document.json");
  assert.equal(atlasManifestAsset(manifest, "cluster", "missing"), "");
  assert.equal(atlasManifestAsset({ routes: { cluster: "clusters/{id}.json" } }, "cluster", "logic"), "clusters/logic.json");
  assert.equal(atlasManifestAsset({ routes: { focus: "focus/{bucket}.json" } }, "focus", "0f"), "focus/0f.json");
});

test("payload wrappers normalize to one nodes, edges, and label view", () => {
  assert.deepEqual(normalizeSemanticAtlasView({
    layout: {
      clusters: [{ id: "a" }],
      corridors: [{ id: "a-b" }],
      labels: [{ id: "a" }],
      stats: { count: 1 }
    }
  }), {
    clusters: [{ id: "a" }],
    corridors: [{ id: "a-b" }],
    labels: ["a"],
    stats: { count: 1 },
    nodes: [{ id: "a", kind: "cluster" }],
    edges: [{ id: "a-b", corridorId: "a-b" }]
  });
  assert.deepEqual(normalizeSemanticAtlasView(null), { nodes: [], edges: [], labels: [] });
  const aggregate = normalizeSemanticAtlasView({ clusters: [{
    id: "history",
    r: 18,
    nodeCount: 42,
    facets: { domains: ["domain/computer-history"], categories: ["concepts"] }
  }] });
  assert.deepEqual(aggregate.nodes[0], {
    id: "history",
    r: 18,
    nodeCount: 42,
    facets: { domains: ["domain/computer-history"], categories: ["concepts"] },
    kind: "cluster",
    domains: ["domain/computer-history"],
    categories: ["concepts"],
    radius: 18,
    count: 42
  });
});

test("activation distinguishes overview corridors, clusters, documents, and relation inspection", () => {
  assert.deepEqual(atlasActivation({ id: "cluster", kind: "cluster" }, "overview"), { action: "cluster", id: "cluster" });
  assert.deepEqual(atlasActivation({ id: "doc", kind: "document" }, "cluster"), { action: "focus", id: "doc" });
  assert.deepEqual(atlasActivation({ id: "edge", kind: "edge" }, "overview"), { action: "corridor", id: "edge" });
  assert.deepEqual(atlasActivation({ id: "edge", kind: "edge" }, "focus"), { action: "inspect-edge", id: "edge" });
  assert.deepEqual(atlasActivation({ id: "edge", corridorId: "corridor", kind: "edge" }, "cluster"), { action: "corridor", id: "corridor" });
  assert.deepEqual(atlasActivation(null, "overview"), { action: "none", id: "" });
});

test("filters are flattened and keyboard result movement wraps predictably", () => {
  assert.deepEqual(atlasFiltersFromState({ filters: { domain: "history", status: "active", capability: "" } }), {
    domain: "history",
    status: "active"
  });
  assert.equal(atlasSearchResultIndex(-1, "ArrowDown", 3), 0);
  assert.equal(atlasSearchResultIndex(-1, "ArrowUp", 3), 2);
  assert.equal(atlasSearchResultIndex(2, "ArrowDown", 3), 0);
  assert.equal(atlasSearchResultIndex(0, "ArrowUp", 3), 2);
  assert.equal(atlasSearchResultIndex(1, "Home", 3), 0);
  assert.equal(atlasSearchResultIndex(1, "End", 3), 2);
  assert.equal(atlasSearchResultIndex(1, "ArrowDown", 0), -1);
});

test("request gates invalidate stale work and expose abortable current tokens", () => {
  const gate = createAtlasRequestGate();
  const first = gate.begin();
  const second = gate.begin();
  assert.equal(first.current(), false);
  assert.equal(second.current(), true);
  assert.equal(gate.isCurrent(first.token), false);
  assert.equal(gate.isCurrent(second.token), true);
  assert.equal(first.signal?.aborted, true);
  gate.cancel();
  assert.equal(second.current(), false);
  assert.equal(second.signal?.aborted, true);
});
