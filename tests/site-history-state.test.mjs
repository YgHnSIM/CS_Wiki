import assert from "node:assert/strict";
import test from "node:test";
import {
  createHistoryLruCache,
  historyAnchorYear,
  historyHistoryEntry,
  historyKeyboardTarget,
  historyLookupBucket,
  historyLookupHash,
  historyLookupShardAsset,
  historyLookupShardAssets,
  historyTransitionDetailAssets,
  historyManifestAsset,
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
} from "../site/assets/history-state.js";

const facets = {
  eras: [{ id: "formalization" }, { id: "scaling" }],
  partIds: ["1930s", "1940s"],
  eventShards: { "memory-wall": "focus/a.json", "turing-machine": "focus/b.json" },
  transitionIds: ["transition-memory"],
  historicalLayers: ["theory", "machine", "architecture"],
  capabilityLayers: ["computability", "scalability"],
  displays: ["all", "events", "transitions"]
};

test("history URL parsing normalizes conflicts with transition-first precedence", () => {
  const state = parseHistoryUrl(
    "/map/history/?era=scaling&part=1930s&event=memory-wall&transition=missing&transition=TRANSITION-MEMORY&q=%EF%BC%A3%EF%BC%B3%E3%80%80%EC%97%AD%EC%82%AC&layer=unknown&layer=ARCHITECTURE&capability=SCALABILITY&display=TRANSITIONS",
    facets
  );
  assert.deepEqual(state, {
    mode: "transition",
    era: "",
    part: "",
    event: "",
    transition: "transition-memory",
    q: "cs 역사",
    layer: "architecture",
    capability: "scalability",
    display: "transitions"
  });
});

test("event, part, era, and overview states follow a deterministic priority", () => {
  assert.equal(parseHistoryUrl("/map/history/?era=formalization&part=1930s&event=memory-wall", facets).mode, "event");
  assert.equal(parseHistoryUrl("/map/history/?era=formalization&part=1930s", facets).mode, "part");
  assert.equal(parseHistoryUrl("/map/history/?era=formalization", facets).mode, "era");
  assert.equal(parseHistoryUrl("/map/history/?era=missing", facets).mode, "overview");
  assert.equal(parseHistoryUrl("/map/history/?event=..%2Fsecret").mode, "overview");
  assert.equal(parseHistoryUrl("/map/history/?display=invalid", facets).display, "all");
});

test("canonical history URLs retain filters, discard noise, and are idempotent", () => {
  const first = historyUrlFor(
    "https://example.test/wiki/map/history/?part=old&q=%EC%BB%B4%ED%93%A8%ED%8C%85&layer=architecture&capability=scalability&display=events&debug=1#old",
    { transition: "Transition-Memory" }
  );
  assert.equal(
    first,
    "https://example.test/wiki/map/history/?transition=transition-memory&q=%EC%BB%B4%ED%93%A8%ED%8C%85&layer=architecture&capability=scalability&display=events"
  );
  assert.equal(historyUrlFor(first, parseHistoryUrl(first, facets)), first);

  const event = historyUrlFor(first, { mode: "event", event: "Memory-Wall" });
  assert.equal(
    event,
    "https://example.test/wiki/map/history/?event=memory-wall&q=%EC%BB%B4%ED%93%A8%ED%8C%85&layer=architecture&capability=scalability&display=events"
  );
  assert.equal(
    historyUrlFor(event, { mode: "overview", display: "all" }),
    "https://example.test/wiki/map/history/?q=%EC%BB%B4%ED%93%A8%ED%8C%85&layer=architecture&capability=scalability"
  );
});

