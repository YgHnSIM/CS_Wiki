import assert from "node:assert/strict";
import { gzipSync } from "node:zlib";
import test from "node:test";
import {
  DEFAULT_HISTORY_PERIODS,
  HISTORY_LANES,
  HISTORY_LOOKUP_HASH,
  HISTORY_LIMITS,
  buildHistoricalLens,
  historyLookupBucket,
  historyLookupHash
} from "../site/graph/history.mjs";

function node(id, extra = {}) {
  const historical = extra.historical || {};
  return {
    id,
    title: extra.title || `문서 ${id}`,
    aliases: extra.aliases || [],
    url: `/concepts/${id}/`,
    category: extra.category || "concepts",
    domains: extra.domains || ["domain/computer-history"],
    status: "active",
    summary: `${id} 요약`,
    visibility: extra.visibility || "public",
    historical: {
      publicationYear: historical.publicationYear ?? null,
      eventStart: historical.eventStart ?? null,
      eventEnd: historical.eventEnd ?? null,
      layer: historical.layer ?? null
    },
    capabilityLayers: extra.capabilityLayers || [],
    created: extra.created || "2026-01-01",
    updated: extra.updated || "2026-01-02"
  };
}

function edge(id, source, target, kind, extra = {}) {
  return {
    id,
    source,
    target,
    kind,
    family: extra.family || "history",
    origin: extra.origin || "curated",
    directed: extra.directed ?? true,
    evidence: extra.evidence || [],
    contexts: extra.contexts || []
  };
}

function graph(nodes, edges = []) {
  return { schemaVersion: "1.0.0", nodes, edges };
}

function lookupById(lens) {
  return new Map(Object.values(lens.lookupShards)
    .flatMap((shard) => shard.entries)
    .map((entry) => [entry.id, entry]));
}

function lookupTransitions(lens) {
  return Object.values(lens.lookupShards).flatMap((shard) => shard.transitions);
}

test("history lookup hashing is browser-reimplementable and normalization-stable", () => {
  assert.equal(historyLookupHash("hello"), 0x4f9f2cab);
  assert.equal(historyLookupHash("Ａ"), historyLookupHash("a"));
  assert.equal(historyLookupHash("COMPUTE"), historyLookupHash("compute"));
  assert.deepEqual(historyLookupBucket("hello", 16, 2), {
    index: historyLookupHash("hello") & 15,
    id: String(historyLookupHash("hello") & 15).padStart(2, "0")
  });
  assert.throws(() => historyLookupBucket("hello", 3), /positive power of two/);
  assert.throws(() => historyLookupBucket("hello", 16, 1), /must be at least 2/);
});

test("event points, ranges, publications, and undated records retain their distinct temporal meaning", () => {
  const lens = buildHistoricalLens(graph([
    node("range", { historical: { eventStart: 1935, eventEnd: 1936, publicationYear: 1940, layer: "theory" } }),
    node("start-only", { historical: { eventStart: 1949, layer: "machine" } }),
    node("publication", { historical: { publicationYear: 1936, layer: "theory" } }),
    node("undated", { created: "1800-01-01", updated: "1936-01-01" }),
    node("hidden", { visibility: "hidden", historical: { publicationYear: 1940 } }),
    node("context", { visibility: "context", historical: { publicationYear: 1940 } })
  ]));
  const entries = lookupById(lens);

  assert.equal(entries.size, 4);
  assert.deepEqual(entries.get("range").time, {
    status: "event",
    shape: "range",
    eventStart: 1935,
    eventEnd: 1936,
    publicationYear: 1940,
    note: null,
    anchorYear: 1935,
    openStart: false,
    openEnd: false,
    primaryPeriodId: "1800-1935",
    overlapPeriodIds: ["1800-1935", "1936-1945"]
  });
  assert.equal(entries.get("start-only").time.shape, "point");
  assert.equal(entries.get("start-only").time.eventEnd, null);
  assert.equal(entries.get("publication").time.status, "publication");
  assert.equal(entries.get("publication").time.primaryPeriodId, "1936-1945");
  assert.equal(entries.get("undated").time.status, "undated");
  assert.equal(entries.get("undated").time.anchorYear, null);
  assert.equal(entries.get("undated").time.primaryPeriodId, "undated");
  assert.equal(entries.get("undated").lane, "unclassified");
  assert.equal(lens.manifest.stats.documents, 4);
  assert.equal(lens.manifest.stats.undatedDocuments, 1);
  assert.deepEqual(lens.manifest.lanes.map((lane) => lane.id), HISTORY_LANES);
  assert.throws(
    () => buildHistoricalLens(graph([node("end-only", { historical: { eventEnd: 1959 } })])),
    /eventEnd without eventStart/
  );
});

