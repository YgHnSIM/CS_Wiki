const stateModuleUrl = new URL("./history-state.js", import.meta.url);
stateModuleUrl.searchParams.set("v", globalThis.window?.CS_WIKI_ASSET_VERSION || "1");
const {
  HISTORY_LANE_ORDER,
  createHistoryLruCache,
  historyHistoryEntry,
  historyKeyboardTarget,
  historyLookupShardAsset,
  historyLookupShardAssets,
  historyManifestAsset,
  historyTransitionDetailAssets,
  historyPageUrlFor,
  historyStateFromHistory,
  historyUrlFor,
  matchesHistoryFilters,
  normalizeHistoryPayloadVersion,
  normalizeHistoryQuery,
  parseHistoryPageUrl,
  parseHistoryUrl,
  searchHistoryEvents,
  sortHistoryEvents
} = await import(stateModuleUrl);

const TARGET_KEYS = Object.freeze(["transition", "event", "part", "era"]);
const FILTER_KEYS = Object.freeze(["layer", "capability", "display"]);
const TRANSITION_LIMIT = 96;
const TYPE_ORDER = Object.freeze({ response: 0, enablement: 1, precedes: 2, constraint: 3 });

const LANE_LABELS = Object.freeze({
  theory: "이론",
  machine: "기계",
  architecture: "아키텍처",
  software: "소프트웨어",
  system: "시스템",
  service: "서비스",
  measurement: "측정",
  unclassified: "층위 미분류"
});

const RELATION_LABELS = Object.freeze({
  responds_to: "문제에 대응함",
  enables: "가능하게 함",
  constrains: "제약함",
  precedes: "역사적으로 앞섬"
});

function values(value) {
  if (value instanceof Set) return [...value];
  return Array.isArray(value) ? value : value === undefined || value === null ? [] : [value];
}

function text(value = "") {
  return String(value ?? "").normalize("NFKC").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
}

function normalizedId(value = "") {
  return text(value).toLocaleLowerCase("ko-KR");
}

