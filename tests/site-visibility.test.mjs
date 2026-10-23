import assert from "node:assert/strict";
import test from "node:test";
import { assertPublishablePages } from "../site/visibility.mjs";

test("publishable pages must stay public until visibility semantics exist", () => {
  assert.doesNotThrow(() => assertPublishablePages([
    { relativePath: "wiki/concepts/A.md", publicationVisibility: "public" }
  ]));

  assert.throws(
    () => assertPublishablePages([
      { relativePath: "wiki/concepts/A.md", publicationVisibility: "public" },
      { relativePath: "wiki/concepts/B.md", publicationVisibility: "unlisted" },
      { relativePath: "wiki/concepts/C.md", publicationVisibility: "private" }
    ]),
    /cannot publish non-public pages.*B\.md \(unlisted\).*C\.md \(private\)/
  );
});
