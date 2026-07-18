import assert from "node:assert/strict";
import test from "node:test";
import {
  createHistoryRequestGate,
  describeHistoryTransition,
  focusHistoryNavigation,
  historyLensPageUrlFor,
  historyLensStateFromHistory,
  historySearchOptionId,
  historyTransitionDetailPageView,
  historyTimeLabel,
  historyVersionedAssetUrl,
  initializeHistoryLens,
  mergeHistoryTransitionDetails,
  normalizeHistoryView,
  parseHistoryLensPageUrl
} from "../site/assets/history-lens.js";
import { historyHistoryEntry, historyLookupBucket } from "../site/assets/history-state.js";

test("time labels preserve event points, ranges, publications, BCE, and missing years", () => {
  assert.equal(historyTimeLabel({ time: { status: "event", shape: "range", eventStart: 1936, eventEnd: 1945 } }), "1936년–1945년");
  assert.equal(historyTimeLabel({ time: { status: "event", shape: "point", eventStart: 1948, eventEnd: 1948 } }), "1948년");
  assert.equal(historyTimeLabel({ time: { status: "publication", publicationYear: 1965 } }), "1965년 출판");
  assert.equal(historyTimeLabel({ time: { status: "event", shape: "point", eventStart: 2015 } }), "2015년");
  assert.equal(historyTimeLabel({ time: { status: "event", shape: "point", anchorYear: -300 } }), "기원전 300년");
  assert.equal(historyTimeLabel({ time: { status: "event", shape: "range", eventStart: 1946, eventEnd: 2009, publicationYear: 2011 } }), "사건 1946년–2009년 · 2011년 출판");
  assert.equal(historyTimeLabel({ created: "2026-07-18", updated: "2026-07-18" }), "연도 미기록");
});

test("navigation focus survives era and page DOM replacement", () => {
  const era = { focused: 0, focus() { this.focused += 1; } };
  const stage = { focused: 0, tabIndex: 0, focus() { this.focused += 1; } };
  const root = { querySelector: (selector) => selector.includes('data-history-action="era"') ? era : null };
  assert.equal(focusHistoryNavigation(root, stage, "era"), era);
  assert.equal(era.focused, 1);
  assert.equal(stage.focused, 0);
  assert.equal(focusHistoryNavigation(root, stage, "overview"), stage);
  assert.equal(stage.tabIndex, -1);
  assert.equal(stage.focused, 1);
});

test("Korean search options receive distinct DOM ids even when ASCII sanitization collides", () => {
  const first = historySearchOptionId("concepts-계산-가능성", 0);
  const second = historySearchOptionId("concepts-튜링-기계", 1);
  assert.notEqual(first, second);
  assert.match(first, /^history-search-[a-z0-9_-]+$/);
  assert.match(second, /^history-search-[a-z0-9_-]+$/);
});

function historyEvent(id, title, anchorYear, lane, extra = {}) {
  return {
    id,
    title,
    lane,
    capabilityLayers: [],
    time: {
      status: anchorYear === null ? "undated" : "event",
      shape: anchorYear === null ? "unknown" : "point",
      anchorYear,
      eventStart: anchorYear,
      eventEnd: anchorYear,
      publicationYear: null,
      note: null,
      primaryPeriodId: anchorYear === null ? "undated" : "1936-1945",
      overlapPeriodIds: [anchorYear === null ? "undated" : "1936-1945"]
    },
    ...extra
  };
}

test("history payloads normalize builder shapes without mutating or losing temporal meaning", () => {
  const payload = {
    kind: "history-period-page",
    period: { id: "1936-1945", label: "1936–1945" },
    events: [
      historyEvent("later", "후기", 1945, "machine"),
      historyEvent("earlier", "초기", 1936, "theory", { location: { shard: "eras/1936-1945/page-0001.json" } })
    ],
    transitions: [
      { id: "z", kind: "transition", type: "constraint", anchorYear: 1940, completeness: "complete", roles: {}, edges: [] },
      { id: "a", kind: "transition", type: "response", anchorYear: 1939, completeness: "partial", roles: {}, edges: [] }
    ],
    roleNodes: [{ id: "context", title: "문맥", lane: "software", anchorYear: 1941 }]
  };
  const before = structuredClone(payload);
  const view = normalizeHistoryView(payload, { maxTransitions: 1 });
  assert.deepEqual(view.events.map(({ id }) => id), ["earlier", "later"]);
  assert.equal(view.events[0].anchorYear, 1936);
  assert.equal(view.events[0].historicalLayer, "theory");
  assert.equal(view.events[0].location.shard, "eras/1936-1945/page-0001.json");
  assert.deepEqual(view.transitions.map(({ id }) => id), ["a"]);
  assert.equal(view.stats.truncatedTransitions, true);
  assert.equal(view.roleNodes[0].id, "context");
  assert.deepEqual(payload, before);
});

