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
const searchTitle = dialog?.querySelector("[data-search-title], .search-header label, .search-header h2");
const searchHint = dialog?.querySelector("[data-search-help], .search-hint");
const searchRetry = dialog?.querySelector("[data-search-retry]");

let searchIndex = null;
let searchIndexPromise = null;
let selectedResult = -1;
let searchRenderVersion = 0;
let searchOpener = null;

function ensureId(element, fallback) {
  if (!element) return "";
  if (!element.id) element.id = fallback;
  return element.id;
}

if (dialog) {
  const titleId = ensureId(searchTitle, "site-search-title");
  if (titleId && !dialog.hasAttribute("aria-label") && !dialog.hasAttribute("aria-labelledby")) {
    dialog.setAttribute("aria-labelledby", titleId);
  }
}

if (searchInput && searchResults) {
  const resultsId = ensureId(searchResults, "site-search-results");
  searchInput.setAttribute("role", "combobox");
  searchInput.setAttribute("aria-autocomplete", "list");
  searchInput.setAttribute("aria-controls", resultsId);
  searchInput.setAttribute("aria-expanded", "false");
  const hintId = ensureId(searchHint, "site-search-help");
  if (hintId && !searchInput.hasAttribute("aria-describedby")) searchInput.setAttribute("aria-describedby", hintId);
  searchResults.removeAttribute("aria-live");
}

if (searchCount) {
  searchCount.setAttribute("role", "status");
  searchCount.setAttribute("aria-live", "polite");
  searchCount.setAttribute("aria-atomic", "true");
}

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

function setSearchState(state, message = "") {
  if (dialog) dialog.dataset.searchState = state;
  const hasOptions = state === "results";
  if (searchInput) {
    searchInput.setAttribute("aria-expanded", String(hasOptions));
    if (!hasOptions) searchInput.removeAttribute("aria-activedescendant");
  }
  if (searchResults) {
    searchResults.setAttribute("aria-busy", String(state === "loading"));
    if (hasOptions) searchResults.setAttribute("role", "listbox");
    else searchResults.removeAttribute("role");
  }
  if (searchCount) searchCount.textContent = message;
}

function setActiveSearchResult(index, { scroll = true } = {}) {
  const results = [...(searchResults?.querySelectorAll("[role=option]") || [])];
  selectedResult = index >= 0 && index < results.length ? index : -1;
  results.forEach((result, resultIndex) => {
    const active = resultIndex === selectedResult;
    result.classList.toggle("active", active);
    result.setAttribute("aria-selected", String(active));
  });
  const active = results[selectedResult];
  if (active) {
    searchInput?.setAttribute("aria-activedescendant", active.id);
    if (scroll) active.scrollIntoView({ block: "nearest" });
  } else {
    searchInput?.removeAttribute("aria-activedescendant");
  }
}

function clearResults(message, state = "idle") {
  searchResults?.replaceChildren();
  if (searchResults) {
    searchResults.hidden = false;
    const paragraph = document.createElement("p");
    paragraph.className = "search-empty";
    paragraph.textContent = message;
    searchResults.append(paragraph);
  }
  setActiveSearchResult(-1);
  setSearchState(state, state === "loading" || state === "error" ? message : "");
}

function resultElement(item, index, terms) {
  const anchor = document.createElement("a");
  anchor.className = "search-result";
  anchor.href = item.url;
  anchor.dataset.resultIndex = String(index);
  anchor.id = `site-search-option-${index}`;
  anchor.setAttribute("role", "option");
  anchor.setAttribute("aria-selected", "false");
  anchor.tabIndex = -1;

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
  if (item.updated) time.dateTime = item.updated;
  anchor.append(meta, body, time);
  anchor.addEventListener("pointerenter", () => setActiveSearchResult(index, { scroll: false }));
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

  clearResults("검색 중입니다.", "loading");
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
      clearResults(`“${original}” 검색 결과가 없습니다.`, "empty");
      setSearchState("empty", "0개 결과");
      return;
    }

    searchResults.hidden = false;
    searchResults.replaceChildren(...results.map((item, index) => resultElement(item, index, terms)));
    setActiveSearchResult(-1);
    setSearchState("results", matches.length > results.length
      ? `${matches.length}개 중 ${results.length}개 표시`
      : `${matches.length}개 결과`);
  } catch (error) {
    if (renderVersion === searchRenderVersion) clearResults(error.message, "error");
  }
}

