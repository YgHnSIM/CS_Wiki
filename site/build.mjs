import { cp, mkdir, readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
import { connectionSummary, createConnectionIndex, findConnectionPaths } from "./assets/connection-paths.js";
import { buildLearningMap } from "./assets/learning-lines.js";
import { categoryMeta, domainMeta, historyPeriods, learningPaths, navCategories, statusMeta } from "./catalog.mjs";
import { loadWikiContent } from "./content.mjs";
import { buildKnowledgeGraph } from "./graph/model.mjs";
import { buildSemanticAtlas } from "./graph/atlas.mjs";
import { buildHistoricalLens } from "./graph/history.mjs";
import { EVIDENCE_LIMITS, buildEvidenceLens, evidenceStaticPageCount, evidenceStaticPageNumbers } from "./graph/evidence.mjs";
import { buildConceptEntityGraph } from "./graph/explorer.mjs";
import { graphNodeId } from "./graph/schema.mjs";
import { describeRelationship, indexGraphEdges, relationLabel, selectLocalGraph } from "./graph/selectors.mjs";
import { createDataOutputPath, createOutputWriter } from "./output.mjs";
import {
  cleanInline,
  escapeHtml,
  key,
  normalizeBase,
  safeExternalUrl,
  selectSiteDiscoveryPages,
  slugify,
  sourceTarget as resolveSourceTarget,
  withBase as addBase
} from "./core.mjs";

const root = process.cwd();
const wikiRoot = join(root, "wiki");
const distRoot = join(root, "dist");
const rawAssets = join(root, "raw", "assets");
const siteBase = normalizeBase(process.env.SITE_BASE || "");
const siteUrl = (process.env.SITE_URL || "").replace(/\/$/, "");
const repositoryUrl = "https://github.com/YgHnSIM/CS_Wiki";
const withBase = (pathname = "/") => addBase(pathname, siteBase);
const assetHash = createHash("sha256")
  .update(await readFile(join(root, "site", "assets", "site.css")))
  .update(await readFile(join(root, "site", "assets", "site.js")))
  .update(await readFile(join(root, "site", "assets", "article-relationships.js")))
  .update(await readFile(join(root, "site", "assets", "connection-paths.js")))
  .update(await readFile(join(root, "site", "assets", "connection-explorer.js")))
  .update(await readFile(join(root, "site", "assets", "connection-worker.js")))
  .update(await readFile(join(root, "site", "assets", "learning-lines.js")))
  .update(await readFile(join(root, "site", "assets", "learning-map.js")))
  .update(await readFile(join(root, "site", "assets", "atlas-renderer.js")))
  .update(await readFile(join(root, "site", "assets", "atlas-state.js")))
  .update(await readFile(join(root, "site", "assets", "atlas-worker.js")))
  .update(await readFile(join(root, "site", "assets", "semantic-atlas.js")))
  .update(await readFile(join(root, "site", "assets", "history-state.js")))
  .update(await readFile(join(root, "site", "assets", "history-lens.js")))
  .update(await readFile(join(root, "site", "assets", "evidence-state.js")))
  .update(await readFile(join(root, "site", "assets", "evidence-lens.js")))
  .update(await readFile(join(root, "site", "assets", "knowledge-graph.js")))
  .update(await readFile(join(root, "site", "assets", "knowledge-graph-worker.js")));

const atlasFacetMeta = Object.freeze({
  historical: {
    theory: "이론",
    machine: "기계",
    architecture: "아키텍처",
    software: "소프트웨어",
    system: "시스템",
    service: "서비스",
    measurement: "측정"
  },
  capability: {
    computability: "계산 가능성",
    complexity: "계산 복잡도",
    programmability: "프로그래밍 가능성",
    "realized-performance": "실현 성능",
    scalability: "확장성",
    "resource-efficiency": "자원 효율",
    "reliable-results": "결과 신뢰성"
  }
});

const mapModes = Object.freeze([
  { id: "connection", label: "연결 경로", url: "/map/" },
  { id: "learning", label: "학습 노선", url: "/map/learning/" },
  { id: "history", label: "역사·인과", url: "/map/history/" },
  { id: "evidence", label: "근거 계보", url: "/map/evidence/" }
]);

function mapModeNav(activeMode) {
  return `<nav class="map-mode-nav" aria-label="지식 지도 보기">${mapModes.map((mode) => `<a${mode.id === activeMode ? ' aria-current="page"' : ""} href="${withBase(mode.url)}">${mode.label}</a>`).join("")}</nav>`;
}

const { pages, lookup } = await loadWikiContent({ root, wikiRoot });

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

const knowledgeGraph = buildKnowledgeGraph(pages, resolvedLearningPaths, {
  lookup,
  urlFor: withBase
});
const knowledgeGraphEdgesByNodeId = indexGraphEdges(knowledgeGraph);
const learningMap = buildLearningMap(knowledgeGraph);
const semanticAtlas = buildSemanticAtlas(knowledgeGraph, { domainLabels: domainMeta });
const historicalLens = buildHistoricalLens(knowledgeGraph, { periods: historyPeriods });
const evidenceLens = buildEvidenceLens(knowledgeGraph);
const evidenceNodesById = new Map(knowledgeGraph.nodes.map((node) => [node.id, node]));
const siteDiscoveryPages = selectSiteDiscoveryPages(pages, {
  visibilityFor: (page) => evidenceNodesById.get(graphNodeId(page))?.visibility || "public"
});
const conceptEntityGraph = buildConceptEntityGraph(knowledgeGraph);
const evidenceDocumentNodes = knowledgeGraph.nodes
  .filter((node) => node.visibility === "public" && !["sources", "references"].includes(node.category))
  .sort((left, right) => left.title.localeCompare(right.title, "ko") || left.id.localeCompare(right.id, "ko"));
const evidenceSourceNodes = knowledgeGraph.nodes
  .filter((node) => node.visibility === "public" && ["sources", "references"].includes(node.category))
  .sort((left, right) => left.title.localeCompare(right.title, "ko") || left.id.localeCompare(right.id, "ko"));
const documentEvidenceEdges = knowledgeGraph.edges
  .filter((edge) => edge.kind === "supports"
    && edge.origin === "derived"
    && evidenceNodesById.get(edge.target)?.visibility === "public"
    && !["sources", "references"].includes(evidenceNodesById.get(edge.target)?.category)
    && evidenceNodesById.get(edge.source)?.visibility !== "hidden"
    && ["sources", "references"].includes(evidenceNodesById.get(edge.source)?.category))
  .sort((left, right) => left.target.localeCompare(right.target, "ko") || left.source.localeCompare(right.source, "ko"));
const evidencedRelationEdges = knowledgeGraph.edges
  .filter((edge) => edge.origin === "curated"
    && edge.evidence?.some((evidenceId) => {
      const node = evidenceNodesById.get(evidenceId);
      return node?.visibility !== "hidden" && ["sources", "references"].includes(node?.category);
    })
    && evidenceNodesById.get(edge.source)?.visibility === "public"
    && evidenceNodesById.get(edge.target)?.visibility === "public")
  .sort((left, right) => left.id.localeCompare(right.id, "ko"));
const evidenceRoutableSourceIds = new Set(evidenceLens.evidenceDocuments.map((record) => record.id));
const evidenceRoutableSourceNodes = knowledgeGraph.nodes
  .filter((node) => evidenceRoutableSourceIds.has(node.id))
  .sort((left, right) => left.title.localeCompare(right.title, "ko") || left.id.localeCompare(right.id, "ko"));
const evidenceEdgesByDocument = new Map(evidenceDocumentNodes.map((node) => [node.id, []]));
const evidenceEdgesBySource = new Map(evidenceRoutableSourceNodes.map((node) => [node.id, []]));
for (const edge of documentEvidenceEdges) {
  evidenceEdgesByDocument.get(edge.target)?.push(edge);
  evidenceEdgesBySource.get(edge.source)?.push(edge);
}
const relationEdgesByEvidence = new Map(evidenceRoutableSourceNodes.map((node) => [node.id, []]));
const relationEdgesByEndpoint = new Map(evidenceDocumentNodes.map((node) => [node.id, []]));
for (const edge of evidencedRelationEdges) {
  for (const evidenceId of edge.evidence) relationEdgesByEvidence.get(evidenceId)?.push(edge);
  relationEdgesByEndpoint.get(edge.source)?.push(edge);
  if (edge.target !== edge.source) relationEdgesByEndpoint.get(edge.target)?.push(edge);
}
const EVIDENCE_STATIC_PAGE_SIZE = EVIDENCE_LIMITS.staticPageRecords;

function evidenceRelationRouteId(edgeId) {
  return `relation-${createHash("sha256").update(`relation\0${String(edgeId)}`).digest("hex").slice(0, 16)}`;
}

function evidenceFocusRoute(scope, id, page = 1) {
  const safeScope = scope === "source" ? "source" : scope === "relation" ? "relation" : "document";
  const segment = encodeURIComponent(String(id));
  return `/map/evidence/${safeScope}/${segment}/${page > 1 ? `${page}/` : ""}`;
}

function evidenceRouteForNode(node, page = 1) {
  if (!node) return "/map/evidence/";
  const scope = ["sources", "references"].includes(node.category) ? "source" : "document";
  return evidenceFocusRoute(scope, node.id, page);
}

function connectionContext(context = {}) {
  const compact = {};
  for (const keyName of ["pageId", "section", "label", "pathId", "pathTitle", "step", "note"]) {
    if (context[keyName] !== undefined && context[keyName] !== null && context[keyName] !== "") compact[keyName] = context[keyName];
  }
  if (context.excerpt) compact.excerpt = String(context.excerpt).slice(0, 180);
  return compact;
}

function buildConnectionGraph(graph) {
  const nodes = graph.nodes.filter((node) => node.visibility !== "hidden").map((node) => ({
    id: node.id,
    title: node.title,
    aliases: node.aliases,
    url: node.url,
    category: node.category,
    domains: node.domains,
    status: node.status,
    summary: node.summary,
    visibility: node.visibility
  }));
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = graph.edges.filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target)).map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    kind: edge.kind,
    origin: edge.origin,
    weight: edge.weight,
    cost: edge.cost,
    ...(edge.occurrences > 1 ? { occurrences: edge.occurrences } : {}),
    ...(edge.reciprocal ? { reciprocal: true } : {}),
    contexts: edge.contexts.slice(0, 1).map(connectionContext)
  }));
  return {
    schemaVersion: graph.schemaVersion,
    contentVersion: graph.contentVersion,
    nodes,
    edges,
    legend: graph.legend,
    stats: { nodes: nodes.length, edges: edges.length }
  };
}

const connectionGraph = buildConnectionGraph(knowledgeGraph);
const connectionIndex = createConnectionIndex(connectionGraph);
const assetVersion = assetHash
  .update(JSON.stringify({
    pages: pages.map(({ filePath, incoming, links, score, ...page }) => page),
    knowledgeGraph,
    conceptEntityGraph,
    connectionGraph,
    learningMap,
    semanticAtlas: {
      contentVersion: semanticAtlas.manifest.contentVersion,
      limits: semanticAtlas.manifest.limits,
      stats: semanticAtlas.manifest.stats
    },
    historicalLens: {
      contentVersion: historicalLens.manifest.contentVersion,
      limits: historicalLens.manifest.limits,
      stats: historicalLens.manifest.stats
    },
    evidenceLens: {
      contentVersion: evidenceLens.manifest.contentVersion,
      limits: evidenceLens.manifest.limits,
      stats: evidenceLens.manifest.stats
    }
  }))
  .digest("hex")
  .slice(0, 12);

for (const payload of [
  semanticAtlas.manifest,
  semanticAtlas.overview,
  semanticAtlas.lookup,
  ...Object.values(semanticAtlas.shards),
  ...Object.values(semanticAtlas.corridors),
  ...Object.values(semanticAtlas.focusShards),
  historicalLens.manifest,
  historicalLens.overview,
  ...Object.values(historicalLens.lookupShards),
  ...Object.values(historicalLens.shards),
  ...Object.values(historicalLens.transitionDetails),
  evidenceLens.manifest,
  evidenceLens.overview,
  ...Object.values(evidenceLens.lookupShards),
  ...Object.values(evidenceLens.searchShards),
  ...Object.values(evidenceLens.assertionShards),
  ...Object.values(evidenceLens.assertionDetails),
  ...Object.values(evidenceLens.evidenceShards),
  ...Object.values(evidenceLens.evidenceDetails)
]) payload.contentVersion = assetVersion;

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
  siteDiscoveryPages.filter((page) => page.category === category).length
]));

const statusCounts = siteDiscoveryPages.reduce((acc, page) => {
  acc[page.status] = (acc[page.status] || 0) + 1;
  return acc;
}, {});

