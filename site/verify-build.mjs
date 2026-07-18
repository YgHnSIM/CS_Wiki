import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { historyPeriods, learningPaths } from "./catalog.mjs";
import { ATLAS_LIMITS, ATLAS_SCHEMA_VERSION } from "./graph/atlas.mjs";
import {
  HISTORY_LIMITS,
  HISTORY_LOOKUP_HASH,
  HISTORY_SCHEMA_VERSION,
  historyLookupBucket
} from "./graph/history.mjs";

const root = process.cwd();
const dist = join(root, "dist");
const read = (path) => readFile(join(dist, path), "utf8");
const readBytes = (path) => readFile(join(dist, path));
const payload = JSON.parse(await read(join("data", "learning-map.json")));
const rootHtml = await read(join("map", "learning", "index.html"));
const lines = new Map(payload.lines.map((line) => [line.id, line]));
const lineRank = new Map(payload.lines.map((line, index) => [line.id, index]));

assert.equal(payload.stats.lines, learningPaths.length, "learning line count must match the catalog");
assert.equal(payload.stats.stationOccurrences, payload.memberships.length, "station occurrence count must match memberships");
assert.equal(payload.stats.stations, payload.stations.length, "station count must match the payload");
assert.match(rootHtml, /data-default-station="computing-capability"/, "the root map must use the stable featured station ID");

const dataVersion = rootHtml.match(/learning-map\.json\?v=([a-f0-9]{12})/)?.[1];
const assetVersion = rootHtml.match(/CS_WIKI_ASSET_VERSION="([a-f0-9]{12})"/)?.[1];
assert.ok(dataVersion, "the learning payload URL must be content-versioned");
assert.equal(dataVersion, assetVersion, "the learning payload and page assets must share one content fingerprint");

