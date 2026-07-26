import { createHash } from "node:crypto";
import { lstat, readdir, readFile } from "node:fs/promises";
import { isAbsolute, join, posix } from "node:path";

function compareLogicalPaths(left, right) {
  return left.path < right.path ? -1 : left.path > right.path ? 1 : 0;
}

function normalizeGeneratedPath(value) {
  if (typeof value !== "string"
    || value.length === 0
    || value.includes("\\")
    || isAbsolute(value)
    || posix.isAbsolute(value)
    || posix.normalize(value) !== value
    || value.split("/").some((part) => !part || part === "." || part === "..")) {
    throw new Error(`Unsafe generated asset path: ${String(value)}`);
  }
  return value;
}

function generatedBytes(value, logicalPath) {
  if (typeof value === "string") return Buffer.from(value, "utf8");
  if (Buffer.isBuffer(value) || ArrayBuffer.isView(value)) return Buffer.from(value);
  throw new TypeError(`Generated asset '${logicalPath}' must provide string or byte content`);
}

function unsupportedEntryError(logicalPath, kind) {
  return new Error(`Unsupported ${kind} in asset tree: ${logicalPath || "."}`);
}

async function collectAssetFiles(assetRoot) {
  const rootStat = await lstat(assetRoot);
  if (rootStat.isSymbolicLink()) throw unsupportedEntryError("", "symbolic link");
  if (!rootStat.isDirectory()) throw unsupportedEntryError("", "root entry");

  const files = [];

  async function visit(directoryPath, pathParts) {
    const entries = await readdir(directoryPath, { withFileTypes: true });
    for (const entry of entries) {
      const nextParts = [...pathParts, entry.name];
      const logicalPath = nextParts.join("/");
      const filePath = join(directoryPath, entry.name);
      const entryStat = await lstat(filePath);

      if (entryStat.isSymbolicLink()) throw unsupportedEntryError(logicalPath, "symbolic link");
      if (entryStat.isDirectory()) {
        await visit(filePath, nextParts);
      } else if (entryStat.isFile()) {
        files.push({ path: logicalPath, bytes: await readFile(filePath) });
      } else {
        throw unsupportedEntryError(logicalPath, "special entry");
      }
    }
  }

  await visit(assetRoot, []);
  return files;
}

function updateLength(hash, length) {
  const encoded = Buffer.allocUnsafe(8);
  encoded.writeBigUInt64BE(BigInt(length));
  hash.update(encoded);
}

function updateEntry(hash, entry) {
  const pathBytes = Buffer.from(entry.path, "utf8");
  updateLength(hash, pathBytes.length);
  hash.update(pathBytes);
  updateLength(hash, entry.bytes.length);
  hash.update(entry.bytes);
}

export async function createAssetHash({
  assetRoot,
  generatedAssets = []
}) {
  const entries = await collectAssetFiles(assetRoot);
  for (const asset of generatedAssets) {
    const path = normalizeGeneratedPath(asset?.path);
    entries.push({ path, bytes: generatedBytes(asset?.bytes, path) });
  }
  entries.sort(compareLogicalPaths);

  for (let index = 1; index < entries.length; index += 1) {
    if (entries[index - 1].path === entries[index].path) {
      throw new Error(`Duplicate asset path: ${entries[index].path}`);
    }
  }

  const hash = createHash("sha256");
  for (const entry of entries) updateEntry(hash, entry);
  return hash;
}
