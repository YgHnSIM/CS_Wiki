import { createHash } from "node:crypto";

export const EVIDENCE_SCHEMA_VERSION = "1.0.0";

export const EVIDENCE_LIMITS = Object.freeze({
  overviewEvidenceHubs: 12,
  overviewRelationAssertions: 12,
  overviewDomains: 16,
  overviewBytes: 64 * 1024,
  manifestBytes: 32 * 1024,
  lookupShardRecords: 96,
  lookupShardBytes: 64 * 1024,
  lookupMaxBuckets: 1_048_576,
  lookupMaxIdLength: 1_024,
  searchPageRecords: 96,
  searchPageBytes: 64 * 1024,
  searchResultLimit: 24,
  searchPrefixMin: 2,
  searchPrefixMax: 4,
  staticPageRecords: 12,
  staticPagerRadius: 2,
  previewRecords: 8,
  previewBytes: 32 * 1024,
  detailPageRecords: 48,
  detailPageBytes: 64 * 1024,
  focusBytes: 64 * 1024
});

export const EVIDENCE_LOOKUP_HASH = "fnv1a32-utf16";
export const EVIDENCE_SEARCH_PREFIX_LEVELS = Object.freeze([2, 3, 4]);

export function evidenceStaticPageCount(...itemCounts) {
  const total = Math.max(0, ...itemCounts.map((count) => Number(count) || 0));
  return Math.max(1, Math.ceil(total / EVIDENCE_LIMITS.staticPageRecords));
}

export function evidenceStaticPageNumbers(page, pageCount, radius = EVIDENCE_LIMITS.staticPagerRadius) {
  if (!Number.isInteger(pageCount) || pageCount < 1) throw new Error("Evidence static page count must be a positive integer");
  if (!Number.isInteger(page) || page < 1 || page > pageCount) throw new Error("Evidence static page must be within the available range");
  if (!Number.isInteger(radius) || radius < 0 || radius > 8) throw new Error("Evidence static pager radius must be an integer from 0 to 8");
  const candidates = [1, pageCount];
  for (let offset = -radius; offset <= radius; offset += 1) candidates.push(page + offset);
  return [...new Set(candidates.filter((number) => number >= 1 && number <= pageCount))]
    .sort((left, right) => left - right);
}

const EVIDENCE_CATEGORIES = new Set(["sources", "references"]);
const LOOKUP_TYPES = new Set(["document", "relation", "evidence"]);
const PAGE_WIDTH = 4;

function compareText(left, right) {
  const a = String(left ?? "");
  const b = String(right ?? "");
  return a < b ? -1 : a > b ? 1 : 0;
}

function values(value) {
  return Array.isArray(value) ? value : value === undefined || value === null ? [] : [value];
}

function uniqueSorted(items) {
  return [...new Set(values(items).map((item) => String(item ?? "").trim()).filter(Boolean))].sort(compareText);
}

function positiveLimit(value, fallback, maximum = fallback) {
  const number = Math.floor(Number(value));
  if (!Number.isSafeInteger(number) || number < 1 || number > maximum) return fallback;
  return number;
}

function normalizedLimits(input = {}) {
  const limits = {
    overviewEvidenceHubs: positiveLimit(input.overviewEvidenceHubs, EVIDENCE_LIMITS.overviewEvidenceHubs),
    overviewRelationAssertions: positiveLimit(input.overviewRelationAssertions, EVIDENCE_LIMITS.overviewRelationAssertions),
    overviewDomains: positiveLimit(input.overviewDomains, EVIDENCE_LIMITS.overviewDomains),
    overviewBytes: positiveLimit(input.overviewBytes, EVIDENCE_LIMITS.overviewBytes),
    manifestBytes: positiveLimit(input.manifestBytes, EVIDENCE_LIMITS.manifestBytes),
    lookupShardRecords: positiveLimit(input.lookupShardRecords, EVIDENCE_LIMITS.lookupShardRecords),
    lookupShardBytes: positiveLimit(input.lookupShardBytes, EVIDENCE_LIMITS.lookupShardBytes),
    lookupMaxBuckets: positiveLimit(input.lookupMaxBuckets, EVIDENCE_LIMITS.lookupMaxBuckets),
    lookupMaxIdLength: positiveLimit(input.lookupMaxIdLength, EVIDENCE_LIMITS.lookupMaxIdLength),
    searchPageRecords: positiveLimit(input.searchPageRecords, EVIDENCE_LIMITS.searchPageRecords),
    searchPageBytes: positiveLimit(input.searchPageBytes, EVIDENCE_LIMITS.searchPageBytes),
    searchResultLimit: positiveLimit(input.searchResultLimit, EVIDENCE_LIMITS.searchResultLimit),
    searchPrefixMin: EVIDENCE_LIMITS.searchPrefixMin,
    searchPrefixMax: EVIDENCE_LIMITS.searchPrefixMax,
    staticPageRecords: EVIDENCE_LIMITS.staticPageRecords,
    staticPagerRadius: EVIDENCE_LIMITS.staticPagerRadius,
    previewRecords: positiveLimit(input.previewRecords, EVIDENCE_LIMITS.previewRecords),
    previewBytes: positiveLimit(input.previewBytes, EVIDENCE_LIMITS.previewBytes),
    detailPageRecords: positiveLimit(input.detailPageRecords, EVIDENCE_LIMITS.detailPageRecords),
    detailPageBytes: positiveLimit(input.detailPageBytes, EVIDENCE_LIMITS.detailPageBytes),
    focusBytes: positiveLimit(input.focusBytes, EVIDENCE_LIMITS.focusBytes)
  };
  if (!validBucketCount(limits.lookupMaxBuckets, EVIDENCE_LIMITS.lookupMaxBuckets)) {
    limits.lookupMaxBuckets = EVIDENCE_LIMITS.lookupMaxBuckets;
  }
  return limits;
}

