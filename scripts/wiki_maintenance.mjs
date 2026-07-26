import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import YAML from "yaml";
import { loadWikiManifest, revisionFor } from "./wiki_manifest.mjs";

const root = process.cwd();
const today = process.env.WIKI_TODAY || new Date().toISOString().slice(0, 10);
const issues = [];
const add = (code, path, message) => issues.push({ code, path, message });

const manifest = await loadWikiManifest({ root, strict: true }).catch((error) => {
  add("manifest.parse", "wiki", error.message);
  return null;
});

if (manifest) {
  for (const page of manifest.pages) {
    const text = await readFile(page.filePath, "utf8");
    if (process.argv.includes("--fix-eol") && text.includes("\r")) {
      const body = page.body.replace(/\r\n?/g, "\n").trim();
      const data = structuredClone(page.rawFrontmatter);
      data.review.revision = revisionFor(body, data);
      await writeFile(page.filePath, `---\n${YAML.stringify(data, { lineWidth: 0 }).trimEnd()}\n---\n\n${body}\n`, "utf8");
      continue;
    }
    if (text.includes("\r\n")) add("eol.crlf", page.relativePath, "LF 줄바꿈으로 정규화해야 한다.");
    if (!text.endsWith("\n")) add("eol.final_newline", page.relativePath, "마지막 줄바꿈이 없다.");
    if (!text.includes("<!-- wiki-v2:evidence-start -->")) add("generated.evidence", page.relativePath, "근거 블록이 없다.");
    if (page.relativePath === "wiki/index.md" && !text.includes("<!-- wiki-v2:generated index -->")) add("generated.index", page.relativePath, "생성 색인 표식이 없다.");
    if (page.relativePath === "wiki/overview.md" && !text.includes("<!-- wiki-v2:generated overview -->")) add("generated.overview", page.relativePath, "생성 개요 표식이 없다.");
    if (page.relativePath === "wiki/log.md" && !text.includes("<!-- wiki-v2:generated log -->")) add("generated.log", page.relativePath, "생성 로그 표식이 없다.");
    if (page.updated !== today && page.editorialStatus === "active") add("updated.stale", page.relativePath, `updated가 오늘(${today})과 다르다: ${page.updated}`);
  }
  const logFiles = (await readdir(join(root, "wiki", "logs"), { withFileTypes: true }).catch(() => [])).filter((entry) => entry.isFile() && entry.name.endsWith(".md"));
  const logText = await readFile(join(root, "wiki", "log.md"), "utf8").catch(() => "");
  const listed = [...logText.matchAll(/\(logs\/([^\)]+\.md)\)/g)].map((match) => match[1]);
  if (listed.length !== logFiles.length) add("generated.log_count", "wiki/log.md", `로그 목록 ${listed.length}개와 항목 파일 ${logFiles.length}개가 다르다.`);
}

const result = { errors: issues.length, issues };
if (process.argv.includes("--json")) console.log(JSON.stringify(result, null, 2));
else {
  for (const issue of issues) console.log(`ERROR ${issue.code} ${issue.path}: ${issue.message}`);
  console.log(`wiki maintenance: ${issues.length} issues`);
}
if (issues.length) process.exitCode = 1;
