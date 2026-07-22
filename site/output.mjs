import { mkdir, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";

export function createOutputWriter(root) {
  return async function output(pathname, value) {
    const requestedPath = String(pathname || "");
    if (!requestedPath || isAbsolute(requestedPath)) throw new Error(`Unsafe output path '${pathname}'`);
    const destination = resolve(root, requestedPath);
    const relativePath = relative(resolve(root), destination);
    if (relativePath === ".." || relativePath.startsWith(`..${sep}`) || isAbsolute(relativePath)) {
      throw new Error(`Unsafe output path '${pathname}'`);
    }
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, value, "utf8");
  };
}

export function createDataOutputPath(namespace, description) {
  if (!/^[a-z0-9][a-z0-9._-]*$/i.test(namespace)) {
    throw new Error(`Unsafe data namespace '${namespace}'`);
  }

  return function dataOutputPath(url, label) {
    const unsafePath = () => new Error(`Unsafe ${description} ${label} path '${url}'`);
    const pathname = String(url || "").split(/[?#]/, 1)[0].replaceAll("\\", "/");
    const parts = pathname.split("/");
    let decodedParts;
    try {
      decodedParts = parts.map((part) => decodeURIComponent(part));
    } catch {
      throw unsafePath();
    }
    const portable = decodedParts.every((part) => /^[a-z0-9][a-z0-9._-]*$/i.test(part));
    if (!pathname || pathname.startsWith("/") || parts.some((part) => !part) || !portable) {
      throw unsafePath();
    }
    return join("data", namespace, ...parts);
  };
}
