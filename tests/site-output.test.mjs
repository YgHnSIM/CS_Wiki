import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { createDataOutputPath, createOutputWriter } from "../site/output.mjs";

test("data output paths stay inside their lens namespace", () => {
  const resolveAtlasPath = createDataOutputPath("atlas", "semantic atlas");
  assert.equal(resolveAtlasPath("clusters/one.json?v=abc", "cluster"), join("data", "atlas", "clusters", "one.json"));
  for (const value of ["", "/absolute.json", "../escape.json", "safe/../escape.json", "safe//empty.json", "%2e%2e/escape.json", "unsafe/<name>.json"]) {
    assert.throws(() => resolveAtlasPath(value, "cluster"), /Unsafe semantic atlas cluster path/);
  }
  assert.throws(() => createDataOutputPath("../atlas", "semantic atlas"), /Unsafe data namespace/);
});

test("output writer creates nested UTF-8 artifacts", async () => {
  const root = await mkdtemp(join(tmpdir(), "cs-wiki-output-"));
  try {
    const output = createOutputWriter(root);
    await output(join("nested", "artifact.txt"), "한글 artifact");
    assert.equal(await readFile(join(root, "nested", "artifact.txt"), "utf8"), "한글 artifact");
    await assert.rejects(() => output(join("..", "escape.txt"), "no"), /Unsafe output path/);
    await assert.rejects(() => output(join(root, "absolute.txt"), "no"), /Unsafe output path/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
