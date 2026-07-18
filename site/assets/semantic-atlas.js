const FILTER_KEYS = Object.freeze(["domain", "category", "status", "historical", "capability"]);
const TARGET_KEYS = Object.freeze(["focus", "cluster", "corridor"]);

function values(value) {
  return Array.isArray(value) ? value : value === undefined || value === null ? [] : [value];
}

function recordUrl(record) {
  if (typeof record === "string") return record;
  if (!record || typeof record !== "object") return "";
  return record.url || record.href || record.path || record.shardUrl || record.payloadUrl || record.file || "";
}

function collectionRecord(collection, id) {
  if (!collection) return null;
  if (collection instanceof Map) return collection.get(id) || null;
  if (Array.isArray(collection)) return collection.find((item) => item?.id === id || item?.key === id || item?.slug === id) || null;
  return collection[id] || null;
}

/** Resolve one lazily loaded atlas asset without depending on one manifest serialization. */
export function atlasManifestAsset(manifest = {}, kind, id = "") {
  const singular = String(kind || "").replace(/s$/, "");
  const plural = `${singular}s`;
  if (["overview", "lookup"].includes(singular)) {
    const candidate = manifest[`${singular}Url`]
      || manifest[singular]
      || manifest.routes?.[singular]
      || manifest.urls?.[singular]
      || manifest.payloads?.[singular]
      || manifest.shards?.[singular];
    return recordUrl(candidate);
  }
  const collections = [
    manifest[plural],
    manifest[`${singular}Shards`],
    singular === "focus" ? manifest.documentShards : null,
    manifest.urls?.[plural],
    manifest.payloads?.[plural],
    manifest.shards?.[plural]
  ];
  for (const collection of collections) {
    const record = collectionRecord(collection, id);
    const direct = recordUrl(record);
    if (direct) return direct;
    const shardKey = record?.shard || record?.shardId;
    if (shardKey) {
      const indirect = recordUrl(collectionRecord(manifest.shards?.files || manifest.payloads?.files, shardKey));
      if (indirect) return indirect;
    }
  }
  const route = manifest.routes?.[singular] || manifest.routes?.[plural];
  if (typeof route === "string" && id) {
    return route.replace(/\{(?:id|cluster|corridor|bucket)\}/g, encodeURIComponent(id));
  }
  return "";
}

/** Accept builder payload wrappers while exposing one renderer/worker view shape. */
export function normalizeSemanticAtlasView(payload = {}) {
  payload = payload && typeof payload === "object" ? payload : {};
  const source = payload.view || payload.layout || payload.overview || payload.cluster || payload.corridor || payload.focus || payload;
  const clusterSource = source.nodes?.items || source.nodes || source.clusters || source.documents;
  const clusters = Boolean(source.clusters && !source.nodes);
  const nodes = values(clusterSource).filter(Boolean).map((node) => {
    const facets = node.facets || {};
    const normalized = { ...node, kind: node.kind || (clusters ? "cluster" : "document") };
    for (const key of ["categories", "statuses", "domains", "historicalLayers", "capabilityLayers"]) {
      const value = node[key] || facets[key];
      if (value !== undefined) normalized[key] = value;
    }
    if (node.radius !== undefined || node.r !== undefined) normalized.radius = node.radius ?? node.r;
    if (node.count !== undefined || node.nodeCount !== undefined) normalized.count = node.count ?? node.nodeCount;
    return normalized;
  });
  const edges = values(source.edges?.items || source.edges || source.corridors || source.relations).filter(Boolean).map((edge) => {
    const normalized = { ...edge };
    const corridorId = edge.corridorId || edge.shard || (clusters ? edge.id : "");
    if (corridorId) normalized.corridorId = corridorId;
    return normalized;
  });
  const labels = values(source.labels).map((item) => typeof item === "string" ? item : item?.id).filter(Boolean);
  return { ...source, nodes, edges, labels };
}

export function atlasFiltersFromState(state = {}) {
  return Object.fromEntries(FILTER_KEYS.map((key) => [key, String(state[key] || state.filters?.[key] || "")]).filter(([, value]) => value));
}

/** Describe what a Canvas/list activation means before performing navigation. */
export function atlasActivation(item, mode = "overview") {
  if (!item?.id) return { action: "none", id: "" };
  if (item.kind === "edge") {
    if (mode === "overview" || item.corridorId) return { action: "corridor", id: item.corridorId || item.id };
    return { action: "inspect-edge", id: item.id };
  }
  if (item.kind === "cluster") return { action: "cluster", id: item.clusterId || item.id };
  return { action: "focus", id: item.documentId || item.id };
}

