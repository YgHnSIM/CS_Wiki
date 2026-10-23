/**
 * The schema reserves `unlisted` and `private`, but the static build does not
 * yet implement their routing/listing semantics. Publishing them silently as
 * public pages would leak content, so fail closed until the behaviour exists.
 */
export function assertPublishablePages(pages) {
  const unsupported = pages.filter((page) => page.publicationVisibility !== "public");
  if (!unsupported.length) return;
  const detail = unsupported
    .slice(0, 10)
    .map((page) => `${page.relativePath} (${page.publicationVisibility || "missing"})`)
    .join(", ");
  throw new Error(
    `Public build cannot publish non-public pages yet: ${detail}`
    + (unsupported.length > 10 ? ` and ${unsupported.length - 10} more` : "")
    + ". Implement unlisted/private semantics before using publication_visibility other than 'public'."
  );
}
