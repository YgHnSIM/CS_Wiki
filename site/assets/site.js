const base = window.CS_WIKI_BASE || "";
const dialog = document.querySelector("[data-search-dialog]");
const searchInput = document.querySelector("[data-search-input]");
const searchResults = document.querySelector("[data-search-results]");
const openSearchButtons = document.querySelectorAll("[data-open-search]");
const menuButton = document.querySelector(".menu-trigger");
const mobileMenu = document.querySelector("#mobile-menu");

let searchIndex = null;
let selectedResult = -1;

function normalize(value) {
  return String(value || "").normalize("NFKC").toLocaleLowerCase("ko-KR");
}

async function loadSearchIndex() {
  if (!searchIndex) {
    const response = await fetch(`${base}/search.json`);
    if (!response.ok) throw new Error("검색 색인을 불러오지 못했습니다.");
    searchIndex = await response.json();
  }
  return searchIndex;
}

function clearResults(message) {
  searchResults.replaceChildren();
  const paragraph = document.createElement("p");
  paragraph.className = "search-empty";
  paragraph.textContent = message;
  searchResults.append(paragraph);
  selectedResult = -1;
}

function resultElement(item, index) {
  const anchor = document.createElement("a");
  anchor.className = "search-result";
  anchor.href = item.url;
  anchor.dataset.resultIndex = String(index);

  const category = document.createElement("span");
  category.textContent = item.category;

  const body = document.createElement("div");
  const title = document.createElement("strong");
  title.textContent = item.title;
  const description = document.createElement("p");
  description.textContent = item.description;
  body.append(title, description);

  const time = document.createElement("time");
  time.textContent = item.updated;
  anchor.append(category, body, time);
  return anchor;
}

function rankItem(item, terms) {
  const title = normalize(item.title);
  const description = normalize(item.description);
  const text = normalize(item.text);
  let score = 0;
  for (const term of terms) {
    if (title === term) score += 100;
    else if (title.startsWith(term)) score += 50;
    else if (title.includes(term)) score += 25;
    if (description.includes(term)) score += 8;
    if (text.includes(term)) score += 2;
  }
  return score;
}

async function renderSearch(query) {
  const value = normalize(query).trim();
  if (!value) {
    clearResults("검색어를 입력하세요.");
    return;
  }

  try {
    const index = await loadSearchIndex();
    const terms = value.split(/\s+/).filter(Boolean);
    const results = index
      .map((item) => ({ item, score: rankItem(item, terms) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, "ko"))
      .slice(0, 18)
      .map(({ item }) => item);

    if (!results.length) {
      clearResults(`“${query.trim()}” 검색 결과가 없습니다.`);
      return;
    }

    selectedResult = -1;
    searchResults.replaceChildren(...results.map(resultElement));
  } catch (error) {
    clearResults(error.message);
  }
}

async function openSearch() {
  if (!dialog) return;
  dialog.showModal();
  searchInput.value = "";
  clearResults("검색어를 입력하세요.");
  requestAnimationFrame(() => searchInput.focus());
  loadSearchIndex().catch(() => {});
}

openSearchButtons.forEach((button) => button.addEventListener("click", openSearch));

searchInput?.addEventListener("input", (event) => renderSearch(event.target.value));

searchInput?.addEventListener("keydown", (event) => {
  const results = [...searchResults.querySelectorAll(".search-result")];
  if (!results.length) return;

  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    results.forEach((result) => result.classList.remove("active"));
    const movement = event.key === "ArrowDown" ? 1 : -1;
    selectedResult = (selectedResult + movement + results.length) % results.length;
    results[selectedResult].classList.add("active");
    results[selectedResult].scrollIntoView({ block: "nearest" });
  }

  if (event.key === "Enter" && selectedResult >= 0) {
    event.preventDefault();
    results[selectedResult].click();
  }
});

document.addEventListener("keydown", (event) => {
  const target = event.target;
  const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    if (!dialog?.open) openSearch();
  } else if (event.key === "/" && !isTyping && !dialog?.open) {
    event.preventDefault();
    openSearch();
  }
});

