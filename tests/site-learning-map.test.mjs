import assert from "node:assert/strict";
import test from "node:test";
import {
  buildLearningMap,
  createLearningMapIndex,
  normalizeLearningMapState
} from "../site/assets/learning-lines.js";

function node(id, extra = {}) {
  return {
    id,
    title: id.toUpperCase(),
    aliases: [],
    url: `/concepts/${id}/`,
    category: "concepts",
    summary: `${id} summary`,
    status: "active",
    visibility: "public",
    ...extra
  };
}

function line(id, nodeIds, extra = {}) {
  return {
    id,
    title: `${id} line`,
    description: `${id} description`,
    nodeIds,
    ...extra
  };
}

function graph(extra = {}) {
  return {
    schemaVersion: "1.0.0",
    contentVersion: "2026-07-18",
    nodes: [
      node("a", { aliases: ["Alpha", "A"] }),
      node("b", { category: "sources" }),
      node("c", { category: "analyses" }),
      node("d"),
      node("off-path"),
      node("hidden-off-path", { visibility: "hidden" })
    ],
    paths: [
      line("line-z", ["a", "b", "c"]),
      line("line-a", ["b", "d"])
    ],
    ...extra
  };
}

test("learning map derives deterministic lines, public stations, memberships, and transfer counts", () => {
  const payload = buildLearningMap(graph());

  assert.deepEqual(payload.lines.map((item) => item.id), ["line-a", "line-z"]);
  assert.deepEqual(payload.lines.map((item) => item.nodeIds), [["b", "d"], ["a", "b", "c"]]);
  assert.deepEqual(payload.lines.map((item) => item.transferStations), [1, 1]);
  assert.deepEqual(payload.stations.map((item) => item.id), ["a", "b", "c", "d"]);
  assert.deepEqual(payload.stations[0].aliases, ["A", "Alpha"]);
  assert.deepEqual(payload.memberships, [
    { lineId: "line-a", stationId: "b", index: 0, step: 1, total: 2 },
    { lineId: "line-a", stationId: "d", index: 1, step: 2, total: 2 },
    { lineId: "line-z", stationId: "a", index: 0, step: 1, total: 3 },
    { lineId: "line-z", stationId: "b", index: 1, step: 2, total: 3 },
    { lineId: "line-z", stationId: "c", index: 2, step: 3, total: 3 }
  ]);
  assert.deepEqual(payload.stats, {
    lines: 2,
    stations: 4,
    stationOccurrences: 5,
    transferStations: 1,
    maxLineMemberships: 2
  });
});

test("learning payload is independent of node, line, and alias input order", () => {
  const source = graph();
  const reordered = graph({
    nodes: [...source.nodes].reverse().map((item) => ({
      ...item,
      aliases: [...item.aliases].reverse()
    })),
    paths: [...source.paths].reverse()
  });

  assert.equal(JSON.stringify(buildLearningMap(source)), JSON.stringify(buildLearningMap(reordered)));
});

test("explicit editorial order controls line and transfer ordering", () => {
  const payload = buildLearningMap({
    nodes: [node("a"), node("b"), node("c")],
    paths: [
      line("alphabetically-first", ["a", "b"], { order: 1 }),
      line("editorially-first", ["a", "c"], { order: 0 })
    ]
  });
  const index = createLearningMapIndex(payload);

  assert.deepEqual(payload.lines.map((item) => item.id), ["editorially-first", "alphabetically-first"]);
  assert.deepEqual(index.lineOrder, ["editorially-first", "alphabetically-first"]);
  assert.deepEqual(index.membershipsByStation.get("a").map((item) => item.lineId), [
    "editorially-first",
    "alphabetically-first"
  ]);
});

test("invalid line structure and non-public stations fail with explicit errors", () => {
  assert.throws(
    () => buildLearningMap(graph({ paths: [line("same", ["a", "b"]), line("same", ["b", "c"])] })),
    /duplicate learning line ID 'same'/
  );
  assert.throws(
    () => buildLearningMap(graph({ paths: [line("short", ["a"])] })),
    /must contain at least 2 stations/
  );
  assert.throws(
    () => buildLearningMap(graph({ paths: [line("repeat", ["a", "b", "a"])] })),
    /contains duplicate station 'a'/
  );
  assert.throws(
    () => buildLearningMap(graph({ paths: [line("missing", ["a", "unknown"])] })),
    /references missing station 'unknown'/
  );
  assert.throws(
    () => buildLearningMap(graph({
      nodes: [node("a"), node("hidden", { visibility: "hidden" })],
      paths: [line("hidden-line", ["a", "hidden"])]
    })),
    /references non-public station 'hidden' \(hidden\)/
  );
  assert.throws(
    () => buildLearningMap(graph({
      nodes: [node("a"), node("context", { visibility: "context" })],
      paths: [line("context-line", ["a", "context"])]
    })),
    /references non-public station 'context' \(context\)/
  );
});

