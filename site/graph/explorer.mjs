import { createDeterministicLayout } from "../assets/knowledge-graph.js";

const EXPLORER_CATEGORIES = Object.freeze(["concepts", "entities"]);
const EXPLORER_CATEGORY_SET = new Set(EXPLORER_CATEGORIES);
export const EXPLORER_LIMITS = Object.freeze({
  nodes: 320,
  edges: 4000,
  initialHtmlBytes: 512 * 1024,
  clientBytes: 64 * 1024
});

function pairKey(source, target) {
  return source.localeCompare(target, "ko") <= 0
    ? `${source}\u0000${target}`
    : `${target}\u0000${source}`;
}

function compareText(left, right) {
  return String(left || "").localeCompare(String(right || ""), "ko");
}

/**
 * Project the normalized wiki graph into an undirected Obsidian-style view.
 * Only public concept and entity documents are retained, and parallel semantic
 * relations collapse into one visual connection while preserving their kinds.
 */
export function buildConceptEntityGraph(graph = {}) {
  const graphNodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  const graphEdges = Array.isArray(graph.edges) ? graph.edges : [];
  const retained = graphNodes
    .filter((node) => node?.visibility === "public" && EXPLORER_CATEGORY_SET.has(node?.category) && node?.id)
    .sort((left, right) => compareText(left.id, right.id));
  if (retained.length > EXPLORER_LIMITS.nodes) {
    throw new Error(`Concept/entity graph has ${retained.length} nodes; the explorer delivery limit is ${EXPLORER_LIMITS.nodes}`);
  }
  const retainedIds = new Set(retained.map((node) => node.id));
  const groupedEdges = new Map();

  for (const edge of graphEdges) {
    if (!edge?.source || !edge?.target || edge.source === edge.target) continue;
    if (!retainedIds.has(edge.source) || !retainedIds.has(edge.target)) continue;
    const key = pairKey(edge.source, edge.target);
    if (!groupedEdges.has(key)) {
      const [source, target] = key.split("\u0000");
      groupedEdges.set(key, {
        source,
        target,
        kinds: new Set(),
        weight: 0,
        occurrences: 0
      });
    }
    const record = groupedEdges.get(key);
    if (edge.kind) record.kinds.add(String(edge.kind));
    record.weight += Number.isFinite(Number(edge.weight)) ? Number(edge.weight) : 1;
    record.occurrences += Math.max(1, Number(edge.occurrences) || 1);
  }

  const edges = [...groupedEdges.values()]
    .map((edge) => ({
      source: edge.source,
      target: edge.target,
      kinds: [...edge.kinds].sort(compareText),
      weight: Math.min(12, Math.max(1, Math.round(edge.weight * 100) / 100)),
      occurrences: edge.occurrences
    }))
    .sort((left, right) => compareText(left.source, right.source) || compareText(left.target, right.target));
  if (edges.length > EXPLORER_LIMITS.edges) {
    throw new Error(`Concept/entity graph has ${edges.length} edges; the explorer limit is ${EXPLORER_LIMITS.edges}`);
  }

  const neighbors = new Map(retained.map((node) => [node.id, new Set()]));
  for (const edge of edges) {
    neighbors.get(edge.source).add(edge.target);
    neighbors.get(edge.target).add(edge.source);
  }

  const baseNodes = retained.map((node) => ({
    id: node.id,
    title: String(node.title || node.id),
    url: String(node.url || ""),
    category: node.category,
    summary: String(node.summary || ""),
    status: String(node.status || "draft"),
    degree: neighbors.get(node.id).size
  }));
  const nodes = createDeterministicLayout(baseNodes, edges, { iterations: 190 });
  const categoryCounts = Object.fromEntries(EXPLORER_CATEGORIES.map((category) => [
    category,
    nodes.filter((node) => node.category === category).length
  ]));

  return {
    schemaVersion: "1.0.0",
    contentVersion: graph.contentVersion || null,
    limits: EXPLORER_LIMITS,
    stats: {
      nodes: nodes.length,
      edges: edges.length,
      isolated: nodes.filter((node) => node.degree === 0).length,
      categories: categoryCounts
    },
    nodes,
    edges
  };
}
