const pathModuleUrl = new URL("./connection-paths.js", import.meta.url);
pathModuleUrl.searchParams.set("v", window.CS_WIKI_ASSET_VERSION || "1");
const {
  connectionSummary,
  createConnectionIndex,
  findConnectionPaths
} = await import(pathModuleUrl);

const explorer = document.querySelector("[data-connection-explorer]");

if (explorer) {
  const form = explorer.querySelector("[data-connection-form]");
  const fromInput = explorer.querySelector("[data-connection-from]");
  const toInput = explorer.querySelector("[data-connection-to]");
  const modeSelect = explorer.querySelector("[data-connection-mode]");
  const swapButton = explorer.querySelector("[data-connection-swap]");
  const copyButton = explorer.querySelector("[data-connection-copy]");
  const status = explorer.querySelector("[data-connection-status]");
  const results = explorer.querySelector("[data-connection-results]");
  const routeTabs = explorer.querySelector("[data-connection-route-tabs]");
  const categoryLabels = {
    sources: "정규 소스",
    references: "참고 자료",
    concepts: "개념",
    entities: "인물",
    analyses: "분석",
    meta: "메타"
  };
  const modeLabels = {
    explain: "핵심 연결",
    concept: "개념·학습",
    evidence: "근거 계보",
    shortest: "본문 언급 포함"
  };
  const modeReasons = {
    explain: "관련 항목과 학습 순서를 우선하고, 원전 허브와 자동 본문 언급에는 추가 비용을 둔 경로입니다.",
    concept: "근거·본문 언급을 제외하고 개념 관계, 관련 항목과 학습 순서만 따라간 경로입니다.",
    evidence: "근거 문서와 편집 관계를 우선해 두 문서가 공유하는 지식 계보를 찾은 경로입니다.",
    shortest: "본문 언급까지 포함해 가장 적은 단계를 우선한 경로입니다. 의미가 약한 자동 연결이 포함될 수 있습니다."
  };
  const WORKER_INIT_TIMEOUT_MS = 15000;
  const WORKER_QUERY_TIMEOUT_MS = 15000;
  const cache = new Map();
  const pendingWorkerRequests = new Map();
  let graph;
  let nodes;
  let fallbackIndex = null;
  let names;
  let pathWorker = null;
  let workerReady = Promise.resolve(false);
  let workerRequestId = 0;
  let computeRequestId = 0;
  let activeRoutes = [];
  let activeRoute = 0;
  let activeFrom = "";
  let activeTo = "";
  let activeMode = "explain";
  results.setAttribute("aria-busy", "true");

  function element(tag, className = "", text = "") {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function safeHref(value) {
    try {
      const url = new URL(value, window.location.origin);
      if (url.origin === window.location.origin) return `${url.pathname}${url.search}${url.hash}`;
    } catch {
      // Invalid graph URLs are made inert below.
    }
    return "#";
  }

  function normalizeName(value) {
    return String(value || "").normalize("NFKC").trim().toLocaleLowerCase("ko");
  }

  function buildNameIndex() {
    const candidates = new Map();
    for (const node of graph.nodes.filter((item) => item.visibility === "public")) {
      for (const value of [node.title, ...(node.aliases || [])]) {
        const normalized = normalizeName(value);
        if (!normalized) continue;
        if (!candidates.has(normalized)) candidates.set(normalized, new Set());
        candidates.get(normalized).add(node.id);
      }
    }
    return new Map([...candidates.entries()].filter(([, ids]) => ids.size === 1).map(([name, ids]) => [name, [...ids][0]]));
  }

  function endpointId(input) {
    return names.get(normalizeName(input.value)) || "";
  }

  function setEndpoint(input, id) {
    input.value = nodes.get(id)?.title || "";
    setInvalid(input, false);
  }

  function setStatus(message) {
    status.textContent = message;
  }

  function setInvalid(input, invalid) {
    if (invalid) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  }

  function setResultsBusy(busy) {
    results.setAttribute("aria-busy", String(busy));
  }

  function markResultsDirty() {
    computeRequestId += 1;
    copyButton.disabled = true;
    setResultsBusy(false);
    if (!results.classList.contains("is-stale")) results.classList.add("is-stale");
    setStatus("문서 선택이 바뀌었습니다. 연결 설명 만들기를 눌러 새 경로를 계산해 주세요.");
  }

  function shutdownWorker(worker, error = new Error("Connection worker unavailable")) {
    if (!worker) return;
    pendingWorkerRequests.forEach(({ reject }) => reject(error));
    pendingWorkerRequests.clear();
    worker.terminate();
    if (pathWorker === worker) pathWorker = null;
  }

  function initializePathWorker() {
    if (!("Worker" in window)) return;
    workerReady = new Promise((resolve) => {
      const workerUrl = new URL("./connection-worker.js", import.meta.url);
      workerUrl.searchParams.set("v", window.CS_WIKI_ASSET_VERSION || "1");
      const worker = new Worker(workerUrl, { type: "module" });
      pathWorker = worker;
      let initialized = false;
      let initTimeoutId;
      const disableWorker = (error = new Error("Connection worker unavailable")) => {
        window.clearTimeout(initTimeoutId);
        if (!initialized) resolve(false);
        initialized = true;
        shutdownWorker(worker, error);
      };
      worker.addEventListener("message", (event) => {
        const message = event.data || {};
        if (message.type === "ready") {
          window.clearTimeout(initTimeoutId);
          if (!initialized) resolve(true);
          initialized = true;
          return;
        }
        if (message.type === "error" && !message.requestId) {
          const error = new Error(message.message || "Connection worker failed to initialize");
          error.code = message.code || "CONNECTION_WORKER_INIT_ERROR";
          disableWorker(error);
          return;
        }
        const pending = pendingWorkerRequests.get(message.requestId);
        if (!pending) return;
        pendingWorkerRequests.delete(message.requestId);
        if (message.type === "result") pending.resolve(message.paths);
        else {
          const error = new Error(message.message || "Connection worker failed");
          error.code = message.code || "CONNECTION_WORKER_ERROR";
          pending.reject(error);
        }
      });
      worker.addEventListener("error", (event) => disableWorker(new Error(event.message || "Connection worker crashed")));
      initTimeoutId = window.setTimeout(() => {
        const error = new Error("Connection worker initialization timed out");
        error.code = "CONNECTION_WORKER_INIT_TIMEOUT";
        disableWorker(error);
      }, WORKER_INIT_TIMEOUT_MS);
      try {
        worker.postMessage({ type: "init", graph, pathModuleUrl: pathModuleUrl.href });
      } catch (error) {
        disableWorker(error);
      }
    });
  }

  async function calculatePaths(fromId, toId, mode) {
    let canUseWorker = false;
    try {
      canUseWorker = Boolean(pathWorker && await workerReady);
    } catch {
      pathWorker = null;
    }
    if (canUseWorker && pathWorker) {
      try {
        const requestId = ++workerRequestId;
        return await new Promise((resolve, reject) => {
          const timeoutId = window.setTimeout(() => {
            if (!pendingWorkerRequests.has(requestId)) return;
            pendingWorkerRequests.delete(requestId);
            const error = new Error("Connection worker query timed out");
            error.code = "CONNECTION_WORKER_TIMEOUT";
            reject(error);
          }, WORKER_QUERY_TIMEOUT_MS);
          pendingWorkerRequests.set(requestId, {
            resolve(value) {
              window.clearTimeout(timeoutId);
              resolve(value);
            },
            reject(error) {
              window.clearTimeout(timeoutId);
              reject(error);
            }
          });
          try {
            pathWorker.postMessage({ type: "query", requestId, fromId, toId, mode });
          } catch (error) {
            pendingWorkerRequests.delete(requestId);
            window.clearTimeout(timeoutId);
            reject(error);
          }
        });
      } catch (error) {
        if (error?.code === "CONNECTION_SEARCH_LIMIT") throw error;
        shutdownWorker(pathWorker, error);
      }
    }
    fallbackIndex ||= createConnectionIndex(graph);
    return findConnectionPaths(fallbackIndex, fromId, toId, { mode, limit: 3, maxHops: 6 });
  }

  function syncUrl(method = "replaceState") {
    const url = new URL(window.location.href);
    if (activeFrom) url.searchParams.set("from", activeFrom);
    else url.searchParams.delete("from");
    if (activeTo) url.searchParams.set("to", activeTo);
    else url.searchParams.delete("to");
    if (activeMode !== "explain") url.searchParams.set("mode", activeMode);
    else url.searchParams.delete("mode");
    if (activeRoute > 0) url.searchParams.set("route", String(activeRoute));
    else url.searchParams.delete("route");
    window.history[method]({}, "", url);
  }

  function appendMetric(list, label, value) {
    const wrapper = element("div");
    wrapper.append(element("dt", "", label), element("dd", "", value));
    list.append(wrapper);
  }

  function nodeBlock(node, position, step) {
    const item = element("li", "connection-step");
    const nodeCard = element("div", "connection-node");
    nodeCard.append(element("span", "connection-node-index", String(position + 1).padStart(2, "0")));
    const copy = element("div");
    copy.append(element("span", "", categoryLabels[node.category] || node.category));
    const link = element("a", "", node.title);
    link.href = safeHref(node.url);
    copy.append(link, element("p", "", node.summary || "요약이 아직 없습니다."));
    nodeCard.append(copy);
    item.append(nodeCard);
    if (step) item.append(relationBlock(step));
    return item;
  }

  function relationBlock(step) {
    const item = element("div", "connection-relation");
    item.dataset.family = step.edge.family;
    const line = element("span", "connection-relation-line");
    line.setAttribute("aria-hidden", "true");
    const card = element("div", "connection-relation-card");
    card.append(element("span", "", step.label), element("p", "", step.detail));
    if (step.alternativeLabels.length) {
      const alternatives = element("div", "connection-relation-alternatives");
      alternatives.append(element("span", "", "같은 두 문서의 다른 관계"));
      step.alternativeLabels.forEach((label) => alternatives.append(element("span", "", label)));
      card.append(alternatives);
    }
    const details = element("details");
    details.append(element("summary", "", "이동과 기록 방향"));
    const from = nodes.get(step.from);
    const to = nodes.get(step.to);
    const recordedSource = nodes.get(step.edge.source);
    const recordedTarget = nodes.get(step.edge.target);
    details.append(element("p", "", `이동: ${from?.title || step.from} → ${to?.title || step.to}`));
    details.append(element("p", "", step.edge.directed
      ? `기록: ${recordedSource?.title || step.edge.source} → ${recordedTarget?.title || step.edge.target}`
      : "기록: 방향 없는 관계"));
    card.append(details);
    item.append(line, card);
    return item;
  }

  function renderRoute({ focusHeading = false } = {}) {
    results.replaceChildren();
    const path = activeRoutes[activeRoute];
    if (!path) return;
    const article = element("article", "connection-route-card");
    article.dataset.connectionRoute = "";
    const header = element("header", "connection-route-heading");
    const headingCopy = element("div");
    headingCopy.append(element("p", "", `ROUTE ${String(activeRoute + 1).padStart(2, "0")} / ${String(activeRoutes.length).padStart(2, "0")}`));
    const heading = element("h2", "", connectionSummary({ nodes }, path));
    heading.tabIndex = -1;
    heading.dataset.connectionResultTitle = "";
    headingCopy.append(heading, element("p", "connection-route-reason", modeReasons[activeMode]));
    if (path.truncated) {
      headingCopy.append(element("p", "connection-route-limit", "기본 경로는 확인했지만 계산 한도 안에서 일부 대안만 찾았습니다."));
    }
    const metrics = element("dl");
    appendMetric(metrics, "단계", String(path.hops));
    appendMetric(metrics, "판독", path.quality.label);
    appendMetric(metrics, "렌즈", modeLabels[activeMode]);
    header.append(headingCopy, metrics);
    const chain = element("ol", "connection-chain");
    path.nodes.forEach((nodeId, position) => {
      chain.append(nodeBlock(nodes.get(nodeId), position, path.steps[position]));
    });
    article.append(header, chain);
    results.append(article);
    if (focusHeading) heading.focus();
  }

  function syncRouteTabs() {
    const buttons = [...routeTabs.querySelectorAll("button")];
    buttons.forEach((button, indexAt) => {
      const selected = indexAt === activeRoute;
      button.setAttribute("aria-current", selected ? "true" : "false");
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  function selectRoute(indexAt, { focusHeading = false, updateHistory = true } = {}) {
    activeRoute = Math.max(0, Math.min(indexAt, activeRoutes.length - 1));
    syncRouteTabs();
    renderRoute({ focusHeading });
    const partial = activeRoutes.some((path) => path.truncated) ? " 계산 한도 안에서 찾은 일부 대안입니다." : "";
    setStatus(`${activeRoutes.length}개 경로 중 ${activeRoute + 1}번째, ${activeRoutes[activeRoute].hops}단계 경로를 선택했습니다.${partial}`);
    if (updateHistory) syncUrl("replaceState");
  }

  function renderTabs() {
    routeTabs.replaceChildren();
    routeTabs.hidden = activeRoutes.length < 2;
    activeRoutes.forEach((path, indexAt) => {
      const button = element("button", "", path.hops === 1 ? `경로 ${indexAt + 1} · 직접 연결` : `경로 ${indexAt + 1} · ${path.hops}단계`);
      button.type = "button";
      button.addEventListener("click", () => selectRoute(indexAt, { focusHeading: false }));
      routeTabs.append(button);
    });
    syncRouteTabs();
  }

  function messageResult(title, message, canExpand = false) {
    activeRoutes = [];
    activeRoute = 0;
    routeTabs.hidden = true;
    routeTabs.replaceChildren();
    copyButton.hidden = true;
    copyButton.disabled = true;
    results.classList.remove("is-stale");
    setResultsBusy(false);
    const empty = element("div", "connection-empty");
    empty.append(element("h2", "", title), element("p", "", message));
    if (canExpand) {
      const expand = element("button", "", "본문 언급까지 넓히기");
      expand.type = "button";
      expand.addEventListener("click", () => {
        modeSelect.value = "shortest";
        compute(activeFrom, activeTo, "shortest", { history: "pushState", focusHeading: true });
      });
      empty.append(expand);
    }
    results.replaceChildren(empty);
  }

  function emptyResult(message, canExpand = false) {
    messageResult("선택한 렌즈에서는 연결을 찾지 못했습니다.", message, canExpand);
  }

  function cacheKey(fromId, toId, mode) {
    return `${fromId}|${toId}|${mode}`;
  }

  async function cachedPaths(fromId, toId, mode) {
    const key = cacheKey(fromId, toId, mode);
    if (cache.has(key)) {
      const value = cache.get(key);
      cache.delete(key);
      cache.set(key, value);
      return await value;
    }
    const pending = calculatePaths(fromId, toId, mode);
    cache.set(key, pending);
    try {
      const value = await pending;
      cache.set(key, value);
      if (cache.size > 24) cache.delete(cache.keys().next().value);
      return value;
    } catch (error) {
      cache.delete(key);
      throw error;
    }
  }

  async function compute(fromId, toId, mode, { history = "none", route = 0, focusHeading = false } = {}) {
    const requestId = ++computeRequestId;
    activeFrom = fromId;
    activeTo = toId;
    activeMode = modeLabels[mode] ? mode : "explain";
    setResultsBusy(true);
    copyButton.disabled = true;
    setStatus("관계 그래프에서 설명 가능한 경로를 계산하고 있습니다.");
    let paths;
    try {
      paths = await cachedPaths(activeFrom, activeTo, activeMode);
    } catch (error) {
      if (requestId !== computeRequestId) return;
      const exhausted = error?.code === "CONNECTION_SEARCH_LIMIT";
      messageResult(
        exhausted ? "경로 계산 범위가 너무 넓습니다." : "연결 경로를 계산하지 못했습니다.",
        exhausted
          ? "관계 렌즈를 좁히거나 더 가까운 두 문서를 선택해 주세요. 연결이 없다는 뜻은 아닙니다."
          : "경로 계산 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
      );
      setStatus(exhausted ? "경로 탐색 한도에 도달했습니다." : "연결 경로를 계산하지 못했습니다.");
      return;
    }
    if (requestId !== computeRequestId) return;
    activeRoutes = paths;
    const requestedRoute = Number(route);
    activeRoute = Number.isInteger(requestedRoute) && requestedRoute >= 0 && requestedRoute < activeRoutes.length ? requestedRoute : 0;
    if (!activeRoutes.length) {
      emptyResult("관계를 다른 렌즈로 넓히거나 두 문서의 관련 항목을 보강해 보세요.", activeMode !== "shortest");
      setStatus("선택한 렌즈에서 연결 경로를 찾지 못했습니다.");
    } else {
      renderTabs();
      renderRoute({ focusHeading });
      results.classList.remove("is-stale");
      setResultsBusy(false);
      copyButton.hidden = false;
      copyButton.disabled = false;
      const partial = activeRoutes.some((path) => path.truncated) ? " 계산 한도 안에서 찾은 일부 대안입니다." : "";
      setStatus(`${activeRoutes.length}개 경로를 찾았습니다. 선택한 경로는 ${activeRoutes[activeRoute].hops}단계입니다.${partial}`);
    }
    if (history !== "none") syncUrl(history);
  }

  function validateForm() {
    const fromId = endpointId(fromInput);
    const toId = endpointId(toInput);
    setInvalid(fromInput, !fromId);
    setInvalid(toInput, !toId);
    if (!fromId || !toId) {
      setStatus("자동 완성 목록에서 출발 문서와 도착 문서를 정확히 선택해 주세요.");
      (!fromId ? fromInput : toInput).focus();
      return null;
    }
    if (fromId === toId) {
      toInput.setAttribute("aria-invalid", "true");
      setStatus("서로 다른 두 문서를 선택해 주세요.");
      toInput.focus();
      return null;
    }
    return { fromId, toId };
  }

  async function restoreFromUrl({ focusDestination = false } = {}) {
    const url = new URL(window.location.href);
    const requestedFrom = url.searchParams.get("from") || "";
    const requestedTo = url.searchParams.get("to") || "";
    const requestedMode = url.searchParams.get("mode") || "explain";
    const validEndpoint = (id) => nodes.get(id)?.visibility === "public";
    const fromId = validEndpoint(requestedFrom) ? requestedFrom : explorer.dataset.defaultFrom;
    const toId = validEndpoint(requestedTo) ? requestedTo : requestedFrom && !requestedTo ? "" : explorer.dataset.defaultTo;
    const mode = modeLabels[requestedMode] ? requestedMode : "explain";
    setEndpoint(fromInput, fromId);
    modeSelect.value = mode;
    if (!toId) {
      toInput.value = "";
      setInvalid(toInput, false);
      activeFrom = fromId;
      activeTo = "";
      activeMode = mode;
      messageResult("도착 문서를 선택해 주세요.", "도착 문서를 선택하면 이 문서에서 출발하는 경로를 계산합니다.");
      setStatus("도착 문서를 선택해 주세요.");
      if (focusDestination) queueMicrotask(() => toInput.focus());
    } else {
      setEndpoint(toInput, toId);
      await compute(fromId, toId, mode, { route: url.searchParams.get("route"), focusHeading: false });
    }
    syncUrl("replaceState");
  }

  routeTabs.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const buttons = [...routeTabs.querySelectorAll("button")];
    const current = buttons.indexOf(document.activeElement);
    if (current < 0) return;
    event.preventDefault();
    let next = current;
    if (event.key === "ArrowLeft") next = (current - 1 + buttons.length) % buttons.length;
    if (event.key === "ArrowRight") next = (current + 1) % buttons.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = buttons.length - 1;
    buttons[next].focus();
    buttons[next].click();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const endpoints = validateForm();
    if (!endpoints) return;
    compute(endpoints.fromId, endpoints.toId, modeSelect.value, { history: "pushState", focusHeading: true });
  });

  [fromInput, toInput].forEach((input) => input.addEventListener("input", () => {
    setInvalid(input, false);
    markResultsDirty();
  }));

  swapButton.addEventListener("click", () => {
    const fromValue = fromInput.value;
    fromInput.value = toInput.value;
    toInput.value = fromValue;
    const endpoints = validateForm();
    if (endpoints) compute(endpoints.fromId, endpoints.toId, modeSelect.value, { history: "pushState", focusHeading: true });
  });

  modeSelect.addEventListener("change", () => {
    const endpoints = validateForm();
    if (endpoints) compute(endpoints.fromId, endpoints.toId, modeSelect.value, { history: "pushState", focusHeading: true });
  });

  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatus("현재 연결 경로 주소를 복사했습니다.");
    } catch {
      setStatus("주소를 복사하지 못했습니다. 브라우저 주소창의 링크를 사용해 주세요.");
    }
  });

  window.addEventListener("popstate", () => { void restoreFromUrl({ focusDestination: false }); });

  fetch(explorer.dataset.connectionGraphUrl, { cache: "force-cache" })
    .then((response) => {
      if (!response.ok) throw new Error(`Connection graph request failed: ${response.status}`);
      return response.json();
    })
    .then(async (payload) => {
      graph = payload;
      nodes = new Map(graph.nodes.map((node) => [node.id, node]));
      names = buildNameIndex();
      initializePathWorker();
      form.hidden = false;
      await restoreFromUrl({ focusDestination: true });
    })
    .catch(() => {
      messageResult("연결 그래프를 불러오지 못했습니다.", "네트워크 상태를 확인한 뒤 페이지를 새로 고쳐 주세요.");
      setStatus("연결 그래프를 불러오지 못했습니다.");
    });
}
