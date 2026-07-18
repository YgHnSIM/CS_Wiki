import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import {
  EVIDENCE_LIMITS,
  EVIDENCE_LOOKUP_HASH,
  EVIDENCE_SCHEMA_VERSION,
  EVIDENCE_SEARCH_PREFIX_LEVELS,
  buildEvidenceLens,
  evidenceLookupBucket,
  evidenceLookupHash,
  evidenceLookupKey,
  evidenceSearchPrefix,
  evidenceStaticPageCount,
  evidenceStaticPageNumbers,
  normalizeEvidenceSearchText
} from "../site/graph/evidence.mjs";

function node(id, extra = {}) {
  return {
    id,
    title: extra.title || `문서 ${id}`,
    aliases: extra.aliases || [],
    url: extra.url || `/${extra.category || "concepts"}/${id}/`,
    category: extra.category || "concepts",
    domains: extra.domains || ["domain/computer-science"],
    status: extra.status || "active",
    summary: extra.summary || `${id} 범위 요약`,
    visibility: extra.visibility || "public",
    sourceId: extra.sourceId || null,
    provenance: extra.provenance || {
      sources: [],
      primarySources: [],
      supportingSources: [],
      sourceUrls: [],
      sourceKind: null,
      retrieved: null,
      version: null,
      snapshotStatus: null
    },
    created: extra.created || "2026-01-01",
    updated: extra.updated || "2026-01-02"
  };
}

function evidenceNode(id, extra = {}) {
  const category = extra.category || "references";
  return node(id, {
    ...extra,
    category,
    sourceId: extra.sourceId || id,
    provenance: extra.provenance || {
      sources: [`자료 ${id}`],
      primarySources: [`원전 ${id}`],
      supportingSources: [`접근 사본 ${id}`],
      sourceUrls: [`https://example.test/${id}`],
      sourceKind: category === "sources" ? "raw" : "external",
      retrieved: "2026-07-18",
      version: null,
      snapshotStatus: category === "sources" ? "local" : "external-only"
    }
  });
}

function edge(id, source, target, kind, extra = {}) {
  return {
    id,
    source,
    target,
    kind,
    origin: extra.origin || (kind === "supports" ? "derived" : "curated"),
    directed: extra.directed ?? true,
    evidence: extra.evidence || [],
    contexts: extra.contexts || []
  };
}

function graph(nodes, edges = [], extra = {}) {
  return { schemaVersion: extra.schemaVersion || "1.0.0", nodes, edges, contentVersion: extra.contentVersion || "ignored-upstream-version" };
}

function bytes(value) {
  return Buffer.byteLength(JSON.stringify(value));
}

function lookupRecords(lens) {
  return Object.values(lens.lookupShards).flatMap((shard) => shard.records);
}

function lookupRecord(lens, type, id) {
  const key = evidenceLookupKey(type, id, lens.manifest.lookup.maxIdLength);
  const address = evidenceLookupBucket(key, lens.manifest.lookup.bucketCount, lens.manifest.lookup.bucketWidth, {
    maxBuckets: lens.manifest.lookup.maxBuckets,
    maxIdLength: lens.manifest.lookup.maxIdLength
  });
  return lens.lookupShards[address.id].records.find((record) => record.key === key) || null;
}

function searchMatches(lens, query) {
  const request = evidenceSearchPrefix(query);
  if (!request) return [];
  const address = evidenceLookupBucket(request.key, lens.manifest.search.bucketCount, lens.manifest.search.bucketWidth, {
    maxBuckets: lens.manifest.search.maxBuckets,
    maxIdLength: lens.manifest.search.maxIdLength
  });
  return Object.values(lens.searchShards)
    .filter((page) => page.level === request.level && page.bucket.id === address.id)
    .sort((left, right) => left.page - right.page)
    .flatMap((page) => page.entries)
    .filter((entry) => entry.prefix === request.prefix);
}

function expectedShard(type, id) {
  return `${type}-${createHash("sha256").update(`${type}\0${id}`).digest("hex").slice(0, 16)}`;
}

function recursivelyCollectKeys(value, result = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => recursivelyCollectKeys(item, result));
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      result.push(key);
      recursivelyCollectKeys(item, result);
    }
  }
  return result;
}