test("period boundaries are inclusive, contiguous, and every public document has one primary shard", () => {
  const cases = [
    [1799, "before-1800"],
    [1800, "1800-1935"],
    [1935, "1800-1935"],
    [1936, "1936-1945"],
    [1945, "1936-1945"],
    [1946, "1946-1959"],
    [1959, "1946-1959"],
    [1960, "1960-1979"],
    [1979, "1960-1979"],
    [1980, "1980-1999"],
    [1999, "1980-1999"],
    [2000, "2000-2014"],
    [2014, "2000-2014"],
    [2015, "2015-plus"]
  ];
  const lens = buildHistoricalLens(graph([
    ...cases.map(([year], index) => node(`year-${index}`, { historical: { publicationYear: year } })),
    node("no-year")
  ]));
  const entries = lookupById(lens);

  cases.forEach(([year, periodId], index) => {
    assert.equal(entries.get(`year-${index}`).time.anchorYear, year);
    assert.equal(entries.get(`year-${index}`).time.primaryPeriodId, periodId);
  });
  const primaryIds = Object.values(lens.shards).flatMap((shard) => shard.events.map((event) => event.id));
  assert.equal(primaryIds.length, cases.length + 1);
  assert.equal(new Set(primaryIds).size, primaryIds.length);
  assert.deepEqual([...new Set(lens.manifest.periods.map((period) => period.id))], DEFAULT_HISTORY_PERIODS.map((period) => period.id));
});

test("response edges merge around one response node while unrelated and derived relations stay out", () => {
  const nodes = [
    node("limit", { historical: { publicationYear: 1960, layer: "measurement" } }),
    node("response", { historical: { publicationYear: 1970, layer: "architecture" } }),
    node("capability", { historical: { publicationYear: 1980, layer: "system" } }),
    node("partial-response", { historical: { publicationYear: 1990, layer: "software" } }),
    node("later", { historical: { publicationYear: 1990, layer: "system" } }),
    node("earlier", { historical: { publicationYear: 1980, layer: "system" } }),
    node("constraint", { historical: { publicationYear: 2000, layer: "measurement" } })
  ];
  const edges = [
    edge("response-limit", "response", "limit", "responds_to", {
      evidence: ["ref-b", "ref-a"],
      contexts: [{ note: "측정된 한계에 대응한다." }]
    }),
    edge("response-capability", "response", "capability", "enables", {
      evidence: ["ref-c"],
      contexts: [{ note: "새 능력을 가능하게 한다." }]
    }),
    edge("partial-limit", "partial-response", "limit", "responds_to", {
      contexts: [{ note: "아직 새 능력과 연결되지 않은 대응이다." }]
    }),
    edge("bad-order", "later", "earlier", "precedes", {
      contexts: [{ note: "편집된 선후 관계다." }]
    }),
    edge("constraint-edge", "constraint", "capability", "constrains", {
      contexts: [{ note: "능력을 제약한다." }]
    }),
    edge("auto-related", "limit", "response", "related", { origin: "derived" }),
    edge("auto-supports", "limit", "response", "supports", { origin: "derived" }),
    edge("auto-path", "limit", "response", "path_next", { origin: "derived" }),
    edge("auto-mention", "limit", "response", "mentions", { origin: "derived" })
  ];
  const lens = buildHistoricalLens(graph(nodes, edges));

  assert.equal(lens.transitions.length, 4);
  const complete = lens.transitions.find((transition) => transition.type === "response" && transition.completeness === "complete");
  assert.equal(complete.title, "문서 limit → 문서 response → 문서 capability");
  assert.deepEqual(complete.roles.limitation.map((item) => item.id), ["limit"]);
  assert.equal(complete.roles.response.id, "response");
  assert.deepEqual(complete.roles.capability.map((item) => item.id), ["capability"]);
  assert.deepEqual(complete.edges.map((item) => item.kind), ["enables", "responds_to"]);
  const responseEdge = complete.edges.find((item) => item.kind === "responds_to");
  assert.equal(responseEdge.note, "측정된 한계에 대응한다.");
  assert.deepEqual(responseEdge.evidence, ["ref-a", "ref-b"]);
  assert.deepEqual(responseEdge.direction, { from: "response", to: "limit" });
  assert.equal(responseEdge.chronology.status, "consistent");
  assert.equal(responseEdge.chronology.expected, "target-before-source");

  const partial = lens.transitions.find((transition) => transition.roles.response?.id === "partial-response");
  assert.equal(partial.completeness, "partial");
  assert.deepEqual(partial.roles.capability, []);
  const precedes = lens.transitions.find((transition) => transition.type === "precedes");
  assert.equal(precedes.title, "문서 later → 문서 earlier");
  assert.equal(precedes.edges[0].chronology.status, "conflict");
  const constraint = lens.transitions.find((transition) => transition.type === "constraint");
  assert.equal(constraint.title, "문서 constraint → 문서 capability");
  assert.equal(constraint.edges[0].chronology.status, "observed");
  assert.equal(constraint.anchorNodeId, "constraint");
  assert.equal(constraint.anchorYear, 2000);
  assert.equal(constraint.location.periodId, "2000-2014");
  assert.ok(lens.transitions.every((transition) => transition.edges.every((item) => !["related", "supports", "path_next", "mentions"].includes(item.kind))));

  const shardWithComplete = Object.values(lens.shards).find((shard) => shard.transitions.some((transition) => transition.id === complete.id));
  const stubIds = new Set(shardWithComplete.roleNodes.map((item) => item.id));
  assert.ok(complete.roleNodeIds.every((id) => stubIds.has(id)));
});

