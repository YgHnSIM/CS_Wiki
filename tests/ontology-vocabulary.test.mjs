import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { domainMeta } from "../site/catalog.mjs";
import {
  CAPABILITY_LAYERS,
  CURATED_RELATION_KINDS,
  HISTORICAL_LAYERS
} from "../site/graph/schema.mjs";

const vocabulary = JSON.parse(await readFile(new URL("../schema/vocabulary.json", import.meta.url), "utf8"));
const pageSchema = JSON.parse(await readFile(new URL("../schema/wiki-page.schema.json", import.meta.url), "utf8"));

test("page schema enums stay aligned with vocabulary, graph schema, and catalog domains", () => {
  assert.deepEqual(vocabulary.capability_layers, [...CAPABILITY_LAYERS]);
  assert.deepEqual(vocabulary.historical_layers, [...HISTORICAL_LAYERS]);
  assert.deepEqual(vocabulary.relation_kinds, [...CURATED_RELATION_KINDS]);
  assert.deepEqual(pageSchema.properties.capability_layers.items.enum, vocabulary.capability_layers);
  assert.deepEqual(pageSchema.properties.history.properties.layer.enum, vocabulary.historical_layers);
  assert.deepEqual(pageSchema.properties.domains.items.enum, vocabulary.domains);
  assert.deepEqual(
    vocabulary.domains.map((domain) => `domain/${domain}`).sort(),
    Object.keys(domainMeta).sort()
  );
});
