import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { basename, dirname, extname, join, relative, sep } from "node:path";
import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";

const root = process.cwd();
const wikiRoot = join(root, "wiki");
const distRoot = join(root, "dist");
const rawAssets = join(root, "raw", "assets");
const siteBase = normalizeBase(process.env.SITE_BASE || "");
const siteUrl = (process.env.SITE_URL || "").replace(/\/$/, "");
const repositoryUrl = "https://github.com/YgHnSIM/CS_Wiki";

const categoryMeta = {
  sources: { label: "소스", description: "원본과 핵심 문헌을 바탕으로 정리한 소스 노트" },
  entities: { label: "인물", description: "컴퓨터 과학의 형성에 관여한 연구자와 설계자" },
  concepts: { label: "개념", description: "컴퓨팅의 원리, 구조, 언어를 연결하는 핵심 개념" },
  analyses: { label: "분석", description: "여러 소스와 개념을 비교하고 연결한 종합 분석" },
  meta: { label: "메타", description: "위키의 운영 상태와 전체 지식 구조" }
};

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
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
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
    .replace(/[`*_>#\[\]()]/g, "")
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

function getCategory(filePath) {
  const rel = relative(wikiRoot, filePath).split(sep);
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
  const category = getCategory(filePath);
  const slug = slugify(title);
  return {
    filePath,
    relativePath: relative(root, filePath).split(sep).join("/"),
    title,
    aliases: parseFlowList(parsed.data.aliases),
    tags: parseFlowList(parsed.data.tags),
    sources: parseFlowList(parsed.data.sources),
    status: parseScalar(parsed.data.status) || "draft",
    created: parseScalar(parsed.data.created),
    updated: parseScalar(parsed.data.updated),
    sourceKind: parseScalar(parsed.data.source_kind),
    body: parsed.content.trim(),
    description: describe(parsed.content),
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
  return md.render(renderWikiLinks(page.body));
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

const nav = Object.entries(categoryMeta).map(([category, meta]) => `
  <a class="nav-link" href="${withBase(categoryUrl(category))}">
    <span>${meta.label}</span><span class="nav-count">${counts[category]}</span>
  </a>`).join("");

function layout({ title, description, content, canonicalPath = "/", bodyClass = "", graphData = null }) {
  const fullTitle = title === "CS Wiki" ? title : `${title} · CS Wiki`;
  const canonical = siteUrl ? `${siteUrl}${canonicalPath}` : "";
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
  <link rel="icon" href="${withBase("/assets/favicon.svg")}" type="image/svg+xml">
  <link rel="stylesheet" href="${withBase("/assets/site.css")}">
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
    <div><a href="${repositoryUrl}">GitHub 저장소</a><span>${pages.length}개 문서</span><span>${statusCounts.active || 0}개 active</span></div>
  </footer>
  <dialog class="search-dialog" data-search-dialog>
    <form method="dialog" class="search-header">
      <label for="site-search">전체 문서 검색</label>
      <button type="submit">닫기</button>
    </form>
    <input id="site-search" type="search" autocomplete="off" placeholder="제목, 개념, 인물, 본문 검색" data-search-input>
    <p class="search-hint">위아래 방향키로 이동하고 Enter로 문서를 엽니다.</p>
    <div class="search-results" data-search-results></div>
  </dialog>
  ${graphData ? `<script type="application/json" id="graph-data">${JSON.stringify(graphData).replaceAll("<", "\\u003c")}</script>` : ""}
  <script>window.CS_WIKI_BASE=${JSON.stringify(siteBase)};</script>
  <script src="${withBase("/assets/site.js")}" defer></script>
</body>
</html>`;
}

function pageCard(page, compact = false) {
  return `<article class="document-card${compact ? " compact" : ""}">
    <div class="card-meta"><span>${categoryMeta[page.category].label}</span><span>${escapeHtml(page.status)}</span></div>
    <h3><a href="${withBase(page.url)}">${escapeHtml(page.title)}</a></h3>
    ${compact ? "" : `<p>${escapeHtml(page.description)}</p>`}
    <div class="card-foot"><span>${page.updated || page.created || "날짜 미기록"}</span><span>연결 ${page.score}</span></div>
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

function homePage() {
  const featured = [...pages]
    .filter((page) => page.category === "analyses")
    .sort((a, b) => b.score - a.score || b.updated.localeCompare(a.updated))
    .slice(0, 4);
  const recent = [...pages]
    .filter((page) => page.category !== "meta")
    .sort((a, b) => b.updated.localeCompare(a.updated) || b.score - a.score)
    .slice(0, 6);
  const routes = ["sources", "concepts", "entities", "analyses"].map((category, routeIndex) => {
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
      <p class="eyebrow">source-driven computer science wiki</p>
      <h1>컴퓨팅의 역사를<br><span>연결해서 읽는다.</span></h1>
      <p class="hero-intro">배비지와 러브레이스에서 저장 프로그램 컴퓨터, 구조적 프로그래밍, Unix와 C, 유니코드까지. 원본 문헌에서 출발해 개념과 분석을 잇는 기술 위키입니다.</p>
      <div class="hero-actions">
        <button type="button" class="primary-action" data-open-search>문서 검색</button>
        <a href="${withBase("/analyses/")}">분석 읽기</a>
      </div>
      <dl class="hero-stats">
        <div><dt>전체 문서</dt><dd>${pages.length}</dd></div>
        <div><dt>개념</dt><dd>${counts.concepts}</dd></div>
        <div><dt>핵심 분석</dt><dd>${counts.analyses}</dd></div>
        <div><dt>소스 노트</dt><dd>${counts.sources}</dd></div>
      </dl>
    </div>
    <div class="graph-panel">
      <div class="panel-heading"><h2>지식 연결망</h2><span>연결이 많은 문서 ${Math.min(12, pages.length)}개</span></div>
      <canvas id="knowledge-graph" aria-label="서로 연결된 주요 위키 문서 그래프"></canvas>
      <p>노드를 선택하면 해당 문서로 이동합니다.</p>
    </div>
  </section>
  <section class="content-section">
    <div class="section-heading"><span>01</span><div><h2>어디서 시작할까요?</h2><p>소스에서 개념으로, 개념에서 종합 분석으로 이동할 수 있습니다.</p></div></div>
    <div class="route-grid">${routes}</div>
  </section>
  <section class="content-section split-section">
    <div>
      <div class="section-heading"><span>02</span><div><h2>핵심 분석</h2><p>여러 문헌을 가로질러 하나의 질문을 추적합니다.</p></div></div>
      <div class="feature-list">${featured.map((page, index) => `<div class="feature-item"><span>${String(index + 1).padStart(2, "0")}</span>${pageCard(page, true)}</div>`).join("")}</div>
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
    graphData: graphPayload()
  });
}

function articlePage(page) {
  const outgoing = page.links.slice(0, 8);
  const incoming = pages.filter((candidate) => candidate.links.includes(page)).slice(0, 8);
  const related = [...new Set([...outgoing, ...incoming])].filter((item) => item !== page).slice(0, 10);
  const sourceLabel = page.sources.length ? `${page.sources.length}개 근거` : "메타 문서";
  const content = `
  <div class="article-layout section-frame">
    <aside class="article-rail">
      <a class="back-link" href="${withBase(categoryUrl(page.category))}">← ${categoryMeta[page.category].label} 목록</a>
      <dl>
        <div><dt>상태</dt><dd><span class="status-dot ${escapeHtml(page.status)}"></span>${escapeHtml(page.status)}</dd></div>
        <div><dt>갱신</dt><dd>${page.updated || "날짜 미기록"}</dd></div>
        <div><dt>근거</dt><dd>${sourceLabel}</dd></div>
        <div><dt>연결</dt><dd>${page.score}</dd></div>
      </dl>
      <a class="source-file" href="${repositoryUrl}/blob/main/${encodeURI(page.relativePath)}">GitHub에서 원문 보기</a>
    </aside>
    <article class="article">
      <header class="article-header">
        <div class="article-category">${categoryMeta[page.category].label} / ${escapeHtml(page.status)}</div>
        <h1>${escapeHtml(page.title)}</h1>
        <p>${escapeHtml(page.description)}</p>
        ${page.aliases.length ? `<div class="aliases"><span>다른 이름</span>${page.aliases.map((alias) => `<span>${escapeHtml(alias)}</span>`).join("")}</div>` : ""}
      </header>
      <div class="prose">${renderMarkdown(page)}</div>
    </article>
    <aside class="related-rail">
      <h2>연결된 문서</h2>
      ${related.length ? `<ol>${related.map((item) => `<li><a href="${withBase(item.url)}"><span>${categoryMeta[item.category].label}</span>${escapeHtml(item.title)}</a></li>`).join("")}</ol>` : "<p>직접 연결된 문서가 없습니다.</p>"}
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
  const content = `
  <section class="listing-hero section-frame">
    <p class="eyebrow">${category}</p>
    <h1>${categoryMeta[category].label}</h1>
    <p>${categoryMeta[category].description}</p>
    <strong>${categoryPages.length}개 문서</strong>
  </section>
  <section class="document-grid section-frame">${categoryPages.map((page) => pageCard(page)).join("")}</section>`;
  return layout({
    title: categoryMeta[category].label,
    description: categoryMeta[category].description,
    content,
    canonicalPath: categoryUrl(category),
    bodyClass: "listing-page"
  });
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
for (const page of pages) {
  await output(join(page.category, page.slug, "index.html"), articlePage(page));
}

const searchIndex = pages.map((page) => ({
  title: page.title,
  url: withBase(page.url),
  category: categoryMeta[page.category].label,
  status: page.status,
  updated: page.updated,
  description: page.description,
  text: cleanInline(page.body).slice(0, 1200)
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
  const sitemapUrls = ["/", ...Object.keys(categoryMeta).map(categoryUrl), ...pages.map((page) => page.url)];
  await output("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.map((url) => `  <url><loc>${siteUrl}${url}</loc></url>`).join("\n")}\n</urlset>`);
  await output("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
}

console.log(`Built ${pages.length} wiki pages in ${distRoot}`);
