import { createHash } from "node:crypto";

export const ATLAS_SCHEMA_VERSION = "1.0.0";
export const ATLAS_LIMITS = Object.freeze({
  overviewNodes: 40,
  overviewEdges: 240,
  clusterNodes: 240,
  clusterEdges: 240,
  corridorRelations: 40,
  focusNodes: 56,
  focusEdges: 180,
  labels: 40
});

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const KIND_PRIORITY = Object.freeze({
  broader: 90,
  narrower: 90,
  prerequisite_for: 88,
  enables: 88,
  constrains: 88,
  measures: 88,
  implements: 88,
  exemplifies: 88,
  precedes: 88,
  responds_to: 88,
  contradicts: 88,
  synthesizes: 88,
  supports: 70,
  path_next: 58,
  related: 36,
  mentions: 8
});

function values(value) {
  return Array.isArray(value) ? value : value === undefined || value === null ? [] : [value];
}

function stableCompare(left, right) {
  return String(left).localeCompare(String(right), "ko");
}

function hashNumber(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function slug(value) {
  const normalized = String(value || "uncategorized")
    .normalize("NFKD")
    .toLocaleLowerCase("en-US")
    .replace(/^domain\//, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `cluster-${normalized || "uncategorized"}`;
}

function clusterLabel(domain, labels = {}) {
  if (labels[domain]) return labels[domain];
  if (domain === "uncategorized") return "분류 대기";
  return String(domain).replace(/^domain\//, "").replaceAll("-", " ");
}

function edgePriority(edge) {
  return (edge.origin === "curated" ? 1_000_000 : 0)
    + (values(edge.contexts).some((context) => context?.note) ? 100_000 : 0)
    + (KIND_PRIORITY[edge.kind] || 0) * 1_000
    + Number(edge.weight || 0) * 10
    + Math.min(9, Number(edge.occurrences || 0));
}

function edgeCompare(left, right) {
  return edgePriority(right) - edgePriority(left) || stableCompare(left.id, right.id);
}

function selectBalancedEdges(edges, limit) {
  const ranked = [...edges].sort(edgeCompare);
  if (ranked.length <= limit) return ranked;
  const groups = {
    curated: ranked.filter((edge) => edge.origin === "curated"),
    supports: ranked.filter((edge) => edge.origin !== "curated" && edge.kind === "supports"),
    learning: ranked.filter((edge) => edge.origin !== "curated" && edge.kind === "path_next"),
    related: ranked.filter((edge) => edge.origin !== "curated" && edge.kind === "related"),
    mentions: ranked.filter((edge) => edge.origin !== "curated" && edge.kind === "mentions"),
    other: ranked.filter((edge) => edge.origin !== "curated" && !["supports", "path_next", "related", "mentions"].includes(edge.kind))
  };
  const shares = { curated: 0.16, supports: 0.24, learning: 0.2, related: 0.28, mentions: 0.08, other: 0.04 };
  const selected = [];
  const selectedIds = new Set();
  const take = (edge) => {
    if (!edge || selectedIds.has(edge.id) || selected.length >= limit) return false;
    selectedIds.add(edge.id);
    selected.push(edge);
    return true;
  };
  for (const [name, group] of Object.entries(groups)) {
    group.slice(0, Math.floor(limit * shares[name])).forEach(take);
  }
  const strongGroups = [groups.curated, groups.other, groups.supports, groups.learning, groups.related];
  let cursor = 0;
  while (selected.length < limit && strongGroups.some((group) => cursor < group.length)) {
    for (const group of strongGroups) take(group[cursor]);
    cursor += 1;
  }
  for (const edge of groups.mentions) take(edge);
  return selected.sort(edgeCompare);
}

function compactContext(context = {}) {
  const result = {};
  for (const key of ["pageId", "section", "label", "pathId", "pathTitle", "step", "note"]) {
    if (context[key] !== undefined && context[key] !== null && context[key] !== "") result[key] = context[key];
  }
  if (context.excerpt) result.excerpt = String(context.excerpt).slice(0, 220);
  return result;
}

function compactEdge(edge) {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    kind: edge.kind,
    family: edge.family,
    dominantFamily: edge.family,
    directed: edge.directed,
    origin: edge.origin,
    weight: edge.weight,
    occurrences: edge.occurrences,
    ...(edge.reciprocal ? { reciprocal: true } : {}),
    ...(values(edge.evidence).length ? { evidence: values(edge.evidence).slice(0, 6) } : {}),
    contexts: values(edge.contexts).slice(0, 2).map(compactContext)
  };
}

function nodeRecord(node, extra = {}) {
  return {
    id: node.id,
    kind: "document",
    title: node.title,
    aliases: values(node.aliases),
    url: node.url,
    category: node.category,
    domains: values(node.domains),
    status: node.status,
    summary: node.summary,
    historicalLayer: node.historical?.layer || null,
    capabilityLayers: values(node.capabilityLayers),
    degree: node.degree,
    count: Number(node.degree?.total || node.score || 0),
    radius: Math.max(3.2, Math.min(9, 3.2 + Math.log2(1 + Number(node.degree?.total || 0)) * 0.72)),
    ...extra
  };
}

function facetSummary(nodes) {
  return {
    domains: [...new Set(nodes.flatMap((node) => values(node.domains)))].sort(stableCompare),
    categories: [...new Set(nodes.map((node) => node.category).filter(Boolean))].sort(stableCompare),
    statuses: [...new Set(nodes.map((node) => node.status).filter(Boolean))].sort(stableCompare),
    historicalLayers: [...new Set(nodes.map((node) => node.historical?.layer).filter(Boolean))].sort(stableCompare),
    capabilityLayers: [...new Set(nodes.flatMap((node) => values(node.capabilityLayers)))].sort(stableCompare)
  };
}

function withPayloadVersion(contentVersion, payload) {
  return { schemaVersion: ATLAS_SCHEMA_VERSION, contentVersion, ...payload };
}

function documentLayout(nodes, { centerX = 0.5, centerY = 0.5, radius = 0.39, contextIds = new Set() } = {}) {
  const ranked = [...nodes].sort((left, right) => Number(right.degree?.total || 0) - Number(left.degree?.total || 0)
    || stableCompare(left.title, right.title) || stableCompare(left.id, right.id));
  const result = new Map();
  const internal = ranked.filter((node) => !contextIds.has(node.id));
  const context = ranked.filter((node) => contextIds.has(node.id));
  internal.forEach((node, index) => {
    if (!index) {
      result.set(node.id, { x: centerX, y: centerY });
      return;
    }
    const distance = radius * Math.sqrt(index / Math.max(1, internal.length - 1));
    const angle = index * GOLDEN_ANGLE + (hashNumber(node.id) % 23) / 23;
    result.set(node.id, { x: centerX + Math.cos(angle) * distance, y: centerY + Math.sin(angle) * distance });
  });
  context.forEach((node, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(1, context.length) + 0.17;
    result.set(node.id, { x: centerX + Math.cos(angle) * 0.47, y: centerY + Math.sin(angle) * 0.47 });
  });
  return result;
}

function focusLayout(focusId, nodeIds, directIds) {
  const direct = nodeIds.filter((id) => id !== focusId && directIds.has(id));
  const second = nodeIds.filter((id) => id !== focusId && !directIds.has(id));
  const coordinates = new Map([[focusId, { x: 0.5, y: 0.5 }]]);
  direct.forEach((id, index) => {
    const angle = index * GOLDEN_ANGLE + (hashNumber(id) % 31) / 31;
    const distance = 0.19 + 0.09 * ((index % 4) / 3);
    coordinates.set(id, { x: 0.5 + Math.cos(angle) * distance, y: 0.5 + Math.sin(angle) * distance });
  });
  second.forEach((id, index) => {
    const angle = index * GOLDEN_ANGLE + 0.29;
    const distance = 0.34 + 0.1 * ((index % 5) / 4);
    coordinates.set(id, { x: 0.5 + Math.cos(angle) * distance, y: 0.5 + Math.sin(angle) * distance });
  });
  return coordinates;
}

function buildFocusRecord(focus, nodesById, adjacency, limits) {
  const incident = values(adjacency.get(focus.id)).sort(edgeCompare);
  const directScore = new Map();
  for (const edge of incident) {
    const id = edge.source === focus.id ? edge.target : edge.source;
    directScore.set(id, Math.max(directScore.get(id) || 0, edgePriority(edge)));
  }
  const direct = [...directScore]
    .filter(([id]) => nodesById.has(id))
    .sort((left, right) => right[1] - left[1]
      || Number(nodesById.get(right[0])?.degree?.total || 0) - Number(nodesById.get(left[0])?.degree?.total || 0)
      || stableCompare(left[0], right[0]))
    .slice(0, Math.min(42, limits.focusNodes - 1))
    .map(([id]) => id);
  const selected = new Set([focus.id, ...direct]);
  const secondScore = new Map();
  for (const directId of direct) {
    for (const edge of values(adjacency.get(directId))) {
      const id = edge.source === directId ? edge.target : edge.source;
      if (selected.has(id) || !nodesById.has(id) || nodesById.get(id)?.visibility === "context") continue;
      secondScore.set(id, Math.max(secondScore.get(id) || 0, edgePriority(edge)));
    }
  }
  const remaining = Math.max(0, limits.focusNodes - selected.size);
  const second = [...secondScore]
    .sort((left, right) => right[1] - left[1]
      || Number(nodesById.get(right[0])?.degree?.total || 0) - Number(nodesById.get(left[0])?.degree?.total || 0)
      || stableCompare(left[0], right[0]))
    .slice(0, remaining)
    .map(([id]) => id);
  second.forEach((id) => selected.add(id));
  const coordinates = focusLayout(focus.id, [...selected], new Set(direct));
  const nodes = [...selected].map((id) => nodeRecord(nodesById.get(id), {
    ...coordinates.get(id),
    hop: id === focus.id ? 0 : direct.includes(id) ? 1 : 2,
    focus: id === focus.id,
    context: nodesById.get(id)?.visibility === "context"
  }));
  const edgeMap = new Map();
  for (const id of selected) {
    for (const edge of values(adjacency.get(id))) {
      if (selected.has(edge.source) && selected.has(edge.target)) edgeMap.set(edge.id, edge);
    }
  }
  const edges = [...edgeMap.values()].sort((left, right) => {
    const leftFocus = left.source === focus.id || left.target === focus.id ? 1 : 0;
    const rightFocus = right.source === focus.id || right.target === focus.id ? 1 : 0;
    return rightFocus - leftFocus || edgeCompare(left, right);
  }).slice(0, limits.focusEdges).map(compactEdge);
  return {
    focusId: focus.id,
    nodes,
    edges,
    labels: nodes.slice(0, limits.labels).map((node) => node.id),
    stats: {
      directCandidates: directScore.size,
      visibleDirect: direct.length,
      visibleSecond: second.length,
      visibleEdges: edges.length,
      truncatedNodes: 1 + directScore.size + secondScore.size > nodes.length,
      truncatedEdges: edgeMap.size > edges.length
    }
  };
}

export function buildSemanticAtlas(graph, options = {}) {
  const limits = { ...ATLAS_LIMITS, ...(options.limits || {}) };
  const contextualNodes = values(graph?.nodes).filter((node) => node?.visibility !== "hidden")
    .sort((left, right) => stableCompare(left.id, right.id));
  const visibleNodes = contextualNodes.filter((node) => node?.visibility !== "context");
  const contextualIds = new Set(contextualNodes.map((node) => node.id));
  const visibleIds = new Set(visibleNodes.map((node) => node.id));
  const visibleEdges = values(graph?.edges).filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target))
    .sort((left, right) => stableCompare(left.id, right.id));
  const contextualEdges = values(graph?.edges).filter((edge) => contextualIds.has(edge.source) && contextualIds.has(edge.target)
      && (visibleIds.has(edge.source) || visibleIds.has(edge.target)))
    .sort((left, right) => stableCompare(left.id, right.id));
  const nodesById = new Map(contextualNodes.map((node) => [node.id, node]));
  const contentVersion = createHash("sha256").update(JSON.stringify({
    nodes: contextualNodes.map((node) => [node.id, node.title, node.category, node.domains, node.status, node.visibility, node.historical, node.capabilityLayers, node.degree]),
    edges: contextualEdges.map((edge) => [edge.id, edge.kind, edge.origin, edge.occurrences, edge.contexts, edge.evidence])
  })).digest("hex").slice(0, 16);

  const domainByNodeId = new Map();
  const clusterNodes = new Map();
  for (const node of visibleNodes) {
    const domain = values(node.domains)[0] || "uncategorized";
    const clusterId = slug(domain);
    domainByNodeId.set(node.id, { domain, clusterId });
    if (!clusterNodes.has(clusterId)) clusterNodes.set(clusterId, []);
    clusterNodes.get(clusterId).push(node);
  }

  const clusterIds = [...clusterNodes.keys()].sort(stableCompare);
  const clusterPositions = new Map();
  clusterIds.forEach((id, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / Math.max(1, clusterIds.length);
    const radial = clusterIds.length === 1 ? 0 : 0.34;
    clusterPositions.set(id, { x: 0.5 + Math.cos(angle) * radial, y: 0.5 + Math.sin(angle) * radial });
  });

  const clusterRecords = clusterIds.map((id) => {
    const members = clusterNodes.get(id);
    const domain = domainByNodeId.get(members[0].id).domain;
    const position = clusterPositions.get(id);
    return {
      id,
      kind: "cluster",
      title: clusterLabel(domain, options.domainLabels),
      label: clusterLabel(domain, options.domainLabels),
      domain,
      x: position.x,
      y: position.y,
      radius: Math.min(38, 13 + Math.sqrt(members.length) * 2.1),
      count: members.length,
      nodeCount: members.length,
      facets: facetSummary(members),
      url: `clusters/${id}.json`,
      route: `/map/atlas/${id}/`
    };
  });
  const clusterRecordById = new Map(clusterRecords.map((cluster) => [cluster.id, cluster]));

  const corridorGroups = new Map();
  for (const edge of visibleEdges) {
    const sourceCluster = domainByNodeId.get(edge.source).clusterId;
    const targetCluster = domainByNodeId.get(edge.target).clusterId;
    if (sourceCluster === targetCluster) continue;
    const pair = [sourceCluster, targetCluster].sort(stableCompare);
    const id = `corridor--${pair[0]}--${pair[1]}`;
    if (!corridorGroups.has(id)) corridorGroups.set(id, { id, source: pair[0], target: pair[1], edges: [] });
    corridorGroups.get(id).edges.push(edge);
  }

  const corridorRecords = [...corridorGroups.values()].map((group) => {
    const byFamily = new Map();
    for (const edge of group.edges) byFamily.set(edge.family, (byFamily.get(edge.family) || 0) + 1);
    const families = [...byFamily].sort((left, right) => right[1] - left[1] || stableCompare(left[0], right[0])).map(([family]) => family);
    return {
      id: group.id,
      kind: "edge",
      source: group.source,
      target: group.target,
      corridorId: group.id,
      count: group.edges.length,
      weight: group.edges.reduce((total, edge) => total + Number(edge.weight || 0), 0),
      families,
      dominantFamily: families[0] || "default",
      url: `corridors/${group.id}.json`
    };
  }).sort((left, right) => right.count - left.count || stableCompare(left.id, right.id)).slice(0, limits.overviewEdges);

  const overview = withPayloadVersion(contentVersion, {
    kind: "overview",
    nodes: clusterRecords.slice(0, limits.overviewNodes),
    edges: corridorRecords,
    labels: clusterRecords.slice(0, limits.labels).map((cluster) => cluster.id),
    stats: { clusters: clusterRecords.length, corridors: corridorRecords.length, documents: visibleNodes.length, relations: visibleEdges.length }
  });

  const shards = {};
  for (const cluster of clusterRecords) {
    const members = clusterNodes.get(cluster.id);
    const memberIds = new Set(members.map((node) => node.id));
    const boundaryScores = new Map();
    for (const edge of visibleEdges) {
      const sourceInside = memberIds.has(edge.source);
      const targetInside = memberIds.has(edge.target);
      if (sourceInside === targetInside) continue;
      const external = sourceInside ? edge.target : edge.source;
      boundaryScores.set(external, (boundaryScores.get(external) || 0) + edgePriority(edge));
    }
    const boundaryIds = [...boundaryScores]
      .sort((left, right) => right[1] - left[1] || stableCompare(left[0], right[0]))
      .slice(0, Math.max(0, Math.min(28, limits.clusterNodes - members.length)))
      .map(([id]) => id);
    const contextIds = new Set(boundaryIds);
    const selectedNodes = [...members, ...boundaryIds.map((id) => nodesById.get(id)).filter(Boolean)]
      .slice(0, limits.clusterNodes);
    const selectedIds = new Set(selectedNodes.map((node) => node.id));
    const layout = documentLayout(selectedNodes, { contextIds });
    const candidateEdges = visibleEdges.filter((edge) => selectedIds.has(edge.source) && selectedIds.has(edge.target)
      && (memberIds.has(edge.source) || memberIds.has(edge.target)));
    const selectedEdges = selectBalancedEdges(candidateEdges, limits.clusterEdges).map(compactEdge);
    shards[cluster.id] = withPayloadVersion(contentVersion, {
      id: cluster.id,
      kind: "cluster",
      title: cluster.title,
      domain: cluster.domain,
      nodes: selectedNodes.map((node) => nodeRecord(node, {
        ...layout.get(node.id),
        clusterId: domainByNodeId.get(node.id).clusterId,
        context: contextIds.has(node.id)
      })),
      edges: selectedEdges,
      labels: selectedNodes.slice(0, limits.labels).map((node) => node.id),
      boundaryNodeIds: boundaryIds,
      facets: facetSummary(members),
      stats: {
        documents: members.length,
        contextDocuments: boundaryIds.length,
        relations: selectedEdges.length,
        truncatedNodes: members.length + boundaryScores.size > selectedNodes.length,
        totalCandidateRelations: candidateEdges.length,
        truncatedEdges: candidateEdges.length > selectedEdges.length
      }
    });
  }

  const corridors = {};
  for (const corridor of corridorRecords) {
    const group = corridorGroups.get(corridor.id);
    const relations = [...group.edges].sort(edgeCompare).slice(0, limits.corridorRelations);
    const relationNodeIds = [...new Set(relations.flatMap((edge) => [edge.source, edge.target]))];
    const leftIds = relationNodeIds.filter((id) => domainByNodeId.get(id).clusterId === corridor.source);
    const rightIds = relationNodeIds.filter((id) => domainByNodeId.get(id).clusterId === corridor.target);
    const coordinates = new Map();
    leftIds.forEach((id, index) => coordinates.set(id, { x: 0.23 + ((index % 3) - 1) * 0.055, y: (index + 1) / (leftIds.length + 1) }));
    rightIds.forEach((id, index) => coordinates.set(id, { x: 0.77 + ((index % 3) - 1) * 0.055, y: (index + 1) / (rightIds.length + 1) }));
    corridors[corridor.id] = withPayloadVersion(contentVersion, {
      id: corridor.id,
      kind: "corridor",
      title: `${clusterRecordById.get(corridor.source).title} ↔ ${clusterRecordById.get(corridor.target).title}`,
      sourceCluster: corridor.source,
      targetCluster: corridor.target,
      nodes: relationNodeIds.map((id) => nodeRecord(nodesById.get(id), {
        ...coordinates.get(id),
        clusterId: domainByNodeId.get(id).clusterId
      })),
      edges: relations.map(compactEdge),
      relationships: relations.map((edge) => ({
        ...compactEdge(edge),
        sourceTitle: nodesById.get(edge.source).title,
        sourceUrl: nodesById.get(edge.source).url,
        targetTitle: nodesById.get(edge.target).title,
        targetUrl: nodesById.get(edge.target).url
      })),
      labels: relationNodeIds.slice(0, limits.labels),
      stats: { totalRelations: group.edges.length, visibleRelations: relations.length, truncated: group.edges.length > relations.length }
    });
  }

  const adjacency = new Map(contextualNodes.map((node) => [node.id, []]));
  for (const edge of contextualEdges) {
    adjacency.get(edge.source).push(edge);
    adjacency.get(edge.target).push(edge);
  }
  const focusShards = {};
  const focusPathById = {};
  for (const node of visibleNodes) {
    const shardId = `node-${createHash("sha256").update(node.id).digest("hex").slice(0, 16)}`;
    focusShards[shardId] = withPayloadVersion(contentVersion, {
      shardId,
      records: { [node.id]: buildFocusRecord(node, nodesById, adjacency, limits) }
    });
    focusPathById[node.id] = `focus/${shardId}.json`;
  }

  const lookupEntries = visibleNodes.map((node) => ({
    ...nodeRecord(node),
    clusterId: domainByNodeId.get(node.id).clusterId,
    focus: { url: focusPathById[node.id] }
  })).sort((left, right) => stableCompare(left.title, right.title) || stableCompare(left.id, right.id));
  const lookup = withPayloadVersion(contentVersion, {
    entries: lookupEntries,
    stats: { documents: lookupEntries.length, focusShards: visibleNodes.length }
  });

  const manifest = {
    schemaVersion: ATLAS_SCHEMA_VERSION,
    contentVersion,
    routes: {
      overview: "overview.json",
      lookup: "lookup.json",
      cluster: "clusters/{id}.json",
      corridor: "corridors/{id}.json",
      focus: "focus/{shard}.json"
    },
    overview: { url: "overview.json" },
    lookup: { url: "lookup.json" },
    clusters: clusterRecords.map((cluster) => ({
      id: cluster.id,
      title: cluster.title,
      domain: cluster.domain,
      nodeCount: cluster.nodeCount,
      url: cluster.url,
      route: cluster.route,
      facets: cluster.facets
    })),
    clusterShards: Object.fromEntries(clusterRecords.map((cluster) => [cluster.id, cluster.url])),
    corridors: corridorRecords.map((corridor) => ({ ...corridor, shard: corridor.url })),
    corridorShards: Object.fromEntries(corridorRecords.map((corridor) => [corridor.id, corridor.url])),
    focusShards: focusPathById,
    facets: facetSummary(visibleNodes),
    limits,
    stats: {
      documents: visibleNodes.length,
      relations: visibleEdges.length,
      clusters: clusterRecords.length,
      corridors: corridorRecords.length,
      focusShards: visibleNodes.length
    },
    legend: graph.legend || {}
  };

  return { manifest, overview, lookup, shards, corridors, focusShards };
}
