import assert from "node:assert/strict";
import test from "node:test";
import { buildPageLookup } from "../site/core.mjs";
import {
  buildKnowledgeGraph,
  extractWikiLinks,
  parseCuratedRelations
} from "../site/graph/model.mjs";

function page(title, extra = {}) {
  const category = extra.category || "concepts";
  return {
    title,
    filePath: `C:\\wiki\\${category}\\${title}.md`,
    aliases: [],
    category,
    slug: title.toLowerCase(),
    url: `/${category}/${title.toLowerCase()}/`,
    tags: ["domain/computer-science"],
    status: "active",
    summary: `${title} summary`,
    created: "2026-01-01",
    updated: "2026-01-02",
    sourceId: "",
    sourceKind: "",
    graphId: "",
    graphVisibility: "",
    publicationYear: "",
    eventStart: "",
    eventEnd: "",
    historicalLayer: "",
    capabilityLayers: [],
    sources: [],
    primarySources: [],
    supportingSources: [],
    sourceUrls: [],
    retrieved: "",
    version: "",
    snapshotStatus: "",
    body: "",
    score: 0,
    ...extra
  };
}

function graph(pages, paths = []) {
  return buildKnowledgeGraph(pages, paths, { lookup: buildPageLookup(pages), urlFor: (url) => `/base${url}` });
}

test("wiki links retain section context while images and fenced examples are ignored", () => {
  const links = extractWikiLinks(`본문 [[Alpha|알파]]\n\n## 관련 항목\n- [[Beta]]\n- ![[image.png]]\n\`\`\`md\n[[Example only]]\n\`\`\``);
  assert.deepEqual(links.map(({ target, section, line }) => ({ target, section, line })), [
    { target: "Alpha", section: "본문", line: 1 },
    { target: "Beta", section: "관련 항목", line: 4 }
  ]);
});

test("curated relation tables preserve wiki-link aliases containing pipes", () => {
  const relations = parseCuratedRelations(`## 관계\n\n| 관계 | 대상 | 설명 | 근거 |\n|---|---|---|---|\n| enables | [[Target|표시 이름]] | 새 작업을 표현하게 한다. | [[Evidence|원전]] |`, { pageTitle: "Source" });
  assert.deepEqual(relations, [{
    kind: "enables",
    target: "Target",
    note: "새 작업을 표현하게 한다.",
    evidence: ["Evidence"],
    line: 5
  }]);
  assert.deepEqual(parseCuratedRelations("```markdown\n## 관계\n\n| 관계 | 대상 | 설명 |\n|---|---|---|\n| enables | [[Target]] | 예시 |\n```"), []);
});

test("the normalized graph distinguishes evidence, related, mentions, paths, and curated relations", () => {
  const evidence = page("Evidence", { category: "references", sourceId: "ref-001" });
  const alpha = page("Alpha", {
    graphId: "concept-alpha",
    sources: ["Evidence"],
    publicationYear: "1936",
    eventStart: "1936",
    eventEnd: "1945",
    historicalLayer: "theory",
    capabilityLayers: ["computability"],
    body: `본문에서 [[Beta]]를 설명한다.\n\n## 관계\n\n| 관계 | 대상 | 설명 | 근거 |\n|---|---|---|---|\n| enables | [[Beta|베타]] | Alpha가 Beta를 가능하게 한다. | [[Evidence]] |\n\n## 출처\n\n- [[Evidence]]\n\n## 관련 항목\n\n- [[Beta]]`
  });
  const beta = page("Beta", { body: "## 관련 항목\n\n- [[Alpha]]" });
  const route = { slug: "route", title: "Route", description: "A route", pages: [alpha, beta] };
  const result = graph([beta, evidence, alpha], [route]);

  assert.equal(result.schemaVersion, "1.0.0");
  assert.equal(result.contentVersion, "2026-01-02");
  assert.equal(result.nodes.find((node) => node.title === "Evidence").id, "ref-001");
  const alphaNode = result.nodes.find((node) => node.title === "Alpha");
  assert.equal(alphaNode.id, "concept-alpha");
  assert.equal(alphaNode.url, "/base/concepts/alpha/");
  assert.deepEqual(alphaNode.historical, { publicationYear: 1936, eventStart: 1936, eventEnd: 1945, layer: "theory" });
  assert.deepEqual(alphaNode.pathMemberships.map((membership) => membership.id), ["route"]);

  assert.equal(result.edges.filter((edge) => edge.kind === "supports").length, 1);
  assert.equal(result.edges.filter((edge) => edge.kind === "mentions").length, 1);
  assert.equal(result.edges.filter((edge) => edge.kind === "related").length, 1);
  assert.equal(result.edges.find((edge) => edge.kind === "related").reciprocal, true);
  assert.equal(result.edges.filter((edge) => edge.kind === "path_next").length, 1);
  const curated = result.edges.find((edge) => edge.kind === "enables");
  assert.equal(curated.origin, "curated");
  assert.deepEqual(curated.evidence, ["ref-001"]);
  assert.equal(curated.contexts[0].note, "Alpha가 Beta를 가능하게 한다.");
  assert.equal(result.stats.byKind.enables, 1);
});

test("graph output is deterministic when page input order changes", () => {
  const alpha = page("Alpha", { body: "[[Beta]]\n\n## 관련 항목\n\n- [[Beta]]" });
  const beta = page("Beta", { body: "## 관련 항목\n\n- [[Alpha]]" });
  assert.equal(JSON.stringify(graph([alpha, beta])), JSON.stringify(graph([beta, alpha])));
});

test("invalid stable IDs, metadata, relations, and duplicate IDs fail loudly", () => {
  const target = page("Target");
  assert.throws(() => graph([page("Bad", { graphId: "Bad ID" })]), /Invalid graph_id/);
  assert.throws(() => graph([page("Bad", { eventStart: "2000", eventEnd: "1900" })]), /event_start/);
  assert.throws(() => graph([page("Bad", { historicalLayer: "unknown" })]), /historical_layer/);
  assert.throws(() => graph([page("Bad", { capabilityLayers: ["speed"] })]), /capability_layers/);
  assert.throws(() => graph([
    page("One", { graphId: "shared-id" }),
    page("Two", { graphId: "shared-id" })
  ]), /Duplicate graph node id/);
  assert.throws(() => graph([
    page("Bad", { body: "## 관계\n\n| 관계 | 대상 | 설명 |\n|---|---|---|\n| invented | [[Target]] | 설명 |" }),
    target
  ]), /Unknown curated relation/);
  assert.throws(() => graph([
    page("Bad", { body: "## 관계\n\n| 관계 | 대상 | 설명 |\n|---|---|---|\n| enables | [[Missing]] | 설명 |" }),
    target
  ]), /references missing page/);
});
