import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import YAML from "yaml";

const exec = promisify(execFile);
const root = process.cwd();
const today = process.env.WIKI_TODAY || new Date().toISOString().slice(0, 10);
const base = process.env.BASE_SHA || process.env.GITHUB_BASE_SHA || "";
const errors = [];
const add = (code, path, message) => errors.push({ code, path, message });

async function git(...args) {
  const result = await exec("git", args, { cwd: root, maxBuffer: 8 * 1024 * 1024 });
  return result.stdout;
}

function frontmatter(text) {
  const match = String(text).match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  return YAML.parse(match[1], { uniqueKeys: false }) || null;
}

async function oldFile(revision, path) {
  try {
    return await git("show", `${revision}:${path}`);
  } catch {
    return null;
  }
}

async function main() {
  if (!base || /^0+$/.test(base)) {
    console.log("change-set: BASE_SHA is not set; diff gate skipped");
    return;
  }
  const statusText = await git("diff", "--name-status", "-z", `${base}...HEAD`);
  const tokens = statusText.split("\0").filter(Boolean);
  const changes = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const status = tokens[index];
    if (/^[RC]/.test(status)) {
      const oldPath = tokens[++index];
      const newPath = tokens[++index];
      changes.push({ status: status[0], oldPath, path: newPath });
    } else {
      changes.push({ status: status[0], path: tokens[++index] });
    }
  }
  const changedLogs = changes.some((change) => change.path.startsWith("wiki/logs/") || change.path === "wiki/log.md");
  for (const change of changes) {
    const path = change.path.replaceAll("\\", "/");
    if (path === "raw" || path.startsWith("raw/")) {
      if (change.status !== "A") add("raw.immutable", path, "raw 원본은 추가 이후 수정·삭제·이동할 수 없다.");
      continue;
    }
    if (!path.startsWith("wiki/") || !path.endsWith(".md")) continue;
    if (path.startsWith("wiki/logs/")) continue;
    if (change.status === "D") {
      add("page.no_delete", path, "페이지 삭제 대신 editorial_status: retired로 보존해야 한다.");
      continue;
    }
    const currentText = await readFile(join(root, path), "utf8").catch(() => "");
    const current = frontmatter(currentText);
    const previous = await oldFile(base, path).then(frontmatter);
    if (!current || current.schema_version !== 2) add("page.schema", path, "변경된 위키 페이지는 schema_version: 2여야 한다.");
    if (previous?.id && current?.id && previous.id !== current.id) add("identity.immutable", path, `페이지 ID를 ${previous.id}에서 ${current.id}로 바꿀 수 없다.`);
    if (current?.editorial_status === "active" && current.updated !== today) add("updated.required", path, `active 페이지의 updated는 변경일(${today})이어야 한다.`);
    if (previous?.review?.mode === "legacy-baseline" && current?.editorial_status === "active" && current?.review?.mode !== "attested") {
      add("review.attestation", path, "기존 active 페이지를 실질 변경할 때 review.mode: attested가 필요하다.");
    }
  }
  const changedVisiblePage = changes.some((change) => change.path.startsWith("wiki/") && change.path.endsWith(".md") && !change.path.startsWith("wiki/logs/") && !["wiki/index.md", "wiki/overview.md", "wiki/log.md"].includes(change.path));
  if (changedVisiblePage && !changedLogs) add("log.coverage", "wiki/log.md", "문서 변경을 설명하는 새 로그 항목이 필요하다.");
  if (errors.length) {
    console.error(JSON.stringify({ errors }, null, 2));
    process.exitCode = 1;
  } else {
    console.log(`change-set: ${changes.length} changed paths validated`);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
