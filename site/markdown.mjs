const WIKI_OPERATIONAL_COMMENT = /<!--[\t ]*wiki-v2:[\s\S]*?-->/g;
const WIKI_CALLOUT = /^> \[!(NOTE|WARNING)\][ \t]*(.*?)\r?$/gm;

/**
 * Remove comments that are meaningful to the wiki maintenance pipeline but
 * are not part of the public document prose.
 */
export function stripWikiOperationalMarkers(body) {
  return body.replace(WIKI_OPERATIONAL_COMMENT, "");
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
  return normalizeWikiCallouts(stripWikiOperationalMarkers(body));
}
