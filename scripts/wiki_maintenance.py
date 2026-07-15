from __future__ import annotations

import argparse
import re
import sys
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path

from wiki_common import (
    Resolver,
    append_related_link,
    expected_count,
    links_in_section,
    load_pages,
    parse_scalar,
    set_updated,
    source_maps,
)


TODAY = date.today().isoformat()
GLOBAL_MARKER = "<!-- wiki-maintenance: global-sections -->"


def _managed_log_block(newline: str) -> str:
    return (
        GLOBAL_MARKER
        + newline
        + "## 출처"
        + newline * 2
        + "- `AGENTS.md`"
        + newline
        + "- `wiki/` 및 `raw/` 작업 이력"
        + newline
        + "- Git 커밋 이력"
        + newline * 2
        + "## 관련 항목"
        + newline * 2
        + "- [[index]]"
        + newline
        + "- [[overview]]"
        + newline
    )


def write_if_changed(page, original: str, fix: bool) -> bool:
    if page.text == original:
        return False
    if fix:
        page.write(page.text)
    return True


def related_plan(pages) -> dict:
    resolver = Resolver(pages)
    related: dict = {}
    for page in pages:
        if not page.is_content:
            continue
        targets = set()
        for name in links_in_section(page, "관련 항목", level=2, last=True):
            target, _ = resolver.resolve(name)
            if target and target.is_content and target is not page:
                targets.add(target)
        related[page] = targets
    additions: dict = defaultdict(set)
    for source, targets in related.items():
        for target in targets:
            if source not in related.get(target, set()):
                additions[target].add(source.stem)
    return additions


def fix_related(pages, fix: bool) -> tuple[int, int]:
    additions = related_plan(pages)
    changed_files = 0
    added_links = 0
    for page, targets in additions.items():
        original = page.text
        for target in sorted(targets, key=str.casefold):
            page.text = append_related_link(page, target, TODAY)
            added_links += 1
        if write_if_changed(page, original, fix):
            changed_files += 1
    return changed_files, added_links


def fix_index_counts(root: Path, pages, fix: bool) -> tuple[int, int]:
    resolver = Resolver(pages)
    sources = source_maps(pages)
    index_page = next(page for page in pages if page.path == root / "wiki" / "index.md")
    original = index_page.text
    changed_items = 0

    def replace_item(match: re.Match[str]) -> str:
        nonlocal changed_items
        line = match.group(0)
        raw_target = match.group(1)
        target_name = raw_target.split("|", 1)[0].split("#", 1)[0].strip()
        target, _ = resolver.resolve(target_name)
        if not target:
            return line
        count = expected_count(target, sources)
        if not count:
            return line
        label, number = count
        desired = f"({label} {number}개)"
        if re.search(r"\([^()]*\d+개\)\s*$", line):
            replaced = re.sub(r"\([^()]*\d+개\)\s*$", desired, line)
        else:
            replaced = line.rstrip() + " " + desired
        if replaced != line:
            changed_items += 1
        return replaced

    index_page.text = re.sub(r"^-\s+\[\[([^\]]+)\]\].*$", replace_item, index_page.text, flags=re.MULTILINE)
    if index_page.text != original:
        index_page.text = set_updated(index_page.text, TODAY, index_page.newline)
    changed_files = 1 if write_if_changed(index_page, original, fix) else 0

    overview_page = next(page for page in pages if page.path == root / "wiki" / "overview.md")
    overview_original = overview_page.text
    regular = sum(page.page_type == "type/source" for page in pages)
    references = sum(page.page_type == "type/reference" for page in pages)
    overview_page.text = re.sub(
        r"현재 정규 소스는 \d+개 묶음, 참고 자료는 \d+개이며",
        f"현재 정규 소스는 {regular}개 묶음, 참고 자료는 {references}개이며",
        overview_page.text,
        count=1,
    )
    status_counts = Counter(parse_scalar(page.meta.get("status")) or "unknown" for page in pages)
    summary = (
        f"운영 상태: 전체 {len(pages)}개 페이지 중 "
        f"active {status_counts['active']}개, draft {status_counts['draft']}개, "
        f"review {status_counts['review']}개, archived {status_counts['archived']}개다."
    )
    status_block = "<!-- wiki-maintenance: status-summary -->" + overview_page.newline + summary
    status_pattern = re.compile(
        r"<!-- wiki-maintenance: status-summary -->\r?\n운영 상태:.*?(?=\r?\n\r?\n|\r?\n## )"
    )
    if status_pattern.search(overview_page.text):
        overview_page.text = status_pattern.sub(status_block, overview_page.text, count=1)
    else:
        overview_page.text = overview_page.text.replace(
            overview_page.newline + "## 주요 주제",
            overview_page.newline * 2 + status_block + overview_page.newline * 2 + "## 주요 주제",
            1,
        )
    if overview_page.text != overview_original:
        overview_page.text = set_updated(overview_page.text, TODAY, overview_page.newline)
    if write_if_changed(overview_page, overview_original, fix):
        changed_files += 1
    return changed_files, changed_items


