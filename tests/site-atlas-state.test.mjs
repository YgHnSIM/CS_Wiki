import assert from "node:assert/strict";
import test from "node:test";
import {
  atlasHistoryEntry,
  atlasPageUrlFor,
  atlasStateFromHistory,
  atlasUrlFor,
  createDocumentFocusView,
  createLruCache,
  describeAtlasEdge,
  normalizeAtlasPayloadVersion,
  parseAtlasPageUrl,
  parseAtlasUrl
} from "../site/assets/atlas-state.js";

const facets = {
  domains: ["domain/computer-history", "domain/computer-science"],
  categories: ["concepts", "analyses"],
  statuses: ["active", "review"],
  historicalLayers: ["theory", "machine"],
  capabilityLayers: ["computability", "scalability"]
};

test("atlas URL parsing resolves target conflicts and rejects invalid facets", () => {
  const state = parseAtlasUrl(
    "/map/atlas/?corridor=c-1&cluster=k-1&focus=DOC-1&q=%EF%BC%A3%EF%BC%B3%E3%80%80%EC%9C%84%ED%82%A4&domain=DOMAIN%2FCOMPUTER-HISTORY&status=draft&status=active&historical=unknown&capability=SCALABILITY",
    facets
  );
  assert.deepEqual(state, {
    mode: "focus",
    focus: "doc-1",
    cluster: "",
    corridor: "",
    q: "cs 위키",
    domain: "domain/computer-history",
    category: "",
    status: "active",
    historical: "",
    capability: "scalability"
  });

  assert.equal(parseAtlasUrl("/map/atlas/?cluster=machine&corridor=history").mode, "cluster");
  assert.equal(parseAtlasUrl("/map/atlas/?corridor=history").mode, "corridor");
});

test("focus URLs are canonical, stable, and preserve active filters", () => {
  const first = atlasUrlFor(
    "https://example.test/wiki/map/atlas/?cluster=old&corridor=old&domain=domain%2Fcomputer-history&status=active&debug=1#old",
    { focus: "Concept-Computing", filters: { capability: "SCALABILITY" } }
  );
  assert.equal(first, "https://example.test/wiki/map/atlas/?focus=concept-computing&domain=domain%2Fcomputer-history&status=active&capability=scalability");
  assert.equal(atlasUrlFor(first, parseAtlasUrl(first, facets)), first);

  const cluster = atlasUrlFor(first, { mode: "cluster", cluster: "architecture" });
  assert.equal(cluster, "https://example.test/wiki/map/atlas/?cluster=architecture&domain=domain%2Fcomputer-history&status=active&capability=scalability");
  assert.equal(
    atlasUrlFor(cluster, { mode: "overview" }),
    "https://example.test/wiki/map/atlas/?domain=domain%2Fcomputer-history&status=active&capability=scalability"
  );
});

test("static cluster routes preserve their default but overview navigation canonicalizes to the atlas root", () => {
  const options = {
    rootPath: "/map/atlas/",
    defaultCluster: "cluster-computer-history",
    defaultClusterPath: "/map/atlas/cluster-computer-history/"
  };
  const staticUrl = "https://example.test/map/atlas/cluster-computer-history/";
  const rootUrl = "https://example.test/map/atlas/";
  const defaultState = parseAtlasPageUrl(staticUrl, {}, options);
  assert.equal(defaultState.mode, "cluster");
  assert.equal(defaultState.cluster, "cluster-computer-history");
  assert.equal(atlasPageUrlFor(staticUrl, defaultState, options), staticUrl);

  const overview = { ...defaultState, mode: "overview", cluster: "" };
  assert.equal(atlasPageUrlFor(staticUrl, overview, options), rootUrl);
  assert.equal(parseAtlasPageUrl(rootUrl, {}, options).mode, "overview");
  assert.equal(
    atlasPageUrlFor(rootUrl, defaultState, options),
    `${rootUrl}?cluster=cluster-computer-history`
  );

  const restored = atlasStateFromHistory(
    atlasHistoryEntry(defaultState),
    staticUrl,
    {},
    { rootPath: options.rootPath }
  );
  assert.equal(restored.mode, "cluster");
  assert.equal(restored.cluster, "cluster-computer-history");
});

function node(id, degree = 0, extra = {}) {
  return { id, title: `문서 ${id}`, degree: { total: degree }, ...extra };
}

test("document focus stays fixed outside filters and direct neighbours precede two-hop nodes", () => {
  const shard = {
    matchingNodeIds: ["one", "two", "far"],
    nodes: [node("far", 99), node("two", 2), node("focus", 0, { matchesFilters: false }), node("one", 3)],
    edges: [
      { id: "two-far", source: "two", target: "far", kind: "mentions", weight: 1 },
      { id: "focus-two", source: "focus", target: "two", kind: "mentions", weight: 1 },
      { id: "focus-one", source: "focus", target: "one", kind: "supports", weight: 5 }
    ]
  };
  const view = createDocumentFocusView(shard, "focus", { maxNodes: 3, maxEdges: 10 });
  assert.deepEqual(view.nodes.map((item) => item.id), ["focus", "one", "two"]);
  assert.deepEqual(view.fixedNodeIds, ["focus"]);
  assert.equal(view.stats.focusOutsideFilters, true);
  assert.equal(view.stats.visibleOneHop, 2);
  assert.equal(view.stats.visibleTwoHop, 0);
  assert.equal(view.stats.truncatedNodes, true);
});

