const SYNTHETIC_ORIGIN = "https://evidence.local";
const DEFAULT_ASSET_ROOT = "/data/evidence/";
const DEFAULT_CACHE_ENTRIES = 8;

export const EVIDENCE_MAX_BUCKETS = 1_048_576;
export const EVIDENCE_PREFIX_LEVELS = Object.freeze([2, 3, 4]);
export const EVIDENCE_MIN_PREFIX_CODE_POINTS = 2;
export const EVIDENCE_MAX_CACHE_ENTRIES = 128;

const ROUTE_KINDS = Object.freeze(["document", "source", "relation"]);
const VERSION_KEYS = Object.freeze({
  schema: ["schemaVersion", "schema_version"],
  content: ["contentVersion", "content_version", "manifestVersion", "version"]
});

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value || {}, key);

/**
 * Normalize a stable id or search key exactly as the static builder does.
 * Deliberately do not truncate, trim, or collapse whitespace: the FNV parity
 * contract covers the complete NFKC + ko-KR lowercase string.
 */
export function normalizeEvidenceLookupValue(value) {
  return String(value ?? "").normalize("NFKC").toLocaleLowerCase("ko-KR");
}

/** FNV-1a over JavaScript UTF-16 code units after full-string normalization. */
export function evidenceLookupHash(value) {
  const normalized = normalizeEvidenceLookupValue(value);
  if (!normalized) return null;
  let hash = 2_166_136_261;
  for (let index = 0; index < normalized.length; index += 1) {
    hash ^= normalized.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

export function isEvidenceBucketCount(value, maxBuckets = EVIDENCE_MAX_BUCKETS) {
  const count = Number(value);
  const maximum = Number(maxBuckets);
  return Number.isSafeInteger(count)
    && Number.isSafeInteger(maximum)
    && maximum >= 1
    && count >= 1
    && count <= Math.min(maximum, EVIDENCE_MAX_BUCKETS)
    && (count & (count - 1)) === 0;
}

/** Resolve a stable id to one power-of-two bucket shared by lookup and search. */
export function evidenceLookupBucket(value, bucketCount, maxBuckets = EVIDENCE_MAX_BUCKETS) {
  const hash = evidenceLookupHash(value);
  if (hash === null || !isEvidenceBucketCount(bucketCount, maxBuckets)) return null;
  return hash & (Number(bucketCount) - 1);
}

function normalizedPrefixText(value) {
  return normalizeEvidenceLookupValue(value)
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function prefixLevel(codePointCount, requestedLevel) {
  if (codePointCount < EVIDENCE_MIN_PREFIX_CODE_POINTS) return null;
  if (requestedLevel !== undefined && requestedLevel !== null && requestedLevel !== "") {
    const level = Number(requestedLevel);
    return EVIDENCE_PREFIX_LEVELS.includes(level) && codePointCount >= level ? level : null;
  }
  return Math.min(EVIDENCE_PREFIX_LEVELS.at(-1), codePointCount);
}

/**
 * Select the 2, 3, or 4 Unicode-code-point search prefix. Two-code-point
 * queries use level 2, three-code-point queries level 3, and longer queries
 * level 4. An explicit level is accepted only when the query reaches it.
 */
export function evidencePrefixSearchKey(value, requestedLevel) {
  const codePoints = [...normalizedPrefixText(value)];
  const level = prefixLevel(codePoints.length, requestedLevel);
  if (level === null) return null;
  return { level, key: codePoints.slice(0, level).join("") };
}

/** Address a prefix index deterministically without splitting surrogate pairs. */
export function evidencePrefixBucket(value, bucketCount, requestedLevel, maxBuckets = EVIDENCE_MAX_BUCKETS) {
  const prefix = evidencePrefixSearchKey(value, requestedLevel);
  if (!prefix) return null;
  const bucket = evidenceLookupBucket(`search:${prefix.level}:${prefix.key}`, bucketCount, maxBuckets);
  return bucket === null ? null : { ...prefix, bucket };
}

function descriptorValue(value, seen = new Set()) {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object" || seen.has(value)) return "";
  seen.add(value);
  for (const key of ["url", "route", "path", "asset", "href"]) {
    const nested = descriptorValue(value[key], seen);
    if (nested) return nested;
  }
  for (const key of ["payload", "data", "file", "descriptor"]) {
    const nested = descriptorValue(value[key], seen);
    if (nested) return nested;
  }
  return "";
}

function manifestDescriptor(manifest, descriptorOrKey) {
  if (descriptorOrKey && typeof descriptorOrKey === "object") return descriptorOrKey;
  const key = String(descriptorOrKey ?? "");
  if (!key) return "";
  for (const container of [manifest, manifest?.assets, manifest?.routes, manifest?.shards]) {
    if (container && typeof container === "object" && hasOwn(container, key)) return container[key];
  }
  return key;
}

function versionValue(record, keys) {
  for (const key of keys) {
    const value = record?.[key];
    if (value !== undefined && value !== null && String(value).trim()) return String(value).trim();
  }
  return "";
}

function recursiveDecodedSegment(rawSegment) {
  let segment = rawSegment;
  for (let pass = 0; pass < 4; pass += 1) {
    let decoded;
    try {
      decoded = decodeURIComponent(segment);
    } catch {
      return null;
    }
    if (decoded === segment) return decoded;
    segment = decoded;
  }
  return segment;
}

function hasUnsafePathSegment(path) {
  if (path.includes("\\") || /[\u0000-\u001f\u007f]/.test(path)) return true;
  const rawPath = path.split(/[?#]/, 1)[0];
  return rawPath.split("/").some((rawSegment) => {
    const segment = recursiveDecodedSegment(rawSegment);
    return segment === null
      || segment === "."
      || segment === ".."
      || segment.includes("/")
      || segment.includes("\\")
      || /[\u0000-\u001f\u007f]/.test(segment);
  });
}

function formatRouteValue(value, key, descriptor) {
  const text = String(value ?? "");
  if (!text || /[\u0000-\u001f\u007f]/.test(text)) return null;
  const widthName = `${key}Width`;
  const width = Number(descriptor?.[widthName] ?? (key === "bucket" ? descriptor?.bucketWidth : key === "page" ? descriptor?.pageWidth : null));
  const formatted = Number.isSafeInteger(width) && width >= 1 && width <= 12 && /^\d+$/.test(text)
    ? text.padStart(width, "0")
    : text;
  return encodeURIComponent(formatted);
}

function expandRoute(route, replacements, descriptor) {
  let invalid = false;
  const expanded = route.replace(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g, (placeholder, key) => {
    if (!hasOwn(replacements, key)) {
      invalid = true;
      return placeholder;
    }
    const value = formatRouteValue(replacements[key], key, descriptor);
    if (value === null) invalid = true;
    return value ?? placeholder;
  });
  return invalid || /\{[^}]+\}/.test(expanded) ? "" : expanded;
}

function absoluteInput(value) {
  return value instanceof URL || /^[a-z][a-z\d+.-]*:/i.test(String(value || ""));
}

function normalizedDirectoryBase(value) {
  const raw = value instanceof URL ? value.href : String(value || DEFAULT_ASSET_ROOT);
  let url;
  try {
    url = new URL(raw, SYNTHETIC_ORIGIN);
  } catch {
    return null;
  }
  if (!url.pathname.endsWith("/")) url = new URL(".", url);
  url.search = "";
  url.hash = "";
  return url;
}

/**
 * Expand one manifest asset descriptor into a same-origin, content-versioned
 * URL. Relative URLs remain relative; absolute bases return absolute URLs.
 */
export function evidenceManifestAssetUrl(manifest = {}, descriptorOrKey, replacements = {}, options = {}) {
  const descriptor = manifestDescriptor(manifest, descriptorOrKey);
  const route = descriptorValue(descriptor);
  const contentVersion = versionValue(manifest, VERSION_KEYS.content);
  if (!route || !contentVersion || route.startsWith("//") || hasUnsafePathSegment(route)) return "";
  const expanded = expandRoute(route, replacements, descriptor);
  if (!expanded || hasUnsafePathSegment(expanded)) return "";

  const baseInput = options.baseUrl || options.manifestUrl || DEFAULT_ASSET_ROOT;
  const base = normalizedDirectoryBase(baseInput);
  if (!base) return "";
  let resolved;
  try {
    resolved = new URL(expanded, base);
  } catch {
    return "";
  }
  if (resolved.origin !== base.origin || resolved.username || resolved.password || resolved.hash) return "";
  const root = base.pathname.endsWith("/") ? base.pathname : `${base.pathname}/`;
  if (!resolved.pathname.startsWith(root)) return "";
  resolved.searchParams.set("v", contentVersion);
  resolved.hash = "";
  const returnAbsolute = absoluteInput(baseInput);
  return returnAbsolute ? resolved.href : `${resolved.pathname}${resolved.search}`;
}

export const evidenceAssetUrl = evidenceManifestAssetUrl;

function normalizedRootPath(value) {
  let pathname;
  try {
    pathname = new URL(String(value || "/map/evidence/"), SYNTHETIC_ORIGIN).pathname;
  } catch {
    return "/map/evidence/";
  }
  const marker = "/map/evidence/";
  const markerIndex = pathname.indexOf(marker);
  if (markerIndex >= 0) return pathname.slice(0, markerIndex + marker.length);
  return marker;
}

function safeEvidenceId(value, kind) {
  const id = normalizeEvidenceLookupValue(value).trim();
  if (!id || id === "." || id === ".." || /[/%\\?#\u0000-\u001f\u007f]/.test(id)) return "";
  if (kind === "relation") {
    return /^[a-z0-9][a-z0-9._~-]*$/.test(id) ? id : "";
  }
  return /^[\p{L}\p{N}][\p{L}\p{N}._~-]*$/u.test(id) ? id : "";
}

function safePage(value) {
  const number = Number(value ?? 1);
  return Number.isSafeInteger(number) && number >= 1 && number <= 100_000 ? number : null;
}

function evidenceState(kind = "overview", id = "", page = 1, valid = true) {
  const state = {
    valid,
    mode: kind,
    kind: kind === "overview" ? "" : kind,
    id: kind === "overview" ? "" : id,
    page
  };
  state.graphId = kind === "document" ? id : "";
  state.sourceId = kind === "source" ? id : "";
  state.routeId = kind === "relation" ? id : "";
  return state;
}

function invalidEvidenceState() {
  return evidenceState("overview", "", 1, false);
}

function parseInputUrl(value) {
  try {
    return value instanceof URL ? new URL(value.href) : new URL(String(value || "/map/evidence/"), SYNTHETIC_ORIGIN);
  } catch {
    return null;
  }
}

function rawInputPath(value) {
  if (value instanceof URL) return value.pathname;
  const raw = String(value || "");
  const withoutOrigin = raw.replace(/^[a-z][a-z\d+.-]*:\/\/[^/]*/i, "");
  return withoutOrigin.split(/[?#]/, 1)[0];
}

/** Parse one canonical static evidence route without accepting extra segments. */
export function parseEvidenceUrl(value, options = {}) {
  if (hasUnsafePathSegment(rawInputPath(value))) return invalidEvidenceState();
  const url = parseInputUrl(value);
  if (!url) return invalidEvidenceState();
  const rootPath = normalizedRootPath(options.rootPath || url.pathname);
  if (!url.pathname.startsWith(rootPath)) return invalidEvidenceState();
  const rawSegments = url.pathname.slice(rootPath.length).split("/").filter(Boolean);
  if (!rawSegments.length) return evidenceState();
  if (rawSegments.length < 2 || rawSegments.length > 3) return invalidEvidenceState();
  const kind = rawSegments[0];
  if (!ROUTE_KINDS.includes(kind)) return invalidEvidenceState();
  const decoded = recursiveDecodedSegment(rawSegments[1]);
  if (decoded === null || encodeURIComponent(decoded).toLowerCase() !== rawSegments[1].toLowerCase()) return invalidEvidenceState();
  const id = safeEvidenceId(decoded, kind);
  const page = rawSegments.length === 3 && /^\d+$/.test(rawSegments[2]) ? safePage(rawSegments[2]) : rawSegments.length === 2 ? 1 : null;
  return id && page ? evidenceState(kind, id, page) : invalidEvidenceState();
}

function stateId(state, kind) {
  if (state?.id !== undefined) return state.id;
  if (kind === "document") return state?.graphId;
  if (kind === "source") return state?.sourceId;
  if (kind === "relation") return state?.routeId ?? state?.relationId;
  return "";
}

/** Build a canonical static route; page 1 is intentionally omitted. */
export function evidenceUrlFor(base, state = {}, options = {}) {
  const parsedBase = parseInputUrl(base);
  if (!parsedBase) return "";
  const rootPath = normalizedRootPath(options.rootPath || parsedBase.pathname);
  const requestedKind = state.mode === "overview" ? "overview" : state.mode || state.kind || "overview";
  let pathname = rootPath;
  if (ROUTE_KINDS.includes(requestedKind)) {
    const id = safeEvidenceId(stateId(state, requestedKind), requestedKind);
    const page = safePage(state.page);
    if (id && page) {
      pathname += `${requestedKind}/${encodeURIComponent(id)}/`;
      if (page > 1) pathname += `${page}/`;
    }
  }
  parsedBase.pathname = pathname;
  parsedBase.search = "";
  parsedBase.hash = "";
  return absoluteInput(base) ? parsedBase.href : parsedBase.pathname;
}

/**
 * A single bounded Map is the payload cache. Reads refresh recency; peek and
 * inspection do not create an unbounded secondary record store.
 */
export function createEvidenceLruCache(maxEntries = DEFAULT_CACHE_ENTRIES) {
  const requested = typeof maxEntries === "object" ? maxEntries.maxEntries : maxEntries;
  const numeric = Math.floor(Number(requested));
  const limit = Number.isFinite(numeric) && numeric >= 1
    ? Math.min(numeric, EVIDENCE_MAX_CACHE_ENTRIES)
    : DEFAULT_CACHE_ENTRIES;
  const payloads = new Map();
  return {
    maxEntries: limit,
    get size() {
      return payloads.size;
    },
    has(key) {
      return payloads.has(key);
    },
    get(key) {
      if (!payloads.has(key)) return undefined;
      const payload = payloads.get(key);
      payloads.delete(key);
      payloads.set(key, payload);
      return payload;
    },
    peek(key) {
      return payloads.get(key);
    },
    set(key, payload) {
      if (payloads.has(key)) payloads.delete(key);
      payloads.set(key, payload);
      while (payloads.size > limit) payloads.delete(payloads.keys().next().value);
      return this;
    },
    delete(key) {
      return payloads.delete(key);
    },
    clear() {
      payloads.clear();
    },
    keys() {
      return [...payloads.keys()];
    }
  };
}

/** Resolve combobox/list result movement without coupling to DOM objects. */
export function evidenceResultKeyboardIndex(resultsOrCount, currentIndex, key, options = {}) {
  const count = Array.isArray(resultsOrCount) ? resultsOrCount.length : Math.floor(Number(resultsOrCount));
  if (!Number.isSafeInteger(count) || count <= 0) return -1;
  const current = Number.isInteger(currentIndex) && currentIndex >= 0 && currentIndex < count ? currentIndex : -1;
  const wrap = options.wrap === true;
  if (key === "Escape") return -1;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  if (key === "ArrowDown") {
    if (current < 0) return 0;
    return current + 1 < count ? current + 1 : wrap ? 0 : count - 1;
  }
  if (key === "ArrowUp") {
    if (current < 0) return count - 1;
    return current > 0 ? current - 1 : wrap ? count - 1 : 0;
  }
  return current;
}

/** Ensure one lazy payload belongs to the active evidence manifest. */
export function normalizeEvidencePayloadVersion(manifest = {}, payload = {}) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Evidence payload must be an object");
  }
  const expectedSchema = versionValue(manifest, VERSION_KEYS.schema);
  const expectedContent = versionValue(manifest, VERSION_KEYS.content);
  const actualSchema = versionValue(payload, VERSION_KEYS.schema);
  const actualContent = versionValue(payload, VERSION_KEYS.content);
  if (!expectedSchema && !expectedContent) throw new Error("Evidence manifest does not declare a version");
  if (expectedSchema && actualSchema !== expectedSchema) {
    throw new Error(`Evidence payload schema version mismatch: expected '${expectedSchema}', received '${actualSchema || "missing"}'`);
  }
  if (expectedContent && actualContent !== expectedContent) {
    throw new Error(`Evidence payload content version mismatch: expected '${expectedContent}', received '${actualContent || "missing"}'`);
  }
  return { schemaVersion: expectedSchema || actualSchema, contentVersion: expectedContent || actualContent };
}