test("response-node transition ids survive an enables-only record gaining a responds_to edge", () => {
  const nodes = [
    node("limitation", { historical: { publicationYear: 1960, layer: "measurement" } }),
    node("response", { historical: { publicationYear: 1970, layer: "architecture" } }),
    node("capability", { historical: { publicationYear: 1980, layer: "system" } })
  ];
  const enables = edge("response-capability", "response", "capability", "enables");
  const initial = buildHistoricalLens(graph(nodes, [enables]));
  const expanded = buildHistoricalLens(graph(nodes, [
    enables,
    edge("response-limitation", "response", "limitation", "responds_to")
  ]));
  const before = initial.transitions[0];
  const after = expanded.transitions[0];

  assert.match(before.id, /^node-transition-[a-f0-9]{16}$/);
  assert.equal(after.id, before.id);
  assert.equal(before.type, "enablement");
  assert.equal(after.type, "response");
  assert.equal(before.responseId, "response");
  assert.equal(after.responseId, "response");
  assert.equal("detail" in before, false);
  assert.equal("detail" in after, false);
  assert.notEqual(initial.manifest.contentVersion, expanded.manifest.contentVersion);
  assert.ok(lookupTransitions(initial).some((transition) => transition.id === before.id));
  assert.ok(lookupTransitions(expanded).some((transition) => transition.id === before.id));
});

test("standalone transition anchors and locations follow their semantic source role", () => {
  const lens = buildHistoricalLens(graph([
    node("source", { historical: { publicationYear: 2018, layer: "measurement" } }),
    node("target", { historical: { publicationYear: 1936, layer: "theory" } }),
    node("undated-source", { historical: { layer: "architecture" } })
  ], [
    edge("source-precedes-target", "source", "target", "precedes"),
    edge("source-constrains-target", "source", "target", "constrains"),
    edge("undated-constrains-target", "undated-source", "target", "constrains")
  ]));

  for (const transition of lens.transitions.filter((item) => item.anchorNodeId === "source")) {
    assert.equal(transition.anchorNodeId, "source");
    assert.equal(transition.anchorYear, 2018);
    assert.equal(transition.location.periodId, "2015-plus");
    assert.match(transition.location.shard, /^eras\/2015-plus\/page-\d{4}\.json$/);
  }
  const undated = lens.transitions.find((transition) => transition.anchorNodeId === "undated-source");
  assert.equal(undated.anchorYear, null);
  assert.equal(undated.location.periodId, "undated");
  assert.match(undated.location.shard, /^eras\/undated\/page-\d{4}\.json$/);
});

