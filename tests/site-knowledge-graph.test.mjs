import assert from "node:assert/strict";
import test from "node:test";
import {
  createDeterministicLayout,
  createGraphAdjacency,
  fitGraphCamera,
  graphSearchResults,
  normalizeKnowledgeGraph
} from "../site/assets/knowledge-graph.js";
import { EXPLORER_LIMITS, buildConceptEntityGraph } from "../site/graph/explorer.mjs";

function node(id, category, extra = {}) {
  return {
    id,
    title: id,
    url: `/${category}/${id}/`,
    category,
    summary: `${id} 설명`,
    status: "active",
    visibility: "public",
    ...extra
  };
}

test("concept/entity projection keeps public documents and collapses parallel relations", () => {
  const projected = buildConceptEntityGraph({
    contentVersion: "2026-07-22",
    nodes: [
      node("concept-a", "concepts", { title: "개념 A" }),
      node("person-b", "entities", { title: "인물 B" }),
      node("concept-isolated", "concepts"),
      node("analysis-c", "analyses"),
      node("context-d", "concepts", { visibility: "context" }),
      node("hidden-e", "entities", { visibility: "hidden" })
    ],
    edges: [
      { source: "concept-a", target: "person-b", kind: "mentions", weight: 1, occurrences: 2 },
      { source: "person-b", target: "concept-a", kind: "related", weight: 2, occurrences: 1 },
      { source: "concept-a", target: "analysis-c", kind: "mentions", weight: 1 },
      { source: "concept-a", target: "context-d", kind: "related", weight: 2 }
    ]
  });

  assert.equal(projected.contentVersion, "2026-07-22");
  assert.deepEqual(projected.nodes.map((record) => record.id), ["concept-a", "concept-isolated", "person-b"]);
  assert.deepEqual(projected.edges, [{
    source: "concept-a",
    target: "person-b",
    kinds: ["mentions", "related"],
    weight: 3,
    occurrences: 3
  }]);
  assert.deepEqual(projected.nodes.map(({ id, degree }) => ({ id, degree })), [
    { id: "concept-a", degree: 1 },
    { id: "concept-isolated", degree: 0 },
    { id: "person-b", degree: 1 }
  ]);
  assert.ok(projected.nodes.every((record) => Number.isFinite(record.x) && Number.isFinite(record.y)));
  assert.deepEqual(projected.limits, EXPLORER_LIMITS);
  assert.deepEqual(projected.stats, {
    nodes: 3,
    edges: 1,
    isolated: 1,
    categories: { concepts: 2, entities: 1 }
  });
});

test("concept/entity projection fails closed before an oversized graph reaches the browser", () => {
  const nodes = Array.from({ length: EXPLORER_LIMITS.nodes + 1 }, (_, index) => node(`concept-${index}`, "concepts"));
  assert.throws(() => buildConceptEntityGraph({ nodes, edges: [] }), /node.*limit/i);
});

test("concept/entity projection is stable when normalized graph arrays are reordered", () => {
  const graph = {
    nodes: [node("c", "concepts"), node("a", "concepts"), node("b", "entities")],
    edges: [
      { source: "c", target: "a", kind: "related", weight: 2 },
      { source: "b", target: "a", kind: "mentions", weight: 1 }
    ]
  };
  const reversed = { nodes: [...graph.nodes].reverse(), edges: [...graph.edges].reverse() };
  assert.deepEqual(buildConceptEntityGraph(graph), buildConceptEntityGraph(reversed));
});

test("client payload normalization prunes malformed records and deduplicates pairs", () => {
  const normalized = normalizeKnowledgeGraph({
    nodes: [
      { id: "a", title: "Ａ 개념", category: "concept", degree: "2" },
      { id: "b", title: "인물", category: "person" },
      { id: "bad", category: "analyses" },
      { id: "a", category: "concepts" }
    ],
    edges: [
      { source: "a", target: "b", weight: 3, kinds: ["related", "related"] },
      { source: "b", target: "a", weight: 8, kinds: ["mentions"] },
      { source: "a", target: "missing" },
      { source: "a", target: "a" }
    ]
  });
  assert.deepEqual(normalized.nodes.map(({ id, category, degree }) => ({ id, category, degree })), [
    { id: "a", category: "concepts", degree: 2 },
    { id: "b", category: "entities", degree: 0 }
  ]);
  assert.deepEqual(normalized.edges, [{ source: "a", target: "b", weight: 3, kinds: ["related"] }]);
});

test("client helpers keep adjacency, layout, Korean search, and camera fitting deterministic", () => {
  const nodes = [
    { id: "a", title: "ＡＰＩ", summary: "응용 프로그램 인터페이스", category: "concepts", degree: 2 },
    { id: "b", title: "앨런 튜링", summary: "계산 가능성 연구자", category: "entities", degree: 1 },
    { id: "c", title: "계산 가능성", summary: "튜링 기계와 결정 문제", category: "concepts", degree: 1 }
  ];
  const edges = [{ source: "a", target: "b", weight: 1 }, { source: "b", target: "c", weight: 2 }];
  const adjacency = createGraphAdjacency(nodes, edges);
  assert.deepEqual([...adjacency.get("b")].sort(), ["a", "c"]);
  assert.deepEqual([...adjacency.get("a")], ["b"]);

  const first = createDeterministicLayout(nodes, edges, { iterations: 40 });
  const second = createDeterministicLayout([...nodes].reverse(), [...edges].reverse(), { iterations: 40 });
  assert.deepEqual(first, second);
  assert.ok(first.every((record) => Number.isFinite(record.x) && Number.isFinite(record.y)));

  assert.deepEqual(graphSearchResults(nodes, "API", "concepts").map((record) => record.id), ["a"]);
  assert.deepEqual(graphSearchResults(nodes, "튜링", "entities").map((record) => record.id), ["b"]);
  assert.deepEqual(graphSearchResults(nodes, "튜링", "concepts").map((record) => record.id), ["c"]);

  const camera = fitGraphCamera(first, { width: 1200, height: 700 });
  assert.ok(Number.isFinite(camera.x) && Number.isFinite(camera.y));
  assert.ok(camera.zoom >= 0.24 && camera.zoom <= 1.7);
});
