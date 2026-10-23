import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { domainMeta } from "../site/catalog.mjs";

const vocabulary = JSON.parse(await readFile(new URL("../schema/vocabulary.json", import.meta.url), "utf8"));

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
  assert.deepEqual(
    Object.keys(domainMeta).sort(),
    vocabulary.domains.map((domain) => `domain/${domain}`).sort()
  );
});
