const DEFAULT_CAMERA = Object.freeze({ x: 0.5, y: 0.5, zoom: 1 });
const CAMERA_LIMITS = Object.freeze({ minZoom: 0.72, maxZoom: 10 });

export const ATLAS_DISPLAY_LIMITS = Object.freeze({
  nodes: 240,
  edges: 1500,
  labels: 40
});

const FAMILY_STYLES = Object.freeze({
  evidence: { lineDash: [], alpha: 0.72, color: "#00ff41" },
  supports: { lineDash: [], alpha: 0.72, color: "#00ff41" },
  learning: { lineDash: [10, 6], alpha: 0.68, color: "#ffb000" },
  path: { lineDash: [10, 6], alpha: 0.68, color: "#ffb000" },
  curated: { lineDash: [7, 4], alpha: 0.62, color: "#d8ffd9" },
  semantic: { lineDash: [7, 4], alpha: 0.62, color: "#d8ffd9" },
  related: { lineDash: [2, 5], alpha: 0.48, color: "#00ff41" },
  mentions: { lineDash: [1, 7], alpha: 0.3, color: "#8cb393" },
  default: { lineDash: [4, 5], alpha: 0.42, color: "#8cb393" }
});

function finite(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function validViewport(viewport) {
  return {
    width: Math.max(1, finite(viewport?.width, 1)),
    height: Math.max(1, finite(viewport?.height, 1)),
    padding: Math.max(0, finite(viewport?.padding, 28))
  };
}

export function normalizeAtlasCamera(camera = DEFAULT_CAMERA) {
  const zoom = clamp(finite(camera.zoom, DEFAULT_CAMERA.zoom), CAMERA_LIMITS.minZoom, CAMERA_LIMITS.maxZoom);
  // A small overscroll allowance keeps edge clusters reachable without letting
  // malformed input move the map indefinitely off-canvas.
  const reach = 0.5 / zoom + 0.08;
  return {
    x: clamp(finite(camera.x, DEFAULT_CAMERA.x), -reach, 1 + reach),
    y: clamp(finite(camera.y, DEFAULT_CAMERA.y), -reach, 1 + reach),
    zoom
  };
}

export function worldToScreen(point, camera, viewport) {
  const size = validViewport(viewport);
  const safeCamera = normalizeAtlasCamera(camera);
  const span = Math.max(1, Math.min(size.width, size.height) - size.padding * 2);
  return {
    x: size.width / 2 + (finite(point?.x, safeCamera.x) - safeCamera.x) * span * safeCamera.zoom,
    y: size.height / 2 + (finite(point?.y, safeCamera.y) - safeCamera.y) * span * safeCamera.zoom
  };
}

export function screenToWorld(point, camera, viewport) {
  const size = validViewport(viewport);
  const safeCamera = normalizeAtlasCamera(camera);
  const span = Math.max(1, Math.min(size.width, size.height) - size.padding * 2);
  return {
    x: safeCamera.x + (finite(point?.x, size.width / 2) - size.width / 2) / (span * safeCamera.zoom),
    y: safeCamera.y + (finite(point?.y, size.height / 2) - size.height / 2) / (span * safeCamera.zoom)
  };
}

export function zoomAtlasCamera(camera, factor, anchor, viewport) {
  const safeCamera = normalizeAtlasCamera(camera);
  const size = validViewport(viewport);
  const safeAnchor = {
    x: finite(anchor?.x, size.width / 2),
    y: finite(anchor?.y, size.height / 2)
  };
  const worldAnchor = screenToWorld(safeAnchor, safeCamera, size);
  const zoom = clamp(safeCamera.zoom * finite(factor, 1), CAMERA_LIMITS.minZoom, CAMERA_LIMITS.maxZoom);
  const span = Math.max(1, Math.min(size.width, size.height) - size.padding * 2);
  return normalizeAtlasCamera({
    x: worldAnchor.x - (safeAnchor.x - size.width / 2) / (span * zoom),
    y: worldAnchor.y - (safeAnchor.y - size.height / 2) / (span * zoom),
    zoom
  });
}

export function familyStrokeStyle(family) {
  const key = String(family || "default").toLowerCase();
  const source = FAMILY_STYLES[key] || FAMILY_STYLES.default;
  return { ...source, lineDash: [...source.lineDash] };
}

function safeNode(node) {
  if (!node || typeof node.id !== "string" || !node.id) return null;
  const x = Number(node.x);
  const y = Number(node.y);
  if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 1 || y < 0 || y > 1) return null;
  return {
    ...node,
    kind: node.kind === "cluster" ? "cluster" : "document",
    x,
    y,
    radius: clamp(finite(node.radius, node.kind === "cluster" ? 16 : 5), 2, 44),
    count: Math.max(0, finite(node.count, 0))
  };
}

