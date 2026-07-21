/* Force-layout worker. The caller supplies the versioned graph module URL so
 * this worker and the main thread always execute the same deterministic API. */

const workerScope = typeof self !== "undefined" ? self : null;

workerScope?.addEventListener("message", async (event) => {
  const { id, moduleUrl, nodes, edges, options } = event.data || {};
  try {
    if (!moduleUrl || !Array.isArray(nodes) || !Array.isArray(edges)) throw new Error("Invalid layout request");
    const module = await import(moduleUrl);
    const layout = module.createDeterministicLayout(nodes, edges, options || {});
    workerScope.postMessage({ id, ok: true, nodes: layout.map(({ id: nodeId, x, y }) => ({ id: nodeId, x, y })) });
  } catch (error) {
    workerScope.postMessage({ id, ok: false, error: String(error?.message || error) });
  }
});
