import assert from "node:assert/strict";
import MarkdownIt from "markdown-it";
import test from "node:test";
import { prepareWikiMarkdown, stripWikiOperationalMarkers } from "../site/markdown.mjs";
import { mathPlugin } from "../site/math.mjs";

test("wiki operational comments stay out of public Markdown", () => {
  const source = [
    "## 출처",
    "",
    '<!-- wiki-v2:quote-locator evidence="src-001" locator="page:line-1" status="recorded" -->',
    "<!-- wiki-v2:evidence-start -->",
    "### 근거 ID",
    "- `src-001` <!-- wiki-v2:evidence-end -->"
  ].join("\n");
  const prepared = stripWikiOperationalMarkers(source);
  const html = new MarkdownIt({ html: false }).render(prepared);

  assert.doesNotMatch(prepared, /wiki-v2:/);
  assert.doesNotMatch(html, /wiki-v2:|&lt;!--/);
  assert.match(html, /<h3>근거 ID<\/h3>/);
  assert.match(html, /src-001/);
});

test("generated evidence IDs stay out of public Markdown while source links remain", () => {
  const source = [
    "## 출처",
    "",
    "<!-- wiki-v2:evidence-start -->",
    "### 근거 ID",
    "- `ref-034`",
    "<!-- wiki-v2:evidence-end -->",
    "",
    "- [[Roofline An Insightful Visual Performance Model]]"
  ].join("\n");
  const prepared = prepareWikiMarkdown(source);

  assert.doesNotMatch(prepared, /wiki-v2:|근거 ID|ref-034/);
  assert.match(prepared, /\[\[Roofline An Insightful Visual Performance Model\]\]/);
});

test("Obsidian callout markers become readable blockquote labels", () => {
  const source = [
    "> [!WARNING] 기준의 주의점",
    "> 직접 계보와 개념적 선구를 구분한다.",
    "",
    "> [!NOTE] 범위",
    "> 현재 알려진 사례만 다룬다."
  ].join("\n");
  const html = new MarkdownIt({ html: false }).render(prepareWikiMarkdown(source));

  assert.doesNotMatch(html, /\[!(?:NOTE|WARNING)\]/);
  assert.match(html, /<strong>WARNING<\/strong> · 기준의 주의점<br>/);
  assert.match(html, /<strong>NOTE<\/strong> · 범위/);
  assert.match(html, /직접 계보와 개념적 선구를 구분한다\./);
});

test("inline and block math are rendered via KaTeX into accessible HTML and MathML", () => {
  const source = [
    "데카르트 좌표계 $(x, y)$와 선형 메모리:",
    "",
    "$$\\text{Address}(x, y) = \\text{Base} + y \\times \\text{Pitch} + x \\times B$$",
    "",
    "가격은 $100입니다."
  ].join("\n");
  const md = new MarkdownIt({ html: false }).use(mathPlugin);
  const html = md.render(prepareWikiMarkdown(source));

  assert.match(html, /<span class="katex">/);
  assert.match(html, /<math xmlns="http:\/\/www\.w3\.org\/1998\/Math\/MathML">/);
  assert.match(html, /<div class="math-block" tabindex="0" role="region" aria-label="수식">/);
  assert.match(html, /가격은 \$100입니다\./);
  assert.doesNotMatch(html, /\$\$\\text\{Address\}/);
});
