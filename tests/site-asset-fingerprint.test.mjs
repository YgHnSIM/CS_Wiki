import assert from "node:assert/strict";
import { mkdir, mkdtemp, rename, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { createAssetHash } from "../site/asset-fingerprint.mjs";

async function fingerprint(assetRoot, generatedAssets = []) {
  return (await createAssetHash({ assetRoot, generatedAssets })).digest("hex");
}

async function createTree(parent, name, files) {
  const root = join(parent, name);
  await mkdir(root, { recursive: true });
  for (const [relativePath, contents] of files) {
    const filePath = join(root, relativePath);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, contents);
  }
  return root;
}

test("asset fingerprint ignores directory and generated-asset insertion order", async () => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "cs-wiki-assets-order-"));
  try {
    const first = await createTree(temporaryRoot, "first", [
      ["z-last.js", "last"],
      ["nested/beta.bin", Buffer.from([0, 1, 2, 255])],
      ["a-first.svg", "<svg/>"]
    ]);
    const second = await createTree(temporaryRoot, "second", [
      ["a-first.svg", "<svg/>"],
      ["nested/beta.bin", Buffer.from([0, 1, 2, 255])],
      ["z-last.js", "last"]
    ]);
    const generated = [
      { path: "site.css", bytes: "body { color: black; }" },
      { path: "generated/runtime.js", bytes: "export default true;" }
    ];

    assert.equal(
      await fingerprint(first, generated),
      await fingerprint(second, [...generated].reverse())
    );
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

test("nested asset edits, additions, and renames each change the fingerprint", async () => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "cs-wiki-assets-mutations-"));
  try {
    const assets = await createTree(temporaryRoot, "assets", [
      ["root.js", "root"],
      ["nested/deep/asset.txt", "original"]
    ]);
    const baseline = await fingerprint(assets);
    const nestedAsset = join(assets, "nested", "deep", "asset.txt");

    await writeFile(nestedAsset, "modified");
    assert.notEqual(await fingerprint(assets), baseline, "editing a nested file must invalidate the fingerprint");

    await writeFile(nestedAsset, "original");
    await writeFile(join(assets, "nested", "added.txt"), "added");
    assert.notEqual(await fingerprint(assets), baseline, "adding a nested file must invalidate the fingerprint");

    await rm(join(assets, "nested", "added.txt"));
    await rename(nestedAsset, join(assets, "nested", "deep", "renamed.txt"));
    assert.notEqual(await fingerprint(assets), baseline, "renaming a nested file must invalidate the fingerprint");
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

test("generated site.css content participates in the asset fingerprint", async () => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "cs-wiki-assets-generated-"));
  try {
    const assets = await createTree(temporaryRoot, "assets", [["site.js", "console.log('site');"]]);
    const before = await fingerprint(assets, [{ path: "site.css", bytes: "body { color: black; }" }]);
    const after = await fingerprint(assets, [{ path: "site.css", bytes: "body { color: white; }" }]);

    assert.notEqual(after, before);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

test("knowledge data can extend the same final asset hash", async () => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "cs-wiki-assets-knowledge-"));
  try {
    const assets = await createTree(temporaryRoot, "assets", [["site.js", "site"]]);
    const first = (await createAssetHash({ assetRoot: assets })).update('{"pages":["first"]}').digest("hex");
    const second = (await createAssetHash({ assetRoot: assets })).update('{"pages":["second"]}').digest("hex");

    assert.notEqual(first, second);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

test("asset trees reject symbolic links instead of silently skipping them", async (context) => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "cs-wiki-assets-symlink-"));
  try {
    const assets = await createTree(temporaryRoot, "assets", [["site.js", "site"]]);
    const target = await createTree(temporaryRoot, "target", [["hidden.js", "hidden"]]);
    const linkPath = join(assets, "linked");

    try {
      await symlink(target, linkPath, process.platform === "win32" ? "junction" : "dir");
    } catch (error) {
      if (error?.code === "EPERM" || error?.code === "EACCES") {
        context.skip(`symbolic links are unavailable: ${error.code}`);
        return;
      }
      throw error;
    }

    await assert.rejects(() => fingerprint(assets), /Unsupported symbolic link in asset tree: linked/);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});
