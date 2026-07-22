from __future__ import annotations

import json
import hashlib
import re
import unicodedata
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable


BASE_REQUIRED = {"title", "summary", "aliases", "tags", "created", "updated", "sources", "status"}
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

    items: list[str] = []
    current: list[str] = []
    quote = ""
    index = 0
    while index < len(inner):
        character = inner[index]
        if quote == '"' and character == "\\" and index + 1 < len(inner):
            current.extend((character, inner[index + 1]))
            index += 2
            continue
        if quote == "'" and character == "'" and index + 1 < len(inner) and inner[index + 1] == "'":
            current.extend((character, character))
            index += 2
            continue
        if quote and character == quote:
            quote = ""
            current.append(character)
        elif not quote and character in {'"', "'"} and not "".join(current).strip():
            quote = character
            current.append(character)
        elif character == "," and not quote:
            token = "".join(current).strip()
            if token:
                items.append(parse_scalar(token) or "")
            current = []
        else:
            current.append(character)
        index += 1

    token = "".join(current).strip()
    if token:
        items.append(parse_scalar(token) or "")
    return items


def parse_scalar(value: str | None) -> str | None:
    if value is None:
        return None
    value = value.strip()
    if value in {"", "null", "~"}:
        return None
    if len(value) >= 2 and value[0] == value[-1] == '"':
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return value[1:-1]
    if len(value) >= 2 and value[0] == value[-1] == "'":
        return value[1:-1].replace("''", "'")
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
        self.stem_candidates: dict[str, list[Page]] = {}
        for page in self.pages:
            self.stem_candidates.setdefault(page.stem.casefold(), []).append(page)
        self.by_stem: dict[str, Page] = {
            stem: matches[0] for stem, matches in self.stem_candidates.items() if len(matches) == 1
        }
        self.duplicate_stems: dict[str, list[Page]] = {
            stem: matches for stem, matches in self.stem_candidates.items() if len(matches) > 1
        }
        self.by_alias: dict[str, list[Page]] = {}
        for page in self.pages:
            for alias in page.aliases:
                self.by_alias.setdefault(alias.casefold(), []).append(page)

    def resolve(self, name: str) -> tuple[Page | None, str]:
        key = name.casefold()
        stem_matches = self.stem_candidates.get(key, [])
        if len(stem_matches) == 1:
            return stem_matches[0], "stem"
        if stem_matches:
            return None, "ambiguous"
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
    # Avoid consuming the carriage return in CRLF documents. A ``.*$``
    # replacement changes only the edited line to LF and creates mixed-newline
    # files on Windows.
    pattern = re.compile(rf"^{re.escape(key)}:[^\r\n]*", re.MULTILINE)
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


@dataclass
class SourceMaps:
    by_stem: dict[str, list[Page]]
    by_id: dict[str, list[Page]]
    by_raw_name: dict[str, list[Page]]
    pages: set[Page]

    def resolve(self, value: str) -> Page | None:
        """Resolve source metadata without choosing arbitrarily on collisions."""
        keys = (value.casefold(), Path(value).name.casefold())
        for mapping, key in (
            (self.by_stem, keys[0]),
            (self.by_id, keys[0]),
            (self.by_raw_name, keys[1]),
        ):
            matches = mapping.get(key, [])
            if len(matches) == 1:
                return matches[0]
            if matches:
                return None
        return None


def source_maps(pages: list[Page]) -> SourceMaps:
    source_by_stem: dict[str, list[Page]] = {}
    source_by_id: dict[str, list[Page]] = {}
    raw_to_source: dict[str, list[Page]] = {}
    source_pages: set[Page] = set()
    for page in pages:
        if page.path.parent.name != "sources":
            continue
        source_pages.add(page)
        source_by_stem.setdefault(page.stem.casefold(), []).append(page)
        source_id = parse_scalar(page.meta.get("source_id"))
        if source_id:
            source_by_id.setdefault(source_id.casefold(), []).append(page)
        # Local reference pages are raw-backed sources too. Restricting this
        # map to type/source made their raw filenames impossible to resolve.
        if parse_scalar(page.meta.get("source_kind")) == "raw":
            for item in page.sources:
                raw_to_source.setdefault(Path(item).name.casefold(), []).append(page)
    return SourceMaps(source_by_stem, source_by_id, raw_to_source, source_pages)


def effective_source_pages(page: Page, sources: SourceMaps) -> set[Page]:
    result: set[Page] = set()
    for item in page.sources:
        resolved = sources.resolve(item)
        if resolved:
            result.add(resolved)
    return result


def expected_count(page: Page, sources: SourceMaps) -> tuple[str, int] | None:
    if page.page_type == "type/source":
        return "raw 파일", len(page.sources)
    if page.page_type == "type/reference":
        return "핵심 문헌", len(parse_flow_list(page.meta.get("primary_sources")))
    if page.is_content:
        return "근거", len(effective_source_pages(page, sources))
    return None


def effective_graph_visibility(page: Page) -> str:
    explicit = parse_scalar(page.meta.get("graph_visibility"))
    return explicit or ("hidden" if page.is_special else "public")


def public_knowledge_pages(pages: list[Page]) -> list[Page]:
    return [
        page
        for page in pages
        if page.path.parent.name != "sources"
        and not page.is_special
        and effective_graph_visibility(page) == "public"
    ]


def public_graph_pages(pages: list[Page]) -> list[Page]:
    return [
        page
        for page in pages
        if not page.is_special and effective_graph_visibility(page) == "public"
    ]


def knowledge_metrics(pages: list[Page]) -> dict[str, int]:
    sources = source_maps(pages)
    knowledge = public_knowledge_pages(pages)
    public_documents = public_graph_pages(pages)
    event_documents = sum(bool(parse_scalar(page.meta.get("event_start"))) for page in public_documents)
    publication_documents = sum(
        not parse_scalar(page.meta.get("event_start"))
        and bool(parse_scalar(page.meta.get("publication_year")))
        for page in public_documents
    )
    snapshot_counts = {
        status: sum(parse_scalar(page.meta.get("snapshot_status")) == status for page in sources.pages)
        for status in ("local", "archived", "external-only")
    }
    return {
        "knowledge_documents": len(knowledge),
        "public_documents": len(public_documents),
        "evidence_documents": len(sources.pages),
        "document_evidence_links": sum(len(effective_source_pages(page, sources)) for page in knowledge),
        "event_documents": event_documents,
        "publication_documents": publication_documents,
        "dated_documents": event_documents + publication_documents,
        "undated_documents": len(public_documents) - event_documents - publication_documents,
        "local_sources": snapshot_counts["local"],
        "archived_sources": snapshot_counts["archived"],
        "external_only_sources": snapshot_counts["external-only"],
    }


def stable_graph_id(page: Page) -> str:
    prefix = {
        "concepts": "concept",
        "entities": "entity",
        "analyses": "analysis",
        "meta": "meta",
    }.get(page.path.parent.name)
    if not prefix:
        raise ValueError(f"{page.rel}: unsupported graph-id category")
    seed = unicodedata.normalize("NFKC", f"{page.path.parent.name}/{page.stem}").casefold()
    digest = hashlib.sha256(seed.encode("utf-8")).hexdigest()[:16]
    return f"{prefix}-{digest}"
