import { join } from "node:path";
import { createStaticServer } from "./server.mjs";

const root = join(process.cwd(), "dist");
const port = Number(process.env.PORT || 4173);
createStaticServer({ root }).listen(port, "127.0.0.1", () => {
  console.log(`CS Wiki is running at http://127.0.0.1:${port}`);
});
