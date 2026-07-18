import test from "node:test";
import assert from "node:assert/strict";
import {
  EVIDENCE_MAX_BUCKETS,
  createEvidenceLruCache,
  evidenceLookupBucket,
  evidenceLookupHash,
  evidenceManifestAssetUrl,
  evidencePrefixBucket,
  evidencePrefixSearchKey,
  evidenceResultKeyboardIndex,
  evidenceUrlFor,
  isEvidenceBucketCount,
  normalizeEvidenceLookupValue,
  normalizeEvidencePayloadVersion,
  parseEvidenceUrl
} from "../site/assets/evidence-state.js";

test("evidence lookup normalization and FNV hash cover the full NFKC lowercase string", () => {
  const composed = "가나다";
  const decomposed = composed.normalize("NFD");
  assert.equal(normalizeEvidenceLookupValue("ＡBC"), "abc");
  assert.equal(normalizeEvidenceLookupValue(decomposed), composed);
  assert.equal(evidenceLookupHash(composed), evidenceLookupHash(decomposed));
  assert.equal(evidenceLookupHash("A"), 3_826_002_220);

  const shared = "x".repeat(4_096);
  assert.notEqual(evidenceLookupHash(`${shared}a`), evidenceLookupHash(`${shared}b`));
  assert.equal(normalizeEvidenceLookupValue(`${shared}A`).length, 4_097);
});

test("lookup buckets require one shared bounded power-of-two count", () => {
  assert.equal(isEvidenceBucketCount(1), true);
  assert.equal(isEvidenceBucketCount(EVIDENCE_MAX_BUCKETS), true);
  assert.equal(isEvidenceBucketCount(3), false);
  assert.equal(isEvidenceBucketCount(EVIDENCE_MAX_BUCKETS * 2), false);
  const bucket = evidenceLookupBucket("문서-가", 16);
  assert.equal(bucket, evidenceLookupBucket("문서-가".normalize("NFD"), 16));
  assert.ok(bucket >= 0 && bucket < 16);
  assert.equal(evidenceLookupBucket("문서", 3), null);
  assert.equal(evidenceLookupBucket("", 8), null);
});

test("prefix search uses Unicode code points at levels 2, 3, and 4", () => {
  assert.equal(evidencePrefixSearchKey("가"), null);
  assert.deepEqual(evidencePrefixSearchKey("가나"), { level: 2, key: "가나" });
  assert.deepEqual(evidencePrefixSearchKey("가나다"), { level: 3, key: "가나다" });
  assert.deepEqual(evidencePrefixSearchKey("가나다라마"), { level: 4, key: "가나다라" });
  assert.deepEqual(evidencePrefixSearchKey("😀가나다"), { level: 4, key: "😀가나다" });
  assert.deepEqual(evidencePrefixSearchKey("가나다라", 2), { level: 2, key: "가나" });
  assert.equal(evidencePrefixSearchKey("가나", 3), null);
  assert.deepEqual(evidencePrefixSearchKey("  ＡＢ cd  "), { level: 4, key: "ab c" });

  const composed = evidencePrefixBucket("가나다", 8);
  const decomposed = evidencePrefixBucket("가나다".normalize("NFD"), 8);
  assert.deepEqual(composed, decomposed);
  assert.deepEqual(composed, {
    level: 3,
    key: "가나다",
    bucket: evidenceLookupBucket("search:3:가나다", 8)
  });
});

test("manifest assets are same-origin, route-expanded, traversal-safe, and versioned", () => {
  const manifest = {
    contentVersion: "2026-07-18-a",
    assets: {
      overview: "overview.json",
      lookup: { route: "lookup/level-{level}/bucket-{bucket}.json", bucketWidth: 3 }
    }
  };
  assert.equal(
    evidenceManifestAssetUrl(manifest, "overview", {}, { baseUrl: "/wiki/data/evidence/" }),
    "/wiki/data/evidence/overview.json?v=2026-07-18-a"
  );
  assert.equal(
    evidenceManifestAssetUrl(manifest, "lookup", { level: 2, bucket: 7 }, { baseUrl: "https://wiki.test/data/evidence/" }),
    "https://wiki.test/data/evidence/lookup/level-2/bucket-007.json?v=2026-07-18-a"
  );
  assert.equal(
    evidenceManifestAssetUrl(manifest, "https://evil.test/payload.json", {}, { baseUrl: "https://wiki.test/data/evidence/" }),
    ""
  );
  assert.equal(evidenceManifestAssetUrl(manifest, "../escape.json"), "");
  assert.equal(evidenceManifestAssetUrl(manifest, "%252e%252e/escape.json"), "");
  assert.equal(evidenceManifestAssetUrl(manifest, "lookup", { level: 2 }), "");
  assert.equal(evidenceManifestAssetUrl({}, "overview.json"), "");

  const stale = evidenceManifestAssetUrl(
    { contentVersion: "fresh" },
    "overview.json?v=stale",
    {},
    { baseUrl: "/data/evidence/" }
  );
  assert.equal(stale, "/data/evidence/overview.json?v=fresh");
});