test("a clean static era applies only on its own path and overview leaves for the root", () => {
  const options = {
    rootPath: "/map/history/",
    defaultEra: "formalization",
    defaultEraPath: "/map/history/formalization/"
  };
  const staticUrl = "https://example.test/map/history/formalization/";
  const rootUrl = "https://example.test/map/history/";
  const defaultState = parseHistoryPageUrl(staticUrl, facets, options);
  assert.equal(defaultState.mode, "era");
  assert.equal(defaultState.era, "formalization");
  assert.equal(historyPageUrlFor(staticUrl, defaultState, options), staticUrl);

  const filteredStatic = parseHistoryPageUrl(`${staticUrl}?layer=theory`, facets, options);
  assert.equal(filteredStatic.mode, "era");
  assert.equal(filteredStatic.layer, "theory");
  assert.equal(historyPageUrlFor(staticUrl, { ...defaultState, layer: "theory" }, options), `${staticUrl}?layer=theory`);

  const overview = { ...defaultState, mode: "overview", era: "" };
  assert.equal(historyPageUrlFor(staticUrl, overview, options), rootUrl);
  assert.equal(parseHistoryPageUrl(rootUrl, facets, options).mode, "overview");
  assert.equal(historyPageUrlFor(rootUrl, defaultState, options), `${rootUrl}?era=formalization`);
  assert.equal(
    historyPageUrlFor(staticUrl, { ...defaultState, mode: "event", era: "", event: "memory-wall" }, options),
    `${staticUrl}?event=memory-wall`
  );
});

test("history snapshots restore explicit state without reviving a static default at the root", () => {
  const options = {
    rootPath: "/map/history/",
    defaultEra: "formalization",
    defaultEraPath: "/map/history/formalization/"
  };
  const staticUrl = "https://example.test/map/history/formalization/";
  const rootUrl = "https://example.test/map/history/";
  const eraState = parseHistoryPageUrl(staticUrl, facets, options);
  const overviewState = { ...eraState, mode: "overview", era: "", q: "계산" };

  const overviewUrl = historyPageUrlFor(staticUrl, overviewState, options);
  assert.equal(overviewUrl, `${rootUrl}?q=%EA%B3%84%EC%82%B0`);
  assert.equal(parseHistoryPageUrl(overviewUrl, facets, options).mode, "overview");

  const restoredEra = historyStateFromHistory(historyHistoryEntry(eraState), rootUrl, facets, options);
  assert.equal(restoredEra.mode, "era");
  assert.equal(restoredEra.era, "formalization");
  const restoredOverview = historyStateFromHistory(historyHistoryEntry(overviewState), staticUrl, facets, options);
  assert.equal(restoredOverview.mode, "overview");
  assert.equal(restoredOverview.q, "계산");
  assert.equal(historyStateFromHistory(null, staticUrl, facets, options).mode, "era");
});

test("history snapshots normalize nested filters and invalid modes", () => {
  assert.deepEqual(historyHistoryEntry({
    mode: "event",
    event: "Memory-Wall",
    filters: { layer: "ARCHITECTURE", capability: "SCALABILITY", display: "EVENTS" },
    q: "  메모리\n장벽 "
  }), {
    historyMap: {
      mode: "event",
      transition: "",
      event: "memory-wall",
      part: "",
      era: "",
      q: "메모리 장벽",
      layer: "architecture",
      capability: "scalability",
      display: "events"
    }
  });
  assert.equal(historyHistoryEntry({ mode: "unknown" }).historyMap.mode, "overview");
});

test("manifest asset lookup supports direct, mapped, nested, and templated shards", () => {
  const manifest = {
    overview: { url: "overview.json" },
    lookup: { url: "lookup.json" },
    eraShards: { formalization: "eras/formalization.json" },
    eras: [{ id: "formalization", parts: [{ id: "1930s", shard: "parts/1930s.json" }] }],
    eventShards: {
      "memory-wall": { url: "focus/node-a.json" },
      "concepts-계산-가능성": { url: "focus/korean-node.json" }
    },
    transitions: [{ id: "transition-memory", payload: { url: "transitions/memory.json" } }],
    routes: {
      era: "eras/{era}.json",
      part: "parts/{part}.json",
      event: "focus/{event}.json",
      transition: "transitions/{transition}.json"
    }
  };
  assert.equal(historyManifestAsset(manifest, "overview"), "overview.json");
  assert.equal(historyManifestAsset(manifest, "lookup"), "lookup.json");
  assert.equal(historyManifestAsset(manifest, "era", "formalization"), "eras/formalization.json");
  assert.equal(historyManifestAsset(manifest, "era", "scaling"), "eras/scaling.json");
  assert.equal(historyManifestAsset(manifest, "part", "1930s"), "parts/1930s.json");
  assert.equal(historyManifestAsset(manifest, "part", "1940s"), "parts/1940s.json");
  assert.equal(historyManifestAsset(manifest, "event", "memory-wall"), "focus/node-a.json");
  assert.equal(historyManifestAsset(manifest, "event", "concepts-계산-가능성"), "focus/korean-node.json");
  assert.equal(historyManifestAsset(manifest, "transition", "transition-memory"), "transitions/memory.json");
  assert.equal(historyManifestAsset(manifest, "event", "turing-machine"), "focus/turing-machine.json");
  assert.equal(
    historyManifestAsset(manifest, "event", "concepts-튜링-기계"),
    "focus/concepts-%ED%8A%9C%EB%A7%81-%EA%B8%B0%EA%B3%84.json"
  );
});

