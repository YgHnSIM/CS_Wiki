import assert from "node:assert/strict";
import test from "node:test";
import {
  GRAPH_SETTINGS_DEFAULTS,
  attachmentAssetHref,
  computeVisibleGraphNodeIds,
  createClusterOverviewLayout,
  createDeterministicLayout,
  createFocusedOrbitLayout,
  createGraphAdjacency,
  fitFocusedGraphCamera,
  fitGraphCamera,
  graphSearchResults,
  matchGraphQuery,
  normalizeGraphSettings,
  normalizeKnowledgeGraph,
  shortestGraphPath
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
      node("concept-a", "concepts", {
        title: "개념 A",
        aliases: ["Concept A", "개념 에이", "Concept A"],
        domains: ["domain/z", "domain/a", "domain/z"],
        created: "2026-07-01",
        updated: "2026-07-22",
        attachments: ["image-b.png", "image-a.png", "image-b.png"],
        unresolved: ["미완성 B", "미완성 A"]
      }),
      node("person-b", "entities", { title: "인물 B" }),
      node("concept-isolated", "concepts", { tags: ["custom/z", "custom/a", "custom/z"] }),
      node("source-x", "sources", { title: "근거 X", url: "/sources/source-x/" }),
      node("analysis-c", "analyses"),
      node("context-d", "concepts", { visibility: "context" }),
      node("hidden-e", "entities", { visibility: "hidden" })
    ],
    edges: [
      { source: "concept-a", target: "person-b", kind: "mentions", directed: true, weight: 1, occurrences: 2 },
      { source: "person-b", target: "concept-a", kind: "implements", directed: true, weight: 1, occurrences: 1, origin: "curated", contexts: [{ note: "인물 B가 개념 A를 구현했다." }], evidence: ["source-x"] },
      { source: "person-b", target: "concept-a", kind: "related", directed: false, weight: 1, occurrences: 3 },
      { source: "concept-a", target: "analysis-c", kind: "mentions", weight: 1 },
      { source: "concept-a", target: "context-d", kind: "related", weight: 2 }
    ]
  });

  assert.equal(projected.contentVersion, "2026-07-22");
  assert.deepEqual(projected.nodes.map((record) => record.id), ["concept-a", "concept-isolated", "person-b"]);
  assert.deepEqual(projected.edges, [{
    source: "concept-a",
    target: "person-b",
    kinds: ["implements", "mentions", "related"],
    weight: 3,
    occurrences: 6,
    relations: [
      {
        kind: "implements",
        direction: "reverse",
        origin: "curated",
        note: "인물 B가 개념 A를 구현했다.",
        evidence: [{ id: "source-x", title: "근거 X", url: "/sources/source-x/" }]
      }
    ],
    direction: "both",
    directions: {
      forward: { kinds: ["mentions"], occurrences: 2 },
      reverse: { kinds: ["implements"], occurrences: 1 },
      none: { kinds: ["related"], occurrences: 3 }
    }
  }]);
  assert.deepEqual(projected.nodes.map(({ id, degree }) => ({ id, degree })), [
    { id: "concept-a", degree: 1 },
    { id: "concept-isolated", degree: 0 },
    { id: "person-b", degree: 1 }
  ]);
  assert.ok(projected.nodes.every((record) => Number.isFinite(record.x) && Number.isFinite(record.y)));
  const concept = projected.nodes.find((record) => record.id === "concept-a");
  assert.deepEqual(concept.aliases, ["개념 에이", "Concept A"]);
  assert.deepEqual(concept.domains, ["domain/a", "domain/z"]);
  assert.deepEqual(concept.tags, ["domain/a", "domain/z", "status/active", "type/concept"]);
  assert.equal(concept.url, "/concepts/concept-a/");
  assert.equal(concept.created, "2026-07-01");
  assert.equal(concept.updated, "2026-07-22");
  assert.deepEqual(concept.attachments, ["image-a.png", "image-b.png"]);
  assert.deepEqual(concept.unresolved, ["미완성 A", "미완성 B"]);
  const person = projected.nodes.find((record) => record.id === "person-b");
  assert.deepEqual(person.tags, ["status/active", "type/entity"]);
  assert.deepEqual(person.attachments, []);
  assert.deepEqual(person.unresolved, []);
  assert.deepEqual(projected.nodes.find((record) => record.id === "concept-isolated").tags, ["custom/a", "custom/z"]);
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
      { source: "c", target: "a", kind: "related", directed: false, weight: 2 },
      { source: "b", target: "a", kind: "mentions", directed: true, weight: 1 }
    ]
  };
  const reversed = { nodes: [...graph.nodes].reverse(), edges: [...graph.edges].reverse() };
  const projected = buildConceptEntityGraph(graph);
  assert.deepEqual(projected, buildConceptEntityGraph(reversed));
  assert.deepEqual(projected.edges.map(({ source, target, direction, directions }) => ({ source, target, direction, directions })), [
    {
      source: "a",
      target: "b",
      direction: "reverse",
      directions: {
        forward: { kinds: [], occurrences: 0 },
        reverse: { kinds: ["mentions"], occurrences: 1 },
        none: { kinds: [], occurrences: 0 }
      }
    },
    {
      source: "a",
      target: "c",
      direction: "none",
      directions: {
        forward: { kinds: [], occurrences: 0 },
        reverse: { kinds: [], occurrences: 0 },
        none: { kinds: ["related"], occurrences: 1 }
      }
    }
  ]);
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
  assert.deepEqual(normalized.edges, [{ source: "a", target: "b", weight: 3, kinds: ["related"], direction: "none" }]);
});

