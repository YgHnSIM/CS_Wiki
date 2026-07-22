(() => {
  const explorer = document.querySelector("[data-relationship-explorer]");
  const source = document.querySelector("#local-graph-data");
  if (!explorer || !source) return;

  const data = JSON.parse(source.textContent);
  const visual = explorer.querySelector("[data-relationship-visual]");
  const list = explorer.querySelector("[data-relationship-list]");
  const mapDisclosure = explorer.querySelector("[data-relationship-map]");
  const status = explorer.querySelector("[data-relationship-status]");
  const viewTitle = explorer.querySelector("[data-relationship-view-title]");
  const viewDescription = explorer.querySelector("[data-relationship-view-description]");
  const inspector = explorer.querySelector("[data-relationship-inspector]");
  const inspectorLabel = inspector?.querySelector("[data-inspector-label]");
  const inspectorStatement = inspector?.querySelector("[data-inspector-statement]");
  const inspectorDetail = inspector?.querySelector("[data-inspector-detail]");
  const inspectorLink = inspector?.querySelector("[data-inspector-link]");
  const channelButtons = [...explorer.querySelectorAll("[data-relationship-channel]")];
  const graphTemplates = new Map([...explorer.querySelectorAll("template[data-local-graph-view]")]
    .map((template) => [template.dataset.localGraphView, template]));
  const listTemplates = new Map([...explorer.querySelectorAll("template[data-relationship-list-view]")]
    .map((template) => [template.dataset.relationshipListView, template]));
  let activeView = data.defaultView || "core";
  let activeId = "";

  function recordsFor(view = activeView) {
    return data.views[view] || [];
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
    inspectorLabel.textContent = record.label;
    inspectorStatement.textContent = record.statement;
    inspectorDetail.textContent = record.detail;
    inspectorLink.href = record.url;
    inspectorLink.textContent = `${record.title} 읽기`;
  }

  function highlight(id) {
    explorer.classList.toggle("has-relationship-selection", Boolean(id));
    explorer.querySelectorAll("[data-neighbor-id]").forEach((element) => {
      element.classList.toggle("is-active", element.dataset.neighborId === id);
    });
    selectionButtons().forEach((button) => {
      button.hidden = !mapDisclosure?.open;
      button.setAttribute("aria-pressed", String(button.dataset.neighborId === id));
    });
  }

  function selectRecord(id, { announce = true, updateHistory = true } = {}) {
    const records = recordsFor();
    const record = records.find((item) => item.id === id) || records[0];
    if (!record) {
      activeId = "";
      highlight("");
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
    const listTemplate = listTemplates.get(activeView);
    if (graphTemplate && visual) visual.replaceChildren(graphTemplate.content.cloneNode(true));
    if (listTemplate && list) list.replaceChildren(listTemplate.content.cloneNode(true));
    channelButtons.forEach((button) => {
      const selected = button.dataset.relationshipChannel === activeView;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    const activeButton = channelButtons.find((button) => button.dataset.relationshipChannel === activeView);
    if (viewTitle) viewTitle.textContent = `${activeButton?.querySelector("span")?.textContent || "연결"} 연결`;
    if (viewDescription) viewDescription.textContent = activeButton?.querySelector("small")?.textContent || "";
    const records = recordsFor();
    const next = records.some((record) => record.id === preferredId) ? preferredId : records[0]?.id || "";
    selectRecord(next, { announce: false, updateHistory });
    if (announce && status) status.textContent = `${records.length}개 표시`;
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
    if (event.key === "Escape") {
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
    const validNeighbor = !neighbor || data.views[validView]?.some((record) => record.id === neighbor);
    renderView(validView, neighbor, { updateHistory, announce: false });
    if (!updateHistory && (requestedView !== validView || !validNeighbor)) {
      updateUrl({ view: activeView, neighbor: neighbor ? activeId : "" });
    }
  }

  window.addEventListener("popstate", () => restoreFromUrl({ updateHistory: false }));
  restoreFromUrl();
})();
