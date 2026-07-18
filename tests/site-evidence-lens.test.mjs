import test from "node:test";
import assert from "node:assert/strict";
import {
  evidenceEntryLensType,
  evidenceSearchEntryUrl,
  matchesEvidenceSearchEntry
} from "../site/assets/evidence-lens.js";

test("evidence search keeps document, evidence source, and relation scopes distinct", () => {
  assert.equal(evidenceEntryLensType({ type: "document" }), "document");
  assert.equal(evidenceEntryLensType({ type: "evidence" }), "source");
  assert.equal(evidenceEntryLensType({ type: "relation" }), "relation");

  const document = {
    type: "document",
    title: "컴퓨팅 능력이란 무엇인가",
    aliases: ["Computing Capability"]
  };
  assert.equal(matchesEvidenceSearchEntry(document, "컴퓨팅", "all"), true);
  assert.equal(matchesEvidenceSearchEntry(document, "computing", "document"), true);
  assert.equal(matchesEvidenceSearchEntry(document, "능력이란", "all"), false, "search is deliberately prefix-only");
  assert.equal(matchesEvidenceSearchEntry(document, "컴퓨팅", "source"), false);
  assert.equal(matchesEvidenceSearchEntry(document, "컴", "all"), false);
});

test("evidence result routes use stable focus ids instead of article URLs", () => {
  const root = "https://example.test/wiki/map/evidence/";
  assert.equal(
    evidenceSearchEntryUrl({ type: "document", recordId: "concepts-계산-가능성", url: "https://outside.test/ignored" }, root),
    "https://example.test/wiki/map/evidence/document/concepts-%EA%B3%84%EC%82%B0-%EA%B0%80%EB%8A%A5%EC%84%B1/"
  );
  assert.equal(
    evidenceSearchEntryUrl({ type: "evidence", recordId: "ref-049" }, root),
    "https://example.test/wiki/map/evidence/source/ref-049/"
  );
  assert.equal(
    evidenceSearchEntryUrl({ type: "relation", recordId: "unsafe|edge", shardId: "relation-0123456789abcdef" }, root),
    "https://example.test/wiki/map/evidence/relation/relation-0123456789abcdef/"
  );
  assert.equal(evidenceSearchEntryUrl({ type: "relation", recordId: "unsafe|edge" }, root), "");
});

test("Korean composed and decomposed aliases match the same normalized prefix", () => {
  const composed = { type: "evidence", title: "가나다 원전", aliases: [] };
  assert.equal(matchesEvidenceSearchEntry(composed, "가나", "source"), true);
  assert.equal(matchesEvidenceSearchEntry(composed, "가나".normalize("NFD"), "source"), true);
});