test("overview normalization retains periods and their deterministic sample events", () => {
  const view = normalizeHistoryView({
    periods: [{
      id: "formalization",
      title: "형식화",
      sampleEvents: [historyEvent("b", "B", 1940, "machine"), historyEvent("a", "A", 1936, "theory")]
    }]
  });
  assert.equal(view.periods[0].label, "형식화");
  assert.deepEqual(view.periods[0].sampleEvents.map(({ id }) => id), ["a", "b"]);
});

const completeResponse = {
  id: "response-memory",
  kind: "transition",
  type: "response",
  completeness: "complete",
  anchorYear: 2005,
  roles: {
    limitation: [{ id: "memory-wall", title: "메모리 장벽", lane: "architecture" }],
    response: { id: "parallelism", title: "병렬 처리", lane: "architecture" },
    capability: [{ id: "scalability", title: "확장성", lane: "system" }]
  },
  edges: [
    {
      id: "responds",
      kind: "responds_to",
      source: "parallelism",
      target: "memory-wall",
      note: "병렬 처리는 단일 처리 경로의 병목에 대응한다.",
      evidence: ["source-amdahl"]
    },
    {
      id: "enables",
      kind: "enables",
      source: "parallelism",
      target: "scalability",
      note: "작업 분할은 더 큰 문제 규모를 처리하게 한다.",
      evidence: ["source-berkeley"]
    }
  ]
};

test("complete response descriptions expose limitation, response, capability, notes, evidence, and stored direction", () => {
  const description = describeHistoryTransition(completeResponse);
  assert.equal(description.label, "한계에 대한 대응");
  assert.equal(description.completenessLabel, "완전한 전환");
  assert.equal(description.path, "메모리 장벽 → 병렬 처리 → 확장성");
  assert.deepEqual(description.steps.map(({ label }) => label), ["한계", "대응", "새 능력"]);
  assert.match(description.edges[0].direction, /저장 방향은 “병렬 처리” → “메모리 장벽”/);
  assert.match(description.edges[0].direction, /한계 “메모리 장벽” → 대응 “병렬 처리”/);
  assert.equal(description.edges[0].note, "병렬 처리는 단일 처리 경로의 병목에 대응한다.");
  assert.deepEqual(description.edges[0].evidence, ["source-amdahl"]);
  assert.match(description.edges[1].direction, /대응 “병렬 처리” → 새 능력 “확장성”/);
});

test("partial responses never invent a missing capability", () => {
  const partial = structuredClone(completeResponse);
  partial.id = "response-partial";
  partial.completeness = "partial";
  partial.roles.capability = [];
  partial.edges = partial.edges.slice(0, 1);
  const description = describeHistoryTransition(partial);
  assert.equal(description.completenessLabel, "부분 전환");
  assert.equal(description.steps[2].records.length, 0);
  assert.equal(description.steps[2].missing, "새 능력 관계 미기록");
  assert.equal(description.path, "메모리 장벽 → 병렬 처리 → 새 능력 관계 미기록");
});

