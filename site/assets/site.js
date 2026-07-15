const base = window.CS_WIKI_BASE || "";
const assetVersion = window.CS_WIKI_ASSET_VERSION || "";

const dialog = document.querySelector("[data-search-dialog]");
const searchInput = document.querySelector("[data-search-input]");
const searchResults = document.querySelector("[data-search-results]");
const searchCategory = document.querySelector("[data-search-category]");
const searchStatus = document.querySelector("[data-search-status]");
const searchCount = document.querySelector("[data-search-count]");
const openSearchButtons = document.querySelectorAll("[data-open-search]");
const menuButton = document.querySelector(".menu-trigger");
const mobileMenu = document.querySelector("#mobile-menu");

let searchIndex = null;
let searchIndexPromise = null;
let selectedResult = -1;
let searchRenderVersion = 0;

function normalize(value) {
  return String(value || "").normalize("NFKC").toLocaleLowerCase("ko-KR");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function appendHighlighted(element, value, terms) {
  const text = String(value || "");
  const visibleTerms = [...new Set(terms.map((term) => term.trim()).filter(Boolean))];
  if (!visibleTerms.length) {
    element.textContent = text;
    return;
  }
  const pattern = new RegExp(`(${visibleTerms.map(escapeRegExp).join("|")})`, "giu");
  text.split(pattern).filter(Boolean).forEach((part) => {
    if (visibleTerms.some((term) => normalize(part) === normalize(term))) {
      const mark = document.createElement("mark");
      mark.textContent = part;
      element.append(mark);
    } else {
      element.append(document.createTextNode(part));
    }
  });
}

async function loadSearchIndex() {
  if (searchIndex) return searchIndex;
  if (!searchIndexPromise) {
    searchIndexPromise = fetch(`${base}/search.json?v=${assetVersion}`)
      .then((response) => {
        if (!response.ok) throw new Error("검색 색인을 불러오지 못했습니다.");
        return response.json();
      })
      .then((index) => {
        searchIndex = index;
        return index;
      })
      .catch((error) => {
        searchIndexPromise = null;
        throw error;
      });
  }
  return searchIndexPromise;
}

function clearResults(message) {
  searchResults?.replaceChildren();
  if (searchResults) {
    const paragraph = document.createElement("p");
    paragraph.className = "search-empty";
    paragraph.textContent = message;
    searchResults.append(paragraph);
  }
  if (searchCount) searchCount.textContent = "";
  selectedResult = -1;
}

function resultElement(item, index, terms) {
  const anchor = document.createElement("a");
  anchor.className = "search-result";
  anchor.href = item.url;
  anchor.dataset.resultIndex = String(index);

  const meta = document.createElement("span");
  meta.className = "search-result-meta";
  const category = document.createElement("span");
  category.textContent = item.category;
  const status = document.createElement("span");
  status.textContent = item.statusLabel;
  meta.append(category, status);

  const body = document.createElement("div");
  const title = document.createElement("strong");
  appendHighlighted(title, item.title, terms);
  const description = document.createElement("p");
  appendHighlighted(description, item.description, terms);
  body.append(title, description);

  const time = document.createElement("time");
  time.textContent = item.updated;
  anchor.append(meta, body, time);
  return anchor;
}

function rankItem(item, terms) {
  const title = normalize(item.title);
  const aliases = normalize((item.aliases || []).join(" "));
  const description = normalize(item.description);
  const tags = normalize((item.tags || []).join(" "));
  const sourceId = normalize(item.sourceId);
  const text = normalize(item.text);
  const corpus = `${title} ${aliases} ${description} ${tags} ${sourceId} ${text}`;
  let score = 0;

  for (const term of terms) {
    if (!corpus.includes(term)) return -1;
    if (title === term) score += 120;
    else if (title.startsWith(term)) score += 60;
    else if (title.includes(term)) score += 30;
    if (aliases.includes(term)) score += 24;
    if (sourceId.includes(term)) score += 20;
    if (description.includes(term)) score += 10;
    if (tags.includes(term)) score += 5;
    if (text.includes(term)) score += 2;
  }
  return score;
}

function updateSearchUrl(query) {
  const url = new URL(window.location.href);
  const value = query.trim();
  if (value) url.searchParams.set("q", value);
  else url.searchParams.delete("q");
  window.history.replaceState({}, "", url);
}

async function renderSearch(query) {
  const renderVersion = ++searchRenderVersion;
  const original = String(query || "").trim();
  const value = normalize(original);
  updateSearchUrl(original);
  if (!value) {
    clearResults("검색어를 입력하세요.");
    return;
  }

  try {
    const index = await loadSearchIndex();
    if (renderVersion !== searchRenderVersion) return;
    const terms = value.split(/\s+/).filter(Boolean);
    const categoryValue = searchCategory?.value || "";
    const statusValue = searchStatus?.value || "";
    const matches = index
      .filter((item) => !categoryValue || item.categoryKey === categoryValue)
      .filter((item) => !statusValue || item.status === statusValue)
      .map((item) => ({ item, score: rankItem(item, terms) }))
      .filter(({ score }) => score >= 0)
      .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, "ko"));
    const results = matches.slice(0, 30).map(({ item }) => item);

    if (!results.length) {
      clearResults(`“${original}” 검색 결과가 없습니다.`);
      return;
    }

    selectedResult = -1;
    searchResults.replaceChildren(...results.map((item, index) => resultElement(item, index, terms)));
    searchCount.textContent = matches.length > results.length
      ? `${matches.length}개 중 ${results.length}개 표시`
      : `${matches.length}개 결과`;
  } catch (error) {
    if (renderVersion === searchRenderVersion) clearResults(error.message);
  }
}

