/**
 * `unlisted` is supported: the page is built for direct links, but marked
 * noindex and excluded from listings, search, sitemap, graph lenses, and paths.
 * The schema allows only `public` and `unlisted`; any other value is rejected
 * here as a defense-in-depth check for older or externally edited pages.
 */
export function assertPublishablePages(pages) {
  const unsupported = pages.filter((page) => !["public", "unlisted"].includes(page.publicationVisibility || "public"));
  if (!unsupported.length) return;
  const detail = unsupported
    .slice(0, 10)
    .map((page) => `${page.relativePath} (${page.publicationVisibility || "missing"})`)
    .join(", ");
  throw new Error(
    `Public build cannot publish unsupported visibility: ${detail}`
    + (unsupported.length > 10 ? ` and ${unsupported.length - 10} more` : "")
    + ". Use publication_visibility: public or unlisted."
  );
}