test("graph settings normalize persisted values and reject unsafe groups", () => {
  const settings = normalizeGraphSettings({
    showTags: true,
    showAttachments: "yes",
    existingOnly: false,
    textFade: 9,
    nodeSize: 0,
    centerForce: -1,
    repelForce: 99,
    groups: [
      { id: "domain", query: "tag:domain/software-engineering", color: "#ABCDEF" },
      { id: "unsafe", query: "type:person", color: "red" }
    ]
  });
  assert.equal(settings.showTags, true);
  assert.equal(settings.showAttachments, GRAPH_SETTINGS_DEFAULTS.showAttachments);
  assert.equal(settings.existingOnly, false);
  assert.equal(settings.textFade, 1);
  assert.equal(settings.nodeSize, 0.5);
  assert.equal(settings.centerForce, 0);
  assert.equal(settings.repelForce, 2.5);
  assert.deepEqual(settings.groups, [
    { id: "domain", query: "tag:domain/software-engineering", color: "#abcdef" },
    { id: "unsafe", query: "type:person", color: "#ffb000" }
  ]);
});

test("file and group queries support fields, phrases, OR, and exclusions", () => {
  const concept = {
    title: "저장 프로그램 컴퓨터",
    aliases: ["Stored-program computer"],
    summary: "프로그램과 데이터를 기억장치에 저장한다.",
    url: "/concepts/저장-프로그램-컴퓨터/",
    category: "concepts",
    tags: ["domain/computer-architecture", "status/active"],
    status: "active"
  };
  assert.equal(matchGraphQuery(concept, '"저장 프로그램" status:active'), true);
  assert.equal(matchGraphQuery(concept, "tag:computer-architecture"), true);
  assert.equal(matchGraphQuery(concept, "type:person OR alias:stored-program"), true);
  assert.equal(matchGraphQuery(concept, "type:concept -status:draft"), true);
  assert.equal(matchGraphQuery(concept, "path:entities OR status:draft"), false);
});

test("focused camera keeps the selection centered and every direct neighbor inside the safe frame", () => {
  const selected = { id: "focus", x: 110, y: -80 };
  const neighbors = [
    { id: "left", x: -890, y: -80 },
    { id: "right", x: 1610, y: -80 },
    { id: "top", x: 110, y: -1280 },
    { id: "bottom", x: 110, y: 1120 }
  ];
  const viewport = { width: 390, height: 280 };
  const padding = 54;
  const camera = fitFocusedGraphCamera(selected, [...neighbors].reverse(), viewport, padding);
  assert.equal(camera.x, selected.x);
  assert.equal(camera.y, selected.y);
  assert.ok(camera.zoom < 0.24);
  const center = { x: viewport.width / 2, y: viewport.height / 2 };
  for (const node of neighbors) {
    const screen = {
      x: center.x + (node.x - camera.x) * camera.zoom,
      y: center.y + (node.y - camera.y) * camera.zoom
    };
    assert.ok(screen.x >= padding - 0.001 && screen.x <= viewport.width - padding + 0.001);
    assert.ok(screen.y >= padding - 0.001 && screen.y <= viewport.height - padding + 0.001);
  }
  assert.deepEqual(camera, fitFocusedGraphCamera(selected, neighbors, viewport, padding));
});