test("paginated transition details merge exact roles, directions, notes, and evidence", () => {
  const summary = {
    ...structuredClone(completeResponse),
    roles: {
      limitation: [completeResponse.roles.limitation[0]],
      response: completeResponse.roles.response,
      capability: []
    },
    roleNodeCount: 3,
    edgeCount: 2,
    edges: [completeResponse.edges[0]],
    detail: {
      kind: "paginated",
      pageCount: 2,
      itemCount: 5,
      roleNodeCount: 3,
      edgeCount: 2
    },
    preview: { truncated: true, roleNodeCount: 2, edgeCount: 1 }
  };
  const pages = [
    {
      kind: "history-transition-detail-page",
      transitionId: summary.id,
      page: 1,
      pageCount: 2,
      roleNodes: [
        { role: "limitation", ...completeResponse.roles.limitation[0] },
        { role: "response", ...completeResponse.roles.response }
      ],
      edges: [completeResponse.edges[0]]
    },
    {
      kind: "history-transition-detail-page",
      transitionId: summary.id,
      page: 2,
      pageCount: 2,
      roleNodes: [{ role: "capability", ...completeResponse.roles.capability[0] }],
      edges: [completeResponse.edges[1]]
    }
  ];
  const merged = mergeHistoryTransitionDetails(summary, pages);
  assert.equal(merged.detail.loaded, true);
  assert.equal(merged.preview.truncated, false);
  assert.equal(merged.roles.capability[0].id, "scalability");
  assert.deepEqual(merged.edges[1].direction, { from: "parallelism", to: "scalability" });
  assert.equal(merged.edges[0].note, "병렬 처리는 단일 처리 경로의 병목에 대응한다.");
  assert.deepEqual(merged.edges[0].evidence, ["source-amdahl"]);
  assert.throws(() => mergeHistoryTransitionDetails(summary, pages.slice(0, 1)), /incomplete/);

  const pageView = historyTransitionDetailPageView(summary, pages[1]);
  assert.equal(pageView.detail.currentPage, 2);
  assert.equal(pageView.edges.length, 1);
  assert.equal(pageView.edges[0].id, "enables");
  assert.equal(pageView.roles.response.id, "parallelism");
  assert.equal(pageView.roles.capability[0].id, "scalability");
  assert.equal(pageView.preview.truncated, true);
});

test("constraint and precedence descriptions remain distinct from causal response chains", () => {
  const constraint = describeHistoryTransition({
    id: "constraint-a",
    kind: "transition",
    type: "constraint",
    completeness: "complete",
    roles: {
      constraint: { id: "power-wall", title: "전력 장벽" },
      constrained: { id: "clock-scaling", title: "클럭 스케일링" }
    },
    edges: [{ id: "c", kind: "constrains", source: "power-wall", target: "clock-scaling" }]
  });
  assert.equal(constraint.label, "제약 관계");
  assert.equal(constraint.path, "전력 장벽 → 클럭 스케일링");
  assert.match(constraint.edges[0].direction, /제약 “전력 장벽”/);

  const precedes = describeHistoryTransition({
    id: "precedes-a",
    kind: "transition",
    type: "precedes",
    completeness: "complete",
    roles: {
      before: { id: "theory", title: "이론" },
      after: { id: "machine", title: "기계" }
    },
    edges: [{ id: "p", kind: "precedes", source: "theory", target: "machine" }]
  });
  assert.equal(precedes.label, "역사적 선후 관계");
  assert.match(precedes.edges[0].direction, /인과를 뜻하지는 않습니다/);
  assert.equal(precedes.edges[0].note, "관계 설명이 별도로 기록되지 않았습니다.");
});

test("static part routes stay clean, while overview navigation moves to the history root", () => {
  const options = {
    rootPath: "/map/history/",
    defaultEra: "1936-1945",
    defaultEraPath: "/map/history/1936-1945/",
    defaultPart: "1936-1945--page-0002",
    defaultPartPath: "/map/history/1936-1945/2/"
  };
  const staticUrl = "https://example.test/map/history/1936-1945/2/";
  const state = parseHistoryLensPageUrl(staticUrl, { parts: [options.defaultPart], eras: [options.defaultEra] }, options);
  assert.equal(state.mode, "part");
  assert.equal(state.part, options.defaultPart);
  assert.equal(historyLensPageUrlFor(staticUrl, state, options), staticUrl);

  const overview = { ...state, mode: "overview", part: "" };
  assert.equal(historyLensPageUrlFor(staticUrl, overview, options), "https://example.test/map/history/");
  assert.equal(parseHistoryLensPageUrl("https://example.test/map/history/", {}, options).mode, "overview");
  assert.equal(
    historyLensPageUrlFor("https://example.test/map/history/", state, options),
    `https://example.test/map/history/?part=${options.defaultPart}`
  );
});

