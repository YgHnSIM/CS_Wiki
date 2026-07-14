import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { basename, dirname, extname, join, relative, sep } from "node:path";
import { createHash } from "node:crypto";
import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
import { domainMeta, learningPaths, statusMeta } from "./catalog.mjs";

const root = process.cwd();
const wikiRoot = join(root, "wiki");
const distRoot = join(root, "dist");
const rawAssets = join(root, "raw", "assets");
const siteBase = normalizeBase(process.env.SITE_BASE || "");
const siteUrl = (process.env.SITE_URL || "").replace(/\/$/, "");
const repositoryUrl = "https://github.com/YgHnSIM/CS_Wiki";
const assetVersion = createHash("sha256")
  .update(await readFile(join(root, "site", "assets", "site.css")))
  .update(await readFile(join(root, "site", "assets", "site.js")))
  .digest("hex")
  .slice(0, 12);

const categoryMeta = {
  sources: { label: "정규 소스", description: "raw에 보존한 원본을 직접 처리한 정규 소스 노트" },
  references: { label: "참고 자료", description: "논문·표준·공식 기록으로 기존 지식을 보강한 외부 참고 자료" },
  entities: { label: "인물", description: "컴퓨터 과학의 형성에 관여한 연구자와 설계자" },
  concepts: { label: "개념", description: "컴퓨팅의 원리, 구조, 언어를 연결하는 핵심 개념" },
  analyses: { label: "분석", description: "여러 소스와 개념을 비교하고 연결한 종합 분석" },
  meta: { label: "메타", description: "위키의 운영 상태와 전체 지식 구조" }
};
const navCategories = ["sources", "references", "concepts", "entities", "analyses"];

function normalizeBase(value) {
  if (!value || value === "/") return "";
  return `/${value.replace(/^\/+|\/+$/g, "")}`;
}