async function openSearch({ query = "", preserveFilters = false } = {}) {
  if (!dialog || dialog.open) return;
  dialog.showModal();
  searchInput.value = query;
  if (!preserveFilters) {
    searchCategory.value = "";
    searchStatus.value = "";
  }
  if (query) await renderSearch(query);
  else clearResults("검색어를 입력하세요.");
  requestAnimationFrame(() => {
    if (dialog.open) searchInput.focus();
  });
  loadSearchIndex().catch(() => {});
}

openSearchButtons.forEach((button) => button.addEventListener("click", () => openSearch()));
searchInput?.addEventListener("input", (event) => renderSearch(event.target.value));
searchCategory?.addEventListener("change", () => renderSearch(searchInput.value));
searchStatus?.addEventListener("change", () => renderSearch(searchInput.value));

searchInput?.addEventListener("keydown", (event) => {
  const results = [...searchResults.querySelectorAll(".search-result")];
  if (!results.length) return;

  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    results.forEach((result) => result.classList.remove("active"));
    const movement = event.key === "ArrowDown" ? 1 : -1;
    selectedResult = (selectedResult + movement + results.length) % results.length;
    results[selectedResult].classList.add("active");
    results[selectedResult].scrollIntoView({ block: "nearest" });
  }

  if (event.key === "Enter" && selectedResult >= 0) {
    event.preventDefault();
    results[selectedResult].click();
  }
});

dialog?.addEventListener("close", () => {
  searchRenderVersion += 1;
  updateSearchUrl("");
});

document.addEventListener("keydown", (event) => {
  const target = event.target;
  const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    if (!dialog?.open) openSearch();
  } else if (event.key === "/" && !isTyping && !dialog?.open) {
    event.preventDefault();
    openSearch();
  }
});

const initialQuery = new URL(window.location.href).searchParams.get("q") || "";
if (initialQuery) openSearch({ query: initialQuery, preserveFilters: true });

function setMenu(open, returnFocus = false) {
  if (!menuButton || !mobileMenu) return;
  menuButton.setAttribute("aria-expanded", String(open));
  mobileMenu.hidden = !open;
  document.body.classList.toggle("menu-open", open);
  if (!open && returnFocus) menuButton.focus();
}

menuButton?.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});

mobileMenu?.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenu(false);
});

