import { spawn } from "node:child_process";
import { request } from "node:http";
import { join } from "node:path";


const root = process.cwd();
const server = spawn(process.execPath, [join(root, "site", "serve.mjs")], {
  cwd: root,
  stdio: ["ignore", "ignore", "inherit"],
  windowsHide: true
});

function reachable() {
  return new Promise((resolve) => {
    const req = request("http://127.0.0.1:4173/", { method: "HEAD" }, (response) => {
      response.resume();
      resolve(response.statusCode === 200);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(500, () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

async function waitForServer() {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    if (await reachable()) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Timed out waiting for the browser-test server");
}

function exitCode(child) {
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => resolve(code ?? (signal ? 1 : 0)));
  });
}

let code = 1;
try {
  await waitForServer();
  const cli = join(root, "node_modules", "@playwright", "test", "cli.js");
  const runner = spawn(process.execPath, [cli, "test", ...process.argv.slice(2)], {
    cwd: root,
    stdio: "inherit",
    windowsHide: true
  });
  code = await exitCode(runner);
} finally {
  server.kill();
  await Promise.race([
    exitCode(server),
    new Promise((resolve) => setTimeout(resolve, 1_000))
  ]);
}

process.exit(code);
