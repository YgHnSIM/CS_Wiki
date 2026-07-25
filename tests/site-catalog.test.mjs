import assert from "node:assert/strict";
import test from "node:test";
import { domainMeta, statusMeta } from "../site/catalog.mjs";

test("catalog labels every domain currently used by the wiki", () => {
  assert.deepEqual(
    Object.fromEntries([
      "domain/database",
      "domain/distributed-systems",
      "domain/edge-computing",
      "domain/performance"
    ].map((domain) => [domain, domainMeta[domain]])),
    {
      "domain/database": "데이터베이스",
      "domain/distributed-systems": "분산 시스템",
      "domain/edge-computing": "에지 컴퓨팅",
      "domain/performance": "성능"
    }
  );
});

test("active status explains the completed editorial checks without a generic verification claim", () => {
  assert.equal(statusMeta.active.label, "원문 대조 완료");
  assert.match(statusMeta.active.description, /원문 대조/);
  assert.match(statusMeta.active.description, /출처/);
  assert.match(statusMeta.active.description, /내부 링크/);
  assert.match(statusMeta.active.description, /색인 검사/);
});
