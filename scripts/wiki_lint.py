from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from dataclasses import asdict, dataclass
from datetime import date
from pathlib import Path

from wiki_common import (
    BASE_REQUIRED,
    CONTENT_DIRS,
    VALID_STATUSES,
    Resolver,
    effective_source_pages,
    expected_count,
    links_in_section,
    load_pages,
    knowledge_metrics,
    normalize_heading,
    parse_flow_list,
    parse_scalar,
    section_span,
    source_maps,
)


GRAPH_VISIBILITIES = {"public", "context", "hidden"}
HISTORICAL_LAYERS = {"theory", "machine", "architecture", "software", "system", "service", "measurement"}
CAPABILITY_LAYERS = {
    "computability",
    "complexity",
    "programmability",
    "realized-performance",
    "scalability",
    "resource-efficiency",
    "reliable-results",
}
CURATED_RELATIONS = {
    "broader",
    "narrower",
    "prerequisite_for",
    "enables",
    "constrains",
    "measures",
    "implements",
    "exemplifies",
    "precedes",
    "responds_to",
    "contradicts",
    "synthesizes",
}
HISTORICAL_RELATIONS = {"responds_to", "enables", "precedes", "constrains"}


@dataclass
class Issue:
    severity: str
    code: str
    path: str
    line: int
    message: str


def field_line(text: str, key: str) -> int:
    match = re.search(rf"^{re.escape(key)}:", text, re.MULTILINE)
    return text.count("\n", 0, match.start()) + 1 if match else 1


def add(issues: list[Issue], severity: str, code: str, page_path: str, line: int, message: str) -> None:
    issues.append(Issue(severity, code, page_path, line, message))


def section_links_resolved(page, heading: str, resolver: Resolver) -> set:
    result = set()
    for name in links_in_section(page, heading, level=2, last=True):
        target, kind = resolver.resolve(name)
        if target and kind in {"stem", "alias"}:
            result.add(target)
    return result


def index_sections(text: str) -> dict[str, str]:
    matches = list(re.finditer(r"^##\s+(.+?)\s*$", text, re.MULTILINE))
    result: dict[str, str] = {}
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        result[match.group(1).strip()] = text[match.end() : end]
    return result


def split_table_row(line: str) -> list[str]:
    value = line.strip().removeprefix("|").removesuffix("|")
    cells: list[str] = []
    current: list[str] = []
    wiki_depth = 0
    in_code = False
    index = 0
    while index < len(value):
        pair = value[index : index + 2]
        if not in_code and pair == "[[":
            wiki_depth += 1
            current.extend(pair)
            index += 2
        elif not in_code and pair == "]]" and wiki_depth:
            wiki_depth -= 1
            current.extend(pair)
            index += 2
        elif value[index] == "`":
            in_code = not in_code
            current.append(value[index])
            index += 1
        elif value[index] == "|" and not wiki_depth and not in_code:
            cells.append("".join(current).strip())
            current = []
            index += 1
        else:
            current.append(value[index])
            index += 1
    cells.append("".join(current).strip())
    return cells


