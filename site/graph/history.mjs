import { createHash } from "node:crypto";
import { HISTORICAL_LAYERS } from "./schema.mjs";

export const HISTORY_SCHEMA_VERSION = "1.0.0";

export const HISTORY_LIMITS = Object.freeze({
  periodPageEvents: 120,
  shardTransitions: 96,
  lookupShardRecords: 96,
  transitionPreviewItems: 6,
  transitionDetailItems: 48,
  transitionDetailBytes: 64 * 1024,
  transitionSummaryBytes: 32 * 1024,
  overviewSamplesPerPeriod: 12,
  overviewTransitions: 48
});

export const HISTORY_LOOKUP_HASH = "fnv1a32-utf16";

export const HISTORY_LANES = Object.freeze([
  ...HISTORICAL_LAYERS,
  "unclassified"
]);

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

const UNDATED_PERIOD = Object.freeze({
  id: "undated",
  label: "연대 미상",
  start: null,
  end: null,
  undated: true
});

export const DEFAULT_HISTORY_PERIODS = Object.freeze([
  Object.freeze({ id: "before-1800", label: "1800년 이전", start: null, end: 1799 }),
  Object.freeze({ id: "1800-1935", label: "1800–1935", start: 1800, end: 1935 }),
  Object.freeze({ id: "1936-1945", label: "1936–1945", start: 1936, end: 1945 }),
  Object.freeze({ id: "1946-1959", label: "1946–1959", start: 1946, end: 1959 }),
  Object.freeze({ id: "1960-1979", label: "1960–1979", start: 1960, end: 1979 }),
  Object.freeze({ id: "1980-1999", label: "1980–1999", start: 1980, end: 1999 }),
  Object.freeze({ id: "2000-2014", label: "2000–2014", start: 2000, end: 2014 }),
  Object.freeze({ id: "2015-plus", label: "2015년 이후", start: 2015, end: null }),
  UNDATED_PERIOD
]);

const TRANSITION_KINDS = new Set(["responds_to", "enables", "precedes", "constrains"]);
const TRANSITION_ORDER = Object.freeze({ response: 0, enablement: 1, precedes: 2, constraint: 3 });

function compareText(left, right) {
  const a = String(left ?? "");
  const b = String(right ?? "");
  return a < b ? -1 : a > b ? 1 : 0;
}

function values(value) {
  return Array.isArray(value) ? value : value === undefined || value === null ? [] : [value];
}

function uniqueSorted(items) {
  return [...new Set(items.filter((item) => item !== undefined && item !== null && item !== ""))].sort(compareText);
}

function positiveLimit(value, fallback, maximum) {
  const number = Math.floor(Number(value));
  if (!Number.isFinite(number) || number < 1 || number > maximum) return fallback;
  return number;
}

function normalizedLimits(input = {}) {
  return {
    periodPageEvents: positiveLimit(input.periodPageEvents, HISTORY_LIMITS.periodPageEvents, HISTORY_LIMITS.periodPageEvents),
    shardTransitions: positiveLimit(input.shardTransitions, HISTORY_LIMITS.shardTransitions, HISTORY_LIMITS.shardTransitions),
    lookupShardRecords: positiveLimit(input.lookupShardRecords, HISTORY_LIMITS.lookupShardRecords, HISTORY_LIMITS.lookupShardRecords),
    transitionPreviewItems: positiveLimit(input.transitionPreviewItems, HISTORY_LIMITS.transitionPreviewItems, HISTORY_LIMITS.transitionPreviewItems),
    transitionDetailItems: positiveLimit(input.transitionDetailItems, HISTORY_LIMITS.transitionDetailItems, HISTORY_LIMITS.transitionDetailItems),
    transitionDetailBytes: positiveLimit(input.transitionDetailBytes, HISTORY_LIMITS.transitionDetailBytes, HISTORY_LIMITS.transitionDetailBytes),
    transitionSummaryBytes: positiveLimit(input.transitionSummaryBytes, HISTORY_LIMITS.transitionSummaryBytes, HISTORY_LIMITS.transitionSummaryBytes),
    overviewSamplesPerPeriod: positiveLimit(input.overviewSamplesPerPeriod, HISTORY_LIMITS.overviewSamplesPerPeriod, HISTORY_LIMITS.overviewSamplesPerPeriod),
    overviewTransitions: positiveLimit(input.overviewTransitions, HISTORY_LIMITS.overviewTransitions, HISTORY_LIMITS.overviewTransitions)
  };
}

/**
 * Browser-reimplementable stable history lookup hash.
 *
 * Contract: NFKC normalize, locale-lowercase with ko-KR, then apply FNV-1a
 * 32-bit to JavaScript UTF-16 code units in order.
 */
