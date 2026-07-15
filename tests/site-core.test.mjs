import assert from "node:assert/strict";
import test from "node:test";
import {
  buildGraphPayload,
  buildPageLookup,
  normalizeBase,
  parseDocument,
  parseFlowList,
  resolvePageLinks,
  safeExternalUrl,
  validateUniquePageOutputs,
  withBase
} from "../site/core.mjs";

function page(title, targets = [], extra = {}) {
  return {
    title,
    filePath: `${title}.md`,
    aliases: [],
    category: "concepts",
    slug: title.toLowerCase(),
    url: `/concepts/${title.toLowerCase()}/`,
    targets,
    incoming: 0,
    ...extra
  };
}

test("frontmatter and flow-list parsing remain deterministic", () => {
  const parsed = parseDocument("---\r\ntitle: Example\r\naliases: [one, \"two, three\"]\r\n---\r\nBody");
  assert.deepEqual(parsed.data, { title: "Example", aliases: "[one, \"two, three\"]" });
  assert.equal(parsed.content, "Body");
  assert.deepEqual(parseFlowList('[one, "two, three", "say \\"hello\\""]'), [
    "one",
    "two, three",
    'say "hello"'
  ]);
  assert.deepEqual(parseFlowList("[Church's theorem, 'it''s, quoted', next]"), [
    "Church's theorem",
    "it's, quoted",
    "next"
  ]);
});

test("base paths and external URLs are normalized safely", () => {
  assert.equal(normalizeBase("/CS_Wiki/"), "/CS_Wiki");
  assert.equal(withBase("concepts/one/", "/CS_Wiki/"), "/CS_Wiki/concepts/one/");
  assert.equal(safeExternalUrl("https://example.com/source#page"), "https://example.com/source#page");
  assert.equal(safeExternalUrl("http://example.com/source"), "http://example.com/source");
  assert.equal(safeExternalUrl("javascript:alert(1)"), "");
  assert.equal(safeExternalUrl("/relative/source"), "");
});

test("links are fully aggregated before scoring and self-links are excluded", () => {
  const alpha = page("Alpha", ["Alpha", "Beta"]);
  const beta = page("Beta", ["Alpha"]);
  const gamma = page("Gamma", ["Alpha"]);
  const pages = [alpha, beta, gamma];

  resolvePageLinks(pages, buildPageLookup(pages));

  assert.deepEqual(alpha.links, [beta]);
  assert.equal(alpha.incoming, 2);
  assert.equal(alpha.score, 3);
  assert.deepEqual(beta.links, [alpha]);
  assert.equal(beta.incoming, 1);
  assert.equal(beta.score, 2);
  assert.equal(gamma.score, 1);
});

test("graph edges survive reverse-only links and mutual links are deduplicated", () => {
  const first = page("First", [], { score: 20 });
  const second = page("Second", [], { score: 10 });
  const third = page("Third", [], { score: 5 });
  first.links = [second];
  second.links = [first];
  third.links = [first];

  const graph = buildGraphPayload([first, second, third]);

  assert.deepEqual(graph.nodes.map((node) => node.title), ["First", "Second", "Third"]);
  assert.deepEqual(graph.edges, [[0, 1], [0, 2]]);
});

test("lookup and output collisions fail the build instead of silently winning", () => {
  const alpha = page("Alpha", [], { aliases: ["shared"] });
  const beta = page("Beta", [], { aliases: ["shared"] });
  assert.throws(() => buildPageLookup([alpha, beta]), /Duplicate page lookup key/);

  const duplicate = page("Other", [], { slug: alpha.slug });
  assert.throws(() => validateUniquePageOutputs([alpha, duplicate]), /Duplicate page output/);

  const source = page("Source", [], { category: "sources", slug: "shared" });
  const reference = page("Reference", [], { category: "references", slug: "shared" });
  assert.throws(() => validateUniquePageOutputs([source, reference], {
    additionalOutputs: (item) => item.category === "references" ? [`sources/${item.slug}`] : []
  }), /Duplicate page output/);
});
