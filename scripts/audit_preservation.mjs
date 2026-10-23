import { loadWikiManifest } from "./wiki_manifest.mjs";

const manifest = await loadWikiManifest({ root: process.cwd(), strict: true });
const sources = manifest.pages.filter((page) => ["source", "reference"].includes(page.kind));
const counts = sources.reduce((accumulator, page) => {
  accumulator[page.snapshotStatus] = (accumulator[page.snapshotStatus] || 0) + 1;
  return accumulator;
}, {});
const externalOnly = sources.filter((page) => page.snapshotStatus === "external-only");
const report = {
  total: sources.length,
  local: counts.local || 0,
  archived: counts.archived || 0,
  externalOnly: counts["external-only"] || 0,
  externalOnlyPages: externalOnly.map((page) => ({
    id: page.id,
    title: page.title,
    relativePath: page.relativePath,
    urls: page.access.filter((access) => access.kind === "url" && access.role !== "archive").map((access) => access.url)
  }))
};

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`Preservation: ${report.total} sources, ${report.local} local, ${report.archived} archived, ${report.externalOnly} external-only`);
  for (const page of report.externalOnlyPages) {
    console.log(`EXTERNAL-ONLY ${page.id} ${page.relativePath}`);
  }
}

if (process.argv.includes("--fail-on-external-only") && report.externalOnly > 0) {
  process.exitCode = 1;
}
