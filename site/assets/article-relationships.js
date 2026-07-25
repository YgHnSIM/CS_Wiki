(() => {
  const explorer = document.querySelector("[data-relationship-explorer]");
  const source = document.querySelector("#local-graph-data");
  if (!explorer || !source) return;

  const data = JSON.parse(source.textContent);
  const visual = explorer.querySelector("[data-relationship-visual]");
  const list = explorer.querySelector("[data-relationship-list]");
  const mapDisclosure = explorer.querySelector("[data-relationship-map]");
  const status = explorer.querySelector("[data-relationship-status]");
  const listToggle = explorer.querySelector("[data-relationship-toggle]");
  const viewTitle = explorer.querySelector("[data-relationship-view-title]");
  const viewDescription = explorer.querySelector("[data-relationship-view-description]");
  const inspector = explorer.querySelector("[data-relationship-inspector]");
  const inspectorLabel = inspector?.querySelector("[data-inspector-label]");
  const inspectorStatement = inspector?.querySelector("[data-inspector-statement]");
  const inspectorDetail = inspector?.querySelector("[data-inspector-detail]");
  const inspectorLink = inspector?.querySelector("[data-inspector-link]");
  const channelButtons = [...explorer.querySelectorAll("[data-relationship-channel]")];
  let relationshipPanel = explorer.querySelector("[data-relationship-panel]")
    || list?.closest?.("[role=tabpanel]");
  const graphTemplates = new Map([...explorer.querySelectorAll("template[data-local-graph-view]")]
    .map((template) => [template.dataset.localGraphView, template]));
  const listTemplates = new Map([...explorer.querySelectorAll("template[data-relationship-list-view]")]
    .map((template) => [template.dataset.relationshipListView, template]));
  let activeView = data.defaultView || "core";
  let activeId = "";
  const expandedViews = new Set();

  if (!relationshipPanel && list) {
    relationshipPanel = document.createElement("section");
    relationshipPanel.dataset.relationshipPanel = "";
    const listHeading = explorer.querySelector(".relationship-list-heading");
    (listHeading || list).before(relationshipPanel);
    if (listHeading) relationshipPanel.append(listHeading);
    relationshipPanel.append(list);
    if (mapDisclosure) relationshipPanel.append(mapDisclosure);
  }

  if (relationshipPanel) {
    if (!relationshipPanel.id) relationshipPanel.id = "relationship-channel-panel";
    relationshipPanel.setAttribute("role", "tabpanel");
  }

  channelButtons.forEach((button) => {
    const channel = button.dataset.relationshipChannel;
    if (!button.id) button.id = `relationship-tab-${channel}`;
    button.setAttribute("role", "tab");
    if (relationshipPanel) button.setAttribute("aria-controls", relationshipPanel.id);
    button.removeAttribute("aria-pressed");
  });

  function previewRecordsFor(view = activeView) {
    return data.views?.[view] || [];
  }

  function allRecordsFor(view = activeView) {
    return data.allViews?.[view] || previewRecordsFor(view);
  }

  function recordsFor(view = activeView) {
    return expandedViews.has(view) ? allRecordsFor(view) : previewRecordsFor(view);
  }

  function relationshipRecordElement(record) {
    const item = document.createElement("li");
    item.className = "relationship-record";
    item.dataset.relationshipRecord = "";
    item.dataset.neighborId = record.id;
    item.dataset.channel = record.channel;

    const heading = document.createElement("div");
    heading.className = "relationship-record-heading";
    const identity = document.createElement("div");
    const chip = document.createElement("span");
    chip.className = "relation-chip";
    if (record.channel) chip.classList.add(record.channel);
    chip.textContent = record.label;
    const link = document.createElement("a");
    link.href = record.url;
    link.textContent = record.title;
    identity.append(chip, link);

    const select = document.createElement("button");
    select.type = "button";
    select.hidden = true;
    select.dataset.relationshipSelect = "";
    select.dataset.neighborId = record.id;
    select.setAttribute("aria-pressed", "false");
    select.textContent = "지도에서 강조";
    heading.append(identity, select);

    const detail = document.createElement("p");
    detail.textContent = record.detail;
    item.append(heading, detail);
    return item;
  }

  function renderRelationshipList(view) {
    if (!list) return;
    const records = recordsFor(view);
    const preview = previewRecordsFor(view);
    const listTemplate = listTemplates.get(view);
    if (!expandedViews.has(view) && listTemplate) {
      list.replaceChildren(listTemplate.content.cloneNode(true));
    } else if (records.length) {
      list.replaceChildren(...records.map(relationshipRecordElement));
    } else {
      const empty = document.createElement("li");
      empty.className = "relationship-empty";
      empty.textContent = "이 채널에는 표시할 연결이 없습니다.";
      list.replaceChildren(empty);
    }

    if (!listToggle) return;
    const total = allRecordsFor(view).length;
    const canToggle = total > preview.length;
    const expanded = canToggle && expandedViews.has(view);
    listToggle.hidden = !canToggle;
    listToggle.setAttribute("aria-controls", list.id);
    listToggle.setAttribute("aria-expanded", String(expanded));
    listToggle.textContent = expanded
      ? `처음 ${preview.length}개만 보기`
      : `나머지 ${total - preview.length}개 보기`;
  }

  function updateCountStatus(view = activeView) {
    if (!status) return;
    const shown = recordsFor(view).length;
    const total = allRecordsFor(view).length;
    status.textContent = total
      ? `${shown}/${total}개 표시`
      : `${channelButtons.find((button) => button.dataset.relationshipChannel === view)?.querySelector("span")?.textContent || "선택한"} 채널에는 표시할 연결이 없습니다.`;
  }

  function selectionButtons() {
    return [...explorer.querySelectorAll("[data-relationship-select]")];
  }

  function updateUrl({ view = activeView, neighbor = activeId } = {}) {
    const url = new URL(window.location.href);
    if (view && view !== data.defaultView) url.searchParams.set("relation", view);
    else url.searchParams.delete("relation");
    if (neighbor) url.searchParams.set("neighbor", neighbor);
    else url.searchParams.delete("neighbor");
    window.history.replaceState({}, "", url);
  }

  function updateInspector(record) {
    if (!record || !inspector) return;
    inspector.hidden = false;
    inspectorLabel.textContent = record.label;
    inspectorStatement.textContent = record.statement;
    inspectorDetail.textContent = record.detail;
    inspectorLink.href = record.url;
    inspectorLink.textContent = `${record.title} 읽기`;
    inspectorLink.hidden = false;
  }

  function clearInspector(view) {
    if (!inspector) return;
    const activeButton = channelButtons.find((button) => button.dataset.relationshipChannel === view);
    const label = activeButton?.querySelector("span")?.textContent || "선택한";
    if (inspectorLabel) inspectorLabel.textContent = `${label} 채널`;
    if (inspectorStatement) inspectorStatement.textContent = "표시할 연결이 없습니다.";
    if (inspectorDetail) inspectorDetail.textContent = "다른 연결 채널을 선택해 주세요.";
    if (inspectorLink) {
      inspectorLink.hidden = true;
      inspectorLink.removeAttribute("href");
    }
  }

  function highlight(id) {
    explorer.classList.toggle("has-relationship-selection", Boolean(id));
    explorer.querySelectorAll("[data-neighbor-id]").forEach((element) => {
      element.classList.toggle("is-active", element.dataset.neighborId === id);
    });
    selectionButtons().forEach((button) => {
      const hasMapNode = previewRecordsFor().some((record) => record.id === button.dataset.neighborId);
      button.hidden = !mapDisclosure?.open || !hasMapNode;
      button.setAttribute("aria-pressed", String(button.dataset.neighborId === id));
    });
  }

  function selectRecord(id, { announce = true, updateHistory = true } = {}) {
    const records = recordsFor();
    const record = records.find((item) => item.id === id) || records[0];
    if (!record) {
      activeId = "";
      highlight("");
      clearInspector(activeView);
      return;
    }
    activeId = record.id;
    highlight(activeId);
    updateInspector(record);
    if (announce && status) status.textContent = `${record.title} · ${record.label}`;
    if (updateHistory) updateUrl();
  }

  function renderView(view, preferredId = "", { updateHistory = true, announce = true } = {}) {
    activeView = data.views[view] ? view : data.defaultView;
    const graphTemplate = graphTemplates.get(activeView);
    if (graphTemplate && visual) visual.replaceChildren(graphTemplate.content.cloneNode(true));
    renderRelationshipList(activeView);
    channelButtons.forEach((button) => {
      const selected = button.dataset.relationshipChannel === activeView;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    const activeButton = channelButtons.find((button) => button.dataset.relationshipChannel === activeView);
    if (relationshipPanel && activeButton) relationshipPanel.setAttribute("aria-labelledby", activeButton.id);
    if (viewTitle) viewTitle.textContent = `${activeButton?.querySelector("span")?.textContent || "연결"} 연결`;
    if (viewDescription) viewDescription.textContent = activeButton?.querySelector("small")?.textContent || "";
    const records = recordsFor();
    if (mapDisclosure) {
      if (!records.length) mapDisclosure.removeAttribute("open");
      mapDisclosure.hidden = !records.length;
    }
    const next = records.some((record) => record.id === preferredId) ? preferredId : records[0]?.id || "";
    selectRecord(next, { announce: false, updateHistory });
    updateCountStatus(activeView);
  }

  channelButtons.forEach((button) => {
    button.addEventListener("click", () => renderView(button.dataset.relationshipChannel));
    button.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const current = channelButtons.indexOf(button);
      let next = current;
      if (event.key === "ArrowLeft") next = (current - 1 + channelButtons.length) % channelButtons.length;
      if (event.key === "ArrowRight") next = (current + 1) % channelButtons.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = channelButtons.length - 1;
      channelButtons[next].focus();
      channelButtons[next].click();
    });
  });
  listToggle?.addEventListener("click", () => {
    if (expandedViews.has(activeView)) expandedViews.delete(activeView);
    else expandedViews.add(activeView);
    renderView(activeView, activeId, { updateHistory: false, announce: false });
    updateCountStatus(activeView);
    listToggle.focus();
  });
  mapDisclosure?.addEventListener("toggle", () => highlight(activeId));

  explorer.addEventListener("click", (event) => {
    const node = event.target.closest("[data-local-node]");
    if (node) {
      selectRecord(node.dataset.neighborId);
      return;
    }
    const button = event.target.closest("[data-relationship-select]");
    if (!button) return;
    selectRecord(button.dataset.neighborId);
    mapDisclosure?.setAttribute("open", "");
  });

  explorer.addEventListener("keydown", (event) => {
    const button = event.target.closest("[data-relationship-select]");
    if (button && ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      const available = selectionButtons().filter((item) => !item.hidden);
      const current = available.indexOf(button);
      if (current < 0 || !available.length) return;
      event.preventDefault();
      let next = current;
      if (event.key === "ArrowDown") next = (current + 1) % available.length;
      if (event.key === "ArrowUp") next = (current - 1 + available.length) % available.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = available.length - 1;
      available[next].focus();
      available[next].click();
    }
    if (event.key === "Escape" && activeId) {
      activeId = "";
      highlight("");
      updateUrl({ neighbor: "" });
      channelButtons.find((item) => item.dataset.relationshipChannel === activeView)?.focus();
      if (status) status.textContent = "관계 선택을 해제했습니다.";
    }
  });

  function restoreFromUrl({ updateHistory = false } = {}) {
    const url = new URL(window.location.href);
    const requestedView = url.searchParams.get("relation") || data.defaultView;
    const neighbor = url.searchParams.get("neighbor") || "";
    const validView = data.views[requestedView] ? requestedView : data.defaultView;
    const validNeighbor = !neighbor || allRecordsFor(validView).some((record) => record.id === neighbor);
    if (neighbor && validNeighbor && !previewRecordsFor(validView).some((record) => record.id === neighbor)) {
      expandedViews.add(validView);
    }
    renderView(validView, neighbor, { updateHistory, announce: false });
    if (!updateHistory && (requestedView !== validView || !validNeighbor)) {
      updateUrl({ view: activeView, neighbor: neighbor ? activeId : "" });
    }
  }

  window.addEventListener("popstate", () => restoreFromUrl({ updateHistory: false }));
  restoreFromUrl();
})();