test("a high-degree response is a bounded preview with exact paginated detail", () => {
  const capabilityCount = 1_000;
  const capabilities = Array.from({ length: capabilityCount }, (_, index) => node(
    `capability-${String(index).padStart(4, "0")}`,
    { historical: { publicationYear: 1980 + (index % 45), layer: "system" } }
  ));
  const nodes = [
    node("limitation", { historical: { publicationYear: 1965, layer: "measurement" } }),
    node("response", { historical: { publicationYear: 1975, layer: "architecture" } }),
    ...capabilities
  ];
  const edges = [
    edge("response-limitation", "response", "limitation", "responds_to", {
      evidence: ["ref-limit"],
      contexts: [{ note: "측정된 한계에 대응한다." }]
    }),
    ...capabilities.map((capability, index) => edge(
      `response-capability-${String(index).padStart(4, "0")}`,
      "response",
      capability.id,
      "enables",
      { evidence: [`ref-${String(index).padStart(4, "0")}`] }
    ))
  ];
  const lens = buildHistoricalLens(graph(nodes, edges));
  const transition = lens.transitions[0];
  const descriptor = lens.manifest.transitionDetails;
  const pages = Object.values(lens.transitionDetails).sort((left, right) => left.page - right.page);

  assert.equal(lens.transitions.length, 1);
  assert.equal(transition.detail.kind, "paginated");
  assert.equal(transition.detail.truncated, true);
  assert.equal(transition.preview.truncated, true);
  assert.equal(transition.edgeCount, capabilityCount + 1);
  assert.ok(transition.edges.length <= HISTORY_LIMITS.transitionPreviewItems);
  assert.ok(transition.edges.some((item) => item.kind === "responds_to"));
  assert.ok(transition.edges.some((item) => item.kind === "enables"));
  assert.ok(transition.roleNodeIds.length <= HISTORY_LIMITS.transitionPreviewItems + 1);
  assert.ok(Buffer.byteLength(JSON.stringify(transition)) <= descriptor.summaryByteLimit);
  assert.equal(transition.detail.pageCount, pages.length);
  assert.equal(transition.detail.pageWidth, 4);
  assert.equal(transition.detail.itemCount, (capabilityCount + 2) + (capabilityCount + 1));
  assert.equal(descriptor.paginatedCount, 1);
  assert.equal(descriptor.shardCount, pages.length);
  assert.equal(descriptor.pageWidth, 4);
  assert.equal(lens.manifest.stats.transitionDetailShards, pages.length);
  assert.equal("transitions" in descriptor, false);

  for (const [index, page] of pages.entries()) {
    assert.equal(page.schemaVersion, lens.manifest.schemaVersion);
    assert.equal(page.contentVersion, lens.manifest.contentVersion);
    assert.equal(page.kind, "history-transition-detail-page");
    assert.equal(page.transitionId, transition.id);
    assert.equal(page.page, index + 1);
    assert.equal(page.pageCount, pages.length);
    assert.equal(page.stats.records, page.roleNodes.length + page.edges.length);
    assert.ok(page.stats.records <= descriptor.recordLimit);
    assert.ok(Buffer.byteLength(JSON.stringify(page)) <= descriptor.byteLimit);
    assert.ok(gzipSync(JSON.stringify(page)).length < descriptor.byteLimit);
    assert.ok(page.edges.length > 0, "high-degree detail pages should carry navigable edges, not role-only batches");
    const pageRoleKeys = new Set(page.roleNodes.map((item) => `${item.role}:${item.id}`));
    for (const item of page.edges) {
      const { sourceRole, targetRole } = item.kind === "responds_to"
        ? { sourceRole: "response", targetRole: "limitation" }
        : { sourceRole: "response", targetRole: "capability" };
      const sourceVisible = pageRoleKeys.has(`${sourceRole}:${item.source}`)
        || transition.roles[sourceRole]?.id === item.source;
      const targetVisible = pageRoleKeys.has(`${targetRole}:${item.target}`)
        || transition.roles[targetRole]?.id === item.target;
      assert.equal(sourceVisible, true, `detail page ${page.page} is missing source context for ${item.id}`);
      assert.equal(targetVisible, true, `detail page ${page.page} is missing target context for ${item.id}`);
    }
  }

  const detailedRoles = pages.flatMap((page) => page.roleNodes);
  const detailedEdges = pages.flatMap((page) => page.edges);
  const expectedRoleKeys = [
    "limitation:limitation",
    "response:response",
    ...capabilities.map((capability) => `capability:${capability.id}`)
  ].sort();
  const actualRoleKeys = detailedRoles.map((item) => `${item.role}:${item.id}`).sort();
  assert.deepEqual(actualRoleKeys, expectedRoleKeys);
  assert.equal(new Set(actualRoleKeys).size, expectedRoleKeys.length);
  assert.deepEqual(detailedEdges.map((item) => item.id).sort(), edges.map((item) => item.id).sort());
  assert.equal(new Set(detailedEdges.map((item) => item.id)).size, edges.length);
  const roleByNode = new Map(detailedRoles.map((item) => [item.id, item.role]));
  for (const item of detailedEdges) {
    assert.equal(roleByNode.get(item.source), "response");
    assert.equal(roleByNode.get(item.target), item.kind === "responds_to" ? "limitation" : "capability");
  }
  const limitationEdge = detailedEdges.find((item) => item.id === "response-limitation");
  assert.deepEqual(limitationEdge.direction, { from: "response", to: "limitation" });
  assert.deepEqual(limitationEdge.evidence, ["ref-limit"]);
  assert.equal(limitationEdge.note, "측정된 한계에 대응한다.");

  const eraPayloads = Object.values(lens.shards).filter((shard) => (
    shard.transitions.some((item) => item.id === transition.id)
  ));
  assert.ok(eraPayloads.length > 1);
  assert.ok(eraPayloads.every((shard) => shard.transitions.every((item) => item.preview?.truncated)));
  assert.ok(eraPayloads.every((shard) => Buffer.byteLength(JSON.stringify(shard)) < 256 * 1024));
  assert.ok(eraPayloads.every((shard) => gzipSync(JSON.stringify(shard)).length < 96 * 1024));
  assert.ok(Object.values(lens.lookupShards).every((shard) => shard.stats.records <= HISTORY_LIMITS.lookupShardRecords));
});

