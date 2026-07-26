import { loadWikiManifest } from "./wiki_manifest.mjs";

const BROKEN = new Set([404, 410]);
const RESTRICTED = new Set([401, 403, 429]);
const timeoutMs = Number(process.env.WIKI_LINK_TIMEOUT_MS || 15000);
const retries = Number(process.env.WIKI_LINK_RETRIES || 2);

function classify(status) {
  if (BROKEN.has(status)) return "broken";
  if (RESTRICTED.has(status)) return "restricted";
  if (status >= 200 && status < 400) return "ok";
  return "error";
}

async function request(url, method) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method,
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "CS-Wiki-Link-Checker/2.0", accept: "*/*" }
    });
    return { status: response.status, finalUrl: response.url, method };
  } finally {
    clearTimeout(timer);
  }
}

async function check(target) {
  let last = null;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      let result = await request(target.url, "HEAD");
      if ([405, 501, 403, 429].includes(result.status)) result = await request(target.url, "GET");
      const state = classify(result.status);
      if (state === "error" && attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
        continue;
      }
      return { ...target, ...result, state, detail: result.method };
    } catch (error) {
      last = error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
        continue;
      }
    }
  }
  return { ...target, state: "error", status: null, finalUrl: null, detail: last?.message || "request failed" };
}

const manifest = await loadWikiManifest({ root: process.cwd(), strict: true });
const sourcePages = manifest.pages.filter((page) => ["source", "reference"].includes(page.kind));
const publicPages = manifest.pages.filter((page) => page.publicationVisibility === "public" && !["source", "reference"].includes(page.kind));
const usage = new Map(sourcePages.map((page) => [page.id, 0]));
for (const page of publicPages) for (const id of page.evidenceIds) if (usage.has(id)) usage.set(id, usage.get(id) + 1);
const records = new Map();
for (const page of sourcePages) {
  for (const access of page.access || []) {
    if (access.kind !== "url" || !access.url) continue;
    const record = records.get(access.url) || { url: access.url, sources: [], usedBy: 0, snapshotStatus: page.snapshotStatus };
    if (!record.sources.includes(page.id)) record.sources.push(page.id);
    record.usedBy = Math.max(record.usedBy, usage.get(page.id) || 0);
    if (record.snapshotStatus !== page.snapshotStatus) record.snapshotStatus = "mixed";
    records.set(access.url, record);
  }
}
const targets = [...records.values()].sort((a, b) => b.usedBy - a.usedBy || a.url.localeCompare(b.url));
const results = [];
const queue = [...targets];
const workers = Array.from({ length: Math.min(8, queue.length || 1) }, async () => {
  while (queue.length) results.push(await check(queue.shift()));
});
await Promise.all(workers);
results.sort((a, b) => b.usedBy - a.usedBy || a.url.localeCompare(b.url));
if (process.argv.includes("--json")) console.log(JSON.stringify(results, null, 2));
else {
  const counts = Object.fromEntries(["ok", "restricted", "broken", "error"].map((state) => [state, results.filter((r) => r.state === state).length]));
  console.log(`External links: ${results.length} total, ${counts.ok} ok, ${counts.restricted} restricted, ${counts.broken} broken, ${counts.error} transient/error`);
  for (const result of results) console.log(`[${result.state.toUpperCase()}] ${result.status || "-"} used-by=${result.usedBy} snapshot=${result.snapshotStatus} ${result.sources.join(", ")} → ${result.url}`);
}
if (process.argv.includes("--fail-on-broken") && results.some((result) => result.state === "broken")) process.exitCode = 1;