export function atlasSearchResultIndex(current, key, length) {
  const count = Math.max(0, Math.floor(Number(length) || 0));
  if (!count) return -1;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  if (key === "ArrowDown") return current < 0 ? 0 : (current + 1) % count;
  if (key === "ArrowUp") return current < 0 ? count - 1 : (current - 1 + count) % count;
  return current;
}

export function createAtlasRequestGate() {
  let token = 0;
  let controller = null;
  return {
    begin() {
      token += 1;
      const requestToken = token;
      controller?.abort();
      controller = typeof AbortController === "function" ? new AbortController() : null;
      return { token: requestToken, signal: controller?.signal, current: () => requestToken === token };
    },
    isCurrent(requestToken) { return requestToken === token; },
    cancel() { token += 1; controller?.abort(); controller = null; },
    get token() { return token; }
  };
}

function safeAssetUrl(value, base) {
  if (!value) return "";
  const url = new URL(value, base);
  if (url.origin !== new URL(base).origin) throw new Error("Atlas shard must use the site origin");
  return url.href;
}

export function atlasVersionedAssetUrl(value, base, version = "") {
  const url = new URL(safeAssetUrl(value, base));
  if (version) url.searchParams.set("v", String(version));
  return url.href;
}

function safePageHref(value) {
  try {
    const url = new URL(value, window.location.origin);
    if (url.origin === window.location.origin) return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    // Invalid content URLs remain inert.
  }
  return "#";
}