function withBase(pathname = "/") {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${siteBase}${path}`;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function slugify(value = "") {
  return String(value)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "") || "page";
}

function parseScalar(value = "") {
  const trimmed = String(value).trim();
  if (!trimmed || trimmed === "null" || trimmed === "~") return "";
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed.slice(1, -1);
    }
  }
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replaceAll("''", "'");
  }
  return trimmed;
}

function parseFlowList(value = "") {
  const input = String(value).trim();
  if (!input.startsWith("[") || !input.endsWith("]")) return input ? [parseScalar(input)] : [];
  const items = [];
  let current = "";
  let quote = "";
  for (const character of input.slice(1, -1)) {
    if ((character === '"' || character === "'") && (!quote || quote === character)) {
      quote = quote ? "" : character;
      current += character;
    } else if (character === "," && !quote) {
      if (current.trim()) items.push(parseScalar(current));
      current = "";
    } else {
      current += character;
    }
  }
  if (current.trim()) items.push(parseScalar(current));
  return items;
}

function parseDocument(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return { data: {}, content: raw };
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (field) data[field[1]] = field[2].trim();
  }
  return { data, content: raw.slice(match[0].length) };
}

function cleanInline(value = "") {
  return String(value)
    .replace(/!?(?:\[\[)([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/g, (_, target, label) => label || target)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_>#\[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function describe(body = "") {
  const paragraph = body
    .split(/\r?\n\r?\n/)
    .map((part) => part.trim())
    .find((part) => part && !part.startsWith("#") && !part.startsWith("-") && !part.startsWith("<!--"));
  const value = cleanInline(paragraph || "출처 기반으로 정리한 CS Wiki 문서");
  return value.length > 160 ? `${value.slice(0, 157)}...` : value;
}

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(path);
    return extname(entry.name).toLowerCase() === ".md" ? [path] : [];
  }));
  return nested.flat();
}

function getCategory(filePath, tags = []) {
  const rel = relative(wikiRoot, filePath).split(sep);
  if (rel[0] === "sources") return tags.includes("type/reference") ? "references" : "sources";
  return rel.length > 1 && categoryMeta[rel[0]] ? rel[0] : "meta";
}

function extractWikiTargets(body) {
  return [...body.matchAll(/(?<!!)\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g)]
    .map((match) => match[1].trim());
}

function key(value) {
  return String(value || "").normalize("NFKC").trim().toLocaleLowerCase("ko-KR");
}

const files = await markdownFiles(wikiRoot);
const pages = await Promise.all(files.map(async (filePath) => {
  const raw = await readFile(filePath, "utf8");
  const parsed = parseDocument(raw);
  const title = parseScalar(parsed.data.title) || basename(filePath, ".md");
  const tags = parseFlowList(parsed.data.tags);
  const category = getCategory(filePath, tags);
  const slug = slugify(title);
  return {
    filePath,
    relativePath: relative(root, filePath).split(sep).join("/"),
    title,
    summary: parseScalar(parsed.data.summary) || describe(parsed.content),
    aliases: parseFlowList(parsed.data.aliases),
    tags,
    sources: parseFlowList(parsed.data.sources),
    status: parseScalar(parsed.data.status) || "draft",
    created: parseScalar(parsed.data.created),
    updated: parseScalar(parsed.data.updated),
    sourceId: parseScalar(parsed.data.source_id),
    sourceKind: parseScalar(parsed.data.source_kind),
    primarySources: parseFlowList(parsed.data.primary_sources),
    supportingSources: parseFlowList(parsed.data.supporting_sources),
    sourceUrls: parseFlowList(parsed.data.source_urls),
    retrieved: parseScalar(parsed.data.retrieved),
    version: parseScalar(parsed.data.version),
    snapshotStatus: parseScalar(parsed.data.snapshot_status),
    body: parsed.content.trim(),
    description: parseScalar(parsed.data.summary) || describe(parsed.content),
    category,
    slug,
    url: `/${category}/${slug}/`,
    targets: extractWikiTargets(parsed.content),
    incoming: 0
  };
}));

pages.sort((a, b) => a.title.localeCompare(b.title, "ko"));

const lookup = new Map();
for (const page of pages) {
  const filename = basename(page.filePath, ".md");
  [page.title, filename, ...page.aliases].forEach((name) => {
    const normalized = key(name);
    if (normalized && !lookup.has(normalized)) lookup.set(normalized, page);
  });
}

for (const page of pages) {
  page.links = [...new Set(page.targets.map((target) => lookup.get(key(target))).filter(Boolean))];
  for (const linked of page.links) linked.incoming += 1;
  page.score = page.incoming + page.links.length;
}

const resolvedLearningPaths = learningPaths.map((path) => ({
  ...path,
  pages: path.pages.map((title) => {
    const page = lookup.get(key(title));
    if (!page) throw new Error(`Learning path '${path.title}' references missing page '${title}'`);
    return page;
  })
}));

const pathsByPage = new Map();
for (const path of resolvedLearningPaths) {
  path.pages.forEach((page, index) => {
    if (!pathsByPage.has(page)) pathsByPage.set(page, []);
    pathsByPage.get(page).push({ path, index });
  });
}

const headingSlugs = new Map();
const md = new MarkdownIt({ html: false, linkify: true, typographer: false })
  .use(anchor, {
    slugify: (value) => {
      const base = slugify(value);
      const seen = headingSlugs.get(base) || 0;
      headingSlugs.set(base, seen + 1);
      return seen ? `${base}-${seen + 1}` : base;
    },
    permalink: anchor.permalink.linkInsideHeader({
      symbol: "#",
      placement: "before",
      ariaHidden: true,
      class: "heading-anchor"
    })
  });

function renderWikiLinks(body) {
  return body
    .replace(/!\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, label) => {
      const name = target.trim();
      const alt = escapeHtml((label || basename(name, extname(name))).trim());
      return `![${alt}](${withBase(`/assets/raw/${encodeURI(name)}`)})`;
    })
    .replace(/\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g, (_, rawTarget, section, label) => {
      const target = rawTarget.trim();
      const page = lookup.get(key(target));
      const text = escapeHtml((label || target).trim());
      if (!page) return `<span class="missing-link" title="아직 생성되지 않은 페이지">${text}</span>`;
      const hash = section ? `#${slugify(section.trim())}` : "";
      return `[${text}](${withBase(page.url)}${hash})`;
    });
}