async function openSearch({ query = "", preserveFilters = false } = {}) {
  if (!dialog || dialog.open) return;
  if (menuButton?.getAttribute("aria-expanded") === "true") setMenu(false);
  searchOpener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  dialog.hidden = false;
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
  const results = [...searchResults.querySelectorAll("[role=option]")];

  if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key) && results.length) {
    event.preventDefault();
    searchResults.hidden = false;
    searchInput.setAttribute("aria-expanded", "true");
    let next = selectedResult;
    if (event.key === "ArrowDown") next = (selectedResult + 1 + results.length) % results.length;
    if (event.key === "ArrowUp") next = selectedResult < 0 ? results.length - 1 : (selectedResult - 1 + results.length) % results.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = results.length - 1;
    setActiveSearchResult(next);
  }

  if (event.key === "Enter" && selectedResult >= 0) {
    event.preventDefault();
    results[selectedResult].click();
  }

  if (event.key === "Escape") {
    event.preventDefault();
    if (searchInput.getAttribute("aria-expanded") === "true") {
      setActiveSearchResult(-1);
      searchResults.hidden = true;
      searchInput.setAttribute("aria-expanded", "false");
    } else if (dialog?.open) {
      dialog.close();
    }
  }
});

dialog?.addEventListener("close", () => {
  searchRenderVersion += 1;
  updateSearchUrl("");
  setActiveSearchResult(-1);
  setSearchState("closed");
  const opener = searchOpener;
  searchOpener = null;
  if (opener?.isConnected) queueMicrotask(() => opener.focus());
});

searchRetry?.addEventListener("click", () => {
  searchIndex = null;
  searchIndexPromise = null;
  renderSearch(searchInput?.value || "");
});

dialog?.querySelector("[data-close-search]")?.addEventListener("click", () => {
  dialog.close();
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

const mobileMenuDialog = mobileMenu?.matches?.("dialog")
  ? mobileMenu
  : mobileMenu?.closest?.("dialog") || document.querySelector("dialog[data-mobile-menu]");
const mobileMenuSurface = mobileMenuDialog || mobileMenu;
const menuInertTargets = [
  document.querySelector(".brand"),
  document.querySelector(".desktop-nav"),
  document.querySelector(".search-trigger"),
  document.querySelector("main"),
  document.querySelector("footer")
].filter(Boolean);
let restoreMenuFocusOnClose = false;

function syncMenuState(open, returnFocus = false) {
  if (!menuButton || !mobileMenuSurface) return;
  menuButton.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("menu-open", open);

  if (!mobileMenuDialog) {
    mobileMenuSurface.hidden = !open;
    menuInertTargets.forEach((element) => {
      element.inert = open;
    });
  }

  if (!open && returnFocus) menuButton.focus();
}

function setMenu(open, returnFocus = false) {
  if (!menuButton || !mobileMenuSurface) return;

  if (open) {
    if (dialog?.open) dialog.close();
    if (mobileMenuDialog) {
      mobileMenuDialog.hidden = false;
      if (!mobileMenuDialog.open) mobileMenuDialog.showModal();
    }
    syncMenuState(true);
    requestAnimationFrame(() => {
      const target = mobileMenuSurface.querySelector(
        'nav a[aria-current="page"], nav a, [data-close-menu], button'
      );
      target?.focus();
    });
    return;
  }

  if (mobileMenuDialog?.open) {
    restoreMenuFocusOnClose = returnFocus;
    mobileMenuDialog.close();
    return;
  }
  syncMenuState(false, returnFocus);
}

menuButton?.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});

