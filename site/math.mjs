import katex from "katex";

function isValidInlineDelim(state, pos) {
  const max = state.posMax;
  let canOpen = true;
  let canClose = true;

  const prevChar = pos > 0 ? state.src.charCodeAt(pos - 1) : -1;
  const nextChar = pos + 1 <= max ? state.src.charCodeAt(pos + 1) : -1;

  // Check non-whitespace conditions for opening and closing, and
  // ensure closing delimiter isn't followed by a digit.
  if (prevChar === 0x20 || prevChar === 0x09 || (nextChar >= 0x30 && nextChar <= 0x39)) {
    canClose = false;
  }
  if (nextChar === 0x20 || nextChar === 0x09) {
    canOpen = false;
  }

  return { canOpen, canClose };
}

function mathInline(state, silent) {
  if (state.src[state.pos] !== "$") return false;
  if (state.src[state.pos + 1] === "$") return false;

  const res = isValidInlineDelim(state, state.pos);
  if (!res.canOpen) {
    if (!silent) state.pending += "$";
    state.pos += 1;
    return true;
  }

  const start = state.pos + 1;
  let match = start;
  while ((match = state.src.indexOf("$", match)) !== -1) {
    let pos = match - 1;
    while (state.src[pos] === "\\") pos -= 1;
    if ((match - pos) % 2 === 1) break;
    match += 1;
  }

  if (match === -1) {
    if (!silent) state.pending += "$";
    state.pos = start;
    return true;
  }

  if (match - start === 0) {
    if (!silent) state.pending += "$$";
    state.pos = start + 1;
    return true;
  }

  const closeRes = isValidInlineDelim(state, match);
  if (!closeRes.canClose) {
    if (!silent) state.pending += "$";
    state.pos = start;
    return true;
  }

  if (!silent) {
    const token = state.push("math_inline", "math", 0);
    token.markup = "$";
    token.content = state.src.slice(start, match);
  }

  state.pos = match + 1;
  return true;
}

function mathBlock(state, start, end, silent) {
  let pos = state.bMarks[start] + state.tShift[start];
  const max = state.eMarks[start];

  if (pos + 2 > max) return false;
  if (state.src.slice(pos, pos + 2) !== "$$") return false;

  pos += 2;
  let firstLine = state.src.slice(pos, max);

  if (silent) return true;

  let found = false;
  let next = start;
  let lastLine = "";

  if (firstLine.trim().slice(-2) === "$$") {
    firstLine = firstLine.trim().slice(0, -2);
    found = true;
  }

  for (; !found; ) {
    next++;
    if (next >= end) break;

    pos = state.bMarks[next] + state.tShift[next];
    const lineMax = state.eMarks[next];

    if (pos < lineMax && state.tShift[next] < state.blkIndent) {
      break;
    }

    if (state.src.slice(pos, lineMax).trim().slice(-2) === "$$") {
      const lastPos = state.src.slice(0, lineMax).lastIndexOf("$$");
      lastLine = state.src.slice(pos, lastPos);
      found = true;
    }
  }

  state.line = next + 1;

  const token = state.push("math_block", "math", 0);
  token.block = true;
  token.content = (firstLine && firstLine.trim() ? firstLine + "\n" : "")
    + state.getLines(start + 1, next, state.tShift[start], true)
    + (lastLine && lastLine.trim() ? lastLine : "");
  token.map = [start, state.line];
  token.markup = "$$";
  return true;
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function mathPlugin(md, options = {}) {
  const katexOptions = {
    throwOnError: false,
    ...options
  };

  md.inline.ruler.after("escape", "math_inline", mathInline);
  md.block.ruler.after("blockquote", "math_block", mathBlock, {
    alt: ["paragraph", "reference", "blockquote", "list"]
  });

  md.renderer.rules.math_inline = (tokens, idx) => {
    const latex = tokens[idx].content;
    try {
      return katex.renderToString(latex, { ...katexOptions, displayMode: false });
    } catch (error) {
      return `<span class="katex-error" title="${escapeHtml(error.toString())}">${escapeHtml(latex)}</span>`;
    }
  };

  md.renderer.rules.math_block = (tokens, idx) => {
    const latex = tokens[idx].content.trim();
    try {
      const rendered = katex.renderToString(latex, { ...katexOptions, displayMode: true });
      return `<div class="math-block" tabindex="0" role="region" aria-label="수식">${rendered}</div>\n`;
    } catch (error) {
      return `<div class="math-block katex-error" tabindex="0" role="region" aria-label="수식 오류" title="${escapeHtml(error.toString())}">${escapeHtml(latex)}</div>\n`;
    }
  };
}