test("lookup and prefix hashes are browser-reimplementable across Unicode normalization", () => {
  assert.equal(EVIDENCE_LOOKUP_HASH, "fnv1a32-utf16");
  assert.equal(evidenceLookupHash("hello"), 0x4f9f2cab);
  assert.equal(evidenceLookupHash("Ａ"), evidenceLookupHash("a"));
  assert.equal(evidenceLookupHash("가나다"), evidenceLookupHash("가나다"));
  assert.notEqual(evidenceLookupHash("document:same"), evidenceLookupHash("evidence:same"));
  assert.deepEqual(evidenceLookupBucket("hello", 16, 2), {
    index: evidenceLookupHash("hello") & 15,
    id: String(evidenceLookupHash("hello") & 15).padStart(2, "0")
  });
  assert.throws(() => evidenceLookupBucket("hello", 3), /positive power of two/);
  assert.throws(() => evidenceLookupBucket("hello", 16, 1), /at least 2/);
  assert.throws(() => evidenceLookupHash("x".repeat(EVIDENCE_LIMITS.lookupMaxIdLength + 1)), /1-1024/);
  assert.throws(() => evidenceLookupKey("claim", "id"), /Unknown evidence lookup type/);

  assert.equal(normalizeEvidenceSearchText("  가  나  "), "가 나");
  assert.equal(normalizeEvidenceSearchText("가\u0001나"), "가 나");
  assert.equal(evidenceSearchPrefix("가"), null);
  assert.deepEqual(evidenceSearchPrefix("가나다라마바사"), {
    normalized: "가나다라마바사",
    level: 4,
    prefix: "가나다라",
    key: "search:4:가나다라"
  });
  assert.deepEqual(EVIDENCE_SEARCH_PREFIX_LEVELS, [2, 3, 4]);
});

test("the lens keeps page-level evidence, explicit relation evidence, and visibility boundaries distinct", () => {
  const nodes = [
    node("doc-a", { title: "공개 논지 A", aliases: ["논지 A"] }),
    node("doc-b", { title: "공개 논지 B" }),
    node("doc-context", { visibility: "context" }),
    node("doc-hidden", { visibility: "hidden" }),
    evidenceNode("ref-public", {
      title: "공개 원전",
      provenance: {
        sources: ["접근 사본", "원 출판물"],
        primarySources: ["원 출판물"],
        supportingSources: ["접근 사본"],
        sourceUrls: ["https://example.test/b", "https://example.test/a"],
        sourceKind: "external",
        retrieved: "2026-07-18",
        version: "first",
        snapshotStatus: "archived"
      }
    }),
    evidenceNode("ref-context", { visibility: "context" }),
    evidenceNode("ref-hidden", { visibility: "hidden" }),
    evidenceNode("src-unused", { category: "sources" })
  ];
  const edges = [
    edge("support-public-a", "ref-public", "doc-a", "supports"),
    edge("support-context-a", "ref-context", "doc-a", "supports"),
    edge("support-hidden-a", "ref-hidden", "doc-a", "supports"),
    edge("support-context-document", "ref-public", "doc-context", "supports"),
    edge("curated-support-is-not-frontmatter", "ref-public", "doc-b", "supports", {
      origin: "curated",
      evidence: ["ref-public"],
      contexts: [{ note: "명시 관계이며 frontmatter 근거 연결은 아니다." }]
    }),
    edge("relation-a-b", "doc-a", "doc-b", "contradicts", {
      evidence: ["ref-hidden", "ref-context", "ref-public"],
      contexts: [{ pageId: "doc-a", section: "관계", note: "두 문서의 적용 조건이 충돌한다." }]
    }),
    edge("relation-context-endpoint", "doc-a", "doc-context", "enables", {
      evidence: ["ref-public"],
      contexts: [{ note: "전역 주장이 아니다." }]
    }),
    edge("relation-without-evidence", "doc-a", "doc-b", "related", { evidence: [] })
  ];
  const lens = buildEvidenceLens(graph(nodes, edges));

  assert.deepEqual(lens.documentAssertions.map((item) => item.nodeId), ["doc-a", "doc-b"]);
  assert.equal(lens.documentAssertions.find((item) => item.nodeId === "doc-a").evidenceCount, 2);
  assert.equal(lens.documentAssertions.find((item) => item.nodeId === "doc-b").evidenceCount, 0);
  assert.deepEqual(lens.relationAssertions.map((item) => item.edgeId), ["curated-support-is-not-frontmatter", "relation-a-b"]);
  const explicitRelation = lens.relationAssertions.find((item) => item.edgeId === "relation-a-b");
  assert.equal(explicitRelation.statement, "두 문서의 적용 조건이 충돌한다.");
  assert.deepEqual(explicitRelation.evidenceIds, ["ref-context", "ref-public"]);
  assert.deepEqual(lens.evidenceDocuments.map((item) => item.id), ["ref-context", "ref-public", "src-unused"]);
  assert.deepEqual(lens.attestations.map((item) => item.scope).sort(), ["document", "document", "relation", "relation", "relation"]);
  assert.ok(lens.attestations.every((item) => ["frontmatter:sources", "relation:evidence"].includes(item.basis)));

  const provenance = lens.evidenceDocuments.find((item) => item.id === "ref-public").provenance;
  assert.deepEqual(provenance.primarySources, ["원 출판물"]);
  assert.deepEqual(provenance.supportingSources, ["접근 사본"]);
  assert.deepEqual(provenance.sourceUrls, ["https://example.test/a", "https://example.test/b"]);
  assert.equal(provenance.snapshotStatus, "archived");

  assert.ok(lookupRecord(lens, "document", "doc-a"));
  assert.ok(lookupRecord(lens, "relation", "relation-a-b"));
  assert.ok(lookupRecord(lens, "evidence", "ref-public"));
  assert.equal(lookupRecord(lens, "evidence", "ref-context"), null, "context evidence must not enter global lookup");
  assert.equal(searchMatches(lens, "문서 ref-context").length, 0, "context evidence must not enter global search");
  assert.equal(lens.manifest.stats.unlinkedDocuments, 1);

  assert.equal(lens.documentAssertions[0].shardId, expectedShard("document", "doc-a"));
  assert.equal(explicitRelation.shardId, expectedShard("relation", "relation-a-b"));
  assert.equal(lens.evidenceDocuments.find((item) => item.id === "ref-public").shardId, expectedShard("evidence", "ref-public"));
  assert.match(lens.documentAssertions[0].shardId, /^document-[a-f0-9]{16}$/);
  assert.ok(searchMatches(lens, "공개 논지").every((entry) => new RegExp(`^${entry.type}-[a-f0-9]{16}$`).test(entry.shardId)));

  const forbidden = recursivelyCollectKeys(lens).filter((key) => /confidence|strength|independent/i.test(key));
  assert.deepEqual(forbidden, []);
});