const domainCounts = siteDiscoveryPages.reduce((acc, page) => {
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
  const mapActive = canonicalPath.startsWith("/map/");
  return `${categoryLinks}<a class="nav-link path-nav" href="${withBase("/paths/")}"${pathActive ? ' aria-current="page"' : ""}>
    <span>학습 경로</span><span class="nav-count">${resolvedLearningPaths.length}</span>
  </a><a class="nav-link map-nav" href="${withBase("/map/")}"${mapActive ? ' aria-current="page"' : ""}>
    <span>지식 지도</span><span class="nav-count" aria-hidden="true">↔</span>
  </a>`;
}

function layout({ title, description, content, canonicalPath = "/", bodyClass = "", knowledgeGraphData = null, localGraphData = null, pageModules = [] }) {
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
    <div><a href="${withBase("/meta/")}">운영 정보</a><a href="${repositoryUrl}">GitHub 저장소</a><span>${siteDiscoveryPages.length}개 문서</span><span>검증됨 ${statusCounts.active || 0}</span></div>
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
  ${knowledgeGraphData ? `<script type="application/json" id="knowledge-graph-data">${JSON.stringify(knowledgeGraphData).replaceAll("<", "\\u003c")}</script>` : ""}
  ${localGraphData ? `<script type="application/json" id="local-graph-data">${JSON.stringify(localGraphData).replaceAll("<", "\\u003c")}</script>` : ""}
  <script>window.CS_WIKI_BASE=${JSON.stringify(siteBase)};window.CS_WIKI_ASSET_VERSION=${JSON.stringify(assetVersion)};</script>
  <script src="${withBase("/assets/site.js")}?v=${assetVersion}" defer></script>
  ${localGraphData ? `<script src="${withBase("/assets/article-relationships.js")}?v=${assetVersion}" defer></script>` : ""}
  ${pageModules.map((asset) => `<script type="module" src="${withBase(`/assets/${asset}`)}?v=${assetVersion}"></script>`).join("\n  ")}
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
  return resolveSourceTarget(lookup, value);
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
  const featured = [...siteDiscoveryPages]
    .filter((page) => page.category === "analyses")
    .sort((a, b) => b.score - a.score || b.updated.localeCompare(a.updated))
    .slice(0, 4);
  const recent = [...siteDiscoveryPages]
    .filter((page) => page.category !== "meta")
    .sort((a, b) => b.updated.localeCompare(a.updated) || b.score - a.score)
    .slice(0, 6);
  const routes = ["sources", "references", "concepts", "entities", "analyses"].map((category, routeIndex) => {
    const top = [...siteDiscoveryPages].filter((page) => page.category === category).sort((a, b) => b.score - a.score)[0];
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
        <a href="${withBase("/map/learning/")}">학습 노선 지도</a>
        <a href="${withBase("/map/")}">지식 연결 찾기</a>
        <a href="${withBase("/map/history/")}">역사·인과 렌즈</a>
        <a href="${withBase("/map/evidence/")}">근거 계보 보기</a>
      </div>
      <dl class="hero-stats">
        <div><dt>전체 문서</dt><dd>${siteDiscoveryPages.length}</dd></div>
        <div><dt>개념</dt><dd>${counts.concepts}</dd></div>
        <div><dt>학습 경로</dt><dd>${resolvedLearningPaths.length}</dd></div>
        <div><dt>핵심 분석</dt><dd>${counts.analyses}</dd></div>
      </dl>
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
    bodyClass: "home-page"
  });
}

function knowledgeGraphStaticList(nodes, label) {
  return `<section><h3>${escapeHtml(label)} <span>${nodes.length}</span></h3><ol>${nodes.map((node) => `<li><a href="${escapeHtml(node.url)}">${escapeHtml(node.title)}</a><span>직접 연결 ${node.degree}</span></li>`).join("")}</ol></section>`;
}

function knowledgeGraphPage() {
  const conceptNodes = conceptEntityGraph.nodes.filter((node) => node.category === "concepts");
  const entityNodes = conceptEntityGraph.nodes.filter((node) => node.category === "entities");
  const content = `<div class="knowledge-graph-page section-frame" data-knowledge-graph data-graph-asset-root="${withBase("/assets/raw/")}">
    <header class="knowledge-graph-masthead">
      <div>
        <p class="eyebrow">개념 ${conceptNodes.length} · 인물 ${entityNodes.length} · 직접 연결 ${conceptEntityGraph.stats.edges}</p>
        <h1>지식 그래프</h1>
        <p>문서를 선택해 직접 연결에 집중하거나 두 문서 사이의 경로를 확인할 수 있습니다.</p>
      </div>
    </header>
    ${mapModeNav("graph")}
    <section class="knowledge-graph-toolbar" aria-label="그래프 탐색 도구">
      <div class="knowledge-graph-search">
        <label for="knowledge-graph-search">검색</label>
        <input id="knowledge-graph-search" type="search" data-graph-search autocomplete="off" placeholder="개념 또는 인물 이름" aria-controls="knowledge-graph-search-results">
        <div id="knowledge-graph-search-results" class="knowledge-graph-search-results" data-graph-search-results hidden></div>
      </div>
      <div class="knowledge-graph-modes" role="group" aria-label="탐색 방식">
        <button type="button" data-graph-mode="focus" aria-pressed="true">선택 집중</button>
        <button type="button" data-graph-mode="path" aria-pressed="false">두 문서 경로</button>
      </div>
      <div class="knowledge-graph-filters" role="group" aria-label="문서 유형">
        <button type="button" data-graph-filter="all" aria-pressed="true">전체 <span>${conceptEntityGraph.stats.nodes}</span></button>
        <button type="button" data-graph-filter="concepts" aria-pressed="false">개념 <span>${conceptNodes.length}</span></button>
        <button type="button" data-graph-filter="entities" aria-pressed="false">인물 <span>${entityNodes.length}</span></button>
      </div>
      <button class="knowledge-graph-settings-toggle" type="button" data-graph-settings-toggle aria-controls="knowledge-graph-settings" aria-expanded="false">보기</button>
    </section>
    <div class="knowledge-graph-workspace">
      <section class="knowledge-graph-stage" aria-label="개념과 인물 지식 그래프">
        <canvas data-knowledge-graph-canvas tabindex="0" aria-describedby="knowledge-graph-hint">개념과 인물 문서의 연결 그래프입니다. 검색 또는 아래 문서 목록으로 같은 문서를 탐색할 수 있습니다.</canvas>
        <div class="knowledge-graph-legend" aria-label="노드 범례">
          <span><i class="concept" aria-hidden="true"></i>개념</span>
          <span><i class="entity" aria-hidden="true"></i>인물</span>
          <span><i class="relation" aria-hidden="true"></i>문서 관계</span>
        </div>
        <div class="knowledge-graph-camera" aria-label="그래프 화면 조절">
          <button type="button" data-graph-zoom-out>축소</button>
          <button type="button" data-graph-reset>맞춤</button>
          <button type="button" data-graph-zoom-in>확대</button>
        </div>
        <div class="knowledge-graph-context">
          <p data-graph-trail>선택할 문서를 검색하거나 그래프에서 고르세요.</p>
          <output class="knowledge-graph-status" data-graph-status aria-live="polite">개념과 인물 ${conceptEntityGraph.stats.nodes}개, 연결 ${conceptEntityGraph.stats.edges}개를 표시합니다.</output>
        </div>
        <p class="knowledge-graph-hint" id="knowledge-graph-hint">드래그로 이동하고 휠로 확대합니다. 노드를 선택하면 직접 연결에 집중합니다.</p>
        <aside class="knowledge-graph-settings" id="knowledge-graph-settings" data-graph-settings-panel aria-labelledby="knowledge-graph-settings-title" hidden>
          <header>
            <h2 id="knowledge-graph-settings-title">보기</h2>
            <button type="button" data-graph-settings-close aria-controls="knowledge-graph-settings" aria-label="보기 설정 닫기">닫기</button>
          </header>
          <div class="knowledge-graph-settings-body">
            <details open>
              <summary>연결</summary>
              <fieldset>
                <legend>관계의 흐름을 화살표로 표시합니다.</legend>
                <label class="knowledge-graph-switch"><span>관계 방향</span><input type="checkbox" data-graph-toggle-show-arrows checked><i aria-hidden="true"></i></label>
              </fieldset>
            </details>
            <details open>
              <summary>레이블</summary>
              <fieldset>
                <legend>화면에 항상 표시할 문서 이름의 양을 선택합니다.</legend>
                <div class="knowledge-graph-density" role="group" aria-label="레이블 밀도">
                  <button type="button" data-graph-label-density="low" aria-pressed="false">핵심만</button>
                  <button type="button" data-graph-label-density="medium" aria-pressed="true">균형</button>
                  <button type="button" data-graph-label-density="high" aria-pressed="false">많이</button>
                </div>
              </fieldset>
            </details>
          </div>
        </aside>
      </section>
      <section class="knowledge-graph-inspector" data-graph-inspector hidden aria-label="선택한 문서 정보">
          <p data-inspector-kind>개념</p>
          <h2 data-inspector-title></h2>
          <p data-inspector-summary></p>
          <strong data-inspector-degree></strong>
          <div class="knowledge-graph-relation" data-inspector-relation hidden>
            <h3>선택한 연결</h3>
            <strong data-inspector-relation-title></strong>
            <p data-inspector-relation-kinds></p>
            <p data-inspector-relation-direction></p>
            <p data-inspector-relation-note hidden></p>
            <div data-inspector-relation-evidence hidden><span>근거</span><div></div></div>
          </div>
          <div class="knowledge-graph-neighbors"><h3>관계별 직접 연결</h3><div data-inspector-neighbors></div></div>
          <a data-inspector-link href="#">문서 열기</a>
      </section>
    </div>
    <details class="knowledge-graph-static">
      <summary>문서 목록으로 그래프 읽기</summary>
      <div>${knowledgeGraphStaticList(conceptNodes, "개념")}${knowledgeGraphStaticList(entityNodes, "인물")}</div>
    </details>
    <noscript><p class="knowledge-graph-noscript">그래프 조작에는 JavaScript가 필요합니다. 위 문서 목록은 JavaScript 없이도 사용할 수 있습니다.</p></noscript>
  </div>`;
  return layout({
    title: "지식 그래프",
    description: "CS Wiki의 개념과 인물 문서를 노드로 연결해 탐색하는 지식 그래프",
    content,
    canonicalPath: "/map/graph/",
    bodyClass: "knowledge-graph-page-body",
    knowledgeGraphData: conceptEntityGraph,
    pageModules: ["knowledge-graph.js"]
  });
}

function evidenceItem(value) {
  const target = sourceTarget(value);
  if (target) return `<li><a href="${withBase(target.url)}">${escapeHtml(target.title)}</a><span>${categoryMeta[target.category].label}</span></li>`;
  return `<li><span>${escapeHtml(value)}</span></li>`;
}

function evidenceTrace(page) {
  const isSource = page.category === "sources" || page.category === "references";
  const graphNode = evidenceNodesById.get(graphNodeId(page));
  const direct = isSource ? page.primarySources : page.sources;
  const supporting = isSource ? page.supportingSources : [];
  const sourceUrls = page.sourceUrls.map(safeExternalUrl).filter(Boolean);
  const evidenceLabel = isSource ? "원자료로 기록" : "문서 단위 근거";
  const snapshotLabels = { local: "로컬 원본", "external-only": "외부 링크", archived: "보존 스냅샷" };
  return `<details class="evidence-trace">
    <summary><span>근거 추적</span><strong>${direct.length}개 ${evidenceLabel}</strong></summary>
    <div class="trace-grid">
      <section class="trace-stage"><span>01</span><div><h2>현재 문서</h2><p>${escapeHtml(page.title)} · ${escapeHtml(statusLabel(page.status))}</p></div></section>
      <section class="trace-stage"><span>02</span><div><h2>${evidenceLabel}</h2>${direct.length ? `<ul>${direct.map(evidenceItem).join("")}</ul>` : "<p>메타 문서에는 연결된 근거가 없습니다.</p>"}</div></section>
      ${supporting.length ? `<section class="trace-stage"><span>03</span><div><h2>보조·접근 자료</h2><ul>${supporting.map(evidenceItem).join("")}</ul></div></section>` : ""}
      ${isSource ? `<section class="trace-stage"><span>${supporting.length ? "04" : "03"}</span><div><h2>재현 정보</h2><dl>
        <div><dt>소스 ID</dt><dd>${escapeHtml(page.sourceId || "미기록")}</dd></div>
        <div><dt>자료 유형</dt><dd>${page.sourceKind === "raw" ? "raw 원본" : "외부 자료"}</dd></div>
        <div><dt>보존 상태</dt><dd>${escapeHtml(snapshotLabels[page.snapshotStatus] || page.snapshotStatus || "미기록")}</dd></div>
        <div><dt>판본</dt><dd>${escapeHtml(page.version || "확인되지 않음")}</dd></div>
        <div><dt>확인일</dt><dd>${escapeHtml(page.retrieved || "미기록")}</dd></div>
      </dl>${sourceUrls.length ? `<div class="trace-urls">${sourceUrls.map((url, index) => `<a href="${escapeHtml(url)}" rel="noreferrer">외부 출처 ${index + 1}</a>`).join("")}</div>` : ""}</div></section>` : ""}
    </div>
    ${graphNode?.visibility === "public" || evidenceRoutableSourceIds.has(graphNode?.id) ? `<p class="trace-map-link"><a href="${withBase(evidenceRouteForNode(graphNode))}">근거 계보에서 이 문서의 연결 펼쳐보기 →</a></p>` : ""}
  </details>`;
}

function pathProgress(page) {
  const memberships = pathsByPage.get(page) || [];
  if (!memberships.length) return "";
  const [{ path, index }, ...others] = memberships;
  const previous = path.pages[index - 1];
  const next = path.pages[index + 1];
  return `<nav class="path-progress" aria-label="학습 경로 진행">
    <div><span>학습 경로 ${index + 1}/${path.pages.length}</span><a href="${withBase(`/paths/${path.slug}/`)}">${escapeHtml(path.title)}</a><a class="path-map-link" href="${learningMapHref(path, page)}">노선 지도에서 보기</a></div>
    <div class="path-progress-links">
      ${previous ? `<a rel="prev" href="${withBase(previous.url)}"><span>이전</span>${escapeHtml(previous.title)}</a>` : "<span></span>"}
      ${next ? `<a rel="next" href="${withBase(next.url)}"><span>다음</span>${escapeHtml(next.title)}</a>` : ""}
    </div>
    ${others.length ? `<p>함께 포함된 경로: ${others.map(({ path: other }) => `<a href="${withBase(`/paths/${other.slug}/`)}">${escapeHtml(other.title)}</a>`).join(", ")}</p>` : ""}
  </nav>`;
}

const relationshipBucketMeta = {
  curated: { label: "편집 관계", description: "인과·구조·역사 관계" },
  evidence: { label: "근거", description: "문서와 원전의 증거 연결" },
  learning: { label: "학습", description: "권장 읽기 순서" },
  related: { label: "관련 항목", description: "편집자가 함께 읽도록 지정" },
  mentions: { label: "본문 언급", description: "본문에서 직접 언급" }
};

function shortGraphLabel(value, limit = 16) {
  const text = String(value || "");
  return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
}

function localGraphPositions(records) {
  const populated = Object.keys(relationshipBucketMeta).filter((bucket) => records.some((record) => record.bucket === bucket));
  const positions = new Map();
  if (populated.length === 1) {
    records.forEach((record, index) => {
      const angle = (-90 + index * (360 / records.length)) * Math.PI / 180;
      positions.set(record.neighborId, { x: 380 + Math.cos(angle) * 238, y: 230 + Math.sin(angle) * 158 });
    });
    return positions;
  }
  const centers = populated.length === 2
    ? { [populated[0]]: 180, [populated[1]]: 0 }
    : { curated: -40, evidence: 180, learning: -100, related: 40, mentions: 100 };
  for (const bucket of Object.keys(relationshipBucketMeta)) {
    const group = records.filter((record) => record.bucket === bucket);
    group.forEach((record, index) => {
      const spread = group.length > 4 ? 18 : 26;
      const offset = (index - (group.length - 1) / 2) * spread;
      const angle = (centers[bucket] + offset) * Math.PI / 180;
      const radiusX = 244 + (index % 2) * 10;
      const radiusY = 162 + (index % 2) * 8;
      positions.set(record.neighborId, {
        x: 380 + Math.cos(angle) * radiusX,
        y: 230 + Math.sin(angle) * radiusY
      });
    });
  }
  return positions;
}

function compactLocalGraphPositions(records) {
  const slots = [
    { x: 68, y: 52 }, { x: 312, y: 52 },
    { x: 58, y: 160 }, { x: 322, y: 160 },
    { x: 68, y: 268 }, { x: 312, y: 268 }
  ];
  return new Map(records.slice(0, slots.length).map((record, index) => [record.neighborId, slots[index]]));
}

function graphNodeShape(node, x, y, { focus = false, compact = false } = {}) {
  const width = compact ? (focus ? 146 : 108) : (focus ? 170 : 112);
  const height = compact ? (focus ? 54 : 52) : (focus ? 62 : 46);
  const category = node.category || "meta";
  let shape = `<rect x="${x - width / 2}" y="${y - height / 2}" width="${width}" height="${height}"></rect>`;
  if (category === "concepts") {
    shape = `<ellipse cx="${x}" cy="${y}" rx="${width / 2}" ry="${height / 2}"></ellipse>`;
  } else if (category === "entities") {
    shape = `<polygon points="${x},${y - height / 2} ${x + width / 2},${y} ${x},${y + height / 2} ${x - width / 2},${y}"></polygon>`;
  } else if (category === "analyses") {
    const inset = 18;
    shape = `<polygon points="${x - width / 2 + inset},${y - height / 2} ${x + width / 2 - inset},${y - height / 2} ${x + width / 2},${y} ${x + width / 2 - inset},${y + height / 2} ${x - width / 2 + inset},${y + height / 2} ${x - width / 2},${y}"></polygon>`;
  }
  return `<g class="local-node-shape category-${escapeHtml(category)}${focus ? " is-focus" : ""}">${shape}</g>`;
}

function localGraphSvg(local, focusId, { compact = false } = {}) {
  const records = compact ? local.visibleRecords.slice(0, 6) : local.visibleRecords;
  if (!records.length) return `<p class="relationship-empty">시각화할 직접 관계가 없습니다.</p>`;
  const positions = compact ? compactLocalGraphPositions(records) : localGraphPositions(records);
  const center = compact ? { x: 190, y: 160 } : { x: 380, y: 230 };
  const focusRadius = compact ? { x: 75, y: 29 } : { x: 86, y: 34 };
  const neighborRadius = compact ? { x: 58, y: 30 } : { x: 68, y: 27 };
  const markerPrefix = compact ? "compact" : "desktop";
  const edges = records.map((record) => {
    const position = positions.get(record.neighborId);
    const edge = record.primaryEdge;
    const dx = position.x - center.x;
    const dy = position.y - center.y;
    const length = Math.max(1, Math.hypot(dx, dy));
    const ux = dx / length;
    const uy = dy / length;
    const focusPoint = { x: center.x + ux * focusRadius.x, y: center.y + uy * focusRadius.y };
    const neighborPoint = { x: position.x - ux * neighborRadius.x, y: position.y - uy * neighborRadius.y };
    const outgoing = edge.directed && edge.source === focusId;
    const incoming = edge.directed && edge.target === focusId;
    const start = incoming ? neighborPoint : focusPoint;
    const end = incoming ? focusPoint : neighborPoint;
    const marker = edge.directed ? ` marker-end="url(#arrow-${markerPrefix}-${record.bucket})"` : "";
    return `<g class="local-edge" data-local-edge data-neighbor-id="${escapeHtml(record.neighborId)}" data-bucket="${record.bucket}">
      <line x1="${start.x.toFixed(1)}" y1="${start.y.toFixed(1)}" x2="${end.x.toFixed(1)}" y2="${end.y.toFixed(1)}"${marker}></line>
      <title>${escapeHtml(relationLabel(knowledgeGraph, edge, focusId))}${outgoing ? " · 나가는 관계" : incoming ? " · 들어오는 관계" : ""}</title>
    </g>`;
  }).join("");
  const nodes = records.map((record) => {
    const position = positions.get(record.neighborId);
    return `<g class="local-node" data-local-node data-neighbor-id="${escapeHtml(record.neighborId)}" data-bucket="${record.bucket}" role="presentation">
      ${compact ? `<rect class="local-node-hit" x="${position.x - 56}" y="${position.y - 32}" width="112" height="64"></rect>` : ""}
      ${graphNodeShape(record.node, position.x, position.y, { compact })}
      <text x="${position.x}" y="${position.y + 4}" text-anchor="middle">${escapeHtml(shortGraphLabel(record.node.title, compact ? 10 : 13))}</text>
      <title>${escapeHtml(record.node.title)} · ${escapeHtml(record.labels.join(", "))}</title>
    </g>`;
  }).join("");
  const markerDefs = Object.keys(relationshipBucketMeta).map((bucket) => `<marker id="arrow-${markerPrefix}-${bucket}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z"></path></marker>`).join("");
  return `<svg class="local-graph local-graph--${compact ? "compact" : "desktop"}" viewBox="0 0 ${compact ? "380 320" : "760 460"}" aria-hidden="true" focusable="false" data-testid="local-graph">
    <defs>${markerDefs}</defs>
    <g class="local-edges">${edges}</g>
    <g class="local-focus-node">${graphNodeShape(local.focus, center.x, center.y, { focus: true, compact })}<text x="${center.x}" y="${center.y + 4}" text-anchor="middle">${escapeHtml(shortGraphLabel(local.focus.title, compact ? 14 : 20))}</text></g>
    <g class="local-nodes">${nodes}</g>
  </svg>`;
}

function localGraphVisual(local, focusId) {
  return `${localGraphSvg(local, focusId)}${localGraphSvg(local, focusId, { compact: true })}`;
}

function relationshipRecord(record, focusId) {
  const primary = record.primaryEdge;
  const primaryDescription = describeRelationship(knowledgeGraph, primary);
  const primaryLabel = relationLabel(knowledgeGraph, primary, focusId);
  const otherEdges = record.edges.slice(1);
  return `<li class="relationship-record" data-relationship-record data-neighbor-id="${escapeHtml(record.neighborId)}" data-bucket="${record.bucket}" data-buckets="${escapeHtml(record.availableBuckets.join(" "))}">
    <div class="relationship-record-heading">
      <div><span class="relation-chip ${record.bucket}">${escapeHtml(primaryLabel)}</span><a href="${escapeHtml(record.node.url)}">${escapeHtml(record.node.title)}</a></div>
      <button type="button" hidden data-relationship-select data-neighbor-id="${escapeHtml(record.neighborId)}" aria-pressed="false">지도에서 강조</button>
    </div>
    <p>${escapeHtml(primaryDescription.detail)}</p>
    ${otherEdges.length ? `<details class="relationship-edge-details"><summary>다른 직접 관계 ${otherEdges.length}개</summary><ul>${otherEdges.map((edge) => {
      const description = describeRelationship(knowledgeGraph, edge);
      return `<li><strong>${escapeHtml(relationLabel(knowledgeGraph, edge, focusId))}</strong><span>${escapeHtml(description.detail)}</span></li>`;
    }).join("")}</ul></details>` : ""}
  </li>`;
}

function relationshipExplorer(page, local) {
  if (local.focus.visibility === "hidden") return { html: "", data: null };
  if (!local.totalNeighbors) return `<section id="relationships" class="relationship-explorer"><p class="relationship-empty">이 문서에는 해석 가능한 직접 관계가 없습니다.</p></section>`;
  const focusId = local.focus.id;
  const first = local.visibleRecords[0];
  const initialDescription = describeRelationship(knowledgeGraph, first.primaryEdge);
  const populatedBuckets = Object.keys(relationshipBucketMeta).filter((bucket) => local.records.some((record) => record.bucket === bucket));
  const openBucket = populatedBuckets.find((bucket) => local.records.filter((record) => record.bucket === bucket).length <= 8) || populatedBuckets[0];
  const groups = Object.entries(relationshipBucketMeta).map(([bucket, meta]) => {
    const records = local.records.filter((record) => record.bucket === bucket);
    if (!records.length) return "";
    const open = bucket === openBucket;
    return `<details class="relationship-group" data-relationship-group data-bucket="${bucket}"${open ? " open" : ""}>
      <summary><span><strong>${meta.label}</strong>${meta.description}</span><span>${records.length}</span></summary>
      <ol>${records.map((record) => relationshipRecord(record, focusId)).join("")}</ol>
    </details>`;
  }).join("");
  const clientRecord = (record) => {
    const description = describeRelationship(knowledgeGraph, record.primaryEdge);
    return {
      id: record.neighborId,
      title: record.node.title,
      url: record.node.url,
      category: record.node.category,
      bucket: record.bucket,
      label: relationLabel(knowledgeGraph, record.primaryEdge, focusId),
      statement: description.statement,
      detail: description.detail,
      relationCount: record.edges.length
    };
  };
  const payload = {
    focus: { id: local.focus.id, title: local.focus.title, url: local.focus.url },
    views: Object.fromEntries(Object.entries(local.views).map(([view, records]) => [view, records.map(clientRecord)]))
  };
  const viewTemplates = Object.entries(local.views)
    .map(([view, records]) => `<template data-local-graph-view="${view}">${localGraphVisual({ ...local, visibleRecords: records }, focusId)}</template>`)
    .join("");
  return {
    data: payload,
    html: `<section id="relationships" class="relationship-explorer" data-relationship-explorer data-focus-id="${escapeHtml(focusId)}" aria-labelledby="relationships-title">
      <header class="relationship-header">
        <div><p>1-HOP RELATIONSHIPS</p><h2 id="relationships-title">이 문서와 직접 연결된 지식</h2><p>${local.totalNeighbors}개 문서 · ${local.totalEdges}개 유형 관계 · 지도에는 ${local.visibleRecords.length}개 표시</p></div>
        <label hidden data-relationship-filter-control>지도 렌즈<select data-relationship-filter><option value="">전체 관계</option>${Object.entries(relationshipBucketMeta).filter(([bucket]) => local.counts[bucket]).map(([bucket, meta]) => `<option value="${bucket}">${meta.label} ${local.counts[bucket]}</option>`).join("")}</select></label>
      </header>
      <details class="relationship-map-disclosure" data-relationship-map open>
        <summary>관계 지도와 선택 해설</summary>
        <div class="relationship-map-layout">
          <div class="relationship-visual" data-relationship-visual>${localGraphVisual(local, focusId)}</div>${viewTemplates}
          <aside class="relationship-inspector" data-relationship-inspector>
            <span data-inspector-label>${escapeHtml(relationLabel(knowledgeGraph, first.primaryEdge, focusId))}</span>
            <h3 data-inspector-statement>${escapeHtml(initialDescription.statement)}</h3>
            <p data-inspector-detail>${escapeHtml(initialDescription.detail)}</p>
            <a data-inspector-link href="${escapeHtml(first.node.url)}">${escapeHtml(first.node.title)} 읽기</a>
          </aside>
        </div>
      </details>
      <div class="relationship-list-heading"><div><h3>대표 관계별 전체 이웃</h3><p>각 문서는 가장 강한 관계 아래 한 번만 표시합니다. 지도 렌즈는 한 문서가 가진 모든 관계를 함께 계산합니다.</p></div><output data-relationship-status aria-live="polite">${local.totalNeighbors}개 문서</output></div>
      <div class="relationship-groups">${groups}</div>
    </section>`
  };
}

function relationshipRail(local) {
  if (local.focus.visibility === "hidden") return "";
  if (!local.totalNeighbors) return "";
  return `<section class="related-documents relationship-jump"><h2>관계 탐색</h2>
    <a class="relationship-jump-summary" href="#relationships"><strong>${local.totalNeighbors}</strong><span>개 직접 이웃 · ${local.totalEdges}개 관계</span></a>
    <ol>${local.visibleRecords.slice(0, 6).map((record) => `<li><a href="${escapeHtml(record.node.url)}"><span>${escapeHtml(relationLabel(knowledgeGraph, record.primaryEdge, local.focus.id))}</span>${escapeHtml(record.node.title)}</a></li>`).join("")}</ol>
    <a class="relationship-jump-link" href="#relationships">관계 지도에서 보기</a>
    <a class="relationship-jump-link" href="${withBase(`/map/?from=${encodeURIComponent(local.focus.id)}`)}">다른 문서와 연결 찾기</a>
    <a class="relationship-jump-link" href="${withBase(`/map/atlas/?focus=${encodeURIComponent(local.focus.id)}`)}">전체 지도에서 이 문서 보기</a>
    <a class="relationship-jump-link" href="${withBase(`/map/history/?event=${encodeURIComponent(local.focus.id)}`)}">역사 렌즈에서 이 문서 보기</a>
    ${local.focus.visibility === "public" ? `<a class="relationship-jump-link" href="${withBase(evidenceRouteForNode(local.focus))}">근거 계보에서 이 문서 보기</a>` : ""}
  </section>`;
}

function articlePage(page) {
  const local = selectLocalGraph(knowledgeGraph, graphNodeId(page), { limit: 12, edgesByNodeId: knowledgeGraphEdgesByNodeId });
  const relationships = relationshipExplorer(page, local);
  const relationshipsHtml = typeof relationships === "string" ? relationships : relationships.html;
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
          <div><dt>직접 이웃</dt><dd>${local.totalNeighbors}</dd></div>
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
      ${relationshipsHtml}
      ${pathProgress(page)}
    </article>
    <aside class="related-rail">
      ${headings.length ? `<nav class="article-toc" aria-label="문서 목차"><h2>이 문서에서</h2><ol>${headings.map((heading) => `<li><a href="#${heading.id}">${escapeHtml(heading.title)}</a></li>`).join("")}</ol></nav>` : ""}
      ${relationshipRail(local)}
    </aside>
  </div>`;
  return layout({
    title: page.title,
    description: page.description,
    content,
    canonicalPath: page.url,
    bodyClass: "article-page",
    localGraphData: typeof relationships === "string" ? null : relationships.data
  });
}

function listingPage(category) {
  const categoryPages = siteDiscoveryPages
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
    <a class="path-map-entry" href="${withBase("/map/learning/")}">노선·역·환승 지도로 보기 →</a>
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
  const firstStationId = graphNodeId(path.pages[0]);
  const content = `<section class="path-detail-hero section-frame">
    <p class="eyebrow"><a href="${withBase("/paths/")}">학습 경로</a> / ${path.pages.length}단계</p>
    <h1>${escapeHtml(path.title)}</h1>
    <p>${escapeHtml(path.description)}</p>
    <a class="path-map-entry" href="${learningMapHref(path.slug, firstStationId)}">이 경로를 노선 지도에서 보기 →</a>
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

function connectionNodeHtml(node, position, step) {
  return `<li class="connection-step">
    <div class="connection-node">
      <span class="connection-node-index">${String(position + 1).padStart(2, "0")}</span>
      <div><span>${escapeHtml(categoryMeta[node.category]?.label || node.category)}</span><a href="${escapeHtml(node.url)}">${escapeHtml(node.title)}</a><p>${escapeHtml(node.summary || "요약이 아직 없습니다.")}</p></div>
    </div>
    ${step ? connectionRelationHtml(step) : ""}
  </li>`;
}

function connectionRelationHtml(step) {
  const from = connectionIndex.nodes.get(step.from);
  const to = connectionIndex.nodes.get(step.to);
  const recordedSource = connectionIndex.nodes.get(step.edge.source);
  const recordedTarget = connectionIndex.nodes.get(step.edge.target);
  return `<div class="connection-relation" data-family="${escapeHtml(step.edge.family)}">
    <span class="connection-relation-line" aria-hidden="true"></span>
    <div class="connection-relation-card">
      <span>${escapeHtml(step.label)}</span>
      <p>${escapeHtml(step.detail)}</p>
      ${step.alternativeLabels.length ? `<div class="connection-relation-alternatives"><span>같은 두 문서의 다른 관계</span>${step.alternativeLabels.map((label) => `<span>${escapeHtml(label)}</span>`).join("")}</div>` : ""}
      <details><summary>이동과 기록 방향</summary><p>이동: ${escapeHtml(from?.title || step.from)} → ${escapeHtml(to?.title || step.to)}</p><p>${step.edge.directed ? `기록: ${escapeHtml(recordedSource?.title || step.edge.source)} → ${escapeHtml(recordedTarget?.title || step.edge.target)}` : "기록: 방향 없는 관계"}</p></details>
    </div>
  </div>`;
}

function connectionRouteHtml(path, routeCount = 1, routeIndex = 0) {
  if (!path) return `<div class="connection-empty"><h2>예시 경로를 만들 수 없습니다.</h2><p>문서가 추가되거나 관계가 보강되면 이 영역에 경로가 나타납니다.</p></div>`;
  const chain = path.nodes.map((nodeId, index) => {
    const node = connectionIndex.nodes.get(nodeId);
    return connectionNodeHtml(node, index, path.steps[index]);
  }).join("");
  return `<article class="connection-route-card" data-connection-route>
    <header class="connection-route-heading">
      <div><p>ROUTE ${String(routeIndex + 1).padStart(2, "0")} / ${String(routeCount).padStart(2, "0")}</p><h2 tabindex="-1" data-connection-result-title>${escapeHtml(connectionSummary(connectionIndex, path))}</h2>${path.truncated ? `<p class="connection-route-limit">기본 경로는 확인했지만 계산 한도 안에서 일부 대안만 찾았습니다.</p>` : ""}</div>
      <dl><div><dt>단계</dt><dd>${path.hops}</dd></div><div><dt>판독</dt><dd>${escapeHtml(path.quality.label)}</dd></div></dl>
    </header>
    <ol class="connection-chain">${chain}</ol>
  </article>`;
}

function connectionExplorerPage() {
  const selectable = connectionGraph.nodes.filter((node) => node.visibility === "public")
    .sort((a, b) => a.title.localeCompare(b.title, "ko"));
  const defaultFrom = connectionIndex.nodes.get("src-001") || selectable[0];
  const defaultTo = connectionIndex.nodes.get("ref-049") || selectable.find((node) => node.id !== defaultFrom.id);
  const initialPaths = findConnectionPaths(connectionIndex, defaultFrom.id, defaultTo.id, { mode: "explain", limit: 3, maxHops: 6 });
  const options = selectable.map((node) => `<option value="${escapeHtml(node.title)}">${escapeHtml(categoryMeta[node.category]?.label || node.category)}</option>`).join("");
  const content = `<div class="knowledge-map-page section-frame" data-connection-explorer
    data-connection-graph-url="${withBase("/data/connection-graph.json")}?v=${assetVersion}"
    data-default-from="${escapeHtml(defaultFrom.id)}" data-default-to="${escapeHtml(defaultTo.id)}">
    <section class="connection-hero">
      <div><p class="eyebrow"><a href="${withBase("/")}">홈</a> / KNOWLEDGE ROUTER</p><h1>두 문서는 어떻게 연결되는가</h1><p>두 지식 사이의 최단 선만 보여주지 않습니다. 각 중간 문서와 관계의 방향, 그 연결을 선택한 이유를 읽을 수 있는 경로로 번역합니다.</p></div>
      <dl><div><dt>탐색 문서</dt><dd>${selectable.length}</dd></div><div><dt>경유 가능 문서</dt><dd>${connectionGraph.stats.nodes}</dd></div><div><dt>유형 관계</dt><dd>${connectionGraph.stats.edges.toLocaleString("ko-KR")}</dd></div></dl>
    </section>
    ${mapModeNav("connection")}
    <section class="connection-builder" aria-labelledby="connection-builder-title">
      <div class="connection-builder-intro"><p>SELECT TWO DOCUMENTS</p><h2 id="connection-builder-title">관계가 번역되는 경로 찾기</h2><p>기본 렌즈는 관련 항목과 학습 순서를 우선하고, 원전 허브와 자동 본문 언급을 지름길로 과대평가하지 않습니다.</p></div>
      <form class="connection-form" data-connection-form hidden>
        <label><span>출발 문서</span><input type="search" list="connection-documents" required autocomplete="off" aria-describedby="connection-status" value="${escapeHtml(defaultFrom.title)}" data-connection-from></label>
        <button class="connection-swap" type="button" data-connection-swap><span aria-hidden="true">⇄</span> 두 문서 바꾸기</button>
        <label><span>도착 문서</span><input type="search" list="connection-documents" required autocomplete="off" aria-describedby="connection-status" value="${escapeHtml(defaultTo.title)}" data-connection-to></label>
        <label><span>관계 렌즈</span><select data-connection-mode><option value="explain">핵심 연결</option><option value="concept">개념·학습</option><option value="evidence">근거 계보</option><option value="shortest">본문 언급 포함</option></select></label>
        <button class="connection-submit" type="submit">연결 설명 만들기</button>
      </form>
      <datalist id="connection-documents">${options}</datalist>
      <div class="connection-state-row"><output id="connection-status" data-connection-status aria-live="polite">연결 그래프를 불러오는 중입니다.</output><button type="button" hidden disabled data-connection-copy>현재 경로 주소 복사</button></div>
    </section>
    <section class="connection-results" aria-label="연결 경로 결과">
      <div class="connection-route-tabs" data-connection-route-tabs hidden></div>
      <div data-connection-results>
        <div class="connection-loading" data-connection-loading><span aria-hidden="true"></span><h2>관계 그래프를 준비하고 있습니다</h2><p>요청한 두 문서에 맞는 연결을 계산하면 이 영역이 바뀝니다.</p></div>
        <noscript><style>.connection-loading{display:none}</style><p class="connection-example-label">자바스크립트 없이 읽을 수 있는 빌드 시 예시 경로입니다.</p>${connectionRouteHtml(initialPaths[0], initialPaths.length)}</noscript>
      </div>
    </section>
  </div>`;
  return layout({
    title: "두 문서는 어떻게 연결되는가",
    description: "CS Wiki의 두 문서 사이에서 의미 있는 중간 개념과 관계의 방향을 설명하는 지식 경로 탐색기.",
    content,
    canonicalPath: "/map/",
    bodyClass: "knowledge-map-page-body",
    pageModules: ["connection-explorer.js"]
  });
}

function learningLineCode(pathId) {
  const index = resolvedLearningPaths.findIndex((path) => path.slug === pathId);
  return `L${String(Math.max(0, index) + 1).padStart(2, "0")}`;
}

function learningTransferCount(path) {
  return path.pages.filter((page) => (pathsByPage.get(page)?.length || 0) > 1).length;
}

function learningLineSamples(path, limit = 10) {
  if (path.pages.length <= limit) return path.pages;
  return Array.from({ length: limit }, (_, index) => path.pages[Math.round(index * (path.pages.length - 1) / (limit - 1))]);
}

function learningMapHref(pathOrId, stationOrId) {
  const lineId = typeof pathOrId === "string" ? pathOrId : pathOrId.slug;
  const stationId = typeof stationOrId === "string" ? stationOrId : graphNodeId(stationOrId);
  const encodedLine = encodeURIComponent(lineId);
  const encodedStation = encodeURIComponent(stationId);
  return withBase(`/map/learning/${encodedLine}/?line=${encodedLine}&station=${encodedStation}#station-${encodedStation}`);
}

function learningLineBoardHtml(activePath, activeStation) {
  const activeMemberships = new Set((pathsByPage.get(activeStation) || []).map(({ path }) => path.slug));
  return `<ol class="learning-line-list" data-learning-lines>${resolvedLearningPaths.map((path) => {
    const active = path.slug === activePath.slug;
    const illuminated = activeMemberships.has(path.slug);
    const transferCount = learningTransferCount(path);
    const targetStation = illuminated ? activeStation : path.pages[0];
    return `<li data-learning-line-item="${escapeHtml(path.slug)}" class="${active ? "is-active " : ""}${illuminated ? "has-selected-station" : ""}">
      <a href="${learningMapHref(path, targetStation)}" data-learning-line="${escapeHtml(path.slug)}"${active ? ' aria-current="true"' : ""}>
        <span class="learning-line-code">${learningLineCode(path.slug)}</span>
        <strong>${escapeHtml(path.title)}</strong>
        <span class="learning-line-meta">${path.pages.length}역 · 환승역 ${transferCount}</span>
        <span class="learning-line-track" aria-hidden="true">${learningLineSamples(path).map((page) => `<i class="${(pathsByPage.get(page)?.length || 0) > 1 ? "is-transfer" : ""}"></i>`).join("")}</span>
      </a>
    </li>`;
  }).join("")}</ol>`;
}

function learningStationsHtml(path, selectedStation) {
  const selectedId = graphNodeId(selectedStation);
  return `<ol class="learning-strip" data-learning-stations>${path.pages.map((page, index) => {
    const id = graphNodeId(page);
    const memberships = pathsByPage.get(page) || [];
    const selected = id === selectedId;
    return `<li id="station-${escapeHtml(id)}" class="learning-station${memberships.length > 1 ? " is-transfer" : ""}${selected ? " is-selected" : ""}" data-learning-station-item="${escapeHtml(id)}">
      <a href="${learningMapHref(path, page)}" data-learning-station="${escapeHtml(id)}"${selected ? ' aria-current="step"' : ""}>
        <span class="learning-station-marker" aria-hidden="true"><i></i></span>
        <span class="learning-station-order">${String(index + 1).padStart(2, "0")}</span>
        <strong>${escapeHtml(page.title)}</strong>
        <span>${escapeHtml(categoryMeta[page.category]?.label || page.category)}${memberships.length > 1 ? ` · 환승 ${memberships.length}개 노선` : ""}</span>
      </a>
    </li>`;
  }).join("")}</ol>`;
}

function learningInspectorHtml(path, station) {
  const stationId = graphNodeId(station);
  const index = path.pages.indexOf(station);
  const memberships = pathsByPage.get(station) || [];
  const previous = path.pages[index - 1];
  const next = path.pages[index + 1];
  const connectionHref = withBase(`/map/?from=${encodeURIComponent(stationId)}`);
  return `<section class="learning-station-inspector" data-learning-inspector aria-labelledby="learning-station-title">
    <div class="learning-station-copy">
      <p data-learning-station-position>STATION ${String(index + 1).padStart(2, "0")} / ${String(path.pages.length).padStart(2, "0")}</p>
      <span data-learning-station-category>${escapeHtml(categoryMeta[station.category]?.label || station.category)}</span>
      <h2 id="learning-station-title" data-learning-station-title>${escapeHtml(station.title)}</h2>
      <p data-learning-station-summary>${escapeHtml(station.summary)}</p>
      <div class="learning-station-flags" data-learning-station-flags><span>${memberships.length > 1 ? `환승역 · ${memberships.length}개 노선` : "일반역"}</span><span>${escapeHtml(statusLabel(station.status))}</span></div>
      <div class="learning-station-actions"><a data-learning-station-read href="${withBase(station.url)}">문서 읽기 →</a><a data-learning-station-connect href="${connectionHref}">이 역에서 연결 찾기 ↔</a></div>
    </div>
    <nav class="learning-adjacent" aria-label="현재 노선의 이전·다음 역">
      ${previous ? `<a href="${learningMapHref(path, previous)}" data-learning-adjacent="${escapeHtml(graphNodeId(previous))}"><span>이전 역</span>${escapeHtml(previous.title)}</a>` : `<span><span>이전 역</span>노선의 시작</span>`}
      ${next ? `<a href="${learningMapHref(path, next)}" data-learning-adjacent="${escapeHtml(graphNodeId(next))}"><span>다음 역</span>${escapeHtml(next.title)}</a>` : `<span><span>다음 역</span>노선의 끝</span>`}
    </nav>
    <aside class="learning-transfers" aria-labelledby="learning-transfer-title">
      <h3 id="learning-transfer-title">이 역의 노선</h3>
      <p>${memberships.length > 1 ? "같은 역을 유지한 채 다른 학습 흐름으로 갈아탑니다." : "현재는 이 노선에만 포함된 역입니다."}</p>
      <ol data-learning-transfer-lines>${memberships.map(({ path: memberPath, index: memberIndex }) => `<li><a href="${learningMapHref(memberPath, station)}" data-learning-transfer-line="${escapeHtml(memberPath.slug)}"${memberPath.slug === path.slug ? ' aria-current="true"' : ""}><span>${learningLineCode(memberPath.slug)}</span><strong>${escapeHtml(memberPath.title)}</strong><small>${memberIndex + 1}/${memberPath.pages.length}</small></a></li>`).join("")}</ol>
    </aside>
  </section>`;
}

function learningMapPage({ defaultPath, defaultStation, canonicalPath = "/map/learning/" }) {
  const { stations, stationOccurrences, transferStations } = learningMap.stats;
  const content = `<div class="learning-map-page section-frame" data-learning-map
    data-learning-map-url="${withBase("/data/learning-map.json")}?v=${assetVersion}"
    data-default-line="${escapeHtml(defaultPath.slug)}" data-default-station="${escapeHtml(graphNodeId(defaultStation))}">
    <section class="learning-map-hero">
      <div><p class="eyebrow"><a href="${withBase("/")}">홈</a> / LEARNING TRANSIT</p><h1>지식을 노선으로 읽는다</h1><p>각 학습 경로는 읽는 순서를 가진 노선이고, 여러 질문에 다시 등장하는 문서는 갈아탈 수 있는 환승역입니다.</p></div>
      <dl><div><dt>노선</dt><dd>${resolvedLearningPaths.length}</dd></div><div><dt>고유 역</dt><dd>${stations}</dd></div><div><dt>환승역</dt><dd>${transferStations}</dd></div><div><dt>경로 밖 문서</dt><dd>${Math.max(0, siteDiscoveryPages.length - stations)}</dd></div></dl>
    </section>
    ${mapModeNav("learning")}
    <section class="learning-transit-shell">
      <aside class="learning-line-board" aria-labelledby="learning-lines-title">
        <header><p>LINE BOARD</p><h2 id="learning-lines-title">학습 노선 ${resolvedLearningPaths.length}개</h2><span>${stationOccurrences}개 역 출현</span></header>
        ${learningLineBoardHtml(defaultPath, defaultStation)}
      </aside>
      <div class="learning-line-workspace">
        <header class="learning-line-heading">
          <div><p data-learning-line-code>${learningLineCode(defaultPath.slug)}</p><h2 data-learning-line-title>${escapeHtml(defaultPath.title)}</h2><p data-learning-line-description>${escapeHtml(defaultPath.description)}</p></div>
          <dl><div><dt>역</dt><dd data-learning-line-stations>${defaultPath.pages.length}</dd></div><div><dt>환승역</dt><dd data-learning-line-transfers>${learningTransferCount(defaultPath)}</dd></div></dl>
        </header>
        <div class="learning-strip-viewport" data-learning-strip-viewport aria-label="선택한 학습 노선의 역 순서">
          ${learningStationsHtml(defaultPath, defaultStation)}
        </div>
        <div class="learning-map-status-row"><output id="learning-map-status" data-learning-map-status aria-live="polite">${escapeHtml(defaultPath.title)} 노선의 ${escapeHtml(defaultStation.title)} 역을 선택했습니다.</output><span>← → / ↑ ↓ 역 이동 · Home End 처음/마지막</span></div>
        ${learningInspectorHtml(defaultPath, defaultStation)}
      </div>
    </section>
    <noscript><p class="learning-map-noscript">노선과 역 링크는 그대로 읽을 수 있습니다. 환승 동시 점등과 URL 상태 복원에는 자바스크립트가 필요합니다.</p></noscript>
  </div>`;
  return layout({
    title: "학습 노선 지도",
    description: "CS Wiki의 학습 경로를 노선, 역과 환승 관계로 탐색하는 순서 중심 지식 지도.",
    content,
    canonicalPath,
    bodyClass: "learning-map-page-body",
    pageModules: ["learning-map.js"]
  });
}

function atlasArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return Object.entries(value).map(([id, record]) => (
    record && typeof record === "object" ? { id, ...record } : { id, count: record }
  ));
  return [];
}

function atlasView(payload = {}) {
  const source = payload.view || payload.layout || payload.overview || payload.cluster || payload.corridor || payload;
  const nodeSource = source.nodes?.items || source.nodes || source.clusters || source.documents;
  const edgeSource = source.edges?.items || source.edges || source.corridors || source.relations;
  return { nodes: atlasArray(nodeSource), edges: atlasArray(edgeSource), labels: atlasArray(source.labels) };
}

function atlasClusterEntries() {
  const manifestRecords = atlasArray(semanticAtlas.manifest.clusters).filter((cluster) => cluster?.id);
  if (manifestRecords.length) return manifestRecords.map((cluster) => ({ ...cluster, kind: "cluster", count: cluster.count ?? cluster.nodeCount }));
  const overview = atlasView(semanticAtlas.overview);
  const records = overview.nodes.filter((node) => node?.id).map((node) => ({ ...node, kind: "cluster" }));
  if (records.length) return records;
  return Object.keys(semanticAtlas.shards || {}).sort((a, b) => a.localeCompare(b, "ko")).map((id) => {
    const shard = semanticAtlas.shards[id] || {};
    return { id, title: shard.title || shard.label || id, summary: shard.summary || shard.description || "", count: atlasDocumentEntries(shard).length, kind: "cluster" };
  });
}

function atlasDocumentEntries(payload) {
  const source = payload?.documents || payload?.cluster?.documents || atlasView(payload).nodes;
  const seen = new Set();
  return atlasArray(source).filter((node) => {
    if (!node?.id || node.kind === "cluster" || seen.has(node.id)) return false;
    seen.add(node.id);
    return true;
  });
}

function atlasDocumentsForCluster(clusterId, payload) {
  const lookupEntries = atlasArray(semanticAtlas.lookup.entries || semanticAtlas.lookup.nodes || semanticAtlas.lookup.documents);
  const complete = lookupEntries.filter((node) => node?.clusterId === clusterId);
  return complete.length ? complete : atlasDocumentEntries(payload);
}

function atlasFacetValues(name) {
  const aliases = {
    domain: ["domain", "domains"],
    category: ["category", "categories"],
    status: ["status", "statuses"],
    historical: ["historical", "historicalLayers", "historical_layers"],
    capability: ["capability", "capabilityLayers", "capability_layers"]
  }[name];
  const facets = semanticAtlas.manifest.facets || semanticAtlas.manifest.allowedFacets || {};
  const keyName = aliases.find((keyName) => Object.hasOwn(facets, keyName));
  if (!keyName) return [];
  const raw = facets[keyName];
  const records = Array.isArray(raw)
    ? raw.map((record) => typeof record === "string" ? { value: record } : record)
    : raw && typeof raw === "object"
      ? Object.entries(raw).map(([value, record]) => typeof record === "number" ? { value, count: record } : { value, ...(record || {}) })
      : [];
  return records
    .map((record) => ({ ...record, value: String(record?.value || record?.id || record?.key || "").trim() }))
    .filter((record) => record.value)
    .sort((a, b) => atlasFacetLabel(name, a.value).localeCompare(atlasFacetLabel(name, b.value), "ko") || a.value.localeCompare(b.value, "ko"));
}

function atlasFacetLabel(name, value) {
  if (name === "domain") return domainMeta[value] || value.replace(/^domain\//, "");
  if (name === "category") return categoryMeta[value]?.label || value;
  if (name === "status") return statusMeta[value]?.label || value;
  return atlasFacetMeta[name]?.[value] || value;
}

function atlasFacetControl(name, label) {
  const records = atlasFacetValues(name);
  const options = records.length
    ? `<option value="">전체</option>${records.map((record) => `<option value="${escapeHtml(record.value)}">${escapeHtml(atlasFacetLabel(name, record.value))}${Number.isFinite(record.count) ? ` (${record.count})` : ""}</option>`).join("")}`
    : `<option value="">메타데이터 없음</option>`;
  return `<label>${label}<select name="${name}" data-atlas-filter="${name}"${records.length ? "" : " disabled"}>${options}</select></label>`;
}

function atlasClusterNode(id) {
  return atlasClusterEntries().find((node) => node.id === id) || null;
}

function atlasNodeUrl(node) {
  if (node?.url) return node.url;
  const source = knowledgeGraph.nodes.find((candidate) => candidate.id === node?.id);
  return source?.url || "";
}

function atlasClusterListHtml(activeClusterId = "") {
  const entries = atlasClusterEntries();
  return `<ol class="atlas-static-cluster-list">${entries.map((cluster) => {
    const shard = semanticAtlas.shards?.[cluster.id];
    const count = Number(cluster.count ?? cluster.nodeCount ?? cluster.documentCount ?? atlasDocumentsForCluster(cluster.id, shard).length) || 0;
    return `<li><a href="${withBase(`/map/atlas/${encodeURIComponent(cluster.id)}/`)}"${cluster.id === activeClusterId ? ' aria-current="page"' : ""}><strong>${escapeHtml(cluster.title || cluster.label || cluster.id)}</strong><span>${count}개 문서${cluster.summary || cluster.description ? ` · ${escapeHtml(cluster.summary || cluster.description)}` : ""}</span></a></li>`;
  }).join("")}</ol>`;
}

function atlasDocumentListHtml(documents, activeId = "") {
  return `<ol class="atlas-item-list">${documents.map((node) => {
    const url = atlasNodeUrl(node);
    const meta = [categoryMeta[node.category]?.label || node.category, statusLabel(node.status), ...(node.domains || []).slice(0, 1).map((domain) => domainMeta[domain] || domain.replace(/^domain\//, ""))].filter(Boolean).join(" · ");
    return `<li>${url ? `<a href="${escapeHtml(url)}"${node.id === activeId ? ' aria-current="true"' : ""}><strong>${escapeHtml(node.title || node.label || node.id)}</strong>${meta ? `<small>${escapeHtml(meta)}</small>` : ""}</a>` : `<span>${escapeHtml(node.title || node.label || node.id)}</span>`}</li>`;
  }).join("")}</ol>`;
}

function atlasCorridorListHtml(edges, clustersById) {
  return `<ol class="atlas-relation-list">${edges.slice(0, 80).map((edge) => {
    const source = clustersById.get(edge.source);
    const target = clustersById.get(edge.target);
    const title = `${source?.title || source?.label || edge.source} ↔ ${target?.title || target?.label || edge.target}`;
    const detail = [edge.label || edge.dominantFamily || edge.family || "군집 간 관계", edge.count ? `${edge.count}개 연결` : ""].filter(Boolean).join(" · ");
    return `<li><strong><a href="${withBase(`/map/atlas/?corridor=${encodeURIComponent(edge.corridorId || edge.id)}`)}">${escapeHtml(title)}</a></strong><span>${escapeHtml(detail)}</span></li>`;
  }).join("")}</ol>`;
}

function atlasRelationListHtml(edges) {
  return `<ol class="atlas-relation-list">${edges.slice(0, 80).map((edge) => {
    const description = describeRelationship(knowledgeGraph, edge);
    const source = knowledgeGraph.nodes.find((node) => node.id === edge.source);
    const target = knowledgeGraph.nodes.find((node) => node.id === edge.target);
    return `<li><strong>${escapeHtml(knowledgeGraph.legend[edge.kind]?.label || edge.label || edge.kind || "관계")}</strong><span>${escapeHtml(source?.title || edge.source)} → ${escapeHtml(target?.title || edge.target)}</span><p>${escapeHtml(description.detail)}</p></li>`;
  }).join("")}</ol>`;
}

function semanticAtlasPage({ clusterId = "", canonicalPath = "/map/atlas/" } = {}) {
  const clusters = atlasClusterEntries();
  const clustersById = new Map(clusters.map((cluster) => [cluster.id, cluster]));
  const cluster = clusterId ? atlasClusterNode(clusterId) : null;
  const shard = clusterId ? semanticAtlas.shards?.[clusterId] : semanticAtlas.overview;
  if (clusterId && (!cluster || !shard)) throw new Error(`Semantic atlas static route references missing cluster '${clusterId}'`);
  const view = atlasView(shard);
  const documents = clusterId ? atlasDocumentsForCluster(clusterId, shard) : [];
  const overviewEdges = atlasView(semanticAtlas.overview).edges;
  const lookupEntries = atlasArray(semanticAtlas.lookup.entries || semanticAtlas.lookup.nodes || semanticAtlas.lookup.documents || semanticAtlas.lookup);
  const documentCount = Number(semanticAtlas.manifest.stats?.documents ?? semanticAtlas.manifest.stats?.nodes ?? lookupEntries.length) || knowledgeGraph.nodes.filter((node) => node.visibility !== "hidden").length;
  const relationCount = Number(semanticAtlas.manifest.stats?.relations ?? semanticAtlas.manifest.stats?.edges ?? knowledgeGraph.stats.edges) || 0;
  const stageTitle = cluster ? cluster.title || cluster.label || cluster.id : "전체 지식 군집";
  const stageSummary = cluster
    ? cluster.summary || cluster.description || `${documents.length}개 문서가 이 의미 군집에 속합니다.`
    : "문서를 한꺼번에 펼치지 않고 의미 군집과 군집 사이의 회랑에서 출발합니다.";
  const staticNodeList = cluster ? atlasDocumentListHtml(documents) : atlasClusterListHtml();
  const staticEdgeList = cluster ? atlasRelationListHtml(view.edges) : atlasCorridorListHtml(overviewEdges, clustersById);
  const content = `<div class="semantic-atlas-page section-frame" data-semantic-atlas
    data-atlas-manifest-url="${withBase("/data/atlas/manifest.json")}?v=${assetVersion}"
    data-atlas-root-url="${withBase("/map/atlas/")}"${clusterId ? ` data-default-cluster="${escapeHtml(clusterId)}" data-default-cluster-path="${withBase(canonicalPath)}"` : ""}>
    <section class="atlas-hero">
      <div><p class="eyebrow"><a href="${withBase("/")}">홈</a> / SEMANTIC ATLAS</p><h1>지식의 구조를 <span>군집과 회랑으로<br>읽는다.</span></h1><p>전체 문서를 한 화면에 흩뿌리는 대신 의미가 모이는 지역, 지역을 잇는 관계, 한 문서의 직접·간접 맥락을 단계적으로 확대합니다.</p></div>
      <dl><div><dt>탐색 문서</dt><dd>${documentCount}</dd></div><div><dt>의미 군집</dt><dd>${clusters.length}</dd></div><div><dt>군집 회랑</dt><dd>${overviewEdges.length}</dd></div><div><dt>유형 관계</dt><dd>${relationCount.toLocaleString("ko-KR")}</dd></div></dl>
    </section>
    ${mapModeNav("atlas")}
    <form class="atlas-controls" data-atlas-controls hidden>
      <div class="atlas-search-shell"><label>문서 찾기<input type="search" data-atlas-search autocomplete="off" role="combobox" aria-autocomplete="list" aria-haspopup="listbox" aria-expanded="false" aria-controls="atlas-search-results" placeholder="제목·별칭·설명 검색"></label><div id="atlas-search-results" class="atlas-search-results" data-atlas-search-results aria-live="polite"></div></div>
      ${atlasFacetControl("domain", "주제")}
      ${atlasFacetControl("category", "자료 유형")}
      ${atlasFacetControl("status", "검증 상태")}
      ${atlasFacetControl("historical", "역사 층위")}
      ${atlasFacetControl("capability", "능력 층위")}
      <button class="atlas-control-clear" type="button" data-atlas-overview>전체 보기</button>
    </form>
    <div class="atlas-state-bar"><nav class="atlas-breadcrumb" data-atlas-breadcrumb aria-label="의미 지도 위치"><a href="${withBase("/map/atlas/")}">전체 지도</a>${cluster ? `<span aria-hidden="true">/</span><span>${escapeHtml(stageTitle)}</span>` : ""}</nav><output data-atlas-status aria-live="polite">${cluster ? `${documents.length}개 문서를 포함한 군집을 선택했습니다.` : `${clusters.length}개 군집과 ${overviewEdges.length}개 회랑을 표시합니다.`}</output><p data-atlas-filter-notice hidden></p></div>
    <div class="atlas-workspace">
      <section class="atlas-stage" aria-labelledby="atlas-stage-title">
        <header class="atlas-stage-header"><div><p data-atlas-stage-kicker>${cluster ? "CLUSTER VIEW" : "ATLAS OVERVIEW"}</p><h2 id="atlas-stage-title">${escapeHtml(stageTitle)}</h2></div><div class="atlas-zoom-controls" aria-label="지도 확대와 축소"><button type="button" data-atlas-zoom-out aria-label="축소">−</button><button type="button" data-atlas-reset-camera>맞춤</button><button type="button" data-atlas-zoom-in aria-label="확대">+</button></div></header>
        <div class="atlas-canvas-frame"><canvas data-atlas-canvas aria-hidden="true"></canvas><details class="atlas-canvas-legend"><summary>지도 범례</summary><div><span class="atlas-legend-shape concept">개념</span><span class="atlas-legend-shape entity">인물</span><span class="atlas-legend-shape analysis">분석</span><span class="atlas-legend-shape source">원전·참고</span></div><div><span class="atlas-legend-line evidence">근거</span><span class="atlas-legend-line learning">학습 순서</span><span class="atlas-legend-line navigation">관련·언급</span></div></details><p class="atlas-canvas-hint">드래그 이동 · 휠 확대 · 노드 선택</p><div class="atlas-error" data-atlas-error hidden role="alert"><h3>지도 조각을 불러오지 못했습니다</h3><p>아래 정적 목록은 계속 사용할 수 있습니다.</p><button type="button" data-atlas-retry>다시 시도</button></div></div>
      </section>
      <aside class="atlas-side-panel">
        <section class="atlas-inspector" data-atlas-inspector aria-labelledby="atlas-inspector-title"><p>${cluster ? "SELECTED CLUSTER" : "ATLAS GUIDE"}</p><h3 id="atlas-inspector-title">${escapeHtml(stageTitle)}</h3><p>${escapeHtml(stageSummary)}</p><dl><div><dt>${cluster ? "문서" : "군집"}</dt><dd>${cluster ? documents.length : clusters.length}</dd></div><div><dt>${cluster ? "내부 관계" : "회랑"}</dt><dd>${cluster ? view.edges.length : overviewEdges.length}</dd></div></dl><div class="atlas-inspector-actions">${cluster ? `<a href="${withBase("/map/atlas/")}">전체 지도</a>` : `<span>군집을 선택해 문서를 펼칩니다.</span>`}</div></section>
        <details class="atlas-list-disclosure"><summary>텍스트 목록으로 지도 읽기</summary><div class="atlas-accessible-view">
          <section><header><h4 data-atlas-node-heading>${cluster ? "군집의 전체 문서" : "지식 군집"}</h4><p data-atlas-node-summary>${cluster ? `${documents.length}개 문서 링크` : `${clusters.length}개 정적 군집 경로`}</p></header><div data-atlas-node-list>${staticNodeList}</div></section>
          <section><header><h4 data-atlas-edge-heading>${cluster ? "문서 관계" : "군집 회랑"}</h4><p data-atlas-edge-summary>${cluster ? `${view.edges.length}개 중 대표 관계` : `${overviewEdges.length}개 군집 간 연결`}</p></header><div ${cluster ? "data-atlas-edge-list" : "data-atlas-corridor-list"}>${staticEdgeList}</div></section>
        </div></details>
      </aside>
    </div>
    <noscript><p class="atlas-noscript">자바스크립트 없이도 아래 정적 ${cluster ? "문서" : "군집"} 목록을 따라갈 수 있습니다.</p>${cluster ? atlasDocumentListHtml(documents) : atlasClusterListHtml()}</noscript>
  </div>`;
  return layout({
    title: cluster ? `${stageTitle} · 전체 의미 지도` : "전체 의미 지도",
    description: cluster ? `${stageTitle} 군집에 속한 CS Wiki 문서와 관계를 탐색합니다.` : "CS Wiki의 문서를 의미 군집, 군집 회랑과 문서 초점으로 단계적으로 탐색하는 전체 지식 지도.",
    content,
    canonicalPath,
    bodyClass: "semantic-atlas-page-body",
    pageModules: ["semantic-atlas.js"]
  });
}

const historyNodesById = new Map(knowledgeGraph.nodes.map((node) => [node.id, node]));
const historyRangeCount = Object.values(historicalLens.lookupShards)
  .flatMap((shard) => shard.entries)
  .filter((event) => event.time?.shape === "range").length;

function historyTimeText(event = {}) {
  const time = event.time || {};
  const status = time.status || event.timeStatus || "undated";
  const anchorYear = time.anchorYear ?? event.anchorYear ?? null;
  if (status === "undated" || anchorYear === null) return "연도 미상";
  const publication = time.publicationYear ? `출판 ${time.publicationYear}` : "";
  if (time.eventStart !== null && time.eventStart !== undefined) {
    const range = time.eventEnd && time.eventEnd !== time.eventStart
      ? `${time.eventStart}–${time.eventEnd}`
      : time.openEnd ? `${time.eventStart}–` : `${time.eventStart}`;
    return publication && time.publicationYear !== time.eventStart ? `사건 ${range} · ${publication}` : `사건 ${range}`;
  }
  return publication || `${anchorYear}`;
}

function historyPeriodRoute(period, page = 1) {
  return page > 1 ? `/map/history/${period.id}/${page}/` : `/map/history/${period.id}/`;
}

function historyEraListHtml(activePeriodId = "") {
  return `<ol class="history-era-list">${historicalLens.manifest.periods.map((period) => `<li><a href="${withBase(historyPeriodRoute(period))}"${period.id === activePeriodId ? ' aria-current="page"' : ""}><span>${escapeHtml(period.label || period.title || period.id)}</span><strong>${period.eventCount}</strong><small>${period.transitionCount || 0}개 전환 · ${period.pageCount}개 조각</small></a></li>`).join("")}</ol>`;
}

function historyEventListHtml(events = []) {
  if (!events.length) return '<p class="history-empty">이 조각에는 배치된 문서가 없습니다.</p>';
  return `<ol class="history-event-ledger">${events.map((event) => `<li class="history-event-card" data-history-lane="${escapeHtml(event.lane || "unclassified")}" data-history-year="${event.time?.anchorYear ?? ""}"><button type="button" data-history-action="event" data-history-id="${escapeHtml(event.id)}"><time>${escapeHtml(historyTimeText(event))}</time><strong>${escapeHtml(event.title)}</strong><span>${escapeHtml(atlasFacetMeta.historical[event.lane] || "층위 미분류")}${event.capabilityLayers?.length ? ` · ${event.capabilityLayers.map((layer) => atlasFacetMeta.capability[layer] || layer).join(" · ")}` : ""}</span></button><a href="${escapeHtml(event.url)}">문서 읽기</a>${event.time?.note ? `<p>${escapeHtml(event.time.note)}</p>` : ""}</li>`).join("")}</ol>`;
}

function historyRoleRecords(transition, key) {
  const value = transition?.roles?.[key];
  return Array.isArray(value) ? value : value ? [value] : [];
}

function historyRoleInline(records, fallback) {
  if (!records.length) return `<span>${escapeHtml(fallback)}</span>`;
  return records.map((record) => {
    const full = historyNodesById.get(record.id);
    const url = record.url || full?.url || withBase(`/map/history/?event=${encodeURIComponent(record.id)}`);
    return `<a href="${escapeHtml(url)}">${escapeHtml(record.title || full?.title || record.id)}</a>`;
  }).join(", ");
}

function historyTransitionRolesHtml(transition = {}) {
  if (transition.type === "response" || transition.type === "enablement") {
    return `<div class="history-transition-roles"><div><span>한계</span><p>${historyRoleInline(historyRoleRecords(transition, "limitation"), "아직 연결되지 않음")}</p></div><i aria-hidden="true">→</i><div><span>대응</span><p>${historyRoleInline(historyRoleRecords(transition, "response"), "아직 연결되지 않음")}</p></div><i aria-hidden="true">→</i><div><span>새 능력</span><p>${historyRoleInline(historyRoleRecords(transition, "capability"), "아직 연결되지 않음")}</p></div></div>`;
  }
  if (transition.type === "precedes") {
    return `<div class="history-transition-roles history-transition-roles--two"><div><span>선행</span><p>${historyRoleInline(historyRoleRecords(transition, "before"), "선행 문서")}</p></div><i aria-hidden="true">→</i><div><span>후행</span><p>${historyRoleInline(historyRoleRecords(transition, "after"), "후행 문서")}</p></div></div>`;
  }
  return `<div class="history-transition-roles history-transition-roles--two"><div><span>제약</span><p>${historyRoleInline(historyRoleRecords(transition, "constraint"), "제약 문서")}</p></div><i aria-hidden="true">→</i><div><span>제약 대상</span><p>${historyRoleInline(historyRoleRecords(transition, "constrained"), "제약 대상")}</p></div></div>`;
}

function historyTransitionKindText(transition = {}) {
  if (transition.type === "precedes") return "검토된 선후";
  if (transition.type === "constraint") return "다음 제약";
  if (transition.type === "enablement") return "대응 → 새 능력";
  return transition.completeness === "complete" ? "한계 → 대응 → 새 능력" : "한계 → 대응";
}

function historyTransitionEvidenceHtml(transition = {}) {
  const notes = [...new Set((transition.edges || []).flatMap((edge) => edge.notes || (edge.note ? [edge.note] : [])).filter(Boolean))];
  const evidenceIds = [...new Set((transition.edges || []).flatMap((edge) => edge.evidence || []))];
  const evidence = evidenceIds.map((id) => historyNodesById.get(id)).filter(Boolean);
  if (!notes.length && !evidence.length) return "";
  return `<div class="history-transition-evidence">${notes.map((note) => `<p>${escapeHtml(note)}</p>`).join("")}${evidence.length ? `<p><span>근거</span> ${evidence.map((node) => `<a href="${escapeHtml(node.url)}">${escapeHtml(node.title)}</a>`).join(", ")}</p>` : ""}</div>`;
}

function historyTransitionTruncationHtml(transition = {}) {
  const detail = transition.detail;
  if (detail?.kind !== "paginated" || !detail.truncated) return "";
  const response = historyRoleRecords(transition, "response")[0];
  const fallback = response?.url
    ? `<a href="${escapeHtml(response.url)}">${escapeHtml(response.title || "대응 문서")}의 관계 표에서 전체 읽기</a>`
    : "연결된 문서의 관계 표에서 전체 내용을 확인할 수 있습니다.";
  return `<p class="history-transition-truncation" data-history-transition-detail
    data-detail-route="${escapeHtml(detail.route || "")}"
    data-detail-pages="${Number(detail.pageCount || 0)}"
    data-detail-items="${Number(detail.itemCount || 0)}"
    data-detail-roles="${Number(detail.roleNodeCount || 0)}"
    data-detail-edges="${Number(detail.edgeCount || 0)}">대표 ${Number(transition.edges?.length || 0)}개 관계만 표시합니다. 전체 ${Number(detail.edgeCount || 0)}개 관계는 ${Number(detail.pageCount || 0)}개 상세 조각으로 나뉩니다. ${fallback}</p>`;
}

function historyTransitionText(transition = {}) {
  if (transition.type === "response" || transition.type === "enablement") {
    const limit = historyRoleRecords(transition, "limitation").map((item) => item.title).join(", ") || "한계 미기록";
    const response = historyRoleRecords(transition, "response").map((item) => item.title).join(", ") || "대응 미기록";
    const capability = historyRoleRecords(transition, "capability").map((item) => item.title).join(", ") || "새 능력 미기록";
    return `${limit} → ${response} → ${capability}`;
  }
  if (transition.type === "precedes") {
    return `${historyRoleRecords(transition, "before")[0]?.title || "선행 문서"} → ${historyRoleRecords(transition, "after")[0]?.title || "후행 문서"}`;
  }
  return `${historyRoleRecords(transition, "constraint")[0]?.title || "제약"} → ${historyRoleRecords(transition, "constrained")[0]?.title || "제약 대상"}`;
}

function historyTransitionListHtml(transitions = []) {
  if (!transitions.length) return '<p class="history-empty">검토된 인과·역사 전환이 아직 없습니다.</p>';
  return `<ol class="history-transition-list">${transitions.map((transition) => {
    const note = transition.edges?.map((edge) => edge.note).find(Boolean) || "편집 관계의 방향과 근거를 확인합니다.";
    return `<li><button type="button" data-history-action="transition" data-history-id="${escapeHtml(transition.id)}"><span>${escapeHtml(historyTransitionKindText(transition))}</span><strong>${escapeHtml(historyTransitionText(transition))}</strong><small>${escapeHtml(note)}</small></button>${historyTransitionRolesHtml(transition)}${historyTransitionEvidenceHtml(transition)}${historyTransitionTruncationHtml(transition)}</li>`;
  }).join("")}</ol>`;
}

function historyPaginationHtml(period, page = 1) {
  if (!period || period.pageCount <= 1) return "";
  return `<nav class="history-pagination" aria-label="${escapeHtml(period.label)} 문서 조각">${Array.from({ length: period.pageCount }, (_, index) => index + 1).map((number) => `<a href="${withBase(historyPeriodRoute(period, number))}"${number === page ? ' aria-current="page"' : ""}>${number}</a>`).join("")}</nav>`;
}

function historicalLensPage({ periodId = "", page = 1, canonicalPath = "/map/history/" } = {}) {
  const period = periodId ? historicalLens.manifest.periods.find((record) => record.id === periodId) : null;
  if (periodId && !period) throw new Error(`History route references missing period '${periodId}'`);
  const shardId = period ? `${period.id}--page-${String(page).padStart(4, "0")}` : "";
  const shard = shardId ? historicalLens.shards[shardId] : null;
  if (period && (!shard || page < 1 || page > period.pageCount)) throw new Error(`History route references missing shard '${shardId}'`);
  const events = shard?.events || historicalLens.overview.periods.flatMap((record) => record.sampleEvents || []);
  const transitions = shard?.transitions || historicalLens.overview.transitions || [];
  const title = period?.title || period?.label || "전체 시대와 병목 이동";
  const summary = period?.question || "시대가 바뀔 때 사라진 병목보다 새로 드러난 병목과 대응을 함께 읽습니다.";
  const rangeCount = historyRangeCount;
  const content = `<div class="history-lens-page section-frame" data-history-lens
    data-history-manifest-url="${withBase("/data/history/manifest.json")}?v=${assetVersion}"
    data-history-root-url="${withBase("/map/history/")}"${period ? ` data-default-era="${escapeHtml(period.id)}" data-default-era-path="${withBase(canonicalPath)}" data-default-part="${escapeHtml(shardId)}" data-default-part-path="${withBase(canonicalPath)}"` : ""}>
    <section class="history-hero"><div><p class="eyebrow"><a href="${withBase("/")}">홈</a> / HISTORICAL CAUSAL LENS</p><h1>컴퓨팅 능력은 <span>병목의 이동으로<br>발달했다.</span></h1><p>연도만 나열하지 않습니다. 어떤 한계가 어떤 대응을 낳았고, 그 대응이 새 능력과 다음 제약을 어떻게 만들었는지 원전 관계로 읽습니다.</p></div><dl><div><dt>연도 기록 문서</dt><dd>${historicalLens.manifest.stats.datedDocuments}</dd></div><div><dt>기간 사건</dt><dd>${rangeCount}</dd></div><div><dt>검토 전환</dt><dd>${historicalLens.manifest.stats.transitions}</dd></div><div><dt>연도 미기록</dt><dd>${historicalLens.manifest.stats.undatedDocuments}</dd></div></dl></section>
    ${mapModeNav("history")}
    <form class="history-controls" data-history-controls hidden>
      <div class="history-search-shell"><label>문서 찾기<input type="search" data-history-search autocomplete="off" role="combobox" aria-autocomplete="list" aria-haspopup="listbox" aria-expanded="false" aria-controls="history-search-results" placeholder="문서·전환·연도 검색"></label><div id="history-search-results" class="history-search-results" data-history-search-results role="listbox" aria-label="역사 문서와 전환 검색 결과" aria-live="polite"></div></div>
      <label>시기<select data-history-era><option value="">전체 시대</option>${historicalLens.manifest.periods.map((record) => `<option value="${escapeHtml(record.id)}"${record.id === periodId ? " selected" : ""}>${escapeHtml(record.label || record.title || record.id)}</option>`).join("")}</select></label>
      <label>역사 층위<select data-history-layer><option value="">전체 층위</option>${historicalLens.manifest.lanes.map((lane) => `<option value="${escapeHtml(lane.id)}">${escapeHtml(lane.label)}</option>`).join("")}</select></label>
      <label>능력 층위<select data-history-capability><option value="">전체 능력</option>${historicalLens.manifest.facets.capabilities.map((capability) => `<option value="${escapeHtml(capability)}">${escapeHtml(atlasFacetMeta.capability[capability] || capability)}</option>`).join("")}</select></label>
      <label>표시<select data-history-display><option value="all">문서와 전환</option><option value="events">문서만</option><option value="transitions">전환만</option></select></label>
      <button type="button" data-history-reset>초기화</button>
    </form>
    <div class="history-state-bar"><nav data-history-breadcrumb aria-label="역사 렌즈 위치"><a href="${withBase("/map/history/")}">전체 시대</a>${period ? `<span aria-hidden="true">/</span><span>${escapeHtml(period.label || period.id)}</span>${page > 1 ? `<span aria-hidden="true">/</span><span>${page}번째 조각</span>` : ""}` : ""}</nav><output data-history-status aria-live="polite">${period ? `${events.length}개 문서와 ${transitions.length}개 전환` : `${historicalLens.manifest.periods.length}개 시대와 ${historicalLens.manifest.stats.transitions}개 검토 전환`}</output></div>
    <div class="history-workspace">
      <aside class="history-era-board"><header><p>ERA BOARD</p><h2>시대와 질문</h2></header><div data-history-era-list>${historyEraListHtml(periodId)}</div></aside>
      <main class="history-stage" data-history-stage aria-labelledby="history-stage-title"><header><div><p data-history-stage-kicker>${period ? "ERA SWIMLANES" : "HISTORY OVERVIEW"}</p><h2 id="history-stage-title" data-history-stage-title>${escapeHtml(title)}</h2><p data-history-stage-summary>${escapeHtml(summary)}</p></div></header><div class="history-time-axis" aria-hidden="true"><span>한계</span><i>→</i><span>대응</span><i>→</i><span>새 능력</span><i>→</i><span>다음 제약</span></div><section class="history-events" aria-labelledby="history-events-title"><h3 id="history-events-title">${period ? "연도 × 역사 층위" : "시대별 대표 문서"}</h3><div data-history-event-list>${historyEventListHtml(events)}</div></section><section class="history-transitions" aria-labelledby="history-transitions-title"><h3 id="history-transitions-title">검토된 인과 전환</h3><div data-history-transition-list>${historyTransitionListHtml(transitions)}</div></section>${historyPaginationHtml(period, page)}</main>
      <aside class="history-inspector" data-history-inspector aria-labelledby="history-inspector-title"><p>HOW TO READ</p><h2 id="history-inspector-title">${escapeHtml(title)}</h2><p>${escapeHtml(summary)}</p><dl><div><dt>문서</dt><dd>${events.length}</dd></div><div><dt>전환</dt><dd>${transitions.length}</dd></div></dl><p>문서를 선택하면 사건·출판 시점과 층위를, 전환을 선택하면 저장된 방향·설명·근거를 읽습니다.</p></aside>
    </div>
    <div class="history-error" data-history-error hidden role="alert"><h2>역사 지도 조각을 불러오지 못했습니다</h2><p>현재 정적 문서와 시대 링크는 계속 사용할 수 있습니다.</p><button type="button" data-history-retry>다시 시도</button></div>
    <details class="history-static-disclosure"><summary>텍스트 연대기와 전환 목록으로 읽기</summary><div class="history-static-view"><section><h2>문서</h2>${historyEventListHtml(events)}</section><section><h2>전환</h2>${historyTransitionListHtml(transitions)}</section>${historyPaginationHtml(period, page)}</div></details>
    <noscript><p class="history-noscript">자바스크립트 없이도 시대별 경로, 문서 링크와 검토된 관계 설명을 읽을 수 있습니다.</p></noscript>
  </div>`;
  return layout({
    title: period ? `${period.label || period.id} · 역사·인과 렌즈` : "컴퓨팅 능력의 역사·인과 렌즈",
    description: period ? `${period.label || period.id}의 컴퓨팅사 문서와 검토된 인과 전환.` : "컴퓨팅 능력의 발전을 연도, 역사 층위와 한계-대응-새 능력의 인과 전환으로 읽는 지도.",
    content,
    canonicalPath,
    bodyClass: "history-lens-page-body",
    pageModules: ["history-lens.js"]
  });
}

const evidenceSnapshotLabels = Object.freeze({
  local: "로컬 원본",
  archived: "보존 스냅샷",
  "external-only": "외부 링크 의존"
});

function evidenceRelationStatement(edge = {}) {
  const notes = [...new Set((edge.contexts || []).map((context) => context.note).filter(Boolean))];
  return notes.join(" · ") || "편집자가 관계의 방향과 근거를 명시했습니다.";
}

function evidenceRelationLabel(edge = {}) {
  return knowledgeGraph.legend?.[edge.kind]?.label || edge.kind || "관계";
}

function evidenceSourceProvenanceHtml(node, { selected = false } = {}) {
  const provenance = node.provenance || {};
  const primary = provenance.primarySources || [];
  const supporting = provenance.supportingSources || [];
  const urls = (provenance.sourceUrls || []).map(safeExternalUrl).filter(Boolean);
  const snapshot = evidenceSnapshotLabels[provenance.snapshotStatus] || provenance.snapshotStatus || "미기록";
  return `<article class="evidence-provenance-card${selected ? " is-selected" : ""}" data-evidence-card data-source-kind="${escapeHtml(provenance.sourceKind || "unknown")}" data-snapshot-status="${escapeHtml(provenance.snapshotStatus || "unknown")}">
    <header><span>REPRODUCIBILITY</span><strong>${escapeHtml(snapshot)}</strong></header>
    <h3>${escapeHtml(node.title)}</h3>
    <dl><div><dt>소스 ID</dt><dd>${escapeHtml(node.sourceId || node.id)}</dd></div><div><dt>자료 위치</dt><dd>${provenance.sourceKind === "raw" ? "raw 원본" : "외부 자료"}</dd></div><div><dt>판본</dt><dd>${escapeHtml(provenance.version || "판본 미확인")}</dd></div><div><dt>확인일</dt><dd>${escapeHtml(provenance.retrieved || "미기록")}</dd></div></dl>
    <section><h4>원자료로 기록</h4>${primary.length ? `<ul>${primary.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : "<p>기록 없음</p>"}</section>
    <section><h4>보조·접근 자료</h4>${supporting.length ? `<ul>${supporting.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : "<p>기록 없음</p>"}</section>
    ${urls.length ? `<div class="evidence-external-links">${urls.map((url, index) => `<a href="${escapeHtml(url)}" rel="noreferrer">외부 출처 ${index + 1}</a>`).join("")}</div>` : ""}
  </article>`;
}

function evidenceSourceCardHtml(node, { selected = false } = {}) {
  const provenance = node.provenance || {};
  const usedBy = evidenceEdgesBySource.get(node.id)?.length || 0;
  const relationUses = relationEdgesByEvidence.get(node.id)?.length || 0;
  return `<article class="evidence-source-card${selected ? " is-selected" : ""}" data-evidence-card data-source-kind="${escapeHtml(provenance.sourceKind || "unknown")}" data-snapshot-status="${escapeHtml(provenance.snapshotStatus || "unknown")}">
    <div class="evidence-card-kicker"><span>${node.category === "sources" ? "정규 소스" : "참고 자료"}</span><span>${escapeHtml(evidenceSnapshotLabels[provenance.snapshotStatus] || provenance.snapshotStatus || "보존 미기록")}</span></div>
    <h3><a href="${withBase(evidenceRouteForNode(node))}"${selected ? ' aria-current="page"' : ""}>${escapeHtml(node.title)}</a></h3>
    <p>${escapeHtml(node.summary)}</p>
    <dl><div><dt>문서 등록</dt><dd>${usedBy}</dd></div><div><dt>관계 근거</dt><dd>${relationUses}</dd></div></dl>
    <div class="evidence-card-actions"><a href="${escapeHtml(node.url)}">근거 문서 읽기</a><a href="${withBase(evidenceRouteForNode(node))}">계보로 피벗</a></div>
  </article>`;
}

function evidenceDocumentCardHtml(node, { selected = false, sharedCount = 0, evidenceCount = null } = {}) {
  const count = evidenceCount ?? evidenceEdgesByDocument.get(node.id)?.length ?? 0;
  return `<article class="evidence-document-card${selected ? " is-selected" : ""}">
    <div class="evidence-card-kicker"><span>${escapeHtml(categoryMeta[node.category]?.label || node.category)}</span><span>${escapeHtml(statusLabel(node.status))}</span></div>
    <h3><a href="${withBase(evidenceRouteForNode(node))}"${selected ? ' aria-current="page"' : ""}>${escapeHtml(node.title)}</a></h3>
    <p>${escapeHtml(node.summary)}</p>
    <dl><div><dt>등록 근거</dt><dd>${count}</dd></div>${sharedCount ? `<div><dt>현재 문서와 공유</dt><dd>${sharedCount}</dd></div>` : ""}</dl>
    <div class="evidence-card-actions"><a href="${escapeHtml(node.url)}">지식 문서 읽기</a><a href="${withBase(evidenceRouteForNode(node))}">이 문서로 피벗</a></div>
  </article>`;
}

function evidenceRelationCardHtml(edge, { selected = false } = {}) {
  const source = evidenceNodesById.get(edge.source);
  const target = evidenceNodesById.get(edge.target);
  const routeId = evidenceRelationRouteId(edge.id);
  return `<article class="evidence-relation-card${selected ? " is-selected" : ""}">
    <div class="evidence-card-kicker"><span>검토된 관계</span><span>${escapeHtml(evidenceRelationLabel(edge))}</span></div>
    <h3><a href="${withBase(evidenceFocusRoute("relation", routeId))}"${selected ? ' aria-current="page"' : ""}>${escapeHtml(source?.title || edge.source)} <span>→</span> ${escapeHtml(target?.title || edge.target)}</a></h3>
    <p>${escapeHtml(evidenceRelationStatement(edge))}</p>
    <div class="evidence-relation-direction"><a href="${withBase(evidenceRouteForNode(source))}">${escapeHtml(source?.title || edge.source)}</a><i aria-hidden="true">${escapeHtml(evidenceRelationLabel(edge))} →</i><a href="${withBase(evidenceRouteForNode(target))}">${escapeHtml(target?.title || edge.target)}</a></div>
    <p class="evidence-relation-count">직접 연결된 관계 근거 ${evidenceRelationEvidenceNodes(edge).length}개</p>
  </article>`;
}

function sharedEvidenceNeighbors(documentId, limit = 12) {
  const shared = new Map();
  for (const edge of evidenceEdgesByDocument.get(documentId) || []) {
    for (const other of evidenceEdgesBySource.get(edge.source) || []) {
      if (other.target === documentId) continue;
      if (!shared.has(other.target)) shared.set(other.target, new Set());
      shared.get(other.target).add(edge.source);
    }
  }
  return [...shared.entries()].map(([id, sourceIds]) => ({ node: evidenceNodesById.get(id), sourceIds: [...sourceIds].sort() }))
    .filter((record) => record.node)
    .sort((left, right) => right.sourceIds.length - left.sourceIds.length || left.node.title.localeCompare(right.node.title, "ko"))
    .slice(0, limit);
}

function evidenceRelationEvidenceNodes(edge = {}) {
  return [...new Set(edge.evidence || [])]
    .map((evidenceId) => evidenceNodesById.get(evidenceId))
    .filter((node) => node && evidenceRoutableSourceIds.has(node.id));
}

function evidenceDocumentStaticPageCount(documentId) {
  return evidenceStaticPageCount(
    evidenceEdgesByDocument.get(documentId)?.length || 0,
    relationEdgesByEndpoint.get(documentId)?.length || 0
  );
}

function evidenceSourceStaticPageCount(sourceId) {
  return evidenceStaticPageCount(
    evidenceEdgesBySource.get(sourceId)?.length || 0,
    relationEdgesByEvidence.get(sourceId)?.length || 0
  );
}

function evidenceRelationStaticPageCount(edge) {
  return evidenceStaticPageCount(evidenceRelationEvidenceNodes(edge).length);
}

function evidencePaginationHtml({ scope, id, page, pageCount, root = false }) {
  if (pageCount <= 1) return "";
  const numbers = evidenceStaticPageNumbers(page, pageCount);
  const links = [];
  for (const [index, number] of numbers.entries()) {
    if (index && number - numbers[index - 1] > 1) links.push('<span class="evidence-pagination-gap" aria-hidden="true">…</span>');
    const route = root && number === 1 ? "/map/evidence/" : evidenceFocusRoute(scope, id, number);
    const position = number === page ? "현재" : number === 1 ? "첫" : number === pageCount ? "마지막" : number === page - 1 ? "이전" : number === page + 1 ? "다음" : "이동";
    links.push(`<a href="${withBase(route)}" aria-label="${position} 조각, ${number}/${pageCount}"${number === page ? ' aria-current="page"' : ""}>${number}</a>`);
  }
  return `<nav class="evidence-pagination" aria-label="근거 계보 조각">${links.join("")}</nav>`;
}

function evidenceEntryPointsHtml() {
  const documents = [...evidenceDocumentNodes]
    .sort((left, right) => (evidenceEdgesByDocument.get(right.id)?.length || 0) - (evidenceEdgesByDocument.get(left.id)?.length || 0) || left.title.localeCompare(right.title, "ko"))
    .slice(0, 6);
  const sources = [...evidenceSourceNodes]
    .sort((left, right) => (evidenceEdgesBySource.get(right.id)?.length || 0) - (evidenceEdgesBySource.get(left.id)?.length || 0) || left.title.localeCompare(right.title, "ko"))
    .slice(0, 6);
  return `<details class="evidence-entry-points"><summary>대표 문서와 근거 허브에서 시작하기</summary><div><section><h2>근거가 넓게 등록된 문서</h2><ol>${documents.map((node) => `<li><a href="${withBase(evidenceRouteForNode(node))}"><span>${evidenceEdgesByDocument.get(node.id)?.length || 0}</span>${escapeHtml(node.title)}</a></li>`).join("")}</ol></section><section><h2>여러 문서가 등록한 자료</h2><ol>${sources.map((node) => `<li><a href="${withBase(evidenceRouteForNode(node))}"><span>${evidenceEdgesBySource.get(node.id)?.length || 0}</span>${escapeHtml(node.title)}</a></li>`).join("")}</ol></section></div></details>`;
}

function evidenceLensPage({ scope = "document", id = "", page = 1, rootPage = false, canonicalPath = "/map/evidence/" } = {}) {
  const defaultDocument = evidenceNodesById.get("computing-capability") || [...evidenceDocumentNodes]
    .sort((left, right) => (evidenceEdgesByDocument.get(right.id)?.length || 0) - (evidenceEdgesByDocument.get(left.id)?.length || 0))[0];
  let focus = null;
  let relation = null;
  if (scope === "relation") {
    relation = evidencedRelationEdges.find((edge) => evidenceRelationRouteId(edge.id) === id);
    if (!relation) throw new Error(`Evidence route references missing relation '${id}'`);
  } else {
    focus = id ? evidenceNodesById.get(id) : defaultDocument;
    const valid = scope === "source"
      ? focus && evidenceRoutableSourceIds.has(focus.id)
      : focus?.visibility === "public" && !["sources", "references"].includes(focus.category);
    if (!valid) throw new Error(`Evidence route references missing ${scope} '${id}'`);
  }

  let evidenceSources = [];
  let downstreamDocuments = [];
  let focusRelations = [];
  let neighbors = [];
  let totalItems = 0;
  if (scope === "document") {
    evidenceSources = (evidenceEdgesByDocument.get(focus.id) || []).map((edge) => evidenceNodesById.get(edge.source)).filter(Boolean);
    focusRelations = relationEdgesByEndpoint.get(focus.id) || [];
    neighbors = sharedEvidenceNeighbors(focus.id);
    totalItems = Math.max(evidenceSources.length, focusRelations.length);
  } else if (scope === "source") {
    evidenceSources = [focus];
    downstreamDocuments = (evidenceEdgesBySource.get(focus.id) || []).map((edge) => evidenceNodesById.get(edge.target)).filter(Boolean);
    focusRelations = relationEdgesByEvidence.get(focus.id) || [];
    totalItems = Math.max(downstreamDocuments.length, focusRelations.length);
  } else {
    evidenceSources = evidenceRelationEvidenceNodes(relation);
    totalItems = evidenceSources.length;
  }

  const pageCount = evidenceStaticPageCount(totalItems);
  if (!Number.isInteger(page) || page < 1 || page > pageCount) throw new Error(`Evidence route references missing page '${page}'`);
  const start = (page - 1) * EVIDENCE_STATIC_PAGE_SIZE;
  const pageEvidenceSources = scope === "source" ? evidenceSources : evidenceSources.slice(start, start + EVIDENCE_STATIC_PAGE_SIZE);
  const pageDocuments = scope === "source" ? downstreamDocuments.slice(start, start + EVIDENCE_STATIC_PAGE_SIZE) : downstreamDocuments;
  const pageRelations = scope === "relation" ? [] : focusRelations.slice(start, start + EVIDENCE_STATIC_PAGE_SIZE);
  const focusTitle = relation ? `${evidenceNodesById.get(relation.source)?.title || relation.source} → ${evidenceNodesById.get(relation.target)?.title || relation.target}` : focus.title;
  const focusSummary = relation ? evidenceRelationStatement(relation) : focus.summary;
  const routeId = relation ? evidenceRelationRouteId(relation.id) : focus.id;
  const scopeLabel = scope === "source" ? "근거 문서" : scope === "relation" ? "검토 관계" : "지식 문서";
  const provenanceCards = pageEvidenceSources.map((node) => evidenceSourceProvenanceHtml(node, { selected: scope === "source" })).join("") || '<p class="evidence-empty">등록된 근거 문서가 없습니다.</p>';
  const sourceCards = pageEvidenceSources.map((node) => evidenceSourceCardHtml(node, { selected: scope === "source" })).join("") || '<p class="evidence-empty">등록된 근거 문서가 없습니다.</p>';
  const assertionCards = scope === "document"
    ? `${evidenceDocumentCardHtml(focus, { selected: true })}${neighbors.length ? `<section class="evidence-neighbor-list"><header><h3>같은 자료를 등록한 다른 문서</h3><p>공통 근거는 합의나 같은 결론을 뜻하지 않습니다.</p></header><ol>${neighbors.map(({ node, sourceIds }) => `<li>${evidenceDocumentCardHtml(node, { sharedCount: sourceIds.length })}</li>`).join("")}</ol></section>` : ""}`
    : scope === "source"
      ? `<section class="evidence-downstream-list"><header><h3>이 자료를 등록한 지식 문서</h3><p>${downstreamDocuments.length}개 문서 가운데 ${pageDocuments.length}개를 표시합니다.</p></header><ol>${pageDocuments.map((node) => `<li>${evidenceDocumentCardHtml(node)}</li>`).join("")}</ol></section>`
      : evidenceRelationCardHtml(relation, { selected: true });
  const preservationCounts = Object.fromEntries(["local", "archived", "external-only"].map((status) => [status, evidenceSourceNodes.filter((node) => node.provenance?.snapshotStatus === status).length]));
  const relationEvidenceLinks = evidencedRelationEdges.reduce((total, edge) => total + evidenceRelationEvidenceNodes(edge).length, 0);
  const content = `<div class="evidence-lens-page section-frame" data-evidence-lens
    data-evidence-manifest-url="${withBase("/data/evidence/manifest.json")}?v=${assetVersion}"
    data-evidence-root-url="${withBase("/map/evidence/")}"
    data-evidence-focus-scope="${escapeHtml(scope)}" data-evidence-focus-id="${escapeHtml(routeId)}">
    <section class="evidence-hero"><div><p class="eyebrow"><a href="${withBase("/")}">홈</a> / DOCUMENT EVIDENCE LINEAGE</p><h1>근거가 지식 문서로 <span>이어지는 경로를 읽는다.</span></h1><p>링크를 점으로 흩뿌리지 않습니다. 원자료와 재현 정보, 정규 소스·참고 자료, 그 자료를 등록한 지식 문서와 검토 관계를 방향이 있는 계보로 펼칩니다.</p></div><dl><div><dt>지식 문서</dt><dd>${evidenceDocumentNodes.length}</dd></div><div><dt>문서 근거 연결</dt><dd>${documentEvidenceEdges.length}</dd></div><div><dt>근거 문서</dt><dd>${evidenceSourceNodes.length}</dd></div><div><dt>직접 근거 관계</dt><dd>${relationEvidenceLinks}</dd></div></dl></section>
    ${mapModeNav("evidence")}
    <aside class="evidence-boundary" aria-label="이 렌즈가 보여 주는 범위"><strong>해석 경계</strong><p>이 렌즈는 문장별 진위나 신뢰도를 판정하지 않습니다. 프론트매터에 등록된 문서 단위 근거와 관계 표에 직접 연결된 관계 근거를 구분해 보여 줍니다.</p></aside>
    <form class="evidence-controls" data-evidence-controls hidden>
      <div class="evidence-search-shell"><label>문서·근거 찾기<input type="search" data-evidence-search autocomplete="off" role="combobox" aria-autocomplete="list" aria-haspopup="listbox" aria-expanded="false" aria-controls="evidence-search-results" placeholder="제목·별칭 앞부분 2자 이상"></label><div id="evidence-search-results" class="evidence-search-results" data-evidence-search-results role="listbox" aria-label="근거 계보 검색 결과" aria-live="polite"></div></div>
      <label>검색 범위<select data-evidence-scope><option value="all">전체</option><option value="document">지식 문서</option><option value="source">근거 문서</option><option value="relation">검토 관계</option></select></label>
      <label>현재 근거 표시<select data-evidence-preservation><option value="">전체 보존 상태</option><option value="local">로컬 원본</option><option value="archived">보존 스냅샷</option><option value="external-only">외부 링크 의존</option></select></label>
      <button type="button" data-evidence-reset>초기화</button>
    </form>
    <div class="evidence-state-bar"><nav aria-label="근거 계보 위치"><a href="${withBase("/map/evidence/")}">근거 계보</a><span aria-hidden="true">/</span><span>${escapeHtml(scopeLabel)}</span><span aria-hidden="true">/</span><span>${escapeHtml(focusTitle)}</span>${page > 1 ? `<span aria-hidden="true">/</span><span>${page}번째 조각</span>` : ""}</nav><output data-evidence-status aria-live="polite">${scope === "source" ? `${downstreamDocuments.length}개 지식 문서가 이 자료를 등록했습니다.` : `${evidenceSources.length}개 근거 문서가 연결되어 있습니다.`}</output></div>
    <header class="evidence-focus-heading"><p>${escapeHtml(scopeLabel.toUpperCase())}</p><h2>${escapeHtml(focusTitle)}</h2><p>${escapeHtml(focusSummary)}</p></header>
    <div class="evidence-braid" aria-label="원자료에서 지식 문서로 이어지는 근거 계보">
      <div class="evidence-braid-labels" aria-hidden="true"><span>01 · 원자료와 재현 정보</span><i>→</i><span>02 · 정규 소스·참고 자료</span><i>→</i><span>03 · 지식 문서·검토 관계</span></div>
      <section class="evidence-braid-rail evidence-provenance-rail" aria-labelledby="evidence-provenance-title"><header><span>01</span><div><h2 id="evidence-provenance-title">원자료와 재현 정보</h2><p>원자료·보조 자료, 판본, 확인일과 보존 상태</p></div></header><div data-evidence-provenance-list>${provenanceCards}</div></section>
      <section class="evidence-braid-rail evidence-source-rail" aria-labelledby="evidence-source-title"><header><span>02</span><div><h2 id="evidence-source-title">정규 소스·참고 자료</h2><p>지식 문서가 근거로 등록한 위키의 자료 페이지</p></div></header><div data-evidence-source-list>${sourceCards}</div></section>
      <section class="evidence-braid-rail evidence-assertion-rail" aria-labelledby="evidence-assertion-title"><header><span>03</span><div><h2 id="evidence-assertion-title">지식 문서·검토 관계</h2><p>문서 단위 근거 묶음과 직접 근거가 명시된 관계</p></div></header><div data-evidence-assertion-list>${assertionCards}</div></section>
    </div>
    ${pageRelations.length ? `<section class="evidence-reviewed-relations" aria-labelledby="evidence-reviewed-title"><header><p>RELATION ASSERTIONS</p><h2 id="evidence-reviewed-title">근거가 직접 명시된 검토 관계</h2><span>${pageRelations.length}/${focusRelations.length}개 표시</span></header><ol>${pageRelations.map((edge) => `<li>${evidenceRelationCardHtml(edge)}</li>`).join("")}</ol></section>` : ""}
    ${evidencePaginationHtml({ scope, id: routeId, page, pageCount, root: rootPage })}
    <section class="evidence-preservation-summary" aria-label="전체 근거 문서의 보존 상태"><div><span>로컬 원본</span><strong>${preservationCounts.local}</strong></div><div><span>보존 스냅샷</span><strong>${preservationCounts.archived}</strong></div><div><span>외부 링크 의존</span><strong>${preservationCounts["external-only"]}</strong></div><p>보존 상태는 자료의 품질 점수가 아니라 다시 확인할 수 있는 조건을 뜻합니다.</p></section>
    ${evidenceEntryPointsHtml()}
    <div class="evidence-error" data-evidence-error hidden role="alert"><h2>검색 조각을 불러오지 못했습니다</h2><p>현재 계보와 정적 링크는 계속 사용할 수 있습니다.</p><button type="button" data-evidence-retry>다시 시도</button></div>
    <noscript><p class="evidence-noscript">자바스크립트 없이도 현재 근거 계보, 문서·자료 링크와 다음 조각을 모두 읽을 수 있습니다.</p></noscript>
  </div>`;
  return layout({
    title: rootPage ? "문서·근거 계보" : `${focusTitle} · 근거 계보`,
    description: "원자료와 재현 정보에서 정규 소스·참고 자료를 거쳐 지식 문서와 검토 관계로 이어지는 문서 단위 근거 계보.",
    content,
    canonicalPath,
    bodyClass: "evidence-lens-page-body",
    pageModules: ["evidence-lens.js"]
  });
}

function redirectPage(target) {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${escapeHtml(withBase(target))}"><link rel="canonical" href="${escapeHtml(withBase(target))}"><title>이동 중 · CS Wiki</title></head><body><p><a href="${escapeHtml(withBase(target))}">새 주소로 이동</a></p></body></html>`;
}

const output = createOutputWriter(distRoot);
const atlasDataOutputPath = createDataOutputPath("atlas", "semantic atlas");
const historyDataOutputPath = createDataOutputPath("history", "historical lens");
const evidenceDataOutputPath = createDataOutputPath("evidence", "evidence lens");

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
await output(join("map", "index.html"), connectionExplorerPage());
await output(join("map", "graph", "index.html"), knowledgeGraphPage());
const featuredLearningPath = resolvedLearningPaths.find((path) => path.slug === "computing-capability-history") || resolvedLearningPaths[0];
const featuredLearningStation = featuredLearningPath.pages.find((page) => graphNodeId(page) === "computing-capability") || featuredLearningPath.pages[0];
await output(join("map", "learning", "index.html"), learningMapPage({
  defaultPath: featuredLearningPath,
  defaultStation: featuredLearningStation
}));
for (const path of resolvedLearningPaths) {
  await output(join("map", "learning", path.slug, "index.html"), learningMapPage({
    defaultPath: path,
    defaultStation: path.pages[0],
    canonicalPath: `/map/learning/${path.slug}/`
  }));
}
await output(join("map", "atlas", "index.html"), semanticAtlasPage());
for (const cluster of atlasClusterEntries()) {
  if (!/^[a-z0-9]+(?:[._-]+[a-z0-9]+)*$/.test(cluster.id)) throw new Error(`Unsafe semantic atlas cluster id '${cluster.id}'`);
  await output(join("map", "atlas", cluster.id, "index.html"), semanticAtlasPage({
    clusterId: cluster.id,
    canonicalPath: `/map/atlas/${cluster.id}/`
  }));
}
await output(join("map", "history", "index.html"), historicalLensPage());
for (const period of historicalLens.manifest.periods) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(period.id)) throw new Error(`Unsafe history period id '${period.id}'`);
  for (let page = 1; page <= period.pageCount; page += 1) {
    const route = historyPeriodRoute(period, page);
    await output(join(...route.split("/").filter(Boolean), "index.html"), historicalLensPage({
      periodId: period.id,
      page,
      canonicalPath: route
    }));
  }
}
await output(join("map", "evidence", "index.html"), evidenceLensPage({ rootPage: true }));
for (const node of evidenceDocumentNodes) {
  if (!node.id || /[\\/?#]/.test(node.id) || node.id === "." || node.id === "..") throw new Error(`Unsafe evidence document id '${node.id}'`);
  const pageCount = evidenceDocumentStaticPageCount(node.id);
  for (let page = 1; page <= pageCount; page += 1) {
    await output(join("map", "evidence", "document", node.id, ...(page > 1 ? [String(page)] : []), "index.html"), evidenceLensPage({
      scope: "document",
      id: node.id,
      page,
      canonicalPath: evidenceFocusRoute("document", node.id, page)
    }));
  }
}
for (const node of evidenceRoutableSourceNodes) {
  if (!node.id || /[\\/?#]/.test(node.id) || node.id === "." || node.id === "..") throw new Error(`Unsafe evidence source id '${node.id}'`);
  const pageCount = evidenceSourceStaticPageCount(node.id);
  for (let page = 1; page <= pageCount; page += 1) {
    await output(join("map", "evidence", "source", node.id, ...(page > 1 ? [String(page)] : []), "index.html"), evidenceLensPage({
      scope: "source",
      id: node.id,
      page,
      canonicalPath: evidenceFocusRoute("source", node.id, page)
    }));
  }
}
for (const edge of evidencedRelationEdges) {
  const routeId = evidenceRelationRouteId(edge.id);
  const pageCount = evidenceRelationStaticPageCount(edge);
  for (let page = 1; page <= pageCount; page += 1) {
    await output(join("map", "evidence", "relation", routeId, ...(page > 1 ? [String(page)] : []), "index.html"), evidenceLensPage({
      scope: "relation",
      id: routeId,
      page,
      canonicalPath: evidenceFocusRoute("relation", routeId, page)
    }));
  }
}
for (const page of pages) {
  await output(join(page.category, page.slug, "index.html"), articlePage(page));
  if (page.category === "references") {
    await output(join("sources", page.slug, "index.html"), redirectPage(page.url));
  }
}

const searchIndex = siteDiscoveryPages.map((page) => ({
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
await output(join("data", "knowledge-graph.json"), JSON.stringify(knowledgeGraph));
await output(join("data", "connection-graph.json"), JSON.stringify(connectionGraph));
await output(join("data", "learning-map.json"), JSON.stringify(learningMap));
await output(join("data", "atlas", "manifest.json"), JSON.stringify(semanticAtlas.manifest));
await output(atlasDataOutputPath(semanticAtlas.manifest.overview.url, "overview"), JSON.stringify(semanticAtlas.overview));
await output(atlasDataOutputPath(semanticAtlas.manifest.lookup.url, "lookup"), JSON.stringify(semanticAtlas.lookup));
for (const [id, payload] of Object.entries(semanticAtlas.shards)) {
  const url = semanticAtlas.manifest.clusterShards[id]
    || semanticAtlas.manifest.routes.cluster.replace("{id}", encodeURIComponent(id));
  await output(atlasDataOutputPath(url, `cluster '${id}'`), JSON.stringify(payload));
}
for (const [id, payload] of Object.entries(semanticAtlas.corridors)) {
  const url = semanticAtlas.manifest.corridorShards[id]
    || semanticAtlas.manifest.routes.corridor.replace("{id}", encodeURIComponent(id));
  await output(atlasDataOutputPath(url, `corridor '${id}'`), JSON.stringify(payload));
}
for (const [id, payload] of Object.entries(semanticAtlas.focusShards)) {
  if (!/^node-[a-f0-9]{16}$/.test(id)) throw new Error(`Unsafe semantic atlas focus shard id '${id}'`);
  const url = semanticAtlas.manifest.routes.focus.replace("{shard}", encodeURIComponent(payload.shardId || id));
  await output(atlasDataOutputPath(url, `focus '${id}'`), JSON.stringify(payload));
}
await output(join("data", "history", "manifest.json"), JSON.stringify(historicalLens.manifest));
await output(historyDataOutputPath(historicalLens.manifest.overview.url, "overview"), JSON.stringify(historicalLens.overview));
for (const [bucket, payload] of Object.entries(historicalLens.lookupShards)) {
  if (!/^\d+$/.test(bucket)) throw new Error(`Unsafe history lookup bucket '${bucket}'`);
  const url = historicalLens.manifest.lookup.route.replaceAll("{bucket}", bucket);
  await output(historyDataOutputPath(url, `lookup bucket '${bucket}'`), JSON.stringify(payload));
}
for (const record of historicalLens.manifest.shards) {
  const payload = historicalLens.shards[record.id];
  if (!payload) throw new Error(`History manifest references missing shard '${record.id}'`);
  await output(historyDataOutputPath(record.url, `shard '${record.id}'`), JSON.stringify(payload));
}
for (const payload of Object.values(historicalLens.transitionDetails)) {
  if (!/^(?:node-transition|precedes|constraint)-[a-f0-9]{16}$/.test(payload.transitionId || "")) {
    throw new Error(`Unsafe history transition detail id '${payload.transitionId}'`);
  }
  const page = String(Number(payload.page)).padStart(Number(historicalLens.manifest.transitionDetails.pageWidth || 4), "0");
  const url = historicalLens.manifest.transitionDetails.route
    .replaceAll("{transition}", encodeURIComponent(payload.transitionId))
    .replaceAll("{page}", page);
  await output(historyDataOutputPath(url, `transition detail '${payload.id}'`), JSON.stringify(payload));
}
await output(join("data", "evidence", "manifest.json"), JSON.stringify(evidenceLens.manifest));
await output(evidenceDataOutputPath(evidenceLens.manifest.overview.url, "overview"), JSON.stringify(evidenceLens.overview));
for (const [bucket, payload] of Object.entries(evidenceLens.lookupShards)) {
  if (!/^\d+$/.test(bucket)) throw new Error(`Unsafe evidence lookup bucket '${bucket}'`);
  const url = evidenceLens.manifest.lookup.route.replaceAll("{bucket}", bucket);
  await output(evidenceDataOutputPath(url, `lookup bucket '${bucket}'`), JSON.stringify(payload));
}
for (const payload of Object.values(evidenceLens.searchShards)) {
  if (!payload.route) throw new Error(`Evidence search shard '${payload.id}' is missing its route`);
  await output(evidenceDataOutputPath(payload.route, `search shard '${payload.id}'`), JSON.stringify(payload));
}
for (const [shardId, payload] of Object.entries(evidenceLens.assertionShards)) {
  if (!/^(?:document|relation)-[a-f0-9]{16}$/.test(shardId)) throw new Error(`Unsafe evidence assertion shard '${shardId}'`);
  const url = evidenceLens.manifest.routes.assertion.replaceAll("{shard}", shardId);
  await output(evidenceDataOutputPath(url, `assertion focus '${shardId}'`), JSON.stringify(payload));
}
for (const payload of Object.values(evidenceLens.assertionDetails)) {
  if (!payload.route) throw new Error(`Evidence assertion detail '${payload.id}' is missing its route`);
  await output(evidenceDataOutputPath(payload.route, `assertion detail '${payload.id}'`), JSON.stringify(payload));
}
for (const [shardId, payload] of Object.entries(evidenceLens.evidenceShards)) {
  if (!/^evidence-[a-f0-9]{16}$/.test(shardId)) throw new Error(`Unsafe evidence source shard '${shardId}'`);
  const url = evidenceLens.manifest.routes.evidence.replaceAll("{shard}", shardId);
  await output(evidenceDataOutputPath(url, `evidence focus '${shardId}'`), JSON.stringify(payload));
}
for (const payload of Object.values(evidenceLens.evidenceDetails)) {
  if (!payload.route) throw new Error(`Evidence source detail '${payload.id}' is missing its route`);
  await output(evidenceDataOutputPath(payload.route, `evidence detail '${payload.id}'`), JSON.stringify(payload));
}
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
    "/map/",
    "/map/graph/",
    "/map/learning/",
    "/map/atlas/",
    "/map/history/",
    "/map/evidence/",
    ...atlasClusterEntries().map((cluster) => `/map/atlas/${cluster.id}/`),
    ...historicalLens.manifest.shards.map((record) => record.route),
    ...evidenceDocumentNodes.flatMap((node) => Array.from({ length: evidenceDocumentStaticPageCount(node.id) }, (_, index) => evidenceFocusRoute("document", node.id, index + 1))),
    ...evidenceSourceNodes.flatMap((node) => Array.from({ length: evidenceSourceStaticPageCount(node.id) }, (_, index) => evidenceFocusRoute("source", node.id, index + 1))),
    ...evidencedRelationEdges.flatMap((edge) => Array.from({ length: evidenceRelationStaticPageCount(edge) }, (_, index) => evidenceFocusRoute("relation", evidenceRelationRouteId(edge.id), index + 1))),
    ...resolvedLearningPaths.map((path) => `/map/learning/${path.slug}/`),
    ...resolvedLearningPaths.map((path) => `/paths/${path.slug}/`),
    ...siteDiscoveryPages.map((page) => page.url)
  ];
  await output("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.map((url) => `  <url><loc>${siteUrl}${url}</loc></url>`).join("\n")}\n</urlset>`);
  await output("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
}

console.log(`Built ${pages.length} wiki pages in ${distRoot}`);