mobileMenuSurface?.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-menu]")) {
    setMenu(false, true);
    return;
  }
  if (event.target.closest("a")) {
    if (mobileMenuDialog?.open) mobileMenuDialog.close("navigate");
    else setMenu(false);
  }
  if (mobileMenuDialog && event.target === mobileMenuDialog) setMenu(false, true);
});

document.addEventListener("pointerdown", (event) => {
  if (menuButton?.getAttribute("aria-expanded") !== "true") return;
  if (mobileMenuDialog) return;
  if (!mobileMenuSurface.contains(event.target) && !menuButton.contains(event.target)) setMenu(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton?.getAttribute("aria-expanded") === "true") {
    if (mobileMenuDialog) return;
    event.preventDefault();
    setMenu(false, true);
    return;
  }

  if (event.key === "Tab" && !mobileMenuDialog && menuButton?.getAttribute("aria-expanded") === "true") {
    const candidates = [menuButton, ...mobileMenuSurface.querySelectorAll("a[href], button:not([disabled])")]
      .filter((element) => !element.hidden && element.getClientRects().length);
    if (!candidates.length) return;
    const current = candidates.indexOf(document.activeElement);
    if (!event.shiftKey && current === candidates.length - 1) {
      event.preventDefault();
      candidates[0].focus();
    } else if (event.shiftKey && current <= 0) {
      event.preventDefault();
      candidates.at(-1).focus();
    }
  }
});

window.matchMedia("(min-width: 861px)").addEventListener("change", (event) => {
  if (event.matches) setMenu(false);
});

mobileMenuDialog?.addEventListener("close", () => {
  const shouldRestore = restoreMenuFocusOnClose || mobileMenuDialog.returnValue !== "navigate";
  restoreMenuFocusOnClose = false;
  syncMenuState(false, shouldRestore);
});

mobileMenuDialog?.addEventListener("cancel", () => {
  restoreMenuFocusOnClose = true;
});

if (mobileMenuDialog) {
  menuButton?.setAttribute("aria-haspopup", "dialog");
  syncMenuState(mobileMenuDialog.open);
}

function initializeArticleToc() {
  const toc = document.querySelector("[data-article-toc], .article-toc");
  if (!toc) return;
  const inlineSlot = document.querySelector("[data-toc-inline-slot]");
  const railSlot = document.querySelector("[data-toc-rail-slot]");
  const heading = toc.querySelector("h2");
  const tocNav = toc.matches("nav") ? toc : toc.querySelector("nav");
  const headingId = ensureId(heading, "article-toc-title");
  if (tocNav && headingId && !tocNav.hasAttribute("aria-labelledby")) {
    tocNav.setAttribute("aria-labelledby", headingId);
  }

  const links = [...toc.querySelectorAll('a[href^="#"]')]
    .map((link) => {
      const id = decodeURIComponent(link.hash.slice(1));
      const target = id ? document.getElementById(id) : null;
      if (!target) return null;
      target.tabIndex = -1;
      link.addEventListener("click", () => {
        window.setTimeout(() => target.focus({ preventScroll: true }), 0);
      });
      return { link, target };
    })
    .filter(Boolean);

  const tocMedia = window.matchMedia("(min-width: 1181px)");
  const placeToc = () => {
    const destination = tocMedia.matches ? railSlot : inlineSlot;
    if (destination && toc.parentElement !== destination) destination.append(toc);
  };
  placeToc();
  tocMedia.addEventListener("change", placeToc);

  if (!links.length) return;
  let ticking = false;
  const updateCurrent = () => {
    ticking = false;
    const top = document.querySelector(".topbar")?.getBoundingClientRect().height || 0;
    let current = links[0];
    links.forEach((record) => {
      if (record.target.getBoundingClientRect().top <= top + 24) current = record;
    });
    links.forEach((record) => {
      if (record === current) record.link.setAttribute("aria-current", "location");
      else record.link.removeAttribute("aria-current");
    });
  };
  const scheduleCurrent = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateCurrent);
  };
  window.addEventListener("scroll", scheduleCurrent, { passive: true });
  window.addEventListener("hashchange", scheduleCurrent);
  updateCurrent();
}

