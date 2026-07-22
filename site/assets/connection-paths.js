const MODES = new Set(["explain", "concept", "evidence", "shortest"]);

function normalizedMode(value) {
  return MODES.has(value) ? value : "explain";
}

function pairKey(from, to) {
  return `${from}\u0000${to}`;
}

function edgeCost(edge, inverse, mode) {
  if (mode === "shortest") {
    return 1 + (edge.cost || 5) * 0.01 + (edge.kind === "mentions" ? 0.08 : 0);
  }
  if (mode === "concept") {
    if (edge.kind === "mentions" || edge.kind === "supports") return Number.POSITIVE_INFINITY;
    if (edge.origin === "curated") return 1;
    if (edge.kind === "path_next" || edge.family === "learning") return 2;
    if (edge.kind === "recommends" || edge.kind === "related") return 3;
    return 4;
  }
  if (mode === "evidence") {
    if (edge.kind === "mentions") return Number.POSITIVE_INFINITY;
    if (edge.kind === "supports" || edge.family === "evidence") return 1 + (inverse && edge.directed ? 0.2 : 0);
    if (edge.origin === "curated") return 1.25 + (inverse && edge.directed ? 0.2 : 0);
    if (edge.kind === "path_next" || edge.family === "learning") return 2.25 + (inverse && edge.directed ? 0.25 : 0);
    return 5.5;
  }
  let cost = edge.origin === "curated" ? 1
    : edge.kind === "path_next" ? 2
      : edge.kind === "recommends" || edge.kind === "related" ? 3
        : edge.kind === "supports" ? 2
          : edge.kind === "mentions" ? 12
            : edge.cost || 5;
  if (edge.kind === "related" && edge.reciprocal) cost -= 0.75;
  cost -= Math.min(0.75, Math.log2(1 + (edge.occurrences || 0)) * 0.2);
  if (inverse && edge.directed) {
    if (edge.kind === "path_next") cost += 1.5;
    else if (edge.kind === "mentions") cost += 0.5;
    else if (edge.kind !== "supports") cost += 1;
  }
  return Math.max(0.5, cost);
}

function intermediatePenalty(index, nodeId, mode) {
  const node = index.nodes.get(nodeId);
  if (!node || mode === "shortest" || mode === "evidence") return 0;
  const degree = index.adjacency.get(nodeId)?.length || 0;
  const degreePenalty = Math.max(0, Math.min(3, Math.log2(Math.max(1, degree) / 16)));
  const categoryPenalty = node.category === "sources" || node.category === "references"
    ? 4
    : node.category === "meta" ? 2 : 0;
  return degreePenalty + categoryPenalty + (node.status === "draft" ? 0.35 : 0);
}

function labelFor(graph, edge, inverse) {
  const legend = graph.legend?.[edge.kind];
  if (!legend) return edge.kind;
  return inverse && edge.directed ? legend.inverseLabel : legend.label;
}

function detailFor(index, edge) {
  const source = index.nodes.get(edge.source);
  const target = index.nodes.get(edge.target);
  const context = edge.contexts?.[0] || {};
  if (context.note) return context.note;
  if (edge.kind === "supports") {
    return `“${target?.title || edge.target}” 문서가 “${source?.title || edge.source}”를 근거로 등록했습니다.`;
  }
  if (edge.kind === "path_next") {
    const step = Number(context.step);
    const range = Number.isFinite(step) ? `${step}단계에서 ${step + 1}단계로` : "인접 단계로";
    return `‘${context.pathTitle || context.pathId || "학습 경로"}’에서 ${range} 이어집니다.`;
  }
  if (edge.kind === "related") {
    return edge.reciprocal
      ? "두 문서가 관련 항목에서 서로를 함께 읽을 대상으로 지정합니다."
      : "한 문서가 관련 항목에서 다른 문서를 함께 읽을 대상으로 지정합니다.";
  }
  if (edge.kind === "recommends") {
    return context.note || `“${source?.title || edge.source}”에서 “${target?.title || edge.target}”을 다음 읽을거리로 추천합니다.`;
  }
  if (edge.kind === "mentions") {
    const owner = index.nodes.get(context.pageId) || source;
    const excerpt = context.excerpt ? ` 문맥: ${context.excerpt}` : "";
    return `“${owner?.title || edge.source}”의 ‘${context.section || "본문"}’에서 직접 언급합니다.${excerpt}`;
  }
  return "위키 편집자가 두 문서 사이에 직접 기록한 관계입니다.";
}

