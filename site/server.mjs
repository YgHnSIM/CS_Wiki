import { createReadStream } from "node:fs";
import { realpath, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, isAbsolute, join, relative, resolve } from "node:path";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

function isInside(root, candidate) {
  const rel = relative(root, candidate);
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
}

export function resolveRequestPath(root, requestUrl) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(requestUrl, "http://localhost").pathname);
  } catch {
    return { statusCode: 400, filePath: null };
  }

  if (pathname.includes("\0")) return { statusCode: 400, filePath: null };
  const portablePath = pathname.replaceAll("\\", "/");
  if (portablePath.split("/").includes("..")) return { statusCode: 403, filePath: null };

  const relativePath = portablePath.replace(/^\/+/, "");
  if (/^[A-Za-z]:\//.test(relativePath)) return { statusCode: 403, filePath: null };
  const filePath = resolve(root, relativePath);
  const resolvedRoot = resolve(root);
  if (!isInside(resolvedRoot, filePath)) return { statusCode: 403, filePath: null };
  return { statusCode: 200, filePath };
}

export function contentTypeFor(filePath) {
  return contentTypes[extname(filePath).toLowerCase()] || "application/octet-stream";
}

function sendText(response, statusCode, message) {
  if (response.headersSent) {
    response.destroy();
    return;
  }
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "text/plain; charset=utf-8");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.end(message);
}

async function existingFile(root, candidate) {
  let filePath = candidate;
  let info = await stat(filePath);
  if (info.isDirectory()) {
    filePath = join(filePath, "index.html");
    info = await stat(filePath);
  }
  if (!info.isFile()) return null;

  const [realRoot, realFile] = await Promise.all([realpath(root), realpath(filePath)]);
  return isInside(realRoot, realFile) ? realFile : null;
}

export async function handleStaticRequest(request, response, {
  root,
  fallback = "404.html",
  createStream = createReadStream
}) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.setHeader("Allow", "GET, HEAD");
    sendText(response, 405, "Method Not Allowed");
    return;
  }

  const resolved = resolveRequestPath(root, request.url || "/");
  if (resolved.statusCode !== 200) {
    sendText(response, resolved.statusCode, resolved.statusCode === 400 ? "Bad Request" : "Forbidden");
    return;
  }

  let filePath;
  try {
    filePath = await existingFile(root, resolved.filePath);
  } catch (error) {
    if (error?.code !== "ENOENT" && error?.code !== "ENOTDIR") throw error;
  }

  if (!filePath) {
    response.statusCode = 404;
    const fallbackPath = resolve(root, fallback);
    if (!isInside(resolve(root), fallbackPath)) {
      sendText(response, 404, "Not Found");
      return;
    }
    try {
      filePath = await existingFile(root, fallbackPath);
    } catch (error) {
      if (error?.code !== "ENOENT" && error?.code !== "ENOTDIR") throw error;
    }
    if (!filePath) {
      sendText(response, 404, "Not Found");
      return;
    }
  }

  response.setHeader("Content-Type", contentTypeFor(filePath));
  response.setHeader("X-Content-Type-Options", "nosniff");
  if (request.method === "HEAD") {
    response.end();
    return;
  }

  const stream = createStream(filePath);
  stream.once("error", () => sendText(response, 500, "Internal Server Error"));
  stream.pipe(response);
}

export function createStaticHandler(options) {
  return (request, response) => {
    handleStaticRequest(request, response, options)
      .catch(() => sendText(response, 500, "Internal Server Error"));
  };
}

export function createStaticServer(options) {
  return createServer(createStaticHandler(options));
}