test("part snapshots restore explicit state and do not revive at the root after overview", () => {
  const options = {
    rootPath: "/map/history/",
    defaultPart: "1936-1945--page-0002",
    defaultPartPath: "/map/history/1936-1945/2/"
  };
  const part = { mode: "part", transition: "", event: "", era: "", part: options.defaultPart, q: "", layer: "", capability: "", display: "all" };
  const restored = historyLensStateFromHistory(
    historyHistoryEntry(part),
    "https://example.test/map/history/",
    { parts: [options.defaultPart] },
    options
  );
  assert.equal(restored.mode, "part");
  assert.equal(restored.part, options.defaultPart);

  const overview = { ...part, mode: "overview", part: "" };
  const root = historyLensPageUrlFor(options.defaultPartPath, overview, options);
  assert.equal(parseHistoryLensPageUrl(root, {}, options).mode, "overview");
});

test("versioned history assets stay on origin and replace stale cache keys", () => {
  assert.equal(
    historyVersionedAssetUrl("eras/1936/page.json?old=1#fragment", "https://example.test/data/history/manifest.json?v=old", "content-a"),
    "https://example.test/data/history/eras/1936/page.json?old=1&v=content-a"
  );
  assert.throws(
    () => historyVersionedAssetUrl("https://evil.test/page.json", "https://example.test/data/history/manifest.json", "v1"),
    /site origin/
  );
});

test("request gates abort previous work and make stale completion observable", () => {
  const gate = createHistoryRequestGate();
  const first = gate.begin();
  const second = gate.begin();
  assert.equal(first.signal.aborted, true);
  assert.equal(first.current(), false);
  assert.equal(second.current(), true);
  assert.equal(gate.isCurrent(second.token), true);
  gate.cancel();
  assert.equal(second.signal.aborted, true);
  assert.equal(second.current(), false);
});

const VERSION = "history-v1";
const overview = {
  schemaVersion: "1.0.0",
  contentVersion: VERSION,
  kind: "history-overview",
  periods: [{ id: "1936-1945", label: "1936–1945", eventCount: 1, transitionCount: 0, shards: ["eras/1936-1945/page-0001.json"] }],
  transitions: [],
  stats: { documents: 1, transitions: 0 }
};
const eraShard = {
  schemaVersion: "1.0.0",
  contentVersion: VERSION,
  id: "1936-1945--page-0001",
  kind: "history-period-page",
  period: { id: "1936-1945", label: "1936–1945" },
  page: 1,
  pageCount: 1,
  events: [historyEvent("turing-machine", "튜링 기계", 1936, "theory", { url: "/concepts/turing-machine/", location: { periodId: "1936-1945", page: 1, shard: "eras/1936-1945/page-0001.json" } })],
  transitions: [],
  roleNodes: [],
  stats: { periodEvents: 1 }
};
const laterShard = {
  schemaVersion: "1.0.0",
  contentVersion: VERSION,
  id: "1980-1999--page-0001",
  kind: "history-period-page",
  period: { id: "1980-1999", label: "1980–1999" },
  page: 1,
  pageCount: 1,
  events: [historyEvent("memory-wall", "메모리 장벽", 1995, "architecture", { url: "/concepts/memory-wall/", location: { periodId: "1980-1999", page: 1, shard: "eras/1980-1999/page-0001.json" } })],
  transitions: [],
  roleNodes: [],
  stats: { periodEvents: 1 }
};
const lookup = {
  schemaVersion: "1.0.0",
  contentVersion: VERSION,
  kind: "history-lookup",
  entries: [eraShard.events[0], laterShard.events[0]],
  transitions: []
};
const manifest = {
  schemaVersion: "1.0.0",
  contentVersion: VERSION,
  overview: { url: "overview.json" },
  lookup: { url: "lookup.json" },
  periods: [
    { id: "1936-1945", label: "1936–1945", shards: ["eras/1936-1945/page-0001.json"] },
    { id: "1980-1999", label: "1980–1999", shards: ["eras/1980-1999/page-0001.json"] }
  ],
  lanes: [{ id: "theory", label: "이론" }, { id: "architecture", label: "아키텍처" }],
  eraShards: {
    "1936-1945": "eras/1936-1945/page-0001.json",
    "1980-1999": "eras/1980-1999/page-0001.json"
  },
  partShards: {
    "1936-1945--page-0001": "eras/1936-1945/page-0001.json",
    "1980-1999--page-0001": "eras/1980-1999/page-0001.json"
  },
  facets: {
    eras: ["1936-1945", "1980-1999"],
    parts: ["1936-1945--page-0001", "1980-1999--page-0001"],
    layers: ["theory", "architecture"],
    capabilities: [],
    displays: ["all", "events", "transitions"]
  },
  limits: { overviewTransitions: 48, shardTransitions: 96 }
};

