from __future__ import annotations

import re
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from wiki_common import (  # noqa: E402
    Page,
    Resolver,
    effective_source_pages,
    expected_count,
    flow_list,
    parse_flow_list,
    parse_document,
    set_frontmatter_field,
    source_maps,
)
from wiki_lint import lint  # noqa: E402
from wiki_maintenance import GLOBAL_MARKER, _managed_log_block, fix_log_headings  # noqa: E402
from wiki_summaries import set_summary  # noqa: E402


def make_page(root: Path, relative: str, text: str) -> Page:
    meta, headings, links = parse_document(text)
    return Page(
        path=root / relative,
        root=root,
        text=text,
        bom=False,
        newline="\r\n" if "\r\n" in text else "\n",
        meta=meta,
        headings=headings,
        links=links,
    )


def write_page(root: Path, relative: str, text: str) -> None:
    path = root / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def base_frontmatter(
    title: str,
    page_type: str,
    *,
    sources: str = "[]",
    extra: str = "",
) -> str:
    return (
        "---\n"
        f"title: {title}\n"
        "aliases: []\n"
        f"summary: {title} summary\n"
        f"tags: [{page_type}, status/draft]\n"
        "created: 2026-07-15\n"
        "updated: 2026-07-15\n"
        f"sources: {sources}\n"
        "status: draft\n"
        f"{extra}"
        "---\n\n"
    )


class FrontmatterTests(unittest.TestCase):
    def test_flow_list_round_trips_escaped_values(self) -> None:
        values = ['a"b', r"a\b", "comma, value", "it's"]
        self.assertEqual(values, parse_flow_list(flow_list(values)))
        self.assertEqual(
            ["Church's theorem", "it's, quoted", "next"],
            parse_flow_list("[Church's theorem, 'it''s, quoted', next]"),
        )

    def test_set_frontmatter_field_preserves_crlf(self) -> None:
        text = "---\r\ntitle: old\r\naliases: []\r\n---\r\nbody\r\n"
        updated = set_frontmatter_field(text, "title", "new", "\r\n")
        self.assertIn("title: new\r\n", updated)
        self.assertIsNone(re.search(r"(?<!\r)\n", updated))

    def test_set_summary_only_edits_frontmatter(self) -> None:
        text = "---\r\ntitle: Page\r\naliases: []\r\n---\r\n\r\nsummary: body value\r\n"
        updated = set_summary(text, "frontmatter value", "\r\n")
        self.assertIn('summary: "frontmatter value"\r\n---', updated)
        self.assertIn("\r\nsummary: body value\r\n", updated)
        self.assertIsNone(re.search(r"(?<!\r)\n", updated))


class ResolverAndSourceTests(unittest.TestCase):
    def test_duplicate_stems_are_ambiguous(self) -> None:
        root = Path("C:/tmp/wiki-test")
        first = make_page(root, "wiki/concepts/Same.md", "")
        second = make_page(root, "wiki/entities/Same.md", "")
        resolver = Resolver([first, second])
        resolved, kind = resolver.resolve("Same")
        self.assertIsNone(resolved)
        self.assertEqual("ambiguous", kind)
        self.assertEqual([first, second], resolver.duplicate_stems["same"])

    def test_local_reference_raw_name_is_an_effective_source(self) -> None:
        root = Path("C:/tmp/wiki-test")
        reference = make_page(
            root,
            "wiki/sources/Local Reference.md",
            base_frontmatter(
                "Local Reference",
                "type/reference",
                sources='["local.md"]',
                extra=(
                    "source_id: ref-001\n"
                    "source_kind: raw\n"
                    'primary_sources: ["local.md"]\n'
                    "supporting_sources: []\n"
                    "source_urls: []\n"
                    "retrieved: 2026-07-15\n"
                    "version: null\n"
                    "snapshot_status: local\n"
                ),
            ),
        )
        concept = make_page(
            root,
            "wiki/concepts/Concept.md",
            base_frontmatter("Concept", "type/concept", sources='["local.md"]'),
        )
        sources = source_maps([reference, concept])
        self.assertEqual({reference}, effective_source_pages(concept, sources))
        self.assertEqual(("근거", 1), expected_count(concept, sources))