test("canonical output ignores input ordering and editorial timestamps but reacts to relevant content", () => {
  const base = graph([
    node("doc", { title: "결정적 문서", aliases: ["둘", "하나"], domains: ["domain/z", "domain/a"] }),
    evidenceNode("ref", {
      aliases: ["참고 둘", "참고 하나"],
      provenance: {
        sources: ["b", "a"],
        primarySources: ["primary-b", "primary-a"],
        supportingSources: ["support-b", "support-a"],
        sourceUrls: ["https://b.test", "https://a.test"],
        sourceKind: "external",
        retrieved: "2026-07-18",
        version: "v1",
        snapshotStatus: "external-only"
      }
    }),
    node("other")
  ], [
    edge("support", "ref", "doc", "supports"),
    edge("relation", "doc", "other", "enables", {
      evidence: ["ref"],
      contexts: [{ note: "두 번째" }, { note: "첫 번째" }]
    })
  ]);
  const reordered = structuredClone(base);
  reordered.nodes.reverse();
  reordered.edges.reverse();
  for (const item of reordered.nodes) {
    item.aliases.reverse();
    item.domains.reverse();
    for (const field of ["sources", "primarySources", "supportingSources", "sourceUrls"]) item.provenance[field].reverse();
    item.created = "1900-01-01";
    item.updated = "2999-12-31";
  }
  for (const item of reordered.edges) {
    item.evidence.reverse();
    item.contexts.reverse();
  }

  const first = buildEvidenceLens(base);
  const second = buildEvidenceLens(reordered);
  assert.equal(first.manifest.contentVersion, second.manifest.contentVersion);
  assert.deepEqual(first, second);

  const renamed = structuredClone(base);
  renamed.nodes.find((item) => item.id === "doc").title = "이름이 바뀐 문서";
  const renamedLens = buildEvidenceLens(renamed);
  assert.notEqual(renamedLens.manifest.contentVersion, first.manifest.contentVersion);
  assert.equal(renamedLens.documentAssertions[0].shardId, first.documentAssertions[0].shardId);

  const provenanceChanged = structuredClone(base);
  provenanceChanged.nodes.find((item) => item.id === "ref").provenance.version = "v2";
  assert.notEqual(buildEvidenceLens(provenanceChanged).manifest.contentVersion, first.manifest.contentVersion);
});