def fix_log_headings(root: Path, pages, fix: bool) -> tuple[int, int]:
    log_page = next(page for page in pages if page.path == root / "wiki" / "log.md")
    original = log_page.text
    text = log_page.text
    marker_index = text.find(GLOBAL_MARKER)
    if marker_index >= 0:
        managed = _managed_log_block(log_page.newline)
        if not text.startswith(managed, marker_index):
            raise ValueError(f"{log_page.rel}: managed log block was edited; refusing to discard unknown content")
        suffix = text[marker_index + len(managed) :].strip("\r\n")
        prefix = text[:marker_index].rstrip("\r\n")
        # Preserve content appended after the old managed block and move it
        # before the regenerated final sections. The previous implementation
        # silently truncated everything from the marker to EOF.
        text = prefix
        if suffix:
            text += log_page.newline * 2 + suffix
    replacements = len(re.findall(r"^##[ \t]+(?:출처|관련 항목)[ \t]*$", text, re.MULTILINE))
    text = re.sub(r"^##[ \t]+(출처|관련 항목)[ \t]*$", r"### \1", text, flags=re.MULTILINE)
    text = text.rstrip("\r\n")
    log_page.text = text + log_page.newline * 2 + _managed_log_block(log_page.newline)
    if log_page.text != original:
        log_page.text = set_updated(log_page.text, TODAY, log_page.newline)
    changed = 1 if write_if_changed(log_page, original, fix) else 0
    return changed, replacements


def fix_known_log_order(root: Path, pages, fix: bool) -> tuple[int, int]:
    log_page = next(page for page in pages if page.path == root / "wiki" / "log.md")
    original = log_page.text
    text = log_page.text
    marker_index = text.find(GLOBAL_MARKER)
    body_end = marker_index if marker_index >= 0 else len(text)
    body = text[:body_end].rstrip("\r\n")
    suffix = text[body_end:] if marker_index >= 0 else ""
    matches = list(re.finditer(r"^##\s+\[(\d{4}-\d{2}-\d{2})\]\s+[^|]+\|\s+(.+?)\s*$", body, re.MULTILINE))
    if not matches:
        return 0, 0
    prefix = body[: matches[0].start()]
    blocks = []
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(body)
        blocks.append((match.group(1), match.group(2).strip(), body[match.start() : end].rstrip("\r\n")))

    swaps = 0
    unix_index = next((i for i, (_, title, _) in enumerate(blocks) if title == "Unix와 C"), None)
    reuse_index = next((i for i, (_, title, _) in enumerate(blocks) if title == "소프트웨어 재사용의 역사"), None)
    if unix_index is not None and reuse_index is not None and reuse_index < unix_index:
        unix_block = blocks.pop(unix_index)
        reuse_index = next(i for i, (_, title, _) in enumerate(blocks) if title == "소프트웨어 재사용의 역사")
        blocks.insert(reuse_index, unix_block)
        swaps = 1
    rebuilt = prefix.rstrip("\r\n") + log_page.newline * 2
    rebuilt += (log_page.newline * 2).join(block for _, _, block in blocks)
    rebuilt = rebuilt.rstrip("\r\n") + log_page.newline * 2 + suffix.lstrip("\r\n") if suffix else rebuilt + log_page.newline
    log_page.text = rebuilt
    changed = 1 if write_if_changed(log_page, original, fix) else 0
    return changed, swaps


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser(description="Idempotent CS_Wiki maintenance fixes")
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--fix-related", action="store_true")
    parser.add_argument("--fix-index-counts", action="store_true")
    parser.add_argument("--fix-log-headings", action="store_true")
    parser.add_argument("--fix-log-order", action="store_true")
    parser.add_argument("--all", action="store_true", help="apply every maintenance fix")
    parser.add_argument("--check", action="store_true", help="dry-run; this is the default without fix flags")
    args = parser.parse_args()
    root = args.root.resolve()
    selected = args.all or any((args.fix_related, args.fix_index_counts, args.fix_log_headings, args.fix_log_order))
    apply_fixes = selected and not args.check

    total_changes = 0
    if args.all or args.fix_related or not selected:
        pages = load_pages(root)
        files, links = fix_related(pages, apply_fixes)
        total_changes += files
        print(f"related: {links} links across {files} files {'fixed' if apply_fixes else 'needed'}")
    if args.all or args.fix_index_counts or not selected:
        pages = load_pages(root)
        files, items = fix_index_counts(root, pages, apply_fixes)
        total_changes += files
        print(f"catalog: {items} count labels across {files} files {'fixed' if apply_fixes else 'needed'}")
    if args.all or args.fix_log_headings or not selected:
        pages = load_pages(root)
        files, headings = fix_log_headings(root, pages, apply_fixes)
        total_changes += files
        print(f"log headings: {headings} entry headings across {files} files {'fixed' if apply_fixes else 'needed'}")
    if args.all or args.fix_log_order or not selected:
        pages = load_pages(root)
        files, swaps = fix_known_log_order(root, pages, apply_fixes)
        total_changes += files
        print(f"log order: {swaps} swap across {files} files {'fixed' if apply_fixes else 'needed'}")
    return 1 if not apply_fixes and total_changes else 0


if __name__ == "__main__":
    sys.exit(main())