function fakeRoot(url = "https://example.test/map/history/") {
  const listeners = new Map();
  return {
    dataset: {
      historyManifestUrl: "https://example.test/data/history/manifest.json",
      historyRootUrl: "/map/history/"
    },
    attributes: new Map(),
    querySelector() { return null; },
    querySelectorAll() { return []; },
    addEventListener(type, listener) { listeners.set(type, listener); },
    removeEventListener(type) { listeners.delete(type); },
    setAttribute(name, value) { this.attributes.set(name, String(value)); },
    removeAttribute(name) { this.attributes.delete(name); },
    listeners,
    url
  };
}

function fakeWindow(href = "https://example.test/map/history/") {
  const listeners = new Map();
  const location = { href, reload() {} };
  const history = {
    entries: [],
    replaceState(state, _title, url) {
      location.href = new URL(url, location.href).href;
      this.entries[this.entries.length ? this.entries.length - 1 : 0] = { state, url: location.href };
    },
    pushState(state, _title, url) {
      location.href = new URL(url, location.href).href;
      this.entries.push({ state, url: location.href });
    }
  };
  return {
    location,
    history,
    setTimeout,
    clearTimeout,
    addEventListener(type, listener) { listeners.set(type, listener); },
    removeEventListener(type) { listeners.delete(type); },
    listeners
  };
}

function response(payload, status = 200) {
  return { ok: status >= 200 && status < 300, status, async json() { return structuredClone(payload); } };
}

function runtimeFetch(calls, overrides = {}) {
  return async (url) => {
    const key = String(url);
    calls.push(key);
    if (overrides[key]) return overrides[key]();
    if (key === "https://example.test/data/history/manifest.json") return response(manifest);
    if (key === `https://example.test/data/history/overview.json?v=${VERSION}`) return response(overview);
    if (key === `https://example.test/data/history/lookup.json?v=${VERSION}`) return response(lookup);
    if (key === `https://example.test/data/history/eras/1936-1945/page-0001.json?v=${VERSION}`) return response(eraShard);
    if (key === `https://example.test/data/history/eras/1980-1999/page-0001.json?v=${VERSION}`) return response(laterShard);
    return response({}, 404);
  };
}

test("runtime initialization fetches only manifest and overview", async () => {
  const calls = [];
  const root = fakeRoot();
  const window = fakeWindow();
  const controller = await initializeHistoryLens(root, { fetch: runtimeFetch(calls), window });
  assert.deepEqual(calls, [
    "https://example.test/data/history/manifest.json",
    `https://example.test/data/history/overview.json?v=${VERSION}`
  ]);
  assert.equal(controller.state.mode, "overview");
  assert.equal(controller.view.periods.length, 1);
  assert.equal(root.dataset.historyEnhanced, "true");
  controller.destroy();
});

test("era navigation fetches its shard without loading lookup", async () => {
  const calls = [];
  const root = fakeRoot();
  const window = fakeWindow();
  const controller = await initializeHistoryLens(root, { fetch: runtimeFetch(calls), window });
  await controller.navigate("era", "1936-1945");
  assert.equal(controller.state.mode, "era");
  assert.deepEqual(controller.view.events.map(({ id }) => id), ["turing-machine"]);
  assert.equal(calls.includes(`https://example.test/data/history/lookup.json?v=${VERSION}`), false);
  assert.equal(calls.at(-1), `https://example.test/data/history/eras/1936-1945/page-0001.json?v=${VERSION}`);
  controller.destroy();
});

test("a direct event address lazily loads lookup and then the located shard", async () => {
  const calls = [];
  const root = fakeRoot();
  const window = fakeWindow("https://example.test/map/history/?event=memory-wall");
  const controller = await initializeHistoryLens(root, { fetch: runtimeFetch(calls), window });
  assert.equal(controller.state.mode, "event");
  assert.equal(controller.state.event, "memory-wall");
  assert.deepEqual(calls, [
    "https://example.test/data/history/manifest.json",
    `https://example.test/data/history/overview.json?v=${VERSION}`,
    `https://example.test/data/history/lookup.json?v=${VERSION}`,
    `https://example.test/data/history/eras/1980-1999/page-0001.json?v=${VERSION}`
  ]);
  assert.deepEqual(controller.view.events.map(({ id }) => id), ["memory-wall"]);
  controller.destroy();
});

