import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";
import { loadWikiManifest, revisionFor } from "./wiki_manifest.mjs";
import { runDate } from "./wiki_date.mjs";

async function resolveManifest({ root, manifest }) {
  if (manifest !== undefined) return { manifest: await manifest, error: null };
  try {
    return {
      manifest: await loadWikiManifest({ root, strict: true }),
      error: null
    };
  } catch (error) {
    return { manifest: null, error };
  }
}

function manifestError(error) {
  const issues = [{
    code: "manifest.parse",
    path: "wiki",
    message: error.message
  }];
  return { errors: issues.length, issues };
}

export async function checkWikiMaintenance({
  root = process.cwd(),
  manifest,
  today = runDate()
} = {}) {
  // Keep the clock injectable at the operational boundary. Page age is not a
  // maintenance error: `updated` is changed only when a page is visibly edited.
  void today;

  const resolved = await resolveManifest({ root, manifest });
  if (resolved.error) return manifestError(resolved.error);

  const issues = [];
  const add = (code, path, message) => issues.push({ code, path, message });
  for (const page of resolved.manifest.pages) {
    const text = await readFile(page.filePath, "utf8");
    if (text.includes("\r\n")) add("eol.crlf", page.relativePath, "LF 줄바꿈으로 정규화해야 한다.");
    if (!text.endsWith("\n")) add("eol.final_newline", page.relativePath, "마지막 줄바꿈이 없다.");
    if (!text.includes("<!-- wiki-v2:evidence-start -->")) add("generated.evidence", page.relativePath, "근거 블록이 없다.");
    if (page.relativePath === "wiki/index.md" && !text.includes("<!-- wiki-v2:generated index -->")) {
      add("generated.index", page.relativePath, "생성 색인 표식이 없다.");
    }
    if (page.relativePath === "wiki/overview.md" && !text.includes("<!-- wiki-v2:generated overview -->")) {
      add("generated.overview", page.relativePath, "생성 개요 표식이 없다.");
    }
    if (page.relativePath === "wiki/log.md" && !text.includes("<!-- wiki-v2:generated log -->")) {
      add("generated.log", page.relativePath, "생성 로그 표식이 없다.");
    }
  }

  const logFiles = (
    await readdir(join(root, "wiki", "logs"), { withFileTypes: true }).catch(() => [])
  ).filter((entry) => entry.isFile() && entry.name.endsWith(".md"));
  const logText = await readFile(join(root, "wiki", "log.md"), "utf8").catch(() => "");
  const listed = [...logText.matchAll(/\(logs\/([^\)]+\.md)\)/g)].map((match) => match[1]);
  if (listed.length !== logFiles.length) {
    add(
      "generated.log_count",
      "wiki/log.md",
      `로그 목록 ${listed.length}개와 항목 파일 ${logFiles.length}개가 다르다.`
    );
  }

  return { errors: issues.length, issues };
}

export async function fixWikiEol({
  root = process.cwd(),
  manifest
} = {}) {
  const resolved = await resolveManifest({ root, manifest });
  if (resolved.error) throw resolved.error;

  const files = [];
  for (const page of resolved.manifest.pages) {
    const text = await readFile(page.filePath, "utf8");
    if (!text.includes("\r")) continue;

    const body = page.body.replace(/\r\n?/g, "\n").trim();
    const data = structuredClone(page.rawFrontmatter);
    data.review.revision = revisionFor(body, data);
    const frontmatter = YAML.stringify(data, { lineWidth: 0 }).trimEnd();
    await writeFile(page.filePath, `---\n${frontmatter}\n---\n\n${body}\n`, "utf8");
    files.push(page.relativePath);
  }

  return { changed: files.length, files };
}

function printResult(result, { json, output }) {
  if (json) {
    output(JSON.stringify(result, null, 2));
    return;
  }
  for (const issue of result.issues) {
    output(`ERROR ${issue.code} ${issue.path}: ${issue.message}`);
  }
  output(`wiki maintenance: ${result.issues.length} issues`);
}

export async function runWikiMaintenanceCli({
  argv = process.argv.slice(2),
  root = process.cwd(),
  manifest,
  today = runDate(),
  output = console.log
} = {}) {
  let activeManifest = manifest;
  let result;

  if (argv.includes("--fix-eol")) {
    const resolved = await resolveManifest({ root, manifest: activeManifest });
    if (resolved.error) {
      result = manifestError(resolved.error);
    } else {
      activeManifest = resolved.manifest;
      await fixWikiEol({ root, manifest: activeManifest });
      result = await checkWikiMaintenance({ root, manifest: activeManifest, today });
    }
  } else {
    result = await checkWikiMaintenance({ root, manifest: activeManifest, today });
  }

  printResult(result, { json: argv.includes("--json"), output });
  return { result, exitCode: result.errors ? 1 : 0 };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  try {
    const { exitCode } = await runWikiMaintenanceCli();
    process.exitCode = exitCode;
  } catch (error) {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  }
}
