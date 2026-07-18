import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { learningPaths } from "./catalog.mjs";
import { ATLAS_LIMITS, ATLAS_SCHEMA_VERSION } from "./graph/atlas.mjs";

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
