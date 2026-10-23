import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { verifyInternalLinks } from "../site/verify-links.mjs";

async function write(root, path, content) {
  const target = join(root, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, content, "utf8");
}

test("internal link verification resolves routes, assets, and archives", async () => {
  const root = await mkdtemp(join(tmpdir(), "cs-wiki-links-"));
  try {
    await write(root, "index.html", [
      '<a href="/docs/a/">A</a>',
      '<a href="docs/a">A without slash</a>',
      '<a href="/assets/site.css?v=1">CSS</a>',
      '<a href="https://example.com/a">external</a>',
      '<a href="#top">anchor</a>',
      '<a href="/docs/missing/">missing</a>',
      '<img src="/assets/image.png">'
    ].join("\n"));
    await write(root, "docs/a/index.html", '<a href="../b/">B</a>');
    await write(root, "docs/b/index.html", "B");
    await write(root, "assets/site.css", "body{}");
    await write(root, "assets/image.png", "png");
    await write(root, "assets/raw/snapshot.html", '<a href="/original/site/path">raw</a>');

    const result = await verifyInternalLinks(root);
    assert.equal(result.pages, 3);
    assert.deepEqual(result.broken, [{ page: "/", href: "/docs/missing/", reason: "missing target" }]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("internal link verification strips a configured site base", async () => {
  const root = await mkdtemp(join(tmpdir(), "cs-wiki-links-base-"));
  try {
    await write(root, "index.html", '<a href="/CS_Wiki/docs/a/">A</a>');
    await write(root, "docs/a/index.html", "A");

    const result = await verifyInternalLinks(root, { base: "/CS_Wiki" });
    assert.deepEqual(result.broken, []);
    assert.equal(result.checked, 1);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
