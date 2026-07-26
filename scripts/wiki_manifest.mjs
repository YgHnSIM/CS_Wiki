import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { basename, extname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import YAML from "yaml";
import { categoryMeta } from "../site/catalog.mjs";
import { extractAttachmentLinks, extractWikiLinks, parseCuratedRelations } from "../site/graph/model.mjs";
import { key, parseFlowList, parseScalar, slugify } from "../site/core.mjs";

const PAGE_SCHEMA = JSON.parse(await readFile(new URL("../schema/wiki-page.schema.json", import.meta.url), "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validateV2 = ajv.compile(PAGE_SCHEMA);

const CONTENT_KINDS = new Set(["source", "reference", "entity", "concept", "analysis", "meta"]);
const SPECIAL_FILES = new Set(["index.md", "overview.md", "log.md"]);

function parseFrontmatter(raw) {
  const match = String(raw).match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return { data: {}, body: String(raw), raw: "" };
  let data;
  try {
    // Legacy pages contain a small number of duplicate historical keys.  The
    // migration intentionally keeps the last value, while v2 validation still
    // guarantees a single canonical field after conversion.
    data = YAML.parse(match[1], { uniqueKeys: false }) || {};
  } catch (error) {
    // A few v1 pages used unquoted `#` inside flow lists, which is accepted by
    // the old line parser but not by a YAML 1.2 parser.  Read those pages with
    // the compatibility parser so the one-time migration can repair them.
    if (!match[1].includes("schema_version:")) {
      data = {};
      for (const line of match[1].split(/\r?\n/)) {
        const field = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
        if (!field) continue;
        const value = field[2].trim();
        data[field[1]] = value.startsWith("[") ? parseFlowList(value) : parseScalar(value);
      }
    } else {
      throw new Error(`Invalid YAML frontmatter: ${error.message}`);
    }
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Frontmatter must be a YAML mapping");
  }
  return { data, body: String(raw).slice(match[0].length), raw: match[1] };
}

function asArray(value) {
  if (value === undefined || value === null || value === "") return [];
  if (Array.isArray(value)) return value.map((item) => String(item));
  return [String(value)];
}

function asString(value, fallback = "") {
  if (value === undefined || value === null) return fallback;
  return String(value);
}

function categoryFor(filePath, wikiRoot, data = {}) {
  const rel = relative(wikiRoot, filePath).split(sep).join("/");
  const [directory] = rel.split("/");
  if (directory === "sources") {
    const kind = data.kind || (asArray(data.tags).includes("type/reference") ? "reference" : "source");
    return kind === "reference" ? "references" : "sources";
  }
  if (directory && Object.hasOwn(categoryMeta, directory)) return directory;
  return "meta";
}

function kindFor(category, data = {}) {
  if (data.kind && CONTENT_KINDS.has(data.kind)) return data.kind;
  if (category === "sources") return "source";
  if (category === "references") return "reference";
  if (category === "entities") return "entity";
  if (category === "concepts") return "concept";
  if (category === "analyses") return "analysis";
  return "meta";
}

function oldGraphId(data, category, filePath) {
  return asString(data.source_id || data.graph_id || `${category}-${slugify(basename(filePath, ".md"))}`);
}

function legacyRecord(data, category, filePath) {
  const tags = asArray(data.tags);
  const sourceKind = asString(data.source_kind);
  const kind = kindFor(category, data);
  const id = oldGraphId(data, category, filePath);
  return {
    schemaVersion: 1,
    id,
    kind,
    title: asString(data.title, basename(filePath, ".md")),
    aliases: asArray(data.aliases),
    summary: asString(data.summary),
    domains: tags.filter((tag) => tag.startsWith("domain/")).map((tag) => tag.slice("domain/".length)),
    editorialStatus: asString(data.status, "draft"),
    publicationVisibility: "public",
    graphVisibility: asString(data.graph_visibility, category === "meta" ? "hidden" : "public"),
    created: asString(data.created),
    updated: asString(data.updated),
    review: { mode: "pending", revision: null, reviewedAt: null, reviewedBy: null },
    evidenceIds: asArray(data.sources),
    sources: asArray(data.sources),
    capabilityLayers: asArray(data.capability_layers),
    history: {
      publicationYear: data.publication_year === undefined ? null : Number(data.publication_year),
      eventStart: data.event_start === undefined ? null : Number(data.event_start),
      eventEnd: data.event_end === undefined ? null : Number(data.event_end),
      historicalLayer: asString(data.historical_layer),
      historicalNote: asString(data.historical_note)
    },
    sourceId: asString(data.source_id),
    graphId: asString(data.graph_id),
    sourceKind,
    primarySources: asArray(data.primary_sources),
    supportingSources: asArray(data.supporting_sources),
    sourceUrls: asArray(data.source_urls),
    retrieved: asString(data.retrieved),
    version: data.version === null || data.version === undefined ? null : String(data.version),
    snapshotStatus: asString(data.snapshot_status),
    origin: sourceKind === "raw" ? "local" : sourceKind === "external" ? "external" : "",
    works: null,
    access: [],
    plannedLinks: [],
    redirectFrom: [`/${category}/${slugify(asString(data.title, basename(filePath, ".md")))}/`]
  };
}

function v2Record(data, category, filePath) {
  if (!validateV2(data)) {
    const details = (validateV2.errors || []).map((error) => `${error.instancePath || "/"} ${error.message}`).join("; ");
    throw new Error(`Invalid v2 frontmatter in ${filePath}: ${details}`);
  }
  const history = data.history || {};
  const event = history.event || {};
  const source = data.kind === "source" || data.kind === "reference";
  const localAccess = source && data.access.some((item) => item.kind === "local");
  const archivedAccess = source && data.access.some((item) => item.kind === "snapshot");
  return {
    schemaVersion: 2,
    id: data.id,
    kind: data.kind,
    title: data.title,
    aliases: asArray(data.aliases),
    summary: data.summary,
    domains: asArray(data.domains),
    editorialStatus: data.editorial_status,
    publicationVisibility: data.publication_visibility,
    graphVisibility: data.graph_visibility,
    created: data.created,
    updated: data.updated,
    review: {
      mode: data.review.mode,
      revision: data.review.revision || null,
      reviewedAt: data.review.reviewed_at || null,
      reviewedBy: data.review.reviewed_by || null
    },
    evidenceIds: asArray(data.evidence_ids),
    sources: asArray(data.evidence_ids),
    capabilityLayers: asArray(data.capability_layers),
    history: {
      publicationYear: history.publication_year ?? null,
      eventStart: event.start ?? null,
      eventEnd: event.end ?? null,
      historicalLayer: history.layer || "",
      historicalNote: history.note || ""
    },
    sourceId: source ? data.id : "",
    graphId: source ? "" : data.id,
    sourceKind: data.origin || "",
    primarySources: source ? (data.works.primary || []).map((work) => work.citation) : [],
    supportingSources: source ? (data.works.supporting || []).map((work) => work.citation) : [],
    sourceUrls: source ? data.access.filter((item) => item.kind === "url" && item.url).map((item) => item.url) : [],
    retrieved: source ? (data.access.find((item) => item.retrieved)?.retrieved || "") : "",
    version: source ? ((data.works.primary || []).find((work) => work.edition)?.edition || null) : null,
    snapshotStatus: source ? (localAccess ? "local" : archivedAccess ? "archived" : "external-only") : "",
    origin: data.origin || "",
    works: source ? data.works : null,
    access: source ? data.access : [],
    plannedLinks: asArray(data.planned_links),
    redirectFrom: asArray(data.redirect_from)
  };
}

export function revisionFor(body, data) {
  const visible = structuredClone(data);
  if (visible.review) visible.review.revision = null;
  const hash = createHash("sha256").update(`${JSON.stringify(visible)}\n${body.trim()}\n`).digest("hex");
  return `sha256:${hash}`;
}

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const found = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "logs") continue;
      found.push(...await markdownFiles(path));
    } else if (extname(entry.name).toLowerCase() === ".md") {
      found.push(path);
    }
  }
  return found;
}

