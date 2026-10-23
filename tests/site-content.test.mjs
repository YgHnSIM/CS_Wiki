import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { categoryForPath, loadWikiContent } from "../site/content.mjs";

test("category selection keeps top-level operational pages in meta", () => {
  const wikiRoot = join("workspace", "wiki");
  assert.equal(categoryForPath(join(wikiRoot, "index.md"), wikiRoot), "meta");
  assert.equal(categoryForPath(join(wikiRoot, "concepts", "One.md"), wikiRoot), "concepts");
  assert.equal(categoryForPath(join(wikiRoot, "sources", "One.md"), wikiRoot, undefined, ["type/reference"]), "references");
});

test("wiki content loading sorts pages and resolves incoming links", async () => {
  const root = await mkdtemp(join(tmpdir(), "cs-wiki-content-"));
  const wikiRoot = join(root, "wiki");
  try {
    await mkdir(join(wikiRoot, "concepts"), { recursive: true });
    await writeFile(join(wikiRoot, "concepts", "Beta.md"), "---\ntitle: Beta\naliases: []\n---\n[[Alpha]]", "utf8");
    await writeFile(join(wikiRoot, "concepts", "Alpha.md"), "---\ntitle: Alpha\naliases: []\n---\nBody", "utf8");

    const { pages, lookup } = await loadWikiContent({ root, wikiRoot });
    assert.deepEqual(pages.map((page) => page.title), ["Alpha", "Beta"]);
    assert.equal(lookup.get("alpha"), pages[0]);
    assert.deepEqual(pages[1].links, [pages[0]]);
    assert.equal(pages[0].incoming, 1);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
