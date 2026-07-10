from __future__ import annotations

import csv
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable


BASE_REQUIRED = {"title", "aliases", "tags", "created", "updated", "sources", "status"}
VALID_STATUSES = {"draft", "active", "review", "archived"}
CONTENT_DIRS = {"concepts", "entities", "analyses"}
SPECIAL_FILES = {"index.md", "log.md", "overview.md"}


def parse_flow_list(value: str | None) -> list[str]:
    if value is None:
        return []
    value = value.strip()
    if not (value.startswith("[") and value.endswith("]")):
        return []
    inner = value[1:-1].strip()
    if not inner:
        return []
    return [item.strip().strip("'") for item in next(csv.reader([inner], skipinitialspace=True))]


def parse_scalar(value: str | None) -> str | None:
    if value is None:
        return None
    value = value.strip()
    if value in {"", "null", "~"}:
        return None
    if len(value) >= 2 and value[0] == value[-1] and value[0] in {'"', "'"}:
        return value[1:-1]
    return value


def yaml_quote(value: str) -> str:
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


def flow_list(values: Iterable[str]) -> str:
    return "[" + ", ".join(yaml_quote(value) for value in values) + "]"


def normalize_heading(value: str) -> str:
    value = re.sub(r"\s+#+\s*$", "", value)
    value = re.sub(r"[*_`~]", "", value)
    return re.sub(r"\s+", " ", value).strip().casefold()


def line_number(text: str, offset: int) -> int:
    return text.count("\n", 0, offset) + 1


@dataclass
class WikiLink:
    raw: str
    base: str
    anchor: str
    line: int


@dataclass(eq=False)
class Page:
    path: Path
    root: Path
    text: str
    bom: bool
    newline: str
    meta: dict[str, str] = field(default_factory=dict)
    headings: list[tuple[int, str, int]] = field(default_factory=list)
    links: list[WikiLink] = field(default_factory=list)

    @property
    def rel(self) -> str:
        return self.path.relative_to(self.root).as_posix()

    @property
    def stem(self) -> str:
        return self.path.stem

    @property
    def tags(self) -> list[str]:
        return parse_flow_list(self.meta.get("tags"))

    @property
    def aliases(self) -> list[str]:
        return parse_flow_list(self.meta.get("aliases"))

    @property
    def sources(self) -> list[str]:
        return parse_flow_list(self.meta.get("sources"))

    @property
    def page_type(self) -> str | None:
        return next((tag for tag in self.tags if tag.startswith("type/")), None)

    @property
    def is_content(self) -> bool:
        return self.path.parent.name in CONTENT_DIRS

    @property
    def is_special(self) -> bool:
        return self.path.name in SPECIAL_FILES and self.path.parent.name == "wiki"

    def write(self, text: str) -> None:
        payload = text.encode("utf-8")
        if self.bom:
            payload = b"\xef\xbb\xbf" + payload
        self.path.write_bytes(payload)
        self.text = text
        self.meta, self.headings, self.links = parse_document(text)


def parse_document(text: str) -> tuple[dict[str, str], list[tuple[int, str, int]], list[WikiLink]]:
    meta: dict[str, str] = {}
    match = re.match(r"^---\r?\n(.*?)\r?\n---(?:\r?\n|$)", text, re.DOTALL)
    if match:
        for raw_line in match.group(1).splitlines():
            field_match = re.match(r"^([A-Za-z_][\w-]*):\s*(.*)$", raw_line)
            if field_match:
                meta[field_match.group(1)] = field_match.group(2).strip()

    headings: list[tuple[int, str, int]] = []
    for heading_match in re.finditer(r"^(#{1,6})\s+(.+?)\s*$", text, re.MULTILINE):
        headings.append(
            (len(heading_match.group(1)), heading_match.group(2).strip(), line_number(text, heading_match.start()))
        )

    links: list[WikiLink] = []
    for link_match in re.finditer(r"\[\[([^\]]+)\]\]", text):
        raw = link_match.group(1).strip()
        target = raw.split("|", 1)[0].strip()
        base, _, anchor = target.partition("#")
        base = base.strip().replace("\\", "/")
        if base.casefold().endswith(".md"):
            base = base[:-3]
        if "/" in base:
            base = base.rsplit("/", 1)[-1]
        links.append(WikiLink(raw=raw, base=base, anchor=anchor.strip(), line=line_number(text, link_match.start())))
    return meta, headings, links


def load_pages(root: Path) -> list[Page]:
    pages: list[Page] = []
    for path in sorted((root / "wiki").rglob("*.md")):
        data = path.read_bytes()
        bom = data.startswith(b"\xef\xbb\xbf")
        if bom:
            data = data[3:]
        text = data.decode("utf-8")
        newline = "\r\n" if "\r\n" in text else "\n"
        meta, headings, links = parse_document(text)
        pages.append(Page(path=path, root=root, text=text, bom=bom, newline=newline, meta=meta, headings=headings, links=links))
    return pages


