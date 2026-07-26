import { createHash } from "node:crypto";
import { readFile, realpath, stat } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { loadWikiManifest, revisionFor } from "./wiki_manifest.mjs";
import { key } from "../site/core.mjs";

function isDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

function checkSection(page, title) {
  return page.body.split(/^##\s+/m).some((section) => section.startsWith(`${title}\n`) || section.startsWith(`${title}\r\n`));
}

function isWithin(parent, candidate) {
  const relation = relative(parent, candidate);
  return relation === "" || (!isAbsolute(relation) && relation !== ".." && !relation.startsWith(`..${sep}`));
}

function plannedLinkKeys(page) {
  return new Set((page.plannedLinks || []).map((target) => key(String(target).split("#", 1)[0].trim())).filter(Boolean));
}

function summarize(pages, issues) {
  return {
    pages,
    errors: issues.filter((issue) => issue.severity === "error").length,
    warnings: issues.filter((issue) => issue.severity === "warning").length,
    issues
  };
}

async function checkLocalAccess({ access, page, root, rawRoot, add }) {
  if (typeof access.path !== "string" || !access.path.trim()) {
    add("error", "provenance.snapshot_path", page.relativePath, "스냅샷 경로가 없다.");
    return;
  }

  const localPath = resolve(root, access.path);
  if (!isWithin(rawRoot, localPath)) {
    add("error", "provenance.snapshot_path", page.relativePath, `스냅샷 경로가 raw/ 밖을 가리킨다: ${access.path}`);
    return;
  }

  let info;
  try {
    info = await stat(localPath);
  } catch (error) {
    if (error?.code === "ENOENT" || error?.code === "ENOTDIR") {
      add("error", "provenance.snapshot_missing", page.relativePath, `스냅샷이 없다: ${access.path}`);
    } else {
      add("error", "provenance.snapshot_stat", page.relativePath, `스냅샷을 확인할 수 없다: ${access.path} (${error.message})`);
    }
    return;
  }

  if (!info.isFile()) {
    add("error", "provenance.snapshot_file", page.relativePath, `스냅샷이 파일이 아니다: ${access.path}`);
    return;
  }

  try {
    const [canonicalRoot, canonicalRawRoot, canonicalLocalPath] = await Promise.all([
      realpath(root),
      realpath(rawRoot),
      realpath(localPath)
    ]);
    if (!isWithin(canonicalRoot, canonicalRawRoot) || !isWithin(canonicalRawRoot, canonicalLocalPath)) {
      add("error", "provenance.snapshot_path", page.relativePath, `스냅샷 경로가 실제 raw/ 밖을 가리킨다: ${access.path}`);
      return;
    }
  } catch (error) {
    add("error", "provenance.snapshot_stat", page.relativePath, `스냅샷 실제 경로를 확인할 수 없다: ${access.path} (${error.message})`);
    return;
  }

  let bytes;
  try {
    bytes = await readFile(localPath);
  } catch (error) {
    add("error", "provenance.snapshot_read", page.relativePath, `스냅샷을 읽을 수 없다: ${access.path} (${error.message})`);
    return;
  }

  const digest = createHash("sha256").update(bytes).digest("hex");
  if (access.sha256 !== digest) add("error", "provenance.snapshot_hash", page.relativePath, `스냅샷 해시 불일치: ${access.path}`);
  if (access.bytes !== bytes.length) add("error", "provenance.snapshot_bytes", page.relativePath, `스냅샷 바이트 수 불일치: ${access.path}`);
}

export async function collectWikiLintIssues({ root = process.cwd(), manifest: suppliedManifest } = {}) {
  const resolvedRoot = resolve(root);
  const issues = [];
  const add = (severity, code, page, message) => issues.push({ severity, code, page, message });
  let manifest = suppliedManifest;
  if (!manifest) {
    try {
      manifest = await loadWikiManifest({ root: resolvedRoot, strict: true });
    } catch (error) {
      add("error", "manifest.parse", "wiki", error.message);
      return summarize(0, issues);
    }
  }
  const pages = Array.isArray(manifest.pages) ? manifest.pages : [];
  const rawRoot = resolve(resolvedRoot, "raw");
  const byId = new Map();
  for (const page of pages) {
    if (byId.has(page.id)) add("error", "identity.duplicate", page.relativePath, `중복 ID: ${page.id}`);
    byId.set(page.id, page);
  }
  for (const page of pages) {
    if (!isDate(page.created) || !isDate(page.updated)) add("error", "frontmatter.date", page.relativePath, "created/updated는 ISO 날짜여야 한다.");
    if (!checkSection(page, "출처")) add("error", "sections.source", page.relativePath, "## 출처 섹션이 없다.");
    if (!checkSection(page, "관련 항목")) add("error", "sections.related", page.relativePath, "## 관련 항목 섹션이 없다.");
    const headings = [...page.body.matchAll(/^##\s+(.+?)\s*$/gm)].map((match) => match[1].trim());
    const relatedIndex = headings.lastIndexOf("관련 항목");
    if (relatedIndex >= 0 && relatedIndex !== headings.length - 1) add("error", "sections.related_last", page.relativePath, "관련 항목 섹션은 마지막이어야 한다.");
    if (page.review.revision !== revisionFor(page.body, page.rawFrontmatter)) add("error", "review.revision", page.relativePath, "review.revision이 현재 본문·메타데이터와 일치하지 않는다.");
    if (page.editorialStatus === "active" && page.review.mode === "pending") add("error", "review.pending_active", page.relativePath, "active 문서에는 pending 검토 상태를 사용할 수 없다.");
    if (page.url !== `/docs/${page.id}/`) add("error", "route.id", page.relativePath, `ID 기반 URL이 아니다: ${page.url}`);
    const related = page.body.split(/^##\s+/m).find((section) => section.startsWith("관련 항목\n") || section.startsWith("관련 항목\r\n")) || "";
    const relatedItems = [...related.matchAll(/^[-*]\s+\[\[([^\]]+)\]\](.*)$/gm)];
    if (!["source", "reference"].includes(page.kind)) {
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
        if (access.kind === "local" || access.kind === "snapshot") {
          await checkLocalAccess({ access, page, root: resolvedRoot, rawRoot, add });
        }
      }
    }
  }

  const reportedUnresolved = new Set();
  for (const item of manifest.unresolved || []) {
    const target = String(item.target || "").split("#", 1)[0].trim();
    if (!target || plannedLinkKeys(item.page).has(key(target))) continue;
    const issueKey = `${item.page.relativePath}\0${key(target)}`;
    if (reportedUnresolved.has(issueKey)) continue;
    reportedUnresolved.add(issueKey);
    add("error", "links.unresolved", item.page.relativePath, `미해결 위키링크: ${target}`);
  }

  return summarize(pages.length, issues);
}

export async function runWikiLint({
  root = process.cwd(),
  manifest,
  json = false,
  write = (line) => console.log(line)
} = {}) {
  const summary = await collectWikiLintIssues({ root, manifest });
  if (json) {
    write(JSON.stringify(summary, null, 2));
  } else {
    for (const issue of summary.issues) write(`${issue.severity.toUpperCase()} ${issue.code} ${issue.page}: ${issue.message}`);
    write(`wiki lint: ${summary.errors} errors, ${summary.warnings} warnings`);
  }
  return summary;
}

if (process.argv[1] && resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1])) {
  const summary = await runWikiLint({
    root: process.cwd(),
    json: process.argv.includes("--json")
  });
  if (summary.errors) process.exitCode = 1;
}
