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
    knowledge_metrics,
    parse_flow_list,
    parse_document,
    set_frontmatter_field,
    source_maps,
)
from wiki_lint import lint  # noqa: E402
from wiki_maintenance import GLOBAL_MARKER, _managed_log_block, fix_graph_ids, fix_log_headings, fix_related  # noqa: E402
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
    def test_related_reading_budget_and_reason_are_enforced(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for index in range(1, 7):
                target = base_frontmatter(f"Target {index}", "type/concept") + "## 출처\n\n## 관련 항목\n"
                write_page(root, f"wiki/concepts/Target {index}.md", target)
            items = "\n".join(
                f"- [[Target {index}]]" + ("" if index == 1 else f" — {index}번째 추천 이유다.")
                for index in range(1, 7)
            )
            owner = base_frontmatter("Owner", "type/concept") + f"## 출처\n\n## 관련 항목\n\n{items}\n"
            write_page(root, "wiki/concepts/Owner.md", owner)

            issues, _ = lint(root)
            owner_codes = {issue.code for issue in issues if issue.path == "wiki/concepts/Owner.md"}
            self.assertTrue({"links.related_budget", "links.related_reason"}.issubset(owner_codes))

    def test_graph_metadata_and_relation_table_are_validated(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            bad = base_frontmatter(
                "Bad Graph",
                "type/concept",
                extra=(
                    "graph_id: Bad ID\n"
                    "graph_visibility: orbital\n"
                    "event_start: 2000\n"
                    "event_end: 1900\n"
                    "historical_layer: unknown\n"
                    "capability_layers: [speed]\n"
                ),
            ) + (
                "## 관계\n\n"
                "| 관계 | 대상 | 설명 | 근거 |\n"
                "|---|---|---|---|\n"
                "| invented | [[Missing]] | | [[Missing Evidence]] |\n\n"
                "## 출처\n\n"
                "## 관련 항목\n"
            )
            write_page(root, "wiki/concepts/Bad Graph.md", bad)
            missing_start = base_frontmatter(
                "Missing Start",
                "type/concept",
                extra=(
                    "event_end: 1959\n"
                    f"historical_note: {'x' * 301}\n"
                ),
            ) + "## 출처\n\n## 관련 항목\n"
            write_page(root, "wiki/concepts/Missing Start.md", missing_start)
            issues, _ = lint(root)
            codes = {issue.code for issue in issues if issue.path == "wiki/concepts/Bad Graph.md"}
            self.assertTrue(
                {
                    "graph.id_format",
                    "graph.visibility",
                    "graph.year_range",
                    "graph.historical_layer",
                    "graph.capability_layer",
                    "graph.relation_kind",
                    "graph.relation_target",
                    "graph.relation_note",
                    "graph.relation_evidence",
                }.issubset(codes)
            )
            missing_start_codes = {
                issue.code
                for issue in issues
                if issue.path == "wiki/concepts/Missing Start.md"
            }
            self.assertTrue({"graph.year_range", "graph.historical_note"}.issubset(missing_start_codes))

    def test_valid_relation_alias_pipes_and_duplicate_graph_ids(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            target = base_frontmatter("Target", "type/concept", extra="graph_id: shared-id\n") + "## 출처\n\n## 관련 항목\n"
            evidence = base_frontmatter(
                "Evidence",
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
            source = base_frontmatter("Source", "type/concept", extra="graph_id: shared-id\n") + (
                "## 관계\n\n"
                "| 관계 | 대상 | 설명 | 근거 |\n"
                "|---|---|---|---|\n"
                "| enables | [[Target|표시 이름]] | 새 작업을 가능하게 한다. | [[Evidence]] |\n\n"
                "| responds_to | [[Target]] | 확인된 제약에 대응한다. | [[Evidence]] |\n\n"
                "## 출처\n\n"
                "## 관련 항목\n"
            )
            write_page(root, "wiki/concepts/Target.md", target)
            write_page(root, "wiki/sources/Evidence.md", evidence)
            write_page(root, "wiki/concepts/Source.md", source)
            issues, _ = lint(root)
            graph_issues = [issue for issue in issues if issue.code.startswith("graph.")]
            self.assertEqual(2, sum(issue.code == "graph.id_duplicate" for issue in graph_issues))
            self.assertFalse(any(issue.code.startswith("graph.relation_") for issue in graph_issues))

    def test_relation_evidence_accepts_sources_and_references_but_rejects_concepts(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "raw").mkdir()
            (root / "raw" / "primary.md").write_text("source", encoding="utf-8")
            primary = base_frontmatter(
                "Primary Source",
                "type/source",
                sources='["primary.md"]',
                extra=(
                    "source_id: src-001\n"
                    "source_kind: raw\n"
                    'primary_sources: ["primary.md"]\n'
                    "supporting_sources: []\n"
                    "source_urls: []\n"
                    "retrieved: 2026-07-15\n"
                    "version: null\n"
                    "snapshot_status: local\n"
                ),
            ) + "## 출처\n\n- `raw/primary.md`\n\n## 관련 항목\n"
            reference = base_frontmatter(
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
            concept_evidence = base_frontmatter("Concept Evidence", "type/concept") + "## 출처\n\n## 관련 항목\n"
            owner = base_frontmatter("Owner", "type/concept") + (
                "## 관계\n\n"
                "| 관계 | 대상 | 설명 | 근거 |\n"
                "|---|---|---|---|\n"
                "| enables | [[Target One]] | 첫 능력을 가능하게 한다. | [[Primary Source]] |\n"
                "| constrains | [[Target Two]] | 두 번째 능력을 제약한다. | [[External Reference]] |\n"
                "| measures | [[Target Three]] | 세 번째 능력을 측정한다. | [[Concept Evidence]] |\n\n"
                "## 출처\n\n"
                "## 관련 항목\n"
            )
            write_page(root, "wiki/sources/Primary Source.md", primary)
            write_page(root, "wiki/sources/External Reference.md", reference)
            write_page(root, "wiki/concepts/Concept Evidence.md", concept_evidence)
            for name in ("Target One", "Target Two", "Target Three"):
                write_page(root, f"wiki/concepts/{name}.md", base_frontmatter(name, "type/concept") + "## 출처\n\n## 관련 항목\n")
            write_page(root, "wiki/concepts/Owner.md", owner)

            issues, _ = lint(root)
            evidence_type_issues = [
                issue
                for issue in issues
                if issue.path == "wiki/concepts/Owner.md" and issue.code == "graph.relation_evidence_type"
            ]
            self.assertEqual(1, len(evidence_type_issues))
            self.assertIn("Concept Evidence", evidence_type_issues[0].message)

    def test_duplicate_curated_relation_rows_are_rejected_after_alias_resolution(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            target = base_frontmatter("Target", "type/concept").replace(
                "aliases: []", "aliases: [Target Alias]"
            ) + "## 출처\n\n## 관련 항목\n"
            first_evidence = base_frontmatter("First Evidence", "type/reference") + "## 출처\n\n## 관련 항목\n"
            second_evidence = base_frontmatter("Second Evidence", "type/reference") + "## 출처\n\n## 관련 항목\n"
            owner = base_frontmatter("Owner", "type/concept") + (
                "## 관계\n\n"
                "| 관계 | 대상 | 설명 | 근거 |\n"
                "|---|---|---|---|\n"
                "| broader | [[Target]] | 첫 설명이다. | [[First Evidence]] |\n"
                "\n## 관계 메모\n\n두 번째 표도 같은 문서의 관계 계약에 속한다.\n\n"
                "## 관계\n\n"
                "| 관계 | 대상 | 설명 | 근거 |\n"
                "|---|---|---|---|\n"
                "| broader | [[Target Alias]] | 다른 근거를 단 두 번째 설명이다. | [[Second Evidence]] |\n"
                "| contradicts | [[Target]] | 관계 종류가 다르면 별도 주장이다. | [[Second Evidence]] |\n\n"
                "## 출처\n\n"
                "## 관련 항목\n"
            )
            write_page(root, "wiki/concepts/Target.md", target)
            write_page(root, "wiki/sources/First Evidence.md", first_evidence)
            write_page(root, "wiki/sources/Second Evidence.md", second_evidence)
            write_page(root, "wiki/concepts/Owner.md", owner)

            issues, _ = lint(root)
            duplicates = [
                issue
                for issue in issues
                if issue.path == "wiki/concepts/Owner.md" and issue.code == "graph.relation_duplicate"
            ]
            self.assertEqual(1, len(duplicates))
            self.assertIn("broader → Target", duplicates[0].message)

    def test_historical_relation_requires_direct_evidence(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            target = base_frontmatter("Target", "type/concept") + "## 출처\n\n## 관련 항목\n"
            source = base_frontmatter("Source", "type/concept") + (
                "## 관계\n\n"
                "| 관계 | 대상 | 설명 | 근거 |\n"
                "|---|---|---|---|\n"
                "| responds_to | [[Target]] | 확인된 제약에 대응한다. | |\n\n"
                "## 출처\n\n"
                "## 관련 항목\n"
            )
            write_page(root, "wiki/concepts/Target.md", target)
            write_page(root, "wiki/concepts/Source.md", source)
            issues, _ = lint(root)
            self.assertTrue(any(issue.code == "graph.relation_evidence" for issue in issues))

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

    def test_public_knowledge_sources_must_resolve_without_linting_raw_source_filenames(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "raw").mkdir()
            (root / "raw" / "source.md").write_text("source", encoding="utf-8")
            source = base_frontmatter(
                "Raw Source",
                "type/source",
                sources='["source.md"]',
                extra=(
                    "source_id: src-001\n"
                    "source_kind: raw\n"
                    'primary_sources: ["source.md"]\n'
                    "supporting_sources: []\n"
                    "source_urls: []\n"
                    "retrieved: 2026-07-15\n"
                    "version: null\n"
                    "snapshot_status: local\n"
                ),
            ) + "## 출처\n\n- `raw/source.md`\n\n## 관련 항목\n"
            valid = base_frontmatter("Valid", "type/concept", sources='["Raw Source"]') + (
                "## 출처\n\n- [[Raw Source]]\n\n## 관련 항목\n"
            )
            valid_raw_name = base_frontmatter("Valid Raw Name", "type/concept", sources='["source.md"]') + (
                "## 출처\n\n- [[Raw Source]]\n\n## 관련 항목\n"
            )
            invalid = base_frontmatter("Invalid", "type/concept", sources='["Missing Source"]') + (
                "## 출처\n\n## 관련 항목\n"
            )
            write_page(root, "wiki/sources/Raw Source.md", source)
            write_page(root, "wiki/concepts/Valid.md", valid)
            write_page(root, "wiki/concepts/Valid Raw Name.md", valid_raw_name)
            write_page(root, "wiki/concepts/Invalid.md", invalid)

            issues, _ = lint(root)
            unresolved = [issue for issue in issues if issue.code == "sources.frontmatter_unresolved"]
            self.assertEqual(["wiki/concepts/Invalid.md"], [issue.path for issue in unresolved])
            self.assertIn("Missing Source", unresolved[0].message)

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
    def test_related_reading_compaction_is_bounded_explained_and_idempotent(self) -> None:
        root = Path("C:/tmp/wiki-test")
        targets = [
            make_page(
                root,
                f"wiki/concepts/Target {index}.md",
                base_frontmatter(f"Target {index}", "type/concept") + "## 출처\n\n## 관련 항목\n",
            )
            for index in range(1, 7)
        ]
        owner = make_page(
            root,
            "wiki/concepts/Owner.md",
            base_frontmatter("Owner", "type/concept")
            + "## 출처\n\n## 관련 항목\n\n"
            + "\n".join(f"- [[Target {index}]]" for index in range(1, 7))
            + "\n",
        )
        changed, items = fix_related([owner, *targets], fix=False)
        self.assertEqual(1, changed)
        self.assertEqual(6, items)
        self.assertEqual(5, len(re.findall(r"^- \[\[Target", owner.text, re.MULTILINE)))
        self.assertIn("— Target 1 summary", owner.text)
        self.assertEqual((0, 0), fix_related([owner, *targets], fix=False))

    def test_related_migration_preserves_crlf_without_phantom_whitespace(self) -> None:
        root = Path("C:/tmp/wiki-test")
        target = make_page(
            root,
            "wiki/concepts/Target.md",
            (base_frontmatter("Target", "type/concept") + "## 출처\n\n## 관련 항목\n").replace("\n", "\r\n"),
        )
        owner = make_page(
            root,
            "wiki/concepts/Owner.md",
            (
                base_frontmatter("Owner", "type/concept")
                + "## 출처\n\n## 관련 항목\n\n- [[Target]]\n"
            ).replace("\n", "\r\n"),
        )

        self.assertEqual((1, 1), fix_related([owner, target], fix=False))
        self.assertNotIn("\r\r\n", owner.text)
        self.assertIsNone(re.search(r"(?<!\r)\n", owner.text))
        self.assertEqual((0, 0), fix_related([owner, target], fix=False))

    def test_graph_id_assignment_is_stable_and_idempotent(self) -> None:
        root = Path("C:/tmp/wiki-test")
        page = make_page(
            root,
            "wiki/concepts/안정 식별자.md",
            base_frontmatter("안정 식별자", "type/concept") + "## 출처\n\n## 관련 항목\n",
        )
        changed, assigned = fix_graph_ids([page], fix=False)
        self.assertEqual((1, 1), (changed, assigned))
        self.assertRegex(page.text, r"graph_id: concept-[a-f0-9]{16}")
        migrated = make_page(root, "wiki/concepts/이름을 바꿔도.md", page.text)
        changed, assigned = fix_graph_ids([migrated], fix=False)
        self.assertEqual((0, 0), (changed, assigned))

    def test_knowledge_metrics_separate_public_documents_from_evidence_claims(self) -> None:
        root = Path("C:/tmp/wiki-test")
        source = make_page(
            root,
            "wiki/sources/Reference.md",
            base_frontmatter(
                "Reference",
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
                    "publication_year: 1970\n"
                ),
            ),
        )
        concept = make_page(
            root,
            "wiki/concepts/Concept.md",
            base_frontmatter("Concept", "type/concept", sources='["Reference"]', extra="graph_id: concept-test\n"),
        )
        metrics = knowledge_metrics([source, concept])
        self.assertEqual(2, metrics["public_documents"])
        self.assertEqual(1, metrics["knowledge_documents"])
        self.assertEqual(1, metrics["document_evidence_links"])
        self.assertEqual(1, metrics["publication_documents"])

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
