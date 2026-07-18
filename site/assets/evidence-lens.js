const stateModuleUrl = new URL("./evidence-state.js", import.meta.url);
stateModuleUrl.searchParams.set("v", globalThis.window?.CS_WIKI_ASSET_VERSION || "1");
const {
  createEvidenceLruCache,
  evidenceLookupHash,
  evidenceManifestAssetUrl,
  evidencePrefixBucket,
  evidenceResultKeyboardIndex,
  evidenceUrlFor,
  normalizeEvidenceLookupValue,
  normalizeEvidencePayloadVersion
} = await import(stateModuleUrl);

const SEARCH_DELAY = 160;
const PAYLOAD_CACHE_SIZE = 8;
const MAX_SEARCH_PAGES = 256;

function normalizedSearchText(value = "") {
  return normalizeEvidenceLookupValue(value)
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function codePointLength(value = "") {
  return [...normalizedSearchText(value)].length;
}

function escapeHtml(value = "") {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function evidenceEntryLensType(entry = {}) {
  if (entry.type === "evidence" || entry.type === "source") return "source";
  if (entry.type === "relation") return "relation";
  return "document";
}

export function matchesEvidenceSearchEntry(entry = {}, query = "", scope = "all") {
  const needle = normalizedSearchText(query);
  if ([...needle].length < 2) return false;
  const type = evidenceEntryLensType(entry);
  if (scope && scope !== "all" && scope !== type) return false;
  return [entry.title, ...(Array.isArray(entry.aliases) ? entry.aliases : [])]
    .some((value) => normalizedSearchText(value).startsWith(needle));
}

export function evidenceSearchEntryUrl(entry = {}, rootUrl = "/map/evidence/") {
  const type = evidenceEntryLensType(entry);
  const id = type === "relation" ? entry.shardId || entry.routeId : entry.recordId || entry.id;
  if (!id) return "";
  return evidenceUrlFor(rootUrl, { mode: type, id, page: 1 }, { rootPath: rootUrl });
}

function compareEntries(left, right, query) {
  const needle = normalizedSearchText(query);
  const leftTitle = normalizedSearchText(left.title);
  const rightTitle = normalizedSearchText(right.title);
  const leftExact = leftTitle === needle ? 0 : leftTitle.startsWith(needle) ? 1 : 2;
  const rightExact = rightTitle === needle ? 0 : rightTitle.startsWith(needle) ? 1 : 2;
  return leftExact - rightExact
    || String(left.title || "").localeCompare(String(right.title || ""), "ko")
    || String(left.key || left.id || "").localeCompare(String(right.key || right.id || ""), "ko");
}

function evidenceOptionId(entry, index) {
  const key = `${entry.type || "document"}:${entry.key || entry.recordId || entry.id || index}`;
  const hash = evidenceLookupHash(key);
  return `evidence-search-option-${(hash ?? index).toString(16)}-${index}`;
}

function resultLabel(entry = {}) {
  if (entry.type === "relation") return "검토 관계";
  if (entry.type === "evidence") return entry.category === "sources" ? "정규 소스" : "참고 자료";
  const labels = { analyses: "분석", concepts: "개념", entities: "인물", meta: "메타" };
  return labels[entry.category] || "지식 문서";
}

export function createEvidenceLens(root, environment = {}) {
  if (!root) return null;
  const windowObject = environment.window || globalThis.window;
  const fetchImpl = environment.fetch || globalThis.fetch;
  const controls = root.querySelector("[data-evidence-controls]");
  const input = root.querySelector("[data-evidence-search]");
  const results = root.querySelector("[data-evidence-search-results]");
  const scope = root.querySelector("[data-evidence-scope]");
  const preservation = root.querySelector("[data-evidence-preservation]");
  const reset = root.querySelector("[data-evidence-reset]");
  const status = root.querySelector("[data-evidence-status]");
  const errorPanel = root.querySelector("[data-evidence-error]");
  const retry = root.querySelector("[data-evidence-retry]");
  if (!windowObject || !fetchImpl || !controls || !input || !results) return null;

  const manifestUrl = new URL(root.dataset.evidenceManifestUrl, windowObject.location.href).href;
  const rootUrl = new URL(root.dataset.evidenceRootUrl || "/map/evidence/", windowObject.location.href).href;
  const cache = createEvidenceLruCache(PAYLOAD_CACHE_SIZE);
  const originalStatus = status?.textContent || "";
  let manifest = null;
  let activeIndex = -1;
  let visibleEntries = [];
  let timer = 0;
  let requestSerial = 0;
  let activeController = null;
  let composing = false;

  controls.hidden = false;

  function showError(message = "검색 조각을 불러오지 못했습니다.") {
    if (errorPanel) {
      errorPanel.hidden = false;
      const paragraph = errorPanel.querySelector("p");
      if (paragraph) paragraph.textContent = `${message} 현재 계보와 정적 링크는 계속 사용할 수 있습니다.`;
    }
    results.removeAttribute("aria-busy");
  }

  function clearError() {
    if (errorPanel) errorPanel.hidden = true;
  }

  async function loadManifest({ force = false } = {}) {
    if (manifest && !force) return manifest;
    const response = await fetchImpl(manifestUrl, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`근거 계보 목록 응답 ${response.status}`);
    const payload = await response.json();
    if (!payload?.schemaVersion || !payload?.contentVersion || !payload?.search) throw new Error("근거 계보 manifest가 올바르지 않습니다.");
    manifest = payload;
    return manifest;
  }

  async function loadPayload(url, signal) {
    const cached = cache.get(url);
    if (cached) return cached;
    const response = await fetchImpl(url, { signal, headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`근거 검색 조각 응답 ${response.status}`);
    const payload = await response.json();
    normalizeEvidencePayloadVersion(manifest, payload);
    cache.set(url, payload);
    return payload;
  }

  function setActive(index, { scroll = true } = {}) {
    const options = [...results.querySelectorAll('[role="option"]')];
    activeIndex = index >= 0 && index < options.length ? index : -1;
    options.forEach((option, optionIndex) => option.setAttribute("aria-selected", optionIndex === activeIndex ? "true" : "false"));
    const active = options[activeIndex];
    if (active) {
      input.setAttribute("aria-activedescendant", active.id);
      if (scroll) active.scrollIntoView({ block: "nearest" });
    } else {
      input.removeAttribute("aria-activedescendant");
    }
  }

  function closeResults({ clear = false } = {}) {
    if (clear) input.value = "";
    visibleEntries = [];
    activeIndex = -1;
    results.replaceChildren();
    results.removeAttribute("aria-busy");
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
  }

  function renderResults(entries, query) {
    visibleEntries = entries.filter((entry) => evidenceSearchEntryUrl(entry, rootUrl));
    activeIndex = -1;
    if (!visibleEntries.length) {
      results.innerHTML = `<p>${escapeHtml(query)}로 시작하는 ${scope?.value && scope.value !== "all" ? "선택 범위의 " : ""}문서가 없습니다.</p>`;
      input.setAttribute("aria-expanded", "true");
      return;
    }
    results.innerHTML = visibleEntries.map((entry, index) => {
      const id = evidenceOptionId(entry, index);
      const href = evidenceSearchEntryUrl(entry, rootUrl);
      return `<a id="${id}" role="option" aria-selected="false" href="${escapeHtml(href)}"><strong>${escapeHtml(entry.title)}</strong><small>${escapeHtml(resultLabel(entry))}</small></a>`;
    }).join("");
    input.setAttribute("aria-expanded", "true");
    [...results.querySelectorAll('[role="option"]')].forEach((option, index) => {
      option.addEventListener("pointerenter", () => setActive(index, { scroll: false }));
      option.addEventListener("focus", () => setActive(index, { scroll: false }));
    });
  }

  async function search() {
    const query = input.value;
    if (codePointLength(query) < 2) {
      closeResults();
      return;
    }
    const serial = ++requestSerial;
    activeController?.abort();
    activeController = new AbortController();
    results.setAttribute("aria-busy", "true");
    clearError();
    try {
      const currentManifest = await loadManifest();
      if (serial !== requestSerial) return;
      const descriptor = currentManifest.search;
      const address = evidencePrefixBucket(query, descriptor.bucketCount, undefined, descriptor.maxBuckets);
      if (!address) {
        closeResults();
        return;
      }
      const limit = Math.max(1, Math.min(Number(descriptor.resultLimit) || 24, 48));
      const matches = new Map();
      let page = 1;
      let pageCount = 1;
      while (page <= pageCount && page <= MAX_SEARCH_PAGES && matches.size < limit) {
        const url = evidenceManifestAssetUrl(currentManifest, descriptor, {
          level: address.level,
          bucket: address.bucket,
          page
        }, { manifestUrl });
        if (!url) throw new Error("안전하지 않은 검색 조각 주소입니다.");
        const payload = await loadPayload(url, activeController.signal);
        if (serial !== requestSerial) return;
        pageCount = Math.max(1, Math.min(Number(payload.pageCount) || 1, MAX_SEARCH_PAGES));
        const entries = Array.isArray(payload.entries) ? payload.entries : [];
        for (const entry of entries) {
          if (entry.prefix !== address.key || !matchesEvidenceSearchEntry(entry, query, scope?.value || "all")) continue;
          matches.set(entry.key || `${entry.type}:${entry.recordId}`, entry);
          if (matches.size >= limit) break;
        }
        const prefixes = entries.map((entry) => String(entry.prefix || ""));
        if (prefixes.length && prefixes.every((prefix) => prefix > address.key)) break;
        page += 1;
      }
      if (serial !== requestSerial) return;
      results.removeAttribute("aria-busy");
      renderResults([...matches.values()].sort((left, right) => compareEntries(left, right, query)), query);
      if (status) status.textContent = `${matches.size}개 검색 결과${pageCount > MAX_SEARCH_PAGES ? " · 더 구체적인 제목을 입력하세요" : ""}`;
    } catch (error) {
      if (error?.name === "AbortError") return;
      showError(error?.message || "검색 조각을 불러오지 못했습니다.");
    }
  }

  function scheduleSearch() {
    windowObject.clearTimeout(timer);
    timer = windowObject.setTimeout(search, SEARCH_DELAY);
  }

  function applyPreservationFilter() {
    const selected = preservation?.value || "";
    const cards = [...root.querySelectorAll("[data-evidence-card]")];
    cards.forEach((card) => card.classList.toggle("is-filtered", Boolean(selected && card.dataset.snapshotStatus !== selected)));
    const sourceCards = [...root.querySelectorAll(".evidence-source-rail [data-evidence-card]")];
    const visible = sourceCards.filter((card) => !card.classList.contains("is-filtered")).length;
    if (status) status.textContent = selected ? `현재 조각의 근거 문서 ${visible}개 · ${preservation.selectedOptions[0]?.textContent || selected}` : originalStatus;
  }

  input.addEventListener("compositionstart", () => { composing = true; });
  input.addEventListener("compositionend", () => { composing = false; scheduleSearch(); });
  input.addEventListener("input", () => { if (!composing) scheduleSearch(); });
  input.addEventListener("keydown", (event) => {
    const count = visibleEntries.length;
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key) && count) {
      event.preventDefault();
      setActive(evidenceResultKeyboardIndex(count, activeIndex, event.key, { wrap: true }));
      return;
    }
    if (event.key === "Enter" && activeIndex >= 0) {
      const active = results.querySelectorAll('[role="option"]')[activeIndex];
      if (active?.href) {
        event.preventDefault();
        windowObject.location.assign(active.href);
      }
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closeResults({ clear: true });
      if (status) status.textContent = originalStatus;
    }
  });
  scope?.addEventListener("change", () => { if (codePointLength(input.value) >= 2) scheduleSearch(); });
  preservation?.addEventListener("change", applyPreservationFilter);
  reset?.addEventListener("click", () => {
    if (scope) scope.value = "all";
    if (preservation) preservation.value = "";
    closeResults({ clear: true });
    applyPreservationFilter();
    input.focus();
  });
  retry?.addEventListener("click", async () => {
    clearError();
    manifest = null;
    cache.clear();
    try {
      await loadManifest({ force: true });
      if (codePointLength(input.value) >= 2) await search();
    } catch (error) {
      showError(error?.message);
    }
  });

  loadManifest().catch((error) => showError(error?.message));

  return {
    search,
    reset() {
      reset?.click();
    },
    cache,
    get manifest() {
      return manifest;
    }
  };
}

if (globalThis.document) {
  for (const root of document.querySelectorAll("[data-evidence-lens]")) createEvidenceLens(root);
}
