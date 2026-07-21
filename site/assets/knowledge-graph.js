const CATEGORY = Object.freeze({
  concepts: "concepts",
  concept: "concepts",
  entities: "entities",
  entity: "entities",
  people: "entities",
  person: "entities",
  tags: "tags",
  tag: "tags",
  attachments: "attachments",
  attachment: "attachments",
  missing: "missing",
  unresolved: "missing"
});

const PALETTE = Object.freeze({
  background: "#0a0014",
  raised: "#120021",
  concept: "#00ff41",
  entity: "#ffb000",
  tag: "#8cb393",
  attachment: "#00b82e",
  missing: "#ffb000",
  text: "#e7ffe9",
  muted: "#8cb393"
});

const CAMERA_LIMITS = Object.freeze({ min: 0.24, max: 4.8 });
const FOCUS_CAMERA_LIMITS = Object.freeze({ min: 0.001, max: 2.8 });
const STORAGE_KEY = "cs-wiki:knowledge-graph:settings:v2";
const DIRECTION = new Set(["forward", "reverse", "both", "none"]);
const GROUP_COLORS = Object.freeze(["#00ff41", "#ffb000", "#8cb393", "#e7ffe9", "#00b82e", "#b67a00"]);
const DOMAIN_LABELS = Object.freeze({
  "domain/computer-architecture": "컴퓨터 구조",
  "domain/computer-history": "컴퓨터 역사",
  "domain/computer-science": "컴퓨터 과학",
  "domain/internet": "인터넷",
  "domain/machine-learning": "머신러닝",
  "domain/mathematics": "수학",
  "domain/operating-systems": "운영체제",
  "domain/programming-languages": "프로그래밍 언어",
  "domain/security": "보안",
  "domain/software-engineering": "소프트웨어 공학",
  "domain/systems": "시스템",
  "domain/text-processing": "텍스트 처리",
  "domain/web": "웹",
  "domain/general": "연결 주제"
});
const RELATION_LABELS = Object.freeze({
  mentions: "본문에서 언급",
  related: "관련 항목",
  supports: "근거로 뒷받침",
  path_next: "학습 경로",
  broader: "더 넓은 개념",
  narrower: "더 좁은 개념",
  prerequisite_for: "선수 개념",
  enables: "가능하게 함",
  constrains: "제약함",
  measures: "측정함",
  implements: "구현함",
  exemplifies: "사례가 됨",
  precedes: "역사적으로 앞섬",
  responds_to: "문제에 대응함",
  contradicts: "반박하거나 충돌함",
  synthesizes: "종합함"
});
const RELATION_SECTORS = Object.freeze({
  hierarchy: { label: "계층 · 학습", angle: -Math.PI / 2 },
  application: { label: "구현 · 활용", angle: 0 },
  association: { label: "근거 · 연관", angle: Math.PI / 2 },
  history: { label: "역사 · 제약", angle: Math.PI }
});
const RELATION_SECTOR_BY_KIND = Object.freeze({
  broader: "hierarchy",
  narrower: "hierarchy",
  prerequisite_for: "hierarchy",
  path_next: "hierarchy",
  enables: "application",
  implements: "application",
  exemplifies: "application",
  measures: "application",
  precedes: "history",
  responds_to: "history",
  constrains: "history",
  supports: "association",
  related: "association",
  mentions: "association",
  contradicts: "association",
  synthesizes: "association"
});

export const GRAPH_SETTINGS_DEFAULTS = Object.freeze({
  fileQuery: "",
  showTags: false,
  showAttachments: false,
  existingOnly: true,
  showOrphans: true,
  groups: Object.freeze([]),
  showArrows: true,
  textFade: 0.25,
  nodeSize: 1,
  linkThickness: 1,
  centerForce: 0.35,
  repelForce: 1,
  linkForce: 0.65,
  linkDistance: 1
});

export function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, Number(value) || 0));
}

export function normalizeGraphCategory(value) {
  return CATEGORY[String(value || "").trim().toLocaleLowerCase("en-US")] || "";
}

export function normalizeSearchText(value) {
  return String(value || "").normalize("NFKC").trim().toLocaleLowerCase("ko-KR");
}

function finite(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function textList(value) {
  const values = Array.isArray(value) ? value : value == null ? [] : [value];
  return [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))]
    .sort((left, right) => left.localeCompare(right, "ko"));
}

function booleanSetting(value, fallback) {
  return typeof value === "boolean" ? value : fallback;
}

function validColor(value, fallback) {
  const color = String(value || "").trim();
  return /^#[\da-f]{6}$/iu.test(color) ? color.toLowerCase() : fallback;
}

export function normalizeGraphSettings(value = {}) {
  const raw = value && typeof value === "object" ? value : {};
  const rawGroups = Array.isArray(raw.groups) ? raw.groups : [];
  const groups = rawGroups.slice(0, 32).map((group, index) => ({
    id: String(group?.id || `group-${index + 1}`).trim() || `group-${index + 1}`,
    query: String(group?.query || "").trim(),
    color: validColor(group?.color, GROUP_COLORS[index % GROUP_COLORS.length])
  }));
  return {
    fileQuery: String(raw.fileQuery ?? GRAPH_SETTINGS_DEFAULTS.fileQuery).trim(),
    showTags: booleanSetting(raw.showTags, GRAPH_SETTINGS_DEFAULTS.showTags),
    showAttachments: booleanSetting(raw.showAttachments, GRAPH_SETTINGS_DEFAULTS.showAttachments),
    existingOnly: booleanSetting(raw.existingOnly, GRAPH_SETTINGS_DEFAULTS.existingOnly),
    showOrphans: booleanSetting(raw.showOrphans, GRAPH_SETTINGS_DEFAULTS.showOrphans),
    groups,
    showArrows: booleanSetting(raw.showArrows, GRAPH_SETTINGS_DEFAULTS.showArrows),
    textFade: clamp(finite(raw.textFade, GRAPH_SETTINGS_DEFAULTS.textFade), 0, 1),
    nodeSize: clamp(finite(raw.nodeSize, GRAPH_SETTINGS_DEFAULTS.nodeSize), 0.5, 2),
    linkThickness: clamp(finite(raw.linkThickness, GRAPH_SETTINGS_DEFAULTS.linkThickness), 0.5, 2),
    centerForce: clamp(finite(raw.centerForce, GRAPH_SETTINGS_DEFAULTS.centerForce), 0, 2),
    repelForce: clamp(finite(raw.repelForce, GRAPH_SETTINGS_DEFAULTS.repelForce), 0.25, 2.5),
    linkForce: clamp(finite(raw.linkForce, GRAPH_SETTINGS_DEFAULTS.linkForce), 0, 2),
    linkDistance: clamp(finite(raw.linkDistance, GRAPH_SETTINGS_DEFAULTS.linkDistance), 0.5, 2)
  };
}

