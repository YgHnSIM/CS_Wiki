const TARGET_KEYS = Object.freeze(["transition", "event", "part", "era"]);
const FILTER_KEYS = Object.freeze(["layer", "capability", "display"]);
const DEFAULT_DISPLAY = "all";

export const HISTORY_LANE_ORDER = Object.freeze([
  "theory",
  "machine",
  "architecture",
  "software",
  "system",
  "service",
  "measurement"
]);

export const HISTORY_DISPLAY_VALUES = Object.freeze(["all", "events", "transitions"]);

const FACET_ALIASES = Object.freeze({
  transition: ["transition", "transitions", "transitionIds", "transition_ids", "transitionShards"],
  event: ["event", "events", "eventIds", "event_ids", "eventShards", "focusShards"],
  part: ["part", "parts", "partIds", "part_ids", "partShards"],
  era: ["era", "eras", "eraIds", "era_ids", "periods", "eraShards"],
  layer: ["layer", "layers", "historical", "historicalLayers", "historical_layers"],
  capability: ["capability", "capabilities", "capabilityLayers", "capability_layers"],
  display: ["display", "displays", "displayModes", "display_modes"]
});

const ASSET_COLLECTIONS = Object.freeze({
  era: ["eras", "periods"],
  part: ["parts"],
  event: ["events"],
  transition: ["transitions"]
});

const ASSET_MAPPINGS = Object.freeze({
  era: ["eraShards", "era_shards"],
  part: ["partShards", "part_shards"],
  event: ["eventShards", "event_shards", "focusShards", "focus_shards"],
  transition: ["transitionShards", "transition_shards"]
});

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value || {}, key);
const koreanCollator = new Intl.Collator("ko", { numeric: true, sensitivity: "base" });

function values(value) {
  if (value instanceof Set) return [...value];
  return Array.isArray(value) ? value : value === undefined || value === null ? [] : [value];
}

function normalizedText(value, { lower = false, maxLength = 256 } = {}) {
  const text = String(value ?? "")
    .normalize("NFKC")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
  return lower ? text.toLocaleLowerCase("ko-KR") : text;
}

function facetToken(value) {
  if (value && typeof value === "object") {
    for (const key of ["id", "value", "slug", "key"]) {
      if (value[key] !== undefined && value[key] !== null) return value[key];
    }
    return "";
  }
  return value;
}

function facetSource(allowedFacets, key) {
  if (!allowedFacets || typeof allowedFacets !== "object") return undefined;
  const containers = [allowedFacets, allowedFacets.facets, allowedFacets.manifest?.facets].filter(Boolean);
  for (const container of containers) {
    for (const alias of FACET_ALIASES[key]) {
      if (hasOwn(container, alias)) return container[alias];
    }
  }
  return undefined;
}

function allowedValues(allowedFacets, key) {
  const source = facetSource(allowedFacets, key);
  if (source === undefined) {
    return key === "display" ? new Set(HISTORY_DISPLAY_VALUES) : null;
  }
  const records = source && typeof source === "object" && !Array.isArray(source) && !(source instanceof Set)
    ? Object.keys(source)
    : values(source).map(facetToken);
  return new Set(records.map((value) => normalizedText(value, { lower: true })).filter(Boolean));
}

