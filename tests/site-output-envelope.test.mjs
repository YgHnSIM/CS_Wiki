import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { verifyOutputEnvelope } from "../site/verify-output.mjs";


test("deployment envelope counts files and enforces aggregate budgets", async () => {
  const root = await mkdtemp(join(tmpdir(), "cs-wiki-output-"));
  try {
    await mkdir(join(root, "nested"));
    await writeFile(join(root, "index.html"), "<h1>ok</h1>");
    await writeFile(join(root, "nested", "data.json"), '{"ok":true}');
    const totals = await verifyOutputEnvelope(root, {
      files: 2,
      totalBytes: 64,
      htmlBytes: 32,
      jsonBytes: 32
    });
    assert.equal(totals.files, 2);
    await assert.rejects(() => verifyOutputEnvelope(root, {
      files: 1,
      totalBytes: 64,
      htmlBytes: 32,
      jsonBytes: 32
    }), /file/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
