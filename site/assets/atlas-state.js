const TARGET_KEYS = Object.freeze(["focus", "cluster", "corridor"]);
const FILTER_KEYS = Object.freeze(["domain", "category", "status", "historical", "capability"]);
const FACET_ALIASES = Object.freeze({
  focus: ["focus", "focusIds", "documents", "nodes"],
  cluster: ["cluster", "clusters", "clusterIds"],
  corridor: ["corridor", "corridors", "corridorIds"],
  domain: ["domain", "domains"],
  category: ["category", "categories"],
  status: ["status", "statuses"],
  historical: ["historical", "historicalLayers", "historical_layers"],
  capability: ["capability", "capabilityLayers", "capability_layers"]
});

const RELATION_PRIORITY = Object.freeze({ supports: 4, path_next: 3, related: 2, mentions: 1 });
const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value || {}, key);

function values(value) {
  if (value instanceof Set) return [...value];
  return Array.isArray(value) ? value : value === undefined || value === null ? [] : [value];
}

function normalizedText(value, { lower = false, maxLength = 256 } = {}) {
  const text = String(value ?? "").normalize("NFKC").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  const limited = text.slice(0, maxLength);
  return lower ? limited.toLocaleLowerCase("ko-KR") : limited;
}

function allowedValues(allowedFacets, key) {
  if (!allowedFacets || typeof allowedFacets !== "object") return null;
  const alias = FACET_ALIASES[key].find((name) => hasOwn(allowedFacets, name));
  if (!alias) return null;
  return new Set(values(allowedFacets[alias]).map((value) => normalizedText(value, { lower: true })).filter(Boolean));
}

function normalizedFacet(value, key, allowedFacets) {
  const normalized = normalizedText(value, { lower: true });
  if (!normalized) return "";
  const allowed = allowedValues(allowedFacets, key);
  return allowed && !allowed.has(normalized) ? "" : normalized;
}

function firstValidParameter(params, key, allowedFacets) {
  for (const value of params.getAll(key)) {
    const normalized = normalizedFacet(value, key, allowedFacets);
    if (normalized) return normalized;
  }
  return "";
}

function toUrl(value) {
  if (value instanceof URL) return new URL(value.href);
  return new URL(String(value || "/"), "https://atlas.local");
}

/**
 * Parse the atlas' shareable URL state. A document focus always wins over a
 * cluster, and a cluster always wins over a corridor when conflicting
 * parameters arrive from an old bookmark or a hand-edited URL.
 */
export function parseAtlasUrl(url, allowedFacets = {}) {
  const parsed = toUrl(url);
  const requested = Object.fromEntries(TARGET_KEYS.map((key) => [
    key,
    firstValidParameter(parsed.searchParams, key, allowedFacets)
  ]));
  const mode = requested.focus ? "focus" : requested.cluster ? "cluster" : requested.corridor ? "corridor" : "overview";
  const state = {
    mode,
    focus: mode === "focus" ? requested.focus : "",
    cluster: mode === "cluster" ? requested.cluster : "",
    corridor: mode === "corridor" ? requested.corridor : "",
    q: normalizedText(parsed.searchParams.get("q"), { lower: true, maxLength: 160 })
  };
  for (const key of FILTER_KEYS) {
    state[key] = firstValidParameter(parsed.searchParams, key, allowedFacets);
  }
  return state;
}

function stateValue(state, key, fallback = "") {
  if (hasOwn(state, key)) return state[key];
  if (hasOwn(state?.filters, key)) return state.filters[key];
  return fallback;
}

function canonicalTarget(baseState, state) {
  const hasExplicitTarget = TARGET_KEYS.some((key) => hasOwn(state, key));
  const requestedMode = TARGET_KEYS.includes(state?.mode) ? state.mode : "";
  if (state?.mode === "overview") return null;
  const source = hasExplicitTarget || requestedMode ? state : baseState;
  const candidates = Object.fromEntries(TARGET_KEYS.map((key) => [key, normalizedFacet(source?.[key], key)]));
  if (requestedMode) {
    return candidates[requestedMode] ? { key: requestedMode, value: candidates[requestedMode] } : null;
  }
  for (const key of TARGET_KEYS) {
    if (candidates[key]) return { key, value: candidates[key] };
  }
  return null;
}