test("manifest assets reject external URLs, traversal, encoded traversal, and unsafe ids", () => {
  assert.equal(historyManifestAsset({ overview: { url: "https://evil.test/a.json" } }, "overview"), "");
  assert.equal(historyManifestAsset({ overview: { url: "//evil.test/a.json" } }, "overview"), "");
  assert.equal(historyManifestAsset({ overview: { url: "../secret.json" } }, "overview"), "");
  assert.equal(historyManifestAsset({ overview: { url: "parts/%252e%252e/secret.json" } }, "overview"), "");
  assert.equal(historyManifestAsset({ overview: { url: "parts/%00secret.json" } }, "overview"), "");
  assert.equal(historyManifestAsset({ routes: { event: "focus/{event}.json" } }, "event", "../secret"), "");
  assert.equal(historyManifestAsset({ routes: { event: "focus/{event}.json" } }, "event", "개념/탈출"), "");
  assert.equal(historyManifestAsset({ routes: { event: "focus/{event}.json" } }, "unknown", "safe"), "");
  assert.equal(historyManifestAsset({ overview: { url: "/data/history/overview.json?v=1" } }, "overview"), "/data/history/overview.json?v=1");
});

test("sharded lookup assets use a deterministic Unicode-safe FNV bucket contract", () => {
  const manifest = {
    lookup: {
      kind: "sharded",
      hash: "fnv1a32-utf16",
      bucketCount: 8,
      bucketWidth: 1,
      route: "lookup/bucket-{bucket}.json"
    }
  };
  const id = "concepts-계산-가능성";
  const bucket = historyLookupBucket(id, 8);
  assert.equal(historyLookupHash("a"), 3_826_002_220);
  assert.ok(Number.isInteger(bucket) && bucket >= 0 && bucket < 8);
  assert.equal(historyLookupShardAsset(manifest, id), `lookup/bucket-${bucket}.json`);
  assert.deepEqual(
    historyLookupShardAssets(manifest),
    Array.from({ length: 8 }, (_, index) => `lookup/bucket-${index}.json`)
  );
  assert.equal(historyLookupShardAsset(manifest, "개념/탈출"), "");
  assert.deepEqual(historyLookupShardAssets({ lookup: { url: "lookup.json" } }), ["lookup.json"]);
});

test("paginated transition details expand to bounded same-origin asset paths", () => {
  const manifest = {
    transitionDetails: {
      kind: "paginated",
      route: "transitions/{transition}/page-{page}.json",
      pageWidth: 4
    }
  };
  const transition = {
    id: "node-transition-0123456789abcdef",
    detail: { kind: "paginated", pageCount: 2, pageWidth: 4 }
  };
  assert.deepEqual(historyTransitionDetailAssets(manifest, transition), [
    "transitions/node-transition-0123456789abcdef/page-0001.json",
    "transitions/node-transition-0123456789abcdef/page-0002.json"
  ]);
  assert.deepEqual(historyTransitionDetailAssets(manifest, { ...transition, id: "../escape" }), []);
  assert.deepEqual(historyTransitionDetailAssets(manifest, { ...transition, detail: { kind: "paginated", pageCount: 0 } }), []);
  assert.deepEqual(historyTransitionDetailAssets({ transitionDetails: { ...manifest.transitionDetails, route: "https://evil.test/{page}" } }, transition), []);
});

