import assert from "node:assert/strict";
import test from "node:test";
import { buildPageLookup } from "../site/core.mjs";
import {
  buildKnowledgeGraph,
  extractAttachmentLinks,
  extractWikiLinks,
  parseCuratedRelations
} from "../site/graph/model.mjs";
import { validateKnowledgeGraph } from "../site/graph/schema.mjs";
import { describeRelationship, indexGraphEdges, relationLabel, selectLocalGraph } from "../site/graph/selectors.mjs";

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

test("wiki links retain section context and recommendation notes while ignoring images and fenced examples", () => {
  const links = extractWikiLinks(`본문 [[Alpha|알파]]\n\n## 관련 항목\n- [[Beta]] — 다음 개념의 전제다.\n- ![[image.png]]\n\`\`\`md\n[[Example only]]\n\`\`\``);
  assert.deepEqual(links.map(({ target, section, line, note }) => ({ target, section, line, note })), [
    { target: "Alpha", section: "본문", line: 1, note: "" },
    { target: "Beta", section: "관련 항목", line: 4, note: "다음 개념의 전제다." }
  ]);
});

test("attachment links include every Obsidian file family while ignoring external and fenced examples", () => {
  assert.deepEqual(extractAttachmentLinks(`![[diagram.svg]]\n![plot](assets/plot.png)\n[paper](<files/paper.pdf>)\n![[audio/recording.flac]]\n![[audio/voice.m4a]]\n![[audio/clip.ogg]]\n![[video/demo.mkv]]\n![[video/demo.mov]]\n![[board.canvas]]\n![[data.base]]\n![remote](https://example.test/remote.png)\n\`\`\`md\n![[ignored.jpg]]\n\`\`\``), [
    "assets/plot.png",
    "audio/clip.ogg",
    "audio/recording.flac",
    "audio/voice.m4a",
    "board.canvas",
    "data.base",
    "diagram.svg",
    "files/paper.pdf",
    "video/demo.mkv",
    "video/demo.mov"
  ]);
});

test("curated relation tables preserve wiki-link aliases containing pipes", () => {
  const relations = parseCuratedRelations(`## 관계\n\n| 관계 | 대상 | 설명 | 근거 |\n|---|---|---|---|\n| enables | [[Target|표시 이름]] | 새 작업을 표현하게 한다. | [[Evidence|원전]] |\n| responds_to | [[Problem]] | 문제에 대응한다. | [[Evidence]] |`, { pageTitle: "Source" });
  assert.deepEqual(relations[0], {
    kind: "enables",
    target: "Target",
    note: "새 작업을 표현하게 한다.",
    evidence: ["Evidence"],
    line: 5
  });
  assert.equal(relations[1].kind, "responds_to");
  assert.equal(relations[1].target, "Problem");
  assert.deepEqual(parseCuratedRelations("```markdown\n## 관계\n\n| 관계 | 대상 | 설명 |\n|---|---|---|\n| enables | [[Target]] | 예시 |\n```"), []);
});