test("an indivisible oversized transition detail record fails closed", () => {
  const capabilities = Array.from({ length: HISTORY_LIMITS.transitionPreviewItems + 1 }, (_, index) => node(`cap-${index}`));
  const nodes = [node("response"), ...capabilities];
  const edges = capabilities.map((capability, index) => edge(
    `edge-${index}`,
    "response",
    capability.id,
    "enables",
    { contexts: [{ note: index === 0 ? "x".repeat(HISTORY_LIMITS.transitionDetailBytes) : "bounded" }] }
  ));

  assert.throws(
    () => buildHistoricalLens(graph(nodes, edges)),
    /one detail record exceeding the .*byte page limit/
  );
});

test("history output is deterministic and ignores wiki creation and update timestamps", () => {
  const nodes = [
    node("alpha", { aliases: ["Z", "A"], historical: { publicationYear: 1936, layer: "theory" }, created: "1900-01-01" }),
    node("beta", { historical: { publicationYear: 1940, layer: "machine" }, updated: "9999-01-01" }),
    node("gamma")
  ];
  const edges = [
    edge("alpha-beta", "alpha", "beta", "precedes", {
      evidence: ["z", "a"],
      contexts: [{ note: "둘째" }, { note: "첫째" }]
    })
  ];
  const first = buildHistoricalLens(graph(nodes, edges));
  const reordered = buildHistoricalLens(graph(
    [...nodes].reverse().map((item) => ({ ...item, aliases: [...item.aliases].reverse(), created: "2026-07-18", updated: "2026-07-18" })),
    [...edges].reverse().map((item) => ({ ...item, evidence: [...item.evidence].reverse(), contexts: [...item.contexts].reverse() }))
  ));

  assert.deepEqual(reordered, first);
  assert.equal(reordered.manifest.contentVersion, first.manifest.contentVersion);
});

test("new documents enter the correct period and update sharded lookup and era counts automatically", () => {
  const initial = buildHistoricalLens(graph([
    node("old", { historical: { publicationYear: 1936, layer: "theory" } })
  ]));
  const expanded = buildHistoricalLens(graph([
    node("old", { historical: { publicationYear: 1936, layer: "theory" } }),
    node("new-stable-id", { historical: { publicationYear: 2016, layer: "service" } })
  ]));
  const entry = lookupById(expanded).get("new-stable-id");

  assert.equal(lookupById(initial).size, 1);
  assert.equal(lookupById(expanded).size, 2);
  assert.equal(entry.time.primaryPeriodId, "2015-plus");
  assert.equal(entry.location.periodId, "2015-plus");
  assert.ok(expanded.shards[expanded.manifest.shards.find((shard) => shard.url === entry.location.shard).id]
    .events.some((event) => event.id === "new-stable-id"));
  assert.notEqual(expanded.manifest.contentVersion, initial.manifest.contentVersion);
});

