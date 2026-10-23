import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  loadLogEntries,
  parseLogEntries,
  renderLogEntries,
  renderLogPageBody
} from "../scripts/log_index.mjs";

test("log index loads frontmatter titles in filename order and round-trips", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "cs-wiki-log-index-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "wiki", "logs"), { recursive: true });
  await writeFile(join(root, "wiki", "logs", "log-2026-01-02-b.md"), [
    "---",
    'title: "2026-01-02 update | B"',
    "---",
    "",
    "B"
  ].join("\n"), "utf8");
  await writeFile(join(root, "wiki", "logs", "log-2026-01-01-a.md"), [
    "---",
    "title: 2026-01-01 fix | A",
    "---",
    "",
    "A"
  ].join("\n"), "utf8");

  const entries = await loadLogEntries(root);
  assert.deepEqual(entries, [
    { file: "log-2026-01-01-a.md", title: "2026-01-01 fix | A" },
    { file: "log-2026-01-02-b.md", title: "2026-01-02 update | B" }
  ]);

  const markdown = renderLogEntries(entries);
  assert.equal(markdown, [
    "- [2026-01-01 fix | A](logs/log-2026-01-01-a.md)",
    "- [2026-01-02 update | B](logs/log-2026-01-02-b.md)"
  ].join("\n"));
  assert.deepEqual(parseLogEntries(markdown), entries);

  const body = renderLogPageBody(entries);
  assert.match(body, /^<!-- wiki-v2:generated log -->/);
  assert.match(body, /# 작업 로그/);
  assert.match(body, /## 출처/);
  assert.match(body, /## 관련 항목/);
});
