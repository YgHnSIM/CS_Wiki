import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import YAML from "yaml";
import { revisionFor } from "./wiki_manifest.mjs";
import { runDate } from "./wiki_date.mjs";

const exec = promisify(execFile);
const root = process.cwd();
const today = runDate();
const base = process.env.BASE_SHA || "";
const source = base ? ["diff", "--name-only", "--diff-filter=ACMRT", `${base}...HEAD`] : ["diff", "--name-only", "--diff-filter=ACMRT"];
const output = await exec("git", source, { cwd: root });
const paths = output.stdout.split(/\r?\n/).map((path) => path.trim()).filter((path) => path.startsWith("wiki/") && path.endsWith(".md") && !path.startsWith("wiki/logs/"));
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
      data.review.reviewed_by = process.env.WIKI_REVIEWER || "antigravity";
    }
    data.review.revision = revisionFor(body, data);
  }
  await writeFile(filePath, `---\n${YAML.stringify(data, { lineWidth: 0 }).trimEnd()}\n---\n\n${body}\n`, "utf8");
  changed += 1;
}
console.log(`updated: ${changed} visible pages set to ${today}`);
