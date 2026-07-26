import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { basename, extname, join, relative } from "node:path";
import YAML from "yaml";
import { key, slugify } from "../site/core.mjs";
import { loadWikiManifest, revisionFor } from "./wiki_manifest.mjs";

const root = process.cwd();
const wikiRoot = join(root, "wiki");
const rawRoot = join(root, "raw");
const today = process.env.WIKI_TODAY || new Date().toISOString().slice(0, 10);
const report = { migrated: [], unresolvedEvidence: [], quoteLocators: [], logEntries: [], warnings: [] };

const ALLOWED_CAPABILITY = new Set([
  "computability", "complexity", "programmability", "realized-performance",
  "scalability", "resource-efficiency", "reliable-results"
]);
const ALLOWED_HISTORY = new Set(["theory", "machine", "architecture", "software", "system", "service", "measurement"]);

function dedupe(values) {
  return [...new Set((values || []).map((value) => String(value).trim()).filter(Boolean))];
}

function safeDate(value, fallback = today) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || "")) ? String(value) : fallback;
}

function hash(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

function fileMediaType(filePath) {
  const extension = extname(filePath).toLowerCase();
  return ({
    ".md": "text/markdown",
    ".txt": "text/plain",
    ".pdf": "application/pdf",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp"
  })[extension] || "application/octet-stream";
}

function work(citation, { genre = "other", edition = null } = {}) {
  const text = String(citation || "미기록").trim() || "미기록";
  const identifiers = [];
  const doi = text.match(/\b10\.\d{4,9}\/[A-Za-z0-9._;()/:+-]+/);
  if (doi) identifiers.push({ type: "doi", value: doi[0].replace(/[.,;)]+$/, "") });
  return { citation: text, genre, identifiers, edition: edition || null };
}

function genreFor(citation, page) {
  const text = `${citation} ${page.title}`.toLowerCase();
  if (/standard|rfc|cwe|nist|iso|ansi|wg14/.test(text)) return "standard";
  if (/manual|support|documentation|reference|language specification/.test(text)) return "manual";
  if (/archive|record|history|museum|collection/.test(text)) return "official-record";
  if (/doi|journal|proceedings|paper|theorem|formula|conjecture|publication/.test(text)) return "primary-literature";
  if (/wikipedia|blog|web|page|timeline|overview/.test(text)) return "web";
  return page.origin === "local" ? "raw-note" : "other";
}

function mapSourceNames(page, sourcePages, sourceByName) {
  if (["source", "reference"].includes(page.kind)) return [];
  const ids = [];
  for (const rawValue of page.sources || []) {
    const value = String(rawValue).trim();
    const normalized = value.replace(/\\/g, "/");
    const candidates = [
      value,
      basename(normalized),
      basename(normalized, extname(normalized)),
      basename(normalized, extname(normalized)).replace(/_해설$/u, "")
    ];
    let match = null;
    for (const candidate of candidates) {
      match = sourceByName.get(key(candidate));
      if (match) break;
    }
    if (!match && /_해설(?:\.md)?$/u.test(value)) {
      const base = value.replace(/_해설(?:\.md)?$/u, "");
      match = sourceByName.get(key(base));
    }
    if (match) {
      if (!ids.includes(match.id)) ids.push(match.id);
    } else {
      report.unresolvedEvidence.push({ page: page.relativePath, value });
    }
  }
  return ids;
}

async function localAccess(page) {
  const candidates = [
    `${page.title}.md`,
    `${page.title}.txt`,
    `${page.title}_해설.md`
  ];
  const paths = [];
  for (const name of candidates) {
    const path = join(rawRoot, name);
    if (existsSync(path)) paths.push(path);
  }
  if (!paths.length) {
    report.warnings.push(`${page.relativePath}: local source has no matching raw snapshot`);
  }
  const records = [];
  for (const path of paths) {
    const bytes = await readFile(path);
    records.push({
      kind: "local",
      role: basename(path).endsWith("_해설.md") ? "metadata" : "original",
      path: relative(root, path).replaceAll("\\", "/"),
      retrieved: safeDate(page.retrieved),
      version: page.version || null,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      media_type: fileMediaType(path),
      bytes: bytes.length
    });
  }
  return records;
}

