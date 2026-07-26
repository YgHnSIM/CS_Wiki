import assert from "node:assert/strict";
import test from "node:test";
import { loadWikiManifest, revisionFor } from "../scripts/wiki_manifest.mjs";

test("the checked-in wiki is fully represented by the strict v2 manifest", async () => {
  const manifest = await loadWikiManifest({ root: process.cwd(), strict: true });
  assert.ok(manifest.pages.length >= 340);
  assert.equal(manifest.unresolved.length, 0);
  assert.equal(new Set(manifest.pages.map((page) => page.id)).size, manifest.pages.length);
  assert.ok(manifest.pages.every((page) => page.url === `/docs/${page.id}/`));
  assert.ok(manifest.pages.every((page) => page.review.revision === revisionFor(page.body, page.rawFrontmatter)));
});

test("source provenance separates works from access records", async () => {
  const manifest = await loadWikiManifest({ root: process.cwd(), strict: true });
  const sources = manifest.pages.filter((page) => ["source", "reference"].includes(page.kind));
  assert.ok(sources.length > 100);
  assert.ok(sources.every((page) => page.rawFrontmatter.works.primary.length >= 1));
  assert.ok(sources.every((page) => page.access.length >= 1));
  assert.ok(sources.some((page) => page.access.some((access) => access.kind === "local")));
  assert.ok(sources.some((page) => page.access.some((access) => access.kind === "url")));
});