test("a direct Unicode fallback event id resolves through one deterministic lookup bucket", async () => {
  const calls = [];
  const id = "concepts-계산-가능성";
  const unicodeEvent = historyEvent(id, "계산 가능성", 1936, "theory", {
    url: "/concepts/계산-가능성/",
    location: { periodId: "1936-1945", page: 1, shard: "eras/1936-1945/page-0001.json" }
  });
  const bucketCount = 4;
  const bucket = historyLookupBucket(id, bucketCount);
  const shardedManifest = {
    ...manifest,
    lookup: {
      kind: "sharded",
      hash: "fnv1a32-utf16",
      bucketCount,
      bucketWidth: 1,
      route: "lookup/bucket-{bucket}.json",
      recordLimit: 96
    }
  };
  const lookupShard = {
    schemaVersion: "1.0.0",
    contentVersion: VERSION,
    id: String(bucket),
    kind: "history-lookup-shard",
    entries: [unicodeEvent],
    transitions: []
  };
  const unicodeEraShard = { ...eraShard, events: [unicodeEvent] };
  const bucketUrl = `https://example.test/data/history/lookup/bucket-${bucket}.json?v=${VERSION}`;
  const eraUrl = `https://example.test/data/history/eras/1936-1945/page-0001.json?v=${VERSION}`;
  const fetch = runtimeFetch(calls, {
    "https://example.test/data/history/manifest.json": () => response(shardedManifest),
    [bucketUrl]: () => response(lookupShard),
    [eraUrl]: () => response(unicodeEraShard)
  });
  const window = fakeWindow(`https://example.test/map/history/?event=${encodeURIComponent(id)}`);
  const controller = await initializeHistoryLens(fakeRoot(), { fetch, window });
  assert.equal(controller.state.mode, "event");
  assert.equal(controller.state.event, id);
  assert.deepEqual(calls, [
    "https://example.test/data/history/manifest.json",
    `https://example.test/data/history/overview.json?v=${VERSION}`,
    bucketUrl,
    eraUrl
  ]);
  assert.ok(controller.view.events.some((event) => event.id === id));
  controller.destroy();
});

