import { basename } from "node:path";
import { slugify } from "../core.mjs";

export const GRAPH_SCHEMA_VERSION = "1.0.0";

export const RELATION_META = Object.freeze({
  mentions: { label: "본문에서 언급", inverseLabel: "본문에서 언급됨", family: "navigation", directed: true, origin: "derived", weight: 1, cost: 8 },
  related: { label: "관련 항목", inverseLabel: "관련 항목", family: "navigation", directed: false, origin: "derived", weight: 2, cost: 6 },
  supports: { label: "근거로 뒷받침", inverseLabel: "근거를 받음", family: "evidence", directed: true, origin: "derived", weight: 5, cost: 2 },
  path_next: { label: "학습 경로의 다음 단계", inverseLabel: "학습 경로의 이전 단계", family: "learning", directed: true, origin: "derived", weight: 4, cost: 3 },
  broader: { label: "더 넓은 개념", inverseLabel: "더 좁은 개념", family: "semantic", directed: true, origin: "curated", weight: 6, cost: 1 },
  narrower: { label: "더 좁은 개념", inverseLabel: "더 넓은 개념", family: "semantic", directed: true, origin: "curated", weight: 6, cost: 1 },
  prerequisite_for: { label: "선수 개념", inverseLabel: "선행 학습이 필요함", family: "learning", directed: true, origin: "curated", weight: 7, cost: 1 },
  enables: { label: "가능하게 함", inverseLabel: "가능해짐", family: "causal", directed: true, origin: "curated", weight: 7, cost: 1 },
  constrains: { label: "제약함", inverseLabel: "제약을 받음", family: "causal", directed: true, origin: "curated", weight: 7, cost: 1 },
  measures: { label: "측정함", inverseLabel: "측정됨", family: "semantic", directed: true, origin: "curated", weight: 7, cost: 1 },
  implements: { label: "구현함", inverseLabel: "구현됨", family: "semantic", directed: true, origin: "curated", weight: 7, cost: 1 },
  exemplifies: { label: "사례가 됨", inverseLabel: "사례로 설명됨", family: "semantic", directed: true, origin: "curated", weight: 7, cost: 1 },
  precedes: { label: "역사적으로 앞섬", inverseLabel: "뒤이어 나타남", family: "history", directed: true, origin: "curated", weight: 7, cost: 1 },
  responds_to: { label: "문제에 대응함", inverseLabel: "대응의 대상이 됨", family: "causal", directed: true, origin: "curated", weight: 7, cost: 1 },
  contradicts: { label: "반박하거나 충돌함", inverseLabel: "반박되거나 충돌함", family: "evidence", directed: true, origin: "curated", weight: 7, cost: 1 },
  synthesizes: { label: "종합함", inverseLabel: "종합의 대상이 됨", family: "semantic", directed: true, origin: "curated", weight: 7, cost: 1 }
});

export const HISTORICAL_LAYERS = Object.freeze([
  "theory",
  "machine",
  "architecture",
  "software",
  "system",
  "service",
  "measurement"
]);

export const CAPABILITY_LAYERS = Object.freeze([
  "computability",
  "complexity",
  "programmability",
  "realized-performance",
  "scalability",
  "resource-efficiency",
  "reliable-results"
]);

export const CURATED_RELATION_KINDS = Object.freeze([
  "related",
  "supports",
  "broader",
  "narrower",
  "prerequisite_for",
  "enables",
  "constrains",
  "measures",
  "implements",
  "exemplifies",
  "precedes",
  "responds_to",
  "contradicts",
  "synthesizes"
]);

export const HISTORICAL_RELATION_KINDS = Object.freeze([
  "responds_to",
  "enables",
  "precedes",
  "constrains"
]);

export function parseYear(value) {
  if (value === undefined || value === null || value === "") return null;
  const year = Number(value);
  if (!Number.isInteger(year) || year < -9999 || year > 9999) {
    throw new Error(`Invalid graph year '${value}'`);
  }
  return year;
}

export function graphNodeId(page) {
  if (page.sourceId) return page.sourceId;
  const explicit = String(page.graphId || "").trim();
  if (explicit) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(explicit)) {
      throw new Error(`Invalid graph_id '${explicit}' on '${page.title}'; use a lowercase ASCII slug`);
    }
    return explicit;
  }
  return `${page.category}-${slugify(basename(page.filePath, ".md"))}`;
}

export function validateGraphMetadata(page) {
  if (page.graphId && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(page.graphId)) {
    throw new Error(`Invalid graph_id '${page.graphId}' on '${page.title}'; use a lowercase ASCII slug`);
  }
  if (page.graphVisibility && !["public", "context", "hidden"].includes(page.graphVisibility)) {
    throw new Error(`Invalid graph_visibility '${page.graphVisibility}' on '${page.title}'`);
  }
  if (page.historicalLayer && !HISTORICAL_LAYERS.includes(page.historicalLayer)) {
    throw new Error(`Invalid historical_layer '${page.historicalLayer}' on '${page.title}'`);
  }
  for (const layer of page.capabilityLayers || []) {
    if (!CAPABILITY_LAYERS.includes(layer)) {
      throw new Error(`Invalid capability_layers value '${layer}' on '${page.title}'`);
    }
  }
  const start = parseYear(page.eventStart);
  const end = parseYear(page.eventEnd);
  if (end !== null && start === null) {
    throw new Error(`event_end requires event_start on '${page.title}'`);
  }
  if (start !== null && end !== null && start > end) {
    throw new Error(`event_start must not be later than event_end on '${page.title}'`);
  }
  if (page.historicalNote && String(page.historicalNote).length > 300) {
    throw new Error(`historical_note must be 300 characters or fewer on '${page.title}'`);
  }
}

export function validateKnowledgeGraph(graph) {
  if (graph.schemaVersion !== GRAPH_SCHEMA_VERSION) {
    throw new Error(`Unsupported graph schema '${graph.schemaVersion}'`);
  }
  const nodeIds = new Set();
  for (const node of graph.nodes) {
    if (nodeIds.has(node.id)) throw new Error(`Duplicate graph node id '${node.id}'`);
    nodeIds.add(node.id);
  }
  const edgeIds = new Set();
  for (const edge of graph.edges) {
    if (edgeIds.has(edge.id)) throw new Error(`Duplicate graph edge id '${edge.id}'`);
    edgeIds.add(edge.id);
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      throw new Error(`Graph edge '${edge.id}' references a missing node`);
    }
    if (!RELATION_META[edge.kind]) throw new Error(`Unknown graph relation '${edge.kind}'`);
    if (edge.origin === "curated" && HISTORICAL_RELATION_KINDS.includes(edge.kind) && !(edge.evidence || []).length) {
      throw new Error(`Historical graph edge '${edge.id}' requires direct evidence`);
    }
  }
  return graph;
}