@dataclass
class Resolver:
    pages: list[Page]

    def __post_init__(self) -> None:
        self.by_stem: dict[str, Page] = {page.stem.casefold(): page for page in self.pages}
        self.by_alias: dict[str, list[Page]] = {}
        for page in self.pages:
            for alias in page.aliases:
                self.by_alias.setdefault(alias.casefold(), []).append(page)

    def resolve(self, name: str) -> tuple[Page | None, str]:
        key = name.casefold()
        if key in self.by_stem:
            return self.by_stem[key], "stem"
        candidates = list(dict.fromkeys(self.by_alias.get(key, [])))
        if len(candidates) == 1:
            return candidates[0], "alias"
        return None, "ambiguous" if candidates else "missing"


def section_span(text: str, heading: str, level: int = 2, last: bool = False) -> tuple[int, int] | None:
    pattern = re.compile(rf"^{'#' * level}\s+{re.escape(heading)}\s*$", re.MULTILINE)
    matches = list(pattern.finditer(text))
    if not matches:
        return None
    match = matches[-1] if last else matches[0]
    next_heading = re.search(rf"^#{{1,{level}}}\s+", text[match.end() :], re.MULTILINE)
    end = match.end() + next_heading.start() if next_heading else len(text)
    return match.end(), end


def links_in_section(page: Page, heading: str, level: int = 2, last: bool = False) -> list[str]:
    span = section_span(page.text, heading, level=level, last=last)
    if span is None:
        return []
    chunk = page.text[span[0] : span[1]]
    result: list[str] = []
    for raw in re.findall(r"\[\[([^\]]+)\]\]", chunk):
        target = raw.split("|", 1)[0].split("#", 1)[0].strip().replace("\\", "/")
        if target.casefold().endswith(".md"):
            target = target[:-3]
        if "/" in target:
            target = target.rsplit("/", 1)[-1]
        result.append(target)
    return result


def set_frontmatter_field(text: str, key: str, value: str, newline: str) -> str:
    frontmatter = re.match(r"^---\r?\n(.*?)\r?\n---", text, re.DOTALL)
    if not frontmatter:
        raise ValueError("missing frontmatter")
    body = frontmatter.group(1)
    pattern = re.compile(rf"^{re.escape(key)}:\s*.*$", re.MULTILINE)
    replacement = f"{key}: {value}"
    if pattern.search(body):
        body = pattern.sub(replacement, body, count=1)
    else:
        body = body + newline + replacement
    return text[: frontmatter.start(1)] + body + text[frontmatter.end(1) :]


def set_updated(text: str, date: str, newline: str) -> str:
    return set_frontmatter_field(text, "updated", date, newline)


def append_related_link(page: Page, target: str, date: str) -> str:
    span = section_span(page.text, "관련 항목", level=2, last=True)
    if span is None:
        raise ValueError(f"{page.rel}: missing final related section")
    start, end = span
    chunk = page.text[start:end]
    if re.search(rf"\[\[{re.escape(target)}(?:[#|\]])", chunk, re.IGNORECASE):
        return page.text
    stripped = chunk.rstrip("\r\n")
    suffix = chunk[len(stripped) :]
    insertion = page.newline + f"- [[{target}]]"
    new_chunk = stripped + insertion + suffix
    return set_updated(page.text[:start] + new_chunk + page.text[end:], date, page.newline)


def source_maps(pages: list[Page]) -> tuple[dict[str, Page], dict[str, Page], dict[str, Page]]:
    source_by_stem: dict[str, Page] = {}
    source_by_id: dict[str, Page] = {}
    raw_to_source: dict[str, Page] = {}
    for page in pages:
        if page.path.parent.name != "sources":
            continue
        source_by_stem[page.stem.casefold()] = page
        source_id = parse_scalar(page.meta.get("source_id"))
        if source_id:
            source_by_id[source_id.casefold()] = page
        if page.page_type == "type/source":
            for item in page.sources:
                raw_to_source[Path(item).name.casefold()] = page
    return source_by_stem, source_by_id, raw_to_source


def effective_source_pages(page: Page, pages: list[Page]) -> set[Page]:
    source_by_stem, source_by_id, raw_to_source = source_maps(pages)
    result: set[Page] = set()
    for item in page.sources:
        key = item.casefold()
        if key in source_by_stem:
            result.add(source_by_stem[key])
        elif key in source_by_id:
            result.add(source_by_id[key])
        elif Path(item).name.casefold() in raw_to_source:
            result.add(raw_to_source[Path(item).name.casefold()])
    return result
