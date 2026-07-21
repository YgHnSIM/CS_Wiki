const CATEGORY = Object.freeze({
  concepts: "concepts",
  concept: "concepts",
  entities: "entities",
  entity: "entities",
  people: "entities",
  person: "entities"
});

const PALETTE = Object.freeze({
  background: "#0a0014",
  raised: "#120021",
  concept: "#00ff41",
  entity: "#ffb000",
  text: "#e7ffe9",
  muted: "#8cb393"
});

const CAMERA_LIMITS = Object.freeze({ min: 0.24, max: 4.8 });

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
    byId.set(id, {
      id,
      title: String(raw?.title || id).trim() || id,
      url: String(raw?.url || "").trim(),
      category,
      summary: String(raw?.summary || "").trim(),
      status: String(raw?.status || "").trim(),
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
    edges.push({
      source,
      target,
      weight: clamp(finite(raw?.weight, 1), 0.15, 12),
      kinds: [...new Set((Array.isArray(raw?.kinds) ? raw.kinds : [raw?.kinds])
        .map((kind) => String(kind || "").trim()).filter(Boolean))]
    });
  }

  const nodes = [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));
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

/**
 * Produce stable force-directed world coordinates. The same graph always yields
 * the same coordinates, including when its input arrays arrive in a new order.
 */