function externalAccess(page) {
  const urls = dedupe(page.sourceUrls);
  return urls.map((url, index) => {
    let role = index === 0 ? "canonical" : "mirror";
    try {
      const host = new URL(url).hostname.toLowerCase();
      if (host.includes("doi.org")) role = "doi";
      else if (host.includes("archive") || host.includes("wikisource")) role = "archive";
      else if (host.includes("support") || host.includes("microsoft.com")) role = "publisher";
    } catch {
      report.warnings.push(`${page.relativePath}: invalid source URL '${url}'`);
    }
    return { kind: "url", role, url, retrieved: safeDate(page.retrieved), version: page.version || null };
  });
}

async function provenance(page) {
  const primary = dedupe(page.primarySources);
  const supporting = dedupe(page.supportingSources);
  const primaryCitations = primary.length ? primary : [page.title];
  const works = {
    primary: primaryCitations.map((citation) => work(citation, { genre: genreFor(citation, page), edition: page.version })),
    supporting: supporting.map((citation) => work(citation, { genre: genreFor(citation, page) }))
  };
  const access = page.origin === "local" ? await localAccess(page) : externalAccess(page);
  if (!access.length) {
    report.warnings.push(`${page.relativePath}: no provenance access record; using external-only placeholder`);
    access.push({ kind: "url", role: "canonical", url: `https://cs-wiki.local/source/${page.id}`, retrieved: today, version: null });
  }
  return { origin: page.origin || "external", works, access };
}

function historyFor(page, evidenceIds) {
  const publicationYear = Number.isInteger(page.history.publicationYear) ? page.history.publicationYear : null;
  const eventStart = Number.isInteger(page.history.eventStart) ? page.history.eventStart : null;
  const eventEnd = Number.isInteger(page.history.eventEnd) ? page.history.eventEnd : null;
  const layer = ALLOWED_HISTORY.has(page.history.historicalLayer) ? page.history.historicalLayer : "";
  const note = String(page.history.historicalNote || "").slice(0, 300);
  const result = {};
  if (publicationYear !== null) result.publication_year = publicationYear;
  if (eventStart !== null) {
    result.event = {
      start: eventStart,
      ...(eventEnd !== null ? { end: eventEnd } : {}),
      basis: ["source", "reference"].includes(page.kind) ? "publication-process" : "representative",
      evidence_id: evidenceIds[0] || null
    };
  }
  if (note) result.note = note;
  if (layer) result.layer = layer;
  return Object.keys(result).length ? result : undefined;
}

function oldRoute(page) {
  return `/${page.category}/${slugify(page.title)}/`;
}

function frontmatterFor(page, body, evidenceIds, provenanceData) {
  const id = page.relativePath === "wiki/index.md"
    ? "meta-index"
    : page.relativePath === "wiki/overview.md"
      ? "meta-overview"
      : page.relativePath === "wiki/log.md"
        ? "meta-log"
        : page.id;
  const kind = page.relativePath === "wiki/index.md" || page.relativePath === "wiki/overview.md" || page.relativePath === "wiki/log.md" ? "meta" : page.kind;
  const editorialStatus = page.editorialStatus === "archived" ? "retired" : page.editorialStatus;
  const legacy = oldRoute(page);
  const redirects = dedupe([
    legacy,
    ...(page.category === "references" ? [`/sources/${slugify(page.title)}/`] : []),
    ...(page.redirectFrom || [])
  ]);
  const data = {
    schema_version: 2,
    id,
    kind,
    title: page.title,
    aliases: dedupe(page.aliases),
    summary: String(page.summary || page.title).replaceAll("`", ""),
    domains: dedupe(page.domains),
    editorial_status: editorialStatus,
    publication_visibility: "public",
    graph_visibility: page.graphVisibility || (kind === "meta" ? "hidden" : "public"),
    created: safeDate(page.created),
    updated: today,
    review: {
      mode: editorialStatus === "active" ? "legacy-baseline" : "pending",
      revision: null,
      reviewed_at: null,
      reviewed_by: editorialStatus === "active" ? "legacy-baseline" : null
    },
    evidence_ids: evidenceIds,
    capability_layers: dedupe(page.capabilityLayers).filter((layer) => ALLOWED_CAPABILITY.has(layer)),
    ...(historyFor(page, evidenceIds) ? { history: historyFor(page, evidenceIds) } : {}),
    ...(redirects.length ? { redirect_from: redirects } : {}),
    ...(provenanceData ? provenanceData : {})
  };
  data.review.revision = revisionFor(body, data);
  return data;
}