document.addEventListener("pointerdown", (event) => {
  if (menuButton?.getAttribute("aria-expanded") !== "true") return;
  if (!mobileMenu.contains(event.target) && !menuButton.contains(event.target)) setMenu(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton?.getAttribute("aria-expanded") === "true") {
    event.preventDefault();
    setMenu(false, true);
  }
});

window.matchMedia("(min-width: 861px)").addEventListener("change", (event) => {
  if (event.matches) setMenu(false);
});

const articleMeta = document.querySelector("[data-article-meta]");
if (articleMeta) {
  const articleMedia = window.matchMedia("(max-width: 860px)");
  if (articleMedia.matches) articleMeta.removeAttribute("open");
  articleMedia.addEventListener("change", (event) => {
    if (!event.matches) articleMeta.setAttribute("open", "");
  });
}

function initializeListings() {
  document.querySelectorAll("[data-listing]").forEach((listing) => {
    const queryInput = listing.querySelector("[data-list-query]");
    const domainSelect = listing.querySelector("[data-list-domain]");
    const statusSelect = listing.querySelector("[data-list-status]");
    const sortSelect = listing.querySelector("[data-list-sort]");
    const count = listing.querySelector("[data-list-count]");
    const empty = listing.querySelector("[data-list-empty]");
    const grid = listing.querySelector(".document-grid");
    const cards = [...listing.querySelectorAll("[data-document-card]")];
    const url = new URL(window.location.href);

    queryInput.value = url.searchParams.get("filter") || "";
    domainSelect.value = url.searchParams.get("domain") || "";
    statusSelect.value = url.searchParams.get("status") || "";
    sortSelect.value = url.searchParams.get("sort") || "score";

    function updateUrl() {
      const next = new URL(window.location.href);
      const values = {
        filter: queryInput.value.trim(),
        domain: domainSelect.value,
        status: statusSelect.value,
        sort: sortSelect.value === "score" ? "" : sortSelect.value
      };
      Object.entries(values).forEach(([name, value]) => value ? next.searchParams.set(name, value) : next.searchParams.delete(name));
      window.history.replaceState({}, "", next);
    }

    function applyFilters() {
      const term = normalize(queryInput.value.trim());
      const domain = domainSelect.value;
      const status = statusSelect.value;
      const sort = sortSelect.value;
      const visible = cards.filter((card) => {
        const matchesQuery = !term || normalize(`${card.dataset.title} ${card.dataset.summary}`).includes(term);
        const matchesDomain = !domain || card.dataset.domains.split(",").includes(domain);
        const matchesStatus = !status || card.dataset.status === status;
        card.hidden = !(matchesQuery && matchesDomain && matchesStatus);
        return !card.hidden;
      });

      const sorted = [...cards].sort((a, b) => {
        if (sort === "title") return a.dataset.title.localeCompare(b.dataset.title, "ko");
        if (sort === "updated") return b.dataset.updated.localeCompare(a.dataset.updated) || a.dataset.title.localeCompare(b.dataset.title, "ko");
        return Number(b.dataset.score) - Number(a.dataset.score) || a.dataset.title.localeCompare(b.dataset.title, "ko");
      });
      sorted.forEach((card) => grid.append(card));
      count.textContent = `${visible.length}개 문서`;
      empty.hidden = visible.length > 0;
      updateUrl();
    }

    listing.querySelector("[data-list-controls]")?.addEventListener("submit", (event) => event.preventDefault());
    queryInput.addEventListener("input", applyFilters);
    domainSelect.addEventListener("change", applyFilters);
    statusSelect.addEventListener("change", applyFilters);
    sortSelect.addEventListener("change", applyFilters);
    applyFilters();
  });
}

initializeListings();