export function historyLookupHash(value) {
  const normalized = String(value).normalize("NFKC").toLocaleLowerCase("ko-KR");
  let hash = 2166136261;
  for (let index = 0; index < normalized.length; index += 1) {
    hash ^= normalized.charCodeAt(index);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash >>> 0;
}

function validLookupBucketCount(value) {
  const count = Number(value);
  return Number.isSafeInteger(count)
    && count >= 1
    && count <= 0x40000000
    && (count & (count - 1)) === 0;
}

/** Return a stable, zero-padded decimal bucket address for a history record id. */
export function historyLookupBucket(value, bucketCount, bucketWidth = String(Number(bucketCount) - 1).length) {
  if (!validLookupBucketCount(bucketCount)) {
    throw new Error(`History lookup bucketCount '${bucketCount}' must be a positive power of two`);
  }
  const width = Math.floor(Number(bucketWidth));
  const requiredWidth = String(bucketCount - 1).length;
  if (!Number.isSafeInteger(width) || width < requiredWidth) {
    throw new Error(`History lookup bucketWidth '${bucketWidth}' must be at least ${requiredWidth}`);
  }
  const index = (historyLookupHash(value) & (bucketCount - 1)) >>> 0;
  return { index, id: String(index).padStart(width, "0") };
}

function normalizedYear(value, field, nodeId) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  if (!Number.isInteger(number) || number < -9999 || number > 9999) {
    throw new Error(`History node '${nodeId}' has invalid ${field} '${value}'`);
  }
  return number;
}