test("history payload versions must match the active manifest", () => {
  assert.deepEqual(
    normalizeHistoryPayloadVersion(
      { schemaVersion: "1.0.0", contentVersion: "2026-07-18-a" },
      { schemaVersion: "1.0.0", contentVersion: "2026-07-18-a", events: [] }
    ),
    { schemaVersion: "1.0.0", contentVersion: "2026-07-18-a" }
  );
  assert.throws(
    () => normalizeHistoryPayloadVersion(
      { schemaVersion: "1.0.0", contentVersion: "current" },
      { schemaVersion: "1.0.0", contentVersion: "stale" }
    ),
    /content version mismatch/
  );
  assert.throws(() => normalizeHistoryPayloadVersion({ schemaVersion: "2" }, { schemaVersion: "1" }), /schema version mismatch/);
  assert.throws(() => normalizeHistoryPayloadVersion({}, {}), /does not declare a version/);
});

test("history LRU refreshes reads, supports inspection, and evicts the oldest shard", () => {
  const cache = createHistoryLruCache(2);
  cache.set("era:a", { value: 1 }).set("era:b", { value: 2 });
  assert.equal(cache.get("era:a").value, 1);
  cache.set("era:c", { value: 3 });
  assert.equal(cache.has("era:a"), true);
  assert.equal(cache.has("era:b"), false);
  assert.equal(cache.peek("era:c").value, 3);
  assert.deepEqual(cache.keys(), ["era:a", "era:c"]);
  assert.equal(cache.delete("era:a"), true);
  cache.clear();
  assert.equal(cache.size, 0);
  assert.equal(createHistoryLruCache(0).maxEntries, 5);
});

function event(id, title, anchorYear, historicalLayer, capabilityLayers = [], extra = {}) {
  return { id, title, anchorYear, historicalLayer, capabilityLayers, ...extra };
}

const searchRecords = [
  event("memory-wall", "메모리 장벽", 1995, "architecture", ["scalability"], { aliases: ["Memory Wall"], summary: "프로세서와 메모리의 성능 격차" }),
  event("memory-hierarchy", "메모리 계층", 1968, "architecture", ["resource-efficiency"], { summary: "메모리 장벽에 앞선 계층 구조" }),
  event("analysis-memory", "성능 병목 분석", 2000, "measurement", ["scalability"], { summary: "메모리 장벽을 측정한다" }),
  { id: "transition-memory", kind: "transition", title: "메모리 장벽에서 병렬성으로", problemTitle: "메모리 장벽", responseTitle: "병렬 처리", capabilityTitle: "확장성", anchorYear: 2005, historicalLayer: "architecture", capabilityLayers: ["scalability"] }
];

test("Korean search ranks exact names, aliases, prefixes, and prose deterministically", () => {
  assert.equal(normalizeHistoryQuery("  Ｍｅｍｏｒｙ　WALL "), "memory wall");
  assert.deepEqual(searchHistoryEvents(searchRecords, "메모리 장벽").map(({ id }) => id), [
    "memory-wall",
    "transition-memory",
    "memory-hierarchy",
    "analysis-memory"
  ]);
  assert.equal(searchHistoryEvents(searchRecords, "memory wall")[0].id, "memory-wall");
  const forward = searchHistoryEvents(searchRecords, "메모리").map(({ id }) => id);
  const reverse = searchHistoryEvents([...searchRecords].reverse(), "메모리").map(({ id }) => id);
  assert.deepEqual(forward, reverse);
});

test("Korean initial-consonant lookup and conjunctive tokens work with facets", () => {
  assert.equal(searchHistoryEvents(searchRecords, "ㅁㅁㄹ ㅈㅂ")[0].id, "memory-wall");
  assert.deepEqual(searchHistoryEvents(searchRecords, "메모리 측정").map(({ id }) => id), ["analysis-memory"]);
  assert.deepEqual(
    searchHistoryEvents(searchRecords, "메모리", { layer: "architecture", capability: "scalability", display: "events" }).map(({ id }) => id),
    ["memory-wall"]
  );
  assert.deepEqual(
    searchHistoryEvents(searchRecords, "메모리", { display: "transitions" }).map(({ id }) => id),
    ["transition-memory"]
  );
  assert.deepEqual(searchHistoryEvents(searchRecords, "", {}, 2), []);
});

test("history filters distinguish events and transitions without mutating records", () => {
  assert.equal(matchesHistoryFilters(searchRecords[0], { display: "events" }), true);
  assert.equal(matchesHistoryFilters(searchRecords[0], { display: "transitions" }), false);
  assert.equal(matchesHistoryFilters(searchRecords[3], { display: "transitions", capability: "scalability" }), true);
  assert.equal(matchesHistoryFilters(searchRecords[3], { layer: "machine" }), false);
});