test("direct lookup obeys both record and raw-byte ceilings", () => {
  const nodes = Array.from({ length: 48 }, (_, index) => node(`bounded-${String(index).padStart(3, "0")}`, {
    title: `바이트 경계 문서 ${String(index).padStart(3, "0")} ${"설명".repeat(60)}`
  }));
  const lens = buildEvidenceLens(graph(nodes), {
    limits: { lookupShardRecords: 4, lookupShardBytes: 2_400 }
  });

  assert.equal(lens.manifest.lookup.recordLimit, 4);
  assert.equal(lens.manifest.lookup.byteLimit, 2_400);
  assert.ok(lens.manifest.lookup.bucketCount > 1);
  assert.ok((lens.manifest.lookup.bucketCount & (lens.manifest.lookup.bucketCount - 1)) === 0);
  assert.equal(lens.manifest.lookup.maxBuckets, EVIDENCE_LIMITS.lookupMaxBuckets);
  assert.equal(lens.manifest.lookup.maxIdLength, EVIDENCE_LIMITS.lookupMaxIdLength);
  for (const shard of Object.values(lens.lookupShards)) {
    assert.ok(shard.records.length <= 4);
    assert.ok(bytes(shard) <= 2_400);
  }
  assert.equal(lookupRecords(lens).length, nodes.length);
  assert.ok(lookupRecord(lens, "document", "bounded-047"));
});

test("prefix search indexes only normalized title and aliases in one deterministic bucket", () => {
  const lens = buildEvidenceLens(graph([
    node("hangul", {
      title: "가나다라 컴퓨팅",
      aliases: ["가나다라 별칭", "완전히 다른 별칭"],
      summary: "오직요약검색어는 prefix index에 들어가면 안 된다."
    }),
    node("another", { title: "가나다마 다른 문서" })
  ]));

  const matches = searchMatches(lens, "가나다라마바사");
  assert.equal(matches.filter((entry) => entry.recordId === "hangul").length, 1, "composed/decomposed aliases must deduplicate");
  assert.equal(matches[0].prefix, "가나다라");
  assert.equal(searchMatches(lens, "오직요약검색어").length, 0);
  assert.equal(lens.manifest.search.minimumCodePoints, 2);
  assert.equal(lens.manifest.search.maximumCodePoints, 4);
  assert.deepEqual(lens.manifest.search.prefixLevels, [2, 3, 4]);
  assert.equal(lens.manifest.search.route, "search/level-{level}/bucket-{bucket}/page-{page}.json");

  for (const page of Object.values(lens.searchShards)) {
    assert.ok(page.entries.length <= EVIDENCE_LIMITS.searchPageRecords);
    assert.ok(bytes(page) <= EVIDENCE_LIMITS.searchPageBytes);
    assert.match(page.route, /^search\/level-[234]\/bucket-\d+\/page-\d{4}\.json$/);
  }
});

test("one evidence hub used by 1,000 documents paginates exact-once in both directions", { timeout: 30_000 }, () => {
  const count = 1_000;
  const source = evidenceNode("ref-hub", { title: "공통 근거 허브" });
  const documents = Array.from({ length: count }, (_, index) => node(`claim-${String(index).padStart(4, "0")}`, {
    title: `확장 문서 ${String(index).padStart(4, "0")}`
  }));
  const edges = documents.map((item, index) => edge(`support-${String(index).padStart(4, "0")}`, "ref-hub", item.id, "supports"));
  const lens = buildEvidenceLens(graph([source, ...documents], edges));

  assert.equal(lens.manifest.stats.documentAssertions, count);
  assert.equal(lens.manifest.stats.documentEvidenceLinks, count);
  assert.equal(lens.manifest.stats.evidenceDocuments, 1);
  const evidence = lens.evidenceDocuments[0];
  assert.equal(evidence.usedByCount, count);
  const focus = lens.evidenceShards[evidence.shardId];
  assert.equal(focus.preview.records.length, EVIDENCE_LIMITS.previewRecords);
  assert.equal(focus.preview.totalRecords, count);
  assert.equal(focus.preview.truncated, true);
  assert.ok(bytes(focus.preview) <= EVIDENCE_LIMITS.previewBytes);

  const reversePages = Object.values(lens.evidenceDetails)
    .filter((page) => page.focusId === "ref-hub")
    .sort((left, right) => left.page - right.page);
  assert.equal(reversePages.length, Math.ceil(count / EVIDENCE_LIMITS.detailPageRecords));
  const reverseRecords = reversePages.flatMap((page) => page.records);
  assert.equal(reverseRecords.length, count);
  assert.equal(new Set(reverseRecords.map((record) => record.id)).size, count);
  assert.ok(reverseRecords.every((record) => record.attestation.scope === "document"
    && record.assertion.scope === "document" && record.evidence.id === "ref-hub"));
  for (const page of reversePages) {
    assert.ok(page.records.length <= EVIDENCE_LIMITS.detailPageRecords);
    assert.ok(bytes(page) <= EVIDENCE_LIMITS.detailPageBytes);
  }

  const forwardPages = Object.values(lens.assertionDetails).filter((page) => page.focusType === "assertion");
  assert.equal(forwardPages.length, count);
  const forwardRecords = forwardPages.flatMap((page) => page.records);
  assert.equal(forwardRecords.length, count);
  assert.equal(new Set(forwardRecords.map((record) => record.id)).size, count);
  assert.ok(forwardRecords.every((record) => record.assertion.scope === "document"
    && record.evidence.id === "ref-hub" && record.evidence.provenance.primarySources.length));
});

