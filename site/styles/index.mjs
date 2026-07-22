import { readFile } from "node:fs/promises";
import { join } from "node:path";


export const STYLE_PARTS = Object.freeze([
  "00-core.css",
  "10-evidence-lineage.css",
  "20-document-relationships.css",
  "30-archive.css",
  "40-learning.css",
  "50-semantic-atlas.css",
  "60-history.css"
]);


export async function loadSiteCss(root) {
  const chunks = await Promise.all(STYLE_PARTS.map((name) => readFile(join(root, "site", "styles", name), "utf8")));
  return chunks.join("");
}
