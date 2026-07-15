import { basename, extname } from "node:path";

export function normalizeBase(value) {
  if (!value || value === "/") return "";
  return `/${String(value).replace(/^\/+|\/+$/g, "")}`;
}

export function withBase(pathname = "/", base = "") {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${normalizeBase(base)}${path}`;
}

export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function slugify(value = "") {
  return String(value)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "") || "page";
}

export function parseScalar(value = "") {
  const trimmed = String(value).trim();
  if (!trimmed || trimmed === "null" || trimmed === "~") return "";
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed.slice(1, -1);
    }
  }
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replaceAll("''", "'");
  }
  return trimmed;
}

export function parseFlowList(value = "") {
  const input = String(value).trim();
  if (!input.startsWith("[") || !input.endsWith("]")) return input ? [parseScalar(input)] : [];

  const items = [];
  let current = "";
  let quote = "";
  const content = input.slice(1, -1);
  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    if (quote === '"' && character === "\\" && index + 1 < content.length) {
      current += character + content[index + 1];
      index += 1;
    } else if (quote === "'" && character === "'" && content[index + 1] === "'") {
      current += "''";
      index += 1;
    } else if (quote && character === quote) {
      quote = "";
      current += character;
    } else if (!quote && (character === '"' || character === "'") && !current.trim()) {
      quote = character;
      current += character;
    } else if (character === "," && !quote) {
      if (current.trim()) items.push(parseScalar(current));
      current = "";
    } else {
      current += character;
    }
  }
  if (current.trim()) items.push(parseScalar(current));
  return items;
}

export function parseDocument(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return { data: {}, content: raw };
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (field) data[field[1]] = field[2].trim();
  }
  return { data, content: raw.slice(match[0].length) };
}

export function cleanInline(value = "") {
  return String(value)
    .replace(/!?(?:\[\[)([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/g, (_, target, label) => label || target)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_>#\[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function describe(body = "") {
  const paragraph = body
    .split(/\r?\n\r?\n/)
    .map((part) => part.trim())
    .find((part) => part && !part.startsWith("#") && !part.startsWith("-") && !part.startsWith("<!--"));
  const value = cleanInline(paragraph || "출처 기반으로 정리한 CS Wiki 문서");
  return value.length > 160 ? `${value.slice(0, 157)}...` : value;
}

export function key(value) {
  return String(value || "").normalize("NFKC").trim().toLocaleLowerCase("ko-KR");
}

export function buildPageLookup(pages) {
  const lookup = new Map();
  for (const page of pages) {
    const filename = basename(page.filePath, ".md");
    for (const name of [page.title, filename, ...page.aliases]) {
      const normalized = key(name);
      if (!normalized) continue;
      const existing = lookup.get(normalized);
      if (existing && existing !== page) {
        throw new Error(`Duplicate page lookup key '${name}' is shared by '${existing.title}' and '${page.title}'`);
      }
      lookup.set(normalized, page);
    }
  }
  return lookup;
}

export function validateUniquePageOutputs(pages, { additionalOutputs = () => [] } = {}) {
  const outputs = new Map();
  for (const page of pages) {
    for (const output of [`${page.category}/${page.slug}`, ...additionalOutputs(page)]) {
      const existing = outputs.get(output);
      if (existing && existing !== page) {
        throw new Error(`Duplicate page output '${output}' for '${existing.title}' and '${page.title}'`);
      }
      outputs.set(output, page);
    }
  }
}

export function resolvePageLinks(pages, lookup) {
  for (const page of pages) {
    page.incoming = 0;
    page.links = [...new Set(page.targets
      .map((target) => lookup.get(key(target)))
      .filter((target) => target && target !== page))];
  }

  for (const page of pages) {
    for (const linked of page.links) linked.incoming += 1;
  }
  for (const page of pages) page.score = page.incoming + page.links.length;
  return pages;
}

export function buildGraphPayload(pages, { limit = 12, urlFor = (url) => url } = {}) {
  const graphPages = [...pages]
    .filter((page) => page.category !== "meta")
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "ko"))
    .slice(0, limit);
  const ids = new Map(graphPages.map((page, index) => [page, index]));
  const edges = [];
  const seen = new Set();

  for (const page of graphPages) {
    for (const linked of page.links) {
      if (!ids.has(linked) || linked === page) continue;
      const first = Math.min(ids.get(page), ids.get(linked));
      const second = Math.max(ids.get(page), ids.get(linked));
      const edgeKey = `${first}:${second}`;
      if (seen.has(edgeKey)) continue;
      seen.add(edgeKey);
      edges.push([first, second]);
    }
  }

  return {
    nodes: graphPages.map((page) => ({
      title: page.title,
      url: urlFor(page.url),
      category: page.category,
      score: page.score
    })),
    edges
  };
}

export function safeExternalUrl(value) {
  const candidate = String(value || "").trim();
  try {
    const parsed = new URL(candidate);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? candidate : "";
  } catch {
    return "";
  }
}

export function sourceTarget(lookup, value) {
  return lookup.get(key(value)) || lookup.get(key(basename(value, extname(value))));
}