test("paginated transition runtime fetches and caches only the requested detail page", async () => {
  const calls = [];
  const id = "node-transition-0123456789abcdef";
  const evidenceId = "ref-evidence";
  const transition = {
    id,
    kind: "transition",
    type: "response",
    completeness: "complete",
    anchorYear: 1936,
    location: { periodId: "1936-1945", page: 1, shard: "eras/1936-1945/page-0001.json" },
    roles: {
      limitation: [{ id: "turing-machine", title: "한계", url: "/concepts/turing-machine/" }],
      response: { id: "response", title: "대응", url: "/concepts/response/" },
      capability: []
    },
    roleNodeIds: ["turing-machine", "response"],
    edges: [{ id: "edge-limit", kind: "responds_to", source: "response", target: "turing-machine", evidence: [evidenceId] }],
    roleNodeCount: 3,
    edgeCount: 2,
    preview: { truncated: true, roleNodeCount: 2, edgeCount: 1 },
    detail: {
      kind: "paginated",
      route: `transitions/${id}/page-{page}.json`,
      pageCount: 2,
      pageWidth: 4,
      itemCount: 5,
      roleNodeCount: 3,
      edgeCount: 2,
      truncated: true
    }
  };
  const detailPages = [
    {
      schemaVersion: "1.0.0", contentVersion: VERSION, kind: "history-transition-detail-page",
      transitionId: id, page: 1, pageCount: 2,
      roleNodes: [{ role: "limitation", id: "turing-machine", title: "한계" }, { role: "response", id: "response", title: "대응" }],
      edges: [{ id: "edge-limit", kind: "responds_to", source: "response", target: "turing-machine", evidence: [evidenceId] }]
    },
    {
      schemaVersion: "1.0.0", contentVersion: VERSION, kind: "history-transition-detail-page",
      transitionId: id, page: 2, pageCount: 2,
      roleNodes: [{ role: "capability", id: "capability", title: "새 능력" }],
      edges: [{ id: "edge-capability", kind: "enables", source: "response", target: "capability", evidence: [] }]
    }
  ];
  const lookupBucketCount = 4;
  const evidenceBucket = historyLookupBucket(evidenceId, lookupBucketCount);
  const detailedManifest = {
    ...manifest,
    lookup: {
      kind: "sharded", hash: "fnv1a32-utf16", bucketCount: lookupBucketCount, bucketWidth: 1,
      route: "lookup/bucket-{bucket}.json", recordLimit: 96
    },
    transitionDetails: {
      kind: "paginated", route: "transitions/{transition}/page-{page}.json", pageWidth: 4,
      recordLimit: 48, byteLimit: 65536, previewItemLimit: 6, summaryByteLimit: 32768
    }
  };
  const detailedEra = { ...eraShard, transitions: [transition], roleNodes: [transition.roles.response] };
  const detailUrls = detailPages.map((_, index) => `https://example.test/data/history/transitions/${id}/page-${String(index + 1).padStart(4, "0")}.json?v=${VERSION}`);
  const evidenceUrl = `https://example.test/data/history/lookup/bucket-${evidenceBucket}.json?v=${VERSION}`;
  const fetch = runtimeFetch(calls, {
    "https://example.test/data/history/manifest.json": () => response(detailedManifest),
    [`https://example.test/data/history/eras/1936-1945/page-0001.json?v=${VERSION}`]: () => response(detailedEra),
    [detailUrls[0]]: () => response(detailPages[0]),
    [detailUrls[1]]: () => response(detailPages[1]),
    [evidenceUrl]: () => response({
      schemaVersion: "1.0.0", contentVersion: VERSION, kind: "history-lookup-shard",
      entries: [{ id: evidenceId, title: "근거 원전", url: "/sources/evidence/" }], transitions: []
    })
  });
  const controller = await initializeHistoryLens(fakeRoot(), { fetch, window: fakeWindow() });
  await controller.navigate("era", "1936-1945");
  await controller.navigate("transition", id);
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(calls.filter((url) => url === evidenceUrl).length, 1);
  await controller.loadTransitionDetailPage(id, 1);
  await controller.loadTransitionDetailPage(id, 1);
  assert.equal(calls.filter((url) => url === detailUrls[0]).length, 1);
  assert.equal(calls.includes(detailUrls[1]), false);
  await controller.loadTransitionDetailPage(id, 2);
  assert.equal(calls.filter((url) => url === detailUrls[1]).length, 1);
  assert.equal(calls.filter((url) => url === evidenceUrl).length, 1);
  controller.destroy();
});

test("failed lazy navigation preserves the last good view and retry succeeds", async () => {
  const calls = [];
  const target = `https://example.test/data/history/eras/1936-1945/page-0001.json?v=${VERSION}`;
  let attempts = 0;
  const root = fakeRoot();
  const window = fakeWindow();
  const fetch = runtimeFetch(calls, {
    [target]: () => {
      attempts += 1;
      return attempts === 1 ? response({}, 503) : response(eraShard);
    }
  });
  const controller = await initializeHistoryLens(root, { fetch, window });
  const lastGoodPeriods = controller.view.periods.map(({ id }) => id);
  await controller.navigate("era", "1936-1945");
  assert.deepEqual(controller.view.periods.map(({ id }) => id), lastGoodPeriods);
  assert.equal(controller.state.mode, "era");
  await controller.retry();
  assert.deepEqual(controller.view.events.map(({ id }) => id), ["turing-machine"]);
  assert.equal(attempts, 2);
  controller.destroy();
});

test("popstate restores an overview at the root instead of reviving the prior era", async () => {
  const calls = [];
  const root = fakeRoot();
  const window = fakeWindow();
  const controller = await initializeHistoryLens(root, { fetch: runtimeFetch(calls), window });
  await controller.navigate("era", "1936-1945");
  const overviewState = {
    mode: "overview", transition: "", event: "", part: "", era: "", q: "", layer: "", capability: "", display: "all"
  };
  window.location.href = "https://example.test/map/history/";
  await window.listeners.get("popstate")({ state: historyHistoryEntry(overviewState) });
  assert.equal(controller.state.mode, "overview");
  assert.deepEqual(controller.view.periods.map(({ id }) => id), ["1936-1945"]);
  controller.destroy();
});
