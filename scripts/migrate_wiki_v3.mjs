import { readdir, readFile, writeFile } from "node:fs/promises";
import { extname, join, relative, sep } from "node:path";
import YAML from "yaml";
import { runDate } from "./wiki_date.mjs";

const root = process.cwd();
const wikiRoot = join(root, "wiki");
const today = runDate();

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "logs") continue;
      files.push(...await markdownFiles(path));
    } else if (extname(entry.name).toLowerCase() === ".md") {
      files.push(path);
    }
  }
  return files;
}

function stripReviewBlock(lines) {
  const output = [];
  for (let index = 0; index < lines.length; index += 1) {
    if (/^review:\s*$/.test(lines[index])) {
      index += 1;
      while (index < lines.length && (/^\s/.test(lines[index]) || lines[index] === "")) index += 1;
      index -= 1;
      continue;
    }
    output.push(lines[index]);
  }
  return output;
}

function migrateFrontmatter(frontmatter) {
  const data = YAML.parse(frontmatter, { uniqueKeys: false });
  if (data?.schema_version === 3 && data.review === undefined && data.editorial_status === undefined) {
    return { changed: false, frontmatter, visibility: data.publication_visibility };
  }

  const status = typeof data?.editorial_status === "string" ? data.editorial_status : "";
  let visibility = typeof data?.publication_visibility === "string" ? data.publication_visibility : "public";
  if (visibility === "private") visibility = "unlisted";
  if (status && status !== "active" && visibility === "public") visibility = "unlisted";

  let lines = frontmatter.split(/\r?\n/);
  lines = stripReviewBlock(lines)
    .filter((line) => !/^editorial_status:\s*/.test(line))
    .map((line) => {
      if (/^schema_version:\s*/.test(line)) return "schema_version: 3";
      if (/^updated:\s*/.test(line)) return `updated: ${today}`;
      if (/^publication_visibility:\s*/.test(line)) return `publication_visibility: ${visibility}`;
      return line;
    });

  const next = lines.join("\n");
  const parsed = YAML.parse(next, { uniqueKeys: false });
  if (parsed?.schema_version !== 3) throw new Error("Migration did not produce schema_version: 3");
  if (parsed.review !== undefined || parsed.editorial_status !== undefined) {
    throw new Error("Migration left review or editorial_status metadata");
  }
  return { changed: true, frontmatter: next, visibility };
}

const files = await markdownFiles(wikiRoot);
let changed = 0;
const counts = {};
for (const file of files) {
  const text = await readFile(file, "utf8");
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error(`Wiki page has no frontmatter: ${relative(root, file)}`);
  const result = migrateFrontmatter(match[1]);
  if (!result.changed) continue;
  const body = text.slice(match[0].length);
  await writeFile(file, `---\n${result.frontmatter}\n---\n${body}`, "utf8");
  changed += 1;
  counts[result.visibility] = (counts[result.visibility] || 0) + 1;
}

console.log(JSON.stringify({ migrated: changed, total: files.length, visibility: counts, today }, null, 2));
