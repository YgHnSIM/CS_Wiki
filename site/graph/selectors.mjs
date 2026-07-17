const BUCKET_ORDER = ["curated", "evidence", "learning", "related", "mentions"];

function nodeMap(graph) {
  return new Map(graph.nodes.map((node) => [node.id, node]));
}

export function indexGraphEdges(graph) {
  const index = new Map(graph.nodes.map((node) => [node.id, []]));
  for (const edge of graph.edges) {
    if (!index.has(edge.source)) index.set(edge.source, []);
    index.get(edge.source).push(edge);
    if (edge.target !== edge.source) {
      if (!index.has(edge.target)) index.set(edge.target, []);
      index.get(edge.target).push(edge);
    }
  }
  return index;
}

function edgeRank(edge) {
  return (edge.origin === "curated" ? 1000 : 0)
    + (edge.weight || 0) * 100
    + (edge.reciprocal ? 20 : 0)
    + Math.min(edge.occurrences || 0, 19);
}

function bucketFor(edge) {
  if (edge.origin === "curated" && edge.kind !== "supports" && edge.kind !== "related") return "curated";
  if (edge.kind === "supports" || edge.family === "evidence") return "evidence";
  if (edge.kind === "path_next" || edge.family === "learning") return "learning";
  if (edge.kind === "related") return "related";
  return "mentions";
}

function directionFor(edges, focusId) {
  if (edges.every((edge) => !edge.directed)) return "undirected";
  const outgoing = edges.some((edge) => edge.directed && edge.source === focusId);
  const incoming = edges.some((edge) => edge.directed && edge.target === focusId);
  if (outgoing && incoming) return "mixed";
  return outgoing ? "outgoing" : "incoming";
}

function recordForBucket(record, bucket, graph, focusId) {
  const edges = record.edges.filter((edge) => bucketFor(edge) === bucket);
  if (!edges.length) return null;
  const primaryEdge = edges[0];
  return {
    ...record,
    primaryEdge,
    bucket,
    direction: directionFor(edges, focusId),
    labels: edges.map((edge) => relationLabel(graph, edge, focusId)),
    score: edgeRank(primaryEdge)
  };
}

export function relationLabel(graph, edge, focusId) {
  const legend = graph.legend[edge.kind];
  if (!legend) return edge.kind;
  return edge.directed && edge.target === focusId ? legend.inverseLabel : legend.label;
}

export function describeRelationship(graph, edge) {
  const nodes = nodeMap(graph);
  const source = nodes.get(edge.source);
  const target = nodes.get(edge.target);
  const legend = graph.legend[edge.kind] || { label: edge.kind };
  const statement = edge.directed
    ? `“${source?.title || edge.source}”에서 “${target?.title || edge.target}”로 이어집니다. 관계: ${legend.label}.`
    : `“${source?.title || edge.source}”와 “${target?.title || edge.target}” 사이에 ${legend.label} 관계가 기록되어 있습니다.`;
  const context = edge.contexts?.[0] || {};
  let detail = "두 문서 사이에 직접 기록된 관계입니다.";
  if (context.note) {
    detail = context.note;
  } else if (edge.kind === "supports") {
    detail = `“${target?.title || edge.target}”의 sources에 “${source?.title || edge.source}”가 근거로 등록되어 있습니다.`;
  } else if (edge.kind === "path_next") {
    detail = `‘${context.pathTitle || context.pathId || "학습 경로"}’의 ${context.step || "현재"}단계에서 다음 단계로 이어집니다.`;
  } else if (edge.kind === "related") {
    detail = edge.reciprocal
      ? "두 문서의 관련 항목에 서로 등록된 양방향 연결입니다."
      : "한 문서의 관련 항목에서 함께 읽을 대상으로 연결했습니다.";
  } else if (edge.kind === "mentions") {
    const owner = nodes.get(context.pageId);
    detail = `“${owner?.title || context.pageId || source?.title}”의 ‘${context.section || "본문"}’에서 언급됩니다.`;
    if (context.excerpt) detail += ` 문맥: ${context.excerpt}`;
  }
  return { statement, detail };
}

export function selectLocalGraph(graph, focusId, { limit = 14, edgesByNodeId = null } = {}) {
  const nodes = nodeMap(graph);
  const focus = nodes.get(focusId);
  if (!focus) throw new Error(`Unknown local graph focus '${focusId}'`);
  const bundles = new Map();
  const candidateEdges = edgesByNodeId?.get(focusId) || graph.edges;
  for (const edge of candidateEdges) {
    if (edge.source !== focusId && edge.target !== focusId) continue;
    const neighborId = edge.source === focusId ? edge.target : edge.source;
    const neighbor = nodes.get(neighborId);
    if (!neighbor || neighbor.visibility === "hidden") continue;
    if (!bundles.has(neighborId)) bundles.set(neighborId, { neighborId, node: neighbor, edges: [] });
    bundles.get(neighborId).edges.push(edge);
  }

  const records = [...bundles.values()].map((record) => {
    record.edges.sort((a, b) => edgeRank(b) - edgeRank(a) || a.id.localeCompare(b.id, "ko"));
    const primaryEdge = record.edges[0];
    const availableBuckets = [...new Set(record.edges.map(bucketFor))];
    return {
      ...record,
      primaryEdge,
      bucket: bucketFor(primaryEdge),
      availableBuckets,
      direction: directionFor(record.edges, focusId),
      labels: record.edges.map((edge) => relationLabel(graph, edge, focusId)),
      score: edgeRank(primaryEdge)
    };
  }).sort((a, b) => b.score - a.score || a.node.title.localeCompare(b.node.title, "ko"));

  const queues = new Map(BUCKET_ORDER.map((bucket) => [bucket, records.filter((record) => record.bucket === bucket)]));
  const visibleRecords = [];
  while (visibleRecords.length < Math.min(limit, records.length)) {
    let added = false;
    for (const bucket of BUCKET_ORDER) {
      const record = queues.get(bucket).shift();
      if (!record) continue;
      visibleRecords.push(record);
      added = true;
      if (visibleRecords.length >= limit) break;
    }
    if (!added) break;
  }
  const visibleIds = new Set(visibleRecords.map((record) => record.neighborId));
  const hiddenRecords = records.filter((record) => !visibleIds.has(record.neighborId));
  const views = { all: visibleRecords };
  for (const bucket of BUCKET_ORDER) {
    views[bucket] = records
      .map((record) => recordForBucket(record, bucket, graph, focusId))
      .filter(Boolean)
      .sort((a, b) => b.score - a.score || a.node.title.localeCompare(b.node.title, "ko"))
      .slice(0, limit);
  }
  const counts = Object.fromEntries(BUCKET_ORDER.map((bucket) => [bucket, records.filter((record) => record.availableBuckets.includes(bucket)).length]));
  return {
    focus,
    totalNeighbors: records.length,
    totalEdges: records.reduce((sum, record) => sum + record.edges.length, 0),
    counts,
    records,
    views,
    visibleRecords,
    hiddenRecords
  };
}