function nodePriority(node, screen, viewport) {
  const centerDistance = Math.hypot(screen.x - viewport.width / 2, screen.y - viewport.height / 2);
  return (node.kind === "cluster" ? 1_000_000 : 0) + Math.min(node.count, 100_000) * 10 - centerDistance;
}

export function limitAtlasDisplay(view, camera, viewport, limits = ATLAS_DISPLAY_LIMITS) {
  const size = validViewport(viewport);
  const nodeLimit = clamp(Math.floor(finite(limits?.nodes, ATLAS_DISPLAY_LIMITS.nodes)), 0, ATLAS_DISPLAY_LIMITS.nodes);
  const edgeLimit = clamp(Math.floor(finite(limits?.edges, ATLAS_DISPLAY_LIMITS.edges)), 0, ATLAS_DISPLAY_LIMITS.edges);
  const labelLimit = clamp(Math.floor(finite(limits?.labels, ATLAS_DISPLAY_LIMITS.labels)), 0, ATLAS_DISPLAY_LIMITS.labels);
  const margin = 56;
  const candidates = (Array.isArray(view?.nodes) ? view.nodes : [])
    .map(safeNode)
    .filter(Boolean)
    .map((node) => ({ node, screen: worldToScreen(node, camera, size) }))
    .filter(({ screen, node }) => screen.x >= -margin - node.radius && screen.x <= size.width + margin + node.radius
      && screen.y >= -margin - node.radius && screen.y <= size.height + margin + node.radius)
    .sort((a, b) => nodePriority(b.node, b.screen, size) - nodePriority(a.node, a.screen, size)
      || a.node.id.localeCompare(b.node.id))
    .slice(0, nodeLimit);
  const nodeIds = new Set(candidates.map(({ node }) => node.id));
  const edges = (Array.isArray(view?.edges) ? view.edges : [])
    .filter((edge) => edge && typeof edge.id === "string" && nodeIds.has(edge.source) && nodeIds.has(edge.target))
    .sort((a, b) => finite(b.weight, b.count) - finite(a.weight, a.count) || a.id.localeCompare(b.id))
    .slice(0, edgeLimit);
  const adaptiveLabelLimit = Math.min(labelLimit, Math.max(8, Math.ceil(Math.sqrt(candidates.length) * 2.4)));
  const rankedLabels = candidates
    .slice()
    .sort((a, b) => (b.node.kind === "cluster") - (a.node.kind === "cluster")
      || b.node.count - a.node.count || a.node.id.localeCompare(b.node.id))
    .map(({ node }) => node);
  const nodesById = new Map(candidates.map(({ node }) => [node.id, node]));
  const preferredLabels = (Array.isArray(view?.labels) ? view.labels : []).map((id) => nodesById.get(id)).filter(Boolean);
  const labelNodes = [...new Map([...preferredLabels, ...rankedLabels].map((node) => [node.id, node])).values()].slice(0, adaptiveLabelLimit);
  return { nodes: candidates.map(({ node }) => node), edges, labelNodes };
}

export function hitTestAtlasNode(nodes, point, camera, viewport, tolerance = 5) {
  const size = validViewport(viewport);
  const px = finite(point?.x, Number.NaN);
  const py = finite(point?.y, Number.NaN);
  if (!Number.isFinite(px) || !Number.isFinite(py)) return null;
  let winner = null;
  let winnerDistance = Infinity;
  for (const source of Array.isArray(nodes) ? nodes : []) {
    const node = safeNode(source);
    if (!node) continue;
    const screen = worldToScreen(node, camera, size);
    const radius = node.radius * clamp(Math.sqrt(normalizeAtlasCamera(camera).zoom), 0.85, 1.8) + Math.max(0, finite(tolerance, 5));
    const distance = Math.hypot(px - screen.x, py - screen.y);
    if (distance <= radius && distance < winnerDistance) {
      winner = node;
      winnerDistance = distance;
    }
  }
  return winner;
}