function buildPage(raw, { filePath, root, wikiRoot, strict }) {
  const parsed = parseFrontmatter(raw);
  const category = categoryFor(filePath, wikiRoot, parsed.data);
  const record = parsed.data.schema_version === 2
    ? v2Record(parsed.data, category, filePath)
    : legacyRecord(parsed.data, category, filePath);
  const title = record.title || basename(filePath, ".md");
  const oldUrl = `/${category}/${slugify(title)}/`;
  const url = record.schemaVersion === 2 ? `/docs/${record.id}/` : oldUrl;
  const body = parsed.body.trim();
  const wikiLinks = extractWikiLinks(parsed.body);
  const targets = wikiLinks.map((link) => link.target);
  const page = {
    ...record,
    filePath,
    relativePath: relative(root, filePath).split(sep).join("/"),
    title,
    summary: record.summary || body.slice(0, 180),
    description: record.summary || body.slice(0, 180),
    category,
    slug: slugify(title),
    url,
    legacyUrl: oldUrl,
    legacyUrls: [...new Set([oldUrl, ...record.redirectFrom])],
    body,
    status: record.editorialStatus,
    tags: [`type/${record.kind}`, ...record.domains.map((domain) => `domain/${domain}`), `status/${record.editorialStatus}`],
    rawFrontmatter: parsed.data,
    attachments: extractAttachmentLinks(parsed.body),
    wikiLinks,
    targets,
    relations: parseCuratedRelations(parsed.body, { pageTitle: title }),
    revision: revisionFor(body, parsed.data),
    incoming: 0,
    links: []
  };
  if (strict && record.schemaVersion !== 2) {
    throw new Error(`Legacy frontmatter is not allowed in strict mode: ${page.relativePath}`);
  }
  if (record.schemaVersion === 2 && record.review.mode === "pending" && record.editorialStatus === "active") {
    throw new Error(`Active v2 page has pending review: ${page.relativePath}`);
  }
  return page;
}

