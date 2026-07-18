export const ATLAS_VIEW_LIMITS = Object.freeze({ nodes: 240, edges: 1500, labels: 40 });

export function normalizeAtlasQuery(value = "") {
  return String(value).normalize("NFKC").toLocaleLowerCase("ko-KR").replace(/\s+/g, " ").trim();
}

function values(value) {
  return Array.isArray(value) ? value : value ? [value] : [];
}

export function matchesAtlasFilters(node, filters = {}) {
  const facets = node?.facets || {};
  const categories = [...values(node.categories), ...values(facets.categories)];
  const statuses = [...values(node.statuses), ...values(facets.statuses)];
  const domains = [...values(node.domains), ...values(facets.domains)];
  const historicalLayers = [...values(node.historicalLayers), ...values(facets.historicalLayers)];
  const capabilityLayers = [...values(node.capabilityLayers), ...values(facets.capabilityLayers)];
  if (filters.category && node.category !== filters.category && !categories.includes(filters.category)) return false;
  if (filters.status && node.status !== filters.status && !statuses.includes(filters.status)) return false;
  if (filters.domain && node.domain !== filters.domain && !domains.includes(filters.domain)) return false;
  if (filters.historical && node.historicalLayer !== filters.historical && !historicalLayers.includes(filters.historical)) return false;
  if (filters.capability && !capabilityLayers.includes(filters.capability)) return false;
  return true;
}

function nodeRank(node, focusId) {
  if (node.id === focusId) return Number.MAX_SAFE_INTEGER;
  return Number(node.degree?.total ?? node.degree ?? node.score ?? node.count ?? 0);
}

function stableNodeSort(left, right, focusId) {
  return nodeRank(right, focusId) - nodeRank(left, focusId)
    || String(left.title || left.label || left.id).localeCompare(String(right.title || right.label || right.id), "ko")
    || String(left.id).localeCompare(String(right.id), "ko");
}

function stableEdgeSort(left, right) {
  return Number(right.weight ?? right.count ?? 0) - Number(left.weight ?? left.count ?? 0)
    || Number(right.count ?? 0) - Number(left.count ?? 0)
    || String(left.id || `${left.source}:${left.target}`).localeCompare(String(right.id || `${right.source}:${right.target}`), "ko");
}

function stableFocusedEdgeSort(left, right, focusId) {
  const leftFocus = focusId && (left.source === focusId || left.target === focusId) ? 1 : 0;
  const rightFocus = focusId && (right.source === focusId || right.target === focusId) ? 1 : 0;
  return rightFocus - leftFocus || stableEdgeSort(left, right);
}

export function selectVisibleAtlasView(view = {}, filters = {}, options = {}) {
  const limits = { ...ATLAS_VIEW_LIMITS, ...(options.limits || {}) };
  const focusId = options.focusId || "";
  const sourceNodes = values(view.nodes);
  const filtered = sourceNodes.filter((node) => matchesAtlasFilters(node, filters));
  const focus = focusId ? sourceNodes.find((node) => node.id === focusId) : null;
  const focusOutsideFilters = Boolean(focus && !filtered.some((node) => node.id === focusId));
  const candidates = focusOutsideFilters ? [...filtered, focus] : filtered;
  const nodes = [...candidates]
    .sort((a, b) => stableNodeSort(a, b, focusId))
    .slice(0, limits.nodes);
  const nodeIds = new Set(nodes.map((node) => node.id));
  const candidateEdges = values(view.edges).filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target));
  const edges = [...candidateEdges].sort((a, b) => stableFocusedEdgeSort(a, b, focusId)).slice(0, limits.edges);
  const labels = [...nodes]
    .sort((a, b) => stableNodeSort(a, b, focusId))
    .slice(0, limits.labels)
    .map((node) => node.id);
  return {
    nodes,
    edges,
    labels,
    stats: {
      matchingNodes: filtered.length,
      visibleNodes: nodes.length,
      matchingEdges: candidateEdges.length,
      visibleEdges: edges.length,
      truncatedNodes: candidates.length > nodes.length,
      truncatedEdges: candidateEdges.length > edges.length,
      focusOutsideFilters
    }
  };
}

function searchableText(entry) {
  return normalizeAtlasQuery([
    entry.title,
    entry.label,
    ...values(entry.aliases),
    entry.summary,
    ...values(entry.domains)
  ].filter(Boolean).join(" "));
}

export function searchAtlasLookup(entries = [], query = "", filters = {}, limit = 12) {
  const term = normalizeAtlasQuery(query);
  if (!term) return [];
  const terms = term.split(" ");
  return values(entries)
    .filter((entry) => matchesAtlasFilters(entry, filters))
    .map((entry) => {
      const haystack = searchableText(entry);
      if (!terms.every((token) => haystack.includes(token))) return null;
      const names = [entry.title || entry.label || "", ...values(entry.aliases)].map(normalizeAtlasQuery);
      const score = names.some((name) => name === term)
        ? 4
        : names.some((name) => name.startsWith(term))
          ? 3
          : names.some((name) => name.includes(term)) ? 2 : 1;
      return { entry, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score
      || Number(b.entry.degree?.total ?? b.entry.degree ?? 0) - Number(a.entry.degree?.total ?? a.entry.degree ?? 0)
      || String(a.entry.title || a.entry.label).localeCompare(String(b.entry.title || b.entry.label), "ko")
      || String(a.entry.id).localeCompare(String(b.entry.id), "ko"))
    .slice(0, Math.max(1, Number(limit) || 12))
    .map(({ entry }) => entry);
}

const workerScope = typeof self !== "undefined" && typeof self.addEventListener === "function" && typeof window === "undefined";
if (workerScope) {
  let lookup = [];
  self.addEventListener("message", (event) => {
    const message = event.data || {};
    try {
      if (message.type === "init-lookup") {
        lookup = values(message.entries);
        self.postMessage({ type: "lookup-ready", requestId: message.requestId, count: lookup.length });
        return;
      }
      if (message.type === "search") {
        self.postMessage({
          type: "search-result",
          requestId: message.requestId,
          results: searchAtlasLookup(lookup, message.query, message.filters, message.limit)
        });
        return;
      }
      if (message.type === "filter-view") {
        self.postMessage({
          type: "filter-result",
          requestId: message.requestId,
          result: selectVisibleAtlasView(message.view, message.filters, message.options)
        });
        return;
      }
      throw new Error(`Unknown atlas worker message '${message.type}'`);
    } catch (error) {
      self.postMessage({ type: "error", requestId: message.requestId, message: error?.message || "Atlas worker failed" });
    }
  });
}
