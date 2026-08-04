const WIKI_OPERATIONAL_COMMENT = /<!--[\t ]*wiki-v2:[\s\S]*?-->/g;
const WIKI_EVIDENCE_BLOCK = /<!--[\t ]*wiki-v2:evidence-start[\t ]*-->[\s\S]*?<!--[\t ]*wiki-v2:evidence-end[\t ]*-->\s*/g;
const WIKI_CALLOUT = /^> \[!(NOTE|WARNING)\][ \t]*(.*?)\r?$/gm;

/**
 * Remove comments that are meaningful to the wiki maintenance pipeline but
 * are not part of the public document prose.
 */
export function stripWikiOperationalMarkers(body) {
  return body.replace(WIKI_OPERATIONAL_COMMENT, "");
}

/**
 * Keep internal evidence IDs in the source contract while showing only the
 * human-readable source links on public article pages.
 */
export function stripWikiEvidenceBlocks(body) {
  return body.replace(WIKI_EVIDENCE_BLOCK, "");
}

/**
 * Keep Obsidian callout content readable in the plain Markdown renderer.
 * Markdown-it does not implement Obsidian's `[!TYPE]` extension, so expose
 * the type as a normal emphasized label while retaining the blockquote style.
 */
export function normalizeWikiCallouts(body) {
  return body.replace(WIKI_CALLOUT, (_, kind, title) => {
    const suffix = title ? ` · ${title}` : "";
    return `> **${kind}**${suffix}  `;
  });
}

export function prepareWikiMarkdown(body) {
  return normalizeWikiCallouts(stripWikiOperationalMarkers(stripWikiEvidenceBlocks(body)));
}
