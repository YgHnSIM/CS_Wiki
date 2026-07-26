import { readdir, readFile } from "node:fs/promises";
import { basename, extname, join, relative, sep } from "node:path";
import YAML from "yaml";
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

export function parseWikiPage(raw, { filePath, root, wikiRoot, categories = categoryMeta }) {
  const parsed = parseDocument(raw);
  let v2 = null;
  if (parsed.data.schema_version === "2" || parsed.data.schema_version === 2) {
    const match = String(raw).match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    v2 = match ? YAML.parse(match[1], { uniqueKeys: false }) : null;
  }
  if (v2?.schema_version === 2) {
    const category = categoryForPath(filePath, wikiRoot, categories, [`type/${v2.kind}`]);
    const title = String(v2.title || basename(filePath, ".md"));
    const history = v2.history || {};
    const event = history.event || {};
    const source = v2.kind === "source" || v2.kind === "reference";
    const body = parsed.content.trim();
    const oldSlug = slugify(title);
    const legacyUrls = Array.isArray(v2.redirect_from) ? v2.redirect_from : [];
    return {
      filePath,
      relativePath: relative(root, filePath).split(sep).join("/"),
      schemaVersion: 2,
      id: v2.id,
      title,
      summary: v2.summary,
      aliases: Array.isArray(v2.aliases) ? v2.aliases : [],
      tags: [`type/${v2.kind}`, ...(v2.domains || []).map((domain) => `domain/${domain}`), `status/${v2.editorial_status}`],
      sources: Array.isArray(v2.evidence_ids) ? v2.evidence_ids : [],
      evidenceIds: Array.isArray(v2.evidence_ids) ? v2.evidence_ids : [],
      status: v2.editorial_status,
      editorialStatus: v2.editorial_status,
      publicationVisibility: v2.publication_visibility,
      created: v2.created,
      updated: v2.updated,
      sourceId: source ? v2.id : "",
      graphId: source ? "" : v2.id,
      graphVisibility: v2.graph_visibility,
      publicationYear: history.publication_year ?? "",
      eventStart: event.start ?? "",
      eventEnd: event.end ?? "",
      historicalLayer: history.layer || "",
      historicalNote: history.note || "",
      capabilityLayers: Array.isArray(v2.capability_layers) ? v2.capability_layers : [],
      sourceKind: v2.origin || "",
      primarySources: source ? (v2.works?.primary || []).map((work) => work.citation) : [],
      supportingSources: source ? (v2.works?.supporting || []).map((work) => work.citation) : [],
      sourceUrls: source ? (v2.access || []).filter((item) => item.kind === "url").map((item) => item.url) : [],
      retrieved: source ? ((v2.access || []).find((item) => item.retrieved)?.retrieved || "") : "",
      version: source ? ((v2.works?.primary || []).find((work) => work.edition)?.edition || null) : null,
      snapshotStatus: source ? ((v2.access || []).some((item) => item.kind === "local") ? "local" : (v2.access || []).some((item) => item.kind === "snapshot") ? "archived" : "external-only") : "",
      review: v2.review,
      body,
      description: v2.summary,
      category,
      slug: oldSlug,
      url: `/docs/${v2.id}/`,
      legacyUrl: `/${category}/${oldSlug}/`,
      legacyUrls: [...new Set([`/${category}/${oldSlug}/`, ...legacyUrls])],
      attachments: extractAttachmentLinks(parsed.content),
      targets: extractWikiLinks(parsed.content).map((link) => link.target),
      incoming: 0
    };
  }
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
