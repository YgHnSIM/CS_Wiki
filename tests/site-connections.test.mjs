import assert from "node:assert/strict";
import test from "node:test";
import {
  connectionSummary,
  createConnectionIndex,
  findConnectionPaths
} from "../site/assets/connection-paths.js";

const legend = {
  mentions: { label: "본문에서 언급", inverseLabel: "본문에서 언급됨" },
  related: { label: "관련 항목", inverseLabel: "관련 항목" },
  supports: { label: "근거로 뒷받침", inverseLabel: "근거를 받음" },
  path_next: { label: "학습 경로의 다음 단계", inverseLabel: "학습 경로의 이전 단계" }
};

function node(id, category = "concepts") {
  return { id, title: id.toUpperCase(), url: `/${id}/`, category, status: "active", visibility: "public" };
}

function edge(id, source, target, kind, extra = {}) {
  const defaults = {
    mentions: { family: "navigation", directed: true, origin: "derived", weight: 1, cost: 8 },
    related: { family: "navigation", directed: false, origin: "derived", weight: 2, cost: 6 },
    supports: { family: "evidence", directed: true, origin: "derived", weight: 5, cost: 2 },
    path_next: { family: "learning", directed: true, origin: "derived", weight: 4, cost: 3 }
  }[kind];
  return { id, source, target, kind, contexts: [], reciprocal: false, ...defaults, ...extra };
}

function fixture() {
  return {
    legend,
    nodes: [node("a"), node("b"), node("c"), node("d"), node("e")],
    edges: [
      edge("mention-a-d", "a", "d", "mentions", { contexts: [{ pageId: "a", section: "본문" }] }),
      edge("evidence-b-a", "b", "a", "supports"),
      edge("path-b-d", "b", "d", "path_next", { contexts: [{ pathTitle: "테스트 경로", step: 2 }] }),
      edge("related-a-c", "a", "c", "related", { reciprocal: true }),
      edge("related-c-d", "c", "d", "related", { reciprocal: true }),
      edge("related-a-e", "a", "e", "related"),
      edge("related-e-d", "e", "d", "related")
    ]
  };
}

test("explanation mode avoids a shallow mention shortcut and preserves inverse labels", () => {
  const graph = fixture();
  const index = createConnectionIndex(graph);
  const [path] = findConnectionPaths(index, "a", "d", { mode: "explain", limit: 1 });

  assert.deepEqual(path.nodes, ["a", "b", "d"]);
  assert.equal(path.steps[0].label, "근거를 받음");
  assert.match(path.steps[0].detail, /근거로 등록/);
  assert.equal(path.steps[1].label, "학습 경로의 다음 단계");
  assert.match(connectionSummary(index, path), /“B”를 거쳐/);
});

test("shortest mode selects the direct mention while evidence mode excludes it", () => {
  const graph = fixture();
  const shortest = findConnectionPaths(graph, "a", "d", { mode: "shortest", limit: 1 })[0];
  const evidence = findConnectionPaths(graph, "a", "d", { mode: "evidence", limit: 1 })[0];

  assert.deepEqual(shortest.nodes, ["a", "d"]);
  assert.equal(shortest.steps[0].edge.kind, "mentions");
  assert.deepEqual(evidence.nodes, ["a", "b", "d"]);
  assert.equal(evidence.steps.some((step) => step.edge.kind === "mentions"), false);
});

test("a direct relation remains available while the concept lens excludes evidence and mentions", () => {
  const graph = fixture();
  const explained = findConnectionPaths(graph, "a", "d", { mode: "explain", limit: 3 });
  const concept = findConnectionPaths(graph, "a", "d", { mode: "concept", limit: 3 });

  assert.equal(explained.some((path) => path.signature === "a→d"), true);
  assert.equal(concept.some((path) => path.steps.some((step) => ["supports", "mentions"].includes(step.edge.kind))), false);
});