function normalizePeriods(input = DEFAULT_HISTORY_PERIODS) {
  if (!Array.isArray(input) || !input.length) throw new Error("History periods must be a non-empty array");
  const dated = [];
  const ids = new Set();
  let undated = { ...UNDATED_PERIOD };
  for (const raw of input) {
    const id = String(raw?.id || "").trim();
    if (!id) throw new Error("History period is missing an id");
    if (id === UNDATED_PERIOD.id || raw?.undated) {
      undated = {
        ...UNDATED_PERIOD,
        label: String(raw.label || raw.title || UNDATED_PERIOD.label),
        title: String(raw.title || raw.label || UNDATED_PERIOD.label),
        question: String(raw.question || "")
      };
      continue;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new Error(`History period '${id}' has an unsafe id`);
    if (ids.has(id)) throw new Error(`Duplicate history period '${id}'`);
    ids.add(id);
    const start = normalizedYear(raw.start, "period start", id);
    const end = normalizedYear(raw.end, "period end", id);
    if (start === null && end === null) throw new Error(`Dated history period '${id}' needs at least one boundary`);
    if (start !== null && end !== null && start > end) throw new Error(`History period '${id}' starts after it ends`);
    dated.push({
      id,
      label: String(raw.label || raw.title || id),
      title: String(raw.title || raw.label || id),
      question: String(raw.question || ""),
      start,
      end,
      undated: false
    });
  }
  if (!dated.length) throw new Error("History periods need at least one dated period");
  dated.sort((left, right) => {
    if (left.start === null) return right.start === null ? compareText(left.id, right.id) : -1;
    if (right.start === null) return 1;
    return left.start - right.start || compareText(left.id, right.id);
  });
  if (dated[0].start !== null) throw new Error("The first history period must have start: null");
  if (dated.at(-1).end !== null) throw new Error("The last history period must have end: null");
  for (let index = 1; index < dated.length; index += 1) {
    const previous = dated[index - 1];
    const current = dated[index];
    if (previous.end === null || current.start === null || current.start !== previous.end + 1) {
      throw new Error(`History periods '${previous.id}' and '${current.id}' must be contiguous and non-overlapping`);
    }
  }
  return [...dated, undated];
}

function periodForYear(year, periods) {
  if (year === null) return periods.at(-1);
  const period = periods.slice(0, -1).find((candidate) => (
    (candidate.start === null || year >= candidate.start)
    && (candidate.end === null || year <= candidate.end)
  ));
  if (!period) throw new Error(`No history period contains year '${year}'`);
  return period;
}

function buildTime(node, periods) {
  const historical = node?.historical || {};
  const publicationYear = normalizedYear(historical.publicationYear, "publicationYear", node.id);
  const eventStart = normalizedYear(historical.eventStart, "eventStart", node.id);
  const eventEnd = normalizedYear(historical.eventEnd, "eventEnd", node.id);
  if (eventStart !== null && eventEnd !== null && eventStart > eventEnd) {
    throw new Error(`History node '${node.id}' has eventStart after eventEnd`);
  }
  if (eventEnd !== null && eventStart === null) {
    throw new Error(`History node '${node.id}' has eventEnd without eventStart`);
  }

  const event = eventStart !== null || eventEnd !== null;
  const status = event ? "event" : publicationYear !== null ? "publication" : "undated";
  const shape = status === "undated"
    ? "unknown"
    : status === "publication"
      ? "point"
      : eventStart !== null && eventEnd !== null
        ? eventStart === eventEnd ? "point" : "range"
        : "point";
  const anchorYear = event ? eventStart ?? eventEnd : publicationYear;
  const primaryPeriod = periodForYear(anchorYear, periods);
  const overlapPeriodIds = eventStart !== null && eventEnd !== null
    ? periods.slice(0, -1).filter((period) => (
      (period.end === null || eventStart <= period.end)
      && (period.start === null || eventEnd >= period.start)
    )).map((period) => period.id)
    : [primaryPeriod.id];

  return {
    status,
    shape,
    eventStart,
    eventEnd,
    publicationYear,
    note: historical.note ? String(historical.note) : null,
    anchorYear,
    openStart: shape === "open-start",
    openEnd: shape === "open-end",
    primaryPeriodId: primaryPeriod.id,
    overlapPeriodIds
  };
}

function eventCompare(left, right) {
  const leftUnknown = left.time.anchorYear === null ? 1 : 0;
  const rightUnknown = right.time.anchorYear === null ? 1 : 0;
  return leftUnknown - rightUnknown
    || Number(left.time.anchorYear || 0) - Number(right.time.anchorYear || 0)
    || Number(left.time.eventEnd ?? left.time.anchorYear ?? 0) - Number(right.time.eventEnd ?? right.time.anchorYear ?? 0)
    || HISTORY_LANES.indexOf(left.lane) - HISTORY_LANES.indexOf(right.lane)
    || compareText(left.id, right.id);
}

function compactEvent(node, periods) {
  const lane = node?.historical?.layer || "unclassified";
  if (!HISTORY_LANES.includes(lane)) throw new Error(`History node '${node.id}' has invalid lane '${lane}'`);
  return {
    id: String(node.id),
    title: String(node.title || node.id),
    aliases: uniqueSorted(values(node.aliases).map(String)),
    url: String(node.url || ""),
    category: String(node.category || ""),
    domains: uniqueSorted(values(node.domains).map(String)),
    status: String(node.status || ""),
    summary: String(node.summary || ""),
    lane,
    capabilityLayers: uniqueSorted(values(node.capabilityLayers).map(String)),
    time: buildTime(node, periods)
  };
}

function eventStub(event) {
  return {
    id: event.id,
    title: event.title,
    url: event.url,
    category: event.category,
    lane: event.lane,
    capabilityLayers: event.capabilityLayers,
    anchorYear: event.time.anchorYear,
    primaryPeriodId: event.time.primaryPeriodId,
    timeStatus: event.time.status
  };
}

function evenSample(items, limit) {
  if (items.length <= limit) return [...items];
  if (limit === 1) return [items[Math.floor((items.length - 1) / 2)]];
  const indexes = [];
  for (let index = 0; index < limit; index += 1) {
    indexes.push(Math.round((index * (items.length - 1)) / (limit - 1)));
  }
  return [...new Set(indexes)].map((index) => items[index]);
}

function edgeCompare(left, right) {
  return compareText(left.kind, right.kind)
    || compareText(left.source, right.source)
    || compareText(left.target, right.target)
    || compareText(left.id, right.id);
}

function chronologyFor(edge, eventsById) {
  const sourceYear = eventsById.get(edge.source)?.time.anchorYear ?? null;
  const targetYear = eventsById.get(edge.target)?.time.anchorYear ?? null;
  let expected = "unordered";
  if (edge.kind === "responds_to") expected = "target-before-source";
  else if (edge.kind === "precedes" || edge.kind === "enables") expected = "source-before-target";
  if (sourceYear === null || targetYear === null) {
    return { status: "unknown", expected, sourceYear, targetYear };
  }
  if (expected === "unordered") return { status: "observed", expected, sourceYear, targetYear };
  const consistent = expected === "target-before-source" ? targetYear <= sourceYear : sourceYear <= targetYear;
  return { status: consistent ? "consistent" : "conflict", expected, sourceYear, targetYear };
}

function compactTransitionEdge(edge, eventsById) {
  const notes = uniqueSorted(values(edge.contexts).map((context) => String(context?.note || "").trim()).filter(Boolean));
  return {
    id: String(edge.id),
    kind: String(edge.kind),
    source: String(edge.source),
    target: String(edge.target),
    directed: edge.directed !== false,
    direction: { from: String(edge.source), to: String(edge.target) },
    note: notes[0] || null,
    notes,
    evidence: uniqueSorted(values(edge.evidence).map(String)),
    chronology: chronologyFor(edge, eventsById)
  };
}

function transitionHash(value) {
  return createHash("sha256").update(String(value)).digest("hex").slice(0, 16);
}

function transitionRoleItems(role) {
  if (Array.isArray(role)) return role;
  return role?.id ? [role] : [];
}

function transitionRoleOrder(type, roles = {}) {
  return type === "response" || type === "enablement"
    ? ["limitation", "response", "capability"]
    : type === "precedes"
      ? ["before", "after"]
      : type === "constraint"
        ? ["constraint", "constrained"]
        : Object.keys(roles).sort(compareText);
}

function transitionTitle(type, roles, itemLimit = Number.POSITIVE_INFINITY) {
  const roleOrder = transitionRoleOrder(type, roles);
  const totalItems = roleOrder.reduce((sum, role) => sum + transitionRoleItems(roles[role]).length, 0);
  if (totalItems <= itemLimit) {
    return roleOrder.flatMap((role) => transitionRoleItems(roles[role]))
      .map((item) => String(item.title || item.id))
      .join(" → ");
  }
  return roleOrder.flatMap((role) => {
    const items = transitionRoleItems(roles[role]);
    if (!items.length) return [];
    const title = String(items[0].title || items[0].id);
    return [items.length === 1 ? title : `${title} 외 ${items.length - 1}개`];
  }).join(" → ");
}

function transitionRecord({ id, type, completeness, roles, edges, eventsById, responseId = null, anchorNodeId = responseId }) {
  const roleNodeIds = uniqueSorted(Object.values(roles).flatMap((role) => (
    Array.isArray(role) ? role.map((item) => item.id) : role?.id ? [role.id] : []
  )));
  const roleEvents = roleNodeIds.map((nodeId) => eventsById.get(nodeId)).filter(Boolean);
  const hasSemanticAnchor = Boolean(anchorNodeId && eventsById.has(anchorNodeId));
  const anchor = hasSemanticAnchor ? eventsById.get(anchorNodeId).time.anchorYear : null;
  const knownYears = roleEvents.map((event) => event.time.anchorYear).filter((year) => year !== null).sort((a, b) => a - b);
  const primaryPeriodIds = uniqueSorted(roleEvents.map((event) => event.time.primaryPeriodId));
  const periodIds = uniqueSorted(roleEvents.flatMap((event) => event.time.overlapPeriodIds));
  return {
    id,
    kind: "transition",
    title: transitionTitle(type, roles, HISTORY_LIMITS.transitionPreviewItems),
    type,
    completeness,
    responseId,
    anchorNodeId,
    roles,
    roleNodeIds,
    lanes: uniqueSorted(roleEvents.map((event) => event.lane)),
    capabilityLayers: uniqueSorted(roleEvents.flatMap((event) => event.capabilityLayers)),
    edges: edges.map((edge) => compactTransitionEdge(edge, eventsById)),
    anchorYear: hasSemanticAnchor ? anchor : knownYears[0] ?? null,
    primaryPeriodIds,
    periodIds
  };
}

function transitionCompare(left, right) {
  const leftUnknown = left.anchorYear === null ? 1 : 0;
  const rightUnknown = right.anchorYear === null ? 1 : 0;
  return leftUnknown - rightUnknown
    || Number(left.anchorYear || 0) - Number(right.anchorYear || 0)
    || (TRANSITION_ORDER[left.type] ?? 99) - (TRANSITION_ORDER[right.type] ?? 99)
    || compareText(left.id, right.id);
}

function buildTransitions(edges, eventsById) {
  const filtered = values(edges).filter((edge) => (
    edge?.origin === "curated"
    && TRANSITION_KINDS.has(edge.kind)
    && eventsById.has(edge.source)
    && eventsById.has(edge.target)
  )).sort(edgeCompare);
  const respondsBySource = new Map();
  const enablesBySource = new Map();
  for (const edge of filtered) {
    const map = edge.kind === "responds_to" ? respondsBySource : edge.kind === "enables" ? enablesBySource : null;
    if (!map) continue;
    if (!map.has(edge.source)) map.set(edge.source, []);
    map.get(edge.source).push(edge);
  }

  const transitions = [];
  const usedEnableEdges = new Set();
  for (const responseId of [...respondsBySource.keys()].sort(compareText)) {
    const responseEdges = respondsBySource.get(responseId);
    const enableEdges = enablesBySource.get(responseId) || [];
    enableEdges.forEach((edge) => usedEnableEdges.add(edge.id));
    transitions.push(transitionRecord({
      id: `node-transition-${transitionHash(responseId)}`,
      type: "response",
      completeness: enableEdges.length ? "complete" : "partial",
      roles: {
        limitation: responseEdges.map((edge) => eventStub(eventsById.get(edge.target))),
        response: eventStub(eventsById.get(responseId)),
        capability: enableEdges.map((edge) => eventStub(eventsById.get(edge.target)))
      },
      edges: [...responseEdges, ...enableEdges].sort(edgeCompare),
      eventsById,
      responseId
    }));
  }

  for (const responseId of [...enablesBySource.keys()].sort(compareText)) {
    const enableEdges = enablesBySource.get(responseId).filter((edge) => !usedEnableEdges.has(edge.id));
    if (!enableEdges.length) continue;
    transitions.push(transitionRecord({
      id: `node-transition-${transitionHash(responseId)}`,
      type: "enablement",
      completeness: "partial",
      roles: {
        limitation: [],
        response: eventStub(eventsById.get(responseId)),
        capability: enableEdges.map((edge) => eventStub(eventsById.get(edge.target)))
      },
      edges: enableEdges.sort(edgeCompare),
      eventsById,
      responseId
    }));
  }

  for (const edge of filtered.filter((candidate) => candidate.kind === "precedes")) {
    transitions.push(transitionRecord({
      id: `precedes-${transitionHash(edge.id)}`,
      type: "precedes",
      completeness: "complete",
      roles: {
        before: eventStub(eventsById.get(edge.source)),
        after: eventStub(eventsById.get(edge.target))
      },
      edges: [edge],
      eventsById,
      anchorNodeId: edge.source
    }));
  }
  for (const edge of filtered.filter((candidate) => candidate.kind === "constrains")) {
    transitions.push(transitionRecord({
      id: `constraint-${transitionHash(edge.id)}`,
      type: "constraint",
      completeness: "complete",
      roles: {
        constraint: eventStub(eventsById.get(edge.source)),
        constrained: eventStub(eventsById.get(edge.target))
      },
      edges: [edge],
      eventsById,
      anchorNodeId: edge.source
    }));
  }
  return transitions.sort(transitionCompare);
}

function transitionEdgeRoles(type, edge) {
  if (type === "response" || type === "enablement") {
    return edge.kind === "responds_to"
      ? { sourceRole: "response", targetRole: "limitation" }
      : { sourceRole: "response", targetRole: "capability" };
  }
  if (type === "precedes") return { sourceRole: "before", targetRole: "after" };
  if (type === "constraint") return { sourceRole: "constraint", targetRole: "constrained" };
  return { sourceRole: "source", targetRole: "target" };
}

function transitionRoleRecords(transition) {
  const records = [];
  const seen = new Set();
  for (const role of transitionRoleOrder(transition.type, transition.roles)) {
    for (const item of transitionRoleItems(transition.roles[role])) {
      const key = `${role}\u0000${item.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      records.push({ role, ...item });
    }
  }
  return records;
}

function balancedEdgePreview(transition, limit) {
  if (transition.edges.length <= limit) return [...transition.edges];
  const groups = new Map();
  for (const edge of transition.edges) {
    const roles = transitionEdgeRoles(transition.type, edge);
    const key = `${roles.sourceRole}\u0000${roles.targetRole}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(edge);
  }
  const queues = [...groups.entries()].sort((left, right) => compareText(left[0], right[0])).map(([, items]) => [...items]);
  const selected = [];
  while (selected.length < limit && queues.some((items) => items.length)) {
    for (const items of queues) {
      if (selected.length >= limit) break;
      if (items.length) selected.push(items.shift());
    }
  }
  return selected.sort(edgeCompare);
}

function truncateText(value, limit) {
  const text = String(value ?? "");
  return text.length <= limit ? text : `${text.slice(0, Math.max(0, limit - 1))}…`;
}

function previewEventStub(item) {
  return {
    ...item,
    title: truncateText(item.title, 180),
    url: truncateText(item.url, 512)
  };
}

function previewTransitionEdge(edge) {
  return {
    ...edge,
    note: edge.note ? truncateText(edge.note, 240) : null,
    notes: edge.notes.slice(0, 2).map((note) => truncateText(note, 240)),
    evidence: edge.evidence.slice(0, 4),
    noteCount: edge.notes.length,
    evidenceCount: edge.evidence.length
  };
}

function previewTransitionRoles(transition, previewEdges) {
  const selected = new Map(transitionRoleOrder(transition.type, transition.roles).map((role) => [role, new Set()]));
  for (const edge of previewEdges) {
    const { sourceRole, targetRole } = transitionEdgeRoles(transition.type, edge);
    if (!selected.has(sourceRole)) selected.set(sourceRole, new Set());
    if (!selected.has(targetRole)) selected.set(targetRole, new Set());
    selected.get(sourceRole).add(edge.source);
    selected.get(targetRole).add(edge.target);
  }
  return Object.fromEntries(transitionRoleOrder(transition.type, transition.roles).map((role) => {
    const original = transition.roles[role];
    const ids = selected.get(role) || new Set();
    if (Array.isArray(original)) {
      return [role, original.filter((item) => ids.has(item.id)).map(previewEventStub)];
    }
    return [role, original?.id ? previewEventStub(original) : original];
  }));
}

function historyPayloadBytes(payload) {
  return Buffer.byteLength(JSON.stringify(payload));
}

function transitionDetailPage(contentVersion, transition, roleRecords, edges, page, pageCount, totals) {
  const pageId = String(page).padStart(4, "0");
  return withVersion(contentVersion, {
    id: `${transition.id}--page-${pageId}`,
    kind: "history-transition-detail-page",
    transitionId: transition.id,
    page,
    pageCount,
    roleNodes: roleRecords,
    edges,
    stats: {
      records: roleRecords.length + edges.length,
      roleNodes: roleRecords.length,
      edges: edges.length,
      totalRecords: totals.records,
      totalRoleNodes: totals.roleNodes,
      totalEdges: totals.edges
    }
  });
}

function paginateTransitionDetails(transition, contentVersion, limits) {
  const roleRecords = transitionRoleRecords(transition);
  const roleByKey = new Map(roleRecords.map((value) => [`${value.role}:${value.id}`, value]));
  const emittedRoles = new Set();
  const groups = [];
  for (const edge of transition.edges) {
    const group = [];
    const { sourceRole, targetRole } = transitionEdgeRoles(transition.type, edge);
    for (const [role, id] of [[sourceRole, edge.source], [targetRole, edge.target]]) {
      const key = `${role}:${id}`;
      if (!emittedRoles.has(key) && roleByKey.has(key)) {
        emittedRoles.add(key);
        group.push({ kind: "role", value: roleByKey.get(key) });
      }
    }
    group.push({ kind: "edge", value: edge });
    groups.push(group);
  }
  for (const [key, value] of roleByKey) {
    if (!emittedRoles.has(key)) groups.push([{ kind: "role", value }]);
  }
  const records = groups.flat();
  const totals = { records: records.length, roleNodes: roleRecords.length, edges: transition.edges.length };
  const chunks = [];
  let current = [];
  const estimatedPage = Math.max(1, records.length);
  const payloadFor = (members) => transitionDetailPage(
    contentVersion,
    transition,
    members.filter((item) => item.kind === "role").map((item) => item.value),
    members.filter((item) => item.kind === "edge").map((item) => item.value),
    estimatedPage,
    estimatedPage,
    totals
  );
  for (const group of groups) {
    const candidate = [...current, ...group];
    if (candidate.length <= limits.transitionDetailItems
      && historyPayloadBytes(payloadFor(candidate)) <= limits.transitionDetailBytes) {
      current = candidate;
      continue;
    }
    if (!current.length) {
      throw new Error(`History transition '${transition.id}' has one detail record exceeding the ${limits.transitionDetailBytes}-byte page limit`);
    }
    chunks.push(current);
    current = [...group];
    if (current.length > limits.transitionDetailItems || historyPayloadBytes(payloadFor(current)) > limits.transitionDetailBytes) {
      throw new Error(`History transition '${transition.id}' has one detail record exceeding the ${limits.transitionDetailBytes}-byte page limit`);
    }
  }
  if (current.length) chunks.push(current);

  const pages = chunks.map((members, index) => transitionDetailPage(
    contentVersion,
    transition,
    members.filter((item) => item.kind === "role").map((item) => item.value),
    members.filter((item) => item.kind === "edge").map((item) => item.value),
    index + 1,
    chunks.length,
    totals
  ));
  for (const page of pages) {
    if (page.stats.records > limits.transitionDetailItems || historyPayloadBytes(page) > limits.transitionDetailBytes) {
      throw new Error(`History transition detail page '${page.id}' exceeds its declared payload bounds`);
    }
  }
  return { pages, totals };
}

function projectTransitions(transitions, contentVersion, limits) {
  const summaries = [];
  const detailShards = {};
  let paginatedCount = 0;
  for (const transition of transitions) {
    const roleRecords = transitionRoleRecords(transition);
    const inline = {
      ...transition,
      roleNodeCount: roleRecords.length,
      edgeCount: transition.edges.length,
      preview: {
        roleNodeCount: roleRecords.length,
        edgeCount: transition.edges.length,
        truncated: false
      }
    };
    if (transition.edges.length <= limits.transitionPreviewItems
      && historyPayloadBytes(inline) <= limits.transitionSummaryBytes) {
      summaries.push(inline);
      continue;
    }

    const previewEdges = balancedEdgePreview(transition, limits.transitionPreviewItems);
    const roles = previewTransitionRoles(transition, previewEdges);
    const roleNodeIds = uniqueSorted(Object.values(roles).flatMap((role) => transitionRoleItems(role).map((item) => item.id)));
    const { pages, totals } = paginateTransitionDetails(transition, contentVersion, limits);
    const detail = {
      kind: "paginated",
      route: `transitions/${transition.id}/page-{page}.json`,
      pageWidth: 4,
      pageCount: pages.length,
      itemCount: totals.records,
      roleNodeCount: totals.roleNodes,
      edgeCount: totals.edges,
      recordLimit: limits.transitionDetailItems,
      byteLimit: limits.transitionDetailBytes,
      truncated: true
    };
    const summary = {
      ...transition,
      title: truncateText(transitionTitle(transition.type, transition.roles, limits.transitionPreviewItems), 360),
      roles,
      roleNodeIds,
      roleNodeCount: totals.roleNodes,
      edges: previewEdges.map(previewTransitionEdge),
      edgeCount: totals.edges,
      preview: {
        roleNodeCount: roleNodeIds.length,
        edgeCount: previewEdges.length,
        truncated: true
      },
      detail
    };
    if (historyPayloadBytes(summary) > limits.transitionSummaryBytes) {
      throw new Error(`History transition summary '${transition.id}' exceeds the ${limits.transitionSummaryBytes}-byte limit`);
    }
    summaries.push(summary);
    paginatedCount += 1;
    for (const page of pages) detailShards[page.id] = page;
  }
  return {
    summaries,
    detailShards,
    descriptor: {
      kind: "paginated",
      route: "transitions/{transition}/page-{page}.json",
      pageWidth: 4,
      recordLimit: limits.transitionDetailItems,
      byteLimit: limits.transitionDetailBytes,
      previewItemLimit: limits.transitionPreviewItems,
      summaryByteLimit: limits.transitionSummaryBytes,
      paginatedCount,
      shardCount: Object.keys(detailShards).length
    }
  };
}

function canonicalContext(context = {}) {
  return {
    ...(context.note ? { note: String(context.note) } : {}),
    ...(context.pageId ? { pageId: String(context.pageId) } : {}),
    ...(context.section ? { section: String(context.section) } : {})
  };
}

function contentFingerprint(periods, limits, events, edges) {
  const canonicalEdges = edges.filter((edge) => (
    edge?.origin === "curated" && TRANSITION_KINDS.has(edge.kind)
  )).map((edge) => ({
    id: String(edge.id),
    kind: String(edge.kind),
    source: String(edge.source),
    target: String(edge.target),
    directed: edge.directed !== false,
    evidence: uniqueSorted(values(edge.evidence).map(String)),
    contexts: values(edge.contexts).map(canonicalContext)
      .sort((left, right) => compareText(JSON.stringify(left), JSON.stringify(right)))
  })).sort(edgeCompare);
  const canonicalEvents = [...events].sort((left, right) => compareText(left.id, right.id)).map((event) => ({
    id: event.id,
    title: event.title,
    aliases: event.aliases,
    url: event.url,
    category: event.category,
    domains: event.domains,
    status: event.status,
    summary: event.summary,
    lane: event.lane,
    capabilityLayers: event.capabilityLayers,
    time: event.time
  }));
  return createHash("sha256").update(JSON.stringify({ periods, limits, events: canonicalEvents, edges: canonicalEdges }))
    .digest("hex").slice(0, 16);
}

function withVersion(contentVersion, payload) {
  return { schemaVersion: HISTORY_SCHEMA_VERSION, contentVersion, ...payload };
}

function buildLookupShards(entries, transitions, recordLimit, contentVersion) {
  const records = [
    ...entries.map((value) => ({ type: "entry", id: value.id, value })),
    ...transitions.map((value) => ({ type: "transition", id: value.id, value }))
  ];
  const hashCounts = new Map();
  for (const record of records) {
    const hash = historyLookupHash(record.id);
    hashCounts.set(hash, (hashCounts.get(hash) || 0) + 1);
    if (hashCounts.get(hash) > recordLimit) {
      throw new Error(`History lookup hash collision exceeds the ${recordLimit}-record shard limit`);
    }
  }

  let bucketCount = 1;
  while (true) {
    const counts = new Uint32Array(bucketCount);
    let overflow = false;
    for (const record of records) {
      const index = historyLookupBucket(record.id, bucketCount).index;
      counts[index] += 1;
      if (counts[index] > recordLimit) {
        overflow = true;
        break;
      }
    }
    if (!overflow) break;
    if (bucketCount >= 0x40000000) {
      throw new Error(`History lookup cannot satisfy the ${recordLimit}-record shard limit`);
    }
    bucketCount *= 2;
  }

  const bucketWidth = String(bucketCount - 1).length;
  const buckets = Array.from({ length: bucketCount }, () => ({ entries: [], transitions: [] }));
  for (const record of records) {
    const bucket = historyLookupBucket(record.id, bucketCount, bucketWidth);
    buckets[bucket.index][record.type === "entry" ? "entries" : "transitions"].push(record.value);
  }

  const lookupShards = {};
  for (let index = 0; index < bucketCount; index += 1) {
    const id = String(index).padStart(bucketWidth, "0");
    const bucket = buckets[index];
    lookupShards[id] = withVersion(contentVersion, {
      id,
      kind: "history-lookup-shard",
      bucket: {
        id,
        index,
        bucketCount,
        bucketWidth,
        hash: HISTORY_LOOKUP_HASH
      },
      entries: bucket.entries,
      transitions: bucket.transitions,
      stats: {
        records: bucket.entries.length + bucket.transitions.length,
        documents: bucket.entries.length,
        transitions: bucket.transitions.length
      }
    });
  }

  return {
    descriptor: {
      kind: "sharded",
      hash: HISTORY_LOOKUP_HASH,
      bucketCount,
      bucketWidth,
      route: "lookup/bucket-{bucket}.json",
      recordLimit
    },
    lookupShards
  };
}

/**
 * Build the bounded historical lens directly from the normalized knowledge graph.
 * Wiki creation and update timestamps are deliberately outside this data contract.
 */
export function buildHistoricalLens(graph = {}, options = {}) {
  const periods = normalizePeriods(options.periods || DEFAULT_HISTORY_PERIODS);
  const limits = normalizedLimits(options.limits);
  const publicNodes = values(graph.nodes).filter((node) => (node?.visibility || "public") === "public");
  const events = publicNodes.map((node) => compactEvent(node, periods));
  const eventsById = new Map();
  for (const event of events) {
    if (!event.id) throw new Error("History event is missing a stable node id");
    if (eventsById.has(event.id)) throw new Error(`Duplicate history event '${event.id}'`);
    eventsById.set(event.id, event);
  }

  const periodEvents = new Map(periods.map((period) => [period.id, []]));
  for (const event of events) periodEvents.get(event.time.primaryPeriodId).push(event);
  for (const members of periodEvents.values()) members.sort(eventCompare);

  const locations = new Map();
  for (const period of periods) {
    const members = periodEvents.get(period.id);
    members.forEach((event, index) => {
      const page = Math.floor(index / limits.periodPageEvents) + 1;
      locations.set(event.id, {
        periodId: period.id,
        page,
        shard: `eras/${period.id}/page-${String(page).padStart(4, "0")}.json`
      });
    });
  }
  const locatedEvents = events.map((event) => ({ ...event, location: locations.get(event.id) }));
  const locatedById = new Map(locatedEvents.map((event) => [event.id, event]));
  const internalTransitions = buildTransitions(values(graph.edges), locatedById).map((transition) => ({
    ...transition,
    location: locations.get(transition.anchorNodeId || transition.responseId || transition.roleNodeIds[0]) || null
  }));
  const contentVersion = contentFingerprint(periods, limits, events, values(graph.edges));
  const projectedTransitions = projectTransitions(internalTransitions, contentVersion, limits);
  const transitions = projectedTransitions.summaries;
  const transitionById = new Map(transitions.map((transition) => [transition.id, transition]));

  const transitionsByRole = new Map(locatedEvents.map((event) => [event.id, []]));
  for (const transition of internalTransitions) {
    const summary = transitionById.get(transition.id);
    for (const roleId of transition.roleNodeIds) transitionsByRole.get(roleId)?.push(summary);
  }

  const shards = {};
  const shardRecords = [];
  const periodRecords = [];
  for (const period of periods) {
    const members = periodEvents.get(period.id);
    const pageCount = Math.max(1, Math.ceil(members.length / limits.periodPageEvents));
    const periodShardRecords = [];
    for (let page = 1; page <= pageCount; page += 1) {
      const pageMembers = members.slice((page - 1) * limits.periodPageEvents, page * limits.periodPageEvents)
        .map((event) => locatedById.get(event.id));
      const candidates = new Map();
      for (const event of pageMembers) {
        for (const transition of transitionsByRole.get(event.id) || []) candidates.set(transition.id, transition);
      }
      const rankedTransitions = [...candidates.values()].sort(transitionCompare);
      const visibleTransitions = rankedTransitions.slice(0, limits.shardTransitions);
      const roleNodeIds = uniqueSorted(visibleTransitions.flatMap((transition) => transition.roleNodeIds));
      const id = `${period.id}--page-${String(page).padStart(4, "0")}`;
      const url = `eras/${period.id}/page-${String(page).padStart(4, "0")}.json`;
      const payload = withVersion(contentVersion, {
        id,
        kind: "history-period-page",
        period,
        page,
        pageCount,
        events: pageMembers,
        transitions: visibleTransitions,
        roleNodes: roleNodeIds.map((nodeId) => eventStub(locatedById.get(nodeId))),
        stats: {
          periodEvents: members.length,
          pageEvents: pageMembers.length,
          candidateTransitions: rankedTransitions.length,
          visibleTransitions: visibleTransitions.length,
          truncatedTransitions: rankedTransitions.length > visibleTransitions.length
        }
      });
      shards[id] = payload;
      const record = {
        id,
        periodId: period.id,
        page,
        url,
        route: page === 1 ? `/map/history/${period.id}/` : `/map/history/${period.id}/${page}/`,
        eventCount: pageMembers.length,
        transitionCount: visibleTransitions.length
      };
      shardRecords.push(record);
      periodShardRecords.push(record);
    }
    const laneCounts = Object.fromEntries(HISTORY_LANES.map((lane) => [lane, members.filter((event) => event.lane === lane).length]));
    const overlapCount = locatedEvents.filter((event) => event.time.overlapPeriodIds.includes(period.id)).length;
    const transitionCount = transitions.filter((transition) => transition.periodIds.includes(period.id)).length;
    periodRecords.push({
      ...period,
      eventCount: members.length,
      overlapCount,
      transitionCount,
      pageCount,
      laneCounts,
      shards: periodShardRecords.map((record) => record.url)
    });
  }

  const overviewPeriods = periodRecords.map((period) => {
    const members = periodEvents.get(period.id).map((event) => locatedById.get(event.id));
    return {
      ...period,
      sampleEvents: evenSample(members, limits.overviewSamplesPerPeriod).map(eventStub),
      transitionCount: transitions.filter((transition) => transition.periodIds.includes(period.id)).length
    };
  });
  const overview = withVersion(contentVersion, {
    kind: "history-overview",
    periods: overviewPeriods,
    transitions: evenSample(transitions, limits.overviewTransitions),
    stats: {
      documents: locatedEvents.length,
      datedDocuments: locatedEvents.filter((event) => event.time.status !== "undated").length,
      undatedDocuments: locatedEvents.filter((event) => event.time.status === "undated").length,
      transitions: transitions.length
    }
  });

  const lookupEntries = [...locatedEvents].sort((left, right) => compareText(left.title, right.title) || compareText(left.id, right.id));
  const lookup = buildLookupShards(lookupEntries, transitions, limits.lookupShardRecords, contentVersion);

  const lanes = HISTORY_LANES.map((id, order) => ({ id, label: LANE_LABELS[id], order, unclassified: id === "unclassified" }));
  const manifest = {
    schemaVersion: HISTORY_SCHEMA_VERSION,
    contentVersion,
    routes: {
      overview: "overview.json",
      lookup: lookup.descriptor.route,
      periodPage: "eras/{period}/page-{page}.json",
      transitionDetail: projectedTransitions.descriptor.route
    },
    overview: { url: "overview.json" },
    lookup: lookup.descriptor,
    transitionDetails: projectedTransitions.descriptor,
    periods: periodRecords,
    lanes,
    shards: shardRecords,
    eraShards: Object.fromEntries(periodRecords.map((period) => [period.id, period.shards[0]])),
    partShards: Object.fromEntries(shardRecords.map((record) => [record.id, record.url])),
    periodShards: Object.fromEntries(periodRecords.map((period) => [period.id, period.shards])),
    facets: {
      eras: periodRecords.map((period) => period.id),
      parts: shardRecords.map((record) => record.id),
      layers: lanes.map((lane) => lane.id),
      capabilities: uniqueSorted(locatedEvents.flatMap((event) => event.capabilityLayers)),
      displays: ["all", "events", "transitions"]
    },
    limits,
    stats: {
      documents: locatedEvents.length,
      eventDocuments: locatedEvents.filter((event) => event.time.status === "event").length,
      publicationDocuments: locatedEvents.filter((event) => event.time.status === "publication").length,
      datedDocuments: locatedEvents.filter((event) => event.time.status !== "undated").length,
      undatedDocuments: locatedEvents.filter((event) => event.time.status === "undated").length,
      periods: periods.length,
      lanes: lanes.length,
      transitions: transitions.length,
      completeTransitions: transitions.filter((transition) => transition.completeness === "complete").length,
      partialTransitions: transitions.filter((transition) => transition.completeness === "partial").length,
      paginatedTransitions: transitions.filter((transition) => transition.detail?.truncated).length,
      transitionDetailShards: Object.keys(projectedTransitions.detailShards).length,
      lookupShards: lookup.descriptor.bucketCount,
      shards: shardRecords.length
    }
  };

  return {
    manifest,
    overview,
    lookupShards: lookup.lookupShards,
    shards,
    transitions,
    transitionDetails: projectedTransitions.detailShards
  };
}
