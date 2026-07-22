import { readdir, readFile } from "node:fs/promises";
import { basename, extname, join, relative, sep } from "node:path";
import { categoryMeta } from "./catalog.mjs";
import {
  buildPageLookup,
  describe,
  parseDocument,
  parseFlowList,
  parseScalar,
  resolvePageLinks,
  slugify,
  validateUniquePageOutputs
} from "./core.mjs";
import { extractAttachmentLinks, extractWikiLinks } from "./graph/model.mjs";

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

export function parseWikiPage(raw, { filePath, root, wikiRoot, categories = categoryMeta }) {
  const parsed = parseDocument(raw);
  const title = parseScalar(parsed.data.title) || basename(filePath, ".md");
  const summary = parseScalar(parsed.data.summary) || describe(parsed.content);
  const tags = parseFlowList(parsed.data.tags);
  const category = categoryForPath(filePath, wikiRoot, categories, tags);
  const slug = slugify(title);

  return {
    filePath,
    relativePath: relative(root, filePath).split(sep).join("/"),
    title,
    summary,
    aliases: parseFlowList(parsed.data.aliases),
    tags,
    sources: parseFlowList(parsed.data.sources),
    status: parseScalar(parsed.data.status) || "draft",
    created: parseScalar(parsed.data.created),
    updated: parseScalar(parsed.data.updated),
    sourceId: parseScalar(parsed.data.source_id),
    graphId: parseScalar(parsed.data.graph_id),
    graphVisibility: parseScalar(parsed.data.graph_visibility),
    publicationYear: parseScalar(parsed.data.publication_year),
    eventStart: parseScalar(parsed.data.event_start),
    eventEnd: parseScalar(parsed.data.event_end),
    historicalLayer: parseScalar(parsed.data.historical_layer),
    historicalNote: parseScalar(parsed.data.historical_note),
    capabilityLayers: parseFlowList(parsed.data.capability_layers),
    sourceKind: parseScalar(parsed.data.source_kind),
    primarySources: parseFlowList(parsed.data.primary_sources),
    supportingSources: parseFlowList(parsed.data.supporting_sources),
    sourceUrls: parseFlowList(parsed.data.source_urls),
    retrieved: parseScalar(parsed.data.retrieved),
    version: parseScalar(parsed.data.version),
    snapshotStatus: parseScalar(parsed.data.snapshot_status),
    body: parsed.content.trim(),
    description: summary,
    category,
    slug,
    url: `/${category}/${slug}/`,
    attachments: extractAttachmentLinks(parsed.content),
    targets: extractWikiLinks(parsed.content).map((link) => link.target),
    incoming: 0
  };
}

export async function loadWikiContent({ root, wikiRoot, categories = categoryMeta }) {
  const files = await markdownFiles(wikiRoot);
  const pages = await Promise.all(files.map(async (filePath) => parseWikiPage(
    await readFile(filePath, "utf8"),
    { filePath, root, wikiRoot, categories }
  )));

  pages.sort((left, right) => left.title.localeCompare(right.title, "ko"));
  validateUniquePageOutputs(pages, {
    additionalOutputs: (page) => page.category === "references" ? [`sources/${page.slug}`] : []
  });
  const lookup = buildPageLookup(pages);
  resolvePageLinks(pages, lookup);
  return { pages, lookup };
}
