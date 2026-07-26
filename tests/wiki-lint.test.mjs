import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";
import { collectWikiLintIssues, runWikiLint } from "../scripts/wiki_lint.mjs";
import { revisionFor } from "../scripts/wiki_manifest.mjs";

const exec = promisify(execFile);
const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const lintModuleUrl = new URL("../scripts/wiki_lint.mjs", import.meta.url).href;

function makePage(overrides = {}) {
  const id = overrides.id || "concept-test";
  const body = overrides.body || "테스트 본문\n\n## 출처\n\n- 테스트 근거\n\n## 관련 항목\n";
  const rawFrontmatter = overrides.rawFrontmatter || {
    review: {
      mode: "pending",
      revision: null,
      reviewed_at: null,
      reviewed_by: null
    }
  };
  return {
    id,
    kind: "concept",
    relativePath: `wiki/concepts/${id}.md`,
    created: "2026-07-26",
    updated: "2026-07-26",
    body,
    rawFrontmatter,
    review: {
      mode: "pending",
      revision: revisionFor(body, rawFrontmatter)
    },
    editorialStatus: "review",
    url: `/docs/${id}/`,
    targets: [],
    plannedLinks: [],
    evidenceIds: [],
    access: [],
    ...overrides,
    id,
    body,
    rawFrontmatter
  };
}

test("importing wiki_lint does not execute its CLI", async () => {
  const result = await exec(
    process.execPath,
    ["--input-type=module", "--eval", `await import(${JSON.stringify(lintModuleUrl)})`],
    { cwd: projectRoot }
  );
  assert.equal(result.stdout, "");
  assert.equal(result.stderr, "");
});

test("collect/run count manifest pages and report each unplanned unresolved link once", async () => {
  const page = makePage({ plannedLinks: ["계획된 페이지"] });
  const manifest = {
    pages: [page],
    unresolved: [
      { page, target: "없는 페이지" },
      { page, target: "없는 페이지#절" },
      { page, target: "계획된 페이지" },
      { page, target: "계획된 페이지#절" }
    ]
  };

  const summary = await collectWikiLintIssues({ root: projectRoot, manifest });
  assert.equal(summary.pages, 1);
  assert.deepEqual(
    summary.issues.filter((issue) => issue.code === "links.unresolved"),
    [{
      severity: "error",
      code: "links.unresolved",
      page: page.relativePath,
      message: "미해결 위키링크: 없는 페이지"
    }]
  );

  const output = [];
  const runSummary = await runWikiLint({
    root: projectRoot,
    manifest,
    json: true,
    write: (line) => output.push(line)
  });
  assert.equal(runSummary.pages, 1);
  assert.equal(JSON.parse(output.join("\n")).pages, 1);
});

test("local access rejects raw escapes and directories without reading or hashing them", async () => {
  const root = await mkdtemp(join(tmpdir(), "cs-wiki-lint-"));
  try {
    await mkdir(join(root, "raw", "directory"), { recursive: true });
    const rawFrontmatter = {
      origin: "local",
      works: {
        primary: [{ citation: "테스트 원문" }]
      },
      review: {
        mode: "pending",
        revision: null,
        reviewed_at: null,
        reviewed_by: null
      }
    };
    const page = makePage({
      id: "src-999",
      kind: "source",
      relativePath: "wiki/sources/test.md",
      rawFrontmatter,
      access: [
        {
          kind: "local",
          path: "raw/../outside.md",
          sha256: "0".repeat(64),
          bytes: 0
        },
        {
          kind: "snapshot",
          path: "raw/directory",
          sha256: "0".repeat(64),
          bytes: 0
        }
      ]
    });
    const summary = await collectWikiLintIssues({
      root,
      manifest: { pages: [page], unresolved: [] }
    });
    const codes = summary.issues.map((issue) => issue.code);

    assert.equal(summary.pages, 1);
    assert.deepEqual(codes, ["provenance.snapshot_path", "provenance.snapshot_file"]);
    assert.ok(!codes.includes("provenance.snapshot_hash"));
    assert.ok(!codes.includes("provenance.snapshot_bytes"));
    assert.ok(!codes.includes("provenance.snapshot_read"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("local access rejects a symlink that resolves outside raw", async (context) => {
  const root = await mkdtemp(join(tmpdir(), "cs-wiki-lint-symlink-"));
  try {
    const raw = join(root, "raw");
    const outside = join(root, "outside");
    await mkdir(raw, { recursive: true });
    await mkdir(outside, { recursive: true });
    await writeFile(join(outside, "snapshot.md"), "outside raw", "utf8");
    try {
      await symlink(outside, join(raw, "linked"), process.platform === "win32" ? "junction" : "dir");
    } catch (error) {
      if (error?.code === "EPERM" || error?.code === "EACCES") {
        context.skip(`symbolic links are unavailable: ${error.code}`);
        return;
      }
      throw error;
    }

    const rawFrontmatter = {
      origin: "local",
      works: {
        primary: [{ citation: "테스트 원문" }]
      },
      review: {
        mode: "pending",
        revision: null,
        reviewed_at: null,
        reviewed_by: null
      }
    };
    const page = makePage({
      id: "src-998",
      kind: "source",
      relativePath: "wiki/sources/symlink.md",
      rawFrontmatter,
      access: [{
        kind: "local",
        path: "raw/linked/snapshot.md",
        sha256: "0".repeat(64),
        bytes: 0
      }]
    });

    const summary = await collectWikiLintIssues({
      root,
      manifest: { pages: [page], unresolved: [] }
    });
    assert.deepEqual(
      summary.issues.map((issue) => issue.code),
      ["provenance.snapshot_path"]
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