function positiveLimit(value, fallback) {
  const number = Math.floor(Number(value));
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function recordId(record) {
  return normalizedId(record?.id ?? record?.eventId ?? record?.transitionId);
}

function numericYear(value) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizedTime(record = {}) {
  const source = record.time && typeof record.time === "object" ? record.time : {};
  const eventStart = numericYear(source.eventStart ?? source.event_start ?? record.eventStart ?? record.event_start);
  const eventEnd = numericYear(source.eventEnd ?? source.event_end ?? record.eventEnd ?? record.event_end);
  const publicationYear = numericYear(source.publicationYear ?? source.publication_year ?? record.publicationYear ?? record.publication_year);
  const explicitAnchor = numericYear(source.anchorYear ?? source.anchor_year ?? record.anchorYear ?? record.anchor_year);
  const anchorYear = explicitAnchor ?? eventStart ?? eventEnd ?? publicationYear;
  const status = text(source.status || record.timeStatus || (eventStart !== null || eventEnd !== null || explicitAnchor !== null
    ? "event" : publicationYear !== null ? "publication" : "undated")).toLocaleLowerCase("en-US");
  let shape = text(source.shape || record.timeShape).toLocaleLowerCase("en-US");
  if (!shape) {
    if (status === "undated") shape = "unknown";
    else if (eventStart !== null && eventEnd !== null && eventStart !== eventEnd) shape = "range";
    else shape = "point";
  }
  return {
    ...source,
    status,
    shape,
    eventStart,
    eventEnd,
    publicationYear,
    anchorYear,
    note: text(source.note || record.timeNote) || null,
    primaryPeriodId: normalizedId(source.primaryPeriodId || source.primary_period_id || record.primaryPeriodId),
    overlapPeriodIds: values(source.overlapPeriodIds || source.overlap_period_ids).map(normalizedId).filter(Boolean)
  };
}

function normalizeEvent(record = {}) {
  const time = normalizedTime(record);
  const lane = normalizedId(record.lane || record.historicalLayer || record.historical?.layer) || "unclassified";
  return {
    ...record,
    id: recordId(record),
    kind: record.kind === "transition" ? "transition" : "event",
    title: text(record.title || record.label || recordId(record)),
    aliases: values(record.aliases).map(text).filter(Boolean),
    summary: text(record.summary),
    lane,
    historicalLayer: lane,
    capabilityLayers: values(record.capabilityLayers || record.capabilities).map(normalizedId).filter(Boolean),
    anchorYear: time.anchorYear,
    eventStart: time.eventStart,
    eventEnd: time.eventEnd,
    publicationYear: time.publicationYear,
    time,
    location: record.location && typeof record.location === "object" ? { ...record.location } : record.location || null
  };
}

function normalizeRole(role) {
  if (Array.isArray(role)) return role.map(normalizeEvent).filter((record) => record.id);
  return role && typeof role === "object" ? normalizeEvent(role) : null;
}

function normalizeTransition(record = {}) {
  const roles = Object.fromEntries(Object.entries(record.roles || {}).map(([key, role]) => [key, normalizeRole(role)]));
  const roleEvents = Object.values(roles).flatMap((role) => Array.isArray(role) ? role : role ? [role] : []);
  const lanes = values(record.lanes).map(normalizedId).filter(Boolean);
  return {
    ...record,
    id: recordId(record),
    kind: "transition",
    title: text(record.title) || roleEvents.map((event) => event.title).filter(Boolean).join(" → "),
    type: normalizedId(record.type) || "response",
    completeness: normalizedId(record.completeness) === "complete" ? "complete" : "partial",
    roles,
    roleNodeIds: values(record.roleNodeIds).map(normalizedId).filter(Boolean),
    lanes: lanes.length ? lanes : [...new Set(roleEvents.map((event) => event.lane).filter(Boolean))],
    historicalLayer: lanes[0] || roleEvents[0]?.lane || "",
    capabilityLayers: values(record.capabilityLayers).map(normalizedId).filter(Boolean),
    anchorYear: numericYear(record.anchorYear),
    edges: values(record.edges).filter(Boolean).map((edge) => ({
      ...edge,
      id: normalizedId(edge.id),
      kind: normalizedId(edge.kind),
      source: normalizedId(edge.source ?? edge.direction?.from),
      target: normalizedId(edge.target ?? edge.direction?.to),
      direction: {
        from: normalizedId(edge.direction?.from ?? edge.source),
        to: normalizedId(edge.direction?.to ?? edge.target)
      },
      note: text(edge.note || values(edge.notes)[0]) || null,
      notes: values(edge.notes).map(text).filter(Boolean),
      evidence: values(edge.evidence).map(normalizedId).filter(Boolean)
    })),
    location: record.location && typeof record.location === "object" ? { ...record.location } : record.location || null
  };
}

/** Reconstruct one paginated transition without losing role, edge, or evidence records. */
export function mergeHistoryTransitionDetails(summary = {}, pages = []) {
  const transition = normalizeTransition(summary);
  const detail = transition.detail;
  if (detail?.kind !== "paginated") return transition;
  const expectedPages = Number(detail.pageCount);
  const ordered = values(pages).filter(Boolean).sort((left, right) => Number(left.page) - Number(right.page));
  if (!Number.isSafeInteger(expectedPages) || expectedPages < 1 || ordered.length !== expectedPages) {
    throw new Error(`History transition '${transition.id}' detail pages are incomplete`);
  }
  const roleNames = new Set(Object.keys(transition.roles));
  const roleGroups = new Map([...roleNames].map((role) => [role, []]));
  const roleKeys = new Set();
  const edges = [];
  const edgeIds = new Set();
  ordered.forEach((page, index) => {
    if (page.kind !== "history-transition-detail-page" || normalizedId(page.transitionId) !== transition.id
      || Number(page.page) !== index + 1 || Number(page.pageCount) !== expectedPages) {
      throw new Error(`History transition '${transition.id}' detail page sequence is invalid`);
    }
    for (const raw of values(page.roleNodes)) {
      const role = normalizedId(raw?.role);
      const event = normalizeEvent(raw);
      const key = `${role}:${event.id}`;
      if (!roleGroups.has(role) || !event.id || roleKeys.has(key)) {
        throw new Error(`History transition '${transition.id}' has an invalid or duplicate detail role`);
      }
      roleKeys.add(key);
      const { role: _role, ...cleanEvent } = event;
      roleGroups.get(role).push(cleanEvent);
    }
    for (const edge of normalizeTransition({ edges: page.edges }).edges) {
      if (!edge.id || edgeIds.has(edge.id)) {
        throw new Error(`History transition '${transition.id}' has a duplicate detail edge`);
      }
      edgeIds.add(edge.id);
      edges.push(edge);
    }
  });
  const roles = Object.fromEntries([...roleGroups].map(([role, records]) => [
    role,
    Array.isArray(transition.roles[role]) ? records : records[0] || null
  ]));
  const expectedRoles = Number(detail.roleNodeCount ?? transition.roleNodeCount);
  const expectedEdges = Number(detail.edgeCount ?? transition.edgeCount);
  const expectedItems = Number(detail.itemCount);
  if ((Number.isFinite(expectedRoles) && roleKeys.size !== expectedRoles)
    || (Number.isFinite(expectedEdges) && edges.length !== expectedEdges)
    || (Number.isFinite(expectedItems) && roleKeys.size + edges.length !== expectedItems)) {
    throw new Error(`History transition '${transition.id}' detail counts do not match its summary`);
  }
  return normalizeTransition({
    ...transition,
    roles,
    roleNodeIds: [...new Set([...roleGroups.values()].flat().map((record) => record.id))],
    roleNodeCount: roleKeys.size,
    edges,
    edgeCount: edges.length,
    preview: { roleNodeCount: roleKeys.size, edgeCount: edges.length, truncated: false },
    detail: { ...detail, loaded: true }
  });
}

/** Build a bounded inspector view from one cached transition detail page. */
export function historyTransitionDetailPageView(summary = {}, page = {}) {
  const transition = normalizeTransition(summary);
  const pageNumber = Number(page?.page);
  if (transition.detail?.kind !== "paginated" || page?.kind !== "history-transition-detail-page"
    || normalizedId(page.transitionId) !== transition.id || !Number.isSafeInteger(pageNumber) || pageNumber < 1
    || Number(page.pageCount) !== Number(transition.detail.pageCount)) {
    throw new Error(`History transition '${transition.id}' detail page is invalid`);
  }
  const roleGroups = new Map(Object.entries(transition.roles).map(([role, value]) => [
    role,
    Array.isArray(value) ? [...value] : value ? [value] : []
  ]));
  for (const raw of values(page.roleNodes)) {
    const role = normalizedId(raw?.role);
    if (!roleGroups.has(role)) throw new Error(`History transition '${transition.id}' has an unknown detail role`);
    const event = normalizeEvent(raw);
    const { role: _role, ...cleanEvent } = event;
    if (cleanEvent.id && !roleGroups.get(role).some((record) => record.id === cleanEvent.id)) roleGroups.get(role).push(cleanEvent);
  }
  const roles = Object.fromEntries([...roleGroups].map(([role, records]) => [
    role,
    Array.isArray(transition.roles[role]) ? records : records[0] || null
  ]));
  return normalizeTransition({
    ...transition,
    roles,
    roleNodeIds: [...new Set([...roleGroups.values()].flat().map((record) => record.id))],
    edges: page.edges,
    preview: {
      roleNodeCount: values(page.roleNodes).length,
      edgeCount: values(page.edges).length,
      truncated: true
    },
    detail: { ...transition.detail, currentPage: pageNumber, loaded: true }
  });
}

function uniqueRecords(records, normalizer) {
  const normalized = values(records).map(normalizer).filter((record) => record.id);
  return [...new Map(normalized.sort((left, right) => left.id.localeCompare(right.id, "ko")).map((record) => [record.id, record])).values()];
}

function transitionCompare(left, right) {
  const leftUnknown = left.anchorYear === null ? 1 : 0;
  const rightUnknown = right.anchorYear === null ? 1 : 0;
  return leftUnknown - rightUnknown
    || Number(left.anchorYear || 0) - Number(right.anchorYear || 0)
    || (TYPE_ORDER[left.type] ?? 99) - (TYPE_ORDER[right.type] ?? 99)
    || left.title.localeCompare(right.title, "ko")
    || left.id.localeCompare(right.id, "ko");
}

/** Normalize overview, period-page, and lookup payloads to one deterministic shape. */
export function normalizeHistoryView(payload = {}, options = {}) {
  const source = payload && typeof payload === "object" ? payload : {};
  const rawPeriods = values(source.periods || source.eras);
  const eventSource = source.events || source.entries || source.documents || source.view?.events
    || rawPeriods.flatMap((period) => values(period?.sampleEvents));
  const maxTransitions = positiveLimit(options.maxTransitions, TRANSITION_LIMIT);
  const transitions = uniqueRecords(source.transitions || source.view?.transitions, normalizeTransition).sort(transitionCompare);
  const periods = rawPeriods.filter(Boolean).map((period) => ({
    ...period,
    id: normalizedId(period.id || period.slug),
    label: text(period.label || period.title || period.id),
    title: text(period.title || period.label || period.id),
    sampleEvents: sortHistoryEvents(values(period.sampleEvents).map(normalizeEvent))
  })).filter((period) => period.id);
  const events = sortHistoryEvents(uniqueRecords(eventSource, normalizeEvent));
  const visibleTransitions = transitions.slice(0, maxTransitions);
  return {
    ...source,
    periods,
    events,
    entries: events,
    transitions: visibleTransitions,
    roleNodes: uniqueRecords(source.roleNodes, normalizeEvent),
    stats: {
      ...(source.stats || {}),
      normalizedEvents: events.length,
      normalizedTransitions: visibleTransitions.length,
      truncatedTransitions: transitions.length > visibleTransitions.length || Boolean(source.stats?.truncatedTransitions)
    }
  };
}

function formatYear(year) {
  const value = numericYear(year);
  if (value === null) return "";
  return value < 0 ? `기원전 ${Math.abs(value)}년` : `${value}년`;
}

/** Human-readable temporal meaning without substituting wiki creation dates. */
export function historyTimeLabel(record = {}) {
  const time = normalizedTime(record);
  if (time.status === "undated" || time.anchorYear === null) return "연도 미기록";
  if (time.status === "publication") return `${formatYear(time.publicationYear ?? time.anchorYear)} 출판`;
  let eventLabel = "";
  if (time.shape === "range" && time.eventStart !== null && time.eventEnd !== null) {
    eventLabel = time.eventStart === time.eventEnd
      ? formatYear(time.eventStart)
      : `${formatYear(time.eventStart)}–${formatYear(time.eventEnd)}`;
  } else if (time.shape === "open-end" && time.eventStart !== null) {
    eventLabel = `${formatYear(time.eventStart)} 이후`;
  } else if (time.shape === "open-start" && time.eventEnd !== null) {
    eventLabel = `${formatYear(time.eventEnd)} 이전`;
  } else {
    eventLabel = formatYear(time.anchorYear);
  }
  if (time.publicationYear !== null) {
    return `사건 ${eventLabel} · ${formatYear(time.publicationYear)} 출판`;
  }
  return eventLabel;
}

/** Restore keyboard focus after replacing an era or page navigation surface. */
export function focusHistoryNavigation(root, stageTitle, mode = "") {
  const current = ["era", "part"].includes(mode)
    ? root?.querySelector?.(`[data-history-action="${mode}"][aria-current="page"]`)
    : null;
  const target = current || stageTitle || null;
  if (!current && target) target.tabIndex = -1;
  target?.focus?.();
  return target;
}

/** Unique, DOM-safe option id within the stable ordered search result list. */
export function historySearchOptionId(recordId, index) {
  const stem = String(recordId || "result").replace(/[^a-z0-9_-]/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "result";
  return `history-search-${stem}-${Math.max(0, Number.parseInt(index, 10) || 0)}`;
}

function lookupRecord(collection, id) {
  if (!id) return null;
  if (collection instanceof Map) return collection.get(id) || null;
  if (Array.isArray(collection)) return collection.find((record) => record?.id === id) || null;
  return collection?.[id] || null;
}

function roleRecords(role, eventIndex) {
  return values(role).filter(Boolean).map((record) => {
    const normalized = normalizeEvent(record);
    const complete = lookupRecord(eventIndex, normalized.id);
    return complete ? { ...normalized, ...normalizeEvent(complete) } : normalized;
  });
}

function roleRecordSummary(records, limit = 6) {
  const members = values(records);
  const visible = members.slice(0, limit).map((record) => record.title).filter(Boolean);
  const remainder = Math.max(0, members.length - visible.length);
  return `${visible.join(", ")}${remainder ? ` 외 ${remainder}개` : ""}`;
}

function eventTitle(eventIndex, id) {
  return lookupRecord(eventIndex, id)?.title || id || "알 수 없는 문서";
}

function edgeDescription(edge, eventIndex) {
  const sourceTitle = eventTitle(eventIndex, edge.source);
  const targetTitle = eventTitle(eventIndex, edge.target);
  const relation = RELATION_LABELS[edge.kind] || edge.kind || "관계";
  let reading = `“${sourceTitle}”에서 “${targetTitle}”로 이어집니다.`;
  if (edge.kind === "responds_to") {
    reading = `저장 방향은 “${sourceTitle}” → “${targetTitle}”입니다. 역사 화면에서는 한계 “${targetTitle}” → 대응 “${sourceTitle}” 순서로 읽습니다.`;
  } else if (edge.kind === "enables") {
    reading = `대응 “${sourceTitle}” → 새 능력 “${targetTitle}” 방향입니다.`;
  } else if (edge.kind === "constrains") {
    reading = `제약 “${sourceTitle}” → 제약받는 대상 “${targetTitle}” 방향입니다.`;
  } else if (edge.kind === "precedes") {
    reading = `먼저 나타난 “${sourceTitle}” → 뒤이어 나타난 “${targetTitle}” 순서입니다. 이 관계만으로 인과를 뜻하지는 않습니다.`;
  }
  return {
    id: edge.id,
    kind: edge.kind,
    label: relation,
    sourceId: edge.source,
    targetId: edge.target,
    sourceTitle,
    targetTitle,
    direction: reading,
    note: edge.note || edge.notes?.[0] || "관계 설명이 별도로 기록되지 않았습니다.",
    evidence: [...new Set(values(edge.evidence).filter(Boolean))],
    chronology: edge.chronology || null
  };
}

/** Explain a transition's visual reading, stored edge direction, notes, and evidence. */
export function describeHistoryTransition(record = {}, eventIndex = {}) {
  const transition = normalizeTransition(record);
  const roles = transition.roles;
  const steps = [];
  let label = "역사 전환";
  if (transition.type === "response" || transition.type === "enablement") {
    label = transition.type === "response" ? "한계에 대한 대응" : "새 능력을 가능하게 한 대응";
    steps.push(
      { role: "limitation", label: "한계", records: roleRecords(roles.limitation, eventIndex), missing: "한계 관계 미기록" },
      { role: "response", label: "대응", records: roleRecords(roles.response, eventIndex), missing: "대응 문서 미기록" },
      { role: "capability", label: "새 능력", records: roleRecords(roles.capability, eventIndex), missing: "새 능력 관계 미기록" }
    );
  } else if (transition.type === "constraint") {
    label = "제약 관계";
    steps.push(
      { role: "constraint", label: "제약", records: roleRecords(roles.constraint, eventIndex), missing: "제약 문서 미기록" },
      { role: "constrained", label: "제약받는 대상", records: roleRecords(roles.constrained, eventIndex), missing: "대상 문서 미기록" }
    );
  } else if (transition.type === "precedes") {
    label = "역사적 선후 관계";
    steps.push(
      { role: "before", label: "먼저", records: roleRecords(roles.before, eventIndex), missing: "앞선 문서 미기록" },
      { role: "after", label: "뒤이어", records: roleRecords(roles.after, eventIndex), missing: "뒤이은 문서 미기록" }
    );
  }
  const allRoleEvents = steps.flatMap((step) => step.records);
  const index = new Map(allRoleEvents.map((event) => [event.id, event]));
  if (eventIndex instanceof Map) for (const [id, event] of eventIndex) index.set(id, event);
  else for (const [id, event] of Object.entries(eventIndex || {})) index.set(id, event);
  const edges = transition.edges.map((edge) => edgeDescription(edge, index));
  const path = steps.map((step) => roleRecordSummary(step.records) || step.missing).join(" → ");
  return {
    id: transition.id,
    type: transition.type,
    label,
    title: transition.title || path,
    path,
    completeness: transition.completeness,
    completenessLabel: transition.completeness === "complete" ? "완전한 전환" : "부분 전환",
    anchorYear: transition.anchorYear,
    steps,
    edges
  };
}

function samePath(url, path) {
  if (!path) return false;
  const current = new URL(String(url), "https://history.local");
  const expected = new URL(String(path), current);
  const normalize = (value) => value.length > 1 ? value.replace(/\/+$/, "") : value;
  return normalize(current.pathname) === normalize(expected.pathname);
}

/** Extend the shared state contract with clean pre-rendered part routes. */
export function parseHistoryLensPageUrl(url, allowedFacets = {}, options = {}) {
  const parsed = parseHistoryUrl(url, allowedFacets);
  if (parsed.mode === "overview" && options.defaultPart && samePath(url, options.defaultPartPath)) {
    return { ...parsed, mode: "part", part: normalizedId(options.defaultPart) };
  }
  return parseHistoryPageUrl(url, allowedFacets, options);
}

export function historyLensPageUrlFor(base, state = {}, options = {}) {
  const current = new URL(String(base), "https://history.local");
  const onDefaultPartPath = options.defaultPart && samePath(current, options.defaultPartPath);
  const isDefaultPart = onDefaultPartPath && state.mode === "part"
    && normalizedId(state.part) === normalizedId(options.defaultPart);
  if (isDefaultPart) {
    return historyUrlFor(current, { ...state, mode: "overview", transition: "", event: "", part: "", era: "" });
  }
  return historyPageUrlFor(current, state, options);
}

export function historyLensStateFromHistory(entry, currentUrl, allowedFacets = {}, options = {}) {
  if (!options.defaultPart) return historyStateFromHistory(entry, currentUrl, allowedFacets, options);
  const snapshot = entry?.historyMap;
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    return parseHistoryLensPageUrl(currentUrl, allowedFacets, options);
  }
  const canonical = historyLensPageUrlFor(currentUrl, snapshot, options);
  return parseHistoryLensPageUrl(canonical, allowedFacets, options);
}

/** Resolve one data asset on the manifest origin and bind it to contentVersion. */
export function historyVersionedAssetUrl(value, base, version = "") {
  if (!value) return "";
  const baseUrl = new URL(String(base), "https://history.local");
  const url = new URL(String(value), baseUrl);
  if (url.origin !== baseUrl.origin) throw new Error("History shard must use the site origin");
  url.hash = "";
  if (version) url.searchParams.set("v", String(version));
  return url.href;
}

export function createHistoryRequestGate() {
  let token = 0;
  let controller = null;
  return {
    begin() {
      token += 1;
      const requestToken = token;
      controller?.abort();
      controller = typeof AbortController === "function" ? new AbortController() : null;
      return { token: requestToken, signal: controller?.signal, current: () => token === requestToken };
    },
    isCurrent(value) { return token === value; },
    cancel() { token += 1; controller?.abort(); controller = null; },
    get token() { return token; }
  };
}

function query(root, ...selectors) {
  for (const selector of selectors) {
    const found = root?.querySelector?.(selector);
    if (found) return found;
  }
  return null;
}

function pageLocationOptions(root) {
  return {
    rootPath: root.dataset.historyRootUrl || "/map/history/",
    defaultEra: root.dataset.defaultEra || "",
    defaultEraPath: root.dataset.defaultEraPath || "",
    defaultPart: root.dataset.defaultPart || "",
    defaultPartPath: root.dataset.defaultPartPath || ""
  };
}

function transitionMatchesFilters(transition, filters) {
  if (filters.display === "events") return false;
  if (filters.layer && !values(transition.lanes).includes(filters.layer)) return false;
  if (filters.capability && !values(transition.capabilityLayers).includes(filters.capability)) return false;
  return true;
}

function locationAsset(manifest, record, kind) {
  const candidate = typeof record?.location === "string"
    ? record.location
    : record?.location?.shard || record?.location?.url || record?.shard || record?.shardUrl;
  if (!candidate || !record?.id) return "";
  const key = kind === "transition" ? "transitionShards" : "eventShards";
  return historyManifestAsset({ [key]: { [record.id]: candidate } }, kind, record.id);
}

function lookupItem(payload, kind, id) {
  const collection = kind === "transition" ? payload?.transitions : payload?.entries || payload?.events;
  return values(collection).find((record) => normalizedId(record?.id) === normalizedId(id)) || null;
}

function safePageHref(value, windowRef) {
  try {
    const url = new URL(String(value || ""), windowRef.location.href);
    if (url.origin === new URL(windowRef.location.href).origin) return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    // Invalid page links remain inert.
  }
  return "#";
}

function mapRoots(historyRoot, currentHref) {
  const root = new URL(historyRoot || "/map/history/", currentHref);
  const marker = "/map/history/";
  const index = root.pathname.indexOf(marker);
  const prefix = index >= 0 ? root.pathname.slice(0, index) : "";
  return { atlas: `${prefix}/map/atlas/`, connections: `${prefix}/map/` };
}

function searchResultIndex(current, key, length) {
  const count = Math.max(0, Math.floor(Number(length) || 0));
  if (!count) return -1;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  if (key === "ArrowDown") return current < 0 ? 0 : (current + 1) % count;
  if (key === "ArrowUp") return current < 0 ? count - 1 : (current - 1 + count) % count;
  return current;
}

export async function initializeHistoryLens(root, dependencies = {}) {
  if (!root || ["true", "loading"].includes(root.dataset?.historyEnhanced)) return null;
  const manifestSource = root.dataset.historyManifestUrl || root.dataset.manifestUrl;
  if (!manifestSource) return null;
  const fetchImpl = dependencies.fetch || globalThis.fetch?.bind(globalThis);
  const windowRef = dependencies.window || globalThis.window;
  const documentRef = dependencies.document || root.ownerDocument || globalThis.document;
  if (!fetchImpl || !windowRef) return null;

  root.dataset.historyEnhanced = "loading";
  const controls = query(root, "[data-history-controls]");
  const search = query(root, "input[data-history-search]", "[data-history-search] input", "input[type=search]");
  const searchResults = query(root, "[data-history-search-results]");
  const eraControl = query(root, "select[data-history-era]", "[data-history-filter=\"era\"]", "select[name=\"era\"]");
  const layerControl = query(root, "select[data-history-layer]", "[data-history-filter=\"layer\"]", "select[name=\"layer\"]");
  const capabilityControl = query(root, "select[data-history-capability]", "[data-history-filter=\"capability\"]", "select[name=\"capability\"]");
  const displayControl = query(root, "select[data-history-display]", "[data-history-filter=\"display\"]", "select[name=\"display\"]");
  const resetButton = query(root, "[data-history-reset]");
  const status = query(root, "[data-history-status]", "[role=status]");
  const breadcrumb = query(root, "[data-history-breadcrumb]");
  const eraList = query(root, "[data-history-era-list]");
  const stage = query(root, "[data-history-stage]");
  const stageKicker = query(root, "[data-history-stage-kicker]");
  const stageTitle = query(root, "[data-history-stage-title]", "#history-stage-title");
  const stageSummary = query(root, "[data-history-stage-summary]");
  const eventList = query(root, "[data-history-event-list]");
  const transitionList = query(root, "[data-history-transition-list]");
  const inspector = query(root, "[data-history-inspector]");
  const errorPanel = query(root, "[data-history-error]");
  const retryButton = query(root, "[data-history-retry]");
  const options = pageLocationOptions(root);
  const manifestUrl = new URL(manifestSource, windowRef.location.href).href;
  const historyRef = windowRef.history;
  const cache = createHistoryLruCache(5);
  const navigationGate = createHistoryRequestGate();
  const searchGate = createHistoryRequestGate();
  const contextGate = createHistoryRequestGate();
  const detailGate = createHistoryRequestGate();

  let manifest = null;
  let overviewPayload = null;
  let lookupPayload = null;
  let activePayload = null;
  let activeView = normalizeHistoryView();
  let state = { mode: "overview", transition: "", event: "", part: "", era: "", q: "", layer: "", capability: "", display: "all" };
  let retryAction = null;
  let composing = false;
  let searchTimer = 0;
  let activeSearchResults = [];
  let activeSearchIndex = -1;
  const recordCache = new Map();
  const transitionDetailPages = new Map();
  const transitionDetailSelection = new Map();

  const make = (tag, className = "", content = "") => {
    const node = documentRef.createElement(tag);
    if (className) node.className = className;
    if (content) node.textContent = content;
    return node;
  };

  const announce = (message) => { if (status) status.textContent = message; };
  const setBusy = (busy) => root.setAttribute?.("aria-busy", String(Boolean(busy)));
  const filters = () => ({ layer: state.layer || "", capability: state.capability || "", display: state.display || "all" });

  function syncUrl(method = "replaceState") {
    if (!historyRef?.[method]) return;
    const nextUrl = historyLensPageUrlFor(windowRef.location.href, state, options);
    historyRef[method](historyHistoryEntry(state), "", nextUrl);
  }

  function syncControls() {
    if (search && search.value !== state.q) search.value = state.q || "";
    if (eraControl) eraControl.value = state.mode === "overview" ? "" : currentPeriod()?.id || state.era || "";
    if (layerControl) layerControl.value = state.layer || "";
    if (capabilityControl) capabilityControl.value = state.capability || "";
    if (displayControl) displayControl.value = state.display || "all";
  }

  function fillSelect(control, records, firstLabel = "전체") {
    if (!control || !documentRef || control.options?.length > 1) return;
    const first = make("option", "", firstLabel);
    first.value = "";
    const optionsNodes = records.map((record) => {
      const option = make("option", "", record.label || record.title || record.id || record.value);
      option.value = record.id || record.value;
      return option;
    });
    control.replaceChildren(first, ...optionsNodes);
  }

  function prepareControls() {
    fillSelect(eraControl, values(manifest.periods).map((period) => ({ id: period.id, label: period.label || period.title || period.id })));
    fillSelect(layerControl, values(manifest.lanes).map((lane) => ({ id: lane.id, label: lane.label || LANE_LABELS[lane.id] || lane.id })));
    fillSelect(capabilityControl, values(manifest.facets?.capabilities).map((value) => ({ value, label: value })));
    if (displayControl && displayControl.options?.length <= 1) {
      const modes = [
        { value: "all", label: "문서와 전환" },
        { value: "events", label: "문서만" },
        { value: "transitions", label: "전환만" }
      ];
      displayControl.replaceChildren(...modes.map((record) => {
        const option = make("option", "", record.label);
        option.value = record.value;
        return option;
      }));
    }
  }

  async function fetchPayload(asset, signal) {
    const url = historyVersionedAssetUrl(asset, manifestUrl, manifest?.contentVersion || "");
    const cached = cache.get(url);
    if (cached) return cached;
    const response = await fetchImpl(url, { signal, cache: "force-cache", headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`History shard request failed: ${response.status}`);
    const payload = await response.json();
    normalizeHistoryPayloadVersion(manifest, payload);
    rememberPayload(payload);
    cache.set(url, payload);
    return payload;
  }

  function rememberPayload(payload = {}) {
    for (const record of [...values(payload.entries || payload.events), ...values(payload.roleNodes)]) {
      const event = normalizeEvent(record);
      if (event.id) recordCache.set(`event:${event.id}`, event);
    }
    for (const record of values(payload.transitions)) {
      const transition = normalizeTransition(record);
      if (transition.id) recordCache.set(`transition:${transition.id}`, transition);
    }
  }

  async function ensureLookup(signal) {
    if (lookupPayload) return lookupPayload;
    const assets = historyLookupShardAssets(manifest);
    if (!assets.length) throw new Error("History lookup shards are missing");
    const payloads = [];
    const concurrency = 8;
    for (let offset = 0; offset < assets.length; offset += concurrency) {
      const batch = assets.slice(offset, offset + concurrency);
      payloads.push(...await Promise.all(batch.map((asset) => fetchPayload(asset, signal))));
    }
    const entries = payloads.flatMap((payload) => values(payload.entries || payload.events));
    const transitions = payloads.flatMap((payload) => values(payload.transitions));
    lookupPayload = {
      schemaVersion: manifest.schemaVersion,
      contentVersion: manifest.contentVersion,
      kind: "history-lookup",
      entries,
      transitions,
      stats: { documents: entries.length, transitions: transitions.length, shards: assets.length }
    };
    rememberPayload(lookupPayload);
    return lookupPayload;
  }

  async function ensureLookupRecord(kind, id, signal) {
    const cached = recordCache.get(`${kind}:${id}`);
    if (cached) return cached;
    const existing = lookupPayload ? lookupItem(lookupPayload, kind, id) : null;
    if (existing) return existing;
    const asset = historyLookupShardAsset(manifest, id);
    if (asset) {
      const payload = await fetchPayload(asset, signal);
      return recordCache.get(`${kind}:${id}`) || lookupItem(payload, kind, id);
    }
    return lookupItem(await ensureLookup(signal), kind, id);
  }

  async function hydrateTransitionEvidence(transition, signal) {
    const ids = [...new Set(values(transition?.edges).flatMap((edge) => values(edge?.evidence)).filter(Boolean))];
    const assets = [...new Set(ids
      .filter((id) => !recordCache.has(`event:${id}`))
      .map((id) => historyLookupShardAsset(manifest, id))
      .filter(Boolean))];
    const concurrency = 8;
    for (let offset = 0; offset < assets.length; offset += concurrency) {
      await Promise.all(assets.slice(offset, offset + concurrency).map((asset) => fetchPayload(asset, signal)));
    }
  }

  function requestTransitionEvidence(transition) {
    if (!transition?.id) return;
    const request = contextGate.begin();
    hydrateTransitionEvidence(transition, request.signal).then(() => {
      if (request.current() && state.mode === "transition" && state.transition === transition.id) renderInspector();
    }).catch((error) => {
      if (error?.name !== "AbortError" && request.current()) announce("일부 근거 제목을 불러오지 못해 안정 ID로 표시합니다.");
    });
  }

  async function loadTransitionDetailPage(id, pageNumber) {
    const summary = selectedTransition();
    const page = Number(pageNumber);
    if (!summary?.id || summary.id !== id || summary.detail?.kind !== "paginated"
      || !Number.isSafeInteger(page) || page < 1 || page > Number(summary.detail.pageCount)) return;
    const assets = historyTransitionDetailAssets(manifest, summary);
    const asset = assets[page - 1];
    if (!asset) {
      showError("전환 상세 조각의 주소가 올바르지 않습니다. 원문 관계 표는 계속 읽을 수 있습니다.");
      return;
    }
    const cached = transitionDetailPages.get(id)?.get(page);
    if (cached) {
      transitionDetailSelection.set(id, page);
      requestTransitionEvidence(historyTransitionDetailPageView(summary, cached));
      renderInspector();
      announce(`전체 ${summary.detail.pageCount}쪽 중 ${page}쪽 상세 관계를 표시합니다.`);
      return;
    }
    const request = detailGate.begin();
    setBusy(true);
    hideError();
    retryAction = () => loadTransitionDetailPage(id, page);
    try {
      const payload = await fetchPayload(asset, request.signal);
      const pageView = historyTransitionDetailPageView(summary, payload);
      await hydrateTransitionEvidence(pageView, request.signal);
      if (!request.current()) return;
      if (!transitionDetailPages.has(id)) transitionDetailPages.set(id, new Map());
      transitionDetailPages.get(id).set(page, payload);
      transitionDetailSelection.set(id, page);
      retryAction = null;
      if (state.mode === "transition" && state.transition === id) {
        renderInspector();
        announce(`전체 ${summary.detail.pageCount}쪽 중 ${page}쪽 · ${pageView.edges.length}개 관계를 표시합니다.`);
      }
    } catch (error) {
      if (error?.name === "AbortError" || !request.current()) return;
      showError("전환 상세 조각을 불러오지 못했습니다. 대표 관계와 원문 문서 링크는 계속 사용할 수 있습니다.");
    } finally {
      if (request.current()) setBusy(false);
    }
  }

  function currentPeriod() {
    const id = activeView.period?.id || (state.mode === "era" ? state.era : "")
      || values(manifest?.shards).find((record) => record.id === state.part)?.periodId;
    return values(manifest?.periods).find((period) => period.id === id) || activeView.period || null;
  }

  function eventIndex(view = activeView) {
    return new Map([...view.events, ...view.roleNodes].map((event) => [event.id, event]));
  }

  function selectedEvent() {
    return activeView.events.find((event) => event.id === state.event)
      || recordCache.get(`event:${state.event}`)
      || (lookupPayload ? normalizeEvent(lookupItem(lookupPayload, "event", state.event) || {}) : null);
  }

  function selectedTransition() {
    return activeView.transitions.find((transition) => transition.id === state.transition)
      || recordCache.get(`transition:${state.transition}`)
      || (lookupPayload ? normalizeTransition(lookupItem(lookupPayload, "transition", state.transition) || {}) : null);
  }

  function visibleView() {
    const currentFilters = filters();
    let events = currentFilters.display === "transitions" ? [] : activeView.events.filter((event) => (
      matchesHistoryFilters(event, { ...currentFilters, display: "all" })
    ));
    let transitions = activeView.transitions.filter((transition) => transitionMatchesFilters(transition, currentFilters));
    const focusEvent = activeView.events.find((event) => event.id === state.event);
    if (focusEvent && !events.some((event) => event.id === focusEvent.id)) events = sortHistoryEvents([...events, focusEvent]);
    const focusTransition = activeView.transitions.find((transition) => transition.id === state.transition);
    if (focusTransition && !transitions.some((transition) => transition.id === focusTransition.id)) {
      transitions = [...transitions, focusTransition].sort(transitionCompare);
    }
    return { events, transitions };
  }

  function actionHref(action, id) {
    return historyLensPageUrlFor(windowRef.location.href, {
      ...state,
      mode: action,
      ...Object.fromEntries(TARGET_KEYS.map((key) => [key, key === action ? id : ""]))
    }, options);
  }

  function renderEraList() {
    if (!eraList) return;
    const list = make("ol", "history-era-cards");
    for (const period of activeView.periods.length ? activeView.periods : values(overviewPayload?.periods).map((record) => ({ ...record }))) {
      const item = make("li", "history-era-card");
      const link = make("a", "history-era-action");
      link.href = actionHref("era", period.id);
      link.dataset.historyAction = "era";
      link.dataset.historyId = period.id;
      if (period.id === currentPeriod()?.id) link.setAttribute("aria-current", "page");
      link.append(
        make("strong", "", period.label || period.title || period.id),
        make("span", "", `${Number(period.eventCount || 0)}개 문서 · ${Number(period.transitionCount || 0)}개 전환`)
      );
      if (period.question) link.append(make("small", "", period.question));
      item.append(link);
      list.append(item);
    }
    const period = currentPeriod();
    const partRecords = period ? values(manifest.shards).filter((record) => record.periodId === period.id) : [];
    const children = [list];
    if (partRecords.length > 1) {
      const nav = make("nav", "history-part-nav");
      nav.setAttribute("aria-label", `${period.label || period.id}의 페이지`);
      for (const record of partRecords) {
        const link = make("a", "history-part-action", String(record.page));
        link.href = actionHref("part", record.id);
        link.dataset.historyAction = "part";
        link.dataset.historyId = record.id;
        if (state.part === record.id || activeView.id === record.id) link.setAttribute("aria-current", "page");
        nav.append(link);
      }
      children.push(nav);
    }
    eraList.replaceChildren(...children);
  }

  function eventButton(event, selected) {
    const button = make("button", `history-event-card${selected ? " is-selected" : ""}`);
    button.type = "button";
    button.dataset.historyAction = "event";
    button.dataset.historyId = event.id;
    button.setAttribute("aria-current", selected ? "true" : "false");
    button.tabIndex = selected ? 0 : -1;
    button.append(
      make("span", "history-event-time", historyTimeLabel(event)),
      make("strong", "history-event-title", event.title)
    );
    if (event.summary) button.append(make("small", "history-event-summary", event.summary));
    if (event.time.note) button.append(make("small", "history-event-note", event.time.note));
    return button;
  }

  function renderEvents(events) {
    if (!eventList) return;
    if (!events.length) {
      eventList.replaceChildren(make("p", "history-empty", state.display === "transitions" ? "전환만 표시하고 있습니다." : "현재 조건에 맞는 문서가 없습니다."));
      return;
    }
    const configuredLanes = values(manifest.lanes).map((lane) => lane.id);
    const laneOrder = [...configuredLanes, ...HISTORY_LANE_ORDER, "unclassified"];
    const lanes = [...new Set(events.map((event) => event.lane))].sort((left, right) => (
      laneOrder.indexOf(left) - laneOrder.indexOf(right) || left.localeCompare(right, "ko")
    ));
    const fragment = documentRef.createDocumentFragment();
    for (const lane of lanes) {
      const laneEvents = events.filter((event) => event.lane === lane);
      const section = make("section", "history-lane");
      section.dataset.historyLane = lane;
      const heading = make("h3", "", values(manifest.lanes).find((record) => record.id === lane)?.label || LANE_LABELS[lane] || lane);
      heading.id = `history-lane-${lane.replace(/[^a-z0-9_-]/g, "-")}`;
      const header = make("header", "history-lane-header");
      header.append(heading, make("span", "", `${laneEvents.length}개`));
      const list = make("ol", "history-lane-events");
      list.setAttribute("aria-labelledby", heading.id);
      list.tabIndex = 0;
      laneEvents.forEach((event, index) => {
        const item = make("li", "history-event-item");
        const selected = state.event === event.id;
        const button = eventButton(event, selected);
        if (!state.event && !index && lane === lanes[0]) button.tabIndex = 0;
        item.append(button);
        list.append(item);
      });
      section.append(header, list);
      fragment.append(section);
    }
    eventList.replaceChildren(fragment);
  }

  function transitionCard(transition, selected) {
    const description = describeHistoryTransition(transition, eventIndex());
    const card = make("article", `history-transition-card history-transition-${transition.type}`);
    const button = make("button", `history-transition-action${selected ? " is-selected" : ""}`);
    button.type = "button";
    button.dataset.historyAction = "transition";
    button.dataset.historyId = transition.id;
    button.setAttribute("aria-current", selected ? "true" : "false");
    button.append(
      make("span", "history-transition-type", `${description.label} · ${description.completenessLabel}`),
      make("strong", "history-transition-title", description.path)
    );
    const steps = make("ol", "history-transition-steps");
    for (const step of description.steps) {
      const item = make("li", `history-transition-step history-transition-${step.role}`);
      item.append(make("span", "", step.label), make("strong", "", step.records.map((record) => record.title).join(", ") || step.missing));
      steps.append(item);
    }
    card.append(button, steps);
    if (description.edges[0]?.note) card.append(make("small", "history-transition-note", description.edges[0].note));
    return card;
  }

  function renderTransitions(transitions) {
    if (!transitionList) return;
    if (!transitions.length) {
      transitionList.replaceChildren(make("p", "history-empty", state.display === "events" ? "문서만 표시하고 있습니다." : "현재 조건에 맞는 역사 전환이 없습니다."));
      return;
    }
    const list = make("ol", "history-transition-list");
    for (const transition of transitions) {
      const item = make("li", "history-transition-item");
      item.append(transitionCard(transition, state.transition === transition.id));
      list.append(item);
    }
    transitionList.replaceChildren(list);
  }

  function appendActions(container, event) {
    const actions = make("div", "history-inspector-actions");
    const roots = mapRoots(options.rootPath, windowRef.location.href);
    if (event.url) {
      const read = make("a", "", "문서 읽기");
      read.href = safePageHref(event.url, windowRef);
      actions.append(read);
    }
    const atlas = make("a", "", "의미 지도에서 보기");
    atlas.href = `${roots.atlas}?focus=${encodeURIComponent(event.id)}`;
    const connection = make("a", "", "연결 경로 찾기");
    connection.href = `${roots.connections}?from=${encodeURIComponent(event.id)}`;
    actions.append(atlas, connection);
    container.append(actions);
  }

  function evidenceNode(id) {
    const record = eventIndex().get(id) || recordCache.get(`event:${id}`)
      || (lookupPayload ? lookupItem(lookupPayload, "event", id) : null);
    if (record?.url) {
      const link = make("a", "history-evidence-link", record.title || id);
      link.href = safePageHref(record.url, windowRef);
      return link;
    }
    return make("span", "history-evidence-id", id);
  }

  function renderInspector() {
    if (!inspector) return;
    const event = state.mode === "event" ? selectedEvent() : null;
    const summaryTransition = state.mode === "transition" ? selectedTransition() : null;
    const selectedDetailPage = summaryTransition?.detail?.kind === "paginated"
      ? transitionDetailSelection.get(summaryTransition.id) || 0
      : 0;
    const detailPayload = selectedDetailPage
      ? transitionDetailPages.get(summaryTransition.id)?.get(selectedDetailPage)
      : null;
    const transition = detailPayload
      ? historyTransitionDetailPageView(summaryTransition, detailPayload)
      : summaryTransition;
    if (event?.id) {
      const heading = make("h2", "", event.title);
      heading.id = "history-inspector-title";
      inspector.replaceChildren(
        make("p", "history-inspector-kicker", `${historyTimeLabel(event)} · ${LANE_LABELS[event.lane] || event.lane}`),
        heading,
        make("p", "", event.summary || "이 문서의 역사 메타데이터와 연결을 표시합니다.")
      );
      const metadata = make("dl", "history-inspector-metadata");
      const pairs = [
        ["날짜 근거", event.time.status === "publication" ? "출판 연도" : event.time.status === "event" ? "사건 연도" : "연도 미기록"],
        ["역사 층위", LANE_LABELS[event.lane] || event.lane],
        ["능력 층위", event.capabilityLayers.join(", ") || "미분류"],
        ["검증 상태", event.status || "미기록"]
      ];
      for (const [term, detail] of pairs) {
        const row = make("div");
        row.append(make("dt", "", term), make("dd", "", detail));
        metadata.append(row);
      }
      inspector.append(metadata);
      if (event.time.note) inspector.append(make("p", "history-time-note", event.time.note));
      appendActions(inspector, event);
      return;
    }
    if (transition?.id) {
      const description = describeHistoryTransition(transition, eventIndex());
      const heading = make("h2", "", description.path);
      heading.id = "history-inspector-title";
      inspector.replaceChildren(
        make("p", "history-inspector-kicker", `${description.label} · ${description.completenessLabel}`),
        heading
      );
      const steps = make("ol", "history-inspector-steps");
      for (const step of description.steps) {
        const item = make("li", `history-inspector-step history-inspector-${step.role}`);
        item.append(make("span", "", step.label), make("strong", "", roleRecordSummary(step.records) || step.missing));
        steps.append(item);
      }
      inspector.append(steps);
      if (summaryTransition.detail?.kind === "paginated") {
        const detail = summaryTransition.detail;
        const panel = make("section", "history-detail-pager");
        panel.dataset.historyTransitionDetail = summaryTransition.id;
        panel.append(make("p", "history-detail-summary", selectedDetailPage
          ? `전체 ${detail.edgeCount}개 관계 · ${detail.roleNodeCount}개 역할 문서 · ${selectedDetailPage}/${detail.pageCount}쪽`
          : `대표 ${summaryTransition.edges.length}개 관계를 표시 중입니다. 전체 ${detail.edgeCount}개 관계는 ${detail.pageCount}개 조각으로 나뉩니다.`));
        const actions = make("div", "history-detail-actions");
        if (!selectedDetailPage) {
          const load = make("button", "history-detail-load", "상세 관계 첫 쪽 불러오기");
          load.type = "button";
          load.dataset.historyLoadTransition = summaryTransition.id;
          load.dataset.historyDetailPage = "1";
          actions.append(load);
        } else {
          if (selectedDetailPage > 1) {
            const previous = make("button", "history-detail-page", "이전 쪽");
            previous.type = "button";
            previous.dataset.historyTransitionId = summaryTransition.id;
            previous.dataset.historyDetailPage = String(selectedDetailPage - 1);
            actions.append(previous);
          }
          const preview = make("button", "history-detail-preview", "대표 관계로 돌아가기");
          preview.type = "button";
          preview.dataset.historyTransitionId = summaryTransition.id;
          preview.dataset.historyDetailPage = "0";
          actions.append(preview);
          if (selectedDetailPage < Number(detail.pageCount)) {
            const next = make("button", "history-detail-page", "다음 쪽");
            next.type = "button";
            next.dataset.historyTransitionId = summaryTransition.id;
            next.dataset.historyDetailPage = String(selectedDetailPage + 1);
            actions.append(next);
          }
        }
        const response = roleRecords(summaryTransition.roles?.response, eventIndex())[0];
        if (response?.url) {
          const source = make("a", "history-detail-source", "원문 관계 표에서 전체 읽기");
          source.href = safePageHref(response.url, windowRef);
          actions.append(source);
        }
        panel.append(actions);
        inspector.append(panel);
      }
      const edgeList = make("ol", "history-inspector-edges");
      for (const edge of description.edges) {
        const item = make("li", "history-inspector-edge");
        item.append(
          make("strong", "", edge.label),
          make("p", "history-edge-direction", edge.direction),
          make("p", "history-edge-note", edge.note)
        );
        const evidence = make("div", "history-edge-evidence");
        evidence.append(make("span", "", "근거"));
        if (edge.evidence.length) edge.evidence.forEach((id) => evidence.append(evidenceNode(id)));
        else evidence.append(make("span", "", "별도 근거 문서 미연결"));
        item.append(evidence);
        if (edge.chronology?.status === "conflict") {
          item.append(make("p", "history-chronology-warning", "기록된 연도와 관계의 예상 순서가 충돌합니다."));
        }
        edgeList.append(item);
      }
      inspector.append(edgeList);
      return;
    }
    const period = currentPeriod();
    const heading = make("h2", "", period?.label || period?.title || "전체 역사 지도");
    heading.id = "history-inspector-title";
    inspector.replaceChildren(
      make("p", "history-inspector-kicker", state.mode === "overview" ? "전체 시대" : "선택한 시대"),
      heading,
      make("p", "", period?.question || (state.mode === "overview"
        ? "시대를 선택하면 역사 층위별 문서와 근거가 있는 전환을 펼칩니다."
        : `${Number(activeView.stats?.periodEvents ?? activeView.events.length)}개 문서가 이 시대에 배치되어 있습니다.`))
    );
  }

  function renderBreadcrumb() {
    if (!breadcrumb) return;
    const home = make("a", "", "역사·인과 지도");
    home.href = historyLensPageUrlFor(windowRef.location.href, {
      ...state,
      mode: "overview",
      transition: "",
      event: "",
      part: "",
      era: ""
    }, options);
    home.dataset.historyAction = "overview";
    const children = [home];
    const period = currentPeriod();
    if (period && state.mode !== "overview") {
      const separator = make("span", "", "/");
      separator.setAttribute("aria-hidden", "true");
      const era = make("a", "", period.label || period.title || period.id);
      era.href = actionHref("era", period.id);
      era.dataset.historyAction = "era";
      era.dataset.historyId = period.id;
      children.push(separator, era);
    }
    const selected = state.mode === "event" ? selectedEvent()?.title
      : state.mode === "transition" ? describeHistoryTransition(selectedTransition() || {}).path
        : state.mode === "part" && activeView.page ? `${activeView.page}페이지` : "";
    if (selected) {
      const separator = make("span", "", "/");
      separator.setAttribute("aria-hidden", "true");
      children.push(separator, make("span", "", selected));
    }
    breadcrumb.replaceChildren(...children);
  }

  function renderActive({ announceResult = true } = {}) {
    const visible = visibleView();
    syncControls();
    if (stage) {
      stage.dataset.historyMode = state.mode;
      stage.dataset.historyPeriod = currentPeriod()?.id || "";
    }
    const period = currentPeriod();
    const event = state.mode === "event" ? selectedEvent() : null;
    const transition = state.mode === "transition" ? selectedTransition() : null;
    if (stageKicker) stageKicker.textContent = state.mode === "overview" ? "HISTORY OVERVIEW"
      : state.mode === "transition" ? "CAUSAL TRACE"
        : state.mode === "event" ? "EVENT FOCUS" : "ERA SWIMLANES";
    if (stageTitle) stageTitle.textContent = event?.title
      || (transition ? describeHistoryTransition(transition, eventIndex()).path : "")
      || period?.label || period?.title || "전체 시대와 병목 이동";
    if (stageSummary) stageSummary.textContent = event?.summary
      || period?.question
      || (state.mode === "overview" ? "시대를 선택하면 역사 층위별 문서와 검토된 전환을 펼칩니다." : "연도와 역사 층위, 관계 설명을 함께 읽습니다.");
    renderEraList();
    renderEvents(visible.events);
    renderTransitions(visible.transitions);
    renderInspector();
    renderBreadcrumb();
    if (announceResult) {
      announce(state.mode === "overview"
        ? `${activeView.periods.length}개 시대와 ${visible.transitions.length}개 대표 전환을 표시합니다.`
        : `${visible.events.length}개 문서와 ${visible.transitions.length}개 역사 전환을 표시합니다.`);
    }
  }

  function showError(message) {
    announce(message);
    errorPanel?.removeAttribute?.("hidden");
    retryButton?.removeAttribute?.("hidden");
  }

  function hideError() {
    errorPanel?.setAttribute?.("hidden", "");
    retryButton?.setAttribute?.("hidden", "");
  }

  function setOverview(reason = "") {
    state = { ...state, mode: "overview", transition: "", event: "", part: "", era: "" };
    activePayload = overviewPayload;
    activeView = normalizeHistoryView(overviewPayload, { maxTransitions: manifest?.limits?.overviewTransitions });
    syncControls();
    syncUrl("replaceState");
    renderActive({ announceResult: !reason });
    if (reason) announce(reason);
  }

  async function assetForState(nextState, signal) {
    if (nextState.mode === "overview") return { asset: historyManifestAsset(manifest, "overview"), record: null };
    if (nextState.mode === "era") return { asset: historyManifestAsset(manifest, "era", nextState.era), record: null };
    if (nextState.mode === "part") return { asset: historyManifestAsset(manifest, "part", nextState.part), record: null };
    if (!["event", "transition"].includes(nextState.mode)) return { asset: "", record: null };
    const id = nextState[nextState.mode];
    let record = nextState.mode === "event"
      ? activeView.events.find((event) => event.id === id)
      : activeView.transitions.find((transition) => transition.id === id);
    let asset = locationAsset(manifest, record, nextState.mode);
    if (!asset) {
      record = await ensureLookupRecord(nextState.mode, id, signal);
      asset = locationAsset(manifest, record, nextState.mode);
    }
    return { asset, record };
  }

  async function loadState(nextState, { history = "replaceState", announceResult = true, focusMode = "" } = {}) {
    const request = navigationGate.begin();
    contextGate.cancel();
    detailGate.cancel();
    state = nextState;
    syncControls();
    if (history) syncUrl(history);
    setBusy(true);
    hideError();
    retryAction = () => loadState(state, { history: "replaceState" });
    try {
      const { asset } = await assetForState(state, request.signal);
      if (!request.current()) return;
      if (!asset) {
        setOverview("주소의 역사 항목을 찾지 못해 전체 지도로 돌아왔습니다.");
        return;
      }
      const payload = state.mode === "overview" && overviewPayload
        ? overviewPayload
        : await fetchPayload(asset, request.signal);
      if (!request.current()) return;
      activePayload = payload;
      activeView = normalizeHistoryView(payload, {
        maxTransitions: state.mode === "overview" ? manifest?.limits?.overviewTransitions : manifest?.limits?.shardTransitions
      });
      renderActive({ announceResult });
      if (state.mode === "transition") requestTransitionEvidence(selectedTransition());
      if (focusMode) focusHistoryNavigation(root, stageTitle, focusMode);
      retryAction = null;
    } catch (error) {
      if (error?.name === "AbortError" || !request.current()) return;
      showError("역사 지도 조각을 불러오지 못했습니다. 마지막으로 성공한 화면을 유지합니다.");
    } finally {
      if (request.current()) setBusy(false);
    }
  }

  async function navigate(mode, id = "", history = "pushState", { focus = false } = {}) {
    if (mode === "overview") {
      return loadState(
        { ...state, mode, transition: "", event: "", part: "", era: "" },
        { history, focusMode: focus ? "overview" : "" }
      );
    }
    if (!TARGET_KEYS.includes(mode) || !id) return null;
    const next = {
      ...state,
      mode,
      ...Object.fromEntries(TARGET_KEYS.map((key) => [key, key === mode ? normalizedId(id) : ""]))
    };
    return loadState(next, { history, focusMode: focus && ["era", "part"].includes(mode) ? mode : "" });
  }

  function updateLocalSelection(mode, id, history = "pushState") {
    state = {
      ...state,
      mode,
      ...Object.fromEntries(TARGET_KEYS.map((key) => [key, key === mode ? id : ""]))
    };
    syncUrl(history);
    root.querySelectorAll?.("[data-history-action=\"event\"], [data-history-action=\"transition\"]").forEach((node) => {
      const selected = node.dataset.historyAction === mode && node.dataset.historyId === id;
      node.classList?.toggle("is-selected", selected);
      node.setAttribute?.("aria-current", selected ? "true" : "false");
      if (node.dataset.historyAction === "event") node.tabIndex = selected ? 0 : -1;
    });
    renderInspector();
    renderBreadcrumb();
    announce(mode === "event" ? `${selectedEvent()?.title || id} 문서를 선택했습니다.` : "역사 전환의 설명과 근거를 열었습니다.");
  }

  async function performSearch() {
    if (composing || !search) return;
    const queryText = normalizeHistoryQuery(search.value);
    state = { ...state, q: queryText };
    syncUrl("replaceState");
    const request = searchGate.begin();
    if (!queryText) {
      activeSearchResults = [];
      activeSearchIndex = -1;
      searchResults?.replaceChildren?.();
      search.setAttribute?.("aria-expanded", "false");
      search.removeAttribute?.("aria-activedescendant");
      return;
    }
    try {
      const lookup = await ensureLookup(request.signal);
      if (!request.current()) return;
      const view = normalizeHistoryView(lookup, { maxTransitions: Number.MAX_SAFE_INTEGER });
      const candidates = [...view.events, ...view.transitions].filter((record) => (
        record.kind === "transition"
          ? transitionMatchesFilters(record, filters())
          : filters().display !== "transitions" && matchesHistoryFilters(record, { ...filters(), display: "all" })
      ));
      activeSearchResults = searchHistoryEvents(candidates, queryText, {}, 12);
      activeSearchIndex = -1;
      if (searchResults) {
        const list = make("ol", "history-search-list");
        list.setAttribute("role", "presentation");
        for (const [resultIndex, record] of activeSearchResults.entries()) {
          const item = make("li");
          item.setAttribute("role", "none");
          const button = make("button", "history-search-result");
          button.type = "button";
          button.id = historySearchOptionId(record.id, resultIndex);
          button.dataset.historySearchId = record.id;
          button.dataset.historySearchKind = record.kind === "transition" ? "transition" : "event";
          button.setAttribute("role", "option");
          button.setAttribute("aria-selected", "false");
          button.append(
            make("strong", "", record.title || record.id),
            make("small", "", record.kind === "transition" ? describeHistoryTransition(record).label : historyTimeLabel(record))
          );
          item.append(button);
          list.append(item);
        }
        searchResults.replaceChildren(list);
      }
      search.setAttribute?.("aria-expanded", String(activeSearchResults.length > 0));
      announce(`${activeSearchResults.length}개의 검색 결과를 찾았습니다.`);
    } catch (error) {
      if (error?.name !== "AbortError" && request.current()) announce("검색 색인을 불러오지 못했습니다. 다시 시도해 주세요.");
    }
  }

  function scheduleSearch() {
    windowRef.clearTimeout(searchTimer);
    searchTimer = windowRef.setTimeout(performSearch, 170);
  }

  function setSearchSelection(index) {
    activeSearchIndex = index;
    const buttons = [...(searchResults?.querySelectorAll?.("[data-history-search-id]") || [])];
    buttons.forEach((button, buttonIndex) => button.setAttribute("aria-selected", String(buttonIndex === index)));
    const selected = buttons[index];
    if (selected?.id) search?.setAttribute?.("aria-activedescendant", selected.id);
    selected?.scrollIntoView?.({ block: "nearest" });
  }

  function activateSearchResult(index) {
    const record = activeSearchResults[index];
    if (record) navigate(record.kind === "transition" ? "transition" : "event", record.id);
  }

  const clickHandler = (event) => {
    const detailAction = event.target?.closest?.("[data-history-detail-page]");
    if (detailAction) {
      event.preventDefault?.();
      const id = detailAction.dataset.historyTransitionId || detailAction.dataset.historyLoadTransition || state.transition;
      const page = Number(detailAction.dataset.historyDetailPage);
      if (page === 0) {
        transitionDetailSelection.set(id, 0);
        renderInspector();
        announce("대표 관계를 다시 표시합니다.");
      } else {
        loadTransitionDetailPage(id, page);
      }
      return;
    }
    const result = event.target?.closest?.("[data-history-search-id]");
    if (result) {
      event.preventDefault?.();
      activateSearchResult(activeSearchResults.findIndex((record) => record.id === result.dataset.historySearchId));
      return;
    }
    const action = event.target?.closest?.("[data-history-action]");
    if (!action) return;
    event.preventDefault?.();
    const mode = action.dataset.historyAction;
    const id = action.dataset.historyId || "";
    if (mode === "event" && activeView.events.some((record) => record.id === id)) updateLocalSelection(mode, id);
    else if (mode === "transition" && activeView.transitions.some((record) => record.id === id)) {
      updateLocalSelection(mode, id);
      requestTransitionEvidence(selectedTransition());
    }
    else navigate(mode, id, "pushState", { focus: ["overview", "era", "part"].includes(mode) });
  };

  const keyHandler = (event) => {
    const button = event.target?.closest?.("[data-history-action=\"event\"]");
    if (!button || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    const visible = visibleView().events;
    const targetId = historyKeyboardTarget(visible, button.dataset.historyId, event.key, {
      laneOrder: values(manifest?.lanes).map((lane) => lane.id)
    });
    if (!targetId || targetId === button.dataset.historyId && !["Home", "End"].includes(event.key)) return;
    event.preventDefault?.();
    updateLocalSelection("event", targetId, "replaceState");
    root.querySelector?.(`[data-history-action="event"][data-history-id="${targetId}"]`)?.focus?.();
  };

  root.addEventListener?.("click", clickHandler);
  root.addEventListener?.("keydown", keyHandler);
  controls?.addEventListener?.("submit", (event) => event.preventDefault());
  eraControl?.addEventListener?.("change", () => eraControl.value ? navigate("era", eraControl.value) : navigate("overview"));
  layerControl?.addEventListener?.("change", () => {
    state = { ...state, layer: layerControl.value || "" };
    syncUrl("replaceState");
    renderActive();
    if (state.q) scheduleSearch();
  });
  capabilityControl?.addEventListener?.("change", () => {
    state = { ...state, capability: capabilityControl.value || "" };
    syncUrl("replaceState");
    renderActive();
    if (state.q) scheduleSearch();
  });
  displayControl?.addEventListener?.("change", () => {
    state = { ...state, display: displayControl.value || "all" };
    syncUrl("replaceState");
    renderActive();
    if (state.q) scheduleSearch();
  });
  resetButton?.addEventListener?.("click", () => {
    activeSearchResults = [];
    activeSearchIndex = -1;
    searchResults?.replaceChildren?.();
    loadState({ mode: "overview", transition: "", event: "", part: "", era: "", q: "", layer: "", capability: "", display: "all" }, { history: "pushState" });
  });
  retryButton?.addEventListener?.("click", () => retryAction?.());
  search?.addEventListener?.("compositionstart", () => { composing = true; });
  search?.addEventListener?.("compositionend", () => { composing = false; scheduleSearch(); });
  search?.addEventListener?.("input", () => { if (!composing) scheduleSearch(); });
  search?.addEventListener?.("keydown", (event) => {
    if (event.key === "Escape") {
      activeSearchResults = [];
      activeSearchIndex = -1;
      searchResults?.replaceChildren?.();
      search.setAttribute("aria-expanded", "false");
      search.removeAttribute("aria-activedescendant");
      return;
    }
    if (!activeSearchResults.length || !["ArrowDown", "ArrowUp", "Home", "End", "Enter"].includes(event.key)) return;
    event.preventDefault();
    if (event.key === "Enter") activateSearchResult(activeSearchIndex < 0 ? 0 : activeSearchIndex);
    else setSearchSelection(searchResultIndex(activeSearchIndex, event.key, activeSearchResults.length));
  });
  searchResults?.addEventListener?.("keydown", (event) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End", "Enter"].includes(event.key)) return;
    const buttons = [...searchResults.querySelectorAll("[data-history-search-id]")];
    const current = buttons.indexOf(event.target.closest("[data-history-search-id]"));
    if (current < 0) return;
    event.preventDefault();
    if (event.key === "Enter") activateSearchResult(current);
    else {
      const index = searchResultIndex(current, event.key, buttons.length);
      setSearchSelection(index);
      buttons[index]?.focus();
    }
  });

  const popstateHandler = (event) => loadState(historyLensStateFromHistory(
    event.state,
    windowRef.location.href,
    manifest?.facets || {},
    options
  ), { history: null });
  windowRef.addEventListener?.("popstate", popstateHandler);

  setBusy(true);
  try {
    const manifestResponse = await fetchImpl(manifestUrl, { cache: "force-cache", headers: { Accept: "application/json" } });
    if (!manifestResponse.ok) throw new Error(`History manifest request failed: ${manifestResponse.status}`);
    manifest = await manifestResponse.json();
    const overviewAsset = historyManifestAsset(manifest, "overview");
    if (!overviewAsset) throw new Error("History overview shard is missing");
    overviewPayload = await fetchPayload(overviewAsset);
    activePayload = overviewPayload;
    activeView = normalizeHistoryView(overviewPayload, { maxTransitions: manifest?.limits?.overviewTransitions });
    state = parseHistoryLensPageUrl(windowRef.location.href, manifest.facets || {}, options);
    const canonical = historyLensPageUrlFor(windowRef.location.href, state, options);
    historyRef?.replaceState?.(historyHistoryEntry(state), "", canonical);
    prepareControls();
    syncControls();
    controls?.removeAttribute?.("hidden");
    hideError();
    root.dataset.historyEnhanced = "true";
    await loadState(state, { history: null });
    if (state.q) performSearch();
  } catch {
    root.dataset.historyEnhanced = "false";
    showError("역사 지도를 시작하지 못했습니다. 정적 시대·문서 목록을 이용해 주세요.");
    retryAction = () => windowRef.location.reload?.();
  } finally {
    setBusy(false);
  }

  return {
    get state() { return { ...state }; },
    get view() { return activeView; },
    navigate,
    loadTransitionDetailPage,
    retry() { return retryAction?.(); },
    destroy() {
      navigationGate.cancel();
      searchGate.cancel();
      contextGate.cancel();
      detailGate.cancel();
      windowRef.clearTimeout(searchTimer);
      windowRef.removeEventListener?.("popstate", popstateHandler);
      root.removeEventListener?.("click", clickHandler);
      root.removeEventListener?.("keydown", keyHandler);
      root.dataset.historyEnhanced = "false";
    }
  };
}

if (typeof document !== "undefined") {
  const root = document.querySelector("[data-history-lens]");
  if (root) initializeHistoryLens(root).catch(() => {
    root.setAttribute("aria-busy", "false");
    const status = query(root, "[data-history-status]", "[role=status]");
    if (status) status.textContent = "역사 지도를 시작하지 못했습니다. 정적 목록을 이용해 주세요.";
  });
}