export function createDeterministicLayout(nodes = [], edges = [], options = {}) {
  const iterations = clamp(Math.floor(finite(options.iterations, 180)), 0, 600);
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
        const force = Math.min(5.5, 7200 / distanceSquared) * cooling;
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
      const preferred = 112 - Math.min(30, Math.log2(1 + finite(edge.weight, 1)) * 9);
      const force = (distance - preferred) * 0.006 * Math.sqrt(finite(edge.weight, 1)) * cooling;
      const fx = dx / distance * force;
      const fy = dy / distance * force;
      source.vx += fx;
      source.vy += fy;
      target.vx -= fx;
      target.vy -= fy;
    }

    for (const node of layoutNodes) {
      node.vx += -node.x * 0.0018 * cooling;
      node.vy += -node.y * 0.0018 * cooling;
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

function safeHref(value, ownerWindow) {
  try {
    const url = new URL(value, ownerWindow.location.href);
    if (url.origin === ownerWindow.location.origin) return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    // Invalid or cross-origin content links stay inert.
  }
  return "#";
}

function bootstrapKnowledgeGraph() {
  const root = document.querySelector("[data-knowledge-graph]");
  if (!root) return;
  const dataElement = root.querySelector("#knowledge-graph-data") || document.querySelector("#knowledge-graph-data");
  const canvas = root.querySelector("[data-knowledge-graph-canvas]");
  if (!dataElement || !canvas || typeof canvas.getContext !== "function") return;
  const context = canvas.getContext("2d");
  if (!context) return;

  let payload;
  try {
    payload = normalizeKnowledgeGraph(JSON.parse(dataElement.textContent || "{}"));
  } catch {
    const status = root.querySelector("[data-graph-status]");
    if (status) status.textContent = "지식 그래프 데이터를 읽지 못했습니다.";
    return;
  }

  const ownerWindow = root.ownerDocument.defaultView || window;
  const reduceMotion = ownerWindow.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || false;
  const hasPrecomputedLayout = payload.nodes.every((node) => Number.isFinite(node.x) && Number.isFinite(node.y));
  const nodes = hasPrecomputedLayout
    ? payload.nodes.map((node) => ({ ...node }))
    : createDeterministicLayout(payload.nodes, payload.edges, { iterations: reduceMotion ? 150 : 190 });
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const adjacency = createGraphAdjacency(nodes, payload.edges);
  for (const node of nodes) node.degree = Math.max(node.degree, adjacency.get(node.id)?.size || 0);

  const search = root.querySelector("[data-graph-search]");
  const searchResults = root.querySelector("[data-graph-search-results]");
  const filterButtons = [...root.querySelectorAll("[data-graph-filter]")];
  const zoomIn = root.querySelector("[data-graph-zoom-in]");
  const zoomOut = root.querySelector("[data-graph-zoom-out]");
  const reset = root.querySelector("[data-graph-reset]");
  const status = root.querySelector("[data-graph-status]");
  const inspector = root.querySelector("[data-graph-inspector]");
  const inspectorKind = inspector?.querySelector("[data-inspector-kind]");
  const inspectorTitle = inspector?.querySelector("[data-inspector-title]");
  const inspectorSummary = inspector?.querySelector("[data-inspector-summary]");
  const inspectorDegree = inspector?.querySelector("[data-inspector-degree]");
  const inspectorNeighbors = inspector?.querySelector("[data-inspector-neighbors]");
  const inspectorLink = inspector?.querySelector("[data-inspector-link]");

  let viewport = { width: 1, height: 1 };
  let camera = { x: 0, y: 0, zoom: 1 };
  let selectedId = "";
  let hoveredId = "";
  let keyboardNodeId = "";
  let activeFilter = "all";
  let visibleNodes = nodes;
  let visibleIds = new Set(nodes.map((node) => node.id));
  let frame = 0;
  let inViewport = true;
  let didFit = false;
  let pointer = null;
  let suggestionIndex = -1;

  canvas.setAttribute("role", "application");
  canvas.setAttribute("aria-label", `개념과 인물 ${nodes.length}개를 연결한 지식 그래프. 방향키로 노드를 이동하고 Enter로 선택합니다.`);
  canvas.style.touchAction = "none";

  function announce(message) {
    if (status) status.textContent = message;
  }

  function scheduleDraw() {
    if (frame || document.hidden || !inViewport) return;
    frame = ownerWindow.requestAnimationFrame(() => {
      frame = 0;
      draw();
    });
  }

  function worldToScreen(node) {
    return {
      x: viewport.width / 2 + (node.x - camera.x) * camera.zoom,
      y: viewport.height / 2 + (node.y - camera.y) * camera.zoom
    };
  }

  function screenToWorld(point) {
    return {
      x: camera.x + (point.x - viewport.width / 2) / camera.zoom,
      y: camera.y + (point.y - viewport.height / 2) / camera.zoom
    };
  }

  function nodeRadius(node) {
    return 5.5 + Math.min(6.5, Math.sqrt(Math.max(0, node.degree)) * 1.25);
  }

  function traceNode(node, point, radius) {
    context.beginPath();
    if (node.category === "entities") {
      context.moveTo(point.x, point.y - radius * 1.15);
      context.lineTo(point.x + radius, point.y);
      context.lineTo(point.x, point.y + radius * 1.15);
      context.lineTo(point.x - radius, point.y);
      context.closePath();
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

  function draw() {
    context.clearRect(0, 0, viewport.width, viewport.height);
    context.fillStyle = PALETTE.background;
    context.fillRect(0, 0, viewport.width, viewport.height);
    drawGrid();
    const neighbors = selectedId ? adjacency.get(selectedId) || new Set() : null;

    for (const edge of payload.edges) {
      if (!visibleIds.has(edge.source) || !visibleIds.has(edge.target)) continue;
      const source = nodeById.get(edge.source);
      const target = nodeById.get(edge.target);
      const from = worldToScreen(source);
      const to = worldToScreen(target);
      const connected = selectedId && (edge.source === selectedId || edge.target === selectedId);
      context.save();
      context.globalAlpha = selectedId ? (connected ? 0.82 : 0.055) : 0.2;
      context.strokeStyle = connected ? PALETTE.entity : PALETTE.muted;
      context.lineWidth = connected ? 1.7 : Math.min(1.5, 0.55 + Math.log2(1 + edge.weight) * 0.35);
      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.stroke();
      context.restore();
    }

    const labels = [];
    const nodeBounds = [];
    for (const node of visibleNodes) {
      const point = worldToScreen(node);
      const radius = nodeRadius(node);
      if (point.x < -radius * 2 || point.y < -radius * 2 || point.x > viewport.width + radius * 2 || point.y > viewport.height + radius * 2) continue;
      const selected = node.id === selectedId;
      const hovered = node.id === hoveredId;
      const withinBeam = !selectedId || selected || neighbors?.has(node.id);
      const color = node.category === "entities" ? PALETTE.entity : PALETTE.concept;
      context.save();
      context.globalAlpha = withinBeam ? 1 : 0.11;
      if ((selected || hovered) && !reduceMotion) {
        context.shadowColor = color;
        context.shadowBlur = selected ? 22 : 14;
      }
      traceNode(node, point, radius + (selected ? 2.5 : hovered ? 1.5 : 0));
      context.fillStyle = selected ? PALETTE.raised : color;
      context.fill();
      context.lineWidth = selected ? 2.5 : 1;
      context.strokeStyle = selected ? color : "rgba(231,255,233,0.62)";
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
      const minimumDegree = selectedId
        ? 0
        : camera.zoom >= 1.55
          ? (compact ? 4 : 2)
          : (compact ? 8 : 6);
      if (selected || hovered || (withinBeam && node.degree >= minimumDegree)) {
        labels.push({ node, point, radius, selected, hovered });
      }
    }

    const labelLimit = viewport.width < 560 ? (selectedId ? 14 : 10) : (selectedId ? 32 : 36);
    const labelPriority = (label) => Number(label.selected) * 10000 + Number(label.hovered) * 9000 + label.node.degree;
    const occupied = [];
    const visibleLabels = [];
    const intersects = (first, second, horizontal = 0, vertical = horizontal) => first.left < second.right + horizontal
      && first.right + horizontal > second.left
      && first.top < second.bottom + vertical
      && first.bottom + vertical > second.top;
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
      const placement = placements.find((candidate) => candidate.box.left >= 4
        && candidate.box.right <= viewport.width - 4
        && candidate.box.top >= 4
        && candidate.box.bottom <= viewport.height - 4
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
      context.fillStyle = selected ? (node.category === "entities" ? PALETTE.entity : PALETTE.concept) : PALETTE.text;
      context.globalAlpha = selected || hovered ? 1 : 0.8;
      context.fillText(text, x, y);
      context.restore();
    }
  }

  function localPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function hitNode(point) {
    let best = null;
    let bestDistance = Infinity;
    for (const node of visibleNodes) {
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

  function keyboardNodes() {
    return [...visibleNodes].sort((left, right) => left.title.localeCompare(right.title, "ko") || left.id.localeCompare(right.id));
  }

  function showKeyboardNode(node) {
    if (!node) return;
    keyboardNodeId = node.id;
    hoveredId = node.id;
    const point = worldToScreen(node);
    const margin = 48;
    if (point.x < margin || point.x > viewport.width - margin || point.y < margin || point.y > viewport.height - margin) {
      camera.x = node.x;
      camera.y = node.y;
    }
    announce(`${node.title} · 직접 연결 ${[...(adjacency.get(node.id) || [])].filter((id) => visibleIds.has(id)).length}개 · Enter로 선택`);
    scheduleDraw();
  }

  function updateInspector(node) {
    if (!inspector) return;
    inspector.hidden = !node;
    if (!node) return;
    const neighborNodes = [...(adjacency.get(node.id) || [])]
      .filter((id) => visibleIds.has(id))
      .map((id) => nodeById.get(id)).filter(Boolean)
      .sort((a, b) => b.degree - a.degree || a.title.localeCompare(b.title, "ko"));
    if (inspectorKind) inspectorKind.textContent = node.category === "entities" ? "인물" : "개념";
    if (inspectorTitle) inspectorTitle.textContent = node.title;
    if (inspectorSummary) inspectorSummary.textContent = node.summary || "요약이 아직 없습니다.";
    if (inspectorDegree) inspectorDegree.textContent = `${neighborNodes.length}개 직접 연결`;
    if (inspectorLink) {
      inspectorLink.href = safeHref(node.url, ownerWindow);
      if (inspectorLink.href.endsWith("#")) inspectorLink.setAttribute("aria-disabled", "true");
      else inspectorLink.removeAttribute("aria-disabled");
    }
    if (inspectorNeighbors) {
      inspectorNeighbors.replaceChildren();
      if (!neighborNodes.length) {
        const empty = document.createElement("span");
        empty.textContent = "직접 연결 없음";
        inspectorNeighbors.append(empty);
      }
      for (const neighbor of neighborNodes.slice(0, 12)) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "graph-neighbor";
        button.textContent = neighbor.title;
        button.dataset.nodeId = neighbor.id;
        button.addEventListener("click", () => selectNode(neighbor.id, true));
        inspectorNeighbors.append(button);
      }
    }
  }

  function selectNode(id, focus = false) {
    const node = nodeById.get(id);
    if (!node || !visibleIds.has(id)) return false;
    selectedId = id;
    keyboardNodeId = id;
    updateInspector(node);
    const visibleNeighborCount = [...(adjacency.get(id) || [])].filter((neighborId) => visibleIds.has(neighborId)).length;
    announce(`${node.title} 선택 · 직접 연결 ${visibleNeighborCount}개`);
    if (focus) {
      camera.x = node.x;
      camera.y = node.y;
      camera.zoom = Math.max(camera.zoom, 1.25);
    }
    scheduleDraw();
    return true;
  }

  function setZoom(nextZoom, anchor = { x: viewport.width / 2, y: viewport.height / 2 }) {
    const before = screenToWorld(anchor);
    camera.zoom = clamp(nextZoom, CAMERA_LIMITS.min, CAMERA_LIMITS.max);
    const after = screenToWorld(anchor);
    camera.x += before.x - after.x;
    camera.y += before.y - after.y;
    scheduleDraw();
  }

  function resetCamera() {
    camera = fitGraphCamera(visibleNodes, viewport);
    scheduleDraw();
    announce(`${visibleNodes.length}개 노드를 화면에 맞췄습니다.`);
  }

  function applyFilter(value) {
    activeFilter = ["concepts", "entities"].includes(value) ? value : "all";
    visibleNodes = activeFilter === "all" ? nodes : nodes.filter((node) => node.category === activeFilter);
    visibleIds = new Set(visibleNodes.map((node) => node.id));
    for (const button of filterButtons) {
      const pressed = (button.dataset.graphFilter || "all") === activeFilter;
      button.setAttribute("aria-pressed", String(pressed));
    }
    if (selectedId && !visibleIds.has(selectedId)) {
      selectedId = "";
      updateInspector(null);
    } else if (selectedId) {
      updateInspector(nodeById.get(selectedId));
    }
    if (keyboardNodeId && !visibleIds.has(keyboardNodeId)) keyboardNodeId = "";
    renderSuggestions();
    resetCamera();
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
    clearSuggestions();
    selectNode(node.id, true);
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
    const matches = graphSearchResults(nodes, query, activeFilter, 8);
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
        meta.textContent = `${node.category === "entities" ? "인물" : "개념"} · 연결 ${node.degree}`;
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
    if (!didFit) {
      camera = fitGraphCamera(visibleNodes, viewport);
      didFit = true;
    }
    scheduleDraw();
  }

  canvas.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    const point = localPoint(event);
    const node = hitNode(point);
    pointer = {
      id: event.pointerId,
      start: point,
      previous: point,
      node,
      nodeStart: node ? { x: node.x, y: node.y } : null,
      cameraStart: { ...camera },
      moved: false
    };
    canvas.setPointerCapture?.(event.pointerId);
    canvas.style.cursor = node ? "grabbing" : "move";
  });

  canvas.addEventListener("pointermove", (event) => {
    const point = localPoint(event);
    if (pointer?.id === event.pointerId) {
      const dx = point.x - pointer.start.x;
      const dy = point.y - pointer.start.y;
      if (Math.hypot(dx, dy) > 3) pointer.moved = true;
      if (pointer.node) {
        pointer.node.x = pointer.nodeStart.x + dx / camera.zoom;
        pointer.node.y = pointer.nodeStart.y + dy / camera.zoom;
      } else {
        camera.x = pointer.cameraStart.x - dx / camera.zoom;
        camera.y = pointer.cameraStart.y - dy / camera.zoom;
      }
      pointer.previous = point;
      scheduleDraw();
      return;
    }
    const node = hitNode(point);
    const next = node?.id || "";
    if (next !== hoveredId) {
      hoveredId = next;
      canvas.style.cursor = node ? "pointer" : "grab";
      scheduleDraw();
    }
  });

  canvas.addEventListener("pointerup", (event) => {
    if (!pointer || pointer.id !== event.pointerId) return;
    if (!pointer.moved && pointer.node) selectNode(pointer.node.id);
    canvas.releasePointerCapture?.(event.pointerId);
    pointer = null;
    canvas.style.cursor = hoveredId ? "pointer" : "grab";
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
    canvas.style.cursor = "grab";
    scheduleDraw();
  });

  canvas.addEventListener("focus", () => {
    const ordered = keyboardNodes();
    const current = nodeById.get(selectedId || keyboardNodeId);
    showKeyboardNode(current && visibleIds.has(current.id)
      ? current
      : [...ordered].sort((left, right) => right.degree - left.degree || left.title.localeCompare(right.title, "ko"))[0]);
  });

  canvas.addEventListener("blur", () => {
    hoveredId = "";
    scheduleDraw();
  });

  canvas.addEventListener("keydown", (event) => {
    const ordered = keyboardNodes();
    if (!ordered.length) return;
    const currentIndex = Math.max(0, ordered.findIndex((node) => node.id === keyboardNodeId));
    if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      let nextIndex = currentIndex;
      if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = ordered.length - 1;
      else nextIndex = (currentIndex + (["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1) + ordered.length) % ordered.length;
      showKeyboardNode(ordered[nextIndex]);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (keyboardNodeId) selectNode(keyboardNodeId, true);
    } else if (event.key === "Escape" && selectedId) {
      event.preventDefault();
      selectedId = "";
      updateInspector(null);
      announce("노드 선택을 해제했습니다.");
      scheduleDraw();
    }
  });

  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
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
    } else if (event.key === "Escape") {
      clearSuggestions();
    }
  });

  for (const button of filterButtons) {
    button.addEventListener("click", () => applyFilter(button.dataset.graphFilter || "all"));
  }
  zoomIn?.addEventListener("click", () => setZoom(camera.zoom * 1.28));
  zoomOut?.addEventListener("click", () => setZoom(camera.zoom / 1.28));
  reset?.addEventListener("click", resetCamera);

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

  updateInspector(null);
  applyFilter("all");
  resize();
  announce(`개념과 인물 ${nodes.length}개, 연결 ${payload.edges.length}개를 표시합니다.`);
}

if (typeof document !== "undefined") bootstrapKnowledgeGraph();