export function buildLookup(pages) {
  const lookup = new Map();
  const aliases = new Map();
  for (const page of pages) {
    const names = [page.id, page.title, basename(page.filePath, ".md"), ...page.aliases];
    for (const name of names) {
      const normalized = key(name);
      if (!normalized) continue;
      const existing = lookup.get(normalized);
      if (existing && existing !== page) {
        throw new Error(`Duplicate page lookup key '${name}' is shared by '${existing.title}' and '${page.title}'`);
      }
      lookup.set(normalized, page);
      aliases.set(normalized, page);
    }
  }
  return { lookup, aliases };
}

export function resolveManifestLinks(pages, lookup) {
  const unresolved = [];
  for (const page of pages) {
    page.incoming = 0;
    page.links = [];
    for (const target of page.targets) {
      const base = String(target).split("#", 1)[0].trim();
      const resolved = lookup.get(key(base)) || lookup.get(key(basename(base, extname(base))));
      if (!resolved) {
        unresolved.push({ page, target: base });
      } else if (resolved !== page && !page.links.includes(resolved)) {
        page.links.push(resolved);
      }
    }
    for (const linked of page.links) linked.incoming += 1;
    page.score = page.incoming + page.links.length;
  }
  return unresolved;
}

export async function loadWikiManifest({ root = process.cwd(), wikiRoot = join(root, "wiki"), strict = true } = {}) {
  const files = await markdownFiles(wikiRoot);
  const pages = [];
  for (const filePath of files) {
    const raw = await readFile(filePath, "utf8");
    pages.push(buildPage(raw, { filePath, root, wikiRoot, strict }));
  }
  pages.sort((left, right) => left.title.localeCompare(right.title, "ko") || left.id.localeCompare(right.id, "ko"));
  const { lookup, aliases } = buildLookup(pages);
  const unresolved = resolveManifestLinks(pages, lookup);
  return {
    version: 2,
    generated_at: new Date().toISOString(),
    pages,
    lookup,
    aliases,
    unresolved,
    schema: PAGE_SCHEMA
  };
}

function jsonPage(page) {
  return {
    id: page.id,
    kind: page.kind,
    category: page.category,
    title: page.title,
    relativePath: page.relativePath,
    url: page.url,
    legacyUrls: page.legacyUrls,
    editorialStatus: page.editorialStatus,
    publicationVisibility: page.publicationVisibility,
    graphVisibility: page.graphVisibility,
    evidenceIds: page.evidenceIds,
    access: page.access,
    snapshotStatus: page.snapshotStatus,
    sourceUrls: page.sourceUrls,
    revision: page.revision,
    incoming: page.incoming,
    unresolvedLinks: page.targets.filter((target) => !page.links.some((link) => key(link.title) === key(target)))
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const strict = !process.argv.includes("--allow-legacy");
  try {
    const manifest = await loadWikiManifest({ root: process.cwd(), strict });
    const output = { version: manifest.version, pages: manifest.pages.map(jsonPage), unresolved: manifest.unresolved.map(({ page, target }) => ({ page: page.relativePath, target })) };
    console.log(JSON.stringify(output, null, 2));
  } catch (error) {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  }
}