class LintRegressionTests(unittest.TestCase):
    def test_local_raw_reference_is_allowed(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "raw").mkdir()
            (root / "raw" / "local.md").write_text("source", encoding="utf-8")
            text = base_frontmatter(
                "Local Reference",
                "type/reference",
                sources='["local.md"]',
                extra=(
                    "source_id: ref-001\n"
                    "source_kind: raw\n"
                    'primary_sources: ["local.md"]\n'
                    "supporting_sources: []\n"
                    "source_urls: []\n"
                    "retrieved: 2026-07-15\n"
                    "version: null\n"
                    "snapshot_status: local\n"
                ),
            ) + "## 출처\n\n- `raw/local.md`\n\n## 관련 항목\n"
            write_page(root, "wiki/sources/Local Reference.md", text)
            issues, _ = lint(root)
            relevant = {
                issue.code
                for issue in issues
                if issue.path == "wiki/sources/Local Reference.md"
            }
            self.assertFalse(
                relevant
                & {
                    "provenance.kind",
                    "provenance.raw_missing",
                    "provenance.raw_partition",
                    "provenance.snapshot_kind",
                    "provenance.urls",
                }
            )

    def test_external_reference_is_still_allowed(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            text = base_frontmatter(
                "External Reference",
                "type/reference",
                sources='["Paper"]',
                extra=(
                    "source_id: ref-001\n"
                    "source_kind: external\n"
                    'primary_sources: ["Paper"]\n'
                    "supporting_sources: []\n"
                    'source_urls: ["https://example.com/paper"]\n'
                    "retrieved: 2026-07-15\n"
                    "version: null\n"
                    "snapshot_status: external-only\n"
                ),
            ) + "## 출처\n\n- [Paper](https://example.com/paper)\n\n## 관련 항목\n"
            write_page(root, "wiki/sources/External Reference.md", text)
            issues, _ = lint(root)
            relevant = {
                issue.code
                for issue in issues
                if issue.path == "wiki/sources/External Reference.md"
            }
            self.assertFalse(
                relevant
                & {
                    "provenance.kind",
                    "provenance.snapshot_kind",
                    "provenance.urls",
                    "provenance.url_mismatch",
                }
            )

    def test_missing_special_files_are_reported_without_crashing(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "wiki").mkdir()
            issues, stats = lint(root)
            missing = [issue for issue in issues if issue.code == "structure.special_missing"]
            self.assertEqual(3, len(missing))
            self.assertEqual(3, stats["errors"])

    def test_duplicate_stems_are_explicit_lint_errors(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            text = base_frontmatter("Same", "type/concept") + "## 출처\n\n## 관련 항목\n"
            write_page(root, "wiki/concepts/Same.md", text)
            text = base_frontmatter("Same", "type/entity") + "## 출처\n\n## 관련 항목\n"
            write_page(root, "wiki/entities/Same.md", text)
            issues, _ = lint(root)
            duplicates = [issue for issue in issues if issue.code == "links.stem_duplicate"]
            self.assertEqual(2, len(duplicates))

    def test_meta_directory_pages_must_be_listed_in_index(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            index = base_frontmatter("Index", "type/meta") + (
                "## 소스 (Sources)\n\n"
                "## 참고 자료 (References)\n\n"
                "## 인물 (Entities)\n\n"
                "## 개념 (Concepts)\n\n"
                "## 분석 (Analyses)\n\n"
                "## 메타 (Meta)\n\n"
                "## 출처\n\n"
                "## 관련 항목\n"
            )
            meta = base_frontmatter("Method", "type/meta") + "## 출처\n\n## 관련 항목\n"
            write_page(root, "wiki/index.md", index)
            write_page(root, "wiki/meta/Method.md", meta)
            issues, _ = lint(root)
            coverage = [
                issue
                for issue in issues
                if issue.code == "index.coverage" and "메타 (Meta)" in issue.message
            ]
            self.assertEqual(1, len(coverage))
            self.assertIn("Method", coverage[0].message)


class MaintenanceRegressionTests(unittest.TestCase):
    def test_log_content_after_managed_block_is_preserved(self) -> None:
        root = Path("C:/tmp/wiki-test")
        prefix = (
            "---\n"
            "title: Log\n"
            "updated: 2026-07-15\n"
            "---\n\n"
            "## [2026-07-14] update | Before\n\n"
            "## 출처\n\n- before\n\n"
            "## 관련 항목\n\n- before\n\n"
        )
        suffix = (
            "\n## [2026-07-15] update | Appended\n\n"
            "## 출처\n\n- appended\n\n"
            "## 관련 항목\n\n- appended\n"
        )
        page = make_page(
            root,
            "wiki/log.md",
            prefix + _managed_log_block("\n") + suffix,
        )
        changed, replacements = fix_log_headings(root, [page], fix=False)
        self.assertEqual(1, changed)
        self.assertEqual(4, replacements)
        self.assertIn("update | Appended", page.text)
        self.assertLess(page.text.index("update | Appended"), page.text.index(GLOBAL_MARKER))
        self.assertIn("### 출처\n\n- appended", page.text)
        self.assertTrue(page.text.endswith("- [[overview]]\n"))


if __name__ == "__main__":
    unittest.main()
