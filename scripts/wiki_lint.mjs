import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { loadWikiManifest, revisionFor } from "./wiki_manifest.mjs";
import { key } from "../site/core.mjs";

const root = process.cwd();
const issues = [];
const add = (severity, code, page, message) => issues.push({ severity, code, page, message });

function isDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

function checkSection(page, title) {
  return page.body.split(/^##\s+/m).some((section) => section.startsWith(`${title}\n`) || section.startsWith(`${title}\r\n`));
}

async function lint() {
  let manifest;
  try {
    manifest = await loadWikiManifest({ root, strict: true });
  } catch (error) {
    add("error", "manifest.parse", "wiki", error.message);
    return;
  }
  const byId = new Map();
  for (const page of manifest.pages) {
    if (byId.has(page.id)) add("error", "identity.duplicate", page.relativePath, `중복 ID: ${page.id}`);
    byId.set(page.id, page);
  }
  for (const page of manifest.pages) {
    if (!isDate(page.created) || !isDate(page.updated)) add("error", "frontmatter.date", page.relativePath, "created/updated는 ISO 날짜여야 한다.");
    if (!checkSection(page, "출처")) add("error", "sections.source", page.relativePath, "## 출처 섹션이 없다.");
    if (!checkSection(page, "관련 항목")) add("error", "sections.related", page.relativePath, "## 관련 항목 섹션이 없다.");
    const headings = [...page.body.matchAll(/^##\s+(.+?)\s*$/gm)].map((match) => match[1].trim());
    const relatedIndex = headings.lastIndexOf("관련 항목");
    if (relatedIndex >= 0 && relatedIndex !== headings.length - 1) add("error", "sections.related_last", page.relativePath, "관련 항목 섹션은 마지막이어야 한다.");
    if (page.review.revision !== revisionFor(page.body, page.rawFrontmatter)) add("error", "review.revision", page.relativePath, "review.revision이 현재 본문·메타데이터와 일치하지 않는다.");
    if (page.editorialStatus === "active" && page.review.mode === "pending") add("error", "review.pending_active", page.relativePath, "active 문서에는 pending 검토 상태를 사용할 수 없다.");
    if (page.url !== `/docs/${page.id}/`) add("error", "route.id", page.relativePath, `ID 기반 URL이 아니다: ${page.url}`);
    for (const target of page.targets) {
      const base = String(target).split("#", 1)[0].trim();
      if (!base) continue;
      const resolved = manifest.lookup.get(key(base));
      if (!resolved && !(page.plannedLinks || []).includes(base)) add("error", "links.unresolved", page.relativePath, `미해결 위키링크: ${base}`);
    }
    const related = page.body.split(/^##\s+/m).find((section) => section.startsWith("관련 항목\n") || section.startsWith("관련 항목\r\n")) || "";
    const relatedItems = [...related.matchAll(/^[-*]\s+\[\[([^\]]+)\]\](.*)$/gm)];
    if (!['source', 'reference'].includes(page.kind)) {
      if (relatedItems.length > 5) add("error", "links.related_budget", page.relativePath, `관련 항목이 ${relatedItems.length}개다.`);
      for (const match of relatedItems) if (!/[—-]\s*\S/.test(match[2])) add("error", "links.related_reason", page.relativePath, `관련 항목 이유가 없다: ${match[1]}`);
    }
    for (const evidenceId of page.evidenceIds) {
      const evidence = byId.get(evidenceId);
      if (!evidence || !["source", "reference"].includes(evidence.kind)) add("error", "provenance.evidence", page.relativePath, `유효하지 않은 근거 ID: ${evidenceId}`);
    }
    if (["source", "reference"].includes(page.kind)) {
      if (!page.rawFrontmatter.origin || !page.rawFrontmatter.works?.primary?.length) add("error", "provenance.primary", page.relativePath, "origin과 works.primary가 필요하다.");
      if (!Array.isArray(page.access) || !page.access.length) add("error", "provenance.access", page.relativePath, "access 기록이 필요하다.");
      for (const access of page.access || []) {
        if (access.kind === "url" && !/^https?:\/\//.test(access.url || "")) add("error", "provenance.url", page.relativePath, `HTTP(S) URL이 아니다: ${access.url}`);
        if (access.kind !== "url") {
          const localPath = join(root, access.path);
          if (!existsSync(localPath)) {
            add("error", "provenance.snapshot_missing", page.relativePath, `스냅샷이 없다: ${access.path}`);
          } else {
            const bytes = await readFile(localPath);
            const digest = createHash("sha256").update(bytes).digest("hex");
            if (access.sha256 !== digest) add("error", "provenance.snapshot_hash", page.relativePath, `스냅샷 해시 불일치: ${access.path}`);
            if (access.bytes !== bytes.length) add("error", "provenance.snapshot_bytes", page.relativePath, `스냅샷 바이트 수 불일치: ${access.path}`);
            const info = await stat(localPath);
            if (!info.isFile()) add("error", "provenance.snapshot_file", page.relativePath, `스냅샷이 파일이 아니다: ${access.path}`);
          }
        }
      }
    }
  }
  if (manifest.unresolved.length) for (const item of manifest.unresolved) add("error", "links.unresolved", item.page.relativePath, `미해결 위키링크: ${item.target}`);
}

await lint();
const summary = {
  pages: issues.length ? undefined : undefined,
  errors: issues.filter((issue) => issue.severity === "error").length,
  warnings: issues.filter((issue) => issue.severity === "warning").length,
  issues
};
if (process.argv.includes("--json")) console.log(JSON.stringify(summary, null, 2));
else {
  for (const issue of issues) console.log(`${issue.severity.toUpperCase()} ${issue.code} ${issue.page}: ${issue.message}`);
  console.log(`wiki lint: ${summary.errors} errors, ${summary.warnings} warnings`);
}
if (summary.errors) process.exitCode = 1;