test("anchor years follow event, publication, and fallback precedence", () => {
  assert.equal(historyAnchorYear({ anchorYear: 2000, eventStart: 1990, publicationYear: 1980 }), 2000);
  assert.equal(historyAnchorYear({ historical: { eventStart: 1936 }, publicationYear: 1937 }), 1936);
  assert.equal(historyAnchorYear({ publication_year: "1965" }), 1965);
  assert.equal(historyAnchorYear({ year: 1974 }), 1974);
  assert.equal(historyAnchorYear({ created: "2026-07-18" }), null);
});

test("era events sort by chronology, range end, lane order, Korean title, and id", () => {
  const records = [
    event("undated", "연도 없음", null, "theory"),
    event("machine-b", "베타", 1940, "machine", [], { eventEnd: 1945 }),
    event("theory-z", "제타", 1940, "theory", [], { eventEnd: 1945 }),
    event("theory-a", "알파", 1940, "theory", [], { eventEnd: 1942 }),
    event("early", "초기", 1936, "software")
  ];
  const expected = ["early", "theory-a", "theory-z", "machine-b", "undated"];
  assert.deepEqual(sortHistoryEvents(records).map(({ id }) => id), expected);
  assert.deepEqual(sortHistoryEvents([...records].reverse()).map(({ id }) => id), expected);
  assert.deepEqual(records.map(({ id }) => id), ["undated", "machine-b", "theory-z", "theory-a", "early"]);
});

const navigationEvents = [
  event("theory-1936", "이론 1936", 1936, "theory"),
  event("theory-1940", "이론 1940", 1940, "theory"),
  event("machine-1938", "기계 1938", 1938, "machine"),
  event("machine-1942", "기계 1942", 1942, "machine"),
  event("architecture-1937", "구조 1937", 1937, "architecture"),
  event("architecture-1943", "구조 1943", 1943, "architecture"),
  event("service-undated", "서비스 연도 없음", null, "service")
];

test("left and right stay in one lane while Home and End span the era", () => {
  assert.equal(historyKeyboardTarget(navigationEvents, "theory-1936", "ArrowLeft"), "theory-1936");
  assert.equal(historyKeyboardTarget(navigationEvents, "theory-1936", "ArrowRight"), "theory-1940");
  assert.equal(historyKeyboardTarget(navigationEvents, "theory-1940", "ArrowRight"), "theory-1940");
  assert.equal(historyKeyboardTarget(navigationEvents, "machine-1942", "Home"), "theory-1936");
  assert.equal(historyKeyboardTarget(navigationEvents, "machine-1938", "End"), "service-undated");
  assert.equal(historyKeyboardTarget(navigationEvents, "machine-1938", "Escape"), "machine-1938");
  assert.equal(historyKeyboardTarget(navigationEvents, "missing", "ArrowRight"), "");
});

test("up and down choose the closest year in the adjacent populated lane", () => {
  assert.equal(historyKeyboardTarget(navigationEvents, "theory-1940", "ArrowDown"), "machine-1938");
  assert.equal(historyKeyboardTarget(navigationEvents, "machine-1942", "ArrowDown"), "architecture-1943");
  assert.equal(historyKeyboardTarget(navigationEvents, "architecture-1937", "ArrowUp"), "machine-1938");
  assert.equal(historyKeyboardTarget(navigationEvents, "theory-1936", "ArrowUp"), "theory-1936");
  assert.equal(historyKeyboardTarget(navigationEvents, "service-undated", "ArrowDown"), "service-undated");
});

test("vertical movement skips empty configured lanes and is input-order independent", () => {
  const sparse = [
    event("theory", "이론", 1936, "theory"),
    event("software-1935", "소프트웨어 1935", 1935, "software"),
    event("software-1940", "소프트웨어 1940", 1940, "software")
  ];
  assert.equal(historyKeyboardTarget(sparse, "theory", "ArrowDown"), "software-1935");
  assert.equal(historyKeyboardTarget([...sparse].reverse(), "theory", "ArrowDown"), "software-1935");
  assert.equal(historyKeyboardTarget(sparse, "software-1935", "ArrowUp"), "theory");
});