function renderMarkdown(page) {
  headingSlugs.clear();
  const body = page.body.replace(/\r?\n## 관련 항목\s*[\s\S]*$/m, "").trim();
  return md.render(renderWikiLinks(body));
}

function pageHeadings(page) {
  const body = page.body.replace(/\r?\n## 관련 항목\s*[\s\S]*$/m, "");
  const seen = new Map();
  return [...body.matchAll(/^##\s+(.+?)\s*$/gm)].map((match) => {
    const title = cleanInline(match[1]);
    const base = slugify(title);
    const count = seen.get(base) || 0;
    seen.set(base, count + 1);
    return { title, id: count ? `${base}-${count + 1}` : base };
  });
}

function categoryUrl(category) {
  return `/${category}/`;
}

const counts = Object.fromEntries(Object.keys(categoryMeta).map((category) => [
  category,
  pages.filter((page) => page.category === category).length
]));

const statusCounts = pages.reduce((acc, page) => {
  acc[page.status] = (acc[page.status] || 0) + 1;
  return acc;
}, {});

const domainCounts = pages.reduce((acc, page) => {
  page.tags.filter((tag) => tag.startsWith("domain/")).forEach((tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
  });
  return acc;
}, {});

function navLinks(canonicalPath) {
  const categoryLinks = navCategories.map((category) => {
    const meta = categoryMeta[category];
    const active = canonicalPath.startsWith(categoryUrl(category));
    return `<a class="nav-link" href="${withBase(categoryUrl(category))}"${active ? ' aria-current="page"' : ""}>
      <span>${meta.label}</span><span class="nav-count">${counts[category]}</span>
    </a>`;
  }).join("");
  const pathActive = canonicalPath.startsWith("/paths/");
  return `${categoryLinks}<a class="nav-link path-nav" href="${withBase("/paths/")}"${pathActive ? ' aria-current="page"' : ""}>
    <span>학습 경로</span><span class="nav-count">${resolvedLearningPaths.length}</span>
  </a>`;
}

function layout({ title, description, content, canonicalPath = "/", bodyClass = "", graphData = null }) {
  const fullTitle = title === "CS Wiki" ? title : `${title} · CS Wiki`;
  const canonical = siteUrl ? `${siteUrl}${canonicalPath}` : "";
  const nav = navLinks(canonicalPath);
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark">
  <meta name="theme-color" content="#0A0014">
  <title>${escapeHtml(fullTitle)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta property="og:title" content="${escapeHtml(fullTitle)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  ${canonical ? `<link rel="canonical" href="${canonical}"><meta property="og:url" content="${canonical}">` : ""}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <link rel="preload" href="${withBase("/assets/fonts/D2Coding.woff2")}" as="font" type="font/woff2" crossorigin>
  <link rel="icon" href="${withBase("/assets/favicon.svg")}" type="image/svg+xml">
  <link rel="stylesheet" href="${withBase("/assets/site.css")}?v=${assetVersion}">
</head>
<body class="${escapeHtml(bodyClass)}">
  <a class="skip-link" href="#content">본문으로 이동</a>
  <div class="scanline" aria-hidden="true"></div>
  <header class="topbar">
    <a class="brand" href="${withBase("/")}" aria-label="CS Wiki 홈">
      <span class="brand-mark">CS_WIKI</span>
      <span class="brand-description">컴퓨터 과학 문헌 아카이브</span>
    </a>
    <nav class="desktop-nav" aria-label="주요 탐색">${nav}</nav>
    <button class="search-trigger" type="button" data-open-search>
      <span>검색</span><kbd>Ctrl K</kbd>
    </button>
    <button class="menu-trigger" type="button" aria-expanded="false" aria-controls="mobile-menu">메뉴</button>
  </header>
  <nav class="mobile-nav" id="mobile-menu" aria-label="모바일 탐색" hidden>${nav}</nav>
  <main id="content">${content}</main>
  <footer class="footer">
    <p>원본 소스에 근거해 연결하는 컴퓨터 과학 위키</p>
    <div><a href="${withBase("/meta/")}">운영 정보</a><a href="${repositoryUrl}">GitHub 저장소</a><span>${pages.length}개 문서</span><span>검증됨 ${statusCounts.active || 0}</span></div>
  </footer>
  <dialog class="search-dialog" data-search-dialog>
    <form method="dialog" class="search-header">
      <label for="site-search">전체 문서 검색</label>
      <button type="submit">닫기</button>
    </form>
    <input id="site-search" type="search" autocomplete="off" placeholder="제목, 개념, 인물, 본문 검색" data-search-input>
    <div class="search-controls">
      <label>자료 유형<select data-search-category>
        <option value="">전체</option>
        ${Object.entries(categoryMeta).map(([value, meta]) => `<option value="${value}">${meta.label}</option>`).join("")}
      </select></label>
      <label>상태<select data-search-status>
        <option value="">전체</option>
        ${Object.entries(statusMeta).map(([value, meta]) => `<option value="${value}">${meta.label}</option>`).join("")}
      </select></label>
      <output data-search-count aria-live="polite"></output>
    </div>
    <p class="search-hint">위아래 방향키로 이동하고 Enter로 문서를 엽니다.</p>
    <div class="search-results" data-search-results aria-live="polite"></div>
  </dialog>
  ${graphData ? `<script type="application/json" id="graph-data">${JSON.stringify(graphData).replaceAll("<", "\\u003c")}</script>` : ""}
  <script>window.CS_WIKI_BASE=${JSON.stringify(siteBase)};window.CS_WIKI_ASSET_VERSION=${JSON.stringify(assetVersion)};</script>
  <script src="${withBase("/assets/site.js")}?v=${assetVersion}" defer></script>
</body>
</html>`;
}

function pageDomains(page) {
  return page.tags.filter((tag) => tag.startsWith("domain/"));
}

function statusLabel(status) {
  return statusMeta[status]?.label || status;
}

function sourceTarget(value) {
  return lookup.get(key(value)) || lookup.get(key(basename(value, extname(value))));
}

function effectiveSources(page) {
  return [...new Set(page.sources.map(sourceTarget).filter((target) => target?.category === "sources" || target?.category === "references"))];
}

function pageCard(page, { compact = false, step = "" } = {}) {
  const domains = pageDomains(page);
  const sourceCount = effectiveSources(page).length || page.sources.length;
  return `<article class="document-card${compact ? " compact" : ""}"
    data-document-card data-title="${escapeHtml(page.title)}" data-summary="${escapeHtml(page.summary)}"
    data-status="${escapeHtml(page.status)}" data-domains="${escapeHtml(domains.join(","))}"
    data-updated="${escapeHtml(page.updated || page.created || "")}" data-score="${page.score}">
    <div class="card-meta"><span>${step || categoryMeta[page.category].label}</span><span class="status-label ${escapeHtml(page.status)}">${escapeHtml(statusLabel(page.status))}</span></div>
    <h3><a href="${withBase(page.url)}">${escapeHtml(page.title)}</a></h3>
    ${compact ? "" : `<p>${escapeHtml(page.summary)}</p>`}
    ${compact || !domains.length ? "" : `<div class="card-domains">${domains.slice(0, 2).map((tag) => `<span>${escapeHtml(domainMeta[tag] || tag.replace("domain/", ""))}</span>`).join("")}</div>`}
    <div class="card-foot"><time>${page.updated || page.created || "날짜 미기록"}</time><span>${sourceCount ? `근거 ${sourceCount}` : `연결 ${page.score}`}</span></div>
  </article>`;
}

function graphPayload() {
  const graphPages = [...pages]
    .filter((page) => page.category !== "meta")
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "ko"))
    .slice(0, 12);
  const ids = new Map(graphPages.map((page, index) => [page, index]));
  const edges = [];
  for (const page of graphPages) {
    for (const linked of page.links) {
      if (ids.has(linked) && ids.get(page) < ids.get(linked)) edges.push([ids.get(page), ids.get(linked)]);
    }
  }
  return {
    nodes: graphPages.map((page) => ({ title: page.title, url: withBase(page.url), category: page.category, score: page.score })),
    edges
  };
}

function graphNodeList(graph) {
  return `<ol class="graph-node-list" aria-label="연결이 많은 문서 목록">${graph.nodes.map((node, index) => `
    <li><a href="${node.url}"><span>${String(index + 1).padStart(2, "0")}</span>${escapeHtml(node.title)}</a></li>`).join("")}</ol>`;
}

function pathCard(path, index, compact = false) {
  const first = path.pages[0];
  const last = path.pages.at(-1);
  return `<a class="learning-path-card${compact ? " compact" : ""}" href="${withBase(`/paths/${path.slug}/`)}">
    <span class="route-index">${String(index + 1).padStart(2, "0")}</span>
    <h3>${escapeHtml(path.title)}</h3>
    <p>${escapeHtml(path.description)}</p>
    <div><span>${path.pages.length}단계</span><span>${escapeHtml(first.title)} → ${escapeHtml(last.title)}</span></div>
  </a>`;
}

function homePage() {
  const graph = graphPayload();
  const featured = [...pages]
    .filter((page) => page.category === "analyses")
    .sort((a, b) => b.score - a.score || b.updated.localeCompare(a.updated))
    .slice(0, 4);
  const recent = [...pages]
    .filter((page) => page.category !== "meta")
    .sort((a, b) => b.updated.localeCompare(a.updated) || b.score - a.score)
    .slice(0, 6);
  const routes = ["sources", "references", "concepts", "entities", "analyses"].map((category, routeIndex) => {
    const top = [...pages].filter((page) => page.category === category).sort((a, b) => b.score - a.score)[0];
    return `<a class="route-card" href="${withBase(categoryUrl(category))}">
      <span class="route-index">${String(routeIndex + 1).padStart(2, "0")}</span>
      <h3>${categoryMeta[category].label}</h3>
      <p>${categoryMeta[category].description}</p>
      <div><span>${counts[category]}개 문서</span>${top ? `<span>주요 문서: ${escapeHtml(top.title)}</span>` : ""}</div>
    </a>`;
  }).join("");

  const content = `
  <section class="hero section-frame">
    <div class="hero-copy">
      <p class="eyebrow">정규 소스 ${counts.sources} · 참고 자료 ${counts.references} · 검증된 문서 ${statusCounts.active || 0}</p>
      <h1><span class="hero-title-line hero-title-primary">컴퓨팅의 역사를</span><span class="hero-title-line hero-title-accent">연결해서 읽는다.</span></h1>
      <p class="hero-intro">배비지와 러브레이스에서 저장 프로그램 컴퓨터, 구조적 프로그래밍, Unix와 C, 유니코드까지. 원본 문헌에서 출발해 개념과 분석을 잇는 기술 위키입니다.</p>
      <div class="hero-actions">
        <button type="button" class="primary-action" data-open-search>문서 검색</button>
        <a href="${withBase("/paths/")}">학습 경로 보기</a>
      </div>
      <dl class="hero-stats">
        <div><dt>전체 문서</dt><dd>${pages.length}</dd></div>
        <div><dt>개념</dt><dd>${counts.concepts}</dd></div>
        <div><dt>학습 경로</dt><dd>${resolvedLearningPaths.length}</dd></div>
        <div><dt>핵심 분석</dt><dd>${counts.analyses}</dd></div>
      </dl>
    </div>
    <div class="graph-panel">
      <div class="panel-heading"><h2>지식 연결망</h2><span>연결이 많은 문서 ${Math.min(12, pages.length)}개</span></div>
      <canvas id="knowledge-graph" aria-hidden="true"></canvas>
      <details class="graph-list-disclosure"><summary>문서 목록 보기</summary>${graphNodeList(graph)}</details>
    </div>
  </section>
  <section class="content-section">
    <div class="section-heading"><span>01</span><div><h2>주제별 학습 경로</h2><p>원문에서 개념과 분석으로 이어지는 순서를 따라 읽을 수 있습니다.</p></div></div>
    <div class="learning-path-grid">${resolvedLearningPaths.map((path, index) => pathCard(path, index)).join("")}</div>
  </section>
  <section class="content-section">
    <div class="section-heading"><span>02</span><div><h2>자료 유형별 탐색</h2><p>정규 소스, 외부 참고 자료, 개념, 인물과 분석을 구분해 찾습니다.</p></div></div>
    <div class="route-grid">${routes}</div>
  </section>
  <section class="content-section scope-section">
    <div class="section-heading"><span>03</span><div><h2>현재 지식 범위</h2><p>현재 콘텐츠는 컴퓨팅사와 소프트웨어 공학을 중심으로 확장되고 있습니다.</p></div></div>
    <div class="scope-grid">${Object.entries(domainCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([domain, count]) => `<div><span>${escapeHtml(domainMeta[domain] || domain.replace("domain/", ""))}</span><strong>${count}</strong></div>`).join("")}</div>
    <p class="scope-note">알고리즘, 데이터베이스, 네트워크, 분산 시스템과 인공지능은 관련 원본 소스가 추가될 때 같은 출처 검증 절차로 확장합니다.</p>
  </section>
  <section class="content-section split-section">
    <div>
      <div class="section-heading"><span>04</span><div><h2>핵심 분석</h2><p>여러 문헌을 가로질러 하나의 질문을 추적합니다.</p></div></div>
      <div class="feature-list">${featured.map((page, index) => `<div class="feature-item"><span>${String(index + 1).padStart(2, "0")}</span>${pageCard(page, { compact: true })}</div>`).join("")}</div>
    </div>
    <aside class="recent-panel">
      <div class="panel-heading"><h2>최근 갱신</h2><span>updated 기준</span></div>
      <ol>${recent.map((page) => `<li><a href="${withBase(page.url)}"><span>${escapeHtml(page.title)}</span><time>${page.updated}</time></a></li>`).join("")}</ol>
    </aside>
  </section>`;
  return layout({
    title: "CS Wiki",
    description: "원본 문헌에서 출발해 컴퓨터 과학의 역사, 인물, 개념, 분석을 연결하는 기술 위키",
    content,
    bodyClass: "home-page",
    graphData: graph
  });
}

function evidenceItem(value) {
  const target = sourceTarget(value);
  if (target) return `<li><a href="${withBase(target.url)}">${escapeHtml(target.title)}</a><span>${categoryMeta[target.category].label}</span></li>`;
  return `<li><span>${escapeHtml(value)}</span></li>`;
}

function evidenceTrace(page) {
  const isSource = page.category === "sources" || page.category === "references";
  const direct = isSource ? page.primarySources : page.sources;
  const supporting = isSource ? page.supportingSources : [];
  const evidenceLabel = isSource ? "직접 근거" : "연결된 근거";
  const snapshotLabels = { local: "로컬 원본", "external-only": "외부 링크", archived: "보존 스냅샷" };
  return `<details class="evidence-trace">
    <summary><span>근거 추적</span><strong>${direct.length}개 ${evidenceLabel}</strong></summary>
    <div class="trace-grid">
      <section class="trace-stage"><span>01</span><div><h2>현재 문서</h2><p>${escapeHtml(page.title)} · ${escapeHtml(statusLabel(page.status))}</p></div></section>
      <section class="trace-stage"><span>02</span><div><h2>${evidenceLabel}</h2>${direct.length ? `<ul>${direct.map(evidenceItem).join("")}</ul>` : "<p>메타 문서에는 연결된 근거가 없습니다.</p>"}</div></section>
      ${supporting.length ? `<section class="trace-stage"><span>03</span><div><h2>보조 자료</h2><ul>${supporting.map(evidenceItem).join("")}</ul></div></section>` : ""}
      ${isSource ? `<section class="trace-stage"><span>${supporting.length ? "04" : "03"}</span><div><h2>재현 정보</h2><dl>
        <div><dt>소스 ID</dt><dd>${escapeHtml(page.sourceId || "미기록")}</dd></div>
        <div><dt>자료 유형</dt><dd>${page.sourceKind === "raw" ? "raw 원본" : "외부 자료"}</dd></div>
        <div><dt>보존 상태</dt><dd>${escapeHtml(snapshotLabels[page.snapshotStatus] || page.snapshotStatus || "미기록")}</dd></div>
        <div><dt>판본</dt><dd>${escapeHtml(page.version || "확인되지 않음")}</dd></div>
        <div><dt>확인일</dt><dd>${escapeHtml(page.retrieved || "미기록")}</dd></div>
      </dl>${page.sourceUrls.length ? `<div class="trace-urls">${page.sourceUrls.map((url, index) => `<a href="${escapeHtml(url)}" rel="noreferrer">외부 출처 ${index + 1}</a>`).join("")}</div>` : ""}</div></section>` : ""}
    </div>
  </details>`;
}

function pathProgress(page) {
  const memberships = pathsByPage.get(page) || [];
  if (!memberships.length) return "";
  const [{ path, index }, ...others] = memberships;
  const previous = path.pages[index - 1];
  const next = path.pages[index + 1];
  return `<nav class="path-progress" aria-label="학습 경로 진행">
    <div><span>학습 경로 ${index + 1}/${path.pages.length}</span><a href="${withBase(`/paths/${path.slug}/`)}">${escapeHtml(path.title)}</a></div>
    <div class="path-progress-links">
      ${previous ? `<a rel="prev" href="${withBase(previous.url)}"><span>이전</span>${escapeHtml(previous.title)}</a>` : "<span></span>"}
      ${next ? `<a rel="next" href="${withBase(next.url)}"><span>다음</span>${escapeHtml(next.title)}</a>` : ""}
    </div>
    ${others.length ? `<p>함께 포함된 경로: ${others.map(({ path: other }) => `<a href="${withBase(`/paths/${other.slug}/`)}">${escapeHtml(other.title)}</a>`).join(", ")}</p>` : ""}
  </nav>`;
}

function articlePage(page) {
  const outgoing = page.links.slice(0, 8);
  const incoming = pages.filter((candidate) => candidate.links.includes(page)).slice(0, 8);
  const related = [...new Set([...outgoing, ...incoming])].filter((item) => item !== page).slice(0, 10);
  const sources = effectiveSources(page);
  const sourceLabel = page.sources.length ? `${sources.length || page.sources.length}개 근거` : "메타 문서";
  const headings = pageHeadings(page);
  const content = `
  <div class="article-layout section-frame">
    <aside class="article-rail">
      <a class="back-link" href="${withBase(categoryUrl(page.category))}">${categoryMeta[page.category].label} 목록</a>
      <details class="article-meta" data-article-meta open>
        <summary>문서 정보</summary>
        <dl>
          <div><dt>상태</dt><dd><span class="status-dot ${escapeHtml(page.status)}"></span>${escapeHtml(statusLabel(page.status))}</dd></div>
          <div><dt>갱신</dt><dd>${page.updated || "날짜 미기록"}</dd></div>
          <div><dt>근거</dt><dd>${sourceLabel}</dd></div>
          <div><dt>연결</dt><dd>${page.score}</dd></div>
        </dl>
        <a class="source-file" href="${repositoryUrl}/blob/main/${encodeURI(page.relativePath)}">GitHub에서 원문 보기</a>
      </details>
    </aside>
    <article class="article">
      <header class="article-header">
        <div class="article-category">${categoryMeta[page.category].label} / ${escapeHtml(statusLabel(page.status))}</div>
        <h1>${escapeHtml(page.title)}</h1>
        ${page.aliases.length ? `<div class="aliases"><span>다른 이름</span>${page.aliases.map((alias) => `<span>${escapeHtml(alias)}</span>`).join("")}</div>` : ""}
      </header>
      ${evidenceTrace(page)}
      <div class="prose">${renderMarkdown(page)}</div>
      ${pathProgress(page)}
    </article>
    <aside class="related-rail">
      ${headings.length ? `<nav class="article-toc" aria-label="문서 목차"><h2>이 문서에서</h2><ol>${headings.map((heading) => `<li><a href="#${heading.id}">${escapeHtml(heading.title)}</a></li>`).join("")}</ol></nav>` : ""}
      <section class="related-documents"><h2>연결된 문서</h2>
      ${related.length ? `<ol>${related.map((item) => `<li><a href="${withBase(item.url)}"><span>${categoryMeta[item.category].label}</span>${escapeHtml(item.title)}</a></li>`).join("")}</ol>` : "<p>직접 연결된 문서가 없습니다.</p>"}</section>
    </aside>
  </div>`;
  return layout({
    title: page.title,
    description: page.description,
    content,
    canonicalPath: page.url,
    bodyClass: "article-page"
  });
}

function listingPage(category) {
  const categoryPages = pages
    .filter((page) => page.category === category)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "ko"));
  const domains = [...new Set(categoryPages.flatMap(pageDomains))]
    .sort((a, b) => (domainMeta[a] || a).localeCompare(domainMeta[b] || b, "ko"));
  const content = `
  <section class="listing-hero section-frame">
    <p class="eyebrow"><a href="${withBase("/")}">홈</a> / ${categoryMeta[category].label}</p>
    <h1>${categoryMeta[category].label}</h1>
    <p>${categoryMeta[category].description}</p>
    <strong>${categoryPages.length}개 문서</strong>
    <span class="listing-watermark" aria-hidden="true">${categoryPages.length}</span>
  </section>
  <section class="listing-content section-frame" data-listing>
    <form class="listing-controls" data-list-controls>
      <label>목록 검색<input type="search" placeholder="현재 목록에서 검색" data-list-query></label>
      <label>주제<select data-list-domain><option value="">전체</option>${domains.map((domain) => `<option value="${domain}">${escapeHtml(domainMeta[domain] || domain.replace("domain/", ""))}</option>`).join("")}</select></label>
      <label>상태<select data-list-status><option value="">전체</option>${Object.entries(statusMeta).map(([value, meta]) => `<option value="${value}">${meta.label}</option>`).join("")}</select></label>
      <label>정렬<select data-list-sort><option value="score">연결 많은 순</option><option value="title">가나다순</option><option value="updated">최근 갱신순</option></select></label>
      <output data-list-count aria-live="polite">${categoryPages.length}개 문서</output>
    </form>
    <div class="document-grid">${categoryPages.map((page) => pageCard(page)).join("")}</div>
    <p class="listing-empty" data-list-empty hidden>조건에 맞는 문서가 없습니다.</p>
  </section>`;
  return layout({
    title: categoryMeta[category].label,
    description: categoryMeta[category].description,
    content,
    canonicalPath: categoryUrl(category),
    bodyClass: "listing-page"
  });
}

function pathsIndexPage() {
  const content = `<section class="listing-hero path-hero section-frame">
    <p class="eyebrow"><a href="${withBase("/")}">홈</a> / 학습 경로</p>
    <h1>학습 경로</h1>
    <p>원문, 개념, 인물과 분석을 한 질문의 흐름으로 묶어 순서대로 읽습니다.</p>
    <strong>${resolvedLearningPaths.length}개 경로</strong>
    <span class="listing-watermark" aria-hidden="true">${resolvedLearningPaths.length}</span>
  </section>
  <section class="content-section"><div class="learning-path-grid">${resolvedLearningPaths.map((path, index) => pathCard(path, index)).join("")}</div></section>`;
  return layout({
    title: "학습 경로",
    description: "CS Wiki의 원문, 개념과 분석을 주제별 순서로 읽는 학습 경로",
    content,
    canonicalPath: "/paths/",
    bodyClass: "paths-page"
  });
}

function learningPathPage(path) {
  const content = `<section class="path-detail-hero section-frame">
    <p class="eyebrow"><a href="${withBase("/paths/")}">학습 경로</a> / ${path.pages.length}단계</p>
    <h1>${escapeHtml(path.title)}</h1>
    <p>${escapeHtml(path.description)}</p>
  </section>
  <section class="path-steps section-frame">${path.pages.map((page, index) => `<div class="path-step"><span>${String(index + 1).padStart(2, "0")}</span>${pageCard(page, { step: `${index + 1}/${path.pages.length}` })}</div>`).join("")}</section>`;
  return layout({
    title: path.title,
    description: path.description,
    content,
    canonicalPath: `/paths/${path.slug}/`,
    bodyClass: "path-detail-page"
  });
}

function redirectPage(target) {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${escapeHtml(withBase(target))}"><link rel="canonical" href="${escapeHtml(withBase(target))}"><title>이동 중 · CS Wiki</title></head><body><p><a href="${escapeHtml(withBase(target))}">새 주소로 이동</a></p></body></html>`;
}

async function output(pathname, value) {
  const destination = join(distRoot, pathname.replace(/^\//, ""));
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, value, "utf8");
}

await rm(distRoot, { recursive: true, force: true });
await mkdir(join(distRoot, "assets"), { recursive: true });
await cp(join(root, "site", "assets"), join(distRoot, "assets"), { recursive: true });
if (existsSync(rawAssets)) await cp(rawAssets, join(distRoot, "assets", "raw"), { recursive: true });

await output("index.html", homePage());
for (const [category] of Object.entries(categoryMeta)) {
  await output(join(category, "index.html"), listingPage(category));
}
await output(join("paths", "index.html"), pathsIndexPage());
for (const path of resolvedLearningPaths) {
  await output(join("paths", path.slug, "index.html"), learningPathPage(path));
}
for (const page of pages) {
  await output(join(page.category, page.slug, "index.html"), articlePage(page));
  if (page.category === "references") {
    await output(join("sources", page.slug, "index.html"), redirectPage(page.url));
  }
}

const searchIndex = pages.map((page) => ({
  title: page.title,
  url: withBase(page.url),
  category: categoryMeta[page.category].label,
  categoryKey: page.category,
  status: page.status,
  statusLabel: statusLabel(page.status),
  updated: page.updated,
  description: page.summary,
  aliases: page.aliases,
  tags: page.tags,
  sourceId: page.sourceId,
  text: cleanInline(page.body).slice(0, 1600)
}));
await output("search.json", JSON.stringify(searchIndex));
await output(".nojekyll", "");
await output("404.html", layout({
  title: "문서를 찾을 수 없습니다",
  description: "요청한 CS Wiki 문서를 찾을 수 없습니다.",
  content: `<section class="not-found section-frame"><span>404</span><h1>문서를 찾을 수 없습니다.</h1><p>주소가 바뀌었거나 아직 생성되지 않은 문서입니다.</p><a href="${withBase("/")}">홈으로 돌아가기</a></section>`,
  bodyClass: "error-page"
}));

if (siteUrl) {
  const sitemapUrls = [
    "/",
    ...Object.keys(categoryMeta).map(categoryUrl),
    "/paths/",
    ...resolvedLearningPaths.map((path) => `/paths/${path.slug}/`),
    ...pages.map((page) => page.url)
  ];
  await output("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.map((url) => `  <url><loc>${siteUrl}${url}</loc></url>`).join("\n")}\n</urlset>`);
  await output("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
}

console.log(`Built ${pages.length} wiki pages in ${distRoot}`);
