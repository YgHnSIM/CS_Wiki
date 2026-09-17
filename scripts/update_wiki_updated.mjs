import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";
import { revisionFor } from "./wiki_manifest.mjs";
import { runDate } from "./wiki_date.mjs";

const exec = promisify(execFile);

export function parseGitNulPaths(stdout = "") {
  return String(stdout)
    .split("\0")
    .map((path) => path.trim().replaceAll("\\", "/"))
    .filter((path) => path.startsWith("wiki/") && path.endsWith(".md") && !path.startsWith("wiki/logs/"));
}

export async function updateWikiUpdated({
  root = process.cwd(),
  base = process.env.BASE_SHA || "",
  today = runDate(),
  reviewer = process.env.WIKI_REVIEWER || "antigravity"
} = {}) {
  const source = base
    ? ["diff", "-z", "--name-only", "--diff-filter=ACMRT", `${base}...HEAD`]
    : ["diff", "-z", "--name-only", "--diff-filter=ACMRT"];
  const output = await exec("git", source, { cwd: root });
  const paths = parseGitNulPaths(output.stdout);
  let changed = 0;
  for (const relativePath of paths) {
    const filePath = join(root, relativePath);
    const text = await readFile(filePath, "utf8");
    const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    if (!match) continue;
    const data = YAML.parse(match[1], { uniqueKeys: false });
    if (data?.schema_version !== 2) continue;
    const body = text.slice(match[0].length).replace(/\r\n?/g, "\n").trim();
    data.updated = today;
    if (data.review) {
      if (data.editorial_status === "active" && data.review.mode === "legacy-baseline") {
        data.review.mode = "attested";
        data.review.reviewed_at = today;
        data.review.reviewed_by = reviewer;
      }
      data.review.revision = revisionFor(body, data);
    }
    await writeFile(filePath, `---\n${YAML.stringify(data, { lineWidth: 0 }).trimEnd()}\n---\n\n${body}\n`, "utf8");
    changed += 1;
  }
  return { changed, today, paths };
}

if (process.argv[1] && resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1])) {
  const result = await updateWikiUpdated();
  console.log(`updated: ${result.changed} visible pages set to ${result.today}`);
}
