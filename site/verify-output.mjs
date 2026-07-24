import assert from "node:assert/strict";
import { readdir, stat } from "node:fs/promises";
import { extname, join } from "node:path";


export const OUTPUT_BUDGETS = Object.freeze({
  // Public documents intentionally emit static no-JS evidence routes.
  // The distributed-consistency expansion reaches 2,826 bounded artifacts; 3,200 keeps headroom for the queued P3–P5 work without relaxing byte budgets.
  files: 3_200,
  totalBytes: 96 * 1024 * 1024,
  htmlBytes: 48 * 1024 * 1024,
  jsonBytes: 48 * 1024 * 1024
});


async function outputFiles(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...await outputFiles(join(directory, entry.name), relative));
    else if (entry.isFile()) files.push(relative);
  }
  return files;
}


export async function verifyOutputEnvelope(dist, budgets = OUTPUT_BUDGETS) {
  const files = await outputFiles(dist);
  const totals = { files: files.length, totalBytes: 0, htmlBytes: 0, jsonBytes: 0 };
  for (const file of files) {
    const bytes = (await stat(join(dist, ...file.split("/")))).size;
    totals.totalBytes += bytes;
    if (extname(file) === ".html") totals.htmlBytes += bytes;
    if (extname(file) === ".json") totals.jsonBytes += bytes;
  }
  assert.ok(totals.files <= budgets.files, `build emits ${totals.files} files; budget is ${budgets.files}`);
  assert.ok(totals.totalBytes <= budgets.totalBytes, `build emits ${totals.totalBytes} bytes; budget is ${budgets.totalBytes}`);
  assert.ok(totals.htmlBytes <= budgets.htmlBytes, `build emits ${totals.htmlBytes} HTML bytes; budget is ${budgets.htmlBytes}`);
  assert.ok(totals.jsonBytes <= budgets.jsonBytes, `build emits ${totals.jsonBytes} JSON bytes; budget is ${budgets.jsonBytes}`);
  return totals;
}