def lint_relation_table(page, resolver: Resolver, issues: list[Issue]) -> None:
    lines = page.text.splitlines()
    relation_spans: list[tuple[int, int]] = []
    active_start: int | None = None
    in_fence = False
    for index, line in enumerate(lines):
        if re.match(r"^\s*(```|~~~)", line):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        heading = re.match(r"^#{1,2}\s+(.+?)\s*$", line)
        if not heading:
            continue
        if active_start is not None:
            relation_spans.append((active_start, index))
            active_start = None
        if heading.group(1).strip() == "관계" and line.startswith("## "):
            active_start = index + 1
    if active_start is not None:
        relation_spans.append((active_start, len(lines)))
    if not relation_spans:
        return
    seen_relations: dict[tuple[str, str], int] = {}
    for start, end in relation_spans:
        columns: dict[str, int] | None = None
        for offset, line in enumerate(lines[start:end]):
            if not line.strip().startswith("|"):
                continue
            cells = split_table_row(line)
            if cells and all(re.fullmatch(r":?-{3,}:?", cell) for cell in cells):
                continue
            line_no = start + offset + 1
            if columns is None:
                names = [re.sub(r"[`*_]", "", cell).strip() for cell in cells]
                columns = {name: names.index(name) for name in ("관계", "대상", "설명", "근거") if name in names}
                missing = {"관계", "대상", "설명"} - set(columns)
                if missing:
                    add(issues, "error", "graph.relation_columns", page.rel, line_no, f"관계 표 필수 열 누락: {sorted(missing)}")
                    break
                continue

            kind = re.sub(r"[`*]", "", cells[columns["관계"]] if columns["관계"] < len(cells) else "").strip().replace("-", "_")
            if not kind:
                continue
            if kind not in CURATED_RELATIONS:
                add(issues, "error", "graph.relation_kind", page.rel, line_no, f"허용되지 않은 관계: {kind}")
            target_cell = cells[columns["대상"]] if columns["대상"] < len(cells) else ""
            target_match = re.search(r"\[\[([^\]|#]+)", target_cell)
            target = None
            target_name = ""
            target_key = ""
            if not target_match:
                add(issues, "error", "graph.relation_target", page.rel, line_no, "관계 대상은 위키링크여야 함")
            else:
                target_name = target_match.group(1).strip()
                target, target_kind = resolver.resolve(target_name)
                if not target or target_kind not in {"stem", "alias"}:
                    add(issues, "error", "graph.relation_target", page.rel, line_no, f"관계 대상 문서를 찾을 수 없음: {target_name}")
                    target_key = target_name.casefold()
                else:
                    target_key = target.rel.casefold()
            if kind in CURATED_RELATIONS and target_key:
                relation_key = (kind, target_key)
                first_line = seen_relations.get(relation_key)
                if first_line is not None:
                    target_label = target.stem if target else target_name
                    add(
                        issues,
                        "error",
                        "graph.relation_duplicate",
                        page.rel,
                        line_no,
                        f"중복 관계 행: {kind} → {target_label} (첫 행 {first_line})",
                    )
                else:
                    seen_relations[relation_key] = line_no
            note = cells[columns["설명"]] if columns["설명"] < len(cells) else ""
            if not re.sub(r"[`*_]", "", note).strip():
                add(issues, "error", "graph.relation_note", page.rel, line_no, "관계 설명이 비어 있음")
            evidence_cell = cells[columns["근거"]] if "근거" in columns and columns["근거"] < len(cells) else ""
            evidence_names = re.findall(r"\[\[([^\]|#]+)", evidence_cell)
            if kind in HISTORICAL_RELATIONS and not evidence_names:
                add(issues, "error", "graph.relation_evidence", page.rel, line_no, f"역사 관계 {kind}에는 직접 근거 위키링크가 필요함")
            for evidence_name in evidence_names:
                evidence, evidence_kind = resolver.resolve(evidence_name.strip())
                if not evidence or evidence_kind not in {"stem", "alias"}:
                    add(issues, "error", "graph.relation_evidence", page.rel, line_no, f"관계 근거 문서를 찾을 수 없음: {evidence_name.strip()}")
                elif evidence.page_type not in {"type/source", "type/reference"}:
                    add(
                        issues,
                        "error",
                        "graph.relation_evidence_type",
                        page.rel,
                        line_no,
                        f"관계 근거는 type/source 또는 type/reference 문서여야 함: {evidence_name.strip()}",
                    )


