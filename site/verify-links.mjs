import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join, posix } from "node:path";
import { normalizeBase } from "./core.mjs";

const SKIP_LINK = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;
const RAW_SNAPSHOT_PREFIX = "assets/raw/";

async function htmlFiles(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...await htmlFiles(join(directory, entry.name), relative));
    else if (entry.isFile() && extname(entry.name).toLowerCase() === ".html") files.push(relative);
  }
  return files;
}

function decodeEntities(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#039;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function createFileProbe(root) {
  const cache = new Map();
  return async function probe(pathname) {
    if (cache.has(pathname)) return cache.get(pathname);
    let result = false;
    try {
      const info = await stat(join(root, pathname));
      result = info.isFile();
    } catch {
      result = false;
    }
    cache.set(pathname, result);
    return result;
  };
}

function routeCandidates(pathname) {
  if (pathname.endsWith("/")) return [`${pathname}index.html`];
  const extension = extname(pathname);
  if (extension) return [pathname];
  return [pathname, `${pathname}/index.html`, `${pathname}.html`];
}

/**
 * Verify that every same-origin href/src in the generated HTML resolves to a
 * file in dist. Archived raw HTML snapshots are excluded because they retain
 * the absolute paths of their original hosts.
 */
export async function verifyInternalLinks(dist, { base = "", excludePrefixes = [RAW_SNAPSHOT_PREFIX] } = {}) {
  const normalizedBase = normalizeBase(base);
  const files = (await htmlFiles(dist))
    .filter((file) => !excludePrefixes.some((prefix) => file.startsWith(prefix)));
  const probe = createFileProbe(dist);
  const broken = [];
  let checked = 0;

  for (const file of files) {
    const html = await readFile(join(dist, file), "utf8");
    const pagePath = file === "index.html"
      ? "/"
      : file.endsWith("/index.html")
        ? `/${file.slice(0, -"index.html".length)}`
        : `/${file}`;
    const pageDirectory = pagePath.endsWith("/")
      ? pagePath.slice(0, -1) || "/"
      : posix.dirname(pagePath);

    for (const match of html.matchAll(/(?:href|src)="([^"]*)"/g)) {
      const attribute = decodeEntities(match[1]).trim();
      if (!attribute || SKIP_LINK.test(attribute)) continue;

      const withoutQuery = attribute.split(/[?#]/, 1)[0];
      if (!withoutQuery) continue;

      let decoded;
      try {
        decoded = decodeURIComponent(withoutQuery);
      } catch {
        broken.push({ page: pagePath, href: attribute, reason: "malformed encoding" });
        continue;
      }
      if (decoded.includes("\0")) {
        broken.push({ page: pagePath, href: attribute, reason: "null byte" });
        continue;
      }

      let pathname = decoded;
      if (normalizedBase && (pathname === normalizedBase || pathname.startsWith(`${normalizedBase}/`))) {
        pathname = pathname.slice(normalizedBase.length) || "/";
      }
      if (!pathname.startsWith("/")) pathname = posix.join(pageDirectory, pathname);
      pathname = posix.normalize(pathname);
      if (!pathname.startsWith("/")) pathname = `/${pathname}`;

      if (pathname.split("/").includes("..")) {
        broken.push({ page: pagePath, href: attribute, reason: "traversal" });
        continue;
      }

      checked += 1;
      let resolved = false;
      for (const candidate of routeCandidates(pathname)) {
        if (await probe(candidate.replace(/^\/+/, ""))) {
          resolved = true;
          break;
        }
      }
      if (!resolved) broken.push({ page: pagePath, href: attribute, reason: "missing target" });
    }
  }

  return { pages: files.length, checked, broken };
}