test("static evidence URLs round-trip canonically for every route kind", () => {
  const routes = [
    [{ mode: "overview" }, "/map/evidence/"],
    [{ mode: "document", graphId: "concept-가나다", page: 1 }, "/map/evidence/document/concept-%EA%B0%80%EB%82%98%EB%8B%A4/"],
    [{ mode: "document", graphId: "concept-가나다", page: 12 }, "/map/evidence/document/concept-%EA%B0%80%EB%82%98%EB%8B%A4/12/"],
    [{ mode: "source", sourceId: "SRC-009", page: 2 }, "/map/evidence/source/src-009/2/"],
    [{ mode: "relation", routeId: "relation--0123_ab.cd", page: 3 }, "/map/evidence/relation/relation--0123_ab.cd/3/"]
  ];
  for (const [state, expected] of routes) {
    const built = evidenceUrlFor("/map/evidence/", state);
    assert.equal(built, expected);
    const parsed = parseEvidenceUrl(built);
    assert.equal(parsed.valid, true);
    assert.equal(evidenceUrlFor(built, parsed), expected);
  }

  assert.equal(
    evidenceUrlFor("https://wiki.test/base/map/evidence/", { mode: "source", sourceId: "ref-001", page: 1 }),
    "https://wiki.test/base/map/evidence/source/ref-001/"
  );
  assert.equal(
    parseEvidenceUrl("https://wiki.test/base/map/evidence/source/ref-001/", { rootPath: "/base/map/evidence/" }).sourceId,
    "ref-001"
  );
});

test("static evidence URLs preserve long ids and reject unsafe or ambiguous paths", () => {
  const longId = `concept-${"a".repeat(4_096)}-끝`;
  const built = evidenceUrlFor("/map/evidence/", { mode: "document", graphId: longId });
  const parsed = parseEvidenceUrl(built);
  assert.equal(parsed.valid, true);
  assert.equal(parsed.graphId, longId);

  assert.equal(evidenceUrlFor("/map/evidence/", { mode: "document", graphId: "../escape" }), "/map/evidence/");
  assert.equal(evidenceUrlFor("/map/evidence/", { mode: "relation", routeId: "관계-1" }), "/map/evidence/");
  for (const unsafe of [
    "/map/evidence/document/%2e%2e/",
    "/map/evidence/document/%252e%252e/",
    "/map/evidence/document/a%2Fb/",
    "/map/evidence/source/ref-001/0/",
    "/map/evidence/relation/relation-1/not-a-page/",
    "/map/evidence/document/id/2/extra/",
    "/map/atlas/document/id/"
  ]) assert.equal(parseEvidenceUrl(unsafe).valid, false, unsafe);
});

test("evidence LRU caps the payload Map and refreshes reads", () => {
  const cache = createEvidenceLruCache(2);
  cache.set("a", { value: 1 }).set("b", { value: 2 });
  assert.equal(cache.get("a").value, 1);
  cache.set("c", { value: 3 });
  assert.equal(cache.has("a"), true);
  assert.equal(cache.has("b"), false);
  assert.deepEqual(cache.keys(), ["a", "c"]);
  assert.equal(cache.peek("c").value, 3);
  cache.set("d", { value: 4 }).set("e", { value: 5 });
  assert.equal(cache.size, 2);
  assert.equal(cache.delete("d"), true);
  cache.clear();
  assert.equal(cache.size, 0);
  assert.equal(createEvidenceLruCache(1_000_000).maxEntries, 128);
  assert.equal(createEvidenceLruCache(0).maxEntries, 8);
});

test("result keyboard index clamps by default and can wrap", () => {
  assert.equal(evidenceResultKeyboardIndex(0, -1, "ArrowDown"), -1);
  assert.equal(evidenceResultKeyboardIndex(3, -1, "ArrowDown"), 0);
  assert.equal(evidenceResultKeyboardIndex(3, -1, "ArrowUp"), 2);
  assert.equal(evidenceResultKeyboardIndex(3, 2, "ArrowDown"), 2);
  assert.equal(evidenceResultKeyboardIndex(3, 2, "ArrowDown", { wrap: true }), 0);
  assert.equal(evidenceResultKeyboardIndex(3, 0, "ArrowUp"), 0);
  assert.equal(evidenceResultKeyboardIndex([{}, {}, {}], 0, "ArrowUp", { wrap: true }), 2);
  assert.equal(evidenceResultKeyboardIndex(3, 1, "Home"), 0);
  assert.equal(evidenceResultKeyboardIndex(3, 1, "End"), 2);
  assert.equal(evidenceResultKeyboardIndex(3, 1, "Escape"), -1);
  assert.equal(evidenceResultKeyboardIndex(3, 1, "Tab"), 1);
});

test("payload schema and content versions must match the active manifest", () => {
  assert.deepEqual(
    normalizeEvidencePayloadVersion(
      { schemaVersion: "1.0.0", contentVersion: "current" },
      { schemaVersion: "1.0.0", contentVersion: "current", records: [] }
    ),
    { schemaVersion: "1.0.0", contentVersion: "current" }
  );
  assert.throws(
    () => normalizeEvidencePayloadVersion(
      { schemaVersion: "1", contentVersion: "current" },
      { schemaVersion: "1", contentVersion: "stale" }
    ),
    /content version mismatch/
  );
  assert.throws(
    () => normalizeEvidencePayloadVersion({ schemaVersion: "2" }, { schemaVersion: "1" }),
    /schema version mismatch/
  );
  assert.throws(() => normalizeEvidencePayloadVersion({}, {}), /does not declare a version/);
  assert.throws(() => normalizeEvidencePayloadVersion({ contentVersion: "v" }, []), /must be an object/);
});