function quoteMarker(page, line, evidenceId, section) {
  const locator = `${page.relativePath}:line-${line}${section ? `#${slugify(section)}` : ""}`;
  return `<!-- wiki-v2:quote-locator evidence="${evidenceId}" locator="${locator}" status="recorded" -->`;
}

function annotateQuotes(body, page) {
  if (!["source", "reference"].includes(page.kind)) return { body, count: 0 };
  const lines = body.split(/\r?\n/);
  const output = [];
  let section = "";
  let count = 0;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const heading = line.match(/^#{2,6}\s+(.+?)\s*$/);
    if (heading) section = heading[1];
    if (/^>\s*\[!\w+/u.test(line)) {
      output.push(line);
      continue;
    }
    if (/^>\s?/.test(line)) {
      const start = index + 1;
      const quoteLines = [line];
      while (index + 1 < lines.length && /^>\s?/.test(lines[index + 1]) && !/^>\s*\[!\w+/u.test(lines[index + 1])) {
        index += 1;
        quoteLines.push(lines[index]);
      }
      output.push(...quoteLines);
      const marker = quoteMarker(page, start, page.id, section);
      if (!output.includes(marker)) {
        output.push(marker);
        count += 1;
      }
      continue;
    }
    output.push(line);
  }
  return { body: output.join("\n"), count };
}

function evidenceBlock(ids) {
  const lines = ids.length ? ids.map((id) => `- \`${id}\``) : ["- 없음"];
  return `<!-- wiki-v2:evidence-start -->\n### 근거 ID\n${lines.join("\n")}\n<!-- wiki-v2:evidence-end -->`;
}

function insertEvidenceBlock(body, ids) {
  const block = evidenceBlock(ids);
  const marker = /<!-- wiki-v2:evidence-start -->[\s\S]*?<!-- wiki-v2:evidence-end -->/;
  if (marker.test(body)) return body.replace(marker, block);
  const heading = body.match(/^##\s+출처.*$/m);
  if (heading) {
    const position = heading.index + heading[0].length;
    return `${body.slice(0, position)}\n\n${block}${body.slice(position)}`;
  }
  const related = body.match(/^##\s+관련 항목.*$/m);
  if (related) {
    return `${body.slice(0, related.index)}${block}\n\n${body.slice(related.index)}`;
  }
  return `${body.trimEnd()}\n\n## 출처\n\n${block}\n\n## 관련 항목\n\n- 없음 — 후속 연결을 준비 중이다.`;
}

function renderFile(data, body) {
  return `---\n${YAML.stringify(data, { lineWidth: 0 }).trimEnd()}\n---\n\n${body.trim()}\n`;
}

async function parseLogEntries(raw) {
  const entries = [];
  const lines = raw.split(/\r?\n/);
  let current = null;
  for (const line of lines) {
    const heading = line.match(/^##\s+\[(\d{4}-\d{2}-\d{2})\]\s+([^|]+)\|\s*(.+?)\s*$/);
    if (heading) {
      if (current) entries.push(current);
      current = { date: heading[1], type: heading[2].trim(), title: heading[3].trim(), lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) entries.push(current);
  return entries;
}

async function writeLogEntries(oldLog) {
  const entries = await parseLogEntries(oldLog);
  const logDir = join(wikiRoot, "logs");
  await mkdir(logDir, { recursive: true });
  const links = [];
  for (const [index, entry] of entries.entries()) {
    const id = `log-${entry.date}-${String(index + 1).padStart(3, "0")}`;
    const filename = `${id}-${slugify(entry.title).slice(0, 60)}.md`;
    const path = join(logDir, filename);
    const data = {
      schema_version: 2, id, kind: "meta", title: `${entry.date} ${entry.type} | ${entry.title}`,
      aliases: [], summary: `${entry.date}에 수행한 ${entry.type} 작업의 변경 기록.`, domains: [],
      editorial_status: "active", publication_visibility: "unlisted", graph_visibility: "hidden",
      created: safeDate(entry.date), updated: today,
      review: { mode: "legacy-baseline", revision: null, reviewed_at: null, reviewed_by: "migration:v2" },
      evidence_ids: [], capability_layers: []
    };
    const body = entry.lines.join("\n").trim() || "기록된 세부 내용이 없다.";
    data.review.revision = revisionFor(body, data);
    await writeFile(path, renderFile(data, body), "utf8");
    links.push(`- [${entry.date} ${entry.type} | ${entry.title}](logs/${filename})`);
    report.logEntries.push({ id, path: relative(root, path).replaceAll("\\", "/") });
  }
  return links;
}

function operationalBody(pages, category) {
  const grouped = new Map();
  for (const page of pages.filter((item) => item.category === category)) {
    if (!grouped.has(category)) grouped.set(category, []);
    grouped.get(category).push(page);
  }
  const label = { sources: "소스", references: "참고 자료", concepts: "개념", entities: "개체", analyses: "분석", meta: "메타" }[category] || category;
  const items = (grouped.get(category) || []).sort((a, b) => a.title.localeCompare(b.title, "ko"))
    .map((page) => `- [[${page.title}]] — ${page.summary}`).join("\n");
  return `## ${label}\n\n${items || "- 없음"}\n\n## 출처\n\n${evidenceBlock([])}\n\n## 관련 항목\n\n- 없음 — 운영 페이지의 자동 목록을 사용한다.`;
}

async function main() {
  const manifest = await loadWikiManifest({ root, wikiRoot, strict: false });
  const pages = manifest.pages;
  if (!pages.some((page) => page.schemaVersion !== 2)) {
    console.log(JSON.stringify({ migrated: 0, message: "wiki is already on schema v2; no files changed" }, null, 2));
    return;
  }
  const sourcePages = pages.filter((page) => ["source", "reference"].includes(page.kind));
  const sourceByName = new Map();
  for (const source of sourcePages) {
    const filename = basename(source.relativePath);
    const stem = filename.replace(/\.md$/i, "");
    for (const value of [source.id, source.title, stem, filename, ...source.aliases]) sourceByName.set(key(value), source);
    if (source.origin === "local") {
      sourceByName.set(key(`${stem}_해설.md`), source);
      sourceByName.set(key(`${stem}_해설`), source);
    }
  }

  const originalLog = await readFile(join(wikiRoot, "log.md"), "utf8");
  const logLinks = await writeLogEntries(originalLog);
  const contentPages = [];
  for (const page of pages) {
    if (page.relativePath === "wiki/log.md") continue;
    let body = page.body;
    const evidenceIds = mapSourceNames(page, sourcePages, sourceByName);
    const quoteResult = annotateQuotes(body, page);
    body = quoteResult.body;
    if (quoteResult.count) report.quoteLocators.push({ page: page.relativePath, count: quoteResult.count });
    body = insertEvidenceBlock(body, evidenceIds);
    const provenanceData = ["source", "reference"].includes(page.kind) ? await provenance(page) : null;
    const data = frontmatterFor(page, body, evidenceIds, provenanceData);
    const output = renderFile(data, body);
    await writeFile(join(root, page.relativePath), output, "utf8");
    contentPages.push({ ...page, id: data.id, kind: data.kind, category: page.category, title: data.title, summary: data.summary, body, data });
    report.migrated.push(page.relativePath);
  }

  const indexPage = contentPages.find((page) => page.relativePath === "wiki/index.md");
  if (indexPage) {
    const body = `<!-- wiki-v2:generated index -->\n# 위키 색인\n\n${["sources", "references", "concepts", "entities", "analyses", "meta"].map((category) => operationalBody(contentPages.filter((p) => !["wiki/index.md", "wiki/overview.md", "wiki/log.md"].includes(p.relativePath)), category)).join("\n\n")}`;
    const data = frontmatterFor(indexPage, body, [], null);
    await writeFile(join(root, indexPage.relativePath), renderFile(data, body), "utf8");
  }
  const overviewPage = contentPages.find((page) => page.relativePath === "wiki/overview.md");
  if (overviewPage) {
    const knowledge = contentPages.filter((page) => !["wiki/index.md", "wiki/overview.md", "wiki/log.md"].includes(page.relativePath));
    const counts = Object.fromEntries(["sources", "references", "concepts", "entities", "analyses", "meta"].map((category) => [category, knowledge.filter((page) => page.category === category).length]));
    const body = `<!-- wiki-v2:generated overview -->\n# CS Wiki 개요\n\n운영 스키마 v2로 관리되는 지식 베이스다. 모든 문서는 공개 목록에 포함되며, 수정 시 근거와 검토 상태를 함께 갱신한다.\n\n## 현재 규모\n\n- 전체 페이지: ${knowledge.length}개\n- 정규 소스: ${counts.sources}개\n- 참고 자료: ${counts.references}개\n- 개념: ${counts.concepts}개\n- 개체: ${counts.entities}개\n- 분석: ${counts.analyses}개\n\n## 주요 항목\n\n- [[위키 색인]] — 문서 전체의 자동 색인.\n- [[작업 로그]] — 작업별 상세 기록의 목록.\n\n## 출처\n\n${evidenceBlock([])}\n\n## 관련 항목\n\n- [[위키 색인]] — 전체 문서를 유형별로 탐색한다.`;
    const data = frontmatterFor(overviewPage, body, [], null);
    await writeFile(join(root, overviewPage.relativePath), renderFile(data, body), "utf8");
  }
  const logPage = contentPages.find((page) => page.relativePath === "wiki/log.md") || pages.find((page) => page.relativePath === "wiki/log.md");
  if (logPage) {
    const body = `<!-- wiki-v2:generated log -->\n# 작업 로그\n\n작업별 상세 기록은 항목 파일로 분리했다.\n\n${logLinks.join("\n")}\n\n## 출처\n\n${evidenceBlock([])}\n\n## 관련 항목\n\n- [[위키 색인]] — 변경된 문서 목록을 확인한다.`;
    const data = frontmatterFor(logPage, body, [], null);
    await writeFile(join(root, logPage.relativePath), renderFile(data, body), "utf8");
  }

  const quoteAuditBody = `# 인용 위치 감사\n\n기존 소스·참고 자료 페이지의 직접 인용에 문서·행 기반 위치 표식을 추가했다. 표식은 원문 대조를 위한 재현 가능한 출발점이며, 외부 문헌의 페이지 번호를 추정하지 않는다.\n\n## 집계\n\n- 위치 표식이 추가된 페이지: ${report.quoteLocators.length}개\n- 위치 표식 수: ${report.quoteLocators.reduce((sum, item) => sum + item.count, 0)}개\n- 분석·개념 페이지의 비인용 블록인용은 편집자 서술로 보존하고 직접 인용으로 오인하지 않았다.\n\n## 출처\n\n${evidenceBlock([])}\n\n## 관련 항목\n\n- [[위키 개요]] — 전체 운영 상태를 확인한다.`;
  const quoteAuditData = {
    schema_version: 2, id: "meta-quote-locator-audit", kind: "meta", title: "인용 위치 감사", aliases: [],
    summary: "기존 직접 인용과 위치 표식의 이행 결과를 기록하는 운영 감사 페이지.", domains: [], editorial_status: "active",
    publication_visibility: "public", graph_visibility: "hidden", created: today, updated: today,
    review: { mode: "legacy-baseline", revision: null, reviewed_at: null, reviewed_by: "migration:v2" }, evidence_ids: [], capability_layers: []
  };
  quoteAuditData.review.revision = revisionFor(quoteAuditBody, quoteAuditData);
  await writeFile(join(wikiRoot, "meta", "인용 위치 감사.md"), renderFile(quoteAuditData, quoteAuditBody), "utf8");
  report.migrated.push("wiki/meta/인용 위치 감사.md");

  await writeFile(join(root, "output", "wiki-v2-migration-report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ migrated: report.migrated.length, logs: report.logEntries.length, quoteLocators: report.quoteLocators.reduce((sum, item) => sum + item.count, 0), unresolvedEvidence: report.unresolvedEvidence.length, warnings: report.warnings.length }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