test("several thousand documents keep manifest and overview bounded without O(N) route maps", { timeout: 30_000 }, () => {
  const count = 3_000;
  const nodes = Array.from({ length: count }, (_, index) => node(`scale-${String(index).padStart(4, "0")}`, {
    title: `대규모 문서 ${String(index).padStart(4, "0")}`,
    domains: [`domain/${String(index % 40).padStart(2, "0")}`]
  }));
  const lens = buildEvidenceLens(graph(nodes));

  assert.equal(lens.manifest.schemaVersion, EVIDENCE_SCHEMA_VERSION);
  assert.equal(lens.manifest.stats.documentAssertions, count);
  assert.equal(lens.manifest.stats.unlinkedDocuments, count);
  assert.equal(Object.keys(lens.assertionShards).length, count);
  assert.equal(Object.keys(lens.assertionDetails).length, 0);
  assert.equal(lookupRecords(lens).length, count);
  assert.ok(bytes(lens.manifest) <= EVIDENCE_LIMITS.manifestBytes);
  assert.ok(bytes(lens.overview) <= EVIDENCE_LIMITS.overviewBytes);
  assert.ok(lens.manifest.facets.domains.values.length <= EVIDENCE_LIMITS.overviewDomains);
  assert.equal(lens.manifest.facets.domains.total, 40);
  assert.equal(lens.manifest.facets.domains.omitted, 24);
  assert.equal(JSON.stringify(lens.manifest).includes("scale-2999"), false, "manifest must not map every stable id to a shard");
  assert.equal(lens.manifest.routes.assertion, "assertions/{shard}.json");
  assert.ok(lookupRecord(lens, "document", "scale-2999"));

  for (const shard of Object.values(lens.lookupShards)) {
    assert.ok(shard.records.length <= EVIDENCE_LIMITS.lookupShardRecords);
    assert.ok(bytes(shard) <= EVIDENCE_LIMITS.lookupShardBytes);
  }
  for (const page of Object.values(lens.searchShards)) {
    assert.ok(page.entries.length <= EVIDENCE_LIMITS.searchPageRecords);
    assert.ok(bytes(page) <= EVIDENCE_LIMITS.searchPageBytes);
  }
  const matches = searchMatches(lens, "대규모 문서 2999");
  assert.ok(matches.length <= count);
  assert.ok(matches.some((entry) => entry.recordId === "scale-2999"));
});

test("static evidence pagination stays bounded while high-degree documents and relations remain reachable", () => {
  const pageCount = evidenceStaticPageCount(1_000, 3_000);
  assert.equal(pageCount, 250);
  assert.deepEqual(evidenceStaticPageNumbers(1, pageCount), [1, 2, 3, 250]);
  assert.deepEqual(evidenceStaticPageNumbers(125, pageCount), [1, 123, 124, 125, 126, 127, 250]);
  assert.deepEqual(evidenceStaticPageNumbers(250, pageCount), [1, 248, 249, 250]);
  assert.ok(evidenceStaticPageNumbers(500_000, 1_000_000).length <= 7);
  assert.throws(() => evidenceStaticPageNumbers(0, pageCount), /within the available range/);
  assert.throws(() => evidenceStaticPageNumbers(1, 0), /positive integer/);
});

test("an oversized atomic provenance record fails closed instead of truncating evidence", () => {
  const oversized = "원전".repeat(30_000);
  assert.throws(() => buildEvidenceLens(graph([
    node("claim"),
    evidenceNode("ref-oversized", {
      provenance: {
        sources: [oversized],
        primarySources: [oversized],
        supportingSources: [],
        sourceUrls: ["https://example.test/oversized"],
        sourceKind: "external",
        retrieved: "2026-07-18",
        version: null,
        snapshotStatus: "external-only"
      }
    })
  ], [edge("oversized-support", "ref-oversized", "claim", "supports")])), /atomic detail record exceeding/);
});