test("new documents and whole lines enter automatically and update transfer statistics", () => {
  const initial = buildLearningMap({
    nodes: [node("a"), node("b"), node("c")],
    paths: [line("line-one", ["a", "b"]), line("line-two", ["b", "c"])]
  });
  const expanded = buildLearningMap({
    nodes: [node("a"), node("b"), node("c"), node("new-stable-id")],
    paths: [
      line("line-one", ["a", "new-stable-id", "b"]),
      line("line-two", ["b", "c"]),
      line("line-three", ["c", "new-stable-id"])
    ]
  });

  assert.deepEqual(initial.stats, {
    lines: 2,
    stations: 3,
    stationOccurrences: 4,
    transferStations: 1,
    maxLineMemberships: 2
  });
  assert.deepEqual(expanded.stats, {
    lines: 3,
    stations: 4,
    stationOccurrences: 7,
    transferStations: 3,
    maxLineMemberships: 2
  });
  assert.deepEqual(
    expanded.memberships.filter((item) => item.stationId === "new-stable-id").map((item) => item.lineId),
    ["line-one", "line-three"]
  );
});

test("the learning index exposes ordered line and station membership lookups", () => {
  const index = createLearningMapIndex(buildLearningMap(graph()));

  assert.deepEqual(index.lineOrder, ["line-a", "line-z"]);
  assert.deepEqual(index.stationOrder, ["a", "b", "c", "d"]);
  assert.deepEqual(index.membershipsByStation.get("b").map((item) => item.lineId), ["line-a", "line-z"]);
  assert.deepEqual(index.membershipsByLine.get("line-z").map((item) => item.stationId), ["a", "b", "c"]);
  assert.equal(index.defaultLineId, "line-a");
  assert.equal(index.defaultStationId, "b");
});

test("the browser index rejects corrupt and incomplete membership payloads", () => {
  const valid = buildLearningMap(graph());
  const duplicate = structuredClone(valid);
  duplicate.memberships.push({ ...duplicate.memberships[0] });
  assert.throws(() => createLearningMapIndex(duplicate), /duplicate membership/);

  const wrongIndex = structuredClone(valid);
  wrongIndex.memberships[0].index = 99;
  assert.throws(() => createLearningMapIndex(wrongIndex), /invalid index/);

  const wrongStep = structuredClone(valid);
  wrongStep.memberships[0].step = 9;
  assert.throws(() => createLearningMapIndex(wrongStep), /inconsistent step metadata/);

  const incomplete = structuredClone(valid);
  incomplete.memberships.pop();
  assert.throws(() => createLearningMapIndex(incomplete), /incomplete memberships/);
});

test("URL state normalization handles exact, station-only, mismatch, invalid, and empty states", () => {
  const index = createLearningMapIndex(buildLearningMap(graph()));

  assert.deepEqual(normalizeLearningMapState(index, { line: "line-z", station: "c" }), {
    line: "line-z", station: "c", corrected: false, reason: "exact"
  });
  assert.deepEqual(normalizeLearningMapState(index, { station: "b" }), {
    line: "line-a", station: "b", corrected: true, reason: "station-only"
  });
  assert.deepEqual(normalizeLearningMapState(index, { line: "line-z", station: "d" }), {
    line: "line-a", station: "d", corrected: true, reason: "line-station-mismatch"
  });
  assert.deepEqual(normalizeLearningMapState(index, { line: "missing", station: "c" }), {
    line: "line-z", station: "c", corrected: true, reason: "invalid-line"
  });
  assert.deepEqual(normalizeLearningMapState(index, { line: "line-z", station: "missing" }), {
    line: "line-z", station: "a", corrected: true, reason: "invalid-station"
  });
  assert.deepEqual(normalizeLearningMapState(index, { line: "line-z" }), {
    line: "line-z", station: "a", corrected: true, reason: "line-only"
  });
  assert.deepEqual(normalizeLearningMapState(index, {}), {
    line: "line-a", station: "b", corrected: true, reason: "default"
  });
  assert.deepEqual(normalizeLearningMapState(index, { line: "bad", station: "bad" }), {
    line: "line-a", station: "b", corrected: true, reason: "invalid-state"
  });
});

test("stable node and line IDs preserve deep links across title changes", () => {
  const before = buildLearningMap({
    nodes: [node("stable-a", { title: "Old title" }), node("stable-b")],
    paths: [line("stable-line", ["stable-a", "stable-b"], { title: "Old line title" })]
  });
  const after = buildLearningMap({
    nodes: [node("stable-a", { title: "새 제목" }), node("stable-b")],
    paths: [line("stable-line", ["stable-a", "stable-b"], { title: "새 노선 제목" })]
  });
  const beforeState = normalizeLearningMapState(createLearningMapIndex(before), {
    line: "stable-line",
    station: "stable-a"
  });
  const afterState = normalizeLearningMapState(createLearningMapIndex(after), beforeState);

  assert.equal(after.stations.find((item) => item.id === "stable-a").title, "새 제목");
  assert.deepEqual(afterState, {
    line: "stable-line", station: "stable-a", corrected: false, reason: "exact"
  });
});
