/**
 * `unlisted` is supported: the page is built for direct links, but marked
 * noindex and excluded from listings, search, sitemap, graph lenses, and paths.
 * `private` has no routing/removal semantics yet, so fail closed rather than
 * publishing it as a normal public page.
 */
export function assertPublishablePages(pages) {
  const unsupported = pages.filter((page) => !["public", "unlisted"].includes(page.publicationVisibility || "public"));
  if (!unsupported.length) return;
  const detail = unsupported
    .slice(0, 10)
    .map((page) => `${page.relativePath} (${page.publicationVisibility || "missing"})`)
    .join(", ");
  throw new Error(
    `Public build cannot publish private pages yet: ${detail}`
    + (unsupported.length > 10 ? ` and ${unsupported.length - 10} more` : "")
    + ". Implement private routing/removal semantics before using publication_visibility: private."
  );
}
