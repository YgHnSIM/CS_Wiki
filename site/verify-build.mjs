import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { learningPaths } from "./catalog.mjs";

const root = process.cwd();
const dist = join(root, "dist");
const read = (path) => readFile(join(dist, path), "utf8");
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
