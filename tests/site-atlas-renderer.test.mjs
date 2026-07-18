import assert from "node:assert/strict";
import test from "node:test";
import {
  ATLAS_DISPLAY_LIMITS,
  familyStrokeStyle,
  hitTestAtlasEdge,
  hitTestAtlasNode,
  limitAtlasDisplay,
  normalizeAtlasCamera,
  screenToWorld,
  worldToScreen,
  zoomAtlasCamera
} from "../site/assets/atlas-renderer.js";

const viewport = { width: 800, height: 600, padding: 30 };
const camera = { x: 0.5, y: 0.5, zoom: 1 };

test("camera transforms round-trip and invalid camera values are bounded", () => {
  const source = { x: 0.21, y: 0.78 };
  const screen = worldToScreen(source, camera, viewport);
  const restored = screenToWorld(screen, camera, viewport);
  assert.ok(Math.abs(restored.x - source.x) < 1e-10);
  assert.ok(Math.abs(restored.y - source.y) < 1e-10);

  const normalized = normalizeAtlasCamera({ x: Infinity, y: -99, zoom: 1e9 });
  assert.equal(normalized.zoom, 10);
  assert.ok(Number.isFinite(normalized.x));
  assert.ok(normalized.y > -1);
});

test("zoom keeps the world coordinate beneath the pointer anchored", () => {
  const anchor = { x: 640, y: 180 };
  const before = screenToWorld(anchor, camera, viewport);
  const zoomed = zoomAtlasCamera(camera, 2.5, anchor, viewport);
  const after = screenToWorld(anchor, zoomed, viewport);
  assert.ok(Math.abs(after.x - before.x) < 1e-10);
  assert.ok(Math.abs(after.y - before.y) < 1e-10);
  assert.equal(zoomed.zoom, 2.5);
});

test("display selection enforces node, edge, and label ceilings deterministically", () => {
  const nodes = Array.from({ length: 310 }, (_, index) => ({
    id: `node-${String(index).padStart(3, "0")}`,
    kind: index < 12 ? "cluster" : "document",
    title: `Node ${index}`,
    x: (index % 20) / 19,
    y: (Math.floor(index / 20) % 16) / 15,
    radius: index < 12 ? 14 : 4,
    count: 310 - index
  }));
  const edges = Array.from({ length: 2200 }, (_, index) => ({
    id: `edge-${String(index).padStart(4, "0")}`,
    source: nodes[index % 200].id,
    target: nodes[(index * 7 + 1) % 200].id,
    weight: index % 31
  }));
  const result = limitAtlasDisplay({ nodes, edges }, camera, viewport);
  const again = limitAtlasDisplay({ nodes: [...nodes].reverse(), edges: [...edges].reverse() }, camera, viewport);

  assert.equal(result.nodes.length, ATLAS_DISPLAY_LIMITS.nodes);
  assert.equal(result.edges.length, ATLAS_DISPLAY_LIMITS.edges);
  assert.ok(result.labelNodes.length <= ATLAS_DISPLAY_LIMITS.labels);
  assert.ok(result.labelNodes.length >= 30);
  assert.deepEqual(result.nodes.map(({ id }) => id), again.nodes.map(({ id }) => id));
  assert.deepEqual(result.edges.map(({ id }) => id), again.edges.map(({ id }) => id));
  assert.ok(result.nodes.slice(0, 12).every((node) => node.kind === "cluster"));
});

test("label density adapts below the hard ceiling for crowded document views", () => {
  const nodes = Array.from({ length: 100 }, (_, index) => ({
    id: `node-${index}`,
    title: `문서 ${index}`,
    kind: "document",
    x: 0.1 + (index % 10) * 0.08,
    y: 0.1 + Math.floor(index / 10) * 0.08,
    count: 100 - index
  }));
  const result = limitAtlasDisplay({ nodes, edges: [] }, { x: 0.5, y: 0.5, zoom: 1 }, { width: 900, height: 700 });
  assert.ok(result.labelNodes.length < ATLAS_DISPLAY_LIMITS.labels);
  assert.ok(result.labelNodes.length >= 20);
});

