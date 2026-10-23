import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import YAML from "yaml";
import {
  checkWikiMaintenance,
  fixWikiEol
} from "../scripts/wiki_maintenance.mjs";
import {
  loadWikiManifest
} from "../scripts/wiki_manifest.mjs";

const maintenanceScript = resolve("scripts", "wiki_maintenance.mjs");

function pageData(id, title) {
  return {
    schema_version: 3,
    id,
    kind: "meta",
    title,
    aliases: [],
    summary: `${title} maintenance fixture summary.`,
    domains: ["computer-science"],
    publication_visibility: "public",
    graph_visibility: "hidden",
    created: "2000-01-01",
    updated: "2000-01-01",
    evidence_ids: [],
    capability_layers: []
  };
}

async function writeV3Page(path, { id, title, body }) {
  const data = pageData(id, title);
  const normalizedBody = body.trim();
  const frontmatter = YAML.stringify(data, { lineWidth: 0 }).trimEnd();
  await writeFile(path, `---\n${frontmatter}\n---\n\n${normalizedBody}\n`, "utf8");
}

function pageBody(marker, extra = "") {
  return `${marker}

<!-- wiki-v2:evidence-start -->
洹쇨굅 ?놁쓬
<!-- wiki-v2:evidence-end -->
${extra}
## 異쒖쿂

- ?놁쓬

## 愿????ぉ`;
}