test("focus expansion is input-order independent and fills remaining capacity at two hops", () => {
  const nodes = [node("focus"), node("alpha", 2), node("beta", 1), node("gamma", 50), node("delta", 3)];
  const edges = [
    { id: "f-b", source: "focus", target: "beta", kind: "related", weight: 2 },
    { id: "a-g", source: "alpha", target: "gamma", kind: "supports", weight: 5 },
    { id: "f-a", source: "focus", target: "alpha", kind: "supports", weight: 5 },
    { id: "b-d", source: "beta", target: "delta", kind: "mentions", weight: 1 }
  ];
  const first = createDocumentFocusView({ nodes, edges }, "focus", { maxNodes: 4, maxEdges: 3 });
  const second = createDocumentFocusView({ nodes: [...nodes].reverse(), edges: [...edges].reverse() }, "focus", { maxNodes: 4, maxEdges: 3 });
  assert.deepEqual(first, second);
  assert.deepEqual(first.nodes.map((item) => item.id), ["focus", "alpha", "beta", "gamma"]);
  assert.deepEqual(first.hops, { focus: 0, alpha: 1, beta: 1, gamma: 2 });
  assert.equal(first.edges.length, 3);
});

test("edge descriptions use real source-to-target direction and the strongest available context", () => {
  const nodes = new Map([
    ["source", { id: "source", title: "원전" }],
    ["target", { id: "target", title: "분석" }],
    ["owner", { id: "owner", title: "본문 문서" }]
  ]);
  const legend = {
    supports: { label: "근거로 뒷받침" },
    path_next: { label: "학습 경로의 다음 단계" },
    related: { label: "관련 항목" },
    mentions: { label: "본문에서 언급" }
  };
  const noted = describeAtlasEdge({
    source: "source",
    target: "target",
    kind: "supports",
    directed: true,
    contexts: [{ section: "출처" }, { note: "이 원전이 분석의 직접 근거다." }]
  }, nodes, legend);
  assert.equal(noted.statement, "“원전”에서 “분석”로 이어집니다. 관계: 근거로 뒷받침.");
  assert.equal(noted.detail, "이 원전이 분석의 직접 근거다.");

  assert.equal(describeAtlasEdge({ source: "source", target: "target", kind: "supports" }, nodes, legend).detail,
    "“분석”의 sources에 “원전”가 근거로 등록되어 있습니다.");
  assert.equal(describeAtlasEdge({
    source: "source", target: "target", kind: "path_next", contexts: [{ pathTitle: "컴퓨팅사", step: 4 }]
  }, nodes, legend).detail, "‘컴퓨팅사’의 4단계에서 다음 단계로 이어집니다.");
  assert.match(describeAtlasEdge({ source: "source", target: "target", kind: "related", reciprocal: true }, nodes, legend).detail, /양방향/);
  assert.equal(describeAtlasEdge({
    source: "source", target: "target", kind: "mentions", contexts: [{ pageId: "owner", section: "핵심", excerpt: "실제 문맥" }]
  }, nodes, legend).detail, "“본문 문서”의 ‘핵심’에서 언급됩니다. 문맥: 실제 문맥");
});

test("atlas payload versions must match the active manifest", () => {
  assert.deepEqual(
    normalizeAtlasPayloadVersion(
      { schemaVersion: "1.0.0", contentVersion: "2026-07-18-a" },
      { schemaVersion: "1.0.0", contentVersion: "2026-07-18-a", nodes: [] }
    ),
    { schemaVersion: "1.0.0", contentVersion: "2026-07-18-a" }
  );
  assert.throws(
    () => normalizeAtlasPayloadVersion(
      { schemaVersion: "1.0.0", contentVersion: "current" },
      { schemaVersion: "1.0.0", contentVersion: "stale" }
    ),
    /content version mismatch/
  );
  assert.throws(
    () => normalizeAtlasPayloadVersion({ schemaVersion: "2" }, { schemaVersion: "1" }),
    /schema version mismatch/
  );
});

test("LRU cache refreshes reads and evicts the least recently used shard", () => {
  const cache = createLruCache(2);
  cache.set("a", { value: 1 }).set("b", { value: 2 });
  assert.equal(cache.get("a").value, 1);
  cache.set("c", { value: 3 });
  assert.equal(cache.has("a"), true);
  assert.equal(cache.has("b"), false);
  assert.equal(cache.peek("c").value, 3);
  assert.deepEqual(cache.keys(), ["a", "c"]);
  assert.equal(cache.size, 2);
});
