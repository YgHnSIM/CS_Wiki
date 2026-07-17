let index = null;
let findConnectionPaths = null;

self.addEventListener("message", async (event) => {
  const message = event.data || {};
  if (message.type === "init") {
    try {
      const pathModule = await import(message.pathModuleUrl);
      findConnectionPaths = pathModule.findConnectionPaths;
      const { createConnectionIndex } = pathModule;
      index = createConnectionIndex(message.graph);
      self.postMessage({ type: "ready", nodes: index.nodes.size });
    } catch (error) {
      self.postMessage({ type: "error", requestId: message.requestId || 0, message: error.message, code: error.code });
    }
    return;
  }
  if (message.type !== "query" || !index) return;
  try {
    const paths = findConnectionPaths(index, message.fromId, message.toId, {
      mode: message.mode,
      limit: 3,
      maxHops: 6
    });
    self.postMessage({ type: "result", requestId: message.requestId, paths });
  } catch (error) {
    self.postMessage({ type: "error", requestId: message.requestId, message: error.message, code: error.code });
  }
});