function initializeGraph() {
  const canvas = document.querySelector("#knowledge-graph");
  const source = document.querySelector("#graph-data");
  if (!canvas || !source) return;

  const graph = JSON.parse(source.textContent);
  const context = canvas.getContext("2d");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let width = 0;
  let height = 0;
  let nodes = [];
  let activeNode = -1;
  let animationFrame = 0;
  let animationUntil = 0;
  let visible = false;
  let lastPaint = 0;

  function positionNodes() {
    const padding = Math.min(width, height) * 0.14;
    const usableWidth = Math.max(1, width - padding * 2);
    const usableHeight = Math.max(1, height - padding * 2);
    const centerX = width / 2;
    const centerY = height / 2;
    const golden = Math.PI * (3 - Math.sqrt(5));

    nodes = graph.nodes.map((node, index) => {
      const ratio = graph.nodes.length <= 1 ? 0 : index / (graph.nodes.length - 1);
      const radius = 0.18 + 0.72 * Math.sqrt(ratio);
      const angle = index * golden - Math.PI / 2;
      return {
        ...node,
        x: centerX + Math.cos(angle) * usableWidth * 0.47 * radius,
        y: centerY + Math.sin(angle) * usableHeight * 0.43 * radius,
        radius: 4 + Math.min(8, Math.sqrt(node.score || 1))
      };
    });
  }

  function draw(time = performance.now()) {
    context.clearRect(0, 0, width, height);
    context.lineWidth = 1;

    graph.edges.forEach(([from, to]) => {
      const start = nodes[from];
      const end = nodes[to];
      if (!start || !end) return;
      const active = from === activeNode || to === activeNode;
      context.strokeStyle = active ? "rgba(255,176,0,0.68)" : "rgba(0,255,65,0.20)";
      context.beginPath();
      context.moveTo(start.x, start.y);
      context.lineTo(end.x, end.y);
      context.stroke();
    });

    nodes.forEach((node, index) => {
      const hovered = index === activeNode;
      const pulse = prefersReducedMotion || time >= animationUntil ? 0 : Math.sin(time / 700 + index) * 1.2;
      context.shadowColor = hovered ? "#ffb000" : "#00ff41";
      context.shadowBlur = hovered ? 20 : 10;
      context.fillStyle = hovered ? "#ffb000" : "#00ff41";
      context.beginPath();
      context.arc(node.x, node.y, node.radius + pulse + (hovered ? 2 : 0), 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;

      context.font = `${hovered ? "700" : "400"} 11px "D2Coding", monospace`;
      context.fillStyle = hovered ? "#ffb000" : "rgba(231,255,233,0.86)";
      context.textAlign = node.x > width * 0.68 ? "right" : "left";
      context.textBaseline = "middle";
      const label = node.title.length > 24 ? `${node.title.slice(0, 23)}…` : node.title;
      context.fillText(label, node.x + (context.textAlign === "right" ? -14 : 14), node.y);
    });
  }

  function frame(time) {
    animationFrame = 0;
    if (!visible || document.hidden) return;
    if (time - lastPaint >= 50) {
      draw(time);
      lastPaint = time;
    }
    if (!prefersReducedMotion && time < animationUntil) animationFrame = requestAnimationFrame(frame);
  }

  function animateFor(duration) {
    animationUntil = performance.now() + duration;
    if (prefersReducedMotion || !visible || document.hidden) {
      draw();
      return;
    }
    if (!animationFrame) animationFrame = requestAnimationFrame(frame);
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    positionNodes();
    draw();
    animateFor(1800);
  }

  function findNode(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return nodes.findIndex((node) => Math.hypot(node.x - x, node.y - y) < node.radius + 18);
  }

  canvas.addEventListener("pointermove", (event) => {
    const next = findNode(event);
    if (next === activeNode) return;
    activeNode = next;
    canvas.style.cursor = activeNode >= 0 ? "pointer" : "crosshair";
    draw();
    animateFor(900);
  });

  canvas.addEventListener("pointerleave", () => {
    activeNode = -1;
    draw();
  });

  canvas.addEventListener("click", (event) => {
    const index = findNode(event);
    if (index >= 0) window.location.href = nodes[index].url;
  });

  new IntersectionObserver((entries) => {
    visible = entries[0]?.isIntersecting || false;
    if (visible) animateFor(2400);
    else if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }
  }, { threshold: 0.08 }).observe(canvas);

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && visible) animateFor(1200);
  });
  new ResizeObserver(resize).observe(canvas);
}

initializeGraph();
