import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import YAML from "yaml";
import { loadWikiManifest, revisionFor } from "./wiki_manifest.mjs";
import { runDate } from "./wiki_date.mjs";
import { CAPABILITY_LAYERS, HISTORICAL_LAYERS } from "../site/graph/schema.mjs";

const root = process.cwd();
const today = runDate();
const excluded = new Set(["wiki/index.md", "wiki/overview.md", "wiki/log.md"]);
const evidenceBlock = "<!-- wiki-v2:evidence-start -->\n### 근거 ID\n- 없음\n<!-- wiki-v2:evidence-end -->";

function render(data, body) {
  data.updated = today;
  data.review.revision = revisionFor(body, data);
  return `---\n${YAML.stringify(data, { lineWidth: 0 }).trimEnd()}\n---\n\n${body.trim()}\n`;
}

const manifest = await loadWikiManifest({ root, strict: true });
const pages = manifest.pages.filter((page) => !excluded.has(page.relativePath));
const labels = { sources: "소스", references: "참고 자료", concepts: "개념", entities: "개체", analyses: "분석", meta: "메타" };
const sections = Object.keys(labels).map((category) => {
  const items = pages.filter((page) => page.category === category).sort((a, b) => a.title.localeCompare(b.title, "ko"));
  return `## ${labels[category]}\n\n${items.length ? items.map((page) => `- [[${page.title}]] — ${page.summary}`).join("\n") : "- 없음"}`;
}).join("\n\n");

const indexPage = manifest.pages.find((page) => page.relativePath === "wiki/index.md");
const indexBody = `<!-- wiki-v2:generated index -->\n# 위키 색인\n\n${sections}\n\n## 출처\n\n${evidenceBlock}\n\n## 관련 항목\n\n- [[위키 개요]] — 운영 규모와 현재 상태를 확인한다.`;
const indexData = structuredClone(indexPage.rawFrontmatter);
await writeFile(join(root, indexPage.relativePath), render(indexData, indexBody), "utf8");

const counts = Object.fromEntries(Object.keys(labels).map((category) => [category, pages.filter((page) => page.category === category).length]));
const capabilityLabels = {
  computability: "계산 가능성",
  complexity: "계산 복잡도",
  programmability: "프로그래밍 가능성",
  "realized-performance": "실현 성능",
  scalability: "확장성",
  "resource-efficiency": "자원 효율",
  "reliable-results": "결과 신뢰성"
};
const historicalLabels = {
  theory: "이론",
  machine: "기계",
  architecture: "아키텍처",
  software: "소프트웨어",
  system: "시스템",
  service: "서비스",
  measurement: "측정"
};
const publicKnowledge = pages.filter((page) => ["concept", "entity", "analysis"].includes(page.kind) && page.graphVisibility === "public");
const curatedPages = publicKnowledge.filter((page) => page.relations.length);
const curatedRelations = publicKnowledge.reduce((sum, page) => sum + page.relations.length, 0);
const capabilityCounts = CAPABILITY_LAYERS.map((layer) => `${capabilityLabels[layer]} ${publicKnowledge.filter((page) => page.capabilityLayers.includes(layer)).length}개`).join(" · ");
const historicalCounts = HISTORICAL_LAYERS.map((layer) => `${historicalLabels[layer]} ${publicKnowledge.filter((page) => page.history.historicalLayer === layer).length}개`).join(" · ");
const overviewPage = manifest.pages.find((page) => page.relativePath === "wiki/overview.md");
const overviewBody = `<!-- wiki-v2:generated overview -->\n# CS Wiki 개요\n\n운영 스키마 v2로 관리되는 지식 베이스다. 모든 문서는 공개 목록에 포함되며, 수정 시 근거와 검토 상태를 함께 갱신한다.\n\n## 현재 규모\n\n- 전체 페이지: ${pages.length}개\n- 정규 소스: ${counts.sources}개\n- 참고 자료: ${counts.references}개\n- 개념: ${counts.concepts}개\n- 개체: ${counts.entities}개\n- 분석: ${counts.analyses}개\n- 메타: ${counts.meta}개\n\n## 온톨로지 상태\n\n그래프에 공개하는 개념·개체·분석의 층위와 검토된 의미 관계다. 빈 능력 층위나 역사 층위는 린트가 거부한다. 연도는 원전 대조 없이 채우지 않는다.\n\n- 공개 지식 문서: ${publicKnowledge.length}개\n- 능력 층위 부여: ${publicKnowledge.filter((page) => page.capabilityLayers.length).length}/${publicKnowledge.length}\n- 역사 층위 부여: ${publicKnowledge.filter((page) => page.history.historicalLayer).length}/${publicKnowledge.length}\n- 검토된 의미 관계: ${curatedRelations}개 (${curatedPages.length}개 문서)\n- 능력 층위: ${capabilityCounts}\n- 역사 층위: ${historicalCounts}\n\n## 주요 항목\n\n- [[위키 색인]] — 문서 전체의 자동 색인.\n- [[작업 로그]] — 작업별 상세 기록의 목록.\n- [[지식 그래프 관계 스키마]] — 의미 관계와 층위 어휘의 작성 규칙.\n\n## 출처\n\n${evidenceBlock}\n\n## 관련 항목\n\n- [[위키 색인]] — 전체 문서를 유형별로 탐색한다.\n- [[지식 그래프 관계 스키마]] — 관계 종류와 근거 채널을 확인한다.`;
const overviewData = structuredClone(overviewPage.rawFrontmatter);
await writeFile(join(root, overviewPage.relativePath), render(overviewData, overviewBody), "utf8");

console.log(JSON.stringify({ indexed: pages.length, counts }, null, 2));