for (const path of learningPaths) {
  const line = lines.get(path.slug);
  assert.ok(line, `payload is missing learning line '${path.slug}'`);
  const html = await read(join("map", "learning", path.slug, "index.html"));
  assert.match(html, new RegExp(`data-default-line="${path.slug}"`), `static map route must select '${path.slug}'`);
  assert.equal(
    (html.match(/data-learning-station="/g) || []).length,
    line.nodeIds.length,
    `static map route '${path.slug}' must render every station`
  );
  for (const stationId of line.nodeIds) {
    assert.ok(html.includes(`id="station-${stationId}"`), `static map route '${path.slug}' is missing station '${stationId}'`);
  }
}

for (const station of payload.stations) {
  const ranks = payload.memberships
    .filter((membership) => membership.stationId === station.id)
    .map((membership) => lineRank.get(membership.lineId));
  assert.deepEqual(ranks, [...ranks].sort((a, b) => a - b), `transfer order is unstable for '${station.id}'`);
}

for (const attribute of ["data-learning-line", "data-learning-station", "data-learning-adjacent", "data-learning-transfer-line"]) {
  const pattern = new RegExp(`href="([^"]+)" ${attribute}`, "g");
  for (const match of rootHtml.matchAll(pattern)) {
    assert.match(match[1], /\/map\/learning\//, `${attribute} must link to a restorable map state`);
    assert.match(match[1], /#station-/, `${attribute} must retain a no-JS station target`);
  }
}

console.log(`Verified ${payload.stats.lines} learning lines and ${payload.stats.stations} stations in dist`);

const atlasManifestPath = join("data", "atlas", "manifest.json");
const atlasManifest = JSON.parse(await read(atlasManifestPath));
const atlasRootHtml = await read(join("map", "atlas", "index.html"));
const atlasManifestVersion = atlasRootHtml.match(/data-atlas-manifest-url="[^"]*manifest\.json\?v=([a-f0-9]{12})"/)?.[1];
const atlasAssetVersion = atlasRootHtml.match(/CS_WIKI_ASSET_VERSION="([a-f0-9]{12})"/)?.[1];

assert.equal(atlasManifest.schemaVersion, ATLAS_SCHEMA_VERSION, "semantic atlas manifest schema is unsupported");
assert.ok(atlasManifestVersion, "semantic atlas manifest URL must be content-versioned");
assert.equal(atlasManifestVersion, atlasAssetVersion, "semantic atlas data and client assets must share one content fingerprint");
assert.equal(atlasManifest.contentVersion, atlasAssetVersion, "semantic atlas payload version must equal the full build fingerprint");
assert.deepEqual(atlasManifest.limits, ATLAS_LIMITS, "semantic atlas display limits must be explicit in the manifest");

for (const marker of [
  "data-semantic-atlas",
  "data-atlas-controls hidden",
  "data-atlas-search",
  "data-atlas-status",
  "data-atlas-canvas aria-hidden=\"true\"",
  "data-atlas-retry",
  "data-atlas-inspector",
  "data-atlas-node-list",
  "data-atlas-corridor-list"
]) assert.ok(atlasRootHtml.includes(marker), `semantic atlas root is missing '${marker}'`);
assert.match(atlasRootHtml, /<details class="atlas-list-disclosure">/, "semantic atlas needs a progressively disclosed text view");
assert.match(atlasRootHtml, /<noscript>[\s\S]*atlas-static-cluster-list/, "semantic atlas needs a no-JS cluster list");

function cleanAtlasPath(url) {
  assert.equal(typeof url, "string", "semantic atlas shard reference must be a string");
  const path = url.split(/[?#]/, 1)[0].replaceAll("\\", "/");
  const parts = path.split("/");
  let decoded = [];
  try { decoded = parts.map((part) => decodeURIComponent(part)); } catch { decoded = [".."]; }
  assert.ok(path && !path.startsWith("/") && !parts.some((part) => !part) && !decoded.includes("..") && !decoded.includes("."), `unsafe semantic atlas shard reference '${url}'`);
  return join("data", "atlas", ...parts);
}

async function readAtlasPayload(url, label) {
  const path = cleanAtlasPath(url);
  const bytes = await readBytes(path);
  const record = JSON.parse(bytes.toString("utf8"));
  assert.equal(record.schemaVersion, atlasManifest.schemaVersion, `${label} schema version differs from the manifest`);
  assert.equal(record.contentVersion, atlasManifest.contentVersion, `${label} content version differs from the manifest`);
  return { path, bytes, record };
}

function assertUniqueIds(records, label) {
  const ids = records.map((record) => record?.id);
  assert.ok(ids.every(Boolean), `${label} contains a record without an id`);
  assert.equal(new Set(ids).size, ids.length, `${label} contains duplicate ids`);
}

function assertCompleteEdges(record, label, edgeLimit) {
  const nodes = record.nodes || [];
  const edges = record.edges || [];
  const nodeIds = new Set(nodes.map((node) => node.id));
  assertUniqueIds(nodes, `${label} nodes`);
  assertUniqueIds(edges, `${label} edges`);
  assert.ok(edges.length <= edgeLimit, `${label} exceeds its ${edgeLimit}-edge display ceiling`);
  for (const edge of edges) {
    assert.ok(nodeIds.has(edge.source), `${label} edge '${edge.id}' has missing source '${edge.source}'`);
    assert.ok(nodeIds.has(edge.target), `${label} edge '${edge.id}' has missing target '${edge.target}'`);
  }
}

const overviewAsset = await readAtlasPayload(atlasManifest.overview.url, "atlas overview");
const lookupAsset = await readAtlasPayload(atlasManifest.lookup.url, "atlas lookup");
const overview = overviewAsset.record;
const lookup = lookupAsset.record;
assert.ok(overview.nodes.length <= ATLAS_LIMITS.overviewNodes, "atlas overview exceeds its node display ceiling");
assertCompleteEdges(overview, "atlas overview", ATLAS_LIMITS.overviewEdges);
assert.equal(overview.stats.documents, lookup.entries.length, "overview and lookup document counts differ");
assert.equal(atlasManifest.stats.documents, lookup.entries.length, "manifest and lookup document counts differ");
assertUniqueIds(lookup.entries, "atlas lookup entries");

const manifestBytes = await readBytes(atlasManifestPath);
const initialDataBytes = Buffer.concat([manifestBytes, overviewAsset.bytes]);
assert.ok(initialDataBytes.length <= 256 * 1024, `atlas initial data bundle is ${initialDataBytes.length} bytes; limit is 256 KiB`);
assert.ok(gzipSync(initialDataBytes).length <= 75 * 1024, "atlas manifest and overview exceed the 75 KiB compressed first-load budget");
assert.ok(gzipSync(lookupAsset.bytes).length <= 80 * 1024, "lazy atlas lookup exceeds 80 KiB compressed");
const initialClientAssets = await Promise.all([
  "semantic-atlas.js",
  "atlas-renderer.js",
  "atlas-state.js",
  "atlas-worker.js"
].map((name) => readBytes(join("assets", name))));
const initialClientBytes = initialClientAssets.reduce((total, bytes) => total + bytes.length, 0);
assert.ok(initialClientBytes <= 256 * 1024, `atlas client bundle is ${initialClientBytes} bytes; limit is ${256 * 1024}`);
assert.ok(gzipSync(Buffer.concat(initialClientAssets)).length <= 45 * 1024, "atlas client modules exceed the 45 KiB compressed budget");
assert.ok((await readBytes(join("map", "atlas", "index.html"))).length <= 256 * 1024, "atlas root HTML exceeds 256 KiB");

const lookupById = new Map(lookup.entries.map((entry) => [entry.id, entry]));
const clusterIds = new Set(atlasManifest.clusters.map((cluster) => cluster.id));
assertUniqueIds(atlasManifest.clusters, "atlas manifest clusters");
assert.equal(atlasManifest.stats.clusters, atlasManifest.clusters.length, "manifest cluster count is inconsistent");
for (const cluster of atlasManifest.clusters) {
  assert.equal(atlasManifest.clusterShards[cluster.id], cluster.url, `cluster '${cluster.id}' has conflicting shard references`);
  const shard = await readAtlasPayload(cluster.url, `cluster '${cluster.id}'`);
  assert.ok(shard.bytes.length <= 2 * 1024 * 1024, `cluster '${cluster.id}' shard exceeds 2 MiB`);
  assert.ok(gzipSync(shard.bytes).length <= 80 * 1024, `cluster '${cluster.id}' shard exceeds 80 KiB compressed`);
  assert.ok(shard.record.nodes.length <= ATLAS_LIMITS.clusterNodes, `cluster '${cluster.id}' exceeds its node display ceiling`);
  assertCompleteEdges(shard.record, `cluster '${cluster.id}'`, ATLAS_LIMITS.clusterEdges);
  const members = lookup.entries.filter((entry) => entry.clusterId === cluster.id);
  assert.equal(cluster.nodeCount, members.length, `cluster '${cluster.id}' count differs from lookup membership`);
  const route = String(cluster.route || `/map/atlas/${cluster.id}/`).replace(/^\//, "");
  const html = await read(join(route, "index.html"));
  assert.ok(html.includes(`data-default-cluster="${cluster.id}"`), `cluster route '${cluster.id}' is not statically selected`);
  assert.match(html, /<details class="atlas-list-disclosure">/, `cluster route '${cluster.id}' needs a text view`);
  assert.match(html, /<noscript>[\s\S]*atlas-item-list/, `cluster route '${cluster.id}' needs a no-JS document list`);
  for (const document of members) {
    assert.ok(html.includes(`href="${document.url}"`), `cluster route '${cluster.id}' is missing document '${document.id}'`);
  }
  assert.ok(atlasRootHtml.includes(`/map/atlas/${cluster.id}/`), `atlas root is missing cluster route '${cluster.id}'`);
}

assert.equal(atlasManifest.stats.corridors, atlasManifest.corridors.length, "manifest corridor count is inconsistent");
assertUniqueIds(atlasManifest.corridors, "atlas manifest corridors");
for (const corridor of atlasManifest.corridors) {
  assert.ok(clusterIds.has(corridor.source) && clusterIds.has(corridor.target), `corridor '${corridor.id}' references a missing cluster`);
  assert.equal(atlasManifest.corridorShards[corridor.id], corridor.shard, `corridor '${corridor.id}' has conflicting shard references`);
  const shard = await readAtlasPayload(corridor.shard || corridor.url, `corridor '${corridor.id}'`);
  assert.ok(shard.bytes.length <= 256 * 1024, `corridor '${corridor.id}' shard exceeds 256 KiB`);
  assert.ok(gzipSync(shard.bytes).length <= 32 * 1024, `corridor '${corridor.id}' shard exceeds 32 KiB compressed`);
  assert.ok(shard.record.nodes.length <= ATLAS_LIMITS.corridorRelations * 2, `corridor '${corridor.id}' exposes too many endpoint documents`);
  assertCompleteEdges(shard.record, `corridor '${corridor.id}'`, ATLAS_LIMITS.corridorRelations);
}

const focusUrls = new Set();
for (const entry of lookup.entries) {
  assert.ok(clusterIds.has(entry.clusterId), `lookup entry '${entry.id}' references missing cluster '${entry.clusterId}'`);
  const focusUrl = entry.focus?.url;
  assert.equal(atlasManifest.focusShards[entry.id], focusUrl, `lookup and manifest focus references differ for '${entry.id}'`);
  assert.ok(!focusUrls.has(focusUrl), `focus shard '${focusUrl}' is shared instead of remaining bounded per document`);
  focusUrls.add(focusUrl);
  const shard = await readAtlasPayload(focusUrl, `focus '${entry.id}'`);
  assert.ok(shard.bytes.length <= 512 * 1024, `focus '${entry.id}' shard exceeds 512 KiB`);
  assert.ok(gzipSync(shard.bytes).length <= 64 * 1024, `focus '${entry.id}' shard exceeds 64 KiB compressed`);
  const focus = shard.record.records?.[entry.id];
  assert.ok(focus, `focus shard for '${entry.id}' is missing its record`);
  assert.ok(focus.nodes.length <= ATLAS_LIMITS.focusNodes, `focus '${entry.id}' exceeds its node display ceiling`);
  assert.ok(focus.nodes.some((node) => node.id === entry.id && node.focus), `focus '${entry.id}' is not fixed in its shard`);
  assertCompleteEdges(focus, `focus '${entry.id}'`, ATLAS_LIMITS.focusEdges);
}
assert.equal(focusUrls.size, atlasManifest.stats.focusShards, "manifest focus shard count is inconsistent");

const facetKeys = {
  domain: "domains",
  category: "categories",
  status: "statuses",
  historical: "historicalLayers",
  capability: "capabilityLayers"
};
for (const [control, facet] of Object.entries(facetKeys)) {
  const values = atlasManifest.facets[facet] || [];
  const select = atlasRootHtml.match(new RegExp(`<select[^>]*data-atlas-filter="${control}"[^>]*>[\\s\\S]*?<\\/select>`))?.[0] || "";
  assert.ok(select, `atlas root is missing '${control}' facet control`);
  if (!values.length) {
    assert.match(select, /disabled/, `empty '${control}' facet must be disabled`);
    assert.match(select, /메타데이터 없음/, `empty '${control}' facet must explain why it is disabled`);
  } else {
    for (const value of values) assert.ok(select.includes(`value="${value}"`), `'${control}' facet is missing '${value}'`);
  }
}

assert.ok([...lookupById.values()].every((entry) => entry.historicalLayer !== undefined && Array.isArray(entry.capabilityLayers)), "lookup entries must expose semantic facet fields");
console.log(`Verified semantic atlas: ${atlasManifest.stats.clusters} clusters, ${atlasManifest.stats.corridors} corridors, ${atlasManifest.stats.focusShards} bounded focus shards`);

const historyManifestPath = join("data", "history", "manifest.json");
const historyManifest = JSON.parse(await read(historyManifestPath));
const historyRootHtml = await read(join("map", "history", "index.html"));
const historyManifestVersion = historyRootHtml.match(/data-history-manifest-url="[^"]*manifest\.json\?v=([a-f0-9]{12})"/)?.[1];
const historyAssetVersion = historyRootHtml.match(/CS_WIKI_ASSET_VERSION="([a-f0-9]{12})"/)?.[1];

assert.equal(historyManifest.schemaVersion, HISTORY_SCHEMA_VERSION, "historical lens manifest schema is unsupported");
assert.ok(historyManifestVersion, "historical lens manifest URL must be content-versioned");
assert.equal(historyManifestVersion, historyAssetVersion, "historical lens data and client assets must share one content fingerprint");
assert.equal(historyManifest.contentVersion, historyAssetVersion, "historical lens payload version must equal the full build fingerprint");
assert.deepEqual(historyManifest.limits, HISTORY_LIMITS, "historical lens display limits must be explicit in the manifest");

for (const marker of [
  "data-history-lens",
  "data-history-controls hidden",
  "data-history-search",
  "data-history-search-results",
  "data-history-era",
  "data-history-layer",
  "data-history-capability",
  "data-history-display",
  "data-history-reset",
  "data-history-status",
  "data-history-era-list",
  "data-history-stage",
  "data-history-event-list",
  "data-history-transition-list",
  "data-history-inspector",
  "data-history-error hidden",
  "data-history-retry"
]) assert.ok(historyRootHtml.includes(marker), `historical lens root is missing '${marker}'`);
assert.match(historyRootHtml, /<details class="history-static-disclosure">/, "historical lens needs a progressively disclosed text chronology");
assert.match(historyRootHtml, /<noscript>[\s\S]*history-noscript/, "historical lens needs a no-JS explanation");

function cleanHistoryPath(url) {
  assert.equal(typeof url, "string", "historical lens shard reference must be a string");
  const path = url.split(/[?#]/, 1)[0].replaceAll("\\", "/");
  const parts = path.split("/");
  let decoded = [];
  try { decoded = parts.map((part) => decodeURIComponent(part)); } catch { decoded = [".."]; }
  assert.ok(
    path
      && !path.startsWith("/")
      && !parts.some((part) => !part)
      && decoded.every((part) => /^[a-z0-9][a-z0-9._-]*$/.test(part)),
    `unsafe historical lens shard reference '${url}'`
  );
  return join("data", "history", ...parts);
}

function cleanHistoryRoute(route) {
  assert.equal(typeof route, "string", "historical lens route must be a string");
  const path = route.split(/[?#]/, 1)[0].replaceAll("\\", "/");
  const parts = path.split("/").filter(Boolean);
  const interior = path.slice(1, -1).split("/");
  let decoded = [];
  try { decoded = parts.map((part) => decodeURIComponent(part)); } catch { decoded = [".."]; }
  assert.ok(
    path.startsWith("/map/history/")
      && path.endsWith("/")
      && !interior.some((part) => !part)
      && decoded.every((part) => /^[a-z0-9][a-z0-9._-]*$/.test(part)),
    `unsafe historical lens route '${route}'`
  );
  return join(...parts, "index.html");
}

async function readHistoryPayload(url, label) {
  const path = cleanHistoryPath(url);
  const bytes = await readBytes(path);
  const record = JSON.parse(bytes.toString("utf8"));
  assert.equal(record.schemaVersion, historyManifest.schemaVersion, `${label} schema version differs from the manifest`);
  assert.equal(record.contentVersion, historyManifest.contentVersion, `${label} content version differs from the manifest`);
  return { path, bytes, record };
}

const historyOverviewAsset = await readHistoryPayload(historyManifest.overview.url, "history overview");
const historyOverview = historyOverviewAsset.record;
const historyManifestBytes = await readBytes(historyManifestPath);
const historyInitialData = Buffer.concat([historyManifestBytes, historyOverviewAsset.bytes]);
assert.ok(historyInitialData.length <= 256 * 1024, `history initial data bundle is ${historyInitialData.length} bytes; limit is 256 KiB`);
assert.ok(gzipSync(historyInitialData).length <= 60 * 1024, "history manifest and overview exceed the 60 KiB compressed first-load budget");

const historyLookupDescriptor = historyManifest.lookup;
assert.equal(historyLookupDescriptor?.kind, "sharded", "history lookup must use bounded deterministic shards");
assert.equal(historyLookupDescriptor.hash, HISTORY_LOOKUP_HASH, "history lookup descriptor uses an unsupported hash contract");
assert.equal(historyManifest.routes.lookup, historyLookupDescriptor.route, "history lookup route differs from the manifest route contract");
assert.equal(historyLookupDescriptor.route, "lookup/bucket-{bucket}.json", "history lookup route template is unsupported");
assert.equal(historyLookupDescriptor.recordLimit, HISTORY_LIMITS.lookupShardRecords, "history lookup record ceiling differs from the declared limit");
assert.ok(
  Number.isSafeInteger(historyLookupDescriptor.bucketCount)
    && historyLookupDescriptor.bucketCount > 0
    && historyLookupDescriptor.bucketCount <= 0x40000000
    && (historyLookupDescriptor.bucketCount & (historyLookupDescriptor.bucketCount - 1)) === 0,
  "history lookup bucket count must be a positive power of two"
);
assert.equal(
  historyLookupDescriptor.bucketWidth,
  String(historyLookupDescriptor.bucketCount - 1).length,
  "history lookup bucket width must be the canonical zero-padding width"
);

const historyTransitionDetailDescriptor = historyManifest.transitionDetails;
assert.equal(historyTransitionDetailDescriptor?.kind, "paginated", "history transition details must use bounded pagination");
assert.equal(historyManifest.routes.transitionDetail, historyTransitionDetailDescriptor.route, "history transition detail route differs from the manifest route contract");
assert.equal(historyTransitionDetailDescriptor.route, "transitions/{transition}/page-{page}.json", "history transition detail route template is unsupported");
assert.equal(historyTransitionDetailDescriptor.pageWidth, 4, "history transition detail pages must use stable four-digit addresses");
assert.equal(historyTransitionDetailDescriptor.recordLimit, HISTORY_LIMITS.transitionDetailItems, "history transition detail record ceiling differs from the declared limit");
assert.equal(historyTransitionDetailDescriptor.byteLimit, HISTORY_LIMITS.transitionDetailBytes, "history transition detail byte ceiling differs from the declared limit");
assert.equal(historyTransitionDetailDescriptor.previewItemLimit, HISTORY_LIMITS.transitionPreviewItems, "history transition preview ceiling differs from the declared limit");
assert.equal(historyTransitionDetailDescriptor.summaryByteLimit, HISTORY_LIMITS.transitionSummaryBytes, "history transition summary byte ceiling differs from the declared limit");
for (const field of ["paginatedCount", "shardCount"]) {
  assert.ok(Number.isSafeInteger(historyTransitionDetailDescriptor[field]) && historyTransitionDetailDescriptor[field] >= 0, `history transition detail '${field}' must be a non-negative integer`);
}

const historyLookupEntries = [];
const historyLookupTransitions = [];
for (let index = 0; index < historyLookupDescriptor.bucketCount; index += 1) {
  const bucketId = String(index).padStart(historyLookupDescriptor.bucketWidth, "0");
  const bucketUrl = historyLookupDescriptor.route.replace("{bucket}", bucketId);
  assert.equal(bucketUrl.includes("{"), false, `history lookup bucket '${bucketId}' has an unresolved route template`);
  const bucketAsset = await readHistoryPayload(bucketUrl, `history lookup bucket '${bucketId}'`);
  const bucket = bucketAsset.record;
  assert.ok(bucketAsset.bytes.length <= 192 * 1024, `history lookup bucket '${bucketId}' exceeds 192 KiB`);
  assert.ok(gzipSync(bucketAsset.bytes).length <= 48 * 1024, `history lookup bucket '${bucketId}' exceeds 48 KiB compressed`);
  assert.equal(bucket.kind, "history-lookup-shard", `history lookup bucket '${bucketId}' has an unsupported payload kind`);
  assert.equal(bucket.id, bucketId, `history lookup bucket '${bucketId}' payload has another id`);
  assert.deepEqual(bucket.bucket, {
    id: bucketId,
    index,
    bucketCount: historyLookupDescriptor.bucketCount,
    bucketWidth: historyLookupDescriptor.bucketWidth,
    hash: historyLookupDescriptor.hash
  }, `history lookup bucket '${bucketId}' metadata differs from its descriptor`);
  assert.ok(Array.isArray(bucket.entries), `history lookup bucket '${bucketId}' is missing entries`);
  assert.ok(Array.isArray(bucket.transitions), `history lookup bucket '${bucketId}' is missing transitions`);
  const records = [...bucket.entries, ...bucket.transitions];
  assert.equal(bucket.stats?.records, records.length, `history lookup bucket '${bucketId}' record count is inconsistent`);
  assert.equal(bucket.stats?.documents, bucket.entries.length, `history lookup bucket '${bucketId}' document count is inconsistent`);
  assert.equal(bucket.stats?.transitions, bucket.transitions.length, `history lookup bucket '${bucketId}' transition count is inconsistent`);
  assert.ok(records.length <= HISTORY_LIMITS.lookupShardRecords, `history lookup bucket '${bucketId}' exceeds its ${HISTORY_LIMITS.lookupShardRecords}-record ceiling`);
  assertUniqueIds(bucket.entries, `history lookup bucket '${bucketId}' entries`);
  assertUniqueIds(bucket.transitions, `history lookup bucket '${bucketId}' transitions`);
  for (const record of records) {
    const expectedBucket = historyLookupBucket(
      record.id,
      historyLookupDescriptor.bucketCount,
      historyLookupDescriptor.bucketWidth
    );
    assert.equal(expectedBucket.id, bucketId, `history record '${record.id}' is stored in bucket '${bucketId}' instead of '${expectedBucket.id}'`);
    assert.equal(expectedBucket.index, index, `history record '${record.id}' has a conflicting bucket index`);
  }
  historyLookupEntries.push(...bucket.entries);
  historyLookupTransitions.push(...bucket.transitions);
}

const historyClientAssets = await Promise.all([
  "history-lens.js",
  "history-state.js"
].map((name) => readBytes(join("assets", name))));
const historyClientBytes = historyClientAssets.reduce((total, bytes) => total + bytes.length, 0);
assert.ok(historyClientBytes <= 256 * 1024, `history client bundle is ${historyClientBytes} bytes; limit is 256 KiB`);
assert.ok(gzipSync(Buffer.concat(historyClientAssets)).length <= 40 * 1024, "history client modules exceed the 40 KiB compressed budget");
const historyLensClientSource = historyClientAssets[0].toString("utf8");
assert.ok(historyLensClientSource.includes("historyLoadTransition"), "history client must expose a lazy transition-detail control in the inspector");
assert.ok(historyLensClientSource.includes("historyDetailPage") && historyLensClientSource.includes("[data-history-detail-page]"), "history client must expose page-by-page transition detail navigation");
assert.ok((await readBytes(join("map", "history", "index.html"))).length <= 256 * 1024, "historical lens root HTML exceeds 256 KiB");

assertUniqueIds(historyManifest.periods, "history manifest periods");
assertUniqueIds(historyManifest.lanes, "history manifest lanes");
assertUniqueIds(historyManifest.shards, "history manifest shards");
assertUniqueIds(historyLookupEntries, "history lookup entries across all buckets");
assertUniqueIds(historyLookupTransitions, "history lookup transitions across all buckets");
assert.equal(
  new Set([...historyLookupEntries, ...historyLookupTransitions].map((record) => record.id)).size,
  historyLookupEntries.length + historyLookupTransitions.length,
  "history lookup entry and transition ids must not collide"
);
assert.deepEqual(
  historyManifest.periods.map((period) => period.id),
  historyPeriods.map((period) => period.id),
  "historical lens periods differ from the editorial catalog"
);
for (const expected of historyPeriods) {
  const period = historyManifest.periods.find((candidate) => candidate.id === expected.id);
  assert.equal(period.start, expected.start, `period '${expected.id}' start differs from the catalog`);
  assert.equal(period.end, expected.end, `period '${expected.id}' end differs from the catalog`);
  assert.equal(period.title, expected.title, `period '${expected.id}' title differs from the catalog`);
  assert.equal(period.question, expected.question, `period '${expected.id}' question differs from the catalog`);
  assert.equal(Boolean(period.undated), Boolean(expected.undated), `period '${expected.id}' undated status differs from the catalog`);
}

const historyPeriodIds = new Set(historyManifest.periods.map((period) => period.id));
const historyLaneIds = historyManifest.lanes.map((lane) => lane.id);
const historyLaneIdSet = new Set(historyLaneIds);
const historyShardById = new Map(historyManifest.shards.map((record) => [record.id, record]));
const historyLookupById = new Map(historyLookupEntries.map((entry) => [entry.id, entry]));
const historyTransitionById = new Map(historyLookupTransitions.map((transition) => [transition.id, transition]));
const historyPrimaryOccurrences = new Map(historyLookupEntries.map((entry) => [entry.id, 0]));
const historyTransitionKinds = new Set(["responds_to", "enables", "precedes", "constrains"]);
const transitionCompleteness = new Set(["complete", "partial"]);

function historyRoleItems(role) {
  return Array.isArray(role) ? role : role?.id ? [role] : [];
}

function historyTransitionRoleOrder(transition) {
  if (transition.type === "response" || transition.type === "enablement") return ["limitation", "response", "capability"];
  if (transition.type === "precedes") return ["before", "after"];
  if (transition.type === "constraint") return ["constraint", "constrained"];
  return Object.keys(transition.roles || {}).sort();
}

function historyTransitionEdgeRoles(transition, edge) {
  if (transition.type === "response" || transition.type === "enablement") {
    if (edge.kind === "responds_to") return { sourceRole: "response", targetRole: "limitation" };
    if (edge.kind === "enables") return { sourceRole: "response", targetRole: "capability" };
    return null;
  }
  if (transition.type === "precedes" && edge.kind === "precedes") return { sourceRole: "before", targetRole: "after" };
  if (transition.type === "constraint" && edge.kind === "constrains") return { sourceRole: "constraint", targetRole: "constrained" };
  return null;
}

function assertHistoryEdge(edge, label) {
  assert.ok(historyTransitionKinds.has(edge.kind), `${label} exposes uncurated edge kind '${edge.kind}'`);
  assert.equal(edge.directed, true, `${label} must retain its directed relation`);
  assert.deepEqual(edge.direction, { from: edge.source, to: edge.target }, `${label} lost its direction`);
  assert.ok(Object.hasOwn(edge, "note"), `${label} lost its primary note field`);
  assert.ok(Array.isArray(edge.notes), `${label} lost its note list`);
  assert.ok(Array.isArray(edge.evidence), `${label} lost its evidence list`);
  assert.ok(edge.notes.length, `${label} needs its reviewed relationship note`);
  assert.ok(edge.evidence.length, `${label} needs its reviewed evidence reference`);
  assert.equal(edge.note, edge.notes[0] || null, `${label} primary note differs from its note list`);
  assert.ok(edge.chronology && typeof edge.chronology === "object", `${label} lost chronology metadata`);
  assert.ok(Object.hasOwn(edge.chronology, "sourceYear") && Object.hasOwn(edge.chronology, "targetYear"), `${label} chronology lost endpoint years`);
}

function assertHistoryTransition(transition, label, roleNodeIds = null) {
  assert.ok(transition?.id, `${label} is missing an id`);
  assert.equal(transition.kind, "transition", `${label} has an unsupported record kind`);
  assert.ok(transitionCompleteness.has(transition.completeness), `${label} has invalid completeness '${transition.completeness}'`);
  assert.ok(Array.isArray(transition.roleNodeIds) && transition.roleNodeIds.length, `${label} needs at least one role node`);
  assert.equal(new Set(transition.roleNodeIds).size, transition.roleNodeIds.length, `${label} contains duplicate role node ids`);
  const roleRecords = Object.values(transition.roles || {}).flatMap((role) => Array.isArray(role) ? role : role ? [role] : []);
  const rolesByNode = new Map();
  for (const role of historyTransitionRoleOrder(transition)) {
    for (const record of historyRoleItems(transition.roles?.[role])) {
      if (!rolesByNode.has(record.id)) rolesByNode.set(record.id, new Set());
      rolesByNode.get(record.id).add(role);
    }
  }
  assert.deepEqual(
    [...new Set(roleRecords.map((record) => record.id))].sort(),
    [...transition.roleNodeIds].sort(),
    `${label} role records differ from its role node index`
  );
  for (const roleId of transition.roleNodeIds) {
    assert.ok(historyLookupById.has(roleId), `${label} references missing role node '${roleId}'`);
    if (roleNodeIds) assert.ok(roleNodeIds.has(roleId), `${label} role node '${roleId}' is absent from its shard context`);
  }
  assert.ok(Array.isArray(transition.edges) && transition.edges.length, `${label} needs at least one curated edge`);
  assertUniqueIds(transition.edges, `${label} edges`);
  for (const edge of transition.edges) {
    assert.ok(transition.roleNodeIds.includes(edge.source), `${label} edge '${edge.id}' source is not a role node`);
    assert.ok(transition.roleNodeIds.includes(edge.target), `${label} edge '${edge.id}' target is not a role node`);
    const expected = historyTransitionEdgeRoles(transition, edge);
    assert.ok(expected, `${label} edge '${edge.id}' kind '${edge.kind}' is incompatible with transition type '${transition.type}'`);
    assert.ok(rolesByNode.get(edge.source)?.has(expected.sourceRole), `${label} edge '${edge.id}' source is not recorded as '${expected.sourceRole}'`);
    assert.ok(rolesByNode.get(edge.target)?.has(expected.targetRole), `${label} edge '${edge.id}' target is not recorded as '${expected.targetRole}'`);
    assertHistoryEdge(edge, `${label} edge '${edge.id}'`);
  }
  for (const periodId of transition.primaryPeriodIds || []) assert.ok(historyPeriodIds.has(periodId), `${label} references missing primary period '${periodId}'`);
  for (const periodId of transition.periodIds || []) assert.ok(historyPeriodIds.has(periodId), `${label} references missing overlap period '${periodId}'`);
  assert.ok(Array.isArray(transition.lanes) && transition.lanes.every((lane) => historyLaneIdSet.has(lane)), `${label} has an invalid historical lane`);
  assert.ok(Array.isArray(transition.capabilityLayers), `${label} lost capability layers`);
}

function historySummaryRoleRecords(transition) {
  return historyTransitionRoleOrder(transition).flatMap((role) => (
    historyRoleItems(transition.roles?.[role]).map((record) => ({ role, ...record }))
  ));
}

function historyPreviewTextMatches(full, preview) {
  const complete = String(full ?? "");
  const compact = String(preview ?? "");
  return complete === compact || (compact.endsWith("…") && complete.startsWith(compact.slice(0, -1)));
}

function expectedHistoryTransitionId(prefix, value) {
  return `${prefix}-${createHash("sha256").update(String(value)).digest("hex").slice(0, 16)}`;
}

function assertHistoryTransitionSummary(transition, label) {
  const bytes = Buffer.byteLength(JSON.stringify(transition));
  assert.ok(bytes <= historyTransitionDetailDescriptor.summaryByteLimit, `${label} is ${bytes} bytes; transition summaries must stay within ${historyTransitionDetailDescriptor.summaryByteLimit} bytes`);
  assert.ok(transition.preview && typeof transition.preview === "object", `${label} is missing preview metadata`);
  assert.equal(transition.preview.edgeCount, transition.edges.length, `${label} preview edge count differs from its inline edges`);
  assert.equal(transition.preview.roleNodeCount, historySummaryRoleRecords(transition).length, `${label} preview role count differs from its inline roles`);
  assert.equal(transition.roleNodeCount >= transition.preview.roleNodeCount, true, `${label} full role count is smaller than its preview`);
  assert.equal(transition.edgeCount >= transition.preview.edgeCount, true, `${label} full edge count is smaller than its preview`);
  if (transition.detail) {
    assert.equal(transition.preview.truncated, true, `${label} with external details must identify its preview as truncated`);
    assert.equal(transition.detail.truncated, true, `${label} detail descriptor must identify truncation`);
    assert.ok(transition.edges.length <= historyTransitionDetailDescriptor.previewItemLimit, `${label} exposes too many preview edges`);
  } else {
    assert.equal(transition.preview.truncated, false, `${label} without external details must be a complete inline summary`);
    assert.equal(transition.roleNodeCount, transition.preview.roleNodeCount, `${label} inline role count is inconsistent`);
    assert.equal(transition.edgeCount, transition.preview.edgeCount, `${label} inline edge count is inconsistent`);
  }
}

const historyNodeTransitionIds = new Map();
for (const [index, transition] of historyLookupTransitions.entries()) {
  const label = `history transition ${index + 1}`;
  assertHistoryTransition(transition, label);
  assertHistoryTransitionSummary(transition, label);
  if (transition.completeness === "complete" && transition.type === "response") {
    assert.ok((transition.roles?.limitation || []).length, `complete response transition '${transition.id}' needs a limitation`);
    assert.ok(transition.roles?.response, `complete response transition '${transition.id}' needs a response`);
    assert.ok((transition.roles?.capability || []).length, `complete response transition '${transition.id}' needs a capability`);
  }

  let sourceRole = "";
  if (transition.type === "response" || transition.type === "enablement") {
    assert.match(transition.id, /^node-transition-[a-f0-9]{16}$/, `node transition '${transition.id}' must use the stable type-neutral id convention`);
    assert.ok(transition.responseId, `node transition '${transition.id}' is missing its response node id`);
    assert.equal(transition.id, expectedHistoryTransitionId("node-transition", transition.responseId), `node transition '${transition.id}' must derive only from its stable response node id`);
    assert.equal(transition.anchorNodeId, transition.responseId, `node transition '${transition.id}' must anchor to its response node`);
    assert.equal(transition.roles?.response?.id, transition.responseId, `node transition '${transition.id}' response role differs from responseId`);
    assert.ok(!historyNodeTransitionIds.has(transition.responseId), `response node '${transition.responseId}' produced more than one node transition`);
    historyNodeTransitionIds.set(transition.responseId, transition.id);
    sourceRole = "response";
  } else if (transition.type === "precedes") {
    assert.match(transition.id, /^precedes-[a-f0-9]{16}$/, `standalone precedes transition '${transition.id}' has an unstable id`);
    assert.equal(transition.id, expectedHistoryTransitionId("precedes", transition.edges[0]?.id), `standalone precedes transition '${transition.id}' must derive from its curated edge id`);
    sourceRole = "before";
  } else if (transition.type === "constraint") {
    assert.match(transition.id, /^constraint-[a-f0-9]{16}$/, `standalone constraint transition '${transition.id}' has an unstable id`);
    assert.equal(transition.id, expectedHistoryTransitionId("constraint", transition.edges[0]?.id), `standalone constraint transition '${transition.id}' must derive from its curated edge id`);
    sourceRole = "constraint";
  }
  const semanticSource = historyRoleItems(transition.roles?.[sourceRole])[0];
  assert.ok(semanticSource?.id, `transition '${transition.id}' is missing its semantic source role '${sourceRole}'`);
  assert.equal(transition.anchorNodeId, semanticSource.id, `transition '${transition.id}' anchor differs from its semantic source role`);
  const anchorEvent = historyLookupById.get(semanticSource.id);
  assert.ok(anchorEvent, `transition '${transition.id}' anchor references missing event '${semanticSource.id}'`);
  assert.deepEqual(transition.location, anchorEvent.location, `transition '${transition.id}' location differs from its semantic source event`);
  assert.equal(transition.anchorYear, anchorEvent.time.anchorYear, `transition '${transition.id}' year differs from its semantic source event`);
}

const historyTransitionDetailsById = new Map();
let historyTransitionDetailShardCount = 0;
let historyPaginatedTransitionCount = 0;
for (const transition of historyLookupTransitions) {
  if (!transition.detail) continue;
  historyPaginatedTransitionCount += 1;
  const label = `paginated transition '${transition.id}'`;
  const detail = transition.detail;
  assert.equal(detail.kind, "paginated", `${label} has an unsupported detail kind`);
  assert.equal(detail.route, historyTransitionDetailDescriptor.route.replace("{transition}", transition.id), `${label} route differs from the manifest template`);
  assert.equal(detail.pageWidth, historyTransitionDetailDescriptor.pageWidth, `${label} page width differs from the manifest descriptor`);
  assert.equal(detail.recordLimit, historyTransitionDetailDescriptor.recordLimit, `${label} record limit differs from the manifest descriptor`);
  assert.equal(detail.byteLimit, historyTransitionDetailDescriptor.byteLimit, `${label} byte limit differs from the manifest descriptor`);
  assert.ok(Number.isSafeInteger(detail.pageCount) && detail.pageCount > 0, `${label} needs at least one detail page`);
  assert.equal(detail.itemCount, detail.roleNodeCount + detail.edgeCount, `${label} item count does not cover roles and edges`);
  assert.equal(detail.roleNodeCount, transition.roleNodeCount, `${label} role count differs from its summary`);
  assert.equal(detail.edgeCount, transition.edgeCount, `${label} edge count differs from its summary`);

  const roleRecords = [];
  const edges = [];
  for (let pageNumber = 1; pageNumber <= detail.pageCount; pageNumber += 1) {
    const pageId = String(pageNumber).padStart(detail.pageWidth, "0");
    const pageUrl = detail.route.replace("{page}", pageId);
    assert.equal(pageUrl.includes("{"), false, `${label} page ${pageNumber} has an unresolved route template`);
    const pageAsset = await readHistoryPayload(pageUrl, `${label} page ${pageNumber}`);
    const page = pageAsset.record;
    historyTransitionDetailShardCount += 1;
    assert.ok(pageAsset.bytes.length <= 64 * 1024, `${label} page ${pageNumber} exceeds 64 KiB`);
    assert.ok(gzipSync(pageAsset.bytes).length <= 48 * 1024, `${label} page ${pageNumber} exceeds 48 KiB compressed`);
    assert.equal(page.kind, "history-transition-detail-page", `${label} page ${pageNumber} has an unsupported payload kind`);
    assert.equal(page.id, `${transition.id}--page-${pageId}`, `${label} page ${pageNumber} has an unstable id`);
    assert.equal(page.transitionId, transition.id, `${label} page ${pageNumber} references another transition`);
    assert.equal(page.page, pageNumber, `${label} detail pages are not contiguous`);
    assert.equal(page.pageCount, detail.pageCount, `${label} page ${pageNumber} has a conflicting page count`);
    assert.ok(Array.isArray(page.roleNodes), `${label} page ${pageNumber} is missing role records`);
    assert.ok(Array.isArray(page.edges), `${label} page ${pageNumber} is missing edges`);
    assert.equal(page.stats?.records, page.roleNodes.length + page.edges.length, `${label} page ${pageNumber} record count is inconsistent`);
    assert.equal(page.stats?.roleNodes, page.roleNodes.length, `${label} page ${pageNumber} role count is inconsistent`);
    assert.equal(page.stats?.edges, page.edges.length, `${label} page ${pageNumber} edge count is inconsistent`);
    assert.equal(page.stats?.totalRecords, detail.itemCount, `${label} page ${pageNumber} total record count differs from its summary`);
    assert.equal(page.stats?.totalRoleNodes, detail.roleNodeCount, `${label} page ${pageNumber} total role count differs from its summary`);
    assert.equal(page.stats?.totalEdges, detail.edgeCount, `${label} page ${pageNumber} total edge count differs from its summary`);
    assert.ok(page.stats.records <= 48, `${label} page ${pageNumber} exceeds the 48-record display ceiling`);
    assert.ok(page.stats.records <= detail.recordLimit, `${label} page ${pageNumber} exceeds its declared record ceiling`);
    roleRecords.push(...page.roleNodes);
    edges.push(...page.edges);
  }

  const roleKeys = roleRecords.map((record) => `${record.role}\u0000${record.id}`);
  assert.ok(roleRecords.every((record) => record.role && record.id), `${label} contains a role record without role or id`);
  assert.equal(new Set(roleKeys).size, roleKeys.length, `${label} repeats a role record across detail pages`);
  assert.equal(roleRecords.length, detail.roleNodeCount, `${label} detail pages do not contain every role record exactly once`);
  assertUniqueIds(edges, `${label} edges across all detail pages`);
  assert.equal(edges.length, detail.edgeCount, `${label} detail pages do not contain every edge exactly once`);
  assert.equal(roleRecords.length + edges.length, detail.itemCount, `${label} detail pages do not contain every declared item exactly once`);

  const rolesByNode = new Map();
  for (const record of roleRecords) {
    if (!rolesByNode.has(record.id)) rolesByNode.set(record.id, new Set());
    rolesByNode.get(record.id).add(record.role);
    assert.ok(historyLookupById.has(record.id), `${label} role '${record.role}' references missing event '${record.id}'`);
  }
  const detailedEdgeById = new Map(edges.map((edge) => [edge.id, edge]));
  for (const edge of edges) {
    assertHistoryEdge(edge, `${label} edge '${edge.id}'`);
    const expected = historyTransitionEdgeRoles(transition, edge);
    assert.ok(expected, `${label} edge '${edge.id}' kind '${edge.kind}' is incompatible with transition type '${transition.type}'`);
    assert.ok(rolesByNode.get(edge.source)?.has(expected.sourceRole), `${label} edge '${edge.id}' source '${edge.source}' is not recorded as '${expected.sourceRole}'`);
    assert.ok(rolesByNode.get(edge.target)?.has(expected.targetRole), `${label} edge '${edge.id}' target '${edge.target}' is not recorded as '${expected.targetRole}'`);
  }
  for (const previewEdge of transition.edges) {
    const detailedEdge = detailedEdgeById.get(previewEdge.id);
    assert.ok(detailedEdge, `${label} preview edge '${previewEdge.id}' is absent from its detail pages`);
    assert.equal(previewEdge.kind, detailedEdge.kind, `${label} preview edge '${previewEdge.id}' changed relation kind`);
    assert.equal(previewEdge.source, detailedEdge.source, `${label} preview edge '${previewEdge.id}' changed source`);
    assert.equal(previewEdge.target, detailedEdge.target, `${label} preview edge '${previewEdge.id}' changed target`);
    assert.deepEqual(previewEdge.direction, detailedEdge.direction, `${label} preview edge '${previewEdge.id}' changed direction`);
    assert.deepEqual(previewEdge.chronology, detailedEdge.chronology, `${label} preview edge '${previewEdge.id}' changed chronology`);
    assert.equal(previewEdge.noteCount, detailedEdge.notes.length, `${label} preview edge '${previewEdge.id}' lost its note count`);
    assert.equal(previewEdge.evidenceCount, detailedEdge.evidence.length, `${label} preview edge '${previewEdge.id}' lost its evidence count`);
    assert.ok(historyPreviewTextMatches(detailedEdge.note, previewEdge.note), `${label} preview edge '${previewEdge.id}' does not preserve its primary note prefix`);
    assert.ok(previewEdge.notes.every((note, index) => historyPreviewTextMatches(detailedEdge.notes[index], note)), `${label} preview edge '${previewEdge.id}' does not preserve its note prefix`);
    assert.ok(previewEdge.evidence.every((evidence) => detailedEdge.evidence.includes(evidence)), `${label} preview edge '${previewEdge.id}' references evidence absent from its detail page`);
  }
  for (const roleRecord of historySummaryRoleRecords(transition)) {
    assert.ok(rolesByNode.get(roleRecord.id)?.has(roleRecord.role), `${label} preview role '${roleRecord.role}:${roleRecord.id}' is absent from its detail pages`);
  }
  historyTransitionDetailsById.set(transition.id, { roleRecords, edges });
}

assert.equal(historyPaginatedTransitionCount, historyTransitionDetailDescriptor.paginatedCount, "history transition paginated count differs from its descriptor");
assert.equal(historyTransitionDetailShardCount, historyTransitionDetailDescriptor.shardCount, "history transition detail shard count differs from its descriptor");
assert.equal(historyTransitionDetailsById.size, historyPaginatedTransitionCount, "history transition detail aggregation missed a paginated transition");

function assertHistoryDetailAffordance(html, transition, label) {
  const routeMarker = `data-detail-route="${transition.detail.route}"`;
  const markerIndex = html.indexOf(routeMarker);
  assert.ok(markerIndex >= 0, `${label} is missing the detail reference for '${transition.id}'`);
  const paragraphStart = html.lastIndexOf("<p", markerIndex);
  const paragraphEnd = html.indexOf("</p>", markerIndex);
  assert.ok(paragraphStart >= 0 && paragraphEnd > markerIndex, `${label} has malformed detail affordance for '${transition.id}'`);
  const affordance = html.slice(paragraphStart, paragraphEnd + 4);
  assert.ok(affordance.includes('class="history-transition-truncation"'), `${label} must label '${transition.id}' as a truncated transition`);
  assert.ok(affordance.includes("data-history-transition-detail"), `${label} is missing the no-JS detail affordance for '${transition.id}'`);
  assert.ok(affordance.includes(`data-detail-pages="${transition.detail.pageCount}"`), `${label} exposes the wrong detail page count for '${transition.id}'`);
  assert.ok(affordance.includes(`data-detail-items="${transition.detail.itemCount}"`), `${label} exposes the wrong detail item count for '${transition.id}'`);
  assert.ok(affordance.includes(`data-detail-roles="${transition.detail.roleNodeCount}"`), `${label} exposes the wrong detail role count for '${transition.id}'`);
  assert.ok(affordance.includes(`data-detail-edges="${transition.detail.edgeCount}"`), `${label} exposes the wrong detail edge count for '${transition.id}'`);
  const fallback = historyLookupById.get(transition.anchorNodeId);
  assert.ok(fallback?.url && affordance.includes(`href="${fallback.url}"`), `${label} detail affordance for '${transition.id}' must link to its source relationship document`);
  const fallbackLinks = [...affordance.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
  assert.ok(fallbackLinks.length && fallbackLinks.every((href) => !href.split(/[?#]/, 1)[0].endsWith(".json")), `${label} must not expose raw JSON as the no-JS fallback for '${transition.id}'`);
}

assert.equal(historyManifest.stats.documents, historyLookupEntries.length, "history manifest and lookup document counts differ");
assert.equal(historyManifest.stats.documents, atlasManifest.stats.documents, "historical lens must contain every public atlas document");
assert.deepEqual(
  [...historyLookupById.keys()].sort(),
  [...lookupById.keys()].sort(),
  "historical lens and semantic atlas expose different public documents"
);
assert.equal(historyOverview.stats.documents, historyLookupEntries.length, "history overview and lookup document counts differ");
assert.equal(historyOverview.stats.datedDocuments, historyManifest.stats.datedDocuments, "history overview dated count is inconsistent");
assert.equal(historyOverview.stats.undatedDocuments, historyManifest.stats.undatedDocuments, "history overview undated count is inconsistent");
assert.equal(historyManifest.stats.transitions, historyLookupTransitions.length, "history manifest and lookup transition counts differ");
assert.equal(historyOverview.stats.transitions, historyLookupTransitions.length, "history overview and lookup transition counts differ");
assert.equal(historyManifest.stats.lookupShards, historyLookupDescriptor.bucketCount, "history lookup shard count differs from its descriptor");
assert.equal(historyManifest.stats.paginatedTransitions, historyTransitionDetailDescriptor.paginatedCount, "history paginated transition count differs from its descriptor");
assert.equal(historyManifest.stats.transitionDetailShards, historyTransitionDetailDescriptor.shardCount, "history transition detail shard count differs from its descriptor");
assert.equal(historyManifest.stats.completeTransitions + historyManifest.stats.partialTransitions, historyManifest.stats.transitions, "history completeness counts do not cover every transition");
assert.equal(historyManifest.stats.datedDocuments + historyManifest.stats.undatedDocuments, historyManifest.stats.documents, "dated and undated history counts do not cover every document");
assert.equal(historyManifest.stats.eventDocuments + historyManifest.stats.publicationDocuments, historyManifest.stats.datedDocuments, "dated history subtypes do not cover every dated document");
assert.equal(historyManifest.stats.periods, historyManifest.periods.length, "history period count is inconsistent");
assert.equal(historyManifest.stats.lanes, historyManifest.lanes.length, "history lane count is inconsistent");
assert.equal(historyManifest.stats.shards, historyManifest.shards.length, "history shard count is inconsistent");
assert.equal(historyOverview.transitions.length <= HISTORY_LIMITS.overviewTransitions, true, "history overview exposes too many transitions");
for (const transition of historyOverview.transitions) {
  assert.ok(historyTransitionById.has(transition.id), `history overview references missing transition '${transition.id}'`);
  assert.deepEqual(transition, historyTransitionById.get(transition.id), `history overview changed transition '${transition.id}'`);
  assertHistoryTransition(transition, `history overview transition '${transition.id}'`);
  assertHistoryTransitionSummary(transition, `history overview transition '${transition.id}'`);
  if (transition.detail?.truncated) assertHistoryDetailAffordance(historyRootHtml, transition, "history overview route");
}

const periodCountsFromLookup = new Map(historyManifest.periods.map((period) => [period.id, 0]));
let datedFromLookup = 0;
let undatedFromLookup = 0;
for (const entry of historyLookupEntries) {
  assert.ok(entry.id && entry.url, "history lookup entry needs a stable id and document URL");
  assert.ok(entry.time && typeof entry.time === "object", `history lookup entry '${entry.id}' lost time metadata`);
  assert.ok(historyPeriodIds.has(entry.time.primaryPeriodId), `history lookup entry '${entry.id}' references missing primary period '${entry.time.primaryPeriodId}'`);
  assert.ok(historyLaneIdSet.has(entry.lane), `history lookup entry '${entry.id}' has invalid historical lane '${entry.lane}'`);
  assert.ok(Array.isArray(entry.capabilityLayers), `history lookup entry '${entry.id}' lost capability layers`);
  assert.ok(Array.isArray(entry.time.overlapPeriodIds) && entry.time.overlapPeriodIds.includes(entry.time.primaryPeriodId), `history lookup entry '${entry.id}' primary period is absent from its overlaps`);
  assert.ok(entry.location && typeof entry.location === "object", `history lookup entry '${entry.id}' lost its primary shard location`);
  const locatedShard = historyShardById.get(`${entry.location.periodId}--page-${String(entry.location.page).padStart(4, "0")}`);
  assert.ok(locatedShard, `history lookup entry '${entry.id}' references missing page ${entry.location.periodId}/${entry.location.page}`);
  assert.equal(entry.location.periodId, entry.time.primaryPeriodId, `history lookup entry '${entry.id}' location differs from its primary period`);
  assert.equal(entry.location.shard, locatedShard.url, `history lookup entry '${entry.id}' location differs from its shard URL`);
  periodCountsFromLookup.set(entry.time.primaryPeriodId, periodCountsFromLookup.get(entry.time.primaryPeriodId) + 1);
  if (entry.time.status === "undated") {
    undatedFromLookup += 1;
    assert.equal(entry.time.primaryPeriodId, "undated", `undated entry '${entry.id}' escaped the undated period`);
    assert.equal(entry.time.anchorYear, null, `undated entry '${entry.id}' must not infer a year`);
  } else {
    datedFromLookup += 1;
    assert.notEqual(entry.time.primaryPeriodId, "undated", `dated entry '${entry.id}' is misplaced in the undated period`);
    assert.equal(Number.isInteger(entry.time.anchorYear), true, `dated entry '${entry.id}' needs an integer anchor year`);
  }
}
assert.equal(datedFromLookup, historyManifest.stats.datedDocuments, "dated history count differs from lookup metadata");
assert.equal(undatedFromLookup, historyManifest.stats.undatedDocuments, "undated history count differs from lookup metadata");
assert.ok(undatedFromLookup > 0, "historical lens must preserve an explicit undated lane instead of inferring years");

for (const period of historyManifest.periods) {
  assert.equal(periodCountsFromLookup.get(period.id), period.eventCount, `period '${period.id}' count differs from primary lookup membership`);
  assert.equal(Object.keys(period.laneCounts).length, historyManifest.lanes.length, `period '${period.id}' lane counts are incomplete`);
  assert.equal(Object.values(period.laneCounts).reduce((sum, count) => sum + count, 0), period.eventCount, `period '${period.id}' lane counts do not cover its documents`);
  for (const lane of historyManifest.lanes) assert.ok(Object.hasOwn(period.laneCounts, lane.id), `period '${period.id}' is missing lane '${lane.id}'`);
  assert.equal(historyLookupEntries.filter((entry) => entry.time.overlapPeriodIds.includes(period.id)).length, period.overlapCount, `period '${period.id}' overlap count is inconsistent`);
  assert.equal(historyLookupTransitions.filter((transition) => transition.periodIds.includes(period.id)).length, period.transitionCount, `period '${period.id}' transition count is inconsistent`);
  assert.equal(period.shards.length, period.pageCount, `period '${period.id}' page and shard counts differ`);
  const pageRecords = historyManifest.shards.filter((record) => record.periodId === period.id).sort((left, right) => left.page - right.page);
  assert.deepEqual(pageRecords.map((record) => record.page), Array.from({ length: period.pageCount }, (_, index) => index + 1), `period '${period.id}' shard pages are not contiguous`);
  assert.deepEqual(pageRecords.map((record) => record.url), period.shards, `period '${period.id}' shard order is inconsistent`);
  assert.deepEqual(historyManifest.periodShards[period.id], period.shards, `period '${period.id}' has conflicting shard references`);
  assert.equal(historyManifest.eraShards[period.id], period.shards[0], `period '${period.id}' has a conflicting first-shard reference`);
  const overviewPeriod = historyOverview.periods.find((candidate) => candidate.id === period.id);
  assert.ok(overviewPeriod, `history overview is missing period '${period.id}'`);
  assert.equal(overviewPeriod.eventCount, period.eventCount, `history overview period '${period.id}' has a conflicting count`);
  assert.ok(overviewPeriod.sampleEvents.length <= HISTORY_LIMITS.overviewSamplesPerPeriod, `history overview period '${period.id}' exposes too many sample events`);
  for (const sample of overviewPeriod.sampleEvents) {
    assert.ok(historyLookupById.has(sample.id), `history overview period '${period.id}' references missing sample '${sample.id}'`);
    assert.equal(historyLookupById.get(sample.id).time.primaryPeriodId, period.id, `history overview sample '${sample.id}' belongs to another period`);
  }
}

for (const record of historyManifest.shards) {
  assert.ok(historyPeriodIds.has(record.periodId), `history shard '${record.id}' references missing period '${record.periodId}'`);
  assert.equal(record.id, `${record.periodId}--page-${String(record.page).padStart(4, "0")}`, `history shard '${record.id}' has an unstable id`);
  assert.equal(historyManifest.partShards[record.id], record.url, `history shard '${record.id}' has conflicting part reference`);
  assert.ok(historyManifest.periodShards[record.periodId].includes(record.url), `history shard '${record.id}' is absent from its period references`);
  const shardAsset = await readHistoryPayload(record.url, `history shard '${record.id}'`);
  assert.ok(shardAsset.bytes.length <= 512 * 1024, `history shard '${record.id}' exceeds 512 KiB`);
  assert.ok(gzipSync(shardAsset.bytes).length <= 96 * 1024, `history shard '${record.id}' exceeds 96 KiB compressed`);
  const shard = shardAsset.record;
  assert.equal(shard.id, record.id, `history shard '${record.id}' payload has another id`);
  assert.equal(shard.period.id, record.periodId, `history shard '${record.id}' payload has another period`);
  assert.equal(shard.page, record.page, `history shard '${record.id}' payload has another page number`);
  assert.equal(shard.events.length, record.eventCount, `history shard '${record.id}' event count differs from its manifest record`);
  assert.equal(shard.transitions.length, record.transitionCount, `history shard '${record.id}' transition count differs from its manifest record`);
  assert.ok(shard.events.length <= HISTORY_LIMITS.periodPageEvents, `history shard '${record.id}' exceeds its ${HISTORY_LIMITS.periodPageEvents}-event ceiling`);
  assert.ok(shard.transitions.length <= HISTORY_LIMITS.shardTransitions, `history shard '${record.id}' exceeds its ${HISTORY_LIMITS.shardTransitions}-transition ceiling`);
  assertUniqueIds(shard.events, `history shard '${record.id}' events`);
  assertUniqueIds(shard.transitions, `history shard '${record.id}' transitions`);
  assertUniqueIds(shard.roleNodes, `history shard '${record.id}' role nodes`);
  const shardRoleNodeIds = new Set(shard.roleNodes.map((node) => node.id));
  for (const event of shard.events) {
    assert.ok(historyLookupById.has(event.id), `history shard '${record.id}' contains unknown event '${event.id}'`);
    assert.deepEqual(event, historyLookupById.get(event.id), `history shard '${record.id}' changed event '${event.id}'`);
    assert.equal(event.time.primaryPeriodId, record.periodId, `history shard '${record.id}' contains event '${event.id}' from another primary period`);
    assert.deepEqual(event.location, { periodId: record.periodId, page: record.page, shard: record.url }, `history event '${event.id}' has a conflicting location`);
    historyPrimaryOccurrences.set(event.id, historyPrimaryOccurrences.get(event.id) + 1);
  }
  for (const transition of shard.transitions) {
    assert.ok(historyTransitionById.has(transition.id), `history shard '${record.id}' contains unknown transition '${transition.id}'`);
    assert.deepEqual(transition, historyTransitionById.get(transition.id), `history shard '${record.id}' changed transition '${transition.id}'`);
    assertHistoryTransition(transition, `history shard '${record.id}' transition '${transition.id}'`, shardRoleNodeIds);
    assertHistoryTransitionSummary(transition, `history shard '${record.id}' transition '${transition.id}'`);
  }

  const staticHtml = await read(cleanHistoryRoute(record.route));
  assert.ok(staticHtml.includes(`data-default-era="${record.periodId}"`), `history route '${record.route}' does not restore era '${record.periodId}'`);
  assert.ok(staticHtml.includes(`data-default-part="${record.id}"`), `history route '${record.route}' does not restore part '${record.id}'`);
  assert.ok(staticHtml.includes(`data-default-era-path="${record.route}"`), `history route '${record.route}' has a conflicting era path`);
  assert.ok(staticHtml.includes(`data-default-part-path="${record.route}"`), `history route '${record.route}' has a conflicting part path`);
  assert.match(staticHtml, /<details class="history-static-disclosure">/, `history route '${record.route}' needs a text chronology`);
  assert.match(staticHtml, /<noscript>[\s\S]*history-noscript/, `history route '${record.route}' needs a no-JS explanation`);
  for (const event of shard.events) {
    assert.ok(staticHtml.includes(`href="${event.url}"`), `history route '${record.route}' is missing document '${event.id}'`);
  }
  for (const transition of shard.transitions.filter((item) => item.detail?.truncated)) {
    assertHistoryDetailAffordance(staticHtml, transition, `history route '${record.route}'`);
  }
}
for (const [id, occurrences] of historyPrimaryOccurrences) {
  assert.equal(occurrences, 1, `public document '${id}' must occur in exactly one primary history shard, found ${occurrences}`);
}

assert.deepEqual(historyManifest.facets.eras, historyManifest.periods.map((period) => period.id), "history era facet differs from manifest periods");
assert.deepEqual(historyManifest.facets.parts, historyManifest.shards.map((record) => record.id), "history part facet differs from manifest shards");
assert.deepEqual(historyManifest.facets.layers, historyLaneIds, "history layer facet differs from manifest lanes");
assert.deepEqual(historyManifest.facets.displays, ["all", "events", "transitions"], "history display facet is unsupported");
const expectedHistoryCapabilities = [...new Set(historyLookupEntries.flatMap((entry) => entry.capabilityLayers))].sort();
assert.deepEqual(historyManifest.facets.capabilities, expectedHistoryCapabilities, "history capability facet differs from lookup metadata");
const historyControls = {
  era: historyManifest.facets.eras,
  layer: historyManifest.facets.layers,
  capability: historyManifest.facets.capabilities,
  display: historyManifest.facets.displays
};
for (const [control, values] of Object.entries(historyControls)) {
  const select = historyRootHtml.match(new RegExp(`<select[^>]*data-history-${control}[^>]*>[\\s\\S]*?<\\/select>`))?.[0] || "";
  assert.ok(select, `historical lens root is missing '${control}' facet control`);
  for (const value of values) assert.ok(select.includes(`value="${value}"`), `'${control}' facet is missing '${value}'`);
}

console.log(`Verified historical lens: ${historyManifest.stats.documents} public documents, ${historyManifest.stats.transitions} curated transitions, ${historyManifest.stats.shards} bounded shards including ${historyManifest.stats.undatedDocuments} undated documents`);