test("a common source is not overvalued as an intermediate semantic shortcut", () => {
  const graph = {
    legend,
    nodes: [node("a"), node("concept"), node("d"), node("reference", "references")],
    edges: [
      edge("reference-a", "reference", "a", "supports"),
      edge("reference-d", "reference", "d", "supports"),
      edge("a-concept", "a", "concept", "related"),
      edge("concept-d", "concept", "d", "related")
    ]
  };

  const [path] = findConnectionPaths(graph, "a", "d", { mode: "explain", limit: 1 });
  assert.deepEqual(path.nodes, ["a", "concept", "d"]);
});

test("alternative routes are unique, ordered, and bounded", () => {
  const paths = findConnectionPaths(fixture(), "a", "d", { mode: "explain", limit: 3, maxHops: 4 });

  assert.equal(paths.length, 3);
  assert.equal(new Set(paths.map((path) => path.signature)).size, 3);
  assert.deepEqual(paths[0].nodes, ["a", "b", "d"]);
  assert.ok(paths[0].cost <= paths[1].cost);
  assert.ok(paths[1].cost <= paths[2].cost);
});

test("hidden nodes are not indexed and disconnected or identical endpoints return no route", () => {
  const graph = fixture();
  graph.nodes.push({ ...node("hidden"), visibility: "hidden" }, node("isolated"));
  graph.edges.push(edge("hidden-bridge", "a", "hidden", "related"), edge("hidden-exit", "hidden", "isolated", "related"));
  const index = createConnectionIndex(graph);

  assert.equal(index.adjacency.get("a").some((bundle) => bundle.to === "hidden"), false);
  assert.equal(index.selectable.includes("hidden"), false);
  assert.deepEqual(findConnectionPaths(index, "a", "isolated"), []);
  assert.deepEqual(findConnectionPaths(index, "a", "a"), []);
});

test("path results remain deterministic when edge input order changes", () => {
  const graph = fixture();
  const reversed = { ...graph, edges: [...graph.edges].reverse() };
  const options = { mode: "explain", limit: 3 };

  assert.deepEqual(
    findConnectionPaths(graph, "a", "d", options).map((path) => path.signature),
    findConnectionPaths(reversed, "a", "d", options).map((path) => path.signature)
  );
});

test("compact edge overrides preserve an editor-curated related relation", () => {
  const graph = {
    legend: {
      ...legend,
      related: {
        ...legend.related,
        family: "navigation",
        directed: false,
        origin: "derived",
        weight: 2,
        cost: 6
      }
    },
    nodes: [node("a"), node("b")],
    edges: [{
      id: "curated-related-a-b",
      source: "a",
      target: "b",
      kind: "related",
      origin: "curated",
      weight: 7,
      cost: 1,
      contexts: []
    }]
  };

  const [path] = findConnectionPaths(createConnectionIndex(graph), "a", "b", { mode: "explain", limit: 1 });
  assert.equal(path.steps[0].edge.id, "curated-related-a-b");
  assert.equal(path.steps[0].edge.origin, "curated");
  assert.equal(path.steps[0].edge.weight, 7);
  assert.equal(path.steps[0].edge.cost, 1);
});

test("search budget exhaustion is reported instead of becoming a false no-route result", () => {
  assert.throws(
    () => findConnectionPaths(fixture(), "a", "d", { mode: "explain", limit: 1, maxStates: 1 }),
    (error) => error?.code === "CONNECTION_SEARCH_LIMIT"
  );
});

test("alternative spur searches share one total search budget", () => {
  const paths = findConnectionPaths(fixture(), "a", "d", { mode: "explain", limit: 3, maxStates: 6 });
  assert.ok(paths.length >= 1);
  assert.equal(paths.every((path) => path.truncated), true);
});

test("positive edge costs keep paths simple even when the graph contains cycles", () => {
  const graph = {
    legend,
    nodes: [node("a"), node("b"), node("c"), node("d")],
    edges: [
      edge("a-b", "a", "b", "related"),
      edge("b-c", "b", "c", "related"),
      edge("c-a", "c", "a", "related"),
      edge("c-d", "c", "d", "related")
    ]
  };

  const paths = findConnectionPaths(graph, "a", "d", { mode: "explain", limit: 3, maxHops: 6 });
  assert.ok(paths.length > 0);
  paths.forEach((path) => assert.equal(new Set(path.nodes).size, path.nodes.length));
});