async function createWikiFixture(t) {
  const root = await mkdtemp(join(tmpdir(), "cs-wiki-maintenance-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const wiki = join(root, "wiki");
  await mkdir(join(wiki, "logs"), { recursive: true });

  const paths = {
    index: join(wiki, "index.md"),
    overview: join(wiki, "overview.md"),
    log: join(wiki, "log.md")
  };
  await writeV3Page(paths.index, {
    id: "meta-index",
    title: "Index",
    body: pageBody("<!-- wiki-v2:generated index -->")
  });
  await writeV3Page(paths.overview, {
    id: "meta-overview",
    title: "Overview",
    body: pageBody("<!-- wiki-v2:generated overview -->")
  });
  await writeV3Page(paths.log, {
    id: "meta-log",
    title: "Log",
    body: pageBody("<!-- wiki-v2:generated log -->", "\n- [entry](logs/entry.md)\n")
  });
  await writeFile(join(wiki, "logs", "entry.md"), "# Entry\n", "utf8");

  const manifest = await loadWikiManifest({ root, strict: true });
  return { root, manifest, paths };
}

test("importing maintenance has no CLI output or filesystem writes", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "cs-wiki-maintenance-import-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const moduleUrl = pathToFileURL(maintenanceScript).href;
  const child = spawnSync(
    process.execPath,
    ["--input-type=module", "--eval", `await import(${JSON.stringify(moduleUrl)})`],
    { cwd: root, encoding: "utf8" }
  );

  assert.equal(child.status, 0, child.stderr);
  assert.equal(child.stdout, "");
  assert.equal(child.stderr, "");
  await assert.rejects(() => stat(join(root, "wiki")), { code: "ENOENT" });
});

test("check accepts injected state and does not flag old active pages", async (t) => {
  const fixture = await createWikiFixture(t);
  const result = await checkWikiMaintenance({
    root: fixture.root,
    manifest: fixture.manifest,
    today: "2099-12-31"
  });

  assert.deepEqual(result, { errors: 0, issues: [] });
  assert.equal(result.issues.some((issue) => issue.code === "updated.stale"), false);
});

test("check preserves generated marker, log count, and EOL diagnostics", async (t) => {
  const fixture = await createWikiFixture(t);
  const index = (await readFile(fixture.paths.index, "utf8"))
    .replace("<!-- wiki-v2:generated index -->\n\n", "")
    .replace("<!-- wiki-v2:evidence-start -->\n", "")
    .replaceAll("\n", "\r\n")
    .replace(/\r\n$/, "");
  const overview = (await readFile(fixture.paths.overview, "utf8"))
    .replace("<!-- wiki-v2:generated overview -->\n\n", "");
  const log = (await readFile(fixture.paths.log, "utf8"))
    .replace("<!-- wiki-v2:generated log -->\n\n", "")
    .replace("- [entry](logs/entry.md)\n", "");
  await writeFile(fixture.paths.index, index, "utf8");
  await writeFile(fixture.paths.overview, overview, "utf8");
  await writeFile(fixture.paths.log, log, "utf8");

  const result = await checkWikiMaintenance({
    root: fixture.root,
    manifest: fixture.manifest,
    today: "2099-12-31"
  });
  const codes = result.issues.map((issue) => issue.code);

  assert.equal(result.errors, 7);
  assert.deepEqual(new Set(codes), new Set([
    "eol.crlf",
    "eol.final_newline",
    "generated.evidence",
    "generated.index",
    "generated.overview",
    "generated.log",
    "generated.log_count"
  ]));
});

test("check flags log order and title drift", async (t) => {
  const fixture = await createWikiFixture(t);
  await writeFile(join(fixture.root, "wiki", "logs", "second.md"), "# Second\n", "utf8");
  const original = await readFile(fixture.paths.log, "utf8");

  const wrongOrder = original.replace(
    "- [entry](logs/entry.md)",
    "- [second](logs/second.md)\n- [entry](logs/entry.md)"
  );
  await writeFile(fixture.paths.log, wrongOrder, "utf8");
  const orderResult = await checkWikiMaintenance({
    root: fixture.root,
    manifest: fixture.manifest
  });
  assert.ok(orderResult.issues.some((issue) => issue.code === "generated.log_order"));

  const wrongTitle = original.replace(
    "- [entry](logs/entry.md)",
    "- [entry](logs/entry.md)\n- [Wrong title](logs/second.md)"
  );
  await writeFile(fixture.paths.log, wrongTitle, "utf8");
  const titleResult = await checkWikiMaintenance({
    root: fixture.root,
    manifest: fixture.manifest
  });
  assert.ok(titleResult.issues.some((issue) => issue.code === "generated.log_title"));
  assert.equal(titleResult.issues.some((issue) => issue.code === "generated.log_count"), false);
});

test("EOL fixing is explicit, idempotent, and refreshes the revision", async (t) => {
  const fixture = await createWikiFixture(t);
  const crlf = (await readFile(fixture.paths.overview, "utf8")).replaceAll("\n", "\r\n");
  await writeFile(fixture.paths.overview, crlf, "utf8");
  const manifest = await loadWikiManifest({ root: fixture.root, strict: true });

  const fixed = await fixWikiEol({ root: fixture.root, manifest });
  assert.deepEqual(fixed, {
    changed: 1,
    files: ["wiki/overview.md"]
  });

  const text = await readFile(fixture.paths.overview, "utf8");
  assert.equal(text.includes("\r"), false);
  assert.equal(text.endsWith("\n"), true);
  const parsed = text.match(/^---\n([\s\S]*?)\n---\n\n([\s\S]*)$/);
  assert.ok(parsed);
  const data = YAML.parse(parsed[1]);
  assert.equal(data.schema_version, 3);
  assert.equal(data.review, undefined);
  assert.equal(data.updated, "2000-01-01");
  assert.deepEqual(await fixWikiEol({ root: fixture.root, manifest }), {
    changed: 0,
    files: []
  });
});

test("CLI preserves text and JSON output with matching exit codes", async (t) => {
  const fixture = await createWikiFixture(t);
  const clean = spawnSync(process.execPath, [maintenanceScript], {
    cwd: fixture.root,
    encoding: "utf8"
  });
  assert.equal(clean.status, 0, clean.stderr);
  assert.equal(clean.stdout.trim(), "wiki maintenance: 0 issues");
  assert.equal(clean.stderr, "");

  const crlf = (await readFile(fixture.paths.index, "utf8")).replaceAll("\n", "\r\n");
  await writeFile(fixture.paths.index, crlf, "utf8");
  const failing = spawnSync(process.execPath, [maintenanceScript, "--json"], {
    cwd: fixture.root,
    encoding: "utf8"
  });
  assert.equal(failing.status, 1);
  assert.equal(failing.stderr, "");
  const result = JSON.parse(failing.stdout);
  assert.equal(result.errors, 1);
  assert.equal(result.issues[0].code, "eol.crlf");

  const fixed = spawnSync(process.execPath, [maintenanceScript, "--fix-eol"], {
    cwd: fixture.root,
    encoding: "utf8"
  });
  assert.equal(fixed.status, 0, fixed.stderr);
  assert.equal(fixed.stdout.trim(), "wiki maintenance: 0 issues");
  assert.equal((await readFile(fixture.paths.index, "utf8")).includes("\r"), false);
});