test("the normalized graph distinguishes four connection channels and bundles each document pair once", () => {
  const evidence = page("Evidence", { category: "references", sourceId: "ref-001" });
  const alpha = page("Alpha", {
    graphId: "concept-alpha",
    sources: ["Evidence"],
    targets: ["Beta", "diagram.svg", "Missing page"],
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

  assert.equal(result.schemaVersion, "2.0.0");
  assert.equal(result.contentVersion, "2026-01-02");
  assert.equal(result.nodes.find((node) => node.title === "Evidence").id, "ref-001");
  const alphaNode = result.nodes.find((node) => node.title === "Alpha");
  assert.equal(alphaNode.id, "concept-alpha");
  assert.equal(alphaNode.url, "/base/concepts/alpha/");
  assert.deepEqual(alphaNode.tags, ["domain/computer-science"]);
  assert.deepEqual(alphaNode.attachments, ["diagram.svg"]);
  assert.deepEqual(alphaNode.unresolved, ["Missing page"]);
  assert.deepEqual(alphaNode.historical, { publicationYear: 1936, eventStart: 1936, eventEnd: 1945, layer: "theory", note: null });
  assert.deepEqual(alphaNode.pathMemberships.map((membership) => membership.id), ["route"]);

  assert.equal(result.edges.filter((edge) => edge.kind === "supports").length, 1);
  assert.equal(result.edges.filter((edge) => edge.kind === "mentions").length, 1);
  assert.equal(result.edges.filter((edge) => edge.kind === "recommends").length, 2);
  assert.ok(result.edges.filter((edge) => edge.kind === "recommends").every((edge) => edge.directed));
  assert.equal(result.edges.filter((edge) => edge.kind === "path_next").length, 1);
  const curated = result.edges.find((edge) => edge.kind === "enables");
  assert.equal(curated.origin, "curated");
  assert.deepEqual(curated.evidence, ["ref-001"]);
  assert.equal(curated.contexts[0].note, "Alpha가 Beta를 가능하게 한다.");
  assert.equal(result.stats.byKind.enables, 1);
  const alphaBeta = result.connections.find((connection) => connection.kinds.includes("enables"));
  assert.deepEqual(alphaBeta.kinds, ["enables", "mentions", "path_next", "recommends"]);
  assert.equal(alphaBeta.channels.core.length, 1);
  assert.equal(alphaBeta.channels.guide.length, 3);
  assert.equal(alphaBeta.channels.trace.length, 1);
  assert.equal(result.stats.connectionPairs, result.connections.length);
  const corrupt = structuredClone(result);
  const corruptBundle = corrupt.connections.find((connection) => connection.kinds.includes("enables"));
  corruptBundle.channels.trace.push(corruptBundle.channels.core[0]);
  assert.throws(() => validateKnowledgeGraph(corrupt), /misclassifies|membership/);
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
  assert.throws(() => graph([page("Bad", { eventStart: "", eventEnd: "1945" })]), /event_end requires event_start/);
  assert.throws(() => graph([page("Bad", { historicalNote: "x".repeat(301) })]), /historical_note/);
  assert.throws(() => graph([
    page("One", { graphId: "shared-id" }),
    page("Two", { graphId: "shared-id" })
  ]), /Duplicate graph node id/);
  assert.throws(() => graph([
    page("Bad", { body: "## 관계\n\n| 관계 | 대상 | 설명 |\n|---|---|---|\n| invented | [[Target]] | 설명 |" }),
    target
  ]), /Unknown curated relation/);
  assert.throws(() => graph([
    page("Bad", { body: "## 관계\n\n| 관계 | 대상 | 설명 | 근거 |\n|---|---|---|---|\n| enables | [[Missing]] | 설명 | [[Target]] |" }),
    target
  ]), /references missing page/);
  assert.throws(() => graph([
    page("Bad", { body: "## 관계\n\n| 관계 | 대상 | 설명 | 근거 |\n|---|---|---|---|\n| responds_to | [[Target]] | 확인된 제약에 대응한다. | |" }),
    target
  ]), /needs direct evidence/);
});

test("local graph selection separates four channels and excludes hidden operational nodes", () => {
  const evidence = page("Evidence", { category: "references", sourceId: "ref-001" });
  const learner = page("Learner");
  const related = page("Related", { body: "## 관련 항목\n\n- [[Focus]]" });
  const mentioned = page("Mentioned");
  const hidden = page("Hidden", { graphVisibility: "hidden" });
  const focus = page("Focus", {
    graphId: "concept-focus",
    sources: ["Evidence"],
    body: "[[Mentioned]]와 [[Hidden]]을 설명한다.\n\n## 관련 항목\n\n- [[Related]]"
  });
  const route = { slug: "route", title: "Route", description: "A route", pages: [focus, learner] };
  const result = graph([focus, evidence, learner, related, mentioned, hidden], [route]);
  const local = selectLocalGraph(result, "concept-focus", { limit: 4 });

  assert.deepEqual(local.channels, ["core", "guide", "evidence", "trace"]);
  assert.deepEqual(local.views.core, []);
  assert.deepEqual(local.views.guide.map((record) => record.node.title), ["Related", "Learner"]);
  assert.deepEqual(local.views.evidence.map((record) => record.node.title), ["Evidence"]);
  assert.deepEqual(local.views.trace.map((record) => record.node.title), ["Mentioned"]);
  assert.equal(local.records.some((record) => record.node.title === "Hidden"), false);
  assert.equal(local.totalNeighbors, 4);
  assert.equal(local.totalEdges, 5);

  const evidenceRecord = local.records.find((record) => record.node.title === "Evidence");
  assert.equal(evidenceRecord.direction, "incoming");
  assert.equal(relationLabel(result, evidenceRecord.primaryEdge, "concept-focus"), "근거를 받음");
  assert.equal(relationLabel(result, evidenceRecord.primaryEdge, "ref-001"), "근거로 뒷받침");
  assert.match(describeRelationship(result, evidenceRecord.primaryEdge).detail, /sources/);
});

test("local graph shows one neighbor card while preserving every edge and direction", () => {
  const focus = page("Focus", { graphId: "concept-focus", body: "[[Neighbor]]\n\n## 관련 항목\n\n- [[Neighbor]]" });
  const neighbor = page("Neighbor", { body: "## 관련 항목\n\n- [[Focus]]" });
  const route = { slug: "route", title: "Route", description: "A route", pages: [focus, neighbor] };
  const result = graph([focus, neighbor], [route]);
  const local = selectLocalGraph(result, "concept-focus");

  assert.equal(local.totalNeighbors, 1);
  assert.deepEqual(local.records[0].edges.map((edge) => edge.kind), ["recommends", "recommends", "path_next", "mentions"]);
  assert.deepEqual(local.records[0].labels, ["함께 읽기 추천", "읽을거리로 추천됨", "학습 경로의 다음 단계", "본문에서 언급"]);
  assert.deepEqual(local.records[0].availableChannels, ["guide", "trace"]);
  assert.equal(local.views.guide[0].primaryEdge.kind, "recommends");
  assert.equal(local.views.trace[0].primaryEdge.kind, "mentions");
  assert.equal(local.views.guide.length, 1);
});

test("channel views keep weaker relations that share a neighbor with a stronger guide edge", () => {
  const evidence = page("Evidence", { category: "references", sourceId: "ref-001" });
  const focus = page("Focus", { graphId: "concept-focus", sources: ["Evidence"] });
  const route = { slug: "route", title: "Route", description: "A route", pages: [evidence, focus] };
  const result = graph([focus, evidence], [route]);
  const local = selectLocalGraph(result, "concept-focus");

  assert.equal(local.records[0].primaryEdge.kind, "path_next");
  assert.equal(local.views.evidence[0].primaryEdge.kind, "supports");
  assert.equal(local.views.guide[0].primaryEdge.kind, "path_next");
});

test("the reusable edge index preserves local graph results as the wiki grows", () => {
  const focus = page("Focus", { graphId: "concept-focus", body: "[[One]]과 [[Two]]" });
  const one = page("One");
  const two = page("Two", { body: "## 관련 항목\n\n- [[Focus]]" });
  const result = graph([focus, one, two]);
  const edgesByNodeId = indexGraphEdges(result);
  const scanned = selectLocalGraph(result, "concept-focus", { limit: 12 });
  const indexed = selectLocalGraph(result, "concept-focus", { limit: 12, edgesByNodeId });

  assert.deepEqual(indexed, scanned);
  assert.equal(edgesByNodeId.get("concept-focus").length, scanned.totalEdges);
});
