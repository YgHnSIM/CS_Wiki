from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

from wiki_common import Resolver, load_pages, set_frontmatter_field, yaml_quote


SPECIAL_SUMMARIES = {
    "index.md": "위키 전체 페이지를 유형별로 정리하고 각 페이지의 근거 수를 표시하는 카탈로그.",
    "overview.md": "CS Wiki의 지식 범위, 검증 상태, 핵심 주제와 웹 탐색 방법을 한눈에 보여주는 홈페이지.",
    "log.md": "CS Wiki의 소스 수집, 질의, 점검, 콘텐츠·웹사이트 변경을 시간순으로 남긴 운영 기록.",
}


def index_summaries(index_text: str, resolver: Resolver) -> dict:
    summaries = {}
    pattern = re.compile(r"^-\s+\[\[([^\]]+)\]\]\s+—\s+(.+?)\s*$", re.MULTILINE)
    for match in pattern.finditer(index_text):
        raw = match.group(1)
        target_name = raw.split("|", 1)[0].split("#", 1)[0].strip()
        page, _ = resolver.resolve(target_name)
        if not page:
            continue
        summary = re.sub(
            r"\s+\((?:raw 파일|핵심 문헌|근거)\s+\d+개\)\s*$",
            "",
            match.group(2).strip(),
        )
        summaries[page] = summary
    return summaries


def clean_fallback(page) -> str:
    body = re.sub(r"^---\r?\n.*?\r?\n---\s*", "", page.text, flags=re.DOTALL)
    paragraphs = re.split(r"\r?\n\s*\r?\n", body)
    for paragraph in paragraphs:
        value = paragraph.strip()
        if not value or value.startswith(("#", "- ", "|", "<!--", "> [!")):
            continue
        value = re.sub(r"!?\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]", lambda m: m.group(2) or m.group(1), value)
        value = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", value)
        value = re.sub(r"[`*_>#]", "", value)
        value = re.sub(r"\s+", " ", value).strip()
        if value:
            return value[:197] + "..." if len(value) > 200 else value
    return "출처와 관련 항목을 연결해 정리한 CS Wiki 문서."


def set_summary(text: str, summary: str, newline: str) -> str:
    return set_frontmatter_field(text, "summary", yaml_quote(summary), newline)


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser(description="Populate explicit wiki summary fields")
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    root = args.root.resolve()
    pages = load_pages(root)
    resolver = Resolver(pages)
    index_page = next(page for page in pages if page.path == root / "wiki" / "index.md")
    summaries = index_summaries(index_page.text, resolver)
    changed = 0

    for page in pages:
        summary = SPECIAL_SUMMARIES.get(page.path.name) or summaries.get(page) or clean_fallback(page)
        updated = set_summary(page.text, summary, page.newline)
        if updated == page.text:
            continue
        changed += 1
        if args.apply:
            page.write(updated)

    print(f"summary: {changed} files {'updated' if args.apply else 'needed'}")
    return 1 if changed and not args.apply else 0


if __name__ == "__main__":
    raise SystemExit(main())
