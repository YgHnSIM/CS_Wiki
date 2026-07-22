import { basename, extname } from "node:path";
import { key } from "../core.mjs";
import {
  CURATED_RELATION_KINDS,
  GRAPH_SCHEMA_VERSION,
  RELATION_META,
  graphConnectionChannel,
  graphNodeId,
  parseYear,
  validateGraphMetadata,
  validateKnowledgeGraph
} from "./schema.mjs";

function cleanText(value = "") {
  return String(value)
    .replace(/!?(?:\[\[)([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/g, (_, target, label) => label || target)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractWikiLinks(body = "") {
  const links = [];
  let section = "본문";
  let inFence = false;
  const lines = String(body).split(/\r?\n/);
  lines.forEach((line, lineIndex) => {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;
    const heading = line.match(/^#{2,6}\s+(.+?)\s*$/);
    if (heading) section = cleanText(heading[1]);
    const pattern = /\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/g;
    for (const match of line.matchAll(pattern)) {
      if (match.index > 0 && line[match.index - 1] === "!") continue;
      links.push({
        target: match[1].trim(),
        label: (match[2] || match[1]).trim(),
        section,
        line: lineIndex + 1,
        excerpt: cleanText(line).slice(0, 220),
        note: section === "관련 항목"
          ? cleanText(`${line.slice(0, match.index)} ${line.slice(match.index + match[0].length)}`)
            .replace(/^[-–—:·\s]+|[-–—:·\s]+$/g, "")
            .slice(0, 220)
          : ""
      });
    }
  });
  return links;
}

export function extractAttachmentLinks(body = "") {
  const targets = new Set();
  let inFence = false;
  for (const line of String(body).split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    for (const match of line.matchAll(/!\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/gu)) {
      const target = match[1].trim();
      if (isAttachmentTarget(target)) targets.add(target);
    }
    for (const match of line.matchAll(/!?\[[^\]]*\]\((?:<([^>]+)>|([^\s)]+))(?:\s+["'][^"']*["'])?\)/gu)) {
      const target = String(match[1] || match[2] || "").trim();
      if (isAttachmentTarget(target)) targets.add(target);
    }
  }
  return [...targets].sort((left, right) => left.localeCompare(right, "ko"));
}

function tableCells(line) {
  const input = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  const cells = [];
  let current = "";
  let wikiDepth = 0;
  let inCode = false;
  for (let index = 0; index < input.length; index += 1) {
    const pair = input.slice(index, index + 2);
    if (!inCode && pair === "[[") {
      wikiDepth += 1;
      current += pair;
      index += 1;
    } else if (!inCode && pair === "]]" && wikiDepth) {
      wikiDepth -= 1;
      current += pair;
      index += 1;
    } else if (input[index] === "`") {
      inCode = !inCode;
      current += input[index];
    } else if (input[index] === "|" && !wikiDepth && !inCode) {
      cells.push(current.trim());
      current = "";
    } else {
      current += input[index];
    }
  }
  cells.push(current.trim());
  return cells;
}

function wikiTargets(value = "") {
  return [...String(value).matchAll(/\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g)]
    .map((match) => match[1].trim());
}

export function parseCuratedRelations(body = "", { pageTitle = "문서" } = {}) {
  const relations = [];
  const lines = String(body).split(/\r?\n/);
  let inRelationSection = false;
  let inFence = false;
  let columns = null;

  lines.forEach((line, lineIndex) => {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      inRelationSection = cleanText(heading[1]) === "관계";
      columns = null;
      return;
    }
    if (!inRelationSection || !line.trim().startsWith("|")) return;
    const cells = tableCells(line);
    if (cells.every((cell) => /^:?-{3,}:?$/.test(cell))) return;
    if (!columns) {
      const names = cells.map((cell) => cleanText(cell));
      columns = {
        kind: names.indexOf("관계"),
        target: names.indexOf("대상"),
        note: names.indexOf("설명"),
        evidence: names.indexOf("근거")
      };
      if (columns.kind < 0 || columns.target < 0 || columns.note < 0) {
        throw new Error(`Relation table on '${pageTitle}' must contain 관계, 대상, 설명 columns`);
      }
      return;
    }

    const kind = String(cells[columns.kind] || "").replace(/[`*]/g, "").trim().replaceAll("-", "_");
    if (!kind) return;
    if (!CURATED_RELATION_KINDS.includes(kind)) {
      throw new Error(`Unknown curated relation '${kind}' on '${pageTitle}' line ${lineIndex + 1}`);
    }
    const [target] = wikiTargets(cells[columns.target] || "");
    if (!target) {
      throw new Error(`Relation '${kind}' on '${pageTitle}' line ${lineIndex + 1} needs a wiki-link target`);
    }
    const note = cleanText(cells[columns.note] || "");
    if (!note) {
      throw new Error(`Relation '${kind}' on '${pageTitle}' line ${lineIndex + 1} needs an explanation`);
    }
    const evidence = columns.evidence >= 0 ? wikiTargets(cells[columns.evidence] || "") : [];
    if (["responds_to", "enables", "precedes", "constrains"].includes(kind) && evidence.length === 0) {
      throw new Error(`Historical relation '${kind}' on '${pageTitle}' line ${lineIndex + 1} needs direct evidence`);
    }
    relations.push({
      kind,
      target,
      note,
      evidence,
      line: lineIndex + 1
    });
  });
  return relations;
}

function resolveTarget(lookup, value) {
  return lookup.get(key(value)) || lookup.get(key(basename(value, extname(value))));
}

// Obsidian accepted non-Markdown file types: Bases, Canvas, images, audio, video, and PDF.
const ATTACHMENT_EXTENSION = /\.(?:3gp|avif|base|bmp|canvas|flac|gif|jpe?g|m4a|mkv|mov|mp3|mp4|ogg|ogv|pdf|png|svg|wav|webm|webp)$/iu;

function isAttachmentTarget(value) {
  const target = String(value || "").trim();
  return Boolean(target)
    && !/^(?:[a-z][a-z0-9+.-]*:|\/\/)/iu.test(target)
    && ATTACHMENT_EXTENSION.test(target);
}

function attachmentTargets(page) {
  return [...new Set([...(page.attachments || []), ...(page.targets || [])]
    .map((value) => String(value || "").split("#", 1)[0].trim())
    .filter((value) => isAttachmentTarget(value)))]
    .sort((left, right) => left.localeCompare(right, "ko"));
}

function unresolvedTargets(page, lookup) {
  return [...new Set((page.targets || [])
    .map((value) => String(value || "").split("#", 1)[0].trim())
    .filter((value) => value && !isAttachmentTarget(value) && !resolveTarget(lookup, value)))]
    .sort((left, right) => left.localeCompare(right, "ko"));
}

function edgeKey(kind, source, target, directed) {
  if (!directed && source.localeCompare(target, "ko") > 0) return `${kind}|${target}|${source}`;
  return `${kind}|${source}|${target}`;
}

function relationLegend() {
  return Object.fromEntries(Object.entries(RELATION_META).map(([kind, meta]) => [kind, {
    label: meta.label,
    inverseLabel: meta.inverseLabel,
    family: meta.family,
    directed: meta.directed,
    origin: meta.origin,
    cost: meta.cost
  }]));
}

function buildConnectionBundles(edges) {
  const bundles = new Map();
  for (const edge of edges) {
    const endpoints = [edge.source, edge.target].sort((left, right) => left.localeCompare(right, "ko"));
    const id = `${endpoints[0]}::${endpoints[1]}`;
    if (!bundles.has(id)) {
      bundles.set(id, {
        id,
        source: endpoints[0],
        target: endpoints[1],
        edgeIds: [],
        kinds: [],
        channels: { core: [], guide: [], evidence: [], trace: [] }
      });
    }
    const bundle = bundles.get(id);
    const channel = graphConnectionChannel(edge);
    bundle.edgeIds.push(edge.id);
    bundle.channels[channel].push(edge.id);
    if (!bundle.kinds.includes(edge.kind)) bundle.kinds.push(edge.kind);
  }
  return [...bundles.values()].map((bundle) => ({
    ...bundle,
    edgeIds: bundle.edgeIds.sort((left, right) => left.localeCompare(right, "ko")),
    kinds: bundle.kinds.sort((left, right) => left.localeCompare(right, "ko")),
    channels: Object.fromEntries(Object.entries(bundle.channels).map(([channel, edgeIds]) => [
      channel,
      edgeIds.sort((left, right) => left.localeCompare(right, "ko"))
    ]))
  })).sort((left, right) => left.id.localeCompare(right.id, "ko"));
}

export function buildKnowledgeGraph(pages, learningPaths, { lookup, urlFor = (url) => url } = {}) {
  if (!lookup) throw new Error("buildKnowledgeGraph requires a page lookup");
  const pageIds = new Map();
  const pagesById = new Map();
  for (const page of pages) {
    validateGraphMetadata(page);
    const id = graphNodeId(page);
    const existing = pagesById.get(id);
    if (existing) throw new Error(`Duplicate graph node id '${id}' for '${existing.title}' and '${page.title}'`);
    pageIds.set(page, id);
    pagesById.set(id, page);
  }

  const memberships = new Map(pages.map((page) => [page, []]));
  for (const path of learningPaths) {
    path.pages.forEach((page, index) => memberships.get(page)?.push({
      id: path.slug,
      title: path.title,
      index,
      total: path.pages.length
    }));
  }

  const nodes = pages.map((page) => ({
    id: pageIds.get(page),
    title: page.title,
    aliases: page.aliases,
    url: urlFor(page.url),
    category: page.category,
    tags: page.tags,
    domains: page.tags.filter((tag) => tag.startsWith("domain/")),
    status: page.status,
    summary: page.summary,
    created: page.created || null,
    updated: page.updated || null,
    attachments: attachmentTargets(page),
    unresolved: unresolvedTargets(page, lookup),
    sourceId: page.sourceId || null,
    visibility: page.graphVisibility || (["index.md", "overview.md", "log.md"].includes(basename(page.filePath).toLowerCase()) ? "hidden" : "public"),
    pathMemberships: memberships.get(page) || [],
    historical: {
      publicationYear: parseYear(page.publicationYear),
      eventStart: parseYear(page.eventStart),
      eventEnd: parseYear(page.eventEnd),
      layer: page.historicalLayer || null,
      note: page.historicalNote || null
    },
    capabilityLayers: page.capabilityLayers || [],
    provenance: {
      sources: page.sources,
      sourceNodeIds: page.sources.map((value) => resolveTarget(lookup, value)).filter(Boolean).map((target) => pageIds.get(target)),
      primarySources: page.primarySources,
      supportingSources: page.supportingSources,
      sourceUrls: page.sourceUrls,
      sourceKind: page.sourceKind || null,
      retrieved: page.retrieved || null,
      version: page.version || null,
      snapshotStatus: page.snapshotStatus || null
    },
    score: page.score || 0,
    degree: { incoming: 0, outgoing: 0, total: 0 }
  })).sort((a, b) => a.id.localeCompare(b.id, "ko"));

  const edges = new Map();
  function addEdge({ source, target, kind, origin, context = {}, evidence = [] }) {
    if (!source || !target || source === target) return;
    const meta = RELATION_META[kind];
    if (!meta) throw new Error(`Unknown graph relation '${kind}'`);
    let from = source;
    let to = target;
    if (!meta.directed && from.localeCompare(to, "ko") > 0) [from, to] = [to, from];
    const id = edgeKey(kind, from, to, meta.directed);
    if (!edges.has(id)) {
      edges.set(id, {
        id,
        source: from,
        target: to,
        kind,
        directed: meta.directed,
        family: meta.family,
        origin: origin || meta.origin,
        weight: meta.weight,
        cost: meta.cost,
        evidence: [],
        contexts: [],
        occurrences: 0,
        _contextKeys: new Set(),
        _owners: new Set()
      });
    }
    const edge = edges.get(id);
    if (origin === "curated") edge.origin = "curated";
    for (const evidenceId of evidence) {
      if (evidenceId && !edge.evidence.includes(evidenceId)) edge.evidence.push(evidenceId);
    }
    const serialized = JSON.stringify(context);
    if (!edge._contextKeys.has(serialized)) {
      edge._contextKeys.add(serialized);
      edge.occurrences += 1;
      if (edge.contexts.length < 6) edge.contexts.push(context);
    }
    if (context.pageId) edge._owners.add(context.pageId);
  }

  for (const page of pages) {
    const pageId = pageIds.get(page);
    for (const link of extractWikiLinks(page.body)) {
      if (link.section === "출처" || link.section === "관계") continue;
      const targetPage = resolveTarget(lookup, link.target);
      if (!targetPage || targetPage === page) continue;
      const kind = link.section === "관련 항목" ? "recommends" : "mentions";
      addEdge({
        source: pageId,
        target: pageIds.get(targetPage),
        kind,
        context: {
          pageId,
          section: link.section,
          line: link.line,
          label: link.label,
          excerpt: link.excerpt,
          ...(link.note ? { note: link.note } : {})
        }
      });
    }

    for (const sourceValue of page.sources) {
      const sourcePage = resolveTarget(lookup, sourceValue);
      if (!sourcePage || sourcePage === page) continue;
      if (sourcePage.category !== "sources" && sourcePage.category !== "references") continue;
      addEdge({
        source: pageIds.get(sourcePage),
        target: pageId,
        kind: "supports",
        context: { pageId, section: "frontmatter:sources", value: sourceValue }
      });
    }

    for (const relation of parseCuratedRelations(page.body, { pageTitle: page.title })) {
      const targetPage = resolveTarget(lookup, relation.target);
      if (!targetPage) {
        throw new Error(`Relation '${relation.kind}' on '${page.title}' references missing page '${relation.target}'`);
      }
      const evidence = relation.evidence.map((value) => {
        const evidencePage = resolveTarget(lookup, value);
        if (!evidencePage) throw new Error(`Relation evidence '${value}' on '${page.title}' is missing`);
        return pageIds.get(evidencePage);
      });
      addEdge({
        source: pageId,
        target: pageIds.get(targetPage),
        kind: relation.kind,
        origin: "curated",
        evidence,
        context: { pageId, section: "관계", line: relation.line, note: relation.note }
      });
    }
  }

  for (const path of learningPaths) {
    for (let index = 0; index < path.pages.length - 1; index += 1) {
      addEdge({
        source: pageIds.get(path.pages[index]),
        target: pageIds.get(path.pages[index + 1]),
        kind: "path_next",
        context: { pathId: path.slug, pathTitle: path.title, step: index + 1 }
      });
    }
  }

  const finalizedEdges = [...edges.values()]
    .map(({ _contextKeys, _owners, ...edge }) => ({
      ...edge,
      evidence: edge.evidence.sort((a, b) => a.localeCompare(b, "ko")),
      contexts: edge.contexts.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b), "ko")),
      reciprocal: edge.kind === "related" && _owners.size > 1
    }))
    .sort((a, b) => a.kind.localeCompare(b.kind) || a.source.localeCompare(b.source, "ko") || a.target.localeCompare(b.target, "ko"));
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  for (const edge of finalizedEdges) {
    const source = nodesById.get(edge.source);
    const target = nodesById.get(edge.target);
    source.degree.outgoing += 1;
    target.degree.incoming += 1;
    if (!edge.directed) {
      source.degree.incoming += 1;
      target.degree.outgoing += 1;
    }
  }
  for (const node of nodes) node.degree.total = node.degree.incoming + node.degree.outgoing;

  const byKind = Object.fromEntries(Object.keys(RELATION_META).map((kind) => [
    kind,
    finalizedEdges.filter((edge) => edge.kind === kind).length
  ]));
  const connections = buildConnectionBundles(finalizedEdges);
  const graph = {
    schemaVersion: GRAPH_SCHEMA_VERSION,
    contentVersion: pages.map((page) => page.updated || page.created || "").sort().at(-1) || null,
    stats: {
      nodes: nodes.length,
      edges: finalizedEdges.length,
      paths: learningPaths.length,
      curatedEdges: finalizedEdges.filter((edge) => edge.origin === "curated").length,
      connectionPairs: connections.length,
      multiChannelPairs: connections.filter((connection) => Object.values(connection.channels).filter((ids) => ids.length).length > 1).length,
      byKind
    },
    legend: relationLegend(),
    facets: {
      categories: [...new Set(nodes.map((node) => node.category))].sort(),
      domains: [...new Set(nodes.flatMap((node) => node.domains))].sort(),
      statuses: [...new Set(nodes.map((node) => node.status))].sort(),
      historicalLayers: [...new Set(nodes.map((node) => node.historical.layer).filter(Boolean))].sort(),
      capabilityLayers: [...new Set(nodes.flatMap((node) => node.capabilityLayers))].sort()
    },
    nodes,
    edges: finalizedEdges,
    connections,
    paths: learningPaths.map((path, order) => ({
      id: path.slug,
      order,
      title: path.title,
      description: path.description,
      nodeIds: path.pages.map((page) => pageIds.get(page))
    }))
  };
  return validateKnowledgeGraph(graph);
}