/** Build a canonical atlas URL with a single navigation target and stable order. */
export function atlasUrlFor(base, state = {}) {
  const absolute = base instanceof URL || /^[a-z][a-z\d+.-]*:/i.test(String(base || ""));
  const url = toUrl(base);
  const baseState = parseAtlasUrl(url);
  const target = canonicalTarget(baseState, state);
  const params = new URLSearchParams();
  if (target) params.set(target.key, target.value);

  const query = normalizedText(stateValue(state, "q", baseState.q), { lower: true, maxLength: 160 });
  if (query) params.set("q", query);
  for (const key of FILTER_KEYS) {
    const value = normalizedFacet(stateValue(state, key, baseState[key]), key);
    if (value) params.set(key, value);
  }

  url.search = params.toString();
  url.hash = "";
  return absolute ? url.href : `${url.pathname}${url.search}`;
}

function samePath(url, path) {
  if (!path) return false;
  const current = toUrl(url);
  const expected = new URL(String(path), current);
  const normalize = (value) => value.length > 1 ? value.replace(/\/+$/, "") : value;
  return normalize(current.pathname) === normalize(expected.pathname);
}

/**
 * Parse one atlas page while treating a clean static cluster route as its
 * default cluster. Once history moves to the atlas root, the same document
 * correctly parses as the overview instead of reviving the static default.
 */
export function parseAtlasPageUrl(url, allowedFacets = {}, options = {}) {
  const parsed = parseAtlasUrl(url, allowedFacets);
  if (parsed.mode === "overview" && options.defaultCluster && samePath(url, options.defaultClusterPath)) {
    return { ...parsed, mode: "cluster", cluster: options.defaultCluster, focus: "", corridor: "" };
  }
  return parsed;
}

/**
 * Serialize atlas state across both the interactive root and pre-rendered
 * cluster pages. A static page's own default cluster keeps its clean path;
 * the overview always returns to the canonical atlas root.
 */
export function atlasPageUrlFor(base, state = {}, options = {}) {
  const current = toUrl(base);
  const onDefaultPath = options.defaultCluster && samePath(current, options.defaultClusterPath);
  const isDefaultCluster = onDefaultPath
    && state.mode === "cluster"
    && state.cluster === options.defaultCluster;
  const serialized = isDefaultCluster
    ? { ...state, mode: "overview", focus: "", cluster: "", corridor: "" }
    : state;
  const targetBase = state.mode === "overview" && options.rootPath
    ? new URL(String(options.rootPath), current)
    : current;
  return atlasUrlFor(targetBase, serialized);
}

/** Preserve semantic state on history entries so a back navigation can restore
 * a static cluster even when the currently loaded document is the atlas root. */
export function atlasHistoryEntry(state = {}) {
  const snapshot = { mode: state.mode || "overview", q: normalizedText(state.q, { lower: true, maxLength: 160 }) };
  for (const key of [...TARGET_KEYS, ...FILTER_KEYS]) snapshot[key] = normalizedText(stateValue(state, key), { lower: true });
  return { semanticAtlas: snapshot };
}

export function atlasStateFromHistory(entry, currentUrl, allowedFacets = {}, options = {}) {
  const snapshot = entry?.semanticAtlas;
  if (!snapshot || typeof snapshot !== "object") return parseAtlasPageUrl(currentUrl, allowedFacets, options);
  const canonical = atlasPageUrlFor(currentUrl, snapshot, options);
  return parseAtlasPageUrl(canonical, allowedFacets, options);
}

function stableId(value) {
  return normalizedText(value, { maxLength: 512 });
}

