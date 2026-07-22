import assert from "node:assert/strict";
import { resolve } from "node:path";
import test from "node:test";
import { STYLE_PARTS, loadSiteCss } from "../site/styles/index.mjs";


test("feature CSS modules compose in one deterministic cascade", async () => {
  assert.deepEqual(STYLE_PARTS, [...STYLE_PARTS].sort());
  const css = await loadSiteCss(resolve("."));
  for (const marker of [
    "Document evidence lineage",
    "Document-local relationship atlas",
    "Learning-path transit map",
    "Semantic atlas",
    "Historical causal lens"
  ]) assert.ok(css.includes(marker), `composed stylesheet is missing '${marker}'`);
  assert.ok(css.length > 100_000, "composed stylesheet is unexpectedly small");
});