function pushAdjacency(adjacency, from, to, edge, inverse) {
  if (!adjacency.has(from)) adjacency.set(from, new Map());
  const neighbors = adjacency.get(from);
  if (!neighbors.has(to)) neighbors.set(to, []);
  neighbors.get(to).push({ edge, inverse });
}

export function createConnectionIndex(graph) {
  const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
  const adjacencyMaps = new Map(graph.nodes.map((node) => [node.id, new Map()]));
  for (const rawEdge of graph.edges) {
    const relation = graph.legend?.[rawEdge.kind] || {};
    const edge = {
      id: rawEdge.id || `${rawEdge.kind}|${rawEdge.source}|${rawEdge.target}`,
      ...relation,
      ...rawEdge,
      contexts: rawEdge.contexts || [],
      reciprocal: Boolean(rawEdge.reciprocal),
      occurrences: rawEdge.occurrences || 1
    };
    const source = nodes.get(edge.source);
    const target = nodes.get(edge.target);
    if (!source || !target || source.visibility === "hidden" || target.visibility === "hidden") continue;
    pushAdjacency(adjacencyMaps, edge.source, edge.target, edge, false);
    if (edge.target !== edge.source) pushAdjacency(adjacencyMaps, edge.target, edge.source, edge, Boolean(edge.directed));
  }
  const adjacency = new Map();
  for (const [id, neighbors] of adjacencyMaps) {
    adjacency.set(id, [...neighbors.entries()].map(([to, traversals]) => ({
      from: id,
      to,
      traversals: traversals.sort((a, b) => a.edge.id.localeCompare(b.edge.id, "ko"))
    })).sort((a, b) => (nodes.get(a.to)?.title || a.to).localeCompare(nodes.get(b.to)?.title || b.to, "ko")));
  }
  const componentByNode = new Map();
  let component = 0;
  for (const node of graph.nodes) {
    if (node.visibility === "hidden" || componentByNode.has(node.id)) continue;
    const queue = [node.id];
    let queueIndex = 0;
    componentByNode.set(node.id, component);
    while (queueIndex < queue.length) {
      const current = queue[queueIndex];
      queueIndex += 1;
      for (const bundle of adjacency.get(current) || []) {
        if (componentByNode.has(bundle.to)) continue;
        componentByNode.set(bundle.to, component);
        queue.push(bundle.to);
      }
    }
    component += 1;
  }
  const selectable = graph.nodes.filter((node) => node.visibility === "public").map((node) => node.id);
  return { graph, nodes, adjacency, componentByNode, selectable };
}

function bestTraversal(index, bundle, mode, isTarget) {
  const candidates = bundle.traversals.map(({ edge, inverse }) => ({
    edge,
    inverse,
    cost: edgeCost(edge, inverse, mode)
  })).filter((candidate) => Number.isFinite(candidate.cost));
  candidates.sort((a, b) => a.cost - b.cost
    || (b.edge.weight || 0) - (a.edge.weight || 0)
    || a.edge.id.localeCompare(b.edge.id, "ko"));
  const chosen = candidates[0];
  if (!chosen) return null;
  const nodePenalty = isTarget ? 0 : intermediatePenalty(index, bundle.to, mode);
  const alternativeLabels = [...new Set(candidates.slice(1).map((candidate) => labelFor(index.graph, candidate.edge, candidate.inverse)))];
  return {
    from: bundle.from,
    to: bundle.to,
    edge: chosen.edge,
    inverse: chosen.inverse,
    label: labelFor(index.graph, chosen.edge, chosen.inverse),
    detail: detailFor(index, chosen.edge),
    alternativeLabels,
    stepCost: chosen.cost + nodePenalty
  };
}

class MinHeap {
  constructor(compare) {
    this.items = [];
    this.compare = compare;
  }

  get size() {
    return this.items.length;
  }

  push(value) {
    this.items.push(value);
    let index = this.items.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.compare(this.items[parent], this.items[index]) <= 0) break;
      [this.items[parent], this.items[index]] = [this.items[index], this.items[parent]];
      index = parent;
    }
  }

  pop() {
    if (!this.items.length) return null;
    const first = this.items[0];
    const last = this.items.pop();
    if (this.items.length) {
      this.items[0] = last;
      let index = 0;
      while (true) {
        const left = index * 2 + 1;
        const right = left + 1;
        let smallest = index;
        if (left < this.items.length && this.compare(this.items[left], this.items[smallest]) < 0) smallest = left;
        if (right < this.items.length && this.compare(this.items[right], this.items[smallest]) < 0) smallest = right;
        if (smallest === index) break;
        [this.items[index], this.items[smallest]] = [this.items[smallest], this.items[index]];
        index = smallest;
      }
    }
    return first;
  }
}