function normalizedFacet(value, key, allowedFacets) {
  const normalized = normalizedText(value, { lower: true });
  if (!normalized) return "";
  if (["transition", "part", "era"].includes(key) && !/^[a-z0-9]+(?:[._-]+[a-z0-9]+)*$/.test(normalized)) return "";
  if (key === "event" && (!/^[\p{L}\p{N}]+(?:[._-]+[\p{L}\p{N}]+)*$/u.test(normalized) || /[/?#&]/.test(normalized))) return "";
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
  return new URL(String(value || "/"), "https://history.local");
}

/**
 * Parse one shareable history-map URL. Conflicting targets are normalized to
 * exactly one state using transition > event > part > era precedence.
 */
export function parseHistoryUrl(url, allowedFacets = {}) {
  const parsed = toUrl(url);
  const requested = Object.fromEntries(TARGET_KEYS.map((key) => [
    key,
    firstValidParameter(parsed.searchParams, key, allowedFacets)
  ]));
  const mode = TARGET_KEYS.find((key) => requested[key]) || "overview";
  const state = { mode };
  for (const key of [...TARGET_KEYS].reverse()) state[key] = mode === key ? requested[key] : "";
  state.q = normalizedText(parsed.searchParams.get("q"), { lower: true, maxLength: 160 });
  state.layer = firstValidParameter(parsed.searchParams, "layer", allowedFacets);
  state.capability = firstValidParameter(parsed.searchParams, "capability", allowedFacets);
  state.display = firstValidParameter(parsed.searchParams, "display", allowedFacets) || DEFAULT_DISPLAY;
  return state;
}

function stateValue(state, key, fallback = "") {
  if (hasOwn(state, key)) return state[key];
  if (hasOwn(state?.filters, key)) return state.filters[key];
  return fallback;
}

function canonicalTarget(baseState, state) {
  if (state?.mode === "overview") return null;
  const requestedMode = TARGET_KEYS.includes(state?.mode) ? state.mode : "";
  const hasExplicitTarget = TARGET_KEYS.some((key) => hasOwn(state, key));
  const source = requestedMode || hasExplicitTarget ? state : baseState;
  const candidates = Object.fromEntries(TARGET_KEYS.map((key) => [
    key,
    normalizedFacet(source?.[key], key)
  ]));
  if (requestedMode) return candidates[requestedMode] ? { key: requestedMode, value: candidates[requestedMode] } : null;
  for (const key of TARGET_KEYS) {
    if (candidates[key]) return { key, value: candidates[key] };
  }
  return null;
}

/** Serialize history state in a stable parameter order and discard unknown parameters. */
export function historyUrlFor(base, state = {}) {
  const absolute = base instanceof URL || /^[a-z][a-z\d+.-]*:/i.test(String(base || ""));
  const url = toUrl(base);
  const baseState = parseHistoryUrl(url);
  const target = canonicalTarget(baseState, state);
  const params = new URLSearchParams();
  if (target) params.set(target.key, target.value);

  const query = normalizedText(stateValue(state, "q", baseState.q), { lower: true, maxLength: 160 });
  if (query) params.set("q", query);
  for (const key of ["layer", "capability"]) {
    const value = normalizedFacet(stateValue(state, key, baseState[key]), key);
    if (value) params.set(key, value);
  }
  const display = normalizedFacet(stateValue(state, "display", baseState.display), "display");
  if (display && display !== DEFAULT_DISPLAY) params.set("display", display);

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

/** Apply a pre-rendered era route only while the browser is on that route. */
export function parseHistoryPageUrl(url, allowedFacets = {}, options = {}) {
  const parsed = parseHistoryUrl(url, allowedFacets);
  if (parsed.mode === "overview" && options.defaultPart && samePath(url, options.defaultPartPath || options.defaultEraPath)) {
    return {
      ...parsed,
      mode: "part",
      part: normalizedFacet(options.defaultPart, "part", allowedFacets) || normalizedText(options.defaultPart, { lower: true })
    };
  }
  if (parsed.mode === "overview" && options.defaultEra && samePath(url, options.defaultEraPath)) {
    return { ...parsed, mode: "era", era: normalizedFacet(options.defaultEra, "era", allowedFacets) || normalizedText(options.defaultEra, { lower: true }) };
  }
  return parsed;
}

/**
 * Keep a static era's own clean path, while an overview navigation always
 * leaves that document for the canonical root. This prevents a reload or back
 * navigation at the root from reviving the static page's default era.
 */
export function historyPageUrlFor(base, state = {}, options = {}) {
  const current = toUrl(base);
  const onDefaultPath = options.defaultEra && samePath(current, options.defaultEraPath);
  const onDefaultPartPath = options.defaultPart && samePath(current, options.defaultPartPath || options.defaultEraPath);
  const isDefaultPart = onDefaultPartPath && state.mode === "part"
    && normalizedText(state.part, { lower: true }) === normalizedText(options.defaultPart, { lower: true });
  const isDefaultEra = onDefaultPath && state.mode === "era"
    && normalizedText(state.era, { lower: true }) === normalizedText(options.defaultEra, { lower: true });
  const serialized = isDefaultEra || isDefaultPart
    ? { ...state, mode: "overview", transition: "", event: "", part: "", era: "" }
    : state;
  const targetBase = state.mode === "overview" && options.rootPath
    ? new URL(String(options.rootPath), current)
    : current;
  return historyUrlFor(targetBase, serialized);
}

/** Store normalized history state rather than relying on a document's static default. */
export function historyHistoryEntry(state = {}) {
  const snapshot = {
    mode: TARGET_KEYS.includes(state.mode) || state.mode === "overview" ? state.mode : "overview",
    q: normalizedText(state.q, { lower: true, maxLength: 160 })
  };
  for (const key of TARGET_KEYS) snapshot[key] = normalizedText(stateValue(state, key), { lower: true });
  snapshot.layer = normalizedText(stateValue(state, "layer"), { lower: true });
  snapshot.capability = normalizedText(stateValue(state, "capability"), { lower: true });
  snapshot.display = normalizedFacet(stateValue(state, "display", DEFAULT_DISPLAY), "display") || DEFAULT_DISPLAY;
  return { historyMap: snapshot };
}

export const historyMapHistoryEntry = historyHistoryEntry;

export function historyStateFromHistory(entry, currentUrl, allowedFacets = {}, options = {}) {
  const snapshot = entry?.historyMap;
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    return parseHistoryPageUrl(currentUrl, allowedFacets, options);
  }
  const canonical = historyPageUrlFor(currentUrl, snapshot, options);
  return parseHistoryPageUrl(canonical, allowedFacets, options);
}

function collectionRecord(collection, id) {
  const normalizedId = normalizedText(id, { lower: true, maxLength: 512 });
  if (!normalizedId) return null;
  if (collection instanceof Map) {
    for (const [key, value] of collection) {
      if (normalizedText(key, { lower: true, maxLength: 512 }) === normalizedId) return value;
    }
    return null;
  }
  if (Array.isArray(collection)) {
    return collection.find((record) => normalizedText(facetToken(record), { lower: true, maxLength: 512 }) === normalizedId) || null;
  }
  if (collection && typeof collection === "object") {
    const exact = collection[id];
    if (exact !== undefined) return exact;
    const key = Object.keys(collection).find((candidate) => normalizedText(candidate, { lower: true, maxLength: 512 }) === normalizedId);
    return key === undefined ? null : collection[key];
  }
  return null;
}

function assetValue(record) {
  if (typeof record === "string") return record;
  if (!record || typeof record !== "object") return "";
  for (const key of ["url", "shard", "path", "asset"]) {
    if (typeof record[key] === "string") return record[key];
    if (record[key] && typeof record[key] === "object") {
      const nested = assetValue(record[key]);
      if (nested) return nested;
    }
  }
  for (const key of ["focus", "payload", "data"]) {
    const nested = assetValue(record[key]);
    if (nested) return nested;
  }
  return "";
}

function nestedPartRecord(manifest, id) {
  for (const era of values(manifest?.eras || manifest?.periods)) {
    const record = collectionRecord(era?.parts, id);
    if (record) return record;
  }
  return null;
}

function safeAssetPath(value) {
  const raw = normalizedText(value, { maxLength: 2_048 });
  if (!raw || raw.includes("\\") || raw.startsWith("//") || /^[a-z][a-z\d+.-]*:/i.test(raw)) return "";
  let parsed;
  try {
    parsed = new URL(raw, "https://history.local/data/history/");
  } catch {
    return "";
  }
  if (parsed.origin !== "https://history.local" || parsed.hash) return "";
  const rawPath = raw.split(/[?#]/, 1)[0];
  for (const rawSegment of rawPath.split("/")) {
    let segment = rawSegment;
    for (let pass = 0; pass < 3; pass += 1) {
      let decoded;
      try {
        decoded = decodeURIComponent(segment);
      } catch {
        return "";
      }
      if (decoded === segment) break;
      segment = decoded;
    }
    if (segment === "." || segment === ".." || segment.includes("/") || segment.includes("\\")
      || /[\u0000-\u001f\u007f]/.test(segment)) return "";
  }
  return raw;
}

function safeAssetId(value) {
  const id = normalizedText(value, { lower: true, maxLength: 512 });
  return /^[a-z0-9]+(?:[._-]+[a-z0-9]+)*$/.test(id) ? id : "";
}

function safeRecordId(value, kind) {
  const id = normalizedText(value, { lower: true, maxLength: 512 });
  if (kind === "event") {
    return /^[\p{L}\p{N}]+(?:[._-]+[\p{L}\p{N}]+)*$/u.test(id) && !/[/?#&]/.test(id) ? id : "";
  }
  return safeAssetId(id);
}

export function historyLookupHash(value) {
  const id = normalizedText(value, { lower: true, maxLength: 512 });
  if (!id) return null;
  let hash = 2_166_136_261;
  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

function historyLookupDescriptor(manifest = {}) {
  const descriptor = manifest.lookup;
  if (!descriptor || typeof descriptor !== "object" || descriptor.kind !== "sharded"
    || descriptor.hash !== "fnv1a32-utf16") return null;
  const bucketCount = Number(descriptor.bucketCount);
  const bucketWidth = Number(descriptor.bucketWidth);
  const route = normalizedText(descriptor.route, { maxLength: 2_048 });
  if (!Number.isInteger(bucketCount) || bucketCount < 1 || bucketCount > 1_048_576
    || (bucketCount & (bucketCount - 1)) !== 0
    || !Number.isInteger(bucketWidth) || bucketWidth < 1 || bucketWidth > 8
    || !route || !route.includes("{bucket}")) return null;
  return { bucketCount, bucketWidth, route };
}

export function historyLookupBucket(value, bucketCount) {
  const hash = historyLookupHash(value);
  const count = Number(bucketCount);
  if (hash === null || !Number.isInteger(count) || count < 1 || count > 1_048_576
    || (count & (count - 1)) !== 0) return null;
  return hash & (count - 1);
}

function historyLookupBucketAsset(descriptor, bucket) {
  if (!descriptor || !Number.isInteger(bucket) || bucket < 0 || bucket >= descriptor.bucketCount) return "";
  const key = String(bucket).padStart(descriptor.bucketWidth, "0");
  return safeAssetPath(descriptor.route.replaceAll("{bucket}", key));
}

/** Resolve one deterministic lookup shard for a stable event or transition id. */
export function historyLookupShardAsset(manifest = {}, id = "") {
  if (!safeRecordId(id, "event")) return "";
  const descriptor = historyLookupDescriptor(manifest);
  const bucket = historyLookupBucket(id, descriptor?.bucketCount);
  return historyLookupBucketAsset(descriptor, bucket);
}

/** List every bounded shard needed for a full-text search, with legacy fallback. */
export function historyLookupShardAssets(manifest = {}) {
  const descriptor = historyLookupDescriptor(manifest);
  if (!descriptor) {
    const legacy = historyManifestAsset(manifest, "lookup");
    return legacy ? [legacy] : [];
  }
  return Array.from({ length: descriptor.bucketCount }, (_, bucket) => historyLookupBucketAsset(descriptor, bucket));
}

/** Resolve every bounded detail page for one paginated historical transition. */
export function historyTransitionDetailAssets(manifest = {}, transition = {}) {
  const id = safeRecordId(transition?.id, "transition");
  const detail = transition?.detail;
  const global = manifest?.transitionDetails;
  if (!id || !detail || detail.kind !== "paginated" || global?.kind !== "paginated") return [];
  const pageCount = Number(detail.pageCount);
  const pageWidth = Number(detail.pageWidth ?? global.pageWidth);
  if (!Number.isSafeInteger(pageCount) || pageCount < 1 || pageCount > 100_000
    || !Number.isSafeInteger(pageWidth) || pageWidth < 1 || pageWidth > 8) return [];
  const route = normalizedText(detail.route || global.route, { maxLength: 2_048 });
  if (!route || !route.includes("{page}")) return [];
  return Array.from({ length: pageCount }, (_, index) => {
    const page = String(index + 1).padStart(pageWidth, "0");
    return safeAssetPath(route
      .replaceAll("{transition}", encodeURIComponent(id))
      .replaceAll("{page}", page));
  }).filter(Boolean);
}

function routeAsset(manifest, kind, id) {
  const route = assetValue(manifest?.routes?.[kind]);
  if (!route) return "";
  if (!id && /\{[^}]+\}/.test(route)) return "";
  const safeId = id ? safeRecordId(id, kind) : "";
  if (id && !safeId) return "";
  const expanded = route.replace(/\{(?:id|era|part|event|transition|shard)\}/g, encodeURIComponent(safeId));
  return /\{[^}]+\}/.test(expanded) ? "" : expanded;
}

/** Resolve one same-origin lazy asset without accepting traversal or external URLs. */
export function historyManifestAsset(manifest = {}, kind, id = "") {
  const assetKind = normalizedText(kind, { lower: true, maxLength: 40 });
  if (!["overview", "lookup", ...TARGET_KEYS].includes(assetKind)) return "";
  let candidate = "";
  if (assetKind === "overview" || assetKind === "lookup") {
    candidate = assetValue(manifest[assetKind]) || routeAsset(manifest, assetKind, "");
  } else {
    const safeId = safeRecordId(id, assetKind);
    if (!safeId) return "";
    for (const name of ASSET_MAPPINGS[assetKind] || []) {
      candidate = assetValue(collectionRecord(manifest[name], safeId));
      if (candidate) break;
    }
    if (!candidate) {
      for (const name of ASSET_COLLECTIONS[assetKind] || []) {
        candidate = assetValue(collectionRecord(manifest[name], safeId));
        if (candidate) break;
      }
    }
    if (!candidate && assetKind === "part") candidate = assetValue(nestedPartRecord(manifest, safeId));
    if (!candidate) candidate = routeAsset(manifest, assetKind, safeId);
  }
  return safeAssetPath(candidate);
}

function versionValue(record, names) {
  for (const name of names) {
    const value = record?.[name];
    if (value !== undefined && value !== null && String(value).trim()) return String(value).trim();
  }
  return "";
}

/** Ensure a lazy history shard belongs to the active manifest. */
export function normalizeHistoryPayloadVersion(manifest = {}, payload = {}) {
  const expectedSchema = versionValue(manifest, ["schemaVersion", "schema_version"]);
  const actualSchema = versionValue(payload, ["schemaVersion", "schema_version"]);
  const expectedContent = versionValue(manifest, ["contentVersion", "content_version", "version"]);
  const actualContent = versionValue(payload, ["contentVersion", "content_version", "manifestVersion", "version"]);
  if (!expectedSchema && !expectedContent) throw new Error("History manifest does not declare a version");
  if (expectedSchema && actualSchema !== expectedSchema) {
    throw new Error(`History payload schema version mismatch: expected '${expectedSchema}', received '${actualSchema || "missing"}'`);
  }
  if (expectedContent && actualContent !== expectedContent) {
    throw new Error(`History payload content version mismatch: expected '${expectedContent}', received '${actualContent || "missing"}'`);
  }
  return { schemaVersion: expectedSchema || actualSchema, contentVersion: expectedContent || actualContent };
}

function positiveLimit(value, fallback) {
  const number = Math.floor(Number(value));
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

/** Dependency-free least-recently-used cache for history shards. */
export function createHistoryLruCache(maxEntries = 5) {
  const limit = positiveLimit(maxEntries, 5);
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

export function normalizeHistoryQuery(value = "") {
  return normalizedText(value, { lower: true, maxLength: 160 });
}

function recordLayer(record) {
  return normalizedText(record?.historicalLayer ?? record?.historical?.layer ?? record?.lane ?? record?.layer, { lower: true });
}

function recordCapabilities(record) {
  const facets = record?.facets || {};
  return [...values(record?.capabilityLayers), ...values(record?.capabilities), ...values(facets.capabilityLayers)]
    .map((value) => normalizedText(value, { lower: true }))
    .filter(Boolean);
}

function isTransition(record) {
  return record?.kind === "transition" || record?.type === "transition"
    || Boolean(record?.transitionId || record?.problemId && record?.responseId || record?.roleNodeIds && record?.edges);
}

export function matchesHistoryFilters(record, filters = {}) {
  const layer = normalizedText(filters.layer ?? filters.historical, { lower: true });
  const capability = normalizedText(filters.capability, { lower: true });
  const display = normalizedFacet(filters.display || DEFAULT_DISPLAY, "display") || DEFAULT_DISPLAY;
  const recordLayers = [recordLayer(record), ...values(record?.lanes).map((value) => normalizedText(value, { lower: true }))].filter(Boolean);
  if (layer && !recordLayers.includes(layer)) return false;
  if (capability && !recordCapabilities(record).includes(capability)) return false;
  if (display === "events" && isTransition(record)) return false;
  if (display === "transitions" && !isTransition(record)) return false;
  return true;
}

const CHOSEONG = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";

function koreanInitials(value) {
  let result = "";
  for (const character of normalizeHistoryQuery(value)) {
    const code = character.codePointAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) result += CHOSEONG[Math.floor((code - 0xac00) / 588)];
    else if (code >= 0x1100 && code <= 0x1112) result += CHOSEONG[code - 0x1100];
    else if (/[a-z0-9ㄱ-ㅎ\s]/u.test(character)) result += character;
  }
  return result.replace(/\s+/g, " ").trim();
}

function recordNames(record) {
  return [record?.title, record?.label, ...values(record?.aliases)]
    .map(normalizeHistoryQuery)
    .filter(Boolean);
}

function recordSearchText(record) {
  return normalizeHistoryQuery([
    ...recordNames(record),
    record?.summary,
    record?.id,
    record?.problemTitle,
    record?.responseTitle,
    record?.capabilityTitle,
    record?.eraTitle,
    recordLayer(record),
    ...recordCapabilities(record),
    historyAnchorYear(record)
  ].filter((value) => value !== undefined && value !== null && value !== "").join(" "));
}

function searchScore(record, term, tokens) {
  const names = recordNames(record);
  const haystack = recordSearchText(record);
  if (!tokens.every((token) => haystack.includes(token))) {
    const initials = koreanInitials(haystack);
    const initialTokens = tokens.map(koreanInitials);
    if (!initialTokens.every((token) => token && initials.includes(token))) return 0;
  }
  if (names.some((name) => name === term)) return 900;
  if (names.some((name) => name.startsWith(term))) return 800;
  if (names.some((name) => name.includes(term))) return 700;
  const initials = names.map(koreanInitials);
  const queryInitials = koreanInitials(term);
  if (queryInitials && initials.some((name) => name === queryInitials)) return 650;
  if (queryInitials && initials.some((name) => name.startsWith(queryInitials))) return 600;
  if (tokens.every((token) => names.some((name) => name.includes(token)))) return 500;
  return 300;
}

/** Korean-aware, deterministic lookup search with conjunctive token matching. */
export function searchHistoryEvents(records = [], query = "", filters = {}, limit = 12) {
  const term = normalizeHistoryQuery(query);
  if (!term) return [];
  const tokens = term.split(" ").filter(Boolean);
  return values(records)
    .filter((record) => record && matchesHistoryFilters(record, filters))
    .map((record) => ({ record, score: searchScore(record, term, tokens) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || compareHistoryEvents(left.record, right.record))
    .slice(0, positiveLimit(limit, 12))
    .map(({ record }) => record);
}

function numericYear(value) {
  if (value === undefined || value === null || value === "") return null;
  const year = Number(value);
  return Number.isFinite(year) ? year : null;
}

export function historyAnchorYear(record = {}) {
  for (const value of [
    record.anchorYear,
    record.time?.anchorYear,
    record.eventStart,
    record.event_start,
    record.time?.eventStart,
    record.historical?.eventStart,
    record.historical?.event_start,
    record.publicationYear,
    record.publication_year,
    record.time?.publicationYear,
    record.historical?.publicationYear,
    record.historical?.publication_year,
    record.year,
    record.start
  ]) {
    const year = numericYear(value);
    if (year !== null) return year;
  }
  return null;
}

function historyEndYear(record = {}) {
  for (const value of [record.eventEnd, record.event_end, record.time?.eventEnd, record.historical?.eventEnd, record.historical?.event_end, record.end]) {
    const year = numericYear(value);
    if (year !== null) return year;
  }
  return historyAnchorYear(record);
}

function eventId(record) {
  return normalizedText(record?.id ?? record?.eventId ?? record?.graphId, { lower: true, maxLength: 512 });
}

function eventTitle(record) {
  return normalizedText(record?.title ?? record?.label ?? eventId(record), { maxLength: 512 });
}

function laneRank(record, laneOrder = HISTORY_LANE_ORDER) {
  const lane = recordLayer(record);
  const index = laneOrder.indexOf(lane);
  return index < 0 ? laneOrder.length : index;
}

function compareHistoryEvents(left, right, laneOrder = HISTORY_LANE_ORDER) {
  const leftYear = historyAnchorYear(left);
  const rightYear = historyAnchorYear(right);
  if (leftYear === null && rightYear !== null) return 1;
  if (leftYear !== null && rightYear === null) return -1;
  return (leftYear ?? 0) - (rightYear ?? 0)
    || historyEndYear(left) - historyEndYear(right)
    || laneRank(left, laneOrder) - laneRank(right, laneOrder)
    || koreanCollator.compare(eventTitle(left), eventTitle(right))
    || koreanCollator.compare(eventId(left), eventId(right));
}

/** Return a stable chronological copy; input order never breaks ties. */
export function sortHistoryEvents(records = [], laneOrder = HISTORY_LANE_ORDER) {
  return values(records).filter((record) => record && eventId(record)).sort((left, right) => compareHistoryEvents(left, right, laneOrder));
}

function populatedLaneOrder(records, laneOrder) {
  const lanes = new Set(records.map(recordLayer).filter(Boolean));
  const configured = values(laneOrder).map((lane) => normalizedText(lane, { lower: true })).filter(Boolean);
  const unknown = [...lanes].filter((lane) => !configured.includes(lane)).sort(koreanCollator.compare);
  return [...configured, ...unknown].filter((lane) => lanes.has(lane));
}

function closestByYear(records, currentYear, laneOrder) {
  return [...records].sort((left, right) => {
    const leftYear = historyAnchorYear(left);
    const rightYear = historyAnchorYear(right);
    const leftDistance = currentYear === null || leftYear === null ? Number.POSITIVE_INFINITY : Math.abs(leftYear - currentYear);
    const rightDistance = currentYear === null || rightYear === null ? Number.POSITIVE_INFINITY : Math.abs(rightYear - currentYear);
    return leftDistance - rightDistance || compareHistoryEvents(left, right, laneOrder);
  })[0] || null;
}

/**
 * Resolve timeline keyboard movement. Left/right stay in the same lane;
 * up/down use the closest year in the next populated lane; Home/End span the
 * active era. Movement clamps at boundaries and returns the current id.
 */
export function historyKeyboardTarget(records = [], currentId, key, options = {}) {
  const laneOrder = values(options.laneOrder).length ? values(options.laneOrder) : HISTORY_LANE_ORDER;
  const sorted = sortHistoryEvents(records, laneOrder);
  const normalizedId = normalizedText(currentId, { maxLength: 512 });
  const current = sorted.find((record) => eventId(record) === normalizedId);
  if (!current || !sorted.length) return "";
  if (key === "Home") return eventId(sorted[0]);
  if (key === "End") return eventId(sorted.at(-1));

  const currentLane = recordLayer(current);
  if (key === "ArrowLeft" || key === "ArrowRight") {
    const laneRecords = sorted.filter((record) => recordLayer(record) === currentLane);
    const index = laneRecords.findIndex((record) => eventId(record) === normalizedId);
    const offset = key === "ArrowLeft" ? -1 : 1;
    return eventId(laneRecords[Math.max(0, Math.min(laneRecords.length - 1, index + offset))]);
  }
  if (key === "ArrowUp" || key === "ArrowDown") {
    const lanes = populatedLaneOrder(sorted, laneOrder);
    const laneIndex = lanes.indexOf(currentLane);
    if (laneIndex < 0) return normalizedId;
    const offset = key === "ArrowUp" ? -1 : 1;
    const targetLane = lanes[laneIndex + offset];
    if (!targetLane) return normalizedId;
    return eventId(closestByYear(
      sorted.filter((record) => recordLayer(record) === targetLane),
      historyAnchorYear(current),
      laneOrder
    )) || normalizedId;
  }
  return normalizedId;
}