function nodeDegree(node) {
  const number = Number(node?.degree?.total ?? node?.degree ?? node?.score ?? node?.count ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function nodeTitle(node) {
  return String(node?.title || node?.label || node?.id || "");
}

function contextNote(edge) {
  return values(edge?.contexts).find((context) => normalizedText(context?.note, { maxLength: 2_000 }))?.note || "";
}

function relationScore(edge) {
  const curated = edge?.origin === "curated" ? 1 : 0;
  const note = contextNote(edge) ? 1 : 0;
  const relation = RELATION_PRIORITY[edge?.kind] || 0;
  const weight = Number(edge?.weight ?? edge?.count ?? 0);
  return note * 1_000_000 + curated * 100_000 + relation * 10_000 + (Number.isFinite(weight) ? weight : 0);
}

function edgeId(edge) {
  return stableId(edge?.id) || `${stableId(edge?.source)}\u0000${stableId(edge?.target)}\u0000${stableId(edge?.kind)}`;
}

function stableNodeCompare(left, right) {
  return nodeDegree(right) - nodeDegree(left)
    || nodeTitle(left).localeCompare(nodeTitle(right), "ko")
    || stableId(left?.id).localeCompare(stableId(right?.id), "ko");
}

function strongestIncidentScore(edges) {
  return edges.reduce((score, edge) => Math.max(score, relationScore(edge)), Number.NEGATIVE_INFINITY);
}

function rankedCandidateCompare(left, right) {
  return right.score - left.score || stableNodeCompare(left.node, right.node);
}

function uniqueNodes(nodes) {
  const sorted = values(nodes)
    .filter((node) => node && stableId(node.id))
    .sort((left, right) => stableId(left.id).localeCompare(stableId(right.id), "ko")
      || JSON.stringify(left).localeCompare(JSON.stringify(right), "ko"));
  return [...new Map(sorted.map((node) => [stableId(node.id), node])).values()];
}

function validEdges(edges, nodesById) {
  const sorted = values(edges)
    .filter((edge) => edge && nodesById.has(stableId(edge.source)) && nodesById.has(stableId(edge.target)))
    .sort((left, right) => edgeId(left).localeCompare(edgeId(right), "ko")
      || JSON.stringify(left).localeCompare(JSON.stringify(right), "ko"));
  return [...new Map(sorted.map((edge) => [edgeId(edge), edge])).values()];
}

function positiveLimit(value, fallback, { zero = false } = {}) {
  const number = Math.floor(Number(value));
  if (!Number.isFinite(number)) return fallback;
  return Math.max(zero ? 0 : 1, number);
}

/**
 * Select a bounded, deterministic ego graph. All direct neighbours are ranked
 * before any two-hop candidate, and the focus survives even when the current
 * facet result marks it as outside the filters.
 */
export function createDocumentFocusView(shard = {}, focusId, options = {}) {
  const maxNodes = positiveLimit(options.maxNodes, 80);
  const maxEdges = positiveLimit(options.maxEdges, 1_500, { zero: true });
  const nodes = uniqueNodes(shard.nodes);
  const nodesById = new Map(nodes.map((node) => [stableId(node.id), node]));
  const normalizedFocusId = stableId(focusId);
  const focus = nodesById.get(normalizedFocusId);
  if (!focus) {
    return {
      focusId: normalizedFocusId,
      focus: null,
      fixedNodeIds: [],
      nodes: [],
      edges: [],
      hops: {},
      stats: {
        missingFocus: true,
        focusOutsideFilters: false,
        oneHopCandidates: 0,
        twoHopCandidates: 0,
        visibleOneHop: 0,
        visibleTwoHop: 0,
        truncatedNodes: false,
        truncatedEdges: false
      }
    };
  }

  const edges = validEdges(shard.edges, nodesById);
  const adjacency = new Map(nodes.map((node) => [stableId(node.id), []]));
  for (const edge of edges) {
    adjacency.get(stableId(edge.source)).push(edge);
    if (edge.target !== edge.source) adjacency.get(stableId(edge.target)).push(edge);
  }

  const directIds = new Set();
  for (const edge of adjacency.get(normalizedFocusId) || []) {
    const neighborId = stableId(edge.source) === normalizedFocusId ? stableId(edge.target) : stableId(edge.source);
    if (neighborId && neighborId !== normalizedFocusId) directIds.add(neighborId);
  }
  const direct = [...directIds].map((id) => ({
    node: nodesById.get(id),
    score: strongestIncidentScore((adjacency.get(normalizedFocusId) || []).filter((edge) => stableId(edge.source) === id || stableId(edge.target) === id))
  })).sort(rankedCandidateCompare);

  const selectedDirect = direct.slice(0, Math.max(0, maxNodes - 1));
  const selectedIds = new Set([normalizedFocusId, ...selectedDirect.map(({ node }) => stableId(node.id))]);
  const secondHopIds = new Set();
  for (const { node } of selectedDirect) {
    for (const edge of adjacency.get(stableId(node.id)) || []) {
      const candidateId = stableId(edge.source) === stableId(node.id) ? stableId(edge.target) : stableId(edge.source);
      if (candidateId && !directIds.has(candidateId) && candidateId !== normalizedFocusId) secondHopIds.add(candidateId);
    }
  }
  const secondHop = [...secondHopIds].map((id) => ({
    node: nodesById.get(id),
    score: strongestIncidentScore((adjacency.get(id) || []).filter((edge) => selectedIds.has(stableId(edge.source)) || selectedIds.has(stableId(edge.target))))
  })).sort(rankedCandidateCompare);
  const remaining = Math.max(0, maxNodes - selectedIds.size);
  const selectedSecondHop = secondHop.slice(0, remaining);
  for (const { node } of selectedSecondHop) selectedIds.add(stableId(node.id));

  const visibleNodes = [focus, ...selectedDirect.map(({ node }) => node), ...selectedSecondHop.map(({ node }) => node)];
  const hops = Object.fromEntries([
    [normalizedFocusId, 0],
    ...selectedDirect.map(({ node }) => [stableId(node.id), 1]),
    ...selectedSecondHop.map(({ node }) => [stableId(node.id), 2])
  ]);
  const candidateEdges = edges.filter((edge) => selectedIds.has(stableId(edge.source)) && selectedIds.has(stableId(edge.target)));
  candidateEdges.sort((left, right) => {
    const leftFocus = stableId(left.source) === normalizedFocusId || stableId(left.target) === normalizedFocusId ? 1 : 0;
    const rightFocus = stableId(right.source) === normalizedFocusId || stableId(right.target) === normalizedFocusId ? 1 : 0;
    const leftHop = Math.max(hops[stableId(left.source)] ?? 9, hops[stableId(left.target)] ?? 9);
    const rightHop = Math.max(hops[stableId(right.source)] ?? 9, hops[stableId(right.target)] ?? 9);
    return rightFocus - leftFocus || leftHop - rightHop || relationScore(right) - relationScore(left)
      || edgeId(left).localeCompare(edgeId(right), "ko");
  });
  const visibleEdges = candidateEdges.slice(0, maxEdges);
  const matchingIds = Array.isArray(shard.matchingNodeIds) ? new Set(shard.matchingNodeIds.map(stableId)) : null;
  const focusOutsideFilters = focus.matchesFilters === false || focus.filterMatch === false || focus.outsideFilters === true
    || Boolean(matchingIds && !matchingIds.has(normalizedFocusId));

  return {
    focusId: normalizedFocusId,
    focus,
    fixedNodeIds: [normalizedFocusId],
    nodes: visibleNodes,
    edges: visibleEdges,
    hops,
    stats: {
      missingFocus: false,
      focusOutsideFilters,
      oneHopCandidates: direct.length,
      twoHopCandidates: secondHop.length,
      visibleOneHop: selectedDirect.length,
      visibleTwoHop: selectedSecondHop.length,
      truncatedNodes: 1 + direct.length + secondHop.length > visibleNodes.length,
      truncatedEdges: candidateEdges.length > visibleEdges.length
    }
  };
}

function lookupRecord(collection, id) {
  if (collection instanceof Map) return collection.get(id);
  if (Array.isArray(collection)) return collection.find((item) => item?.id === id);
  return collection?.[id];
}

function edgeContexts(edge) {
  if (Array.isArray(edge?.contexts)) return edge.contexts.filter(Boolean);
  return edge?.context ? [edge.context] : [];
}

/** Describe an edge in its stored source-to-target direction. */
export function describeAtlasEdge(edge = {}, nodesById = {}, legend = {}) {
  const source = lookupRecord(nodesById, edge.source);
  const target = lookupRecord(nodesById, edge.target);
  const sourceTitle = source?.title || source?.label || edge.source || "알 수 없는 문서";
  const targetTitle = target?.title || target?.label || edge.target || "알 수 없는 문서";
  const relationLegend = lookupRecord(legend?.relations || legend, edge.kind) || {};
  const label = relationLegend.label || edge.label || edge.kind || "관계";
  const statement = edge.directed === false
    ? `“${sourceTitle}”와 “${targetTitle}” 사이에 ${label} 관계가 기록되어 있습니다.`
    : `“${sourceTitle}”에서 “${targetTitle}”로 이어집니다. 관계: ${label}.`;
  const contexts = edgeContexts(edge);
  const noteContext = contexts.find((context) => normalizedText(context?.note, { maxLength: 2_000 }));
  let context = noteContext || contexts[0] || null;
  let detail = "두 문서 사이에 직접 기록된 관계입니다.";
  if (noteContext) {
    detail = normalizedText(noteContext.note, { maxLength: 2_000 });
  } else if (edge.kind === "supports") {
    detail = `“${targetTitle}”의 sources에 “${sourceTitle}”가 근거로 등록되어 있습니다.`;
  } else if (edge.kind === "path_next") {
    context = contexts.find((item) => item?.pathTitle || item?.pathId || item?.step !== undefined) || context;
    detail = `‘${context?.pathTitle || context?.pathId || "학습 경로"}’의 ${context?.step ?? "현재"}단계에서 다음 단계로 이어집니다.`;
  } else if (edge.kind === "related") {
    detail = edge.reciprocal
      ? "두 문서의 관련 항목에 서로 등록된 양방향 연결입니다."
      : "한 문서의 관련 항목에서 함께 읽을 대상으로 연결했습니다.";
  } else if (edge.kind === "mentions") {
    context = contexts.find((item) => item?.pageId || item?.section || item?.excerpt) || context;
    const owner = lookupRecord(nodesById, context?.pageId);
    detail = `“${owner?.title || owner?.label || context?.pageId || sourceTitle}”의 ‘${context?.section || "본문"}’에서 언급됩니다.`;
    if (context?.excerpt) detail += ` 문맥: ${normalizedText(context.excerpt, { maxLength: 500 })}`;
  }
  return { kind: edge.kind || "", label, sourceTitle, targetTitle, statement, detail, context };
}

function versionValue(record, names) {
  for (const name of names) {
    const value = record?.[name];
    if (value !== undefined && value !== null && String(value).trim()) return String(value).trim();
  }
  return "";
}

/** Ensure a lazily loaded atlas shard belongs to the active manifest. */
export function normalizeAtlasPayloadVersion(manifest = {}, payload = {}) {
  const expectedSchema = versionValue(manifest, ["schemaVersion", "schema_version"]);
  const actualSchema = versionValue(payload, ["schemaVersion", "schema_version"]);
  const expectedContent = versionValue(manifest, ["contentVersion", "content_version", "version"]);
  const actualContent = versionValue(payload, ["contentVersion", "content_version", "manifestVersion", "version"]);
  if (!expectedSchema && !expectedContent) throw new Error("Atlas manifest does not declare a version");
  if (expectedSchema && actualSchema !== expectedSchema) {
    throw new Error(`Atlas payload schema version mismatch: expected '${expectedSchema}', received '${actualSchema || "missing"}'`);
  }
  if (expectedContent && actualContent !== expectedContent) {
    throw new Error(`Atlas payload content version mismatch: expected '${expectedContent}', received '${actualContent || "missing"}'`);
  }
  return { schemaVersion: expectedSchema || actualSchema, contentVersion: expectedContent || actualContent };
}

/** A dependency-free least-recently-used cache for fetched atlas shards. */
export function createLruCache(maxEntries = 8) {
  const limit = positiveLimit(maxEntries, 8);
  const entries = new Map();
  const api = {
    maxEntries: limit,
    get size() { return entries.size; },
    has(key) { return entries.has(key); },
    peek(key) { return entries.get(key); },
    get(key) {
      if (!entries.has(key)) return undefined;
      const value = entries.get(key);
      entries.delete(key);
      entries.set(key, value);
      return value;
    },
    set(key, value) {
      if (entries.has(key)) entries.delete(key);
      entries.set(key, value);
      if (entries.size > limit) entries.delete(entries.keys().next().value);
      return api;
    },
    delete(key) { return entries.delete(key); },
    clear() { entries.clear(); },
    keys() { return [...entries.keys()]; }
  };
  return api;
}