initializeArticleToc();

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
    const grid = listing.querySelector("[data-list-grid], .document-grid");
    const pagination = listing.querySelector("[data-list-pagination]");
    const reset = listing.querySelector("[data-list-reset]");
    const emptyReset = listing.querySelector("[data-list-empty-reset]");
    if (!queryInput || !domainSelect || !statusSelect || !sortSelect || !count || !empty || !grid) return;

    const staticCards = [...grid.querySelectorAll("[data-document-card]")];
    const staticCount = count.textContent;
    const domainLabels = new Map([...domainSelect.options]
      .filter((option) => option.value)
      .map((option) => [option.value, option.textContent.replace(/\s+\d+\s*$/u, "")]));
    const url = new URL(window.location.href);
    let listingDataPromise = null;
    let renderVersion = 0;

    queryInput.value = url.searchParams.get("filter") || "";
    domainSelect.value = url.searchParams.get("domain") || "";
    statusSelect.value = url.searchParams.get("status") || "";
    const requestedSort = url.searchParams.get("sort") || "score";
    sortSelect.value = ["score", "title", "updated"].includes(requestedSort) ? requestedSort : "score";

    function hasActiveControls() {
      return Boolean(
        queryInput.value.trim()
        || domainSelect.value
        || statusSelect.value
        || sortSelect.value !== "score"
      );
    }

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

    function restoreStaticPage() {
      staticCards.forEach((card) => {
        card.hidden = false;
      });
      grid.replaceChildren(...staticCards);
      grid.setAttribute("aria-busy", "false");
      count.textContent = staticCount;
      empty.hidden = true;
      if (pagination) {
        pagination.hidden = false;
        pagination.style.removeProperty("display");
      }
    }

    function listCard(item) {
      const card = document.createElement("article");
      card.className = "document-card";
      card.dataset.documentCard = "";
      card.dataset.title = item.title || "";
      card.dataset.summary = item.summary || "";
      card.dataset.status = item.status || "";
      card.dataset.domains = Array.isArray(item.domains) ? item.domains.join(",") : "";
      card.dataset.updated = item.updated || "";
      card.dataset.score = String(Number(item.connectionCount) || 0);
      card.dataset.connectionCount = String(Number(item.connectionCount) || 0);
      card.dataset.evidenceCount = String(Number(item.evidenceCount) || 0);

      const meta = document.createElement("div");
      meta.className = "card-meta";
      const category = document.createElement("span");
      category.textContent = item.category || "";
      const state = document.createElement("span");
      state.className = "status-label";
      if (item.status) state.classList.add(item.status);
      state.textContent = item.statusLabel || item.status || "";
      meta.append(category, state);

      const heading = document.createElement("h3");
      const link = document.createElement("a");
      try {
        const target = new URL(item.url, window.location.href);
        link.href = target.origin === window.location.origin
          ? `${target.pathname}${target.search}${target.hash}`
          : "#";
      } catch {
        link.href = "#";
      }
      link.textContent = item.title || "";
      heading.append(link);

      const summary = document.createElement("p");
      summary.textContent = item.summary || "";
      card.append(meta, heading, summary);

      const domains = Array.isArray(item.domains) ? item.domains.slice(0, 2) : [];
      if (domains.length) {
        const domainList = document.createElement("div");
        domainList.className = "card-domains";
        domains.forEach((domain) => {
          const tag = document.createElement("span");
          tag.textContent = domainLabels.get(domain) || domain.replace(/^domain\//u, "");
          domainList.append(tag);
        });
        card.append(domainList);
      }

      const foot = document.createElement("div");
      foot.className = "card-foot";
      const updated = document.createElement("time");
      updated.textContent = item.updated || "날짜 미기록";
      if (item.updated) updated.dateTime = item.updated;
      const connections = document.createElement("span");
      connections.textContent = `연결 ${Number(item.connectionCount) || 0}`;
      const evidence = document.createElement("span");
      evidence.textContent = `등록 근거 ${Number(item.evidenceCount) || 0}`;
      foot.append(updated, connections, evidence);
      card.append(foot);
      return card;
    }

    async function loadListingData() {
      if (listingDataPromise) return listingDataPromise;
      listingDataPromise = (async () => {
        if (!listing.dataset.listDataUrl) throw new Error("전체 목록 주소가 없습니다.");
        const dataUrl = new URL(listing.dataset.listDataUrl, window.location.href);
        if (dataUrl.origin !== window.location.origin) throw new Error("전체 목록 주소가 안전하지 않습니다.");
        const response = await fetch(dataUrl, { headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error(`전체 목록 응답 ${response.status}`);
        const payload = await response.json();
        if (!Array.isArray(payload?.items)) throw new Error("전체 목록 형식이 올바르지 않습니다.");
        return payload;
      })().catch((error) => {
        listingDataPromise = null;
        throw error;
      });
      return listingDataPromise;
    }

    function matchingItems(items) {
      const term = normalize(queryInput.value.trim());
      const domain = domainSelect.value;
      const status = statusSelect.value;
      const sort = sortSelect.value;
      return items
        .filter((item) => {
          const matchesQuery = !term || normalize(`${item.title || ""} ${item.summary || ""}`).includes(term);
          const matchesDomain = !domain || (item.domains || []).includes(domain);
          const matchesStatus = !status || item.status === status;
          return matchesQuery && matchesDomain && matchesStatus;
        })
        .sort((left, right) => {
          if (sort === "title") return String(left.title).localeCompare(String(right.title), "ko");
          if (sort === "updated") {
            return String(right.updated || "").localeCompare(String(left.updated || ""))
              || String(left.title).localeCompare(String(right.title), "ko");
          }
          return (Number(right.connectionCount) || 0) - (Number(left.connectionCount) || 0)
            || String(left.title).localeCompare(String(right.title), "ko");
        });
    }

    async function applyFilters() {
      const version = ++renderVersion;
      const active = hasActiveControls();
      updateUrl();
      if (reset) reset.hidden = !active;
      if (!active) {
        restoreStaticPage();
        return;
      }

      if (pagination) {
        pagination.hidden = true;
        pagination.style.display = "none";
      }
      empty.hidden = true;
      grid.setAttribute("aria-busy", "true");
      count.textContent = "전체 목록을 불러오는 중입니다.";
      try {
        const payload = await loadListingData();
        if (version !== renderVersion || !hasActiveControls()) return;
        const visible = matchingItems(payload.items);
        grid.replaceChildren(...visible.map(listCard));
        grid.setAttribute("aria-busy", "false");
        count.textContent = `${Number(payload.total) || payload.items.length}개 중 ${visible.length}개 표시`;
        empty.hidden = visible.length > 0;
      } catch {
        if (version !== renderVersion || !hasActiveControls()) return;
        const visible = matchingItems(staticCards.map((card) => ({
          title: card.dataset.title,
          summary: card.dataset.summary,
          status: card.dataset.status,
          domains: card.dataset.domains.split(",").filter(Boolean),
          updated: card.dataset.updated,
          connectionCount: Number(card.dataset.connectionCount || card.dataset.score),
          card
        })));
        grid.replaceChildren(...visible.map((item) => item.card));
        grid.setAttribute("aria-busy", "false");
        count.textContent = `전체 목록을 불러오지 못해 현재 쪽 ${visible.length}개만 표시`;
        empty.hidden = visible.length > 0;
      }
    }

    listing.querySelector("[data-list-controls]")?.addEventListener("submit", (event) => event.preventDefault());
    queryInput.addEventListener("input", () => void applyFilters());
    domainSelect.addEventListener("change", () => void applyFilters());
    statusSelect.addEventListener("change", () => void applyFilters());
    sortSelect.addEventListener("change", () => void applyFilters());
    const resetFilters = () => {
      queryInput.value = "";
      domainSelect.value = "";
      statusSelect.value = "";
      sortSelect.value = "score";
      void applyFilters();
      queryInput.focus();
    };
    reset?.addEventListener("click", resetFilters);
    emptyReset?.addEventListener("click", resetFilters);
    void applyFilters();
  });
}

initializeListings();
