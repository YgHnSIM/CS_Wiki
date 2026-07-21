import { createDeterministicLayout } from "../assets/knowledge-graph.js";

const EXPLORER_CATEGORIES = Object.freeze(["concepts", "entities"]);
const EXPLORER_CATEGORY_SET = new Set(EXPLORER_CATEGORIES);
export const EXPLORER_LIMITS = Object.freeze({
  nodes: 320,
  edges: 4000,
  initialHtmlBytes: 512 * 1024,
  clientBytes: 96 * 1024
});

function pairKey(source, target) {
  return source.localeCompare(target, "ko") <= 0
    ? `${source}\u0000${target}`
    : `${target}\u0000${source}`;
}

function compareText(left, right) {
  return String(left || "").localeCompare(String(right || ""), "ko");
}

function uniqueTextList(value) {
  const values = Array.isArray(value) ? value : value == null ? [] : [value];
  return [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))]
    .sort(compareText);
}

function nullableText(value) {
  const text = value == null ? "" : String(value).trim();
  return text || null;
}

function fallbackTags(node, status, domains) {
  const tags = uniqueTextList(node.tags);
  if (tags.length) return tags;
  const type = node.category === "entities" ? "entity" : "concept";
  return uniqueTextList([`type/${type}`, `status/${status}`, ...domains]);
}

function emptyDirectionRecord() {
  return { kinds: new Set(), occurrences: 0 };
}

function finalizeDirectionRecord(record) {
  return {
    kinds: [...record.kinds].sort(compareText),
    occurrences: record.occurrences
  };
}

/**
 * Project the normalized wiki graph into an undirected Obsidian-style view.
 * Only public concept and entity documents are retained, and parallel semantic
 * relations collapse into one visual connection while preserving their kinds
 * and their orientation relative to each connection's canonical endpoints.
 */
export function buildConceptEntityGraph(graph = {}) {
  const graphNodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  const graphEdges = Array.isArray(graph.edges) ? graph.edges : [];
  const graphNodesById = new Map(graphNodes.map((node) => [node?.id, node]));
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
        occurrences: 0,
        relations: new Map(),
        directions: {
          forward: emptyDirectionRecord(),
          reverse: emptyDirectionRecord(),
          none: emptyDirectionRecord()
        }
      });
    }
    const record = groupedEdges.get(key);
    const kind = String(edge.kind || "").trim();
    const occurrences = Math.max(1, Number(edge.occurrences) || 1);
    if (kind) record.kinds.add(kind);
    record.weight += Number.isFinite(Number(edge.weight)) ? Number(edge.weight) : 1;
    record.occurrences += occurrences;

    // Direction is expressed relative to the canonical, sorted source/target
    // pair. Explicitly undirected edges stay neutral; every other edge keeps
    // its original orientation so the client can draw accurate arrows.
    const direction = edge.directed === false
      ? "none"
      : edge.source === record.source && edge.target === record.target
        ? "forward"
        : "reverse";
    if (kind) record.directions[direction].kinds.add(kind);
    record.directions[direction].occurrences += occurrences;
    if (kind && (edge.origin === "curated" || (edge.evidence || []).length)) {
      const context = (edge.contexts || []).find((item) => item?.note);
      const relationKey = `${direction}\u0000${kind}`;
      record.relations.set(relationKey, {
        kind,
        direction,
        origin: edge.origin === "curated" ? "curated" : "derived",
        note: String(context?.note || context?.excerpt || "").slice(0, 220),
        evidence: uniqueTextList(edge.evidence).map((id) => {
          const evidenceNode = graphNodesById.get(id);
          return {
            id,
            title: String(evidenceNode?.title || id),
            url: String(evidenceNode?.url || "")
          };
        })
      });
    }
  }

  const edges = [...groupedEdges.values()]
    .map((edge) => {
      const directions = {
        forward: finalizeDirectionRecord(edge.directions.forward),
        reverse: finalizeDirectionRecord(edge.directions.reverse),
        none: finalizeDirectionRecord(edge.directions.none)
      };
      const hasForward = directions.forward.occurrences > 0;
      const hasReverse = directions.reverse.occurrences > 0;
      const direction = hasForward && hasReverse
        ? "both"
        : hasForward
          ? "forward"
          : hasReverse
            ? "reverse"
            : "none";
      return {
        source: edge.source,
        target: edge.target,
        kinds: [...edge.kinds].sort(compareText),
        weight: Math.min(12, Math.max(1, Math.round(edge.weight * 100) / 100)),
        occurrences: edge.occurrences,
        relations: [...edge.relations.values()].sort((left, right) => compareText(left.direction, right.direction)
          || compareText(left.kind, right.kind)),
        direction,
        directions
      };
    })
    .sort((left, right) => compareText(left.source, right.source) || compareText(left.target, right.target));
  if (edges.length > EXPLORER_LIMITS.edges) {
    throw new Error(`Concept/entity graph has ${edges.length} edges; the explorer limit is ${EXPLORER_LIMITS.edges}`);
  }

  const neighbors = new Map(retained.map((node) => [node.id, new Set()]));
  for (const edge of edges) {
    neighbors.get(edge.source).add(edge.target);
    neighbors.get(edge.target).add(edge.source);
  }

  const baseNodes = retained.map((node) => {
    const status = String(node.status || "draft").trim() || "draft";
    const domains = uniqueTextList(node.domains);
    return {
      id: node.id,
      title: String(node.title || node.id),
      aliases: uniqueTextList(node.aliases),
      url: String(node.url || node.path || "").trim(),
      category: node.category,
      domains,
      tags: fallbackTags(node, status, domains),
      summary: String(node.summary || ""),
      status,
      created: nullableText(node.created),
      updated: nullableText(node.updated),
      attachments: uniqueTextList(node.attachments),
      unresolved: uniqueTextList(node.unresolved),
      degree: neighbors.get(node.id).size
    };
  });
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
