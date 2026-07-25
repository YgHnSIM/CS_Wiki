import { spawn } from "node:child_process";
import { join } from "node:path";
import { createStaticServer } from "../site/server.mjs";

const root = process.cwd();
const server = createStaticServer({
  root: join(root, "dist"),
  basePath: process.env.SITE_BASE || ""
});

function exitCode(child) {
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => resolve(code ?? (signal ? 1 : 0)));
  });
}

function listen(serverInstance) {
  return new Promise((resolve, reject) => {
    const onError = (error) => {
      serverInstance.off("listening", onListening);
      reject(error);
    };
    const onListening = () => {
      serverInstance.off("error", onError);
      resolve();
    };
    serverInstance.once("error", onError);
    serverInstance.once("listening", onListening);
    serverInstance.listen(0, "127.0.0.1");
  });
}

function close(serverInstance) {
  return new Promise((resolve, reject) => {
    if (!serverInstance.listening) {
      resolve();
      return;
    }
    serverInstance.close((error) => {
      if (error) reject(error);
      else resolve();
    });
    serverInstance.closeIdleConnections?.();
  });
}

let code = 1;
try {
  await listen(server);
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Browser-test server did not expose a TCP port");
  const baseURL = `http://127.0.0.1:${address.port}`;
  const cli = join(root, "node_modules", "@playwright", "test", "cli.js");
  const runner = spawn(process.execPath, [cli, "test", ...process.argv.slice(2)], {
    cwd: root,
    stdio: "inherit",
    windowsHide: true,
    env: {
      ...process.env,
      CS_WIKI_E2E_BASE_URL: baseURL
    }
  });
  code = await exitCode(runner);
} finally {
  await close(server);
}

process.exit(code);