function element(tag, className = "", text = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function query(root, ...selectors) {
  for (const selector of selectors) {
    const found = root.querySelector(selector);
    if (found) return found;
  }
  return null;
}

function lookupById(lookup, id) {
  const entries = values(lookup?.entries || lookup?.nodes || lookup?.documents || lookup);
  return entries.find((entry) => entry?.id === id) || null;
}

function focusAsset(manifest, lookupRecord, id) {
  const direct = recordUrl(lookupRecord?.focus || lookupRecord?.shardUrl || lookupRecord?.payloadUrl);
  if (direct) return direct;
  const shardId = lookupRecord?.shardId || lookupRecord?.focusShard || lookupRecord?.shard || lookupRecord?.bucket || lookupRecord?.focusBucket;
  if (typeof shardId === "string" && (shardId.includes("/") || shardId.endsWith(".json"))) return shardId;
  return atlasManifestAsset(manifest, "focus", shardId || id);
}

function focusRecord(payload, id) {
  const record = collectionRecord(payload?.records, id)
    || collectionRecord(payload?.focus, id)
    || collectionRecord(payload?.documents, id)
    || collectionRecord(payload?.focuses, id)
    || values(payload?.entries).find((entry) => entry?.id === id)
    || collectionRecord(payload?.nodesByFocus, id)
    || payload;
  if (Array.isArray(record?.nodes)) return record;
  const focus = record?.node || (record?.focus?.id ? record.focus : null) || record?.document;
  const neighbours = values(record?.neighbors || record?.neighbours || record?.stubs);
  return focus ? { ...record, nodes: [focus, ...neighbours], edges: values(record.edges || record.relations) } : record;
}

export async function initializeSemanticAtlas(root, dependencies = {}) {
  if (!root || root.dataset.atlasEnhanced === "true") return null;
  const manifestSource = root.dataset.atlasManifestUrl || root.dataset.manifestUrl || root.dataset.semanticAtlasManifestUrl;
  if (!manifestSource) return null;

  const version = globalThis.window?.CS_WIKI_ASSET_VERSION || "1";
  const importVersioned = async (name) => {
    const url = new URL(name, import.meta.url);
    url.searchParams.set("v", version);
    return import(url);
  };
  const [rendererModule, stateModule, workerModule] = await Promise.all([
    dependencies.renderer ? Promise.resolve(dependencies.renderer) : importVersioned("./atlas-renderer.js"),
    dependencies.state ? Promise.resolve(dependencies.state) : importVersioned("./atlas-state.js"),
    dependencies.worker ? Promise.resolve(dependencies.worker) : importVersioned("./atlas-worker.js")
  ]);
  const {
    atlasHistoryEntry,
    atlasPageUrlFor,
    atlasStateFromHistory,
    createDocumentFocusView,
    createLruCache,
    describeAtlasEdge,
    normalizeAtlasPayloadVersion,
    parseAtlasPageUrl
  } = stateModule;
  const { searchAtlasLookup, selectVisibleAtlasView } = workerModule;
  const fetchImpl = dependencies.fetch || globalThis.fetch?.bind(globalThis);
  if (!fetchImpl) return null;

  const canvas = query(root, "[data-atlas-canvas]", "canvas[data-semantic-atlas-canvas]");
  const status = query(root, "[data-atlas-status]", "[role=status]");
  const search = query(root, "input[data-atlas-search]", "[data-atlas-search] input", "input[type=search]");
  const searchResults = query(root, "[data-atlas-search-results]", "[data-atlas-results]");
  const nodeList = query(root, "[data-atlas-node-list]", "[data-atlas-list]");
  const edgeList = query(root, "[data-atlas-edge-list]", "[data-atlas-relation-list]");
  const corridorList = query(root, "[data-atlas-corridor-list]");
  const inspector = query(root, "[data-atlas-inspector]");
  const stageTitle = query(root, "#atlas-stage-title", "[data-atlas-stage-title]");
  const stageKicker = query(root, "[data-atlas-stage-kicker]");
  const nodeHeading = query(root, "[data-atlas-node-heading]");
  const nodeSummary = query(root, "[data-atlas-node-summary]");
  const edgeHeading = query(root, "[data-atlas-edge-heading]");
  const edgeSummary = query(root, "[data-atlas-edge-summary]");
  const breadcrumb = query(root, "[data-atlas-breadcrumb]");
  const retryButton = query(root, "[data-atlas-retry]");
  const controls = query(root, "[data-atlas-controls]");
  const errorPanel = query(root, "[data-atlas-error]");
  const overviewButton = query(root, "[data-atlas-overview]", "[data-atlas-reset-view]");
  const resetCameraButton = query(root, "[data-atlas-reset-camera]");
  const zoomInButton = query(root, "[data-atlas-zoom-in]");
  const zoomOutButton = query(root, "[data-atlas-zoom-out]");
  const filterControls = new Map(FILTER_KEYS.map((key) => [key, query(root, `[data-atlas-filter="${key}"]`, `[name="${key}"]`)]).filter(([, control]) => control));
  const manifestUrl = safeAssetUrl(manifestSource, window.location.href);
  const cache = createLruCache(7);
  const navigationGate = createAtlasRequestGate();
  const searchGate = createAtlasRequestGate();
  const pendingWorker = new Map();
  let worker = null;
  let workerRequestId = 0;
  let manifest = null;
  let lookup = null;
  let overviewPayload = null;
  let state = null;
  let activePayload = null;
  let activeView = { nodes: [], edges: [], labels: [] };
  let activeSearchResults = [];
  let activeSearchIndex = -1;
  let composing = false;
  let searchTimer = 0;
  let retryAction = null;
  let renderer = null;
  let renderRequestId = 0;

  const announce = (message) => { if (status) status.textContent = message; };
  const setBusy = (busy) => root.setAttribute("aria-busy", String(Boolean(busy)));

  async function fetchJson(url, { signal, versioned = true } = {}) {
    const absolute = versioned
      ? atlasVersionedAssetUrl(url, manifestUrl, manifest?.contentVersion || version)
      : safeAssetUrl(url, manifestUrl);
    const cached = cache.get(absolute);
    if (cached) return cached;
    const response = await fetchImpl(absolute, { signal, cache: "force-cache", headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Atlas request failed: ${response.status}`);
    const payload = await response.json();
    if (versioned) normalizeAtlasPayloadVersion(manifest, payload);
    cache.set(absolute, payload);
    return payload;
  }

  function filters() {
    return atlasFiltersFromState(state || {});
  }

  function ensureWorker() {
    if (worker || !("Worker" in window)) return worker;
    const workerUrl = new URL("./atlas-worker.js", import.meta.url);
    workerUrl.searchParams.set("v", version);
    try {
      worker = new Worker(workerUrl, { type: "module" });
      worker.addEventListener("message", (event) => {
        const message = event.data || {};
        const pending = pendingWorker.get(message.requestId);
        if (!pending) return;
        pendingWorker.delete(message.requestId);
        window.clearTimeout(pending.timeout);
        if (message.type === "error") pending.reject(new Error(message.message || "Atlas worker failed"));
        else pending.resolve(message.result ?? message.results ?? message);
      });
      worker.addEventListener("error", () => {
        pendingWorker.forEach(({ reject, timeout }) => {
          window.clearTimeout(timeout);
          reject(new Error("Atlas worker crashed"));
        });
        pendingWorker.clear();
        worker?.terminate();
        worker = null;
      });
    } catch {
      worker = null;
    }
    return worker;
  }

  function workerCall(type, payload, fallback, timeoutMs = 3000) {
    const target = ensureWorker();
    if (!target) return Promise.resolve().then(fallback);
    const requestId = ++workerRequestId;
    return new Promise((resolve) => {
      let settled = false;
      const finishFallback = async () => {
        if (settled) return;
        settled = true;
        pendingWorker.delete(requestId);
        try { resolve(await fallback()); } catch { resolve(type === "search" ? [] : { nodes: [], edges: [], labels: [], stats: {} }); }
      };
      const timeout = window.setTimeout(finishFallback, timeoutMs);
      pendingWorker.set(requestId, {
        timeout,
        resolve(value) { if (!settled) { settled = true; resolve(value); } },
        reject() { finishFallback(); }
      });
      try { target.postMessage({ type, requestId, ...payload }); } catch { finishFallback(); }
    });
  }

  async function ensureLookup(signal) {
    if (lookup) return lookup;
    const url = atlasManifestAsset(manifest, "lookup");
    if (!url) throw new Error("Atlas lookup shard is missing");
    lookup = await fetchJson(url, { signal });
    const target = ensureWorker();
    if (target) {
      try {
        target.postMessage({
          type: "init-lookup",
          requestId: ++workerRequestId,
          entries: values(lookup.entries || lookup.nodes || lookup.documents)
        });
      } catch {
        // Search falls back to the imported synchronous implementation.
      }
    }
    return lookup;
  }

  function syncControls() {
    if (search && search.value !== (state.q || "")) search.value = state.q || "";
    filterControls.forEach((control, key) => {
      const value = state[key] || "";
      if (control.value !== value) control.value = value;
    });
  }

  function pageLocationOptions() {
    return {
      rootPath: root.dataset.atlasRootUrl || "/map/atlas/",
      defaultCluster: root.dataset.defaultCluster || "",
      defaultClusterPath: root.dataset.defaultClusterPath || ""
    };
  }

  function syncUrl(method = "replaceState") {
    const nextUrl = atlasPageUrlFor(window.location.href, state, pageLocationOptions());
    window.history[method](atlasHistoryEntry(state), "", nextUrl);
  }

  function listHeading(title, count) {
    const heading = element("p", "atlas-list-heading", `${title} · ${count}`);
    heading.setAttribute("aria-hidden", "true");
    return heading;
  }

  function nodeItem(node) {
    const item = element("li");
    const action = atlasActivation(node, state.mode);
    const button = element("button", "atlas-list-action");
    button.type = "button";
    button.dataset.atlasAction = action.action;
    button.dataset.atlasId = action.id;
    button.append(element("strong", "", node.title || node.label || node.id));
    const countLabel = node.count
      ? node.kind === "cluster" ? `${node.count}개 문서` : `연결 ${node.count}`
      : "";
    const detail = [node.category, node.status, countLabel].filter(Boolean).join(" · ");
    if (detail) button.append(element("small", "", detail));
    item.append(button);
    if (node.url && action.action === "focus") {
      const link = element("a", "atlas-document-link", "문서 읽기");
      link.href = safePageHref(node.url);
      item.append(link);
    }
    return item;
  }

  function edgeItem(edge) {
    const item = element("li");
    const source = activeView.nodes.find((node) => node.id === edge.source);
    const target = activeView.nodes.find((node) => node.id === edge.target);
    const button = element("button", "atlas-list-action");
    button.type = "button";
    const action = atlasActivation({ ...edge, kind: "edge" }, state.mode);
    button.dataset.atlasAction = action.action;
    button.dataset.atlasId = action.id;
    button.dataset.atlasEdgeId = edge.id;
    button.append(
      element("strong", "", `${source?.title || edge.source} ↔ ${target?.title || edge.target}`),
      element("small", "", edge.label || edge.dominantFamily || edge.kind || "관계")
    );
    item.append(button);
    return item;
  }

  function renderList(container, title, records, factory) {
    if (!container) return;
    const list = element("ol");
    list.className = "atlas-item-list";
    list.replaceChildren(...records.map(factory));
    container.replaceChildren(listHeading(title, records.length), list);
  }

  function renderAccessibleLists(view) {
    const nodeTitle = state.mode === "overview"
      ? "지식 군집"
      : state.mode === "cluster" ? "군집 문서와 경계 맥락"
        : state.mode === "corridor" ? "회랑 양끝 문서" : "초점 주변 문서";
    const relationTitle = state.mode === "overview"
      ? "군집 회랑"
      : state.mode === "cluster" ? "군집 내부·경계 관계"
        : state.mode === "corridor" ? "회랑의 실제 관계" : "초점 주변 관계";
    renderList(nodeList, nodeTitle, view.nodes, nodeItem);
    renderList(edgeList || corridorList, relationTitle, view.edges, edgeItem);
    if (nodeHeading) nodeHeading.textContent = nodeTitle;
    if (nodeSummary) nodeSummary.textContent = `${view.nodes.length}개 항목을 지도와 같은 순서로 표시`;
    if (edgeHeading) edgeHeading.textContent = relationTitle;
    if (edgeSummary) edgeSummary.textContent = `${view.edges.length}개 관계를 지도와 함께 표시`;
  }

  function inspectEdge(edge) {
    if (!edge || !inspector) return;
    const nodes = new Map(activeView.nodes.map((node) => [node.id, node]));
    const description = describeAtlasEdge(edge, nodes, manifest.legend || activePayload?.legend || {});
    const heading = element("h2", "", `${description.sourceTitle} ↔ ${description.targetTitle}`);
    heading.id = "atlas-inspector-title";
    inspector.replaceChildren(
      element("p", "atlas-inspector-kicker", description.label),
      heading,
      element("p", "", description.statement),
      element("p", "", description.detail)
    );
  }

  function renderContext() {
    const focus = state.focus ? activeView.nodes.find((node) => node.id === state.focus) : null;
    const title = state.mode === "overview"
      ? "전체 지식 군집"
      : focus?.title || focus?.label || activePayload?.title || activePayload?.label || activePayload?.id
        || (state.mode === "cluster" ? state.cluster : state.mode === "corridor" ? state.corridor : state.focus);
    if (stageTitle) stageTitle.textContent = title;
    if (stageKicker) stageKicker.textContent = ({
      overview: "ATLAS OVERVIEW",
      cluster: "CLUSTER VIEW",
      corridor: "CORRIDOR VIEW",
      focus: "DOCUMENT FOCUS"
    })[state.mode] || "SEMANTIC ATLAS";
    if (breadcrumb) {
      const home = element("a", "", "전체 지도");
      home.href = atlasPageUrlFor(
        window.location.href,
        { ...state, mode: "overview", focus: "", cluster: "", corridor: "" },
        pageLocationOptions()
      );
      const parts = [home];
      if (state.mode !== "overview") {
        const separator = element("span", "", "/");
        separator.setAttribute("aria-hidden", "true");
        parts.push(separator, element("span", "", title));
      }
      breadcrumb.replaceChildren(...parts);
    }
    if (!inspector) return;
    const heading = element("h3", "", title);
    heading.id = "atlas-inspector-title";
    const summary = focus?.summary || activePayload?.summary || activePayload?.description
      || (state.mode === "overview" ? "군집을 선택해 그 안의 문서와 관계를 펼칩니다." : "현재 지도 조각의 문서와 관계를 함께 표시합니다.");
    inspector.replaceChildren(
      element("p", "atlas-inspector-kicker", state.mode.toUpperCase()),
      heading,
      element("p", "", summary)
    );
    if (focus?.url) {
      const link = element("a", "atlas-document-link", "문서 읽기 →");
      link.href = safePageHref(focus.url);
      inspector.append(link);
    }
  }

  async function renderFiltered({ announceResult = true } = {}) {
    if (!activePayload) return;
    const renderToken = navigationGate.token;
    const requestId = ++renderRequestId;
    const sourceView = normalizeSemanticAtlasView(activePayload);
    const visible = await workerCall("filter-view", {
      view: sourceView,
      filters: filters(),
      options: { focusId: state.focus || "" }
    }, () => selectVisibleAtlasView(sourceView, filters(), { focusId: state.focus || "" }));
    if (!navigationGate.isCurrent(renderToken) || requestId !== renderRequestId) return;
    activeView = normalizeSemanticAtlasView(visible);
    renderer?.setView(activeView);
    renderer?.setSelection(state.focus || state.cluster || state.corridor || "");
    renderAccessibleLists(activeView);
    renderContext();
    const outside = Boolean(visible.stats?.focusOutsideFilters || activePayload.stats?.focusOutsideFilters);
    root.classList.toggle("has-atlas-focus-outside-filters", outside);
    const notice = query(root, "[data-atlas-filter-notice]");
    if (notice) {
      notice.hidden = !outside;
      notice.textContent = outside ? "초점 문서는 현재 필터 밖에 있지만 탐색 맥락을 보존하기 위해 계속 표시합니다." : "";
    }
    if (announceResult) announce(outside
      ? `초점 문서를 유지한 채 ${activeView.nodes.length}개 노드와 ${activeView.edges.length}개 관계를 표시합니다.`
      : `${activeView.nodes.length}개 노드와 ${activeView.edges.length}개 관계를 표시합니다.`);
  }

  function resolvePayloadUrl(nextState, lookupRecord = null) {
    if (nextState.mode === "overview") return atlasManifestAsset(manifest, "overview");
    if (nextState.mode === "cluster") return atlasManifestAsset(manifest, "cluster", nextState.cluster);
    if (nextState.mode === "corridor") return atlasManifestAsset(manifest, "corridor", nextState.corridor);
    if (nextState.mode === "focus") return focusAsset(manifest, lookupRecord, nextState.focus);
    return "";
  }

  function knownTarget(nextState) {
    const overview = normalizeSemanticAtlasView(overviewPayload);
    if (nextState.mode === "cluster") return overview.nodes.some((node) => node.id === nextState.cluster);
    if (nextState.mode === "corridor") {
      return overview.edges.some((edge) => (edge.corridorId || edge.shard || edge.id) === nextState.corridor);
    }
    return true;
  }

  function fallbackOverview(reason) {
    state = { ...state, mode: "overview", focus: "", cluster: "", corridor: "" };
    syncControls();
    syncUrl("replaceState");
    announce(reason || "요청한 지도 항목을 찾지 못해 전체 지도로 돌아왔습니다.");
  }

  async function loadState(nextState, { history = "replaceState", announceResult = true } = {}) {
    const request = navigationGate.begin();
    const previousPayload = activePayload;
    const previousView = activeView;
    state = nextState;
    syncControls();
    if (history) syncUrl(history);
    setBusy(true);
    retryAction = () => loadState(state, { history: "replaceState" });
    retryButton?.setAttribute("hidden", "");
    errorPanel?.setAttribute("hidden", "");
    try {
      let lookupRecord = null;
      if (!knownTarget(state)) {
        fallbackOverview("주소의 군집 또는 회랑을 찾지 못해 전체 지도로 돌아왔습니다.");
        activePayload = overviewPayload;
        await renderFiltered({ announceResult: false });
        return;
      }
      if (state.mode === "focus") {
        const lookupPayload = await ensureLookup(request.signal);
        if (!request.current()) return;
        lookupRecord = lookupById(lookupPayload, state.focus);
        if (!lookupRecord) {
          fallbackOverview("주소의 문서를 찾지 못해 전체 지도로 돌아왔습니다.");
          activePayload = overviewPayload;
          await renderFiltered({ announceResult: false });
          return;
        }
      }
      const url = resolvePayloadUrl(state, lookupRecord);
      if (!url) {
        fallbackOverview("주소의 군집 또는 회랑을 찾지 못해 전체 지도로 돌아왔습니다.");
        activePayload = overviewPayload;
        await renderFiltered({ announceResult: false });
        return;
      }
      let payload = state.mode === "overview" && overviewPayload ? overviewPayload : await fetchJson(url, { signal: request.signal });
      if (!request.current()) return;
      if (state.mode === "focus") {
        const focusView = createDocumentFocusView(focusRecord(payload, state.focus), state.focus, { maxNodes: 80, maxEdges: 1_500 });
        if (!focusView.focus) {
          fallbackOverview("문서의 지도 조각에서 초점을 찾지 못해 전체 지도로 돌아왔습니다.");
          activePayload = overviewPayload;
          await renderFiltered({ announceResult: false });
          return;
        }
        payload = { ...payload, ...focusView, view: focusView };
      }
      activePayload = payload;
      await renderFiltered({ announceResult });
      if (!request.current()) return;
      if (state.focus) renderer?.focusNode(state.focus);
      else if (state.cluster) renderer?.focusNode(state.cluster);
      retryAction = null;
    } catch (error) {
      if (error?.name === "AbortError" || !request.current()) return;
      activePayload = previousPayload;
      activeView = previousView;
      announce("지도 조각을 불러오지 못했습니다. 마지막으로 성공한 화면을 유지합니다.");
      retryButton?.removeAttribute("hidden");
      errorPanel?.removeAttribute("hidden");
    } finally {
      if (request.current()) setBusy(false);
    }
  }

  function stateFromLocation() {
    return parseAtlasPageUrl(
      window.location.href,
      manifest.facets || manifest.allowedFacets || {},
      pageLocationOptions()
    );
  }

  async function navigate(action, id, history = "pushState") {
    if (!id) return;
    const next = { ...state, mode: action, focus: "", cluster: "", corridor: "", [action]: id };
    await loadState(next, { history });
  }

  function activate(item) {
    const result = atlasActivation(item, state.mode);
    if (result.action === "inspect-edge") {
      inspectEdge(activeView.edges.find((edge) => edge.id === result.id));
      renderer?.setSelection(result.id);
      announce("관계 설명을 열었습니다.");
    } else if (TARGET_KEYS.includes(result.action)) {
      navigate(result.action, result.id);
    }
  }

  async function performSearch() {
    if (composing || !search) return;
    const queryText = search.value.normalize("NFKC").replace(/\s+/g, " ").trim().toLocaleLowerCase("ko-KR");
    state = { ...state, q: queryText };
    syncUrl("replaceState");
    const request = searchGate.begin();
    if (!queryText) {
      activeSearchResults = [];
      activeSearchIndex = -1;
      searchResults?.replaceChildren();
      search.setAttribute("aria-expanded", "false");
      search.removeAttribute("aria-activedescendant");
      return;
    }
    try {
      const lookupPayload = await ensureLookup(request.signal);
      if (!request.current()) return;
      const entries = values(lookupPayload.entries || lookupPayload.nodes || lookupPayload.documents);
      const results = await workerCall("search", { query: queryText, filters: filters(), limit: 12 },
        () => searchAtlasLookup(entries, queryText, filters(), 12));
      if (!request.current()) return;
      activeSearchResults = results;
      activeSearchIndex = -1;
      if (searchResults) {
        const list = element("ol");
        list.setAttribute("role", "listbox");
        list.setAttribute("aria-label", "문서 검색 결과");
        results.forEach((entry) => {
          const item = element("li");
          const button = element("button", "atlas-search-result");
          button.type = "button";
          button.id = `atlas-search-result-${String(entry.id).replace(/[^a-zA-Z0-9_-]/g, "-")}`;
          button.dataset.atlasSearchId = entry.id;
          button.setAttribute("role", "option");
          button.setAttribute("aria-selected", "false");
          button.append(element("strong", "", entry.title || entry.label || entry.id), element("small", "", entry.summary || entry.category || ""));
          item.append(button);
          list.append(item);
        });
        searchResults.replaceChildren(list);
      }
      search.setAttribute("aria-expanded", String(results.length > 0));
      announce(`${results.length}개의 검색 결과를 찾았습니다.`);
    } catch (error) {
      if (error?.name !== "AbortError" && request.current()) announce("검색 색인을 불러오지 못했습니다. 다시 시도해 주세요.");
    }
  }

  function scheduleSearch() {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(performSearch, 170);
  }

  function activateSearchResult(index) {
    const record = activeSearchResults[index];
    if (record) navigate("focus", record.id);
  }

  root.addEventListener("click", (event) => {
    const searchResult = event.target.closest("[data-atlas-search-id]");
    if (searchResult) { activateSearchResult(activeSearchResults.findIndex((item) => item.id === searchResult.dataset.atlasSearchId)); return; }
    const action = event.target.closest("[data-atlas-action]");
    if (action) {
      const type = action.dataset.atlasAction;
      const id = type === "inspect-edge" ? action.dataset.atlasEdgeId || action.dataset.atlasId : action.dataset.atlasId;
      if (type === "inspect-edge") activate({ kind: "edge", id });
      else navigate(type, id);
    }
  });

  controls?.addEventListener("submit", (event) => event.preventDefault());

  search?.addEventListener("compositionstart", () => { composing = true; });
  search?.addEventListener("compositionend", () => { composing = false; scheduleSearch(); });
  search?.addEventListener("input", () => { if (!composing) scheduleSearch(); });
  search?.addEventListener("keydown", (event) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End", "Enter"].includes(event.key)) return;
    if (!activeSearchResults.length) return;
    event.preventDefault();
    if (event.key === "Enter") { activateSearchResult(activeSearchIndex < 0 ? 0 : activeSearchIndex); return; }
    activeSearchIndex = atlasSearchResultIndex(activeSearchIndex, event.key, activeSearchResults.length);
    const buttons = [...searchResults?.querySelectorAll("[data-atlas-search-id]") || []];
    buttons.forEach((button, index) => button.setAttribute("aria-selected", String(index === activeSearchIndex)));
    if (buttons[activeSearchIndex]?.id) search.setAttribute("aria-activedescendant", buttons[activeSearchIndex].id);
    buttons[activeSearchIndex]?.focus();
  });
  searchResults?.addEventListener("keydown", (event) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End", "Enter"].includes(event.key)) return;
    const buttons = [...searchResults.querySelectorAll("[data-atlas-search-id]")];
    const current = buttons.indexOf(event.target.closest("[data-atlas-search-id]"));
    if (current < 0) return;
    event.preventDefault();
    if (event.key === "Enter") { activateSearchResult(current); return; }
    activeSearchIndex = atlasSearchResultIndex(current, event.key, buttons.length);
    buttons[activeSearchIndex]?.focus();
  });
  filterControls.forEach((control, key) => control.addEventListener("change", () => {
    state = { ...state, [key]: control.value || "" };
    syncUrl("replaceState");
    renderFiltered();
    if (state.q) scheduleSearch();
  }));
  retryButton?.addEventListener("click", () => retryAction?.());
  overviewButton?.addEventListener("click", () => {
    activeSearchResults = [];
    activeSearchIndex = -1;
    searchResults?.replaceChildren();
    search?.removeAttribute("aria-activedescendant");
    loadState({
      mode: "overview",
      focus: "",
      cluster: "",
      corridor: "",
      q: "",
      ...Object.fromEntries(FILTER_KEYS.map((key) => [key, ""]))
    }, { history: "pushState" });
  });
  resetCameraButton?.addEventListener("click", () => renderer?.resetCamera());
  zoomInButton?.addEventListener("click", () => renderer?.zoomBy(1.35));
  zoomOutButton?.addEventListener("click", () => renderer?.zoomBy(1 / 1.35));
  window.addEventListener("popstate", (event) => loadState(atlasStateFromHistory(
    event.state,
    window.location.href,
    manifest.facets || manifest.allowedFacets || {},
    pageLocationOptions()
  ), { history: null }));

  root.dataset.atlasEnhanced = "true";
  setBusy(true);
  try {
    const manifestResponse = await fetchImpl(manifestUrl, { cache: "force-cache", headers: { Accept: "application/json" } });
    if (!manifestResponse.ok) throw new Error(`Atlas manifest request failed: ${manifestResponse.status}`);
    manifest = await manifestResponse.json();
    const overviewUrl = atlasManifestAsset(manifest, "overview");
    if (!overviewUrl) throw new Error("Atlas overview shard is missing");
    overviewPayload = await fetchJson(overviewUrl);
    state = stateFromLocation();
    const canonical = atlasPageUrlFor(window.location.href, state, pageLocationOptions());
    window.history.replaceState(atlasHistoryEntry(state), "", canonical);
    syncControls();
    controls?.removeAttribute("hidden");
    errorPanel?.setAttribute("hidden", "");
    if (canvas) {
      renderer = rendererModule.createAtlasRenderer(canvas, {
        onActivate: activate,
        onHover(item) { if (item) announce(item.kind === "edge" ? "관계를 선택하면 설명을 볼 수 있습니다." : `${item.title || item.label || item.id}`); }
      });
    }
    await loadState(state, { history: null });
    if (state.q) performSearch();
  } catch {
    announce("의미 지도를 시작하지 못했습니다. 아래 정적 목록은 계속 사용할 수 있습니다.");
    retryButton?.removeAttribute("hidden");
    errorPanel?.removeAttribute("hidden");
    retryAction = () => window.location.reload();
  } finally {
    setBusy(false);
  }

  return {
    get state() { return { ...state }; },
    get view() { return activeView; },
    navigate,
    retry() { return retryAction?.(); },
    destroy() {
      navigationGate.cancel();
      searchGate.cancel();
      window.clearTimeout(searchTimer);
      pendingWorker.forEach(({ timeout }) => window.clearTimeout(timeout));
      pendingWorker.clear();
      worker?.terminate();
      renderer?.destroy();
      root.dataset.atlasEnhanced = "false";
    }
  };
}

if (typeof document !== "undefined") {
  const root = document.querySelector("[data-semantic-atlas]");
  if (root) initializeSemanticAtlas(root).catch(() => {
    root.setAttribute("aria-busy", "false");
    const status = query(root, "[data-atlas-status]", "[role=status]");
    if (status) status.textContent = "의미 지도를 시작하지 못했습니다. 정적 목록을 이용해 주세요.";
  });
}