test("offscreen and malformed nodes are excluded without poisoning display output", () => {
  const view = {
    nodes: [
      { id: "valid", kind: "document", x: 0.5, y: 0.5, radius: 5 },
      { id: "bad-x", kind: "document", x: Number.NaN, y: 0.5 },
      { id: "outside-range", kind: "document", x: 2, y: 0.5 },
      { id: "far", kind: "document", x: 50, y: 50 }
    ],
    edges: [
      { id: "missing-end", source: "valid", target: "bad-x" },
      null
    ]
  };
  const result = limitAtlasDisplay(view, camera, viewport);
  assert.deepEqual(result.nodes.map(({ id }) => id), ["valid"]);
  assert.deepEqual(result.edges, []);
});

test("an upstream focus label is retained without exceeding the local label budget", () => {
  const nodes = Array.from({ length: 45 }, (_, index) => ({
    id: `n-${index}`,
    kind: "document",
    x: (index % 9) / 8,
    y: Math.floor(index / 9) / 4,
    count: 45 - index
  }));
  const result = limitAtlasDisplay({ nodes, labels: ["n-44"] }, camera, viewport);
  assert.ok(result.labelNodes.length <= ATLAS_DISPLAY_LIMITS.labels);
  assert.ok(result.labelNodes.length >= 8);
  assert.equal(result.labelNodes[0].id, "n-44");
});

test("hit testing chooses the closest overlapping node and ignores invalid points", () => {
  const nodes = [
    { id: "large", kind: "cluster", x: 0.5, y: 0.5, radius: 20 },
    { id: "small", kind: "document", x: 0.505, y: 0.5, radius: 5 }
  ];
  const smallPoint = worldToScreen(nodes[1], camera, viewport);
  assert.equal(hitTestAtlasNode(nodes, smallPoint, camera, viewport).id, "small");
  assert.equal(hitTestAtlasNode(nodes, { x: -500, y: -500 }, camera, viewport), null);
  assert.equal(hitTestAtlasNode(nodes, { x: Number.NaN, y: 10 }, camera, viewport), null);
});

test("edge hit testing finds the nearest corridor or document relation", () => {
  const nodes = [
    { id: "left", kind: "cluster", x: 0.2, y: 0.4, radius: 14 },
    { id: "right", kind: "cluster", x: 0.8, y: 0.4, radius: 14 },
    { id: "lower", kind: "document", x: 0.8, y: 0.7, radius: 5 }
  ];
  const edges = [
    { id: "corridor", source: "left", target: "right", count: 20, dominantFamily: "learning" },
    { id: "document-edge", source: "right", target: "lower", weight: 1, dominantFamily: "related" },
    { id: "broken", source: "left", target: "missing" }
  ];
  const corridorPoint = worldToScreen({ x: 0.52, y: 0.405 }, camera, viewport);
  const documentPoint = worldToScreen({ x: 0.8, y: 0.58 }, camera, viewport);
  assert.deepEqual(hitTestAtlasEdge(edges, nodes, corridorPoint, camera, viewport), { ...edges[0], kind: "edge" });
  assert.equal(hitTestAtlasEdge(edges, nodes, documentPoint, camera, viewport).id, "document-edge");
  assert.equal(hitTestAtlasEdge(edges, nodes, { x: 20, y: 20 }, camera, viewport), null);
  assert.equal(hitTestAtlasEdge(edges, nodes, { x: Number.NaN, y: 20 }, camera, viewport), null);
});

test("relationship families use distinguishable immutable line patterns", () => {
  const evidence = familyStrokeStyle("evidence");
  const learning = familyStrokeStyle("learning");
  const related = familyStrokeStyle("related");
  const unknown = familyStrokeStyle("not-a-family");
  assert.deepEqual(evidence.lineDash, []);
  assert.notDeepEqual(learning.lineDash, related.lineDash);
  assert.notDeepEqual(unknown.lineDash, evidence.lineDash);
  learning.lineDash.push(999);
  assert.equal(familyStrokeStyle("learning").lineDash.includes(999), false);
});