test("five thousand documents grow through bounded period pages instead of an unbounded era payload", () => {
  const count = 5_000;
  const nodes = Array.from({ length: count }, (_, index) => node(`scale-${String(index).padStart(5, "0")}`, {
    historical: {
      publicationYear: 1700 + (index % 326),
      layer: HISTORY_LANES[index % (HISTORY_LANES.length - 1)]
    },
    capabilityLayers: index % 3 ? [] : ["scalability"]
  }));
  const transitions = [];
  for (let index = 0; index < count - 1; index += 5) {
    transitions.push(edge(`scale-precedes-${index}`, nodes[index].id, nodes[index + 1].id, "precedes"));
  }
  const automatic = Array.from({ length: count }, (_, index) => edge(
    `auto-${index}`,
    nodes[index].id,
    nodes[(index + 1) % count].id,
    "related",
    { origin: "derived" }
  ));
  const lens = buildHistoricalLens(graph(nodes, [...automatic, ...transitions]));
  const shards = Object.values(lens.shards);
  const lookupShards = Object.values(lens.lookupShards);
  const lookupEntries = lookupShards.flatMap((shard) => shard.entries);
  const shardedTransitions = lookupTransitions(lens);

  assert.equal("lookup" in lens, false);
  assert.equal(lens.manifest.lookup.kind, "sharded");
  assert.equal(lens.manifest.lookup.hash, HISTORY_LOOKUP_HASH);
  assert.equal(lens.manifest.lookup.route, "lookup/bucket-{bucket}.json");
  assert.equal(lens.manifest.lookup.recordLimit, HISTORY_LIMITS.lookupShardRecords);
  assert.equal(lens.manifest.lookup.bucketCount & (lens.manifest.lookup.bucketCount - 1), 0);
  assert.equal(lookupShards.length, lens.manifest.lookup.bucketCount);
  assert.equal(lookupEntries.length, count);
  assert.equal(new Set(lookupEntries.map((entry) => entry.id)).size, count);
  assert.equal(shardedTransitions.length, transitions.length);
  assert.equal(new Set(shardedTransitions.map((transition) => transition.id)).size, transitions.length);
  assert.ok(lookupShards.every((shard) => shard.stats.records <= HISTORY_LIMITS.lookupShardRecords));
  assert.ok(lookupShards.every((shard) => shard.entries.length + shard.transitions.length === shard.stats.records));
  assert.ok(lookupShards.every((shard) => Buffer.byteLength(JSON.stringify(shard)) < 192 * 1024));
  assert.ok(lookupShards.every((shard) => gzipSync(JSON.stringify(shard)).length < 48 * 1024));
  for (const shard of lookupShards) {
    assert.equal(shard.schemaVersion, lens.manifest.schemaVersion);
    assert.equal(shard.contentVersion, lens.manifest.contentVersion);
    assert.equal(shard.bucket.id, shard.id);
    assert.equal(shard.bucket.bucketCount, lens.manifest.lookup.bucketCount);
  }
  for (const record of [...lookupEntries, ...shardedTransitions]) {
    const bucket = historyLookupBucket(
      record.id,
      lens.manifest.lookup.bucketCount,
      lens.manifest.lookup.bucketWidth
    );
    const shard = lens.lookupShards[bucket.id];
    assert.ok(shard, `missing deterministic lookup bucket ${bucket.id}`);
    const members = record.kind === "transition" ? shard.transitions : shard.entries;
    assert.equal(members.filter((member) => member.id === record.id).length, 1);
  }
  assert.equal(shards.reduce((sum, shard) => sum + shard.events.length, 0), count);
  assert.ok(shards.every((shard) => shard.events.length <= HISTORY_LIMITS.periodPageEvents));
  assert.ok(shards.every((shard) => shard.transitions.length <= HISTORY_LIMITS.shardTransitions));
  assert.ok(shards.every((shard) => gzipSync(JSON.stringify(shard)).length < 96 * 1024));
  assert.ok(lens.overview.periods.every((period) => period.sampleEvents.length <= HISTORY_LIMITS.overviewSamplesPerPeriod));
  assert.ok(lens.overview.transitions.length <= HISTORY_LIMITS.overviewTransitions);
  assert.equal(lens.transitions.length, transitions.length);
  const firstLoad = Buffer.concat([
    Buffer.from(JSON.stringify(lens.manifest)),
    Buffer.from(JSON.stringify(lens.overview))
  ]);
  assert.ok(Buffer.byteLength(JSON.stringify(lens.manifest)) < 256 * 1024);
  assert.ok(gzipSync(firstLoad).length <= 60 * 1024);
  for (const shard of shards) {
    const stubIds = new Set(shard.roleNodes.map((item) => item.id));
    assert.ok(shard.transitions.flatMap((transition) => transition.roleNodeIds).every((id) => stubIds.has(id)));
  }
});