function shortestPath(index, start, target, { mode, maxHops, budget, bannedNodes = new Set(), bannedPairs = new Set() }) {
  const queue = new MinHeap((a, b) => a.cost - b.cost || a.hops - b.hops || a.signature.localeCompare(b.signature, "ko"));
  queue.push({ node: start, nodes: [start], steps: [], cost: 0, hops: 0, signature: start });
  const best = new Map([[`${start}|0`, 0]]);
  while (queue.size) {
    const state = queue.pop();
    if (state.cost > (best.get(`${state.node}|${state.hops}`) ?? Number.POSITIVE_INFINITY) + 1e-9) continue;
    if (budget.remaining <= 0) {
      const error = new Error(`Connection search exceeded ${budget.limit} states`);
      error.code = "CONNECTION_SEARCH_LIMIT";
      throw error;
    }
    budget.remaining -= 1;
    if (state.node === target) return state;
    if (state.hops >= maxHops) continue;
    for (const bundle of index.adjacency.get(state.node) || []) {
      if (bannedNodes.has(bundle.to) || bannedPairs.has(pairKey(state.node, bundle.to))) continue;
      if (state.nodes.includes(bundle.to)) continue;
      const step = bestTraversal(index, bundle, mode, bundle.to === target);
      if (!step) continue;
      const cost = state.cost + step.stepCost;
      const hops = state.hops + 1;
      const key = `${bundle.to}|${hops}`;
      const previousCost = best.get(key);
      if (previousCost !== undefined && cost >= previousCost - 1e-9) continue;
      best.set(key, cost);
      const nodes = [...state.nodes, bundle.to];
      queue.push({
        node: bundle.to,
        nodes,
        steps: [...state.steps, step],
        cost,
        hops,
        signature: nodes.join("→")
      });
    }
  }
  return null;
}

function samePrefix(nodes, prefix) {
  return prefix.every((node, index) => nodes[index] === node);
}

function routeQuality(path) {
  if (path.hops === 1) return { key: "direct", label: "직접 연결" };
  if (path.steps.every((step) => step.edge.kind !== "mentions") && path.hops <= 3) {
    return { key: "strong", label: "설명력 높은 연결" };
  }
  if (path.steps.some((step) => step.edge.kind === "mentions")) {
    return { key: "mention", label: "본문 언급 포함" };
  }
  return { key: "indirect", label: "간접 연결" };
}

function finalizePath(path, truncated = false) {
  return {
    ...path,
    signature: path.nodes.join("→"),
    quality: routeQuality(path),
    families: [...new Set(path.steps.map((step) => step.edge.family))],
    truncated
  };
}

