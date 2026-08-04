import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

const run = promisify(execFile);
const validator = join(process.cwd(), "scripts", "validate_change_set.mjs");

async function git(root, ...args) {
  return run("git", args, { cwd: root, maxBuffer: 2 * 1024 * 1024 });
}

test("change-set validation tolerates invalid legacy YAML while checking the v2 page", async () => {
  const root = await mkdtemp(join(tmpdir(), "cs-wiki-change-set-"));
  const pagePath = join(root, "wiki", "sources", "Unicode Normalization Forms.md");
  try {
    await git(root, "init", "-q");
    await git(root, "config", "user.email", "test@example.com");
    await git(root, "config", "user.name", "CS Wiki Test");
    await mkdir(join(root, "wiki", "sources"), { recursive: true });
    await writeFile(
      pagePath,
      `---
title: Unicode Normalization Forms
aliases: [UAX #15, Unicode Standard Annex #15, 유니코드 정규화 형식]
summary: Legacy reference
---
Legacy body
`,
      "utf8",
    );
    await git(root, "add", ".");
    await git(root, "commit", "-m", "base");
    const base = (await git(root, "rev-parse", "HEAD")).stdout.trim();

    await writeFile(
      pagePath,
      `---
schema_version: 2
id: ref-001
kind: reference
title: Unicode Normalization Forms
aliases: []
summary: A v2 reference page.
domains: [text-processing]
editorial_status: review
publication_visibility: public
graph_visibility: public
created: 2026-07-26
updated: 2026-07-26
review:
  mode: pending
  revision: null
  reviewed_at: null
  reviewed_by: null
evidence_ids: []
capability_layers: []
---
Current body
`,
      "utf8",
    );
    await mkdir(join(root, "wiki", "logs"), { recursive: true });
    await writeFile(join(root, "wiki", "logs", "change.md"), "# Migration\n", "utf8");
    await git(root, "add", ".");
    await git(root, "commit", "-m", "migrate");

    const result = await run("node", [validator], {
      cwd: root,
      env: { ...process.env, BASE_SHA: base, WIKI_TODAY: "2026-07-26" },
      maxBuffer: 2 * 1024 * 1024,
    });
    assert.match(result.stdout, /change-set: 2 changed paths validated/);
    assert.match(result.stderr, /skipped legacy frontmatter parsing for 1 previous file/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("change-set validation accepts the project date across the UTC-to-KST boundary", async () => {
  const root = await mkdtemp(join(tmpdir(), "cs-wiki-change-set-date-"));
  const pagePath = join(root, "wiki", "index.md");
  const clockPath = join(root, "fixed-clock.mjs");
  try {
    await git(root, "init", "-q");
    await git(root, "config", "user.email", "test@example.com");
    await git(root, "config", "user.name", "CS Wiki Test");
    await mkdir(join(root, "wiki"), { recursive: true });
    const page = [
      "---",
      "schema_version: 2",
      "id: wiki-index",
      "kind: meta",
      "title: Wiki Index",
      "summary: Index",
      "editorial_status: active",
      "publication_visibility: public",
      "graph_visibility: public",
      "created: 2026-01-01",
      "updated: 2026-08-05",
      "review:",
      "  mode: attested",
      "  revision: sha256:base",
      "  reviewed_at: 2026-01-01",
      "  reviewed_by: test",
      "evidence_ids: []",
      "capability_layers: []",
      "---",
      "Before",
      "",
    ].join("\n");
    await writeFile(pagePath, page, "utf8");
    await git(root, "add", ".");
    await git(root, "commit", "-m", "base");
    const base = (await git(root, "rev-parse", "HEAD")).stdout.trim();

    await writeFile(pagePath, page.replace("Before", "After"), "utf8");
    await git(root, "add", ".");
    await git(root, "commit", "-m", "change");
    await writeFile(
      clockPath,
      [
        "const RealDate = globalThis.Date;",
        "const fixed = RealDate.parse(\"2026-08-04T21:50:00.000Z\");",
        "globalThis.Date = class extends RealDate {",
        "  constructor(...args) { super(args.length === 0 ? fixed : args[0]); }",
        "  static now() { return fixed; }",
        "};",
        "",
      ].join("\n"),
      "utf8",
    );

    const result = await run("node", ["--import", pathToFileURL(clockPath).href, validator], {
      cwd: root,
      env: { ...process.env, BASE_SHA: base, WIKI_TODAY: "" },
      maxBuffer: 2 * 1024 * 1024,
    });
    assert.match(result.stdout, /change-set: 1 changed paths validated/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
