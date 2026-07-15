import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import test from "node:test";
import { contentTypeFor, createStaticServer, resolveRequestPath } from "../site/server.mjs";

async function listen(server) {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  return `http://127.0.0.1:${address.port}`;
}

async function close(server) {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}

test("request path resolution rejects malformed and escaping paths", () => {
  const root = join(tmpdir(), "site-root");
  assert.equal(resolveRequestPath(root, "/assets/site.js").statusCode, 200);
  assert.equal(resolveRequestPath(root, "/%").statusCode, 400);
  assert.equal(resolveRequestPath(root, "/%2e%2e%5csecret.txt").statusCode, 403);
  assert.equal(resolveRequestPath(root, "/C:%5cWindows%5cwin.ini").statusCode, 403);
  assert.equal(contentTypeFor("font.woff2"), "font/woff2");
});

test("static server handles files, fallbacks, HEAD, malformed URIs, and methods", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "cs-wiki-site-"));
  await writeFile(join(root, "index.html"), "home", "utf8");
  await writeFile(join(root, "404.html"), "missing", "utf8");
  const server = createStaticServer({ root });
  const base = await listen(server);
  t.after(async () => {
    await close(server);
    await rm(root, { recursive: true, force: true });
  });

  const home = await fetch(`${base}/`);
  assert.equal(home.status, 200);
  assert.equal(await home.text(), "home");

  const missing = await fetch(`${base}/not-here`);
  assert.equal(missing.status, 404);
  assert.equal(await missing.text(), "missing");

  const head = await fetch(`${base}/`, { method: "HEAD" });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), "");

  const malformed = await fetch(`${base}/%`);
  assert.equal(malformed.status, 400);

  const traversal = await fetch(`${base}/%2e%2e%5csecret.txt`);
  assert.equal(traversal.status, 403);

  const method = await fetch(`${base}/`, { method: "POST" });
  assert.equal(method.status, 405);
  assert.equal(method.headers.get("allow"), "GET, HEAD");
});

test("stream errors become 500 responses instead of crashing the server", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "cs-wiki-stream-"));
  await writeFile(join(root, "index.html"), "home", "utf8");
  const server = createStaticServer({
    root,
    createStream() {
      return new Readable({
        read() {
          this.destroy(new Error("synthetic stream failure"));
        }
      });
    }
  });
  const base = await listen(server);
  t.after(async () => {
    await close(server);
    await rm(root, { recursive: true, force: true });
  });

  const response = await fetch(`${base}/`);
  assert.equal(response.status, 500);
  assert.equal(await response.text(), "Internal Server Error");
});
