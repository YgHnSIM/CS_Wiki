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
    links_in_section,
    load_pages,
    normalize_heading,
    parse_flow_list,
    parse_scalar,
    section_span,
    source_maps,
)


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


def expected_count(page, pages) -> tuple[str, int] | None:
    if page.page_type == "type/source":
        return "raw 파일", len(page.sources)
    if page.page_type == "type/reference":
        return "핵심 문헌", len(parse_flow_list(page.meta.get("primary_sources")))
    if page.is_content:
        return "근거", len(effective_source_pages(page, pages))
    return None


def lint(root: Path) -> tuple[list[Issue], dict[str, int]]:
    pages = load_pages(root)
    resolver = Resolver(pages)
    issues: list[Issue] = []
    raw_files = {path.name.casefold() for path in (root / "raw").rglob("*") if path.is_file()}
    source_by_stem, source_by_id, raw_to_source = source_maps(pages)

    type_for_dir = {
        "analyses": "type/analysis",
        "concepts": "type/concept",
        "entities": "type/entity",
    }

    source_ids: dict[str, list] = defaultdict(list)
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
                if source_kind != "external":
                    add(issues, "error", "provenance.kind", page.rel, field_line(page.text, "source_kind"), "참고 자료는 source_kind: external이어야 함")
                if not parse_flow_list(page.meta.get("primary_sources")):
                    add(issues, "error", "provenance.primary", page.rel, field_line(page.text, "primary_sources"), "primary_sources가 비어 있음")
                urls = parse_flow_list(page.meta.get("source_urls"))
                if not urls or any(not re.match(r"^https?://", url) for url in urls):
                    add(issues, "error", "provenance.urls", page.rel, field_line(page.text, "source_urls"), "유효한 source_urls가 필요함")
                retrieved = parse_scalar(page.meta.get("retrieved"))
                try:
                    if not retrieved:
                        raise ValueError
                    date.fromisoformat(retrieved)
                except ValueError:
                    add(issues, "error", "provenance.retrieved", page.rel, field_line(page.text, "retrieved"), "retrieved는 YYYY-MM-DD여야 함")
                if parse_scalar(page.meta.get("snapshot_status")) == "local":
                    add(issues, "error", "provenance.snapshot_kind", page.rel, field_line(page.text, "snapshot_status"), "source_kind: external은 external-only 또는 archived여야 함")
            snapshot_status = parse_scalar(page.meta.get("snapshot_status"))
            if snapshot_status not in {"local", "external-only", "archived"}:
                add(issues, "error", "provenance.snapshot_status", page.rel, field_line(page.text, "snapshot_status"), f"허용되지 않은 snapshot_status: {snapshot_status}")
            metadata_urls = set(parse_flow_list(page.meta.get("source_urls")))
            body_urls = set(re.findall(r"\]\((https?://[^)\s]+)\)", page.text))
            if metadata_urls != body_urls:
                add(issues, "error", "provenance.url_mismatch", page.rel, field_line(page.text, "source_urls"), f"source_urls와 본문 URL 불일치: metadata_only={sorted(metadata_urls - body_urls)}, body_only={sorted(body_urls - metadata_urls)}")

        heading_names = [name for _, name, _ in page.headings]
        if page.path.name != "log.md":
            if heading_names.count("출처") != 1 or heading_names.count("관련 항목") != 1 or not heading_names or heading_names[-1] != "관련 항목":
                add(issues, "error", "sections.bottom", page.rel, 1, "출처 1개와 마지막 관련 항목 1개가 필요함")

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

    # Related links must be symmetric inside the related section.
    for page in pages:
        if not page.is_content:
            continue
        for name in links_in_section(page, "관련 항목", level=2, last=True):
            target, _ = resolver.resolve(name)
            if not target or not target.is_content or target is page:
                continue
            reverse = {value.casefold() for value in links_in_section(target, "관련 항목", level=2, last=True)}
            if page.stem.casefold() not in reverse and not any(
                resolver.resolve(value)[0] is page for value in links_in_section(target, "관련 항목", level=2, last=True)
            ):
                add(issues, "error", "links.related_asymmetric", page.rel, 1, f"{target.rel}의 관련 항목에 역링크가 없음")

    # Source metadata, source section, and explicit body source links must agree.
    source_pages = set(source_by_stem.values())
    for page in pages:
        if not page.is_content:
            continue
        expected_sources = effective_source_pages(page, pages)
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
    index_page = next(page for page in pages if page.path.name == "index.md" and page.path.parent.name == "wiki")
    sections = index_sections(index_page.text)
    expected_sections = {
        "소스 (Sources)": {page for page in pages if page.page_type == "type/source"},
        "참고 자료 (References)": {page for page in pages if page.page_type == "type/reference"},
        "인물 (Entities)": {page for page in pages if page.path.parent.name == "entities"},
        "개념 (Concepts)": {page for page in pages if page.path.parent.name == "concepts"},
        "분석 (Analyses)": {page for page in pages if page.path.parent.name == "analyses"},
        "메타 (Meta)": {page for page in pages if page.is_special and page.path.name != "index.md"},
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
                count = expected_count(target, pages)
                if count:
                    label, number = count
                    line = match.group(0)
                    if f"({label} {number}개)" not in line:
                        add(issues, "error", "index.count", index_page.rel, index_page.text.count("\n", 0, index_page.text.find(line)) + 1, f"{target.stem}: ({label} {number}개) 필요")
        missing = expected_pages - listed
        extra = listed - expected_pages
        if missing or extra:
            add(issues, "error", "index.coverage", index_page.rel, 1, f"{heading}: 누락={sorted(p.stem for p in missing)}, 초과={sorted(p.stem for p in extra)}")

    log_page = next(page for page in pages if page.path.name == "log.md" and page.path.parent.name == "wiki")
    h2 = [name for level, name, _ in log_page.headings if level == 2]
    if h2.count("출처") != 1 or h2.count("관련 항목") != 1 or not h2 or h2[-1] != "관련 항목":
        add(issues, "error", "log.heading_hierarchy", log_page.rel, 1, "log는 전역 H2 출처/관련 항목 1쌍만 가져야 함")

    overview_page = next(page for page in pages if page.path.name == "overview.md" and page.path.parent.name == "wiki")
    status_counts = Counter(parse_scalar(page.meta.get("status")) or "unknown" for page in pages)
    expected_status_summary = (
        f"운영 상태: 전체 {len(pages)}개 페이지 중 active {status_counts['active']}개, "
        f"draft {status_counts['draft']}개, review {status_counts['review']}개, "
        f"archived {status_counts['archived']}개다."
    )
    if expected_status_summary not in overview_page.text:
        add(issues, "error", "overview.status_summary", overview_page.rel, 1, "자동 운영 상태 통계가 실제 페이지 상태와 다름")

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
