import { readdir } from "node:fs/promises";
import { extname, join, relative, sep } from "node:path";
import { categoryMeta } from "./catalog.mjs";
import {
  buildPageLookup,
  resolvePageLinks,
  validateUniquePageOutputs
} from "./core.mjs";
import { loadWikiManifest } from "../scripts/wiki_manifest.mjs";

export async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(path);
    return extname(entry.name).toLowerCase() === ".md" ? [path] : [];
  }));
  return nested.flat();
}

export function categoryForPath(filePath, wikiRoot, categories = categoryMeta, tags = []) {
  const [directory, ...rest] = relative(wikiRoot, filePath).split(sep);
  if (directory === "sources") return tags.includes("type/reference") ? "references" : "sources";
  return rest.length && categories[directory] ? directory : "meta";
}

export async function loadWikiContent({ root, wikiRoot }) {
  const manifest = await loadWikiManifest({ root, wikiRoot, strict: false });
  const pages = manifest.pages;

  pages.sort((left, right) => left.title.localeCompare(right.title, "ko"));
  validateUniquePageOutputs(pages, {
    additionalOutputs: (page) => [
      `docs/${page.id || page.slug}`,
      ...(page.legacyUrls || []).map((url) => String(url).replace(/^\/+|\/+$/g, "")),
      ...(page.category === "references" ? [`sources/${page.slug}`] : [])
    ]
  });
  const lookup = buildPageLookup(pages);
  resolvePageLinks(pages, lookup);
  return { pages, lookup };
}