function queryTokens(query) {
  return String(query || "").match(/(?:[^\s"]+:)?"[^"]*"|\S+/gu) || [];
}

function queryHaystack(node, field = "") {
  const typeNames = node.category === "concepts"
    ? ["concepts", "concept", "개념"]
    : node.category === "entities"
      ? ["entities", "entity", "person", "people", "인물"]
      : [node.category, node.type];
  const values = {
    title: [node.title],
    aliases: node.aliases,
    alias: node.aliases,
    summary: [node.summary],
    path: [node.path, node.url],
    url: [node.url],
    tag: node.tags,
    tags: node.tags,
    type: typeNames,
    status: [node.status]
  };
  const selected = field && Object.hasOwn(values, field)
    ? values[field]
    : [node.title, ...(node.aliases || []), node.summary, node.path, node.url,
      ...(node.tags || []), ...(node.domains || []), ...typeNames, node.status];
  return normalizeSearchText((selected || []).filter(Boolean).join(" "));
}

function parseQueryTerm(rawToken) {
  let token = String(rawToken || "");
  let negative = false;
  if (token.startsWith("-") && token.length > 1) {
    negative = true;
    token = token.slice(1);
  }
  let field = "";
  const separator = token.indexOf(":");
  if (separator > 0) {
    const candidate = normalizeSearchText(token.slice(0, separator));
    if (["title", "alias", "aliases", "summary", "path", "url", "tag", "tags", "type", "status"].includes(candidate)) {
      field = candidate;
      token = token.slice(separator + 1);
    }
  }
  if (token.startsWith('"') && token.endsWith('"')) token = token.slice(1, -1);
  return { field, negative, value: normalizeSearchText(token) };
}

/** Match the subset of Obsidian graph search used by file filters and groups. */
export function matchGraphQuery(node, query = "") {
  if (typeof node === "string" && query && typeof query === "object") {
    [node, query] = [query, node];
  }
  const tokens = queryTokens(query);
  if (!tokens.length) return true;
  const clauses = [[]];
  for (const token of tokens) {
    if (/^OR$/iu.test(token) && clauses.at(-1).length) clauses.push([]);
    else clauses.at(-1).push(parseQueryTerm(token));
  }
  return clauses.some((terms) => terms.length && terms.every((term) => {
    if (!term.value) return true;
    const matched = queryHaystack(node || {}, term.field).includes(term.value);
    return term.negative ? !matched : matched;
  }));
}

/** Apply global graph filters, then retain a selected document and every direct neighbor. */
export function computeVisibleGraphNodeIds(nodes = [], adjacency = new Map(), options = {}) {
  const activeFilter = String(options.activeFilter || "all");
  const fileQuery = String(options.fileQuery || "");
  const showOrphans = options.showOrphans !== false;
  const selectedId = String(options.selectedId || "");
  const topologyIds = new Set(nodes.map((node) => node.id));
  const candidateIds = new Set(nodes.filter((node) => {
    if (activeFilter !== "all" && node.category !== activeFilter) return false;
    return !fileQuery || matchGraphQuery(node, fileQuery);
  }).map((node) => node.id));
  if (!showOrphans) {
    for (const id of [...candidateIds]) {
      const hasVisibleNeighbor = [...(adjacency.get(id) || [])].some((neighborId) => candidateIds.has(neighborId));
      if (!hasVisibleNeighbor) candidateIds.delete(id);
    }
  }
  if (selectedId && topologyIds.has(selectedId)) {
    candidateIds.add(selectedId);
    for (const neighborId of adjacency.get(selectedId) || []) {
      if (topologyIds.has(neighborId)) candidateIds.add(neighborId);
    }
  }
  return candidateIds;
}

function hashString(value) {
  let hash = 2166136261;
  for (const character of String(value || "")) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Normalize and validate the compact graph payload emitted by the site builder. */
export function normalizeKnowledgeGraph(payload = {}) {
  const rawNodes = Array.isArray(payload?.nodes) ? payload.nodes : [];
  const byId = new Map();
  for (const raw of rawNodes) {
    const id = String(raw?.id || "").trim();
    const category = normalizeGraphCategory(raw?.category);
    if (!id || !category || byId.has(id)) continue;
    const x = Number(raw?.x);
    const y = Number(raw?.y);
    const missing = category === "missing" || raw?.missing === true || raw?.exists === false;
    byId.set(id, {
      id,
      title: String(raw?.title || id).trim() || id,
      aliases: textList(raw?.aliases),
      url: String(raw?.url || "").trim(),
      path: String(raw?.path || raw?.url || "").trim(),
      category,
      summary: String(raw?.summary || "").trim(),
      status: String(raw?.status || "").trim(),
      type: String(raw?.type || category).trim(),
      domains: textList(raw?.domains),
      tags: textList(raw?.tags),
      created: String(raw?.created || "").trim(),
      updated: String(raw?.updated || "").trim(),
      attachments: textList(raw?.attachments),
      unresolved: textList(raw?.unresolved),
      exists: !missing,
      missing,
      degree: Math.max(0, Math.floor(finite(raw?.degree, 0))),
      ...(Number.isFinite(x) && Number.isFinite(y) ? { x, y } : {})
    });
  }

  const edgeKeys = new Set();
  const edges = [];
  for (const raw of Array.isArray(payload?.edges) ? payload.edges : []) {
    const source = String(raw?.source || "").trim();
    const target = String(raw?.target || "").trim();
    if (!source || !target || source === target || !byId.has(source) || !byId.has(target)) continue;
    const key = source < target ? `${source}\u0000${target}` : `${target}\u0000${source}`;
    if (edgeKeys.has(key)) continue;
    edgeKeys.add(key);
    const rawDirection = String(raw?.direction || "").trim().toLocaleLowerCase("en-US");
    const direction = DIRECTION.has(rawDirection)
      ? rawDirection
      : raw?.directed === true
        ? "forward"
        : "none";
    const directions = raw?.directions && typeof raw.directions === "object"
      ? Object.fromEntries(["forward", "reverse", "none"].map((name) => [name, {
        kinds: textList(raw.directions[name]?.kinds),
        occurrences: Math.max(0, Math.floor(finite(raw.directions[name]?.occurrences, 0)))
      }]))
      : undefined;
    const relations = Array.isArray(raw?.relations) ? raw.relations.map((relation) => ({
      kind: String(relation?.kind || "").trim(),
      direction: DIRECTION.has(String(relation?.direction || "").trim()) ? String(relation.direction).trim() : "none",
      origin: relation?.origin === "curated" ? "curated" : "derived",
      note: String(relation?.note || "").trim().slice(0, 220),
      evidence: Array.isArray(relation?.evidence) ? relation.evidence.map((item) => ({
        id: String(item?.id || "").trim(),
        title: String(item?.title || item?.id || "").trim(),
        url: String(item?.url || "").trim()
      })).filter((item) => item.id && item.title) : []
    })).filter((relation) => relation.kind) : [];
    edges.push({
      source,
      target,
      weight: clamp(finite(raw?.weight, 1), 0.15, 12),
      kinds: textList(raw?.kinds),
      direction,
      ...(relations.length ? { relations } : {}),
      ...(directions ? { directions } : {})
    });
  }

  const nodes = [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));
  edges.sort((left, right) => left.source.localeCompare(right.source) || left.target.localeCompare(right.target));
  return { nodes, edges };
}

export function createGraphAdjacency(nodes = [], edges = []) {
  const adjacency = new Map(nodes.map((node) => [node.id, new Set()]));
  for (const edge of edges) {
    if (!adjacency.has(edge.source) || !adjacency.has(edge.target)) continue;
    adjacency.get(edge.source).add(edge.target);
    adjacency.get(edge.target).add(edge.source);
  }
  return adjacency;
}

function relationSector(edge = {}) {
  const kinds = Array.isArray(edge.kinds) ? edge.kinds : [];
  return ["hierarchy", "application", "history", "association"]
    .find((sector) => kinds.some((kind) => RELATION_SECTOR_BY_KIND[kind] === sector)) || "association";
}

function graphPairKey(left, right) {
  return String(left).localeCompare(String(right), "ko") <= 0
    ? `${left}\u0000${right}`
    : `${right}\u0000${left}`;
}

/** Arrange the complete graph as labeled domain constellations and aggregate cross-domain corridors. */
export function createClusterOverviewLayout(nodes = [], edges = []) {
  const validNodes = nodes.filter((node) => node?.id);
  const domainCounts = new Map();
  for (const node of validNodes) {
    const domains = node.domains?.length ? node.domains : ["domain/general"];
    for (const domain of domains) domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
  }
  const domainForNode = new Map(validNodes.map((node) => {
    const domains = node.domains?.length ? node.domains : ["domain/general"];
    const domain = [...domains].sort((left, right) => (domainCounts.get(left) || 0) - (domainCounts.get(right) || 0)
      || left.localeCompare(right, "ko"))[0];
    return [node.id, domain];
  }));
  const groups = new Map();
  for (const node of validNodes) {
    const domain = domainForNode.get(node.id);
    if (!groups.has(domain)) groups.set(domain, []);
    groups.get(domain).push(node);
  }
  const ordered = [...groups.entries()].sort((left, right) => right[1].length - left[1].length
    || left[0].localeCompare(right[0], "ko"));
  const columns = Math.max(1, Math.ceil(Math.sqrt(ordered.length * 1.25)));
  const rows = Math.max(1, Math.ceil(ordered.length / columns));
  const positions = new Map();
  const clusters = ordered.map(([domain, members], index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;
    const center = {
      x: (column - (columns - 1) / 2) * 440 + (row % 2 ? 72 : 0),
      y: (row - (rows - 1) / 2) * 350
    };
    const sorted = [...members].sort((left, right) => finite(right.degree) - finite(left.degree)
      || left.title.localeCompare(right.title, "ko"));
    let radius = 82;
    sorted.forEach((node, memberIndex) => {
      const angle = memberIndex * Math.PI * (3 - Math.sqrt(5));
      const distance = memberIndex ? 30 + 27 * Math.sqrt(memberIndex) : 0;
      const point = {
        x: center.x + Math.cos(angle) * distance * 1.16,
        y: center.y + Math.sin(angle) * distance * 0.82
      };
      positions.set(node.id, point);
      radius = Math.max(radius, distance + 58);
    });
    return {
      id: domain,
      label: DOMAIN_LABELS[domain] || domain.replace(/^domain\//u, "").replaceAll("-", " "),
      count: members.length,
      memberIds: sorted.map((node) => node.id),
      x: center.x,
      y: center.y,
      radius
    };
  });
  const clusterById = new Map(clusters.map((cluster) => [cluster.id, cluster]));
  const corridorCounts = new Map();
  for (const edge of edges) {
    const sourceDomain = domainForNode.get(edge.source);
    const targetDomain = domainForNode.get(edge.target);
    if (!sourceDomain || !targetDomain || sourceDomain === targetDomain) continue;
    const key = graphPairKey(sourceDomain, targetDomain);
    corridorCounts.set(key, (corridorCounts.get(key) || 0) + 1);
  }
  const corridors = [...corridorCounts.entries()].map(([key, count]) => {
    const [sourceId, targetId] = key.split("\u0000");
    return { source: clusterById.get(sourceId), target: clusterById.get(targetId), count };
  }).filter((corridor) => corridor.source && corridor.target)
    .sort((left, right) => right.count - left.count || left.source.id.localeCompare(right.source.id, "ko"));
  return { positions, clusters, corridors, domainForNode };
}

/** Place direct neighbors in four semantic sectors around an exact center node. */
export function createFocusedOrbitLayout(selected, neighbors = [], edges = []) {
  if (!selected) return { positions: new Map(), sectors: [] };
  const edgeByNeighbor = new Map();
  for (const edge of edges) {
    if (edge.source === selected.id) edgeByNeighbor.set(edge.target, edge);
    else if (edge.target === selected.id) edgeByNeighbor.set(edge.source, edge);
  }
  const groups = new Map(Object.keys(RELATION_SECTORS).map((sector) => [sector, []]));
  for (const node of neighbors.filter(Boolean)) groups.get(relationSector(edgeByNeighbor.get(node.id)))?.push(node);
  const positions = new Map([[selected.id, { x: 0, y: 0 }]]);
  const sectors = [];
  for (const [sector, meta] of Object.entries(RELATION_SECTORS)) {
    const members = groups.get(sector).sort((left, right) => finite(right.degree) - finite(left.degree)
      || left.title.localeCompare(right.title, "ko"));
    if (!members.length) continue;
    members.forEach((node, index) => {
      const ring = Math.floor(index / 7);
      const ringMembers = members.slice(ring * 7, ring * 7 + 7);
      const ringIndex = index % 7;
      const span = Math.min(Math.PI * 0.42, Math.PI * 0.13 * Math.max(1, ringMembers.length - 1));
      const angle = meta.angle + (ringMembers.length === 1 ? 0 : -span / 2 + span * ringIndex / (ringMembers.length - 1));
      const radius = 205 + ring * 118;
      positions.set(node.id, { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
    });
    sectors.push({ key: sector, label: meta.label, x: Math.cos(meta.angle) * 390, y: Math.sin(meta.angle) * 390 });
  }
  return { positions, sectors };
}

/** Return one deterministic, unweighted shortest path between two visible graph nodes. */
export function shortestGraphPath(adjacency = new Map(), sourceId = "", targetId = "") {
  if (!sourceId || !targetId || !adjacency.has(sourceId) || !adjacency.has(targetId)) return [];
  if (sourceId === targetId) return [sourceId];
  const queue = [sourceId];
  const previous = new Map([[sourceId, null]]);
  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    const neighbors = [...(adjacency.get(current) || [])].sort((left, right) => String(left).localeCompare(String(right), "ko"));
    for (const neighbor of neighbors) {
      if (previous.has(neighbor)) continue;
      previous.set(neighbor, current);
      if (neighbor === targetId) {
        const path = [targetId];
        while (previous.get(path[0]) !== null) path.unshift(previous.get(path[0]));
        return path;
      }
      queue.push(neighbor);
    }
  }
  return [];
}

/**
 * Produce stable force-directed world coordinates. The same graph always yields
 * the same coordinates, including when its input arrays arrive in a new order.
 */
export function createDeterministicLayout(nodes = [], edges = [], options = {}) {
  const iterations = clamp(Math.floor(finite(options.iterations, 180)), 0, 600);
  const centerForce = clamp(finite(options.centerForce, GRAPH_SETTINGS_DEFAULTS.centerForce), 0, 2);
  const repelForce = clamp(finite(options.repelForce, GRAPH_SETTINGS_DEFAULTS.repelForce), 0.25, 2.5);
  const linkForce = clamp(finite(options.linkForce, GRAPH_SETTINGS_DEFAULTS.linkForce), 0, 2);
  const linkDistance = clamp(finite(options.linkDistance, GRAPH_SETTINGS_DEFAULTS.linkDistance), 0.5, 2);
  const layoutNodes = [...nodes]
    .filter((node) => node?.id)
    .sort((a, b) => String(a.id).localeCompare(String(b.id)))
    .map((node, index, all) => {
      const hash = hashString(node.id);
      const fraction = (hash % 1000003) / 1000003;
      const golden = Math.PI * (3 - Math.sqrt(5));
      const angle = index * golden + fraction * Math.PI * 2;
      const radius = 70 + 250 * Math.sqrt((index + 0.6) / Math.max(1, all.length));
      return {
        ...node,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        vx: 0,
        vy: 0
      };
    });
  const byId = new Map(layoutNodes.map((node) => [node.id, node]));
  const validEdges = edges.filter((edge) => byId.has(edge?.source) && byId.has(edge?.target));

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const cooling = 1 - iteration / Math.max(1, iterations);
    for (let leftIndex = 0; leftIndex < layoutNodes.length; leftIndex += 1) {
      const left = layoutNodes[leftIndex];
      for (let rightIndex = leftIndex + 1; rightIndex < layoutNodes.length; rightIndex += 1) {
        const right = layoutNodes[rightIndex];
        let dx = right.x - left.x;
        let dy = right.y - left.y;
        let distanceSquared = dx * dx + dy * dy;
        if (distanceSquared < 0.01) {
          const nudge = ((hashString(`${left.id}:${right.id}`) % 1000) / 1000) * Math.PI * 2;
          dx = Math.cos(nudge) * 0.1;
          dy = Math.sin(nudge) * 0.1;
          distanceSquared = 0.01;
        }
        const distance = Math.sqrt(distanceSquared);
        const force = Math.min(5.5, 7200 / distanceSquared) * repelForce * cooling;
        const fx = dx / distance * force;
        const fy = dy / distance * force;
        left.vx -= fx;
        left.vy -= fy;
        right.vx += fx;
        right.vy += fy;
      }
    }

    for (const edge of validEdges) {
      const source = byId.get(edge.source);
      const target = byId.get(edge.target);
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const distance = Math.max(0.1, Math.hypot(dx, dy));
      const preferred = (112 - Math.min(30, Math.log2(1 + finite(edge.weight, 1)) * 9)) * linkDistance;
      const force = (distance - preferred) * 0.006 * (linkForce / GRAPH_SETTINGS_DEFAULTS.linkForce)
        * Math.sqrt(finite(edge.weight, 1)) * cooling;
      const fx = dx / distance * force;
      const fy = dy / distance * force;
      source.vx += fx;
      source.vy += fy;
      target.vx -= fx;
      target.vy -= fy;
    }

    for (const node of layoutNodes) {
      const centerScale = centerForce / GRAPH_SETTINGS_DEFAULTS.centerForce;
      node.vx += -node.x * 0.0018 * centerScale * cooling;
      node.vy += -node.y * 0.0018 * centerScale * cooling;
      node.vx *= 0.78;
      node.vy *= 0.78;
      const speed = Math.hypot(node.vx, node.vy);
      const limit = 8 * cooling + 0.4;
      if (speed > limit) {
        node.vx = node.vx / speed * limit;
        node.vy = node.vy / speed * limit;
      }
      node.x += node.vx;
      node.y += node.vy;
    }
  }

  if (layoutNodes.length) {
    const centerX = layoutNodes.reduce((sum, node) => sum + node.x, 0) / layoutNodes.length;
    const centerY = layoutNodes.reduce((sum, node) => sum + node.y, 0) / layoutNodes.length;
    for (const node of layoutNodes) {
      node.x = Math.round((node.x - centerX) * 1000) / 1000;
      node.y = Math.round((node.y - centerY) * 1000) / 1000;
      delete node.vx;
      delete node.vy;
    }
  }
  return layoutNodes;
}

export function graphSearchResults(nodes = [], query = "", category = "all", limit = 8) {
  const needle = normalizeSearchText(query);
  if (!needle) return [];
  const terms = needle.split(/\s+/u).filter(Boolean);
  return nodes
    .filter((node) => category === "all" || node.category === category)
    .map((node) => {
      const title = normalizeSearchText(node.title);
      const summary = normalizeSearchText(node.summary);
      if (!terms.every((term) => title.includes(term) || summary.includes(term))) return null;
      const score = title === needle ? 100 : title.startsWith(needle) ? 60 : title.includes(needle) ? 35 : 10;
      return { node, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || b.node.degree - a.node.degree || a.node.title.localeCompare(b.node.title, "ko"))
    .slice(0, Math.max(0, Math.floor(limit)))
    .map(({ node }) => node);
}

export function fitGraphCamera(nodes = [], viewport = {}, padding = 54) {
  const width = Math.max(1, finite(viewport.width, 1));
  const height = Math.max(1, finite(viewport.height, 1));
  if (!nodes.length) return { x: 0, y: 0, zoom: 1 };
  const xs = nodes.map((node) => finite(node.x));
  const ys = nodes.map((node) => finite(node.y));
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const availableWidth = Math.max(1, width - padding * 2);
  const availableHeight = Math.max(1, height - padding * 2);
  const zoom = clamp(Math.min(availableWidth / Math.max(80, maxX - minX), availableHeight / Math.max(80, maxY - minY)), CAMERA_LIMITS.min, 1.7);
  return { x: (minX + maxX) / 2, y: (minY + maxY) / 2, zoom };
}

/**
 * Center a selected node exactly while fitting all direct-neighbor glyphs in a
 * symmetric safe frame. Unlike the all-graph camera this may zoom below 0.24.
 */
export function fitFocusedGraphCamera(selected, neighbors = [], viewport = {}, padding = 64) {
  if (!selected) return fitGraphCamera(neighbors, viewport, padding);
  const width = Math.max(1, finite(viewport.width, 1));
  const height = Math.max(1, finite(viewport.height, 1));
  const safePadding = typeof padding === "object"
    ? Math.max(0, finite(padding.padding, 64) + finite(padding.glyphRadius, 0))
    : Math.max(0, finite(padding, 64));
  const selectedX = finite(selected.x);
  const selectedY = finite(selected.y);
  const positioned = neighbors.filter(Boolean);
  const maxDeltaX = positioned.reduce((largest, node) => Math.max(largest, Math.abs(finite(node.x) - selectedX)), 0);
  const maxDeltaY = positioned.reduce((largest, node) => Math.max(largest, Math.abs(finite(node.y) - selectedY)), 0);
  const availableHalfWidth = Math.max(1, width / 2 - safePadding);
  const availableHalfHeight = Math.max(1, height / 2 - safePadding);
  const zoomX = maxDeltaX > 0 ? availableHalfWidth / maxDeltaX : FOCUS_CAMERA_LIMITS.max;
  const zoomY = maxDeltaY > 0 ? availableHalfHeight / maxDeltaY : FOCUS_CAMERA_LIMITS.max;
  return {
    x: selectedX,
    y: selectedY,
    zoom: clamp(Math.min(zoomX, zoomY, FOCUS_CAMERA_LIMITS.max), FOCUS_CAMERA_LIMITS.min, FOCUS_CAMERA_LIMITS.max)
  };
}

function safeHref(value, ownerWindow) {
  if (!String(value || "").trim()) return "#";
  try {
    const url = new URL(value, ownerWindow.location.href);
    if (url.origin === ownerWindow.location.origin) return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    // Invalid or cross-origin content links stay inert.
  }
  return "#";
}

/** Build a same-site raw attachment path without permitting absolute URLs or traversal. */
export function attachmentAssetHref(assetRoot = "/assets/raw/", value = "") {
  const raw = String(value || "").trim().replaceAll("\\", "/");
  if (!raw || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/iu.test(raw)) return "";
  const segments = raw.split("/").filter((segment) => segment && segment !== ".");
  if (!segments.length || segments.includes("..")) return "";
  const root = `${String(assetRoot || "/assets/raw/").replace(/\/+$/u, "")}/`;
  return `${root}${segments.map((segment) => encodeURIComponent(segment)).join("/")}`;
}

function auxiliaryNodeId(category, value) {
  return `${category}:${encodeURIComponent(normalizeSearchText(value))}`;
}

function buildAuxiliaryGraph(payload, { attachmentRoot = "/assets/raw/" } = {}) {
  const nodesById = new Map(payload.nodes.map((node) => [node.id, { ...node }]));
  const edges = payload.edges.map((edge) => ({ ...edge }));
  const edgeKeys = new Set(edges.map((edge) => edge.source < edge.target
    ? `${edge.source}\u0000${edge.target}`
    : `${edge.target}\u0000${edge.source}`));
  const addAuxiliary = (owner, category, title, extra = {}) => {
    const id = auxiliaryNodeId(category, title);
    if (!nodesById.has(id)) {
      nodesById.set(id, {
        id,
        title: category === "tags" ? `#${title}` : title,
        aliases: [],
        url: category === "attachments" ? attachmentAssetHref(attachmentRoot, title) : "",
        path: title,
        category,
        summary: extra.summary || "",
        status: category === "missing" ? "unresolved" : "active",
        type: category,
        domains: [],
        tags: category === "tags" ? [title] : [],
        created: owner.created,
        updated: owner.updated,
        attachments: [],
        unresolved: [],
        exists: category !== "missing",
        missing: category === "missing",
        degree: 0
      });
    }
    const key = owner.id < id ? `${owner.id}\u0000${id}` : `${id}\u0000${owner.id}`;
    if (!edgeKeys.has(key)) {
      edgeKeys.add(key);
      edges.push({ source: owner.id, target: id, weight: 0.8, kinds: [category], direction: "none" });
    }
  };
  for (const node of payload.nodes) {
    if (!["concepts", "entities"].includes(node.category)) continue;
    for (const tag of node.tags) addAuxiliary(node, "tags", tag);
    for (const attachment of node.attachments) addAuxiliary(node, "attachments", attachment);
    for (const unresolved of node.unresolved) addAuxiliary(node, "missing", unresolved);
  }
  return { nodes: [...nodesById.values()], edges };
}

function categoryLabel(category) {
  return ({ concepts: "개념", entities: "인물", tags: "태그", attachments: "첨부 파일", missing: "미해결 링크" })[category] || "노드";
}

function bootstrapKnowledgeGraph() {
  const root = document.querySelector("[data-knowledge-graph]");
  if (!root) return;
  const dataElement = root.querySelector("#knowledge-graph-data") || document.querySelector("#knowledge-graph-data");
  const canvas = root.querySelector("[data-knowledge-graph-canvas]");
  if (!dataElement || !canvas || typeof canvas.getContext !== "function") return;
  const context = canvas.getContext("2d");
  if (!context) return;

  const status = root.querySelector("[data-graph-status]");
  let payload;
  try {
    payload = normalizeKnowledgeGraph(JSON.parse(dataElement.textContent || "{}"));
  } catch {
    if (status) status.textContent = "지식 그래프 데이터를 읽지 못했습니다.";
    return;
  }

  const ownerWindow = root.ownerDocument.defaultView || window;
  const reduceMotion = ownerWindow.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || false;
  const auxiliaryGraph = buildAuxiliaryGraph(payload, { attachmentRoot: root.dataset.graphAssetRoot });
  let allNodes = auxiliaryGraph.nodes;
  let allEdges = auxiliaryGraph.edges;
  let nodeById = new Map(allNodes.map((node) => [node.id, node]));
  let topologyNodes = [];
  let topologyEdges = [];
  let topologyIds = new Set();
  let adjacency = new Map();
  let visibleNodes = [];
  let visibleEdges = [];
  let visibleIds = new Set();

  let settings = loadSettings();
  let viewport = { width: 1, height: 1 };
  let camera = { x: 0, y: 0, zoom: 1 };
  let selectedId = "";
  let hoveredId = "";
  let hoveredEdgeKey = "";
  let keyboardNodeId = "";
  let activeFilter = "all";
  let viewMode = "overview";
  let semanticPositions = new Map();
  let overviewClusters = [];
  let overviewCorridors = [];
  let focusSectors = [];
  let pathStartId = "";
  let pathEndId = "";
  let pathNodeIds = [];
  let autoFocus = true;
  let frame = 0;
  let inViewport = true;
  let didFit = false;
  let pointer = null;
  let suggestionIndex = -1;
  let layoutGeneration = 0;
  let layoutTimer = 0;
  let activeWorker = null;
  let animationFrame = 0;
  let animationStart = 0;
  let animationOrder = [];
  let animationVisibleIds = null;

  const search = root.querySelector("[data-graph-search]");
  const searchResults = root.querySelector("[data-graph-search-results]");
  const modeButtons = [...root.querySelectorAll("[data-graph-mode]")];
  const filterButtons = [...root.querySelectorAll("[data-graph-filter]")];
  const densityButtons = [...root.querySelectorAll("[data-graph-label-density]")];
  const trail = root.querySelector("[data-graph-trail]");
  const zoomIn = root.querySelector("[data-graph-zoom-in]");
  const zoomOut = root.querySelector("[data-graph-zoom-out]");
  const reset = root.querySelector("[data-graph-reset]");
  const inspector = root.querySelector("[data-graph-inspector]");
  const inspectorKind = inspector?.querySelector("[data-inspector-kind]");
  const inspectorTitle = inspector?.querySelector("[data-inspector-title]");
  const inspectorSummary = inspector?.querySelector("[data-inspector-summary]");
  const inspectorDegree = inspector?.querySelector("[data-inspector-degree]");
  const inspectorNeighbors = inspector?.querySelector("[data-inspector-neighbors]");
  const inspectorLink = inspector?.querySelector("[data-inspector-link]");
  const inspectorRelation = inspector?.querySelector("[data-inspector-relation]");
  const inspectorRelationTitle = inspector?.querySelector("[data-inspector-relation-title]");
  const inspectorRelationKinds = inspector?.querySelector("[data-inspector-relation-kinds]");
  const inspectorRelationDirection = inspector?.querySelector("[data-inspector-relation-direction]");
  const inspectorRelationNote = inspector?.querySelector("[data-inspector-relation-note]");
  const inspectorRelationEvidence = inspector?.querySelector("[data-inspector-relation-evidence]");
  const settingsToggle = root.querySelector("[data-graph-settings-toggle]");
  const settingsPanel = root.querySelector("[data-graph-settings-panel]");
  const settingsClose = root.querySelector("[data-graph-settings-close]");
  const settingsReset = root.querySelector("[data-graph-settings-reset]");
  const fileQuery = root.querySelector("[data-graph-file-query]");
  const toggleTags = root.querySelector("[data-graph-toggle-tags]");
  const toggleAttachments = root.querySelector("[data-graph-toggle-attachments]");
  const toggleExistingOnly = root.querySelector("[data-graph-toggle-existing-only]");
  const toggleShowOrphans = root.querySelector("[data-graph-toggle-show-orphans]");
  const groupList = root.querySelector("[data-graph-group-list]");
  const groupAdd = root.querySelector("[data-graph-group-add]");
  const toggleShowArrows = root.querySelector("[data-graph-toggle-show-arrows]");
  const textFade = root.querySelector("[data-graph-text-fade]");
  const nodeSize = root.querySelector("[data-graph-node-size]");
  const linkThickness = root.querySelector("[data-graph-link-thickness]");
  const animate = root.querySelector("[data-graph-animate]");
  const animationProgress = root.querySelector("[data-graph-animation-progress]");
  const centerForce = root.querySelector("[data-graph-center-force]");
  const repelForce = root.querySelector("[data-graph-repel-force]");
  const linkForce = root.querySelector("[data-graph-link-force]");
  const linkDistance = root.querySelector("[data-graph-link-distance]");

  canvas.setAttribute("role", "application");
  canvas.setAttribute("aria-label", `개념과 인물 ${payload.nodes.length}개를 연결한 지식 그래프. 방향키로 노드를 이동하고 Enter로 선택합니다.`);
  canvas.style.touchAction = "none";

  function loadSettings() {
    try {
      return normalizeGraphSettings(JSON.parse(ownerWindow.localStorage?.getItem(STORAGE_KEY) || "{}"));
    } catch {
      return normalizeGraphSettings();
    }
  }

  function saveSettings() {
    try {
      ownerWindow.localStorage?.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Storage can be unavailable in private or hardened browsing contexts.
    }
  }

  function announce(message) {
    if (status) status.textContent = message;
  }

  function announceGraphState() {
    announce(`${visibleNodes.length}개 노드, 연결 ${visibleEdges.length}개를 표시합니다.`);
  }

  function scheduleDraw() {
    if (frame || document.hidden || !inViewport) return;
    frame = ownerWindow.requestAnimationFrame(() => {
      frame = 0;
      draw();
    });
  }

  function renderedIds() {
    return animationVisibleIds || visibleIds;
  }

  function renderedNodes() {
    const ids = renderedIds();
    return visibleNodes.filter((node) => ids.has(node.id));
  }

  function positioned(node) {
    const semantic = semanticPositions.get(node?.id);
    return semantic ? { ...node, ...semantic } : node;
  }

  function worldToScreen(node) {
    const point = positioned(node);
    return {
      x: viewport.width / 2 + (finite(point?.x) - camera.x) * camera.zoom,
      y: viewport.height / 2 + (finite(point?.y) - camera.y) * camera.zoom
    };
  }

  function screenToWorld(point) {
    return {
      x: camera.x + (point.x - viewport.width / 2) / camera.zoom,
      y: camera.y + (point.y - viewport.height / 2) / camera.zoom
    };
  }

  function nodeRadius(node) {
    return (5.5 + Math.min(6.5, Math.sqrt(Math.max(0, node.degree)) * 1.25)) * settings.nodeSize;
  }

  function nodeColor(node) {
    const matchingGroup = settings.groups.find((group) => group.query && matchGraphQuery(node, group.query));
    if (matchingGroup) return matchingGroup.color;
    return ({
      concepts: PALETTE.concept,
      entities: PALETTE.entity,
      tags: PALETTE.tag,
      attachments: PALETTE.attachment,
      missing: PALETTE.missing
    })[node.category] || PALETTE.muted;
  }

  function traceNode(node, point, radius) {
    context.beginPath();
    if (node.category === "entities") {
      context.moveTo(point.x, point.y - radius * 1.15);
      context.lineTo(point.x + radius, point.y);
      context.lineTo(point.x, point.y + radius * 1.15);
      context.lineTo(point.x - radius, point.y);
      context.closePath();
    } else if (node.category === "tags") {
      for (let index = 0; index < 6; index += 1) {
        const angle = Math.PI / 3 * index - Math.PI / 2;
        const x = point.x + Math.cos(angle) * radius;
        const y = point.y + Math.sin(angle) * radius;
        if (!index) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.closePath();
    } else if (["attachments", "missing"].includes(node.category)) {
      context.rect(point.x - radius, point.y - radius, radius * 2, radius * 2);
    } else {
      context.arc(point.x, point.y, radius, 0, Math.PI * 2);
    }
  }

  function drawGrid() {
    const spacing = Math.max(28, 52 * camera.zoom);
    const offsetX = ((viewport.width / 2 - camera.x * camera.zoom) % spacing + spacing) % spacing;
    const offsetY = ((viewport.height / 2 - camera.y * camera.zoom) % spacing + spacing) % spacing;
    context.save();
    context.strokeStyle = "rgba(140,179,147,0.055)";
    context.lineWidth = 1;
    context.beginPath();
    for (let x = offsetX; x < viewport.width; x += spacing) {
      context.moveTo(x, 0);
      context.lineTo(x, viewport.height);
    }
    for (let y = offsetY; y < viewport.height; y += spacing) {
      context.moveTo(0, y);
      context.lineTo(viewport.width, y);
    }
    context.stroke();
    context.restore();
  }

  function drawArrowhead(from, to, targetRadius, color, alpha, width) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy);
    if (length < 1) return;
    const ux = dx / length;
    const uy = dy / length;
    const tip = { x: to.x - ux * (targetRadius + 3), y: to.y - uy * (targetRadius + 3) };
    const size = 6 + width * 1.4;
    const base = { x: tip.x - ux * size, y: tip.y - uy * size };
    context.save();
    context.globalAlpha = alpha;
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(tip.x, tip.y);
    context.lineTo(base.x - uy * size * 0.52, base.y + ux * size * 0.52);
    context.lineTo(base.x + uy * size * 0.52, base.y - ux * size * 0.52);
    context.closePath();
    context.fill();
    context.restore();
  }

  function drawOverviewStructure() {
    for (const corridor of overviewCorridors) {
      const from = worldToScreen(corridor.source);
      const to = worldToScreen(corridor.target);
      context.save();
      context.globalAlpha = Math.min(0.42, 0.11 + Math.log2(1 + corridor.count) * 0.065);
      context.strokeStyle = PALETTE.entity;
      context.lineWidth = Math.min(8, 1 + Math.sqrt(corridor.count) * 0.72);
      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.stroke();
      context.restore();
    }
    for (const cluster of overviewClusters) {
      const center = worldToScreen(cluster);
      const radius = Math.max(26, cluster.radius * camera.zoom);
      context.save();
      context.fillStyle = "rgba(0,255,65,0.022)";
      context.strokeStyle = "rgba(0,255,65,0.22)";
      context.lineWidth = 1;
      context.setLineDash([4, 7]);
      context.beginPath();
      context.ellipse(center.x, center.y, radius * 1.14, radius * 0.86, 0, 0, Math.PI * 2);
      context.fill();
      context.stroke();
      context.setLineDash([]);
      context.font = '700 11px "D2Coding", monospace';
      context.textAlign = "center";
      context.textBaseline = "bottom";
      context.fillStyle = PALETTE.text;
      context.globalAlpha = 0.94;
      context.fillText(`${cluster.label}  ${cluster.count}`, center.x, center.y - radius * 0.86 - 10);
      context.restore();
    }
  }

  function drawFocusSectorLabels() {
    if (viewMode !== "focus" || !selectedId || viewport.width < 680) return;
    const anchors = {
      hierarchy: { x: viewport.width / 2, y: 22, align: "center" },
      application: { x: viewport.width - 18, y: viewport.height / 2, align: "right" },
      association: { x: viewport.width / 2, y: viewport.height - 58, align: "center" },
      history: { x: 18, y: viewport.height / 2, align: "left" }
    };
    context.save();
    context.font = '700 9px "D2Coding", monospace';
    context.textBaseline = "middle";
    context.fillStyle = PALETTE.muted;
    context.globalAlpha = 0.82;
    for (const sector of focusSectors) {
      const anchor = anchors[sector.key];
      if (!anchor) continue;
      context.textAlign = anchor.align;
      context.fillText(sector.label, anchor.x, anchor.y);
    }
    context.restore();
  }

  function isOverviewScene() {
    return viewMode === "overview" || (viewMode === "focus" && !selectedId)
      || (viewMode === "path" && pathNodeIds.length < 2);
  }

  function draw() {
    context.clearRect(0, 0, viewport.width, viewport.height);
    context.fillStyle = PALETTE.background;
    context.fillRect(0, 0, viewport.width, viewport.height);
    drawGrid();
    if (isOverviewScene()) drawOverviewStructure();
    drawFocusSectorLabels();
    const drawIds = renderedIds();
    const neighbors = selectedId ? adjacency.get(selectedId) || new Set() : null;

    for (const edge of isOverviewScene() ? [] : visibleEdges) {
      if (!drawIds.has(edge.source) || !drawIds.has(edge.target)) continue;
      const source = nodeById.get(edge.source);
      const target = nodeById.get(edge.target);
      if (!source || !target) continue;
      const from = worldToScreen(source);
      const to = worldToScreen(target);
      const connected = Boolean(selectedId && (edge.source === selectedId || edge.target === selectedId));
      const hovered = graphPairKey(edge.source, edge.target) === hoveredEdgeKey;
      const active = viewMode === "path" || connected || hovered;
      const alpha = active ? (hovered ? 1 : 0.82) : 0.13;
      const color = active ? PALETTE.entity : PALETTE.muted;
      const width = (hovered ? 3 : active ? 1.7 : Math.min(1.5, 0.55 + Math.log2(1 + edge.weight) * 0.35)) * settings.linkThickness;
      context.save();
      context.globalAlpha = alpha;
      context.strokeStyle = color;
      context.lineWidth = width;
      const isDerived = (edge.kinds || []).every((kind) => ["mentions", "related", "supports", "path_next"].includes(kind));
      if (isDerived) context.setLineDash([5, 6]);
      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.stroke();
      context.restore();
      if (settings.showArrows) {
        if (["forward", "both"].includes(edge.direction)) drawArrowhead(from, to, nodeRadius(target), color, alpha, width);
        if (["reverse", "both"].includes(edge.direction)) drawArrowhead(to, from, nodeRadius(source), color, alpha, width);
      }
    }

    const labels = [];
    const nodeBounds = [];
    const textVisibility = clamp((camera.zoom - settings.textFade * 1.5 + 0.35) / 0.55, 0, 1);
    for (const node of renderedNodes()) {
      const point = worldToScreen(node);
      const radius = nodeRadius(node);
      if (point.x < -radius * 2 || point.y < -radius * 2 || point.x > viewport.width + radius * 2 || point.y > viewport.height + radius * 2) continue;
      const selected = node.id === selectedId;
      const hovered = node.id === hoveredId;
      const withinBeam = viewMode === "path" || !selectedId || selected || neighbors?.has(node.id);
      const color = nodeColor(node);
      context.save();
      context.globalAlpha = withinBeam ? 1 : 0.11;
      if ((selected || hovered) && !reduceMotion) {
        context.shadowColor = color;
        context.shadowBlur = selected ? 22 : 14;
      }
      traceNode(node, point, radius + (selected ? 2.5 : hovered ? 1.5 : 0));
      context.fillStyle = selected || node.category === "missing" ? PALETTE.raised : color;
      context.fill();
      context.lineWidth = selected ? 2.5 : node.category === "missing" ? 1.8 : 1;
      context.strokeStyle = selected || node.category === "missing" ? color : "rgba(231,255,233,0.62)";
      context.stroke();
      context.restore();
      const visualRadius = radius + (selected ? 2.5 : hovered ? 1.5 : 0);
      nodeBounds.push({
        id: node.id,
        left: point.x - visualRadius,
        right: point.x + visualRadius,
        top: point.y - visualRadius * 1.15,
        bottom: point.y + visualRadius * 1.15
      });
      const compact = viewport.width < 560;
      const densityOffset = settings.textFade >= 0.4 ? 4 : settings.textFade <= 0.05 ? -4 : 0;
      const minimumDegree = selectedId || viewMode === "path" ? 0 : Math.max(0, (camera.zoom >= 1.55 ? (compact ? 4 : 2) : (compact ? 8 : 6)) + densityOffset);
      if (selected || hovered || (textVisibility > 0.04 && withinBeam && node.degree >= minimumDegree)) {
        labels.push({ node, point, radius, selected, hovered });
      }
    }

    const densityLimit = settings.textFade >= 0.4 ? 0.55 : settings.textFade <= 0.05 ? 1.7 : 1;
    const labelLimit = Math.round((viewport.width < 560 ? (selectedId ? 14 : 10) : (selectedId ? 32 : 36)) * densityLimit);
    const labelPriority = (label) => Number(label.selected) * 10000 + Number(label.hovered) * 9000 + label.node.degree;
    const occupied = [];
    const visibleLabels = [];
    const intersects = (first, second, horizontal = 0, vertical = horizontal) => first.left < second.right + horizontal
      && first.right + horizontal > second.left && first.top < second.bottom + vertical && first.bottom + vertical > second.top;
    labels.sort((a, b) => labelPriority(b) - labelPriority(a) || a.node.title.localeCompare(b.node.title, "ko"));
    for (const label of labels) {
      const { node, point, radius, selected, hovered } = label;
      const text = node.title.length > 27 ? `${node.title.slice(0, 26)}…` : node.title;
      const fontSize = selected ? 12 : 10;
      const font = `${selected || hovered ? 700 : 500} ${fontSize}px "D2Coding", monospace`;
      context.font = font;
      const textWidth = Math.ceil(context.measureText(text).width);
      const important = selected || hovered;
      if (!important && visibleLabels.length >= labelLimit) continue;
      const preferredAlign = point.x > viewport.width * 0.68 ? "right" : "left";
      const placements = [
        { align: preferredAlign, x: point.x + (preferredAlign === "right" ? -radius - 7 : radius + 7), y: point.y },
        { align: preferredAlign === "right" ? "left" : "right", x: point.x + (preferredAlign === "right" ? radius + 7 : -radius - 7), y: point.y },
        { align: "center", x: point.x, y: point.y - radius - fontSize - 4 },
        { align: "center", x: point.x, y: point.y + radius + fontSize + 4 }
      ].map((placement) => ({
        ...placement,
        box: {
          left: placement.align === "right" ? placement.x - textWidth : placement.align === "center" ? placement.x - textWidth / 2 : placement.x,
          right: placement.align === "right" ? placement.x : placement.align === "center" ? placement.x + textWidth / 2 : placement.x + textWidth,
          top: placement.y - fontSize * 0.75,
          bottom: placement.y + fontSize * 0.75
        }
      }));
      const placement = placements.find((candidate) => candidate.box.left >= 4 && candidate.box.right <= viewport.width - 4
        && candidate.box.top >= 4 && candidate.box.bottom <= viewport.height - 4
        && !occupied.some((other) => intersects(candidate.box, other, 5, 3))
        && !nodeBounds.some((other) => other.id !== node.id && intersects(candidate.box, other, 3, 2)))
        || (important ? placements[0] : null);
      if (!placement) continue;
      occupied.push(placement.box);
      visibleLabels.push({ ...label, text, font, align: placement.align, x: placement.x, y: placement.y });
    }

    visibleLabels.sort((a, b) => labelPriority(a) - labelPriority(b));
    for (const { node, selected, hovered, text, font, align, x, y } of visibleLabels) {
      context.save();
      context.font = font;
      context.textAlign = align;
      context.textBaseline = "middle";
      context.fillStyle = selected ? nodeColor(node) : PALETTE.text;
      context.globalAlpha = selected || hovered ? 1 : 0.8 * textVisibility;
      context.fillText(text, x, y);
      context.restore();
    }
  }

  function topologyForSettings() {
    const include = (node) => {
      if (node.category === "tags") return settings.showTags;
      if (node.category === "attachments") return settings.showAttachments;
      if (node.category === "missing") return !settings.existingOnly;
      return !settings.existingOnly || node.exists !== false;
    };
    const nodes = allNodes.filter(include);
    const ids = new Set(nodes.map((node) => node.id));
    return { nodes, edges: allEdges.filter((edge) => ids.has(edge.source) && ids.has(edge.target)), ids };
  }

  function updateDegrees() {
    for (const node of topologyNodes) node.degree = adjacency.get(node.id)?.size || 0;
  }

  function edgeBetween(leftId, rightId) {
    const key = graphPairKey(leftId, rightId);
    return topologyEdges.find((edge) => graphPairKey(edge.source, edge.target) === key) || null;
  }

  function refreshSemanticLayout() {
    semanticPositions = new Map();
    overviewClusters = [];
    overviewCorridors = [];
    focusSectors = [];
    if (isOverviewScene()) {
      const overview = createClusterOverviewLayout(visibleNodes, visibleEdges);
      semanticPositions = overview.positions;
      overviewClusters = overview.clusters;
      overviewCorridors = overview.corridors;
      return;
    }
    if (viewMode === "focus" && selectedId) {
      const selected = nodeById.get(selectedId);
      const neighbors = visibleNodes.filter((node) => node.id !== selectedId);
      const focus = createFocusedOrbitLayout(selected, neighbors, visibleEdges);
      semanticPositions = focus.positions;
      focusSectors = focus.sectors;
      return;
    }
    if (viewMode === "path" && pathNodeIds.length >= 2) {
      const vertical = viewport.width < 680;
      pathNodeIds.forEach((id, index) => {
        const offset = (index - (pathNodeIds.length - 1) / 2) * (vertical ? 168 : 238);
        semanticPositions.set(id, vertical ? { x: 0, y: offset } : { x: offset, y: 0 });
      });
    }
  }

  function positionedVisibleNodes() {
    return visibleNodes.map((node) => positioned(node));
  }

  function updateTrail() {
    if (!trail) return;
    if (viewMode === "overview") {
      trail.textContent = `전체 지식 · ${overviewClusters.length}개 주제 군집`;
      return;
    }
    if (viewMode === "focus") {
      const node = nodeById.get(selectedId);
      trail.textContent = node ? `전체 지식 > ${node.title}` : "선택할 문서를 검색하거나 그래프에서 고르세요.";
      return;
    }
    const start = nodeById.get(pathStartId);
    const end = nodeById.get(pathEndId);
    trail.textContent = !start
      ? "경로의 첫 문서를 선택하세요."
      : !end
        ? `${start.title} > 두 번째 문서를 선택하세요.`
        : pathNodeIds.length
          ? `${start.title} > ${end.title} · ${pathNodeIds.length - 1}단계`
          : `${start.title} > ${end.title} · 연결 경로 없음`;
  }

  function syncModeButtons() {
    for (const button of modeButtons) button.setAttribute("aria-pressed", String(button.dataset.graphMode === viewMode));
    root.dataset.graphMode = viewMode;
    updateTrail();
  }

  function refitSelected() {
    const selected = positioned(nodeById.get(selectedId));
    if (!selected || !topologyIds.has(selected.id)) return false;
    const neighbors = visibleNodes.filter((node) => node.id !== selected.id).map((node) => positioned(node));
    const padding = Math.max(42, Math.min(92, Math.min(viewport.width, viewport.height) * 0.11)) + 16 * settings.nodeSize;
    camera = fitFocusedGraphCamera(selected, neighbors, viewport, padding);
    return true;
  }

  function recomputeVisibility({ fit = false } = {}) {
    const candidateIds = computeVisibleGraphNodeIds(topologyNodes, adjacency, {
      activeFilter,
      fileQuery: settings.fileQuery,
      showOrphans: settings.showOrphans,
      selectedId
    });
    if (viewMode === "focus" && selectedId) {
      candidateIds.clear();
      candidateIds.add(selectedId);
      for (const neighborId of adjacency.get(selectedId) || []) candidateIds.add(neighborId);
    } else if (viewMode === "path" && pathNodeIds.length >= 2) {
      candidateIds.clear();
      for (const id of pathNodeIds) candidateIds.add(id);
    }
    visibleIds = candidateIds;
    visibleNodes = topologyNodes.filter((node) => visibleIds.has(node.id));
    visibleEdges = topologyEdges.filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target));
    if (viewMode === "path" && pathNodeIds.length >= 2) {
      const pathPairs = new Set(pathNodeIds.slice(1).map((id, index) => graphPairKey(pathNodeIds[index], id)));
      visibleEdges = visibleEdges.filter((edge) => pathPairs.has(graphPairKey(edge.source, edge.target)));
    }
    refreshSemanticLayout();
    if (keyboardNodeId && !visibleIds.has(keyboardNodeId)) keyboardNodeId = "";
    if (selectedId) updateInspector(nodeById.get(selectedId));
    if (fit) {
      if (viewMode === "focus" && selectedId && autoFocus) refitSelected();
      else camera = fitGraphCamera(positionedVisibleNodes(), viewport);
    }
    updateTrail();
    if (searchResults && !searchResults.hidden) renderSuggestions();
    scheduleDraw();
  }

  function applyLayout(layoutNodes) {
    const positions = new Map(layoutNodes.map((node) => [node.id, node]));
    allNodes = allNodes.map((node) => {
      const positioned = positions.get(node.id);
      return positioned ? { ...node, x: positioned.x, y: positioned.y } : node;
    });
    nodeById = new Map(allNodes.map((node) => [node.id, node]));
    topologyNodes = topologyNodes.map((node) => nodeById.get(node.id)).filter(Boolean);
    updateDegrees();
    recomputeVisibility({ fit: true });
  }

  function layoutOptions() {
    return {
      iterations: reduceMotion ? 150 : 190,
      centerForce: settings.centerForce,
      repelForce: settings.repelForce,
      linkForce: settings.linkForce,
      linkDistance: settings.linkDistance
    };
  }

  function requestLayout() {
    const generation = ++layoutGeneration;
    activeWorker?.terminate?.();
    activeWorker = null;
    const nodes = topologyNodes.map((node) => ({ ...node }));
    const edges = topologyEdges.map((edge) => ({ ...edge }));
    const fallback = () => {
      if (generation !== layoutGeneration) return;
      applyLayout(createDeterministicLayout(nodes, edges, layoutOptions()));
    };
    if (typeof ownerWindow.Worker !== "function") {
      fallback();
      return;
    }
    try {
      const workerUrl = new URL("./knowledge-graph-worker.js", import.meta.url);
      workerUrl.searchParams.set("v", ownerWindow.CS_WIKI_ASSET_VERSION || new URL(import.meta.url).searchParams.get("v") || "1");
      const worker = new ownerWindow.Worker(workerUrl, { type: "module" });
      activeWorker = worker;
      const timeout = ownerWindow.setTimeout(() => {
        if (generation !== layoutGeneration) return;
        worker.terminate();
        activeWorker = null;
        fallback();
      }, 10000);
      worker.addEventListener("message", (event) => {
        if (event.data?.id !== generation) return;
        ownerWindow.clearTimeout(timeout);
        worker.terminate();
        activeWorker = null;
        if (event.data.ok && Array.isArray(event.data.nodes)) applyLayout(event.data.nodes);
        else fallback();
      });
      worker.addEventListener("error", () => {
        ownerWindow.clearTimeout(timeout);
        worker.terminate();
        activeWorker = null;
        fallback();
      }, { once: true });
      worker.postMessage({
        id: generation,
        moduleUrl: import.meta.url,
        nodes,
        edges,
        options: layoutOptions()
      });
    } catch {
      fallback();
    }
  }

  function scheduleLayout() {
    ownerWindow.clearTimeout(layoutTimer);
    layoutTimer = ownerWindow.setTimeout(requestLayout, 180);
  }

  function rebuildTopology({ relayout = false, fit = true } = {}) {
    const topology = topologyForSettings();
    topologyNodes = topology.nodes;
    topologyEdges = topology.edges;
    topologyIds = topology.ids;
    adjacency = createGraphAdjacency(topologyNodes, topologyEdges);
    updateDegrees();
    if (selectedId && !topologyIds.has(selectedId)) {
      selectedId = "";
      updateInspector(null);
    }
    recomputeVisibility({ fit });
    if (relayout) scheduleLayout();
  }

  function localPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function hitNode(point) {
    let best = null;
    let bestDistance = Infinity;
    for (const node of renderedNodes()) {
      const screen = worldToScreen(node);
      const distance = Math.hypot(screen.x - point.x, screen.y - point.y);
      const hitRadius = Math.max(13, nodeRadius(node) + 5);
      if (distance <= hitRadius && distance < bestDistance) {
        best = node;
        bestDistance = distance;
      }
    }
    return best;
  }

  function hitEdge(point) {
    if (isOverviewScene()) return null;
    let best = null;
    let bestDistance = 8;
    for (const edge of visibleEdges) {
      const from = worldToScreen(nodeById.get(edge.source));
      const to = worldToScreen(nodeById.get(edge.target));
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const lengthSquared = dx * dx + dy * dy;
      if (lengthSquared < 1) continue;
      const ratio = clamp(((point.x - from.x) * dx + (point.y - from.y) * dy) / lengthSquared, 0, 1);
      const distance = Math.hypot(point.x - (from.x + dx * ratio), point.y - (from.y + dy * ratio));
      if (distance < bestDistance) {
        best = edge;
        bestDistance = distance;
      }
    }
    return best;
  }

  function keyboardNodes() {
    return [...renderedNodes()].sort((left, right) => left.title.localeCompare(right.title, "ko") || left.id.localeCompare(right.id));
  }

  function showKeyboardNode(node) {
    if (!node) return;
    keyboardNodeId = node.id;
    hoveredId = node.id;
    const point = worldToScreen(node);
    const margin = 48;
    if (point.x < margin || point.x > viewport.width - margin || point.y < margin || point.y > viewport.height - margin) {
      const position = positioned(node);
      camera.x = finite(position.x);
      camera.y = finite(position.y);
    }
    announce(`${node.title} · 직접 연결 ${adjacency.get(node.id)?.size || 0}개 · Enter로 선택`);
    scheduleDraw();
  }

  function updateInspector(node) {
    if (!inspector) return;
    inspector.hidden = !node;
    if (!node) return;
    if (inspectorRelation) inspectorRelation.hidden = true;
    const neighborNodes = [...(adjacency.get(node.id) || [])]
      .map((id) => nodeById.get(id)).filter(Boolean)
      .sort((a, b) => b.degree - a.degree || a.title.localeCompare(b.title, "ko"));
    if (inspectorKind) inspectorKind.textContent = categoryLabel(node.category);
    if (inspectorTitle) inspectorTitle.textContent = node.title;
    if (inspectorSummary) inspectorSummary.textContent = node.summary || "요약이 아직 없습니다.";
    if (inspectorDegree) inspectorDegree.textContent = `${neighborNodes.length}개 직접 연결`;
    if (inspectorLink) {
      const href = safeHref(node.url, ownerWindow);
      const linkable = href !== "#";
      inspectorLink.hidden = !linkable;
      if (linkable) {
        inspectorLink.href = href;
        inspectorLink.removeAttribute("aria-disabled");
      } else {
        inspectorLink.removeAttribute("href");
        inspectorLink.setAttribute("aria-disabled", "true");
      }
    }
    if (inspectorNeighbors) {
      inspectorNeighbors.replaceChildren();
      if (!neighborNodes.length) {
        const empty = document.createElement("span");
        empty.textContent = "직접 연결 없음";
        inspectorNeighbors.append(empty);
      }
      for (const neighbor of neighborNodes) {
        const edge = edgeBetween(node.id, neighbor.id);
        const button = document.createElement("button");
        button.type = "button";
        button.className = "graph-neighbor";
        const relation = document.createElement("span");
        relation.textContent = RELATION_SECTORS[relationSector(edge)]?.label || "근거 · 연관";
        const title = document.createElement("strong");
        title.textContent = neighbor.title;
        button.append(relation, title);
        button.dataset.nodeId = neighbor.id;
        button.addEventListener("click", () => selectNode(neighbor.id));
        inspectorNeighbors.append(button);
      }
    }
  }

  function showRelationInspector(edge) {
    if (!edge) return;
    const source = nodeById.get(edge.source);
    const target = nodeById.get(edge.target);
    if (!source || !target) return;
    const owner = nodeById.get(selectedId) || source;
    updateInspector(owner);
    if (!inspectorRelation) return;
    inspectorRelation.hidden = false;
    if (inspectorRelationTitle) inspectorRelationTitle.textContent = `${source.title} — ${target.title}`;
    if (inspectorRelationKinds) inspectorRelationKinds.textContent = (edge.kinds || [])
      .map((kind) => RELATION_LABELS[kind] || kind).join(" · ") || "문서 관계";
    if (inspectorRelationDirection) inspectorRelationDirection.textContent = ({
      forward: `${source.title}에서 ${target.title} 방향`,
      reverse: `${target.title}에서 ${source.title} 방향`,
      both: "양방향 관계",
      none: "방향 없는 관계"
    })[edge.direction] || "방향 없는 관계";
    const relation = (edge.relations || []).find((item) => item.origin === "curated")
      || (edge.relations || []).find((item) => item.note)
      || edge.relations?.[0];
    if (inspectorRelationNote) {
      inspectorRelationNote.hidden = !relation?.note;
      inspectorRelationNote.textContent = relation?.note || "";
    }
    if (inspectorRelationEvidence) {
      const list = inspectorRelationEvidence.querySelector("div");
      list?.replaceChildren();
      for (const evidence of relation?.evidence || []) {
        const href = safeHref(evidence.url, ownerWindow);
        const item = document.createElement(href === "#" ? "span" : "a");
        item.textContent = evidence.title;
        if (href !== "#") item.href = href;
        list?.append(item);
      }
      inspectorRelationEvidence.hidden = !(relation?.evidence || []).length;
    }
    announce(`${source.title}와 ${target.title}의 연결을 선택했습니다.`);
  }

  function stopAnimation({ complete = true } = {}) {
    if (animationFrame) ownerWindow.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    animationVisibleIds = null;
    if (animate) {
      animate.setAttribute("aria-pressed", "false");
      animate.textContent = "재생";
    }
    if (animationProgress && complete) {
      animationProgress.value = 1;
      animationProgress.textContent = "100%";
    }
    scheduleDraw();
  }

  function choosePathNode(id) {
    const node = nodeById.get(id);
    if (!node || !topologyIds.has(id)) return false;
    if (!pathStartId || pathEndId) {
      pathStartId = id;
      pathEndId = "";
      pathNodeIds = [id];
      selectedId = id;
      announce(`${node.title}에서 시작합니다. 두 번째 문서를 선택하세요.`);
    } else if (id !== pathStartId) {
      pathEndId = id;
      pathNodeIds = shortestGraphPath(adjacency, pathStartId, pathEndId);
      selectedId = id;
      announce(pathNodeIds.length
        ? `${nodeById.get(pathStartId)?.title}에서 ${node.title}까지 ${pathNodeIds.length - 1}단계입니다.`
        : "두 문서를 잇는 경로를 찾지 못했습니다.");
    }
    keyboardNodeId = id;
    updateInspector(node);
    autoFocus = true;
    recomputeVisibility({ fit: true });
    return true;
  }

  function setViewMode(value) {
    const next = ["overview", "focus", "path"].includes(value) ? value : "overview";
    if (next === viewMode) return;
    viewMode = next;
    hoveredEdgeKey = "";
    if (viewMode === "overview") {
      selectedId = "";
      pathStartId = "";
      pathEndId = "";
      pathNodeIds = [];
      updateInspector(null);
    } else if (viewMode === "path") {
      selectedId = "";
      pathStartId = "";
      pathEndId = "";
      pathNodeIds = [];
      updateInspector(null);
    } else {
      pathStartId = "";
      pathEndId = "";
      pathNodeIds = [];
    }
    autoFocus = true;
    syncModeButtons();
    recomputeVisibility({ fit: true });
    announce(viewMode === "overview" ? "주제별 지식 군집을 표시합니다."
      : viewMode === "focus" ? "집중해서 볼 문서를 선택하세요."
        : "경로의 첫 문서를 선택하세요.");
  }

  function selectNode(id) {
    const node = nodeById.get(id);
    if (!node || !topologyIds.has(id)) return false;
    if (viewMode === "path") return choosePathNode(id);
    stopAnimation();
    viewMode = "focus";
    selectedId = id;
    keyboardNodeId = id;
    autoFocus = true;
    recomputeVisibility();
    refitSelected();
    updateInspector(nodeById.get(id));
    syncModeButtons();
    announce(`${node.title} 선택 · 직접 연결 ${adjacency.get(id)?.size || 0}개`);
    scheduleDraw();
    return true;
  }

  function clearSelection() {
    if (viewMode === "path") {
      pathStartId = "";
      pathEndId = "";
      pathNodeIds = [];
      selectedId = "";
      updateInspector(null);
      recomputeVisibility({ fit: true });
      announce("경로 선택을 초기화했습니다. 첫 문서를 선택하세요.");
      return;
    }
    if (!selectedId) return;
    selectedId = "";
    viewMode = "overview";
    autoFocus = false;
    updateInspector(null);
    syncModeButtons();
    recomputeVisibility({ fit: true });
    announce("노드 선택을 해제했습니다.");
  }

  function setZoom(nextZoom, anchor = { x: viewport.width / 2, y: viewport.height / 2 }) {
    const before = screenToWorld(anchor);
    camera.zoom = clamp(nextZoom, FOCUS_CAMERA_LIMITS.min, CAMERA_LIMITS.max);
    const after = screenToWorld(anchor);
    camera.x += before.x - after.x;
    camera.y += before.y - after.y;
    scheduleDraw();
  }

  function resetCamera() {
    autoFocus = true;
    if (viewMode !== "focus" || !selectedId || !refitSelected()) camera = fitGraphCamera(positionedVisibleNodes(), viewport);
    scheduleDraw();
    announce(viewMode === "focus" && selectedId ? "선택 문서와 직접 연결을 화면에 맞췄습니다." : `${visibleNodes.length}개 문서를 화면에 맞췄습니다.`);
  }

  function applyFilter(value) {
    activeFilter = ["concepts", "entities"].includes(value) ? value : "all";
    for (const button of filterButtons) {
      const pressed = (button.dataset.graphFilter || "all") === activeFilter;
      button.setAttribute("aria-pressed", String(pressed));
    }
    recomputeVisibility({ fit: true });
    announce(`${visibleNodes.length}개 노드를 표시합니다.`);
  }

  function clearSuggestions() {
    if (!searchResults) return;
    searchResults.replaceChildren();
    searchResults.hidden = true;
    suggestionIndex = -1;
    search?.setAttribute("aria-expanded", "false");
    search?.removeAttribute("aria-activedescendant");
  }

  function suggestionButtons() {
    return searchResults ? [...searchResults.querySelectorAll("[data-graph-result]")] : [];
  }

  function markSuggestion(index) {
    const buttons = suggestionButtons();
    if (!buttons.length) return;
    suggestionIndex = (index + buttons.length) % buttons.length;
    buttons.forEach((button, position) => button.setAttribute("aria-selected", String(position === suggestionIndex)));
    search?.setAttribute("aria-activedescendant", buttons[suggestionIndex].id);
    buttons[suggestionIndex].scrollIntoView?.({ block: "nearest" });
  }

  function chooseSuggestion(node) {
    if (search) search.value = node.title;
    selectNode(node.id);
    clearSuggestions();
  }

  function renderSuggestions() {
    if (!searchResults || !search) return;
    searchResults.replaceChildren();
    search.removeAttribute("aria-activedescendant");
    const query = search.value;
    if (!query.trim()) {
      clearSuggestions();
      return;
    }
    const category = activeFilter === "all" ? "all" : activeFilter;
    const matches = graphSearchResults(topologyNodes, query, category, 8);
    if (!matches.length) {
      const empty = document.createElement("p");
      empty.className = "graph-search-empty";
      empty.textContent = "일치하는 노드가 없습니다.";
      searchResults.append(empty);
    } else {
      matches.forEach((node, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.id = `knowledge-graph-result-${index}`;
        button.tabIndex = -1;
        button.dataset.graphResult = node.id;
        button.setAttribute("role", "option");
        button.setAttribute("aria-selected", "false");
        const title = document.createElement("strong");
        title.textContent = node.title;
        const meta = document.createElement("span");
        meta.textContent = `${categoryLabel(node.category)} · 연결 ${node.degree}`;
        button.append(title, meta);
        button.addEventListener("pointerdown", (event) => event.preventDefault());
        button.addEventListener("click", () => chooseSuggestion(node));
        searchResults.append(button);
      });
    }
    searchResults.hidden = false;
    suggestionIndex = -1;
    search.setAttribute("aria-expanded", "true");
  }

  function setPanel(open) {
    if (!settingsPanel) return;
    settingsPanel.hidden = !open;
    settingsToggle?.setAttribute("aria-expanded", String(open));
    if (open) settingsClose?.focus();
    else settingsToggle?.focus();
  }

  function renderGroups() {
    if (!groupList) return;
    groupList.replaceChildren();
    settings.groups.forEach((group, index) => {
      const row = document.createElement("div");
      row.className = "knowledge-graph-group-row";
      row.dataset.graphGroup = group.id;
      const color = document.createElement("input");
      color.type = "color";
      color.value = group.color;
      color.dataset.graphGroupColor = "";
      color.setAttribute("aria-label", `${index + 1}번 그룹 색상`);
      const query = document.createElement("input");
      query.type = "search";
      query.value = group.query;
      query.placeholder = "검색식";
      query.dataset.graphGroupQuery = "";
      query.setAttribute("aria-label", `${index + 1}번 그룹 검색식`);
      const actions = document.createElement("div");
      actions.className = "knowledge-graph-group-actions";
      const action = (label, operation, disabled = false) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        button.dataset.graphGroupAction = operation;
        button.disabled = disabled;
        return button;
      };
      actions.append(action("위", "up", index === 0), action("아래", "down", index === settings.groups.length - 1), action("삭제", "remove"));
      row.append(color, query, actions);
      color.addEventListener("input", () => {
        settings.groups[index].color = validColor(color.value, group.color);
        saveSettings();
        scheduleDraw();
      });
      query.addEventListener("input", () => {
        settings.groups[index].query = query.value;
        saveSettings();
        scheduleDraw();
      });
      actions.addEventListener("click", (event) => {
        const operation = event.target.closest("[data-graph-group-action]")?.dataset.graphGroupAction;
        if (!operation) return;
        if (operation === "remove") settings.groups.splice(index, 1);
        else {
          const targetIndex = operation === "up" ? index - 1 : index + 1;
          if (targetIndex < 0 || targetIndex >= settings.groups.length) return;
          [settings.groups[index], settings.groups[targetIndex]] = [settings.groups[targetIndex], settings.groups[index]];
        }
        saveSettings();
        renderGroups();
        scheduleDraw();
      });
      groupList.append(row);
    });
  }

  function setControlValue(element, value) {
    if (element) element.value = String(value);
  }

  function updateSettingOutputs() {
    const values = {
      "text-fade": `${Math.round(settings.textFade * 100)}%`,
      "node-size": `${settings.nodeSize.toFixed(1)}배`,
      "link-thickness": `${settings.linkThickness.toFixed(1)}배`,
      "center-force": `${Math.round(settings.centerForce * 100)}%`,
      "repel-force": `${settings.repelForce.toFixed(2).replace(/0$/u, "")}배`,
      "link-force": `${Math.round(settings.linkForce * 100)}%`,
      "link-distance": `${settings.linkDistance.toFixed(2).replace(/0$/u, "")}배`
    };
    for (const [name, value] of Object.entries(values)) {
      const output = root.querySelector(`[data-setting-value="${name}"]`);
      if (output) output.textContent = value;
    }
  }

  function syncSettingsControls() {
    if (fileQuery) fileQuery.value = settings.fileQuery;
    if (toggleTags) toggleTags.checked = settings.showTags;
    if (toggleAttachments) toggleAttachments.checked = settings.showAttachments;
    if (toggleExistingOnly) toggleExistingOnly.checked = settings.existingOnly;
    if (toggleShowOrphans) toggleShowOrphans.checked = settings.showOrphans;
    if (toggleShowArrows) toggleShowArrows.checked = settings.showArrows;
    setControlValue(textFade, settings.textFade);
    setControlValue(nodeSize, settings.nodeSize);
    setControlValue(linkThickness, settings.linkThickness);
    setControlValue(centerForce, settings.centerForce);
    setControlValue(repelForce, settings.repelForce);
    setControlValue(linkForce, settings.linkForce);
    setControlValue(linkDistance, settings.linkDistance);
    updateSettingOutputs();
    renderGroups();
    const density = settings.textFade >= 0.4 ? "low" : settings.textFade <= 0.05 ? "high" : "medium";
    for (const button of densityButtons) button.setAttribute("aria-pressed", String(button.dataset.graphLabelDensity === density));
  }

  function setLabelDensity(value) {
    settings.textFade = value === "low" ? 0.45 : value === "high" ? 0 : 0.25;
    saveSettings();
    syncSettingsControls();
    scheduleDraw();
    announce(`레이블을 ${value === "low" ? "핵심 문서 중심으로" : value === "high" ? "많이" : "균형 있게"} 표시합니다.`);
  }

  function bindBoolean(element, key, { topology = false, fit = false } = {}) {
    element?.addEventListener("change", () => {
      settings[key] = element.checked;
      saveSettings();
      if (topology) rebuildTopology({ relayout: true });
      else if (fit) recomputeVisibility({ fit: true });
      else scheduleDraw();
      if (topology || fit) announceGraphState();
    });
  }

  function bindRange(element, key, { layout = false } = {}) {
    element?.addEventListener("input", () => {
      settings[key] = normalizeGraphSettings({ ...settings, [key]: element.value })[key];
      saveSettings();
      updateSettingOutputs();
      if (layout) scheduleLayout();
      else {
        if (selectedId && autoFocus && key === "nodeSize") refitSelected();
        scheduleDraw();
      }
    });
  }

  function animationTick(timestamp) {
    const progress = clamp((timestamp - animationStart) / 7000, 0, 1);
    const count = Math.min(animationOrder.length, Math.max(1, Math.ceil(animationOrder.length * progress)));
    animationVisibleIds = new Set(animationOrder.slice(0, count).map((node) => node.id));
    if (animationProgress) {
      animationProgress.value = progress;
      animationProgress.textContent = `${Math.round(progress * 100)}%`;
    }
    scheduleDraw();
    if (progress < 1) animationFrame = ownerWindow.requestAnimationFrame(animationTick);
    else {
      stopAnimation();
      announce("문서 생성 시간순 그래프 애니메이션을 마쳤습니다.");
    }
  }

  function startAnimation() {
    if (animationFrame) {
      stopAnimation({ complete: false });
      announce("그래프 애니메이션을 중지했습니다.");
      return;
    }
    if (reduceMotion) {
      stopAnimation();
      announce("동작 줄이기 설정에 따라 애니메이션 없이 전체 그래프를 표시합니다.");
      return;
    }
    selectedId = "";
    autoFocus = false;
    updateInspector(null);
    recomputeVisibility({ fit: true });
    animationOrder = [...visibleNodes].sort((left, right) => {
      const leftTime = Date.parse(left.created) || Number.MAX_SAFE_INTEGER;
      const rightTime = Date.parse(right.created) || Number.MAX_SAFE_INTEGER;
      return leftTime - rightTime || left.title.localeCompare(right.title, "ko") || left.id.localeCompare(right.id);
    });
    if (!animationOrder.length) return;
    animationVisibleIds = new Set();
    animationStart = ownerWindow.performance?.now?.() || Date.now();
    if (animate) {
      animate.setAttribute("aria-pressed", "true");
      animate.textContent = "중지";
    }
    if (animationProgress) animationProgress.value = 0;
    animationFrame = ownerWindow.requestAnimationFrame(animationTick);
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width || canvas.clientWidth || 1));
    const height = Math.max(1, Math.round(rect.height || canvas.clientHeight || 1));
    const dpr = clamp(ownerWindow.devicePixelRatio || 1, 1, 2);
    viewport = { width, height };
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    refreshSemanticLayout();
    if (!didFit) {
      camera = fitGraphCamera(positionedVisibleNodes(), viewport);
      didFit = true;
    } else if (viewMode === "focus" && selectedId && autoFocus) refitSelected();
    else if (viewMode === "path" && pathNodeIds.length >= 2 && autoFocus) camera = fitGraphCamera(positionedVisibleNodes(), viewport);
    scheduleDraw();
  }

  canvas.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    const point = localPoint(event);
    const node = hitNode(point);
    const edge = node ? null : hitEdge(point);
    const nodePosition = positioned(node);
    pointer = {
      id: event.pointerId,
      start: point,
      node,
      edge,
      nodeStart: node ? { x: nodePosition.x, y: nodePosition.y } : null,
      cameraStart: { ...camera },
      moved: false
    };
    canvas.setPointerCapture?.(event.pointerId);
    canvas.style.cursor = node ? "grabbing" : edge ? "pointer" : "move";
  });

  canvas.addEventListener("pointermove", (event) => {
    const point = localPoint(event);
    if (pointer?.id === event.pointerId) {
      const dx = point.x - pointer.start.x;
      const dy = point.y - pointer.start.y;
      if (Math.hypot(dx, dy) > 3) {
        pointer.moved = true;
        autoFocus = false;
      }
      if (pointer.node) {
        semanticPositions.set(pointer.node.id, {
          x: pointer.nodeStart.x + dx / camera.zoom,
          y: pointer.nodeStart.y + dy / camera.zoom
        });
      } else {
        camera.x = pointer.cameraStart.x - dx / camera.zoom;
        camera.y = pointer.cameraStart.y - dy / camera.zoom;
      }
      scheduleDraw();
      return;
    }
    const node = hitNode(point);
    const edge = node ? null : hitEdge(point);
    const next = node?.id || "";
    const nextEdge = edge ? graphPairKey(edge.source, edge.target) : "";
    if (next !== hoveredId || nextEdge !== hoveredEdgeKey) {
      hoveredId = next;
      hoveredEdgeKey = nextEdge;
      canvas.style.cursor = node || edge ? "pointer" : "grab";
      scheduleDraw();
    }
  });

  canvas.addEventListener("pointerup", (event) => {
    if (!pointer || pointer.id !== event.pointerId) return;
    if (!pointer.moved && pointer.node) selectNode(pointer.node.id);
    else if (!pointer.moved && pointer.edge) showRelationInspector(pointer.edge);
    canvas.releasePointerCapture?.(event.pointerId);
    pointer = null;
    canvas.style.cursor = hoveredId || hoveredEdgeKey ? "pointer" : "grab";
  });
  canvas.addEventListener("pointercancel", (event) => {
    if (!pointer || pointer.id !== event.pointerId) return;
    canvas.releasePointerCapture?.(event.pointerId);
    pointer = null;
    canvas.style.cursor = "grab";
  });
  canvas.addEventListener("pointerleave", () => {
    if (pointer) return;
    hoveredId = "";
    hoveredEdgeKey = "";
    canvas.style.cursor = "grab";
    scheduleDraw();
  });
  canvas.addEventListener("focus", () => {
    const ordered = keyboardNodes();
    const current = nodeById.get(selectedId || keyboardNodeId);
    showKeyboardNode(current && renderedIds().has(current.id)
      ? current
      : [...ordered].sort((left, right) => right.degree - left.degree || left.title.localeCompare(right.title, "ko"))[0]);
  });
  canvas.addEventListener("blur", () => {
    hoveredId = "";
    scheduleDraw();
  });
  canvas.addEventListener("keydown", (event) => {
    const ordered = keyboardNodes();
    if (["+", "="].includes(event.key)) {
      event.preventDefault();
      autoFocus = false;
      setZoom(camera.zoom * 1.28);
      return;
    }
    if (["-", "_"].includes(event.key)) {
      event.preventDefault();
      autoFocus = false;
      setZoom(camera.zoom / 1.28);
      return;
    }
    if (event.key === "0") {
      event.preventDefault();
      resetCamera();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      if (settingsPanel && !settingsPanel.hidden) setPanel(false);
      else clearSelection();
      return;
    }
    if (!ordered.length) return;
    const currentIndex = Math.max(0, ordered.findIndex((node) => node.id === keyboardNodeId));
    if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      let nextIndex = currentIndex;
      if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = ordered.length - 1;
      else nextIndex = (currentIndex + (["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1) + ordered.length) % ordered.length;
      showKeyboardNode(ordered[nextIndex]);
    } else if (event.key === "Enter" && keyboardNodeId) {
      event.preventDefault();
      selectNode(keyboardNodeId);
    }
  });
  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    autoFocus = false;
    setZoom(camera.zoom * Math.exp(-finite(event.deltaY) * 0.0014), localPoint(event));
  }, { passive: false });

  search?.setAttribute("role", "combobox");
  search?.setAttribute("aria-autocomplete", "list");
  search?.setAttribute("aria-expanded", "false");
  searchResults?.setAttribute("role", "listbox");
  search?.addEventListener("input", renderSuggestions);
  search?.addEventListener("focus", renderSuggestions);
  search?.addEventListener("blur", () => ownerWindow.setTimeout(clearSuggestions, 80));
  search?.addEventListener("keydown", (event) => {
    const buttons = suggestionButtons();
    if (event.key === "ArrowDown" && buttons.length) {
      event.preventDefault();
      markSuggestion(suggestionIndex + 1);
    } else if (event.key === "ArrowUp" && buttons.length) {
      event.preventDefault();
      markSuggestion(suggestionIndex < 0 ? buttons.length - 1 : suggestionIndex - 1);
    } else if (event.key === "Enter" && buttons.length) {
      event.preventDefault();
      const index = suggestionIndex < 0 ? 0 : suggestionIndex;
      const node = nodeById.get(buttons[index]?.dataset.graphResult);
      if (node) chooseSuggestion(node);
    } else if (event.key === "Escape") clearSuggestions();
  });

  for (const button of modeButtons) button.addEventListener("click", () => setViewMode(button.dataset.graphMode || "overview"));
  for (const button of filterButtons) button.addEventListener("click", () => applyFilter(button.dataset.graphFilter || "all"));
  for (const button of densityButtons) button.addEventListener("click", () => setLabelDensity(button.dataset.graphLabelDensity || "medium"));
  zoomIn?.addEventListener("click", () => { autoFocus = false; setZoom(camera.zoom * 1.28); });
  zoomOut?.addEventListener("click", () => { autoFocus = false; setZoom(camera.zoom / 1.28); });
  reset?.addEventListener("click", resetCamera);
  settingsToggle?.addEventListener("click", () => setPanel(settingsPanel?.hidden !== false));
  settingsClose?.addEventListener("click", () => setPanel(false));
  settingsReset?.addEventListener("click", () => {
    settings = normalizeGraphSettings();
    saveSettings();
    syncSettingsControls();
    rebuildTopology({ relayout: true });
    announce("그래프 설정을 기본값으로 복원했습니다.");
  });
  root.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && settingsPanel && !settingsPanel.hidden && event.target !== canvas) {
      event.preventDefault();
      setPanel(false);
    }
  });
  fileQuery?.addEventListener("input", () => {
    settings.fileQuery = fileQuery.value;
    saveSettings();
    recomputeVisibility({ fit: true });
    announceGraphState();
  });
  bindBoolean(toggleTags, "showTags", { topology: true });
  bindBoolean(toggleAttachments, "showAttachments", { topology: true });
  bindBoolean(toggleExistingOnly, "existingOnly", { topology: true });
  bindBoolean(toggleShowOrphans, "showOrphans", { fit: true });
  bindBoolean(toggleShowArrows, "showArrows");
  bindRange(textFade, "textFade");
  bindRange(nodeSize, "nodeSize");
  bindRange(linkThickness, "linkThickness");
  bindRange(centerForce, "centerForce", { layout: true });
  bindRange(repelForce, "repelForce", { layout: true });
  bindRange(linkForce, "linkForce", { layout: true });
  bindRange(linkDistance, "linkDistance", { layout: true });
  groupAdd?.addEventListener("click", () => {
    const index = settings.groups.length;
    settings.groups.push({ id: `group-${Date.now()}-${index}`, query: "", color: GROUP_COLORS[index % GROUP_COLORS.length] });
    saveSettings();
    renderGroups();
    groupList?.querySelector("[data-graph-group-query]:last-of-type")?.focus();
  });
  animate?.addEventListener("click", startAnimation);

  const resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
  resizeObserver?.observe(canvas);
  if (!resizeObserver) ownerWindow.addEventListener("resize", resize);
  const intersectionObserver = typeof IntersectionObserver === "function"
    ? new IntersectionObserver((entries) => {
      inViewport = entries[0]?.isIntersecting ?? true;
      if (inViewport) scheduleDraw();
      else if (frame) {
        ownerWindow.cancelAnimationFrame(frame);
        frame = 0;
      }
    }, { threshold: 0.01 })
    : null;
  intersectionObserver?.observe(canvas);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) scheduleDraw();
  });

  syncSettingsControls();
  syncModeButtons();
  updateInspector(null);
  rebuildTopology({ relayout: settings.showTags || settings.showAttachments || !settings.existingOnly
    || settings.centerForce !== GRAPH_SETTINGS_DEFAULTS.centerForce
    || settings.repelForce !== GRAPH_SETTINGS_DEFAULTS.repelForce
    || settings.linkForce !== GRAPH_SETTINGS_DEFAULTS.linkForce
    || settings.linkDistance !== GRAPH_SETTINGS_DEFAULTS.linkDistance });
  resize();
  if (animationProgress) {
    animationProgress.value = 1;
    animationProgress.textContent = "100%";
  }
  announceGraphState();
}

if (typeof document !== "undefined") bootstrapKnowledgeGraph();
