import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { parseGitNulPaths } from "../scripts/update_wiki_updated.mjs";

const exec = promisify(execFile);
const scriptUrl = new URL("../scripts/update_wiki_updated.mjs", import.meta.url);

test("NUL-separated git paths keep Korean wiki files and drop logs and quoted decoys", () => {
  const stdout = [
    "wiki/concepts/API.md",
    "wiki/concepts/계산 가능성.md",
    "wiki\\entities\\앨런 튜링.md",
    "wiki/logs/log-2026-09-17-116.md",
    "scripts/update_wiki_updated.mjs",
    "\"wiki/concepts/\\354\\235\\264.md\"",
    ""
  ].join("\0");
  assert.deepEqual(parseGitNulPaths(stdout), [
    "wiki/concepts/API.md",
    "wiki/concepts/계산 가능성.md",
    "wiki/entities/앨런 튜링.md"
  ]);
});

test("importing update_wiki_updated does not write files or print CLI output", async () => {
  const result = await exec(
    process.execPath,
    ["--input-type=module", "--eval", `await import(${JSON.stringify(scriptUrl.href)})`],
    { cwd: fileURLToPath(new URL("..", import.meta.url)) }
  );
  assert.equal(result.stdout, "");
  assert.equal(result.stderr, "");
});