menuButton?.addEventListener("click", () => {
  const expanded = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!expanded));
  mobileMenu.hidden = expanded;
});

function initializeGraph() {
  const canvas = document.querySelector("#knowledge-graph");
  const source = document.querySelector("#graph-data");
  if (!canvas || !source) return;

  const graph = JSON.parse(source.textContent);
  const context = canvas.getContext("2d");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let width = 0;
  let height = 0;
  let nodes = [];
  let pointer = { x: -1000, y: -1000 };
  let activeNode = -1;
  let animationFrame = 0;

  function positionNodes() {
    const padding = Math.min(width, height) * 0.14;
    const usableWidth = Math.max(1, width - padding * 2);
    const usableHeight = Math.max(1, height - padding * 2);
    const centerX = width / 2;
    const centerY = height / 2;
    const golden = Math.PI * (3 - Math.sqrt(5));

    nodes = graph.nodes.map((node, index) => {
      const ratio = graph.nodes.length <= 1 ? 0 : index / (graph.nodes.length - 1);
      const radius = 0.18 + 0.72 * Math.sqrt(ratio);
      const angle = index * golden - Math.PI / 2;
      return {
        ...node,
        x: centerX + Math.cos(angle) * usableWidth * 0.47 * radius,
        y: centerY + Math.sin(angle) * usableHeight * 0.43 * radius,
        radius: 4 + Math.min(8, Math.sqrt(node.score || 1))
      };
    });
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    positionNodes();
    cancelAnimationFrame(animationFrame);
    draw(performance.now());
  }

  function draw(time) {
    context.clearRect(0, 0, width, height);
    context.lineWidth = 1;

    graph.edges.forEach(([from, to]) => {
      const start = nodes[from];
      const end = nodes[to];
      if (!start || !end) return;
      const active = from === activeNode || to === activeNode;
      context.strokeStyle = active ? "rgba(255,176,0,0.68)" : "rgba(0,255,65,0.20)";
      context.beginPath();
      context.moveTo(start.x, start.y);
      context.lineTo(end.x, end.y);
      context.stroke();
    });

    nodes.forEach((node, index) => {
      const hovered = index === activeNode;
      const pulse = prefersReducedMotion ? 0 : Math.sin(time / 700 + index) * 1.2;
      context.shadowColor = hovered ? "#ffb000" : "#00ff41";
      context.shadowBlur = hovered ? 20 : 10;
      context.fillStyle = hovered ? "#ffb000" : "#00ff41";
      context.beginPath();
      context.arc(node.x, node.y, node.radius + pulse + (hovered ? 2 : 0), 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;

      context.font = `${hovered ? "600" : "400"} 10px "IBM Plex Mono", monospace`;
      context.fillStyle = hovered ? "#ffb000" : "rgba(231,255,233,0.86)";
      context.textAlign = node.x > width * 0.68 ? "right" : "left";
      context.textBaseline = "middle";
      const label = node.title.length > 24 ? `${node.title.slice(0, 23)}…` : node.title;
      context.fillText(label, node.x + (context.textAlign === "right" ? -14 : 14), node.y);
    });

    if (!prefersReducedMotion) {
      animationFrame = requestAnimationFrame(draw);
    }
  }

  function findNode(event) {
    const rect = canvas.getBoundingClientRect();
    pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    return nodes.findIndex((node) => Math.hypot(node.x - pointer.x, node.y - pointer.y) < node.radius + 14);
  }

  canvas.addEventListener("pointermove", (event) => {
    activeNode = findNode(event);
    canvas.style.cursor = activeNode >= 0 ? "pointer" : "crosshair";
    if (prefersReducedMotion) draw(performance.now());
  });

  canvas.addEventListener("pointerleave", () => {
    activeNode = -1;
    if (prefersReducedMotion) draw(performance.now());
  });

  canvas.addEventListener("click", (event) => {
    const index = findNode(event);
    if (index >= 0) window.location.href = nodes[index].url;
  });

  new ResizeObserver(resize).observe(canvas);
}

initializeGraph();
