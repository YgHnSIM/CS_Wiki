import assert from "node:assert/strict";
import test from "node:test";
import {
  ATLAS_VIEW_LIMITS,
  matchesAtlasFilters,
  normalizeAtlasQuery,
  searchAtlasLookup,
  selectVisibleAtlasView
} from "../site/assets/atlas-worker.js";

function node(id, extra = {}) {
  return {
    id,
    title: `문서 ${id}`,
    aliases: [],
    category: "concepts",
    domains: ["domain/computer-science"],
    status: "active",
    historicalLayer: "theory",
    capabilityLayers: ["computability"],
    degree: { total: Number(id.replace(/\D/g, "")) || 0 },
    ...extra
  };
}

test("atlas query normalization and facet filters handle Korean and arrays", () => {
  assert.equal(normalizeAtlasQuery("  ＣＳ　위키  "), "cs 위키");
  const item = node("1");
  assert.equal(matchesAtlasFilters(item, { category: "concepts", domain: "domain/computer-science" }), true);
  assert.equal(matchesAtlasFilters(item, { capability: "scalability" }), false);
  assert.equal(matchesAtlasFilters(item, { historical: "machine" }), false);
});

test("overview clusters match filters through their aggregated facet summary", () => {
  const cluster = {
    id: "cluster-history",
    kind: "cluster",
    domain: "domain/computer-history",
    facets: {
      domains: ["domain/computer-history", "domain/computer-science"],
      categories: ["concepts", "analyses"],
      statuses: ["active"],
      historicalLayers: ["theory"],
      capabilityLayers: ["computability"]
    }
  };
  assert.equal(matchesAtlasFilters(cluster, { domain: "domain/computer-science", category: "analyses" }), true);
  assert.equal(matchesAtlasFilters(cluster, { status: "review" }), false);
  assert.equal(matchesAtlasFilters(cluster, { historical: "theory", capability: "computability" }), true);
});

test("lookup search ranks exact and prefix titles while respecting facets", () => {
  const entries = [
    node("a", { title: "컴퓨팅 능력", aliases: ["Computing capability"] }),
    node("b", { title: "컴퓨팅 능력의 발달사", category: "analyses" }),
    node("c", { title: "계산 가능성", summary: "컴퓨팅 능력의 이론적 경계" }),
    node("d", { title: "능력 모델", aliases: ["컴퓨팅 능력"] })
  ];
  assert.deepEqual(searchAtlasLookup(entries, "컴퓨팅 능력").map((item) => item.id), ["d", "a", "b", "c"]);
  assert.deepEqual(searchAtlasLookup(entries, "컴퓨팅", { category: "analyses" }).map((item) => item.id), ["b"]);
  assert.deepEqual(searchAtlasLookup(entries, "  "), []);
});

test("a focused document remains visible when filters exclude it", () => {
  const nodes = [node("focus", { status: "draft" }), node("active")];
  const edges = [{ id: "focus-edge", source: "focus", target: "active", weight: 1 }];
  const result = selectVisibleAtlasView({ nodes, edges }, { status: "active" }, { focusId: "focus" });

  assert.deepEqual(result.nodes.map((item) => item.id), ["focus", "active"]);
  assert.deepEqual(result.edges.map((edge) => edge.id), ["focus-edge"]);
  assert.equal(result.stats.matchingNodes, 1);
  assert.equal(result.stats.focusOutsideFilters, true);
});

test("visible views enforce node, edge, and label budgets without losing focus", () => {
  const nodes = Array.from({ length: 310 }, (_, index) => node(String(index), {
    degree: { total: index },
    category: index % 2 ? "concepts" : "analyses"
  }));
  const edges = Array.from({ length: 2200 }, (_, index) => ({
    id: `e-${index}`,
    source: String(index % 300),
    target: String((index * 7 + 1) % 300),
    weight: index % 9,
    count: 1
  }));
  const result = selectVisibleAtlasView({ nodes, edges }, {}, { focusId: "0" });

  assert.equal(result.nodes.length, ATLAS_VIEW_LIMITS.nodes);
  assert.equal(result.edges.length <= ATLAS_VIEW_LIMITS.edges, true);
  assert.equal(result.labels.length, ATLAS_VIEW_LIMITS.labels);
  assert.equal(result.nodes.some((item) => item.id === "0"), true);
  assert.equal(result.stats.truncatedNodes, true);
  assert.equal(result.edges.every((edge) => result.nodes.some((item) => item.id === edge.source)
    && result.nodes.some((item) => item.id === edge.target)), true);
});

test("filters are applied before budgets and output is deterministic", () => {
  const nodes = [node("3"), node("1"), node("2", { status: "draft" })];
  const edges = [
    { id: "b", source: "1", target: "3", weight: 1 },
    { id: "a", source: "1", target: "2", weight: 9 }
  ];
  const first = selectVisibleAtlasView({ nodes, edges }, { status: "active" }, { limits: { nodes: 2, edges: 1, labels: 1 } });
  const second = selectVisibleAtlasView({ nodes: [...nodes].reverse(), edges: [...edges].reverse() }, { status: "active" }, { limits: { nodes: 2, edges: 1, labels: 1 } });

  assert.deepEqual(first, second);
  assert.deepEqual(first.nodes.map((item) => item.id), ["3", "1"]);
  assert.deepEqual(first.edges.map((edge) => edge.id), ["b"]);
});