function payloadBytes(payload) {
  return Buffer.byteLength(JSON.stringify(payload));
}

function withVersion(contentVersion, payload) {
  return { schemaVersion: EVIDENCE_SCHEMA_VERSION, contentVersion, ...payload };
}

function normalizeLookupInput(value, maxLength = EVIDENCE_LIMITS.lookupMaxIdLength) {
  const raw = String(value ?? "");
  if (!raw || raw.length > maxLength) {
    throw new Error(`Evidence lookup id must contain 1-${maxLength} UTF-16 code units`);
  }
  return raw.normalize("NFKC").toLocaleLowerCase("ko-KR");
}

/** NFKC + ko-KR lowercase + FNV-1a over JavaScript UTF-16 code units. */
export function evidenceLookupHash(value, maxLength = EVIDENCE_LIMITS.lookupMaxIdLength) {
  const normalized = normalizeLookupInput(value, maxLength);
  let hash = 2166136261;
  for (let index = 0; index < normalized.length; index += 1) {
    hash ^= normalized.charCodeAt(index);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash >>> 0;
}

function validBucketCount(value, maximum = EVIDENCE_LIMITS.lookupMaxBuckets) {
  const count = Number(value);
  return Number.isSafeInteger(count)
    && count >= 1
    && count <= maximum
    && (count & (count - 1)) === 0;
}

/** Stable zero-padded decimal address shared by direct and prefix lookup. */
export function evidenceLookupBucket(
  value,
  bucketCount,
  bucketWidth = String(Number(bucketCount) - 1).length,
  options = {}
) {
  const maxBuckets = positiveLimit(options.maxBuckets, EVIDENCE_LIMITS.lookupMaxBuckets);
  const maxIdLength = positiveLimit(options.maxIdLength, EVIDENCE_LIMITS.lookupMaxIdLength);
  if (!validBucketCount(bucketCount, maxBuckets)) {
    throw new Error(`Evidence lookup bucketCount '${bucketCount}' must be a positive power of two not above ${maxBuckets}`);
  }
  const width = Math.floor(Number(bucketWidth));
  const requiredWidth = String(bucketCount - 1).length;
  if (!Number.isSafeInteger(width) || width < requiredWidth) {
    throw new Error(`Evidence lookup bucketWidth '${bucketWidth}' must be at least ${requiredWidth}`);
  }
  const index = (evidenceLookupHash(value, maxIdLength) & (bucketCount - 1)) >>> 0;
  return { index, id: String(index).padStart(width, "0") };
}

export function evidenceLookupKey(type, id, maxLength = EVIDENCE_LIMITS.lookupMaxIdLength) {
  const normalizedType = String(type ?? "").trim().toLocaleLowerCase("en-US");
  if (!LOOKUP_TYPES.has(normalizedType)) throw new Error(`Unknown evidence lookup type '${type}'`);
  const stableId = String(id ?? "").trim();
  const key = `${normalizedType}:${stableId}`;
  normalizeLookupInput(key, maxLength);
  return key;
}

export function normalizeEvidenceSearchText(value = "") {
  return String(value)
    .normalize("NFKC")
    .toLocaleLowerCase("ko-KR")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

/** Return the one deterministic prefix a browser must request for a query. */
export function evidenceSearchPrefix(value = "") {
  const normalized = normalizeEvidenceSearchText(value);
  const points = Array.from(normalized);
  if (points.length < EVIDENCE_LIMITS.searchPrefixMin) return null;
  const level = Math.min(points.length, EVIDENCE_LIMITS.searchPrefixMax);
  const prefix = points.slice(0, level).join("");
  return { normalized, level, prefix, key: `search:${level}:${prefix}` };
}

function stableShardId(type, stableId) {
  const prefix = type === "document" ? "document" : type === "relation" ? "relation" : "evidence";
  const digest = createHash("sha256").update(`${prefix}\0${stableId}`).digest("hex").slice(0, 16);
  return `${prefix}-${digest}`;
}

function stableAttestationId(scope, ...stableIds) {
  const digest = createHash("sha256").update(`${scope}\0${stableIds.join("\0")}`).digest("hex").slice(0, 16);
  return `attestation-${scope}-${digest}`;
}

function canonicalNodeBase(node) {
  return {
    id: String(node.id),
    title: String(node.title || node.id),
    aliases: uniqueSorted(node.aliases),
    url: String(node.url || ""),
    category: String(node.category || ""),
    domains: uniqueSorted(node.domains),
    status: String(node.status || "draft"),
    summary: String(node.summary || ""),
    visibility: String(node.visibility || "public")
  };
}

function endpointStub(node) {
  const base = canonicalNodeBase(node);
  return {
    id: base.id,
    title: base.title,
    url: base.url,
    category: base.category,
    visibility: base.visibility
  };
}

function canonicalProvenance(node) {
  const provenance = node.provenance || {};
  return {
    sources: uniqueSorted(provenance.sources),
    primarySources: uniqueSorted(provenance.primarySources),
    supportingSources: uniqueSorted(provenance.supportingSources),
    sourceUrls: uniqueSorted(provenance.sourceUrls),
    sourceKind: provenance.sourceKind ? String(provenance.sourceKind) : null,
    retrieved: provenance.retrieved ? String(provenance.retrieved) : null,
    version: provenance.version ? String(provenance.version) : null,
    snapshotStatus: provenance.snapshotStatus ? String(provenance.snapshotStatus) : null
  };
}

function canonicalContext(context = {}) {
  return {
    ...(context.note ? { note: String(context.note) } : {}),
    ...(context.pageId ? { pageId: String(context.pageId) } : {}),
    ...(context.section ? { section: String(context.section) } : {})
  };
}

function contextCompare(left, right) {
  return compareText(JSON.stringify(left), JSON.stringify(right));
}

function assertionStub(assertion) {
  if (assertion.scope === "document") {
    return {
      id: assertion.id,
      scope: assertion.scope,
      nodeId: assertion.nodeId,
      title: assertion.title,
      summary: assertion.summary,
      url: assertion.url,
      category: assertion.category,
      domains: assertion.domains,
      status: assertion.status,
      evidenceCount: assertion.evidenceCount,
      shardId: assertion.shardId
    };
  }
  return {
    id: assertion.id,
    scope: assertion.scope,
    edgeId: assertion.edgeId,
    title: assertion.title,
    kind: assertion.kind,
    statement: assertion.statement,
    statements: assertion.statements,
    source: assertion.source,
    target: assertion.target,
    evidenceCount: assertion.evidenceCount,
    shardId: assertion.shardId
  };
}

function evidenceStub(evidence) {
  return {
    id: evidence.id,
    sourceId: evidence.sourceId,
    title: evidence.title,
    summary: evidence.summary,
    url: evidence.url,
    category: evidence.category,
    status: evidence.status,
    visibility: evidence.visibility,
    provenance: evidence.provenance,
    usedByCount: evidence.usedByCount,
    shardId: evidence.shardId
  };
}

function coverageBucket(count) {
  if (count === 0) return "0";
  if (count === 1) return "1";
  if (count <= 4) return "2-4";
  return "5-plus";
}

function paginateRecords({
  records,
  contentVersion,
  kind,
  focusType,
  focusId,
  shardId,
  route,
  recordLimit,
  byteLimit
}) {
  if (!records.length) return { pages: [], descriptor: {
    kind: "paginated",
    route,
    shardId,
    pageWidth: PAGE_WIDTH,
    pageCount: 0,
    itemCount: 0,
    recordLimit,
    byteLimit
  } };

  const sorted = [...records].sort((left, right) => compareText(left.id, right.id));
  const estimatedPageCount = sorted.length;
  const pagePayload = (members, page, pageCount) => withVersion(contentVersion, {
    id: `${shardId}--page-${String(page).padStart(PAGE_WIDTH, "0")}`,
    kind,
    focusType,
    focusId,
    shardId,
    page,
    pageCount,
    route: route.replace("{page}", String(page).padStart(PAGE_WIDTH, "0")),
    records: members,
    stats: { records: members.length, totalRecords: sorted.length }
  });
  const chunks = [];
  let current = [];
  for (const record of sorted) {
    const candidate = [...current, record];
    if (candidate.length <= recordLimit
      && payloadBytes(pagePayload(candidate, estimatedPageCount, estimatedPageCount)) <= byteLimit) {
      current = candidate;
      continue;
    }
    if (!current.length) {
      throw new Error(`Evidence ${focusType} '${focusId}' has one atomic detail record exceeding ${byteLimit} bytes`);
    }
    chunks.push(current);
    current = [record];
    if (payloadBytes(pagePayload(current, estimatedPageCount, estimatedPageCount)) > byteLimit) {
      throw new Error(`Evidence ${focusType} '${focusId}' has one atomic detail record exceeding ${byteLimit} bytes`);
    }
  }
  if (current.length) chunks.push(current);

  const pages = chunks.map((members, index) => pagePayload(members, index + 1, chunks.length));
  for (const page of pages) {
    if (page.records.length > recordLimit || payloadBytes(page) > byteLimit) {
      throw new Error(`Evidence detail page '${page.id}' exceeds its declared payload bounds`);
    }
  }
  return {
    pages,
    descriptor: {
      kind: "paginated",
      route,
      shardId,
      pageWidth: PAGE_WIDTH,
      pageCount: pages.length,
      itemCount: sorted.length,
      recordLimit,
      byteLimit
    }
  };
}

function boundedPreview(records, recordLimit, byteLimit) {
  const selected = [];
  for (const record of records.slice(0, recordLimit)) {
    const candidate = [...selected, record];
    const preview = {
      records: candidate,
      displayedRecords: candidate.length,
      totalRecords: records.length,
      truncated: candidate.length < records.length
    };
    if (payloadBytes(preview) > byteLimit) break;
    selected.push(record);
  }
  const preview = {
    records: selected,
    displayedRecords: selected.length,
    totalRecords: records.length,
    truncated: selected.length < records.length
  };
  if (payloadBytes(preview) > byteLimit) throw new Error("Evidence preview exceeds its byte limit");
  return preview;
}

function buildDirectLookup(records, contentVersion, limits) {
  for (const record of records) evidenceLookupKey(record.type, record.id, limits.lookupMaxIdLength);
  const fullHashGroups = new Map();
  for (const record of records) {
    const hash = evidenceLookupHash(record.key, limits.lookupMaxIdLength);
    if (!fullHashGroups.has(hash)) fullHashGroups.set(hash, []);
    fullHashGroups.get(hash).push(record);
  }
  for (const record of records) {
    const payload = withVersion(contentVersion, {
      id: "0",
      kind: "evidence-lookup-shard",
      bucket: { id: "0", index: 0, bucketCount: 1, bucketWidth: 1, hash: EVIDENCE_LOOKUP_HASH },
      records: [record],
      stats: { records: 1 }
    });
    if (payloadBytes(payload) > limits.lookupShardBytes) {
      throw new Error(`Evidence lookup record '${record.key}' exceeds ${limits.lookupShardBytes} bytes`);
    }
  }
  for (const members of fullHashGroups.values()) {
    if (members.length > limits.lookupShardRecords) {
      throw new Error(`Evidence direct lookup hash collision exceeds ${limits.lookupShardRecords} records`);
    }
    const payload = withVersion(contentVersion, {
      id: "0",
      kind: "evidence-lookup-shard",
      bucket: { id: "0", index: 0, bucketCount: 1, bucketWidth: 1, hash: EVIDENCE_LOOKUP_HASH },
      records: members,
      stats: { records: members.length }
    });
    if (payloadBytes(payload) > limits.lookupShardBytes) {
      throw new Error(`Evidence direct lookup hash collision exceeds ${limits.lookupShardBytes} bytes`);
    }
  }
  let bucketCount = 1;
  while (bucketCount <= limits.lookupMaxBuckets) {
    const bucketWidth = String(bucketCount - 1).length;
    const buckets = Array.from({ length: bucketCount }, () => []);
    for (const record of records) {
      const address = evidenceLookupBucket(record.key, bucketCount, bucketWidth, {
        maxBuckets: limits.lookupMaxBuckets,
        maxIdLength: limits.lookupMaxIdLength
      });
      buckets[address.index].push(record);
    }
    let overflow = false;
    for (let index = 0; index < bucketCount; index += 1) {
      const id = String(index).padStart(bucketWidth, "0");
      const members = buckets[index].sort((left, right) => compareText(left.key, right.key));
      const payload = withVersion(contentVersion, {
        id,
        kind: "evidence-lookup-shard",
        bucket: { id, index, bucketCount, bucketWidth, hash: EVIDENCE_LOOKUP_HASH },
        records: members,
        stats: { records: members.length }
      });
      if (members.length > limits.lookupShardRecords || payloadBytes(payload) > limits.lookupShardBytes) {
        overflow = true;
        break;
      }
    }
    if (!overflow) {
      const lookupShards = {};
      for (let index = 0; index < bucketCount; index += 1) {
        const id = String(index).padStart(bucketWidth, "0");
        const members = buckets[index].sort((left, right) => compareText(left.key, right.key));
        lookupShards[id] = withVersion(contentVersion, {
          id,
          kind: "evidence-lookup-shard",
          bucket: { id, index, bucketCount, bucketWidth, hash: EVIDENCE_LOOKUP_HASH },
          records: members,
          stats: { records: members.length }
        });
      }
      return {
        descriptor: {
          kind: "sharded",
          hash: EVIDENCE_LOOKUP_HASH,
          compositeTypes: [...LOOKUP_TYPES].sort(compareText),
          bucketCount,
          bucketWidth,
          route: "lookup/bucket-{bucket}.json",
          recordLimit: limits.lookupShardRecords,
          byteLimit: limits.lookupShardBytes,
          maxBuckets: limits.lookupMaxBuckets,
          maxIdLength: limits.lookupMaxIdLength
        },
        lookupShards
      };
    }
    if (bucketCount === limits.lookupMaxBuckets) break;
    bucketCount *= 2;
  }
  throw new Error(`Evidence direct lookup cannot satisfy ${limits.lookupShardRecords}-record/${limits.lookupShardBytes}-byte shard limits`);
}

function termPrefixes(value) {
  const normalized = normalizeEvidenceSearchText(value);
  const points = Array.from(normalized);
  const prefixes = [];
  for (const level of EVIDENCE_SEARCH_PREFIX_LEVELS) {
    if (points.length >= level) prefixes.push({ level, prefix: points.slice(0, level).join("") });
  }
  return prefixes;
}

function searchEntry(record, level, prefix) {
  return {
    id: `${level}:${prefix}:${record.key}`,
    prefix,
    key: record.key,
    type: record.type,
    recordId: record.id,
    title: record.title,
    aliases: record.aliases,
    url: record.url,
    category: record.category,
    status: record.status,
    shardId: record.shardId
  };
}

function buildPrefixSearch(lookupRecords, contentVersion, limits) {
  const deduplicated = new Map();
  for (const record of lookupRecords) {
    for (const term of [record.title, ...record.aliases]) {
      for (const { level, prefix } of termPrefixes(term)) {
        const entry = searchEntry(record, level, prefix);
        const dedupeKey = `${level}\0${prefix}\0${record.key}`;
        if (!deduplicated.has(dedupeKey)) deduplicated.set(dedupeKey, entry);
      }
    }
  }
  const entries = [...deduplicated.values()].sort((left, right) => (
    Number(left.id.split(":", 1)[0]) - Number(right.id.split(":", 1)[0])
    || compareText(left.prefix, right.prefix)
    || compareText(left.key, right.key)
  ));

  let bucketCount = 1;
  while (Math.ceil(entries.length / bucketCount) > limits.searchPageRecords) {
    if (bucketCount >= limits.lookupMaxBuckets) {
      throw new Error("Evidence prefix search exceeds the shared maximum bucket count");
    }
    bucketCount *= 2;
  }
  const bucketWidth = String(bucketCount - 1).length;
  const grouped = new Map();
  for (const level of EVIDENCE_SEARCH_PREFIX_LEVELS) {
    for (let index = 0; index < bucketCount; index += 1) grouped.set(`${level}:${index}`, []);
  }
  for (const entry of entries) {
    const level = Number(entry.id.split(":", 1)[0]);
    const key = `search:${level}:${entry.prefix}`;
    const address = evidenceLookupBucket(key, bucketCount, bucketWidth, {
      maxBuckets: limits.lookupMaxBuckets,
      maxIdLength: limits.lookupMaxIdLength
    });
    grouped.get(`${level}:${address.index}`).push(entry);
  }

  const searchShards = {};
  for (const level of EVIDENCE_SEARCH_PREFIX_LEVELS) {
    for (let index = 0; index < bucketCount; index += 1) {
      const bucketId = String(index).padStart(bucketWidth, "0");
      const records = grouped.get(`${level}:${index}`).sort((left, right) => (
        compareText(left.prefix, right.prefix) || compareText(left.key, right.key)
      ));
      const pagePayload = (members, page, pageCount) => withVersion(contentVersion, {
        id: `search-${level}-${bucketId}-page-${String(page).padStart(PAGE_WIDTH, "0")}`,
        kind: "evidence-search-page",
        level,
        bucket: { id: bucketId, index, bucketCount, bucketWidth, hash: EVIDENCE_LOOKUP_HASH },
        page,
        pageCount,
        route: `search/level-${level}/bucket-${bucketId}/page-${String(page).padStart(PAGE_WIDTH, "0")}.json`,
        entries: members,
        stats: { records: members.length, totalRecords: records.length }
      });
      const chunks = [];
      let current = [];
      for (const record of records) {
        const candidate = [...current, record];
        if (candidate.length <= limits.searchPageRecords
          && payloadBytes(pagePayload(candidate, records.length || 1, records.length || 1)) <= limits.searchPageBytes) {
          current = candidate;
          continue;
        }
        if (!current.length) throw new Error(`Evidence search entry '${record.id}' exceeds ${limits.searchPageBytes} bytes`);
        chunks.push(current);
        current = [record];
        if (payloadBytes(pagePayload(current, records.length, records.length)) > limits.searchPageBytes) {
          throw new Error(`Evidence search entry '${record.id}' exceeds ${limits.searchPageBytes} bytes`);
        }
      }
      if (current.length) chunks.push(current);
      if (!chunks.length) chunks.push([]);
      chunks.forEach((members, pageIndex) => {
        const payload = pagePayload(members, pageIndex + 1, chunks.length);
        if (payload.entries.length > limits.searchPageRecords || payloadBytes(payload) > limits.searchPageBytes) {
          throw new Error(`Evidence search page '${payload.id}' exceeds its declared payload bounds`);
        }
        searchShards[payload.id] = payload;
      });
    }
  }
  return {
    descriptor: {
      kind: "prefix-sharded",
      hash: EVIDENCE_LOOKUP_HASH,
      prefixLevels: [...EVIDENCE_SEARCH_PREFIX_LEVELS],
      minimumCodePoints: limits.searchPrefixMin,
      maximumCodePoints: limits.searchPrefixMax,
      bucketCount,
      bucketWidth,
      route: "search/level-{level}/bucket-{bucket}/page-{page}.json",
      pageWidth: PAGE_WIDTH,
      recordLimit: limits.searchPageRecords,
      byteLimit: limits.searchPageBytes,
      resultLimit: limits.searchResultLimit,
      maxBuckets: limits.lookupMaxBuckets,
      maxIdLength: limits.lookupMaxIdLength
    },
    searchShards,
    entryCount: entries.length
  };
}

function buildFacet(valuesToCount, limit) {
  const counts = new Map();
  for (const value of valuesToCount.filter(Boolean)) counts.set(value, (counts.get(value) || 0) + 1);
  const all = [...counts].map(([id, count]) => ({ id, count }))
    .sort((left, right) => right.count - left.count || compareText(left.id, right.id));
  return { values: all.slice(0, limit), total: all.length, omitted: Math.max(0, all.length - limit) };
}

function assertUnique(records, label) {
  const ids = records.map((record) => record.id);
  if (new Set(ids).size !== ids.length) throw new Error(`Duplicate ${label} id`);
}

/**
 * Build a page-level evidence/provenance lens from the normalized graph.
 * It never infers sentence-level claims, source independence, confidence, or
 * evidence strength.
 */
export function buildEvidenceLens(graph = {}, options = {}) {
  const limits = normalizedLimits(options.limits || {});
  const rawNodes = values(graph.nodes);
  const rawEdges = values(graph.edges);
  const nodeById = new Map();
  for (const node of rawNodes) {
    const id = String(node?.id || "").trim();
    if (!id) throw new Error("Evidence graph contains a node without a stable id");
    if (nodeById.has(id)) throw new Error(`Duplicate evidence graph node '${id}'`);
    nodeById.set(id, node);
  }

  const edgeIds = new Set();
  for (const edge of rawEdges) {
    const id = String(edge?.id || "").trim();
    if (!id) throw new Error("Evidence graph contains an edge without a stable id");
    if (edgeIds.has(id)) throw new Error(`Duplicate evidence graph edge '${id}'`);
    edgeIds.add(id);
  }

  const documentBases = [...nodeById.values()]
    .filter((node) => (node.visibility || "public") === "public" && !EVIDENCE_CATEGORIES.has(node.category))
    .map((node) => ({
      ...canonicalNodeBase(node),
      id: `document:${node.id}`,
      scope: "document",
      nodeId: String(node.id),
      shardId: stableShardId("document", String(node.id)),
      evidenceCount: 0
    }))
    .sort((left, right) => compareText(left.nodeId, right.nodeId));
  const documentByNodeId = new Map(documentBases.map((assertion) => [assertion.nodeId, assertion]));

  const relationBases = [];
  for (const edge of [...rawEdges].sort((left, right) => compareText(left.id, right.id))) {
    if (edge.origin !== "curated" || !values(edge.evidence).length) continue;
    const source = nodeById.get(String(edge.source));
    const target = nodeById.get(String(edge.target));
    if (!source || !target) throw new Error(`Evidence relation '${edge.id}' references a missing endpoint`);
    if ((source.visibility || "public") !== "public" || (target.visibility || "public") !== "public") continue;
    const evidenceIds = uniqueSorted(edge.evidence).filter((id) => {
      const node = nodeById.get(id);
      return node && EVIDENCE_CATEGORIES.has(node.category) && (node.visibility || "public") !== "hidden";
    });
    if (!evidenceIds.length) continue;
    const contexts = values(edge.contexts).map(canonicalContext).sort(contextCompare);
    const statements = uniqueSorted(contexts.map((context) => context.note));
    relationBases.push({
      id: `relation:${edge.id}`,
      scope: "relation",
      edgeId: String(edge.id),
      title: `${source.title || source.id} → ${target.title || target.id}`,
      aliases: [],
      url: "",
      category: "relations",
      status: "active",
      kind: String(edge.kind || "related"),
      directed: edge.directed !== false,
      source: endpointStub(source),
      target: endpointStub(target),
      statement: statements[0] || "",
      statements,
      contexts,
      evidenceIds,
      evidenceCount: evidenceIds.length,
      shardId: stableShardId("relation", String(edge.id))
    });
  }
  relationBases.sort((left, right) => compareText(left.edgeId, right.edgeId));
  const relationByEdgeId = new Map(relationBases.map((assertion) => [assertion.edgeId, assertion]));

  const documentAttestations = [];
  for (const edge of [...rawEdges].sort((left, right) => compareText(left.id, right.id))) {
    if (edge.kind !== "supports" || edge.origin !== "derived") continue;
    const source = nodeById.get(String(edge.source));
    const targetAssertion = documentByNodeId.get(String(edge.target));
    if (!source || !targetAssertion || !EVIDENCE_CATEGORIES.has(source.category)) continue;
    if ((source.visibility || "public") === "hidden") continue;
    documentAttestations.push({
      id: stableAttestationId("document", String(edge.id)),
      scope: "document",
      assertionId: targetAssertion.id,
      evidenceId: String(source.id),
      edgeId: String(edge.id),
      basis: "frontmatter:sources"
    });
  }

  const relationAttestations = [];
  for (const assertion of relationBases) {
    for (const evidenceId of assertion.evidenceIds) {
      relationAttestations.push({
        id: stableAttestationId("relation", assertion.edgeId, evidenceId),
        scope: "relation",
        assertionId: assertion.id,
        evidenceId,
        edgeId: assertion.edgeId,
        basis: "relation:evidence"
      });
    }
  }
  const attestations = [...documentAttestations, ...relationAttestations]
    .sort((left, right) => compareText(left.id, right.id));
  assertUnique(attestations, "evidence attestation");

  const usedContextEvidenceIds = new Set(attestations.map((attestation) => attestation.evidenceId));
  const evidenceBases = [...nodeById.values()]
    .filter((node) => EVIDENCE_CATEGORIES.has(node.category)
      && ((node.visibility || "public") === "public" || ((node.visibility || "public") === "context" && usedContextEvidenceIds.has(String(node.id)))))
    .map((node) => ({
      ...canonicalNodeBase(node),
      sourceId: node.sourceId ? String(node.sourceId) : String(node.id),
      provenance: canonicalProvenance(node),
      usedByCount: 0,
      shardId: stableShardId("evidence", String(node.id))
    }))
    .sort((left, right) => compareText(left.id, right.id));
  const evidenceById = new Map(evidenceBases.map((evidence) => [evidence.id, evidence]));

  const visibleAttestations = attestations.filter((attestation) => evidenceById.has(attestation.evidenceId));
  const assertionById = new Map([...documentBases, ...relationBases].map((assertion) => [assertion.id, assertion]));
  const assertionAttestations = new Map([...assertionById.keys()].map((id) => [id, []]));
  const evidenceAttestations = new Map([...evidenceById.keys()].map((id) => [id, []]));
  for (const attestation of visibleAttestations) {
    assertionAttestations.get(attestation.assertionId)?.push(attestation);
    evidenceAttestations.get(attestation.evidenceId)?.push(attestation);
  }

  const documentAssertions = documentBases.map((assertion) => ({
    ...assertion,
    evidenceCount: assertionAttestations.get(assertion.id)?.length || 0
  }));
  const relationAssertions = relationBases.map((assertion) => ({
    ...assertion,
    evidenceCount: assertionAttestations.get(assertion.id)?.length || 0
  }));
  const assertions = [...documentAssertions, ...relationAssertions];
  const finalAssertionById = new Map(assertions.map((assertion) => [assertion.id, assertion]));
  const evidenceDocuments = evidenceBases.map((evidence) => ({
    ...evidence,
    usedByCount: evidenceAttestations.get(evidence.id)?.length || 0
  }));
  const finalEvidenceById = new Map(evidenceDocuments.map((evidence) => [evidence.id, evidence]));

  const contentVersion = createHash("sha256").update(JSON.stringify({
    schemaVersion: EVIDENCE_SCHEMA_VERSION,
    graphSchemaVersion: String(graph.schemaVersion || ""),
    limits,
    documentAssertions,
    relationAssertions,
    evidenceDocuments,
    attestations: visibleAttestations
  })).digest("hex").slice(0, 16);

  const assertionShards = {};
  const assertionDetails = {};
  for (const assertion of assertions) {
    const records = (assertionAttestations.get(assertion.id) || []).map((attestation) => ({
      id: attestation.id,
      attestation,
      assertion: assertionStub(assertion),
      evidence: evidenceStub(finalEvidenceById.get(attestation.evidenceId))
    })).sort((left, right) => compareText(left.id, right.id));
    const route = `assertions/${assertion.shardId}/page-{page}.json`;
    const paginated = paginateRecords({
      records,
      contentVersion,
      kind: "evidence-assertion-detail-page",
      focusType: "assertion",
      focusId: assertion.id,
      shardId: assertion.shardId,
      route,
      recordLimit: limits.detailPageRecords,
      byteLimit: limits.detailPageBytes
    });
    const preview = boundedPreview(records, limits.previewRecords, limits.previewBytes);
    const payload = withVersion(contentVersion, {
      id: assertion.shardId,
      kind: "evidence-assertion-focus",
      assertion,
      preview,
      detail: paginated.descriptor
    });
    if (payloadBytes(payload) > limits.focusBytes) throw new Error(`Evidence assertion focus '${assertion.id}' exceeds ${limits.focusBytes} bytes`);
    assertionShards[assertion.shardId] = payload;
    for (const page of paginated.pages) {
      assertionDetails[page.id] = page;
    }
  }

  const evidenceShards = {};
  const evidenceDetails = {};
  for (const evidence of evidenceDocuments) {
    const records = (evidenceAttestations.get(evidence.id) || []).map((attestation) => ({
      id: attestation.id,
      attestation,
      assertion: assertionStub(finalAssertionById.get(attestation.assertionId)),
      evidence: evidenceStub(evidence)
    })).sort((left, right) => compareText(left.id, right.id));
    const route = `evidence/${evidence.shardId}/page-{page}.json`;
    const paginated = paginateRecords({
      records,
      contentVersion,
      kind: "evidence-reverse-detail-page",
      focusType: "evidence",
      focusId: evidence.id,
      shardId: evidence.shardId,
      route,
      recordLimit: limits.detailPageRecords,
      byteLimit: limits.detailPageBytes
    });
    const preview = boundedPreview(records, limits.previewRecords, limits.previewBytes);
    const payload = withVersion(contentVersion, {
      id: evidence.shardId,
      kind: "evidence-focus",
      evidence,
      preview,
      detail: paginated.descriptor
    });
    if (payloadBytes(payload) > limits.focusBytes) throw new Error(`Evidence source focus '${evidence.id}' exceeds ${limits.focusBytes} bytes`);
    evidenceShards[evidence.shardId] = payload;
    for (const page of paginated.pages) {
      evidenceDetails[page.id] = page;
    }
  }

  const publicEvidence = evidenceDocuments.filter((record) => record.visibility === "public");
  const lookupRecords = [
    ...documentAssertions.map((assertion) => ({
      key: evidenceLookupKey("document", assertion.nodeId, limits.lookupMaxIdLength),
      type: "document",
      id: assertion.nodeId,
      assertionId: assertion.id,
      title: assertion.title,
      aliases: assertion.aliases,
      url: assertion.url,
      category: assertion.category,
      domains: assertion.domains,
      status: assertion.status,
      evidenceCount: assertion.evidenceCount,
      shardId: assertion.shardId
    })),
    ...relationAssertions.map((assertion) => ({
      key: evidenceLookupKey("relation", assertion.edgeId, limits.lookupMaxIdLength),
      type: "relation",
      id: assertion.edgeId,
      assertionId: assertion.id,
      title: assertion.title,
      aliases: [],
      url: "",
      category: "relations",
      domains: [],
      status: "active",
      evidenceCount: assertion.evidenceCount,
      shardId: assertion.shardId
    })),
    ...publicEvidence.map((evidence) => ({
      key: evidenceLookupKey("evidence", evidence.id, limits.lookupMaxIdLength),
      type: "evidence",
      id: evidence.id,
      title: evidence.title,
      aliases: evidence.aliases,
      url: evidence.url,
      category: evidence.category,
      domains: evidence.domains,
      status: evidence.status,
      sourceId: evidence.sourceId,
      sourceKind: evidence.provenance.sourceKind,
      snapshotStatus: evidence.provenance.snapshotStatus,
      usedByCount: evidence.usedByCount,
      shardId: evidence.shardId
    }))
  ].sort((left, right) => compareText(left.key, right.key));
  const directLookup = buildDirectLookup(lookupRecords, contentVersion, limits);
  const prefixSearch = buildPrefixSearch(lookupRecords, contentVersion, limits);

  const coverageCounts = { "0": 0, "1": 0, "2-4": 0, "5-plus": 0 };
  for (const assertion of documentAssertions) coverageCounts[coverageBucket(assertion.evidenceCount)] += 1;
  const accessCounts = { local: 0, archived: 0, "external-only": 0, unclassified: 0 };
  for (const evidence of publicEvidence) {
    const key = evidence.provenance.snapshotStatus;
    if (Object.hasOwn(accessCounts, key)) accessCounts[key] += 1;
    else accessCounts.unclassified += 1;
  }
  const evidenceHubs = [...publicEvidence]
    .sort((left, right) => right.usedByCount - left.usedByCount || compareText(left.id, right.id))
    .slice(0, limits.overviewEvidenceHubs)
    .map((evidence) => ({
      id: evidence.id,
      title: evidence.title,
      url: evidence.url,
      usedByCount: evidence.usedByCount,
      sourceKind: evidence.provenance.sourceKind,
      snapshotStatus: evidence.provenance.snapshotStatus,
      shardId: evidence.shardId
    }));
  const relationSamples = relationAssertions.slice(0, limits.overviewRelationAssertions).map(assertionStub);
  const domainFacet = buildFacet(documentAssertions.flatMap((assertion) => assertion.domains), limits.overviewDomains);

  const overview = withVersion(contentVersion, {
    kind: "evidence-overview",
    coverage: Object.entries(coverageCounts).map(([id, count]) => ({ id, count })),
    provenanceAccess: Object.entries(accessCounts).map(([id, count]) => ({ id, count })),
    evidenceHubs,
    relationAssertions: relationSamples,
    domains: domainFacet,
    stats: {
      documentAssertions: documentAssertions.length,
      relationAssertions: relationAssertions.length,
      evidenceDocuments: publicEvidence.length,
      contextEvidenceDocuments: evidenceDocuments.length - publicEvidence.length,
      documentEvidenceLinks: visibleAttestations.filter((item) => item.scope === "document").length,
      relationEvidenceLinks: visibleAttestations.filter((item) => item.scope === "relation").length
    }
  });
  if (payloadBytes(overview) > limits.overviewBytes) throw new Error(`Evidence overview exceeds ${limits.overviewBytes} bytes`);

  const manifest = {
    schemaVersion: EVIDENCE_SCHEMA_VERSION,
    contentVersion,
    kind: "evidence-manifest",
    routes: {
      overview: "overview.json",
      lookup: directLookup.descriptor.route,
      search: prefixSearch.descriptor.route,
      assertion: "assertions/{shard}.json",
      assertionDetail: "assertions/{shard}/page-{page}.json",
      evidence: "evidence/{shard}.json",
      evidenceDetail: "evidence/{shard}/page-{page}.json"
    },
    overview: { url: "overview.json" },
    lookup: directLookup.descriptor,
    search: prefixSearch.descriptor,
    details: {
      assertion: {
        route: "assertions/{shard}/page-{page}.json",
        pageWidth: PAGE_WIDTH,
        recordLimit: limits.detailPageRecords,
        byteLimit: limits.detailPageBytes,
        previewRecordLimit: limits.previewRecords,
        previewByteLimit: limits.previewBytes
      },
      evidence: {
        route: "evidence/{shard}/page-{page}.json",
        pageWidth: PAGE_WIDTH,
        recordLimit: limits.detailPageRecords,
        byteLimit: limits.detailPageBytes,
        previewRecordLimit: limits.previewRecords,
        previewByteLimit: limits.previewBytes
      }
    },
    limits,
    facets: {
      domains: domainFacet,
      categories: buildFacet(documentAssertions.map((assertion) => assertion.category), limits.overviewDomains),
      statuses: buildFacet(documentAssertions.map((assertion) => assertion.status), limits.overviewDomains),
      sourceKinds: buildFacet(publicEvidence.map((evidence) => evidence.provenance.sourceKind), limits.overviewDomains),
      snapshotStatuses: buildFacet(publicEvidence.map((evidence) => evidence.provenance.snapshotStatus), limits.overviewDomains),
      assertionScopes: { values: [
        { id: "document", count: documentAssertions.length },
        { id: "relation", count: relationAssertions.length }
      ], total: 2, omitted: 0 }
    },
    stats: {
      documentAssertions: documentAssertions.length,
      relationAssertions: relationAssertions.length,
      evidenceDocuments: publicEvidence.length,
      contextEvidenceDocuments: evidenceDocuments.length - publicEvidence.length,
      documentEvidenceLinks: visibleAttestations.filter((item) => item.scope === "document").length,
      relationEvidenceLinks: visibleAttestations.filter((item) => item.scope === "relation").length,
      unlinkedDocuments: documentAssertions.filter((assertion) => assertion.evidenceCount === 0).length,
      lookupRecords: lookupRecords.length,
      lookupShards: directLookup.descriptor.bucketCount,
      searchEntries: prefixSearch.entryCount,
      searchShards: Object.keys(prefixSearch.searchShards).length,
      assertionFocusShards: Object.keys(assertionShards).length,
      assertionDetailPages: Object.keys(assertionDetails).length,
      evidenceFocusShards: Object.keys(evidenceShards).length,
      evidenceDetailPages: Object.keys(evidenceDetails).length
    }
  };
  if (payloadBytes(manifest) > limits.manifestBytes) throw new Error(`Evidence manifest exceeds ${limits.manifestBytes} bytes`);

  return {
    manifest,
    overview,
    lookupShards: directLookup.lookupShards,
    searchShards: prefixSearch.searchShards,
    assertionShards,
    assertionDetails,
    evidenceShards,
    evidenceDetails,
    documentAssertions,
    relationAssertions,
    evidenceDocuments,
    attestations: visibleAttestations
  };
}
