import assert from "node:assert/strict";
import { resolve } from "node:path";
import test from "node:test";
import { STYLE_PARTS, loadSiteCss } from "../site/styles/index.mjs";

const projectRoot = resolve(".");

async function siteCss() {
  return loadSiteCss(projectRoot);
}

test("feature CSS modules compose in one deterministic cascade", async () => {
  assert.deepEqual(STYLE_PARTS, [...STYLE_PARTS].sort());
  const css = await siteCss();
  for (const marker of [
    "Document evidence lineage",
    "Document-local relationship channels",
    "Learning-path transit map",
    "Historical causal lens"
  ]) assert.ok(css.includes(marker), `composed stylesheet is missing '${marker}'`);
  assert.ok(css.length > 75_000, "composed stylesheet is unexpectedly small");
});

test("CSS tokens are complete and functional text stays legible", async () => {
  const css = await siteCss();
  const definitions = new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map((match) => match[1]));
  const usages = new Set([...css.matchAll(/var\(\s*(--[\w-]+)/g)].map((match) => match[1]));
  const undefinedTokens = [...usages].filter((name) => !definitions.has(name)).sort();

  assert.deepEqual(undefinedTokens, [], `undefined CSS custom properties: ${undefinedTokens.join(", ")}`);
  assert.doesNotMatch(css, /font-size:\s*(?:8|9|10)px\b/, "functional text must use the shared readable type scale");

  for (const token of [
    "--type-meta",
    "--type-ui",
    "--status-active",
    "--status-review",
    "--status-draft",
    "--status-archived"
  ]) assert.ok(definitions.has(token), `missing shared token ${token}`);
});

test("search and mobile navigation expose one intentional scroll surface", async () => {
  const css = await siteCss();

  assert.match(css, /\.search-dialog\s*\{[^}]*height:\s*min\([^}]*overflow:\s*hidden/s);
  assert.match(css, /\.search-dialog\[open\]\s*\{[^}]*display:\s*flex[^}]*flex-direction:\s*column/s);
  assert.match(css, /\.search-results\s*\{[^}]*min-height:\s*0[^}]*max-height:\s*none[^}]*overflow-y:\s*auto/s);
  assert.match(css, /\.mobile-nav\[open\]\s*\{[^}]*display:\s*grid/s);
  assert.match(css, /\.mobile-nav::backdrop\s*\{/);
  assert.match(css, /\.circuit-node-mobile\s*\{[^}]*display:\s*none/s);
  assert.match(css, /\.home-page \.circuit-node-mobile\s*\{[^}]*display:\s*inline/s);
});

test("filter toolbars keep named, non-ragged responsive grids", async () => {
  const css = await siteCss();

  for (const selector of [
    ".listing-filter-query",
    ".listing-filter-details",
    ".listing-filter-domain",
    ".listing-filter-status",
    ".listing-filter-sort",
    ".listing-filter-reset",
    ".listing-filter-count",
    ".evidence-filter-scope",
    ".evidence-filter-preservation",
    ".evidence-filter-reset",
    ".history-filter-era",
    ".history-filter-layer",
    ".history-filter-capability",
    ".history-filter-display",
    ".history-filter-reset"
  ]) assert.ok(css.includes(selector), `missing responsive filter hook ${selector}`);

  assert.match(css, /grid-template-areas:\s*"query details count"/);
  assert.match(css, /grid-template-areas:\s*"domain status sort reset"/);
  assert.match(css, /"search search"\s*"scope preservation"\s*"reset reset"/);
  assert.match(css, /"search era layer"\s*"capability display reset"/);
});

test("article breakpoint, Korean headings, and statuses keep their visual semantics", async () => {
  const css = await siteCss();

  assert.match(css, /@media\s*\(max-width:\s*1180px\)\s*and\s*\(min-width:\s*861px\)[\s\S]*?\.article-layout\s*\{[^}]*grid-template-columns:\s*180px minmax\(0,\s*820px\) minmax\(0,\s*1fr\)/);
  assert.match(css, /\.article-header h1,[\s\S]*?word-break:\s*keep-all;[\s\S]*?overflow-wrap:\s*break-word;[\s\S]*?text-wrap:\s*balance;/);
  assert.doesNotMatch(css, /\.history-hero h1 br\s*\{[^}]*display:\s*none/);

  for (const status of ["active", "review", "draft", "archived"]) {
    assert.match(css, new RegExp(`\\.status-label\\.${status}\\s*\\{`));
    assert.match(css, new RegExp(`\\.status-dot\\.${status}\\s*\\{`));
  }
});
