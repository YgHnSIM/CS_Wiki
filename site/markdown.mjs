const WIKI_OPERATIONAL_COMMENT = /<!--[\t ]*wiki-v2:[\s\S]*?-->/g;
const WIKI_EVIDENCE_BLOCK = /<!--[\t ]*wiki-v2:evidence-start[\t ]*-->[\s\S]*?<!--[\t ]*wiki-v2:evidence-end[\t ]*-->\s*/g;
const WIKI_CALLOUT = /^> \[!(NOTE|WARNING)\][ \t]*(.*?)\r?$/gm;
const ANCHOR_TAG = /<a\b[^>]*>/g;
const EXTERNAL_OR_ROOT_LINK = /^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#)/i;

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

function escapeAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/**
 * Source notes keep Obsidian-friendly relative links such as `logs/note.md`.
 * Those files are not part of the static build, so the rendered page would
 * point at a missing route. Resolve a relative Markdown link to a built page
 * when one exists, otherwise to the repository blob that owns the raw record.
 */
export function resolveRenderedFileLinks(html, { pagePath, repositoryUrl, pageUrlFor = () => "" } = {}) {
  if (!pagePath || !repositoryUrl) return html;
  const baseDirectory = pagePath.includes("/") ? pagePath.slice(0, pagePath.lastIndexOf("/")) : "";

  return html.replace(ANCHOR_TAG, (tag) => {
    const match = tag.match(/\shref="([^"]*)"/);
    if (!match) return tag;
    const href = match[1];
    if (!href || EXTERNAL_OR_ROOT_LINK.test(href)) return tag;

    const hashIndex = href.indexOf("#");
    const pathPart = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
    const hash = hashIndex >= 0 ? href.slice(hashIndex) : "";
    if (!/\.md$/i.test(pathPart)) return tag;

    let decoded;
    try {
      decoded = decodeURIComponent(pathPart);
    } catch {
      return tag;
    }

    const segments = [];
    for (const segment of `${baseDirectory}/${decoded}`.split("/")) {
      if (!segment || segment === ".") continue;
      if (segment === "..") segments.pop();
      else segments.push(segment);
    }
    const target = segments.join("/");
    if (!target.startsWith("wiki/")) return tag;

    const pageUrl = pageUrlFor(target);
    const resolved = pageUrl || `${repositoryUrl}/blob/main/${segments.map(encodeURIComponent).join("/")}`;
    return tag.replace(`href="${href}"`, `href="${escapeAttribute(`${resolved}${hash}`)}"`);
  });
}
