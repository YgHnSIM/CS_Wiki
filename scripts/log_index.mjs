import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import YAML from "yaml";

const EVIDENCE_BLOCK = `<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->`;

/**
 * Load the raw log records in filename order. Logs are operational records,
 * not manifest pages, so their titles come from their own frontmatter.
 */
export async function loadLogEntries(root) {
  const directory = join(root, "wiki", "logs");
  const files = (await readdir(directory).catch(() => []))
    .filter((name) => name.endsWith(".md"))
    .sort();
  const entries = [];
  for (const file of files) {
    let title = file.slice(0, -".md".length);
    const text = await readFile(join(directory, file), "utf8");
    const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    if (match) {
      try {
        const data = YAML.parse(match[1], { uniqueKeys: false });
        if (typeof data?.title === "string" && data.title.trim()) title = data.title.trim();
      } catch {
        // Keep the filename fallback; maintenance reports the resulting mismatch.
      }
    }
    entries.push({ file, title });
  }
  return entries;
}

export function renderLogEntries(entries) {
  return entries.map((entry) => `- [${entry.title}](logs/${entry.file})`).join("\n");
}

export function parseLogEntries(markdown) {
  const pattern = /^- \[(.+?)\]\(logs\/([^)]+\.md)\)$/gm;
  return [...String(markdown).matchAll(pattern)].map((match) => ({ title: match[1], file: match[2] }));
}

export function renderLogPageBody(entries) {
  return `<!-- wiki-v2:generated log -->
# 작업 로그

작업별 상세 기록은 항목 파일로 분리했다.

${renderLogEntries(entries)}

## 출처

${EVIDENCE_BLOCK}

## 관련 항목

- [[위키 색인]] — 변경된 문서 목록을 확인한다.`;
}
