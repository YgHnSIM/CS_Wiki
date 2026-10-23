import assert from "node:assert/strict";
import test from "node:test";
import { assertPublishablePages } from "../site/visibility.mjs";

test("unlisted pages are publishable while private pages fail closed", () => {
  assert.doesNotThrow(() => assertPublishablePages([
    { relativePath: "wiki/concepts/A.md", publicationVisibility: "public" },
    { relativePath: "wiki/concepts/B.md", publicationVisibility: "unlisted" }
  ]));

  assert.throws(
    () => assertPublishablePages([
      { relativePath: "wiki/concepts/A.md", publicationVisibility: "public" },
      { relativePath: "wiki/concepts/C.md", publicationVisibility: "private" }
    ]),
    /cannot publish private pages.*C\.md \(private\)/
  );
});