export function findConnectionPaths(graphOrIndex, fromId, toId, options = {}) {
  if (!fromId || !toId || fromId === toId) return [];
  const index = graphOrIndex?.adjacency instanceof Map ? graphOrIndex : createConnectionIndex(graphOrIndex);
  if (!index.nodes.has(fromId) || !index.nodes.has(toId)) return [];
  const mode = normalizedMode(options.mode);
  const limit = Math.max(1, Math.min(Number(options.limit) || 3, 5));
  const candidateLimit = limit === 1 ? 1 : Math.min(9, Math.max(limit, limit * 3));
  const maxHops = Math.max(1, Math.min(Number(options.maxHops) || 6, 8));
  const maxStates = Math.max(1, Math.min(Number(options.maxStates) || 12000, 100000));
  const budget = { limit: maxStates, remaining: maxStates };
  if (index.componentByNode.get(fromId) !== index.componentByNode.get(toId)) return [];
  const first = shortestPath(index, fromId, toId, { mode, maxHops, budget });
  if (!first) return [];
  const paths = [first];
  const candidates = new Map();
  let truncated = false;

  candidateSearch:
  while (paths.length < candidateLimit) {
    const previous = paths[paths.length - 1];
    for (let indexAt = 0; indexAt < previous.nodes.length - 1; indexAt += 1) {
      const rootNodes = previous.nodes.slice(0, indexAt + 1);
      const rootSteps = previous.steps.slice(0, indexAt);
      const bannedPairs = new Set();
      for (const path of paths) {
        if (path.nodes.length > indexAt + 1 && samePrefix(path.nodes, rootNodes)) {
          bannedPairs.add(pairKey(path.nodes[indexAt], path.nodes[indexAt + 1]));
        }
      }
      const bannedNodes = new Set(rootNodes.slice(0, -1));
      let spur;
      try {
        spur = shortestPath(index, rootNodes[rootNodes.length - 1], toId, {
          mode,
          maxHops: maxHops - indexAt,
          budget,
          bannedNodes,
          bannedPairs
        });
      } catch (error) {
        if (error?.code !== "CONNECTION_SEARCH_LIMIT") throw error;
        truncated = true;
        break candidateSearch;
      }
      if (!spur) continue;
      const nodes = [...rootNodes.slice(0, -1), ...spur.nodes];
      if (new Set(nodes).size !== nodes.length) continue;
      const steps = [...rootSteps, ...spur.steps];
      const candidate = {
        node: toId,
        nodes,
        steps,
        hops: steps.length,
        cost: steps.reduce((sum, step) => sum + step.stepCost, 0)
      };
      const signature = nodes.join("→");
      if (!paths.some((path) => path.nodes.join("→") === signature)) candidates.set(signature, candidate);
    }
    const next = [...candidates.entries()].sort(([, a], [, b]) => a.cost - b.cost
      || a.hops - b.hops
      || a.nodes.join("→").localeCompare(b.nodes.join("→"), "ko"))[0];
    if (!next) break;
    candidates.delete(next[0]);
    paths.push(next[1]);
  }

  const directBundle = (index.adjacency.get(fromId) || []).find((bundle) => bundle.to === toId);
  const directStep = directBundle ? bestTraversal(index, directBundle, mode, true) : null;
  const directSignature = `${fromId}→${toId}`;
  if (directStep && !paths.some((path) => path.nodes.join("→") === directSignature)) {
    const directPath = {
      node: toId,
      nodes: [fromId, toId],
      steps: [directStep],
      hops: 1,
      cost: directStep.stepCost
    };
    paths.push(directPath);
  }

  const intermediateSet = (path) => new Set(path.nodes.slice(1, -1));
  const overlap = (left, right) => {
    const a = intermediateSet(left);
    const b = intermediateSet(right);
    const union = new Set([...a, ...b]);
    if (!union.size) return 0;
    return [...a].filter((value) => b.has(value)).length / union.size;
  };
  const selected = [paths[0]];
  const pool = paths.slice(1);
  while (selected.length < limit && pool.length) {
    pool.sort((a, b) => {
      const overlapA = Math.max(...selected.map((path) => overlap(path, a)));
      const overlapB = Math.max(...selected.map((path) => overlap(path, b)));
      const repeatedA = overlapA > 0.67 ? 1 : 0;
      const repeatedB = overlapB > 0.67 ? 1 : 0;
      return repeatedA - repeatedB || overlapA - overlapB || a.cost - b.cost
        || a.hops - b.hops || a.nodes.join("→").localeCompare(b.nodes.join("→"), "ko");
    });
    selected.push(pool.shift());
  }
  const directPath = paths.find((path) => path.nodes.join("→") === directSignature);
  if (directPath && !selected.includes(directPath)) {
    if (selected.length < limit) selected.push(directPath);
    else if (limit > 1) selected[selected.length - 1] = directPath;
  }

  return selected.slice(0, limit).map((path) => finalizePath(path, truncated));
}

export function connectionSummary(indexOrGraph, path) {
  if (!path) return "설명 가능한 연결 경로가 없습니다.";
  const index = indexOrGraph?.nodes instanceof Map ? indexOrGraph : createConnectionIndex(indexOrGraph);
  const titles = path.nodes.map((id) => index.nodes.get(id)?.title || id);
  if (path.hops === 1) return `“${titles[0]}” 문서와 “${titles[1]}” 문서는 ${path.steps[0].label} 관계로 직접 연결됩니다.`;
  return `“${titles[0]}” 문서는 ${titles.slice(1, -1).map((title) => `“${title}”`).join(" → ")}를 거쳐 “${titles[titles.length - 1]}” 문서와 연결됩니다.`;
}
