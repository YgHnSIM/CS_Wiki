import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import YAML from "yaml";
import { loadWikiManifest, revisionFor } from "./wiki_manifest.mjs";

const root = process.cwd();
const today = process.env.WIKI_TODAY || new Date().toISOString().slice(0, 10);
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
const overviewPage = manifest.pages.find((page) => page.relativePath === "wiki/overview.md");
const overviewBody = `<!-- wiki-v2:generated overview -->\n# CS Wiki 개요\n\n운영 스키마 v2로 관리되는 지식 베이스다. 모든 문서는 공개 목록에 포함되며, 수정 시 근거와 검토 상태를 함께 갱신한다.\n\n## 현재 규모\n\n- 전체 페이지: ${pages.length}개\n- 정규 소스: ${counts.sources}개\n- 참고 자료: ${counts.references}개\n- 개념: ${counts.concepts}개\n- 개체: ${counts.entities}개\n- 분석: ${counts.analyses}개\n- 메타: ${counts.meta}개\n\n## 주요 항목\n\n- [[위키 색인]] — 문서 전체의 자동 색인.\n- [[작업 로그]] — 작업별 상세 기록의 목록.\n\n## 출처\n\n${evidenceBlock}\n\n## 관련 항목\n\n- [[위키 색인]] — 전체 문서를 유형별로 탐색한다.`;
const overviewData = structuredClone(overviewPage.rawFrontmatter);
await writeFile(join(root, overviewPage.relativePath), render(overviewData, overviewBody), "utf8");

console.log(JSON.stringify({ indexed: pages.length, counts }, null, 2));
