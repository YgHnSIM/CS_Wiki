import { basename } from "node:path";
import { slugify } from "../core.mjs";

export const GRAPH_SCHEMA_VERSION = "2.0.0";

export const RELATION_META = Object.freeze({
  mentions: { label: "본문에서 언급", inverseLabel: "본문에서 언급됨", family: "navigation", directed: true, origin: "derived", weight: 1, cost: 8 },
  recommends: { label: "함께 읽기 추천", inverseLabel: "읽을거리로 추천됨", family: "navigation", directed: true, origin: "derived", weight: 3, cost: 4 },
  // Schema v1 compatibility only. New builds emit `recommends` for the final
  // related-reading section and never accept `related` as a curated claim.
  related: { label: "기존 관련 항목", inverseLabel: "기존 관련 항목", family: "navigation", directed: false, origin: "derived", weight: 2, cost: 6 },
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

export const GRAPH_CONNECTION_CHANNELS = Object.freeze(["core", "guide", "evidence", "trace"]);

export function graphConnectionChannel(edge) {
  if (edge.origin === "curated" && !["related", "supports"].includes(edge.kind)) return "core";
  if (["recommends", "related", "path_next"].includes(edge.kind)) return "guide";
  if (edge.kind === "supports") return "evidence";
  return "trace";
}

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
  const edgesById = new Map();
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
    edgesById.set(edge.id, edge);
  }
  if (!Array.isArray(graph.connections)) throw new Error("Graph connections must be an array");
  const connectionIds = new Set();
  const assignedEdgeIds = new Set();
  for (const connection of graph.connections) {
    if (connectionIds.has(connection.id)) throw new Error(`Duplicate graph connection id '${connection.id}'`);
    connectionIds.add(connection.id);
    if (!nodeIds.has(connection.source) || !nodeIds.has(connection.target) || connection.source === connection.target) {
      throw new Error(`Graph connection '${connection.id}' has invalid endpoints`);
    }
    const expectedId = `${connection.source}::${connection.target}`;
    if (connection.id !== expectedId || connection.source.localeCompare(connection.target, "ko") > 0) {
      throw new Error(`Graph connection '${connection.id}' is not a canonical document pair`);
    }
    if (!Array.isArray(connection.edgeIds) || !connection.edgeIds.length) {
      throw new Error(`Graph connection '${connection.id}' has no edges`);
    }
    const channelKeys = Object.keys(connection.channels || {}).sort();
    if (JSON.stringify(channelKeys) !== JSON.stringify([...GRAPH_CONNECTION_CHANNELS].sort())) {
      throw new Error(`Graph connection '${connection.id}' has invalid channels`);
    }
    const channelEdgeIds = [];
    for (const channel of GRAPH_CONNECTION_CHANNELS) {
      if (!Array.isArray(connection.channels[channel])) throw new Error(`Graph connection '${connection.id}' channel '${channel}' is invalid`);
      for (const edgeId of connection.channels[channel]) {
        const edge = edgesById.get(edgeId);
        if (!edge || graphConnectionChannel(edge) !== channel) {
          throw new Error(`Graph connection '${connection.id}' misclassifies edge '${edgeId}'`);
        }
        channelEdgeIds.push(edgeId);
      }
    }
    const declaredEdgeIds = [...connection.edgeIds].sort((left, right) => left.localeCompare(right, "ko"));
    const classifiedEdgeIds = [...channelEdgeIds].sort((left, right) => left.localeCompare(right, "ko"));
    if (JSON.stringify(declaredEdgeIds) !== JSON.stringify(classifiedEdgeIds) || new Set(declaredEdgeIds).size !== declaredEdgeIds.length) {
      throw new Error(`Graph connection '${connection.id}' edge and channel membership differ`);
    }
    const kinds = new Set();
    for (const edgeId of declaredEdgeIds) {
      const edge = edgesById.get(edgeId);
      if (!edge || ![edge.source, edge.target].every((id) => id === connection.source || id === connection.target)) {
        throw new Error(`Graph connection '${connection.id}' references an edge outside its pair`);
      }
      if (assignedEdgeIds.has(edgeId)) throw new Error(`Graph edge '${edgeId}' belongs to multiple connections`);
      assignedEdgeIds.add(edgeId);
      kinds.add(edge.kind);
    }
    const declaredKinds = [...(connection.kinds || [])].sort((left, right) => left.localeCompare(right, "ko"));
    const actualKinds = [...kinds].sort((left, right) => left.localeCompare(right, "ko"));
    if (JSON.stringify(declaredKinds) !== JSON.stringify(actualKinds)) {
      throw new Error(`Graph connection '${connection.id}' kinds differ from its edges`);
    }
  }
  if (assignedEdgeIds.size !== edgeIds.size) throw new Error("Every graph edge must belong to exactly one connection");
  return graph;
}
