(() => {
  const explorer = document.querySelector("[data-relationship-explorer]");
  const source = document.querySelector("#local-graph-data");
  if (!explorer || !source) return;

  const data = JSON.parse(source.textContent);
  const filter = explorer.querySelector("[data-relationship-filter]");
  const filterControl = explorer.querySelector("[data-relationship-filter-control]");
  const visual = explorer.querySelector("[data-relationship-visual]");
  const mapDisclosure = explorer.querySelector("[data-relationship-map]");
  const status = explorer.querySelector("[data-relationship-status]");
  const inspector = explorer.querySelector("[data-relationship-inspector]");
  const inspectorLabel = inspector?.querySelector("[data-inspector-label]");
  const inspectorStatement = inspector?.querySelector("[data-inspector-statement]");
  const inspectorDetail = inspector?.querySelector("[data-inspector-detail]");
  const inspectorLink = inspector?.querySelector("[data-inspector-link]");
  const templates = new Map([...explorer.querySelectorAll("template[data-local-graph-view]")]
    .map((template) => [template.dataset.localGraphView, template]));
  const candidateIds = new Set(Object.values(data.views).flat().map((record) => record.id));
  const selectionButtons = [...explorer.querySelectorAll("[data-relationship-select]")];
  let activeView = "all";
  let activeId = "";

  selectionButtons.forEach((button) => {
    if (candidateIds.has(button.dataset.neighborId)) button.hidden = false;
  });
  if (filterControl) filterControl.hidden = false;

  function recordsFor(view = activeView) {
    return data.views[view] || [];
  }

  function updateUrl({ view = activeView, neighbor = activeId } = {}) {
    const url = new URL(window.location.href);
    if (view && view !== "all") url.searchParams.set("relation", view);
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
    selectionButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.neighborId === id));
    });
  }

  function selectRecord(id, { announce = true, updateHistory = true } = {}) {
    const records = recordsFor();
    const record = records.find((item) => item.id === id) || records[0];
    if (!record) return;
    activeId = record.id;
    highlight(activeId);
    updateInspector(record);
    if (announce && status) status.textContent = `${record.title} · ${record.label}`;
    if (updateHistory) updateUrl();
  }

  function renderView(view, preferredId = activeId, { updateHistory = true, announce = true } = {}) {
    activeView = data.views[view] ? view : "all";
    const template = templates.get(activeView);
    if (template && visual) visual.replaceChildren(template.content.cloneNode(true));
    if (filter) filter.value = activeView === "all" ? "" : activeView;
    const records = recordsFor();
    const next = records.some((record) => record.id === preferredId) ? preferredId : records[0]?.id;
    selectRecord(next, { announce: false, updateHistory });
    if (announce && status && records.length) status.textContent = `${records.length}개 대표 문서 · ${records.find((record) => record.id === activeId)?.title || ""}`;
  }

  function viewContaining(id, preferred = "") {
    if (preferred && data.views[preferred]?.some((record) => record.id === id)) return preferred;
    if (recordsFor().some((record) => record.id === id)) return activeView;
    return Object.keys(data.views).find((view) => data.views[view].some((record) => record.id === id)) || "all";
  }

  filter?.addEventListener("change", () => renderView(filter.value || "all"));

  explorer.addEventListener("click", (event) => {
    const node = event.target.closest("[data-local-node]");
    if (node) {
      selectRecord(node.dataset.neighborId);
      return;
    }
    const button = event.target.closest("[data-relationship-select]");
    if (!button) return;
    const id = button.dataset.neighborId;
    const record = explorer.querySelector(`[data-relationship-record][data-neighbor-id="${CSS.escape(id)}"]`);
    const preferred = record?.dataset.buckets?.split(" ").find((bucket) => data.views[bucket]?.some((item) => item.id === id)) || "";
    const view = viewContaining(id, preferred);
    if (view !== activeView) renderView(view, id);
    else selectRecord(id);
    mapDisclosure?.setAttribute("open", "");
  });

  explorer.addEventListener("keydown", (event) => {
    const button = event.target.closest("[data-relationship-select]");
    if (button && ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      const available = selectionButtons.filter((item) => !item.hidden && !item.closest("details:not([open])"));
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
      filter?.focus();
      if (status) status.textContent = "관계 선택을 해제했습니다.";
    }
  });

  const compactMedia = window.matchMedia("(max-width: 860px)");
  if (compactMedia.matches) mapDisclosure?.removeAttribute("open");
  compactMedia.addEventListener("change", (event) => {
    if (event.matches) mapDisclosure?.removeAttribute("open");
    else mapDisclosure?.setAttribute("open", "");
  });

  function restoreFromUrl({ updateHistory = false } = {}) {
    const url = new URL(window.location.href);
    const requestedView = url.searchParams.get("relation") || "all";
    const neighbor = url.searchParams.get("neighbor") || "";
    const validView = data.views[requestedView] ? requestedView : "all";
    const validNeighbor = !neighbor || data.views[validView]?.some((record) => record.id === neighbor);
    renderView(validView, neighbor, { updateHistory, announce: false });
    if (!updateHistory && (requestedView !== validView || !validNeighbor)) {
      updateUrl({ view: activeView, neighbor: neighbor ? activeId : "" });
    }
  }

  window.addEventListener("popstate", () => restoreFromUrl({ updateHistory: false }));
  restoreFromUrl();
})();