function distanceToSegment(point, from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const lengthSquared = dx * dx + dy * dy;
  if (!lengthSquared) return Math.hypot(point.x - from.x, point.y - from.y);
  const projection = clamp(((point.x - from.x) * dx + (point.y - from.y) * dy) / lengthSquared, 0, 1);
  return Math.hypot(point.x - (from.x + projection * dx), point.y - (from.y + projection * dy));
}

function edgeThickness(edge, source, target) {
  const corridor = source.kind === "cluster" && target.kind === "cluster";
  return corridor
    ? clamp(1 + Math.log2(1 + Math.max(0, finite(edge.count, edge.weight))) * 0.9, 1.2, 9)
    : clamp(0.55 + Math.log2(1 + Math.max(0, finite(edge.weight, edge.count))) * 0.38, 0.7, 3.2);
}

function traceNodeShape(context, node, point, radius) {
  context.beginPath();
  if (node.kind === "cluster" || node.category === "concepts") {
    context.arc(point.x, point.y, radius, 0, Math.PI * 2);
    return;
  }
  if (node.category === "entities") {
    context.moveTo(point.x, point.y - radius);
    context.lineTo(point.x + radius, point.y);
    context.lineTo(point.x, point.y + radius);
    context.lineTo(point.x - radius, point.y);
    context.closePath();
    return;
  }
  if (node.category === "analyses") {
    for (let index = 0; index < 6; index += 1) {
      const angle = -Math.PI / 2 + index * Math.PI / 3;
      const x = point.x + Math.cos(angle) * radius;
      const y = point.y + Math.sin(angle) * radius;
      if (!index) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.closePath();
    return;
  }
  context.rect(point.x - radius * 0.82, point.y - radius * 0.82, radius * 1.64, radius * 1.64);
}

export function hitTestAtlasEdge(edges, nodes, point, camera, viewport, tolerance = 6) {
  const px = finite(point?.x, Number.NaN);
  const py = finite(point?.y, Number.NaN);
  if (!Number.isFinite(px) || !Number.isFinite(py)) return null;
  const size = validViewport(viewport);
  const nodesById = new Map((Array.isArray(nodes) ? nodes : []).map(safeNode).filter(Boolean).map((node) => [node.id, node]));
  let winner = null;
  let winnerDistance = Infinity;
  for (const edge of Array.isArray(edges) ? edges : []) {
    if (!edge || typeof edge.id !== "string" || !edge.id) continue;
    const source = nodesById.get(edge.source);
    const target = nodesById.get(edge.target);
    if (!source || !target) continue;
    const distance = distanceToSegment(
      { x: px, y: py },
      worldToScreen(source, camera, size),
      worldToScreen(target, camera, size)
    );
    const hitWidth = Math.max(0, finite(tolerance, 6)) + edgeThickness(edge, source, target) / 2;
    if (distance <= hitWidth && (distance < winnerDistance
      || (Math.abs(distance - winnerDistance) < 1e-9 && String(edge.id).localeCompare(String(winner?.id || "")) < 0))) {
      winner = { ...edge, kind: "edge" };
      winnerDistance = distance;
    }
  }
  return winner;
}

function roundedRadius(node, zoom) {
  return node.radius * clamp(Math.sqrt(zoom), 0.85, 1.8);
}

function trimLabel(value, max = 32) {
  const label = String(value || "").trim();
  return label.length > max ? `${label.slice(0, max - 1)}…` : label;
}

export function createAtlasRenderer(canvas, callbacks = {}) {
  if (!canvas || typeof canvas.getContext !== "function") throw new TypeError("A canvas element is required");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D context is unavailable");
  canvas.setAttribute("aria-hidden", "true");

  const ownerWindow = canvas.ownerDocument?.defaultView || globalThis.window;
  let view = { nodes: [], edges: [] };
  let camera = { ...DEFAULT_CAMERA };
  let selectionId = "";
  let hoverId = "";
  let viewport = { width: 1, height: 1, padding: 28 };
  let display = { nodes: [], edges: [], labelNodes: [] };
  let frame = 0;
  let destroyed = false;
  let drag = null;

  function scheduleDraw() {
    if (destroyed || frame) return;
    const raf = ownerWindow?.requestAnimationFrame?.bind(ownerWindow) || ((callback) => setTimeout(callback, 0));
    frame = raf(() => {
      frame = 0;
      draw();
    });
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width || canvas.clientWidth || 1));
    const height = Math.max(1, Math.round(rect.height || canvas.clientHeight || 1));
    const dpr = clamp(finite(ownerWindow?.devicePixelRatio, 1), 1, 2);
    viewport = { width, height, padding: Math.min(42, Math.max(20, Math.min(width, height) * 0.06)) };
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    scheduleDraw();
  }

  function draw() {
    display = limitAtlasDisplay(view, camera, viewport);
    context.clearRect(0, 0, viewport.width, viewport.height);
    const nodesById = new Map(display.nodes.map((node) => [node.id, node]));

    for (const edge of display.edges) {
      const source = nodesById.get(edge.source);
      const target = nodesById.get(edge.target);
      if (!source || !target) continue;
      const from = worldToScreen(source, camera, viewport);
      const to = worldToScreen(target, camera, viewport);
      const style = familyStrokeStyle(edge.dominantFamily || edge.families?.[0]);
      const active = edge.id === selectionId || edge.id === hoverId;
      const thickness = edgeThickness(edge, source, target);
      context.save();
      context.globalAlpha = active ? 0.94 : style.alpha;
      context.strokeStyle = active ? "#ffb000" : style.color;
      context.lineWidth = active ? thickness + 3 : thickness;
      context.setLineDash(style.lineDash);
      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.stroke();
      context.restore();
    }

    for (const node of display.nodes) {
      const point = worldToScreen(node, camera, viewport);
      const radius = roundedRadius(node, camera.zoom);
      const selected = node.id === selectionId;
      const hovered = node.id === hoverId;
      context.save();
      traceNodeShape(context, node, point, radius);
      context.fillStyle = node.kind === "cluster" ? "#120021" : "#0a0014";
      context.fill();
      context.lineWidth = selected ? 3 : hovered ? 2.2 : node.kind === "cluster" ? 1.5 : 1;
      context.strokeStyle = selected ? "#ffb000" : hovered ? "#00ff41" : node.kind === "cluster" ? "rgba(0,255,65,.78)" : "rgba(140,179,147,.72)";
      context.stroke();
      if (selected || hovered) {
        context.beginPath();
        context.arc(point.x, point.y, radius + 5, 0, Math.PI * 2);
        context.globalAlpha = selected ? 0.78 : 0.5;
        context.lineWidth = 1;
        context.strokeStyle = selected ? "#00ff41" : "#ffb000";
        context.stroke();
      }
      context.restore();
    }

    const visibleNodeIds = new Set(display.nodes.map((node) => node.id));
    const preferredLabelIds = [selectionId, hoverId]
      .filter((id) => visibleNodeIds.has(id))
      .concat(display.labelNodes.map((node) => node.id));
    const labelIds = new Set([...new Set(preferredLabelIds)].slice(0, ATLAS_DISPLAY_LIMITS.labels));
    for (const node of display.nodes) {
      if (!labelIds.has(node.id)) continue;
      const point = worldToScreen(node, camera, viewport);
      const selected = node.id === selectionId;
      context.save();
      context.font = `${node.kind === "cluster" ? 700 : 500} ${node.kind === "cluster" ? 12 : 10}px "D2Coding", monospace`;
      context.textBaseline = "middle";
      context.fillStyle = selected ? "#ffb000" : node.kind === "cluster" ? "#e7ffe9" : "#8cb393";
      context.fillText(trimLabel(node.title || node.label || node.id), point.x + roundedRadius(node, camera.zoom) + 7, point.y);
      context.restore();
    }
  }

  function localPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function notifyCamera() {
    callbacks.onCameraChange?.({ ...camera });
  }

  function onPointerDown(event) {
    if (event.button !== 0) return;
    const point = localPoint(event);
    drag = { pointerId: event.pointerId, point, camera: { ...camera }, moved: false };
    canvas.setPointerCapture?.(event.pointerId);
  }

  function onPointerMove(event) {
    const point = localPoint(event);
    if (drag && drag.pointerId === event.pointerId) {
      const dx = point.x - drag.point.x;
      const dy = point.y - drag.point.y;
      if (Math.hypot(dx, dy) > 3) drag.moved = true;
      const origin = screenToWorld({ x: viewport.width / 2 - dx, y: viewport.height / 2 - dy }, drag.camera, viewport);
      camera = normalizeAtlasCamera({ ...drag.camera, x: origin.x, y: origin.y });
      notifyCamera();
      scheduleDraw();
      return;
    }
    const hit = hitTestAtlasNode(display.nodes, point, camera, viewport)
      || hitTestAtlasEdge(display.edges, display.nodes, point, camera, viewport);
    const next = hit?.id || "";
    if (next !== hoverId) {
      hoverId = next;
      canvas.style.cursor = next ? "pointer" : "grab";
      callbacks.onHover?.(hit || null);
      scheduleDraw();
    }
  }

  function onPointerUp(event) {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const point = localPoint(event);
    if (!drag.moved) {
      const hit = hitTestAtlasNode(display.nodes, point, camera, viewport)
        || hitTestAtlasEdge(display.edges, display.nodes, point, camera, viewport);
      if (hit) callbacks.onActivate?.(hit);
    }
    canvas.releasePointerCapture?.(event.pointerId);
    drag = null;
  }

  function onPointerCancel(event) {
    if (!drag || drag.pointerId !== event.pointerId) return;
    canvas.releasePointerCapture?.(event.pointerId);
    drag = null;
  }

  function onPointerLeave() {
    if (drag || !hoverId) return;
    hoverId = "";
    canvas.style.cursor = "grab";
    callbacks.onHover?.(null);
    scheduleDraw();
  }

  function onWheel(event) {
    event.preventDefault();
    camera = zoomAtlasCamera(camera, Math.exp(-finite(event.deltaY, 0) * 0.0015), localPoint(event), viewport);
    notifyCamera();
    scheduleDraw();
  }

  const resizeObserver = typeof globalThis.ResizeObserver === "function" ? new ResizeObserver(resize) : null;
  resizeObserver?.observe(canvas);
  if (!resizeObserver) ownerWindow?.addEventListener?.("resize", resize);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerCancel);
  canvas.addEventListener("pointerleave", onPointerLeave);
  canvas.addEventListener("wheel", onWheel, { passive: false });
  resize();

  return {
    setView(nextView) {
      view = {
        nodes: Array.isArray(nextView?.nodes) ? nextView.nodes : [],
        edges: Array.isArray(nextView?.edges) ? nextView.edges : []
      };
      if (selectionId && !view.nodes.some((node) => node?.id === selectionId)) selectionId = "";
      scheduleDraw();
    },
    setSelection(id) {
      selectionId = typeof id === "string" ? id : "";
      scheduleDraw();
    },
    zoomBy(factor, anchor) {
      camera = zoomAtlasCamera(camera, factor, anchor, viewport);
      notifyCamera();
      scheduleDraw();
      return { ...camera };
    },
    resetCamera() {
      camera = { ...DEFAULT_CAMERA };
      notifyCamera();
      scheduleDraw();
      return { ...camera };
    },
    focusNode(id) {
      const node = safeNode(view.nodes.find((candidate) => candidate?.id === id));
      if (!node) return false;
      camera = normalizeAtlasCamera({ x: node.x, y: node.y, zoom: Math.max(camera.zoom, 2.4) });
      notifyCamera();
      scheduleDraw();
      return true;
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      resizeObserver?.disconnect();
      if (!resizeObserver) ownerWindow?.removeEventListener?.("resize", resize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerCancel);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("wheel", onWheel);
      if (frame) {
        ownerWindow?.cancelAnimationFrame?.(frame);
        clearTimeout(frame);
        frame = 0;
      }
    }
  };
}