def lint(root: Path) -> tuple[list[Issue], dict[str, int]]:
    pages = load_pages(root)
    resolver = Resolver(pages)
    issues: list[Issue] = []
    raw_files = {path.name.casefold() for path in (root / "raw").rglob("*") if path.is_file()}
    sources = source_maps(pages)

    special_pages = {
        name: next(
            (page for page in pages if page.path.name == name and page.path.parent == root / "wiki"),
            None,
        )
        for name in ("index.md", "log.md", "overview.md")
    }
    for name, page in special_pages.items():
        if page is None:
            add(issues, "error", "structure.special_missing", f"wiki/{name}", 1, f"필수 파일 누락: wiki/{name}")

    type_for_dir = {
        "analyses": "type/analysis",
        "concepts": "type/concept",
        "entities": "type/entity",
    }

    source_ids: dict[str, list] = defaultdict(list)
    graph_node_ids: dict[str, list] = defaultdict(list)
    for page in pages:
        missing = sorted(BASE_REQUIRED - set(page.meta))
        if missing:
            add(issues, "error", "frontmatter.required", page.rel, 1, f"필수 필드 누락: {', '.join(missing)}")
        status = parse_scalar(page.meta.get("status"))
        if status not in VALID_STATUSES:
            add(issues, "error", "frontmatter.status", page.rel, field_line(page.text, "status"), f"허용되지 않은 상태: {status}")
        if status and f"status/{status}" not in page.tags:
            add(issues, "error", "frontmatter.status_tag", page.rel, field_line(page.text, "tags"), "status와 status/* 태그가 다름")
        if not any(tag.startswith("type/") for tag in page.tags):
            add(issues, "error", "frontmatter.type_tag", page.rel, field_line(page.text, "tags"), "type/* 태그 누락")
        expected_type = type_for_dir.get(page.path.parent.name)
        if expected_type and page.page_type != expected_type:
            add(issues, "error", "frontmatter.directory_type", page.rel, field_line(page.text, "tags"), f"디렉터리는 {expected_type}을 요구함")
        for key in ("created", "updated"):
            value = parse_scalar(page.meta.get(key))
            try:
                if value:
                    date.fromisoformat(value)
            except ValueError:
                add(issues, "error", "frontmatter.date", page.rel, field_line(page.text, key), f"잘못된 날짜: {value}")

        graph_id = parse_scalar(page.meta.get("graph_id"))
        source_id_for_graph = parse_scalar(page.meta.get("source_id"))
        if graph_id and not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", graph_id):
            add(issues, "error", "graph.id_format", page.rel, field_line(page.text, "graph_id"), "graph_id는 소문자 ASCII slug여야 함")
        effective_graph_id = source_id_for_graph or graph_id
        if effective_graph_id:
            graph_node_ids[effective_graph_id.casefold()].append(page)
        visibility = parse_scalar(page.meta.get("graph_visibility"))
        if visibility and visibility not in GRAPH_VISIBILITIES:
            add(issues, "error", "graph.visibility", page.rel, field_line(page.text, "graph_visibility"), f"허용되지 않은 graph_visibility: {visibility}")
        years: dict[str, int] = {}
        for key_name in ("publication_year", "event_start", "event_end"):
            raw_year = parse_scalar(page.meta.get(key_name))
            if not raw_year:
                continue
            try:
                year = int(raw_year)
                if year < -9999 or year > 9999:
                    raise ValueError
                years[key_name] = year
            except ValueError:
                add(issues, "error", "graph.year", page.rel, field_line(page.text, key_name), f"잘못된 역사 연도: {raw_year}")
        if "event_start" in years and "event_end" in years and years["event_start"] > years["event_end"]:
            add(issues, "error", "graph.year_range", page.rel, field_line(page.text, "event_end"), "event_end는 event_start보다 이를 수 없음")
        if "event_end" in years and "event_start" not in years:
            add(issues, "error", "graph.year_range", page.rel, field_line(page.text, "event_end"), "event_end에는 event_start가 필요함")
        historical_layer = parse_scalar(page.meta.get("historical_layer"))
        if historical_layer and historical_layer not in HISTORICAL_LAYERS:
            add(issues, "error", "graph.historical_layer", page.rel, field_line(page.text, "historical_layer"), f"허용되지 않은 historical_layer: {historical_layer}")
        for layer in parse_flow_list(page.meta.get("capability_layers")):
            if layer not in CAPABILITY_LAYERS:
                add(issues, "error", "graph.capability_layer", page.rel, field_line(page.text, "capability_layers"), f"허용되지 않은 capability_layers 값: {layer}")
        historical_note = parse_scalar(page.meta.get("historical_note")) or ""
        if len(historical_note) > 300:
            add(issues, "error", "graph.historical_note", page.rel, field_line(page.text, "historical_note"), "historical_note는 300자 이하여야 함")

        if page.path.parent.name == "sources":
            source_id = parse_scalar(page.meta.get("source_id"))
            if not source_id:
                add(issues, "error", "provenance.source_id", page.rel, 1, "source_id 누락")
            else:
                source_ids[source_id.casefold()].append(page)
            source_kind = parse_scalar(page.meta.get("source_kind"))
            required_provenance = {"primary_sources", "supporting_sources", "source_urls", "retrieved", "version", "snapshot_status"}
            for key in sorted(required_provenance - set(page.meta)):
                add(issues, "error", "provenance.field", page.rel, 1, f"provenance 필드 누락: {key}")
            if page.page_type == "type/source":
                if source_id and not re.fullmatch(r"src-\d{3}", source_id):
                    add(issues, "error", "provenance.source_id_format", page.rel, field_line(page.text, "source_id"), "정규 소스 ID는 src-NNN 형식이어야 함")
                if source_kind != "raw":
                    add(issues, "error", "provenance.kind", page.rel, field_line(page.text, "source_kind"), "정규 소스는 source_kind: raw여야 함")
                missing_raw = [item for item in page.sources if Path(item).name.casefold() not in raw_files]
                if missing_raw:
                    add(issues, "error", "provenance.raw_missing", page.rel, field_line(page.text, "sources"), f"없는 raw 파일: {missing_raw}")
                provenance_raw = parse_flow_list(page.meta.get("primary_sources")) + parse_flow_list(page.meta.get("supporting_sources"))
                if set(provenance_raw) != set(page.sources):
                    add(issues, "error", "provenance.raw_partition", page.rel, field_line(page.text, "primary_sources"), "primary/supporting_sources가 sources의 raw 파일을 정확히 분할해야 함")
                if parse_scalar(page.meta.get("snapshot_status")) != "local":
                    add(issues, "error", "provenance.snapshot_kind", page.rel, field_line(page.text, "snapshot_status"), "source_kind: raw는 snapshot_status: local이어야 함")
            elif page.page_type == "type/reference":
                if source_id and not re.fullmatch(r"ref-\d{3}", source_id):
                    add(issues, "error", "provenance.source_id_format", page.rel, field_line(page.text, "source_id"), "참고 자료 ID는 ref-NNN 형식이어야 함")
                if source_kind not in {"raw", "external"}:
                    add(issues, "error", "provenance.kind", page.rel, field_line(page.text, "source_kind"), "참고 자료의 source_kind는 raw 또는 external이어야 함")
                if not parse_flow_list(page.meta.get("primary_sources")):
                    add(issues, "error", "provenance.primary", page.rel, field_line(page.text, "primary_sources"), "primary_sources가 비어 있음")
                if source_kind == "raw":
                    missing_raw = [item for item in page.sources if Path(item).name.casefold() not in raw_files]
                    if missing_raw:
                        add(issues, "error", "provenance.raw_missing", page.rel, field_line(page.text, "sources"), f"없는 raw 파일: {missing_raw}")
                    provenance_raw = parse_flow_list(page.meta.get("primary_sources")) + parse_flow_list(page.meta.get("supporting_sources"))
                    if set(provenance_raw) != set(page.sources):
                        add(issues, "error", "provenance.raw_partition", page.rel, field_line(page.text, "primary_sources"), "primary/supporting_sources가 sources의 raw 파일을 정확히 분할해야 함")
                    if parse_scalar(page.meta.get("snapshot_status")) != "local":
                        add(issues, "error", "provenance.snapshot_kind", page.rel, field_line(page.text, "snapshot_status"), "source_kind: raw는 snapshot_status: local이어야 함")
                elif source_kind == "external":
                    urls = parse_flow_list(page.meta.get("source_urls"))
                    if not urls or any(not re.match(r"^https?://", url) for url in urls):
                        add(issues, "error", "provenance.urls", page.rel, field_line(page.text, "source_urls"), "유효한 source_urls가 필요함")
                    if parse_scalar(page.meta.get("snapshot_status")) == "local":
                        add(issues, "error", "provenance.snapshot_kind", page.rel, field_line(page.text, "snapshot_status"), "source_kind: external은 external-only 또는 archived여야 함")
                retrieved = parse_scalar(page.meta.get("retrieved"))
                try:
                    if not retrieved:
                        raise ValueError
                    date.fromisoformat(retrieved)
                except ValueError:
                    add(issues, "error", "provenance.retrieved", page.rel, field_line(page.text, "retrieved"), "retrieved는 YYYY-MM-DD여야 함")
            snapshot_status = parse_scalar(page.meta.get("snapshot_status"))
            if snapshot_status not in {"local", "external-only", "archived"}:
                add(issues, "error", "provenance.snapshot_status", page.rel, field_line(page.text, "snapshot_status"), f"허용되지 않은 snapshot_status: {snapshot_status}")
            metadata_urls = set(parse_flow_list(page.meta.get("source_urls")))
            body_urls = set(re.findall(r"\]\((https?://[^)\s]+)\)", page.text))
            if metadata_urls != body_urls:
                add(issues, "error", "provenance.url_mismatch", page.rel, field_line(page.text, "source_urls"), f"source_urls와 본문 URL 불일치: metadata_only={sorted(metadata_urls - body_urls)}, body_only={sorted(body_urls - metadata_urls)}")

        # Public knowledge pages cite wiki source/reference pages. Source pages
        # themselves keep raw filenames in this field and are intentionally
        # validated by the provenance rules above instead.
        effective_visibility = visibility or ("hidden" if page.is_special else "public")
        is_source_page = page.path.parent.name == "sources" or page.page_type in {"type/source", "type/reference"}
        if not is_source_page and not page.is_special and effective_visibility == "public":
            for source_value in page.sources:
                source_page = sources.resolve(source_value)
                if source_page is None or source_page.page_type not in {"type/source", "type/reference"}:
                    add(
                        issues,
                        "error",
                        "sources.frontmatter_unresolved",
                        page.rel,
                        field_line(page.text, "sources"),
                        f"frontmatter sources가 유일한 소스·참고 자료 문서로 해석되지 않음: {source_value}",
                    )

        heading_names = [name for _, name, _ in page.headings]
        if page.path.name != "log.md":
            if heading_names.count("출처") != 1 or heading_names.count("관련 항목") != 1 or not heading_names or heading_names[-1] != "관련 항목":
                add(issues, "error", "sections.bottom", page.rel, 1, "출처 1개와 마지막 관련 항목 1개가 필요함")
        if page.is_content:
            related_span = section_span(page.text, "관련 항목", level=2, last=True)
            if related_span:
                related_chunk = page.text[related_span[0] : related_span[1]]
                related_items = re.findall(r"^-\s+\[\[([^\]]+)\]\](.*)$", related_chunk, re.MULTILINE)
                if len(related_items) > 5:
                    add(issues, "error", "links.related_budget", page.rel, 1, f"관련 항목은 최대 5개까지 허용함: {len(related_items)}개")
                for raw_target, tail in related_items:
                    if not tail.strip().lstrip("-–—:·").strip():
                        target_name = raw_target.split("|", 1)[0].split("#", 1)[0].strip()
                        add(issues, "error", "links.related_reason", page.rel, 1, f"관련 항목에 한 줄 이유가 필요함: {target_name}")
        lint_relation_table(page, resolver, issues)

    for graph_id, matches in graph_node_ids.items():
        if len(matches) > 1:
            for page in matches:
                add(issues, "error", "graph.id_duplicate", page.rel, field_line(page.text, "graph_id"), f"중복 그래프 노드 ID: {graph_id}")

    for source_id, matches in source_ids.items():
        if len(matches) > 1:
            for page in matches:
                add(issues, "error", "provenance.source_id_duplicate", page.rel, field_line(page.text, "source_id"), f"중복 source_id: {source_id}")
    for prefix in ("src", "ref"):
        numbers = sorted(
            int(source_id.split("-", 1)[1])
            for source_id in source_ids
            if re.fullmatch(rf"{prefix}-\d{{3}}", source_id)
        )
        expected_numbers = list(range(1, len(numbers) + 1))
        if numbers != expected_numbers:
            add(issues, "error", "provenance.source_id_sequence", "wiki/sources", 1, f"{prefix} ID 연속성 오류: actual={numbers}, expected={expected_numbers}")

    for stem, matches in resolver.duplicate_stems.items():
        locations = sorted(page.rel for page in matches)
        for page in matches:
            add(
                issues,
                "error",
                "links.stem_duplicate",
                page.rel,
                1,
                f"중복 파일 stem '{stem}': {locations}",
            )

    # Alias collisions are risky even when current exact-stem links resolve safely.
    for alias, matches in resolver.by_alias.items():
        unique = list(dict.fromkeys(matches))
        if len(unique) > 1:
            for page in unique:
                add(issues, "error", "links.alias_duplicate", page.rel, field_line(page.text, "aliases"), f"중복 alias '{alias}'")
        exact = resolver.by_stem.get(alias)
        if exact and any(page is not exact for page in unique):
            for page in unique:
                if page is not exact:
                    add(issues, "error", "links.alias_stem_collision", page.rel, field_line(page.text, "aliases"), f"alias '{alias}'가 {exact.rel} 파일명과 충돌")

    incoming: Counter = Counter()
    for page in pages:
        for link in page.links:
            if not link.base:
                continue
            target, kind = resolver.resolve(link.base)
            if not target:
                add(issues, "error", f"links.{kind}", page.rel, link.line, f"해석할 수 없는 링크: [[{link.raw}]]")
                continue
            incoming[target] += 1
            if link.anchor:
                headings = {normalize_heading(name) for _, name, _ in target.headings}
                if normalize_heading(link.anchor) not in headings:
                    add(issues, "error", "links.bad_anchor", page.rel, link.line, f"없는 섹션: [[{link.raw}]]")

    for page in pages:
        if page.is_content:
            semantic_incoming = 0
            for source in pages:
                if source.is_special or source is page:
                    continue
                for link in source.links:
                    target, _ = resolver.resolve(link.base)
                    if target is page:
                        semantic_incoming += 1
                        break
            if semantic_incoming == 0:
                add(issues, "error", "links.orphan", page.rel, 1, "콘텐츠 페이지로 들어오는 의미적 링크가 없음")

    # Source metadata, source section, and explicit body source links must agree.
    source_pages = sources.pages
    for page in pages:
        if not page.is_content:
            continue
        expected_sources = effective_source_pages(page, sources)
        cited_sources = section_links_resolved(page, "출처", resolver) & source_pages
        if expected_sources != cited_sources:
            add(
                issues,
                "error",
                "sources.section_mismatch",
                page.rel,
                field_line(page.text, "sources"),
                f"frontmatter={sorted(p.stem for p in expected_sources)}, 출처 절={sorted(p.stem for p in cited_sources)}",
            )
        source_span = section_span(page.text, "출처", level=2, last=True)
        body = page.text[: source_span[0]] if source_span else page.text
        explicit = set()
        for raw in re.findall(r"\[\[([^\]]+)\]\]", body):
            name = raw.split("|", 1)[0].split("#", 1)[0].strip()
            target, _ = resolver.resolve(name)
            if target in source_pages:
                explicit.add(target)
        extra = explicit - expected_sources
        if extra:
            add(issues, "error", "sources.body_missing_metadata", page.rel, 1, f"본문 소스가 metadata에 없음: {sorted(p.stem for p in extra)}")

    # Index coverage and generated count labels.
    index_page = special_pages["index.md"]
    if index_page:
        sections = index_sections(index_page.text)
        expected_sections = {
            "소스 (Sources)": {page for page in pages if page.page_type == "type/source"},
            "참고 자료 (References)": {page for page in pages if page.page_type == "type/reference"},
            "인물 (Entities)": {page for page in pages if page.path.parent.name == "entities"},
            "개념 (Concepts)": {page for page in pages if page.path.parent.name == "concepts"},
            "분석 (Analyses)": {page for page in pages if page.path.parent.name == "analyses"},
            "메타 (Meta)": {
                page
                for page in pages
                if page.path.parent.name == "meta" or (page.is_special and page.path.name != "index.md")
            },
        }
        for heading, expected_pages in expected_sections.items():
            chunk = sections.get(heading)
            if chunk is None:
                add(issues, "error", "index.section", index_page.rel, 1, f"색인 섹션 누락: {heading}")
                continue
            listed = set()
            for match in re.finditer(r"^-\s+\[\[([^\]]+)\]\].*$", chunk, re.MULTILINE):
                raw = match.group(1)
                name = raw.split("|", 1)[0].split("#", 1)[0].strip()
                target, _ = resolver.resolve(name)
                if target:
                    listed.add(target)
                    count = expected_count(target, sources)
                    if count:
                        label, number = count
                        line = match.group(0)
                        if f"({label} {number}개)" not in line:
                            line_offset = index_page.text.find(line)
                            add(issues, "error", "index.count", index_page.rel, index_page.text.count("\n", 0, line_offset) + 1, f"{target.stem}: ({label} {number}개) 필요")
            missing = expected_pages - listed
            extra = listed - expected_pages
            if missing or extra:
                add(issues, "error", "index.coverage", index_page.rel, 1, f"{heading}: 누락={sorted(p.stem for p in missing)}, 초과={sorted(p.stem for p in extra)}")

    log_page = special_pages["log.md"]
    if log_page:
        h2 = [name for level, name, _ in log_page.headings if level == 2]
        if h2.count("출처") != 1 or h2.count("관련 항목") != 1 or not h2 or h2[-1] != "관련 항목":
            add(issues, "error", "log.heading_hierarchy", log_page.rel, 1, "log는 전역 H2 출처/관련 항목 1쌍만 가져야 함")

    overview_page = special_pages["overview.md"]
    if overview_page:
        status_counts = Counter(parse_scalar(page.meta.get("status")) or "unknown" for page in pages)
        expected_status_summary = (
            f"운영 상태: 전체 {len(pages)}개 페이지 중 active {status_counts['active']}개, "
            f"draft {status_counts['draft']}개, review {status_counts['review']}개, "
            f"archived {status_counts['archived']}개다."
        )
        if expected_status_summary not in overview_page.text:
            add(issues, "error", "overview.status_summary", overview_page.rel, 1, "자동 운영 상태 통계가 실제 페이지 상태와 다름")
        metrics = knowledge_metrics(pages)
        expected_overview_fragments = {
            "overview.evidence_summary": (
                f"근거 계보 렌즈는 {metrics['knowledge_documents']}개 공개 지식 문서, "
                f"{metrics['evidence_documents']}개 정규 소스·참고 자료와 "
                f"{metrics['document_evidence_links']}개 문서–근거 연결을"
            ),
            "overview.preservation_summary": (
                f"근거 문서의 로컬 원본 {metrics['local_sources']}개, "
                f"보존 스냅샷 {metrics['archived_sources']}개, "
                f"외부 링크 의존 {metrics['external_only_sources']}개는"
            ),
            "overview.history_summary": (
                f"현재 원전 대조로 연도가 기록된 문서는 {metrics['dated_documents']}개이고, "
                f"그중 사건 시점을 가진 문서 {metrics['event_documents']}개와 "
                f"출판 시점을 가진 문서 {metrics['publication_documents']}개를"
            ),
            "overview.undated_summary": f"연도를 확인하지 못한 {metrics['undated_documents']}개는",
        }
        for code, fragment in expected_overview_fragments.items():
            if fragment not in overview_page.text:
                add(issues, "error", code, overview_page.rel, 1, "개요의 자동 지식 지도 통계가 실제 페이지 메타데이터와 다름")

    shallow = 0
    for page in pages:
        if not page.is_content or parse_scalar(page.meta.get("status")) != "active":
            continue
        body = re.sub(r"^---\r?\n.*?\r?\n---\s*", "", page.text, flags=re.DOTALL)
        body = re.split(r"^##\s+출처\s*$", body, flags=re.MULTILINE)[0]
        chars = len(re.sub(r"\s+", "", body))
        if chars < 300:
            shallow += 1
            add(issues, "warning", "status.shallow_active", page.rel, 1, f"본문 {chars}자이지만 active 상태")

    stats = {
        "pages": len(pages),
        "links": sum(len(page.links) for page in pages),
        "errors": sum(issue.severity == "error" for issue in issues),
        "warnings": sum(issue.severity == "warning" for issue in issues),
        "shallow_active": shallow,
        "graph_id_missing": sum(
            page.path.parent.name in {"concepts", "entities", "analyses", "meta"}
            and not parse_scalar(page.meta.get("graph_id"))
            for page in pages
        ),
        **knowledge_metrics(pages),
    }
    return issues, stats


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser(description="CS_Wiki structure and provenance linter")
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--json", action="store_true", dest="as_json")
    args = parser.parse_args()
    issues, stats = lint(args.root.resolve())
    if args.as_json:
        print(json.dumps({"stats": stats, "issues": [asdict(issue) for issue in issues]}, ensure_ascii=False, indent=2))
    else:
        print(f"CS_Wiki lint: {stats['pages']} pages, {stats['links']} links, {stats['errors']} errors, {stats['warnings']} warnings")
        for issue in issues:
            print(f"[{issue.severity.upper()}] {issue.code} {issue.path}:{issue.line} — {issue.message}")
    return 1 if stats["errors"] else 0


if __name__ == "__main__":
    sys.exit(main())