test("semantic layouts create stable clusters and relation sectors", () => {
  const nodes = [
    node("architecture-a", "concepts", { domains: ["domain/computer-architecture"], degree: 3 }),
    node("architecture-b", "entities", { domains: ["domain/computer-architecture"], degree: 1 }),
    node("software-c", "concepts", { domains: ["domain/software-engineering"], degree: 2 })
  ];
  const edges = [
    { source: "architecture-a", target: "architecture-b", kinds: ["related"] },
    { source: "architecture-a", target: "software-c", kinds: ["enables"] }
  ];
  const overview = createClusterOverviewLayout(nodes, edges);
  assert.equal(overview.clusters.length, 2);
  assert.equal(overview.corridors.length, 1);
  assert.equal(overview.corridors[0].count, 1);
  assert.deepEqual(overview, createClusterOverviewLayout([...nodes].reverse(), [...edges].reverse()));

  const focus = createFocusedOrbitLayout(nodes[0], nodes.slice(1), edges);
  assert.deepEqual(focus.positions.get("architecture-a"), { x: 0, y: 0 });
  assert.ok(focus.positions.get("software-c").x > 0, "implementation neighbor belongs on the right");
  assert.ok(focus.positions.get("architecture-b").y > 0, "related neighbor belongs below the focus");
});

test("path exploration returns a deterministic shortest route", () => {
  const adjacency = new Map([
    ["a", new Set(["c", "b"])],
    ["b", new Set(["a", "d"])],
    ["c", new Set(["a", "d"])],
    ["d", new Set(["b", "c"])],
    ["isolated", new Set()]
  ]);
  assert.deepEqual(shortestGraphPath(adjacency, "a", "d"), ["a", "b", "d"]);
  assert.deepEqual(shortestGraphPath(adjacency, "a", "isolated"), []);
  assert.deepEqual(shortestGraphPath(adjacency, "a", "a"), ["a"]);
});

test("force controls produce finite deterministic but distinct layouts", () => {
  const nodes = [node("a", "concepts"), node("b", "entities"), node("c", "concepts")];
  const edges = [{ source: "a", target: "b", weight: 1 }, { source: "b", target: "c", weight: 2 }];
  const compact = createDeterministicLayout(nodes, edges, {
    iterations: 50,
    centerForce: 2,
    repelForce: 0.25,
    linkForce: 2,
    linkDistance: 0.5
  });
  const loose = createDeterministicLayout(nodes, edges, {
    iterations: 50,
    centerForce: 0,
    repelForce: 2.5,
    linkForce: 0,
    linkDistance: 2
  });
  assert.ok(compact.every((record) => Number.isFinite(record.x) && Number.isFinite(record.y)));
  assert.ok(loose.every((record) => Number.isFinite(record.x) && Number.isFinite(record.y)));
  assert.deepEqual(compact, createDeterministicLayout([...nodes].reverse(), [...edges].reverse(), {
    iterations: 50,
    centerForce: 2,
    repelForce: 0.25,
    linkForce: 2,
    linkDistance: 0.5
  }));
  assert.notDeepEqual(compact.map(({ x, y }) => ({ x, y })), loose.map(({ x, y }) => ({ x, y })));
});

test("clearing a selection restores the active graph filters before animation", () => {
  const nodes = [
    node("concept-a", "concepts", { title: "선택 개념" }),
    node("person-b", "entities", { title: "연결 인물" }),
    node("concept-c", "concepts", { title: "다른 개념" })
  ];
  const adjacency = createGraphAdjacency(nodes, [{ source: "concept-a", target: "person-b" }]);
  assert.deepEqual(
    [...computeVisibleGraphNodeIds(nodes, adjacency, { activeFilter: "entities", selectedId: "concept-a" })].sort(),
    ["concept-a", "person-b"]
  );
  assert.deepEqual(
    [...computeVisibleGraphNodeIds(nodes, adjacency, { activeFilter: "entities", selectedId: "" })],
    ["person-b"]
  );
});

test("attachment assets use the configured site base and reject unsafe paths", () => {
  assert.equal(attachmentAssetHref("/CS_Wiki/assets/raw/", "도표/구조 그림.svg"), "/CS_Wiki/assets/raw/%EB%8F%84%ED%91%9C/%EA%B5%AC%EC%A1%B0%20%EA%B7%B8%EB%A6%BC.svg");
  assert.equal(attachmentAssetHref("/assets/raw/", "../secret.pdf"), "");
  assert.equal(attachmentAssetHref("/assets/raw/", "https://example.test/file.pdf"), "");
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
