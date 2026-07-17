const linesModuleUrl = new URL("./learning-lines.js", import.meta.url);
linesModuleUrl.searchParams.set("v", window.CS_WIKI_ASSET_VERSION || "1");
const {
  createLearningMapIndex,
  normalizeLearningMapState
} = await import(linesModuleUrl);

const map = document.querySelector("[data-learning-map]");

if (map) {
  const status = map.querySelector("[data-learning-map-status]");
  const lineCode = map.querySelector("[data-learning-line-code]");
  const lineTitle = map.querySelector("[data-learning-line-title]");
  const lineDescription = map.querySelector("[data-learning-line-description]");
  const lineStationCount = map.querySelector("[data-learning-line-stations]");
  const lineTransferCount = map.querySelector("[data-learning-line-transfers]");
  const stationList = map.querySelector("[data-learning-stations]");
  const stripViewport = map.querySelector("[data-learning-strip-viewport]");
  const inspector = map.querySelector("[data-learning-inspector]");
  const lineCodes = new Map([...map.querySelectorAll("[data-learning-line]")]
    .map((link) => [link.dataset.learningLine, link.querySelector(".learning-line-code")?.textContent || ""]));
  const categoryLabels = {
    sources: "정규 소스",
    references: "참고 자료",
    concepts: "개념",
    entities: "인물",
    analyses: "분석",
    meta: "메타"
  };
  const base = String(window.CS_WIKI_BASE || "").replace(/\/$/, "");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobileLayout = window.matchMedia("(max-width: 720px)");
  let index;
  let state = { line: "", station: "" };
  map.setAttribute("aria-busy", "true");

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
      // Invalid payload URLs become inert below.
    }
    return "#";
  }

  function mapHref(pathname) {
    return `${base}${pathname}` || pathname;
  }

  function mapStateHref(lineId, stationId) {
    const encodedLine = encodeURIComponent(lineId);
    const encodedStation = encodeURIComponent(stationId);
    return mapHref(`/map/learning/${encodedLine}/?line=${encodedLine}&station=${encodedStation}#station-${encodedStation}`);
  }

  function codeFor(lineId) {
    if (lineCodes.get(lineId)) return lineCodes.get(lineId);
    const position = index.lineOrder.indexOf(lineId);
    return `L${String(Math.max(0, position) + 1).padStart(2, "0")}`;
  }

  function setStatus(message) {
    status.textContent = message;
  }

  function syncUrl(method = "replaceState") {
    const url = new URL(window.location.href);
    url.pathname = mapHref(`/map/learning/${encodeURIComponent(state.line)}/`);
    if (state.line) url.searchParams.set("line", state.line);
    else url.searchParams.delete("line");
    if (state.station) url.searchParams.set("station", state.station);
    else url.searchParams.delete("station");
    url.hash = state.station ? `station-${encodeURIComponent(state.station)}` : "";
    window.history[method]({}, "", url);
  }

  function stationMemberships(stationId) {
    return index.membershipsByStation.get(stationId) || [];
  }

  function updateLineBoard() {
    const illuminated = new Set(stationMemberships(state.station).map((membership) => membership.lineId));
    map.querySelectorAll("[data-learning-line-item]").forEach((item) => {
      const lineId = item.dataset.learningLineItem;
      const active = lineId === state.line;
      item.classList.toggle("is-active", active);
      item.classList.toggle("has-selected-station", illuminated.has(lineId));
      const link = item.querySelector("[data-learning-line]");
      if (!link) return;
      const keepsStation = stationMemberships(state.station).some((membership) => membership.lineId === lineId);
      const targetStation = keepsStation ? state.station : index.lines.get(lineId)?.nodeIds?.[0];
      if (targetStation) link.href = mapStateHref(lineId, targetStation);
      if (active) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  function stationItem(stationId, position, total) {
    const station = index.stations.get(stationId);
    const memberships = stationMemberships(stationId);
    const selected = stationId === state.station;
    const item = element("li", `learning-station${memberships.length > 1 ? " is-transfer" : ""}${selected ? " is-selected" : ""}`);
    item.dataset.learningStationItem = stationId;
    item.id = `station-${stationId}`;
    const link = element("a");
    link.href = mapStateHref(state.line, stationId);
    link.dataset.learningStation = stationId;
    if (selected) link.setAttribute("aria-current", "step");
    const marker = element("span", "learning-station-marker");
    marker.setAttribute("aria-hidden", "true");
    marker.append(element("i"));
    link.append(
      marker,
      element("span", "learning-station-order", String(position + 1).padStart(2, "0")),
      element("strong", "", station.title),
      element("span", "", `${categoryLabels[station.category] || station.category}${memberships.length > 1 ? ` · 환승 ${memberships.length}개 노선` : ""}`)
    );
    link.setAttribute("aria-label", `${position + 1}/${total} ${station.title}${memberships.length > 1 ? `, 환승역 ${memberships.length}개 노선` : ""}`);
    item.append(link);
    return item;
  }

  function renderStations({ focusStation = false } = {}) {
    const line = index.lines.get(state.line);
    stationList.replaceChildren(...line.nodeIds.map((stationId, position) => stationItem(stationId, position, line.nodeIds.length)));
    const selected = stationList.querySelector(`[data-learning-station="${CSS.escape(state.station)}"]`);
    if (selected) {
      const selectedItem = selected.closest("[data-learning-station-item]") || selected;
      const vertical = mobileLayout.matches;
      if (focusStation) selected.focus({ preventScroll: true });
      if (vertical) {
        if (focusStation) {
          selectedItem.scrollIntoView({
            block: "center",
            inline: "nearest",
            behavior: reduceMotion ? "auto" : "smooth"
          });
        }
      } else {
        const centeredLeft = selectedItem.offsetLeft - (stripViewport.clientWidth - selectedItem.offsetWidth) / 2;
        stripViewport.scrollTo({ left: Math.max(0, centeredLeft), top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      }
    }
  }

  function adjacentLink(station, label) {
    if (!station) {
      const boundary = element("span");
      boundary.append(element("span", "", label), document.createTextNode(label === "이전 역" ? "노선의 시작" : "노선의 끝"));
      return boundary;
    }
    const link = element("a");
    link.href = mapStateHref(state.line, station.id);
    link.dataset.learningAdjacent = station.id;
    link.append(element("span", "", label), document.createTextNode(station.title));
    return link;
  }

  function renderInspector() {
    const line = index.lines.get(state.line);
    const station = index.stations.get(state.station);
    const memberships = stationMemberships(state.station);
    const position = line.nodeIds.indexOf(state.station);
    const previous = position > 0 ? index.stations.get(line.nodeIds[position - 1]) : null;
    const next = position < line.nodeIds.length - 1 ? index.stations.get(line.nodeIds[position + 1]) : null;

    const copy = element("div", "learning-station-copy");
    copy.append(
      element("p", "", `STATION ${String(position + 1).padStart(2, "0")} / ${String(line.nodeIds.length).padStart(2, "0")}`),
      element("span", "", categoryLabels[station.category] || station.category)
    );
    const heading = element("h2", "", station.title);
    heading.id = "learning-station-title";
    copy.append(heading, element("p", "", station.summary));
    const flags = element("div", "learning-station-flags");
    flags.append(
      element("span", "", memberships.length > 1 ? `환승역 · ${memberships.length}개 노선` : "일반역"),
      element("span", "", {
        active: "검증됨",
        review: "검토 중",
        draft: "초안",
        archived: "보관"
      }[station.status] || station.status || "상태 미기록")
    );
    const actions = element("div", "learning-station-actions");
    const read = element("a", "", "문서 읽기 →");
    read.href = safeHref(station.url);
    const connect = element("a", "", "이 역에서 연결 찾기 ↔");
    connect.href = mapHref(`/map/?from=${encodeURIComponent(station.id)}`);
    actions.append(read, connect);
    copy.append(flags, actions);

    const adjacent = element("nav", "learning-adjacent");
    adjacent.setAttribute("aria-label", "현재 노선의 이전·다음 역");
    adjacent.append(adjacentLink(previous, "이전 역"), adjacentLink(next, "다음 역"));

    const transfers = element("aside", "learning-transfers");
    const transferHeading = element("h3", "", "이 역의 노선");
    transferHeading.id = "learning-transfer-title";
    transfers.setAttribute("aria-labelledby", transferHeading.id);
    transfers.append(
      transferHeading,
      element("p", "", memberships.length > 1 ? "같은 역을 유지한 채 다른 학습 흐름으로 갈아탑니다." : "현재는 이 노선에만 포함된 역입니다.")
    );
    const transferList = element("ol");
    memberships.forEach((membership) => {
      const transferLine = index.lines.get(membership.lineId);
      const item = element("li");
      const link = element("a");
      link.href = mapStateHref(transferLine.id, state.station);
      link.dataset.learningTransferLine = transferLine.id;
      if (transferLine.id === state.line) link.setAttribute("aria-current", "true");
      link.append(
        element("span", "", codeFor(transferLine.id)),
        element("strong", "", transferLine.title),
        element("small", "", `${membership.step}/${membership.total}`)
      );
      item.append(link);
      transferList.append(item);
    });
    transfers.append(transferList);
    inspector.replaceChildren(copy, adjacent, transfers);
    inspector.setAttribute("aria-labelledby", heading.id);
  }

  function render(options = {}) {
    const line = index.lines.get(state.line);
    lineCode.textContent = codeFor(line.id);
    lineTitle.textContent = line.title;
    lineDescription.textContent = line.description;
    lineStationCount.textContent = String(line.stationCount || line.nodeIds.length);
    lineTransferCount.textContent = String(line.transferStations || 0);
    updateLineBoard();
    renderStations(options);
    renderInspector();
  }

  function stateMessage(reason) {
    const line = index.lines.get(state.line);
    const station = index.stations.get(state.station);
    if (reason === "station-only") return `${station.title} 역이 속한 ${line.title} 노선을 열었습니다.`;
    if (reason === "line-only") return `${line.title} 노선의 첫 역부터 표시합니다.`;
    if (reason === "line-station-mismatch") return `${station.title} 역이 실제로 속한 ${line.title} 노선으로 바로잡았습니다.`;
    if (["invalid-line", "invalid-station", "invalid-state"].includes(reason)) {
      return `주소의 노선 또는 역을 찾지 못해 ${line.title} 노선, ${station.title} 역으로 바로잡았습니다.`;
    }
    const memberships = stationMemberships(station.id).length;
    return `${line.title} 노선의 ${station.title} 역을 선택했습니다.${memberships > 1 ? ` ${memberships}개 노선으로 환승할 수 있습니다.` : ""}`;
  }

  function applyState(nextState, { history = "replaceState", focusStation = false, announce = true } = {}) {
    let normalized = normalizeLearningMapState(index, nextState);
    const requestedLineValid = index.lines.has(String(nextState.line || "").trim());
    const requestedStationValid = index.stations.has(String(nextState.station || "").trim());
    if (!requestedLineValid && !requestedStationValid && ["invalid-line", "invalid-station", "invalid-state"].includes(normalized.reason)) {
      const fallback = normalizeLearningMapState(index, {
        line: map.dataset.defaultLine,
        station: map.dataset.defaultStation
      });
      normalized = { ...fallback, corrected: true, reason: normalized.reason };
    }
    state = { line: normalized.line, station: normalized.station };
    render({ focusStation });
    syncUrl(history);
    if (announce) setStatus(stateMessage(normalized.reason));
  }

  function selectLine(lineId) {
    const keepsStation = stationMemberships(state.station).some((membership) => membership.lineId === lineId);
    const stationId = keepsStation ? state.station : index.lines.get(lineId)?.nodeIds?.[0];
    applyState({ line: lineId, station: stationId }, { history: "pushState", announce: true });
  }

  function selectStation(stationId, { focusStation = true } = {}) {
    applyState({ line: state.line, station: stationId }, { history: "pushState", focusStation, announce: true });
  }

  map.addEventListener("click", (event) => {
    if (!index) return;
    const lineLink = event.target.closest("[data-learning-line]");
    if (lineLink) {
      event.preventDefault();
      selectLine(lineLink.dataset.learningLine);
      return;
    }
    const stationLink = event.target.closest("[data-learning-station]");
    if (stationLink) {
      event.preventDefault();
      selectStation(stationLink.dataset.learningStation);
      return;
    }
    const adjacentLink = event.target.closest("[data-learning-adjacent]");
    if (adjacentLink) {
      event.preventDefault();
      selectStation(adjacentLink.dataset.learningAdjacent);
      return;
    }
    const transferLink = event.target.closest("[data-learning-transfer-line]");
    if (transferLink) {
      event.preventDefault();
      applyState({ line: transferLink.dataset.learningTransferLine, station: state.station }, {
        history: "pushState",
        focusStation: true,
        announce: true
      });
    }
  });

  map.addEventListener("keydown", (event) => {
    if (!index) return;
    const lineLink = event.target.closest("[data-learning-line]");
    if (lineLink && ["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
      const links = [...map.querySelectorAll("[data-learning-line]")];
      const current = links.indexOf(lineLink);
      if (current < 0) return;
      event.preventDefault();
      let next = current;
      if (event.key === "ArrowUp") next = (current - 1 + links.length) % links.length;
      if (event.key === "ArrowDown") next = (current + 1) % links.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = links.length - 1;
      links[next].focus();
      links[next].click();
      return;
    }
    const stationLink = event.target.closest("[data-learning-station]");
    if (!stationLink || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    const links = [...stationList.querySelectorAll("[data-learning-station]")];
    const current = links.indexOf(stationLink);
    if (current < 0) return;
    event.preventDefault();
    let next = current;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = Math.max(0, current - 1);
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = Math.min(links.length - 1, current + 1);
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = links.length - 1;
    selectStation(links[next].dataset.learningStation, { focusStation: true });
  });

  window.addEventListener("popstate", () => {
    if (!index) return;
    const url = new URL(window.location.href);
    applyState({ line: url.searchParams.get("line"), station: url.searchParams.get("station") }, {
      history: "replaceState",
      focusStation: false,
      announce: true
    });
  });

  fetch(map.dataset.learningMapUrl, { cache: "force-cache" })
    .then((response) => {
      if (!response.ok) throw new Error(`Learning map request failed: ${response.status}`);
      return response.json();
    })
    .then((payload) => {
      index = createLearningMapIndex(payload);
      const url = new URL(window.location.href);
      const hasLine = url.searchParams.has("line");
      const hasStation = url.searchParams.has("station");
      const requestedLine = hasLine ? url.searchParams.get("line") : hasStation ? "" : map.dataset.defaultLine;
      const requestedStation = hasStation ? url.searchParams.get("station") : hasLine ? "" : map.dataset.defaultStation;
      applyState({ line: requestedLine, station: requestedStation }, { history: "replaceState", announce: true });
      map.setAttribute("aria-busy", "false");
    })
    .catch(() => {
      map.setAttribute("aria-busy", "false");
      setStatus("학습 노선 데이터를 불러오지 못했습니다. 현재 보이는 노선과 역 링크는 계속 사용할 수 있습니다.");
    });
}
