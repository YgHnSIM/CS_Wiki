from __future__ import annotations

import argparse
import json
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import asdict, dataclass
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from wiki_common import (
    effective_source_pages,
    load_pages,
    parse_flow_list,
    parse_scalar,
    public_knowledge_pages,
    source_maps,
)


USER_AGENT = "CS-Wiki-Link-Checker/1.0 (+https://github.com/)"
BROKEN_STATUS_CODES = {404, 410}
RESTRICTED_STATUS_CODES = {401, 403, 429}


@dataclass(frozen=True)
class Target:
    url: str
    sources: tuple[str, ...]
    used_by: int
    snapshot_status: str


@dataclass(frozen=True)
class Result:
    url: str
    sources: tuple[str, ...]
    used_by: int
    snapshot_status: str
    state: str
    status: int | None
    final_url: str | None
    detail: str


def collect_targets(root: Path) -> list[Target]:
    pages = load_pages(root)
    sources = source_maps(pages)
    use_counts = {page: 0 for page in sources.pages}
    for page in public_knowledge_pages(pages):
        for source in effective_source_pages(page, sources):
            use_counts[source] += 1

    records: dict[str, dict] = {}
    for page in sources.pages:
        for url in parse_flow_list(page.meta.get("source_urls")):
            record = records.setdefault(
                url,
                {
                    "sources": [],
                    "used_by": 0,
                    "snapshot_status": parse_scalar(page.meta.get("snapshot_status")) or "unclassified",
                },
            )
            record["sources"].append(page.stem)
            record["used_by"] = max(record["used_by"], use_counts.get(page, 0))
            if record["snapshot_status"] != (parse_scalar(page.meta.get("snapshot_status")) or "unclassified"):
                record["snapshot_status"] = "mixed"
    return sorted(
        (
            Target(
                url=url,
                sources=tuple(sorted(record["sources"], key=str.casefold)),
                used_by=record["used_by"],
                snapshot_status=record["snapshot_status"],
            )
            for url, record in records.items()
        ),
        key=lambda target: (-target.used_by, target.url),
    )


def classify_status(status: int) -> str:
    if status in BROKEN_STATUS_CODES:
        return "broken"
    if status in RESTRICTED_STATUS_CODES:
        return "restricted"
    if 200 <= status < 400:
        return "ok"
    return "error"


def _request(url: str, method: str, timeout: float):
    headers = {"User-Agent": USER_AGENT, "Accept": "*/*"}
    if method == "GET":
        headers["Range"] = "bytes=0-0"
    return urlopen(Request(url, headers=headers, method=method), timeout=timeout)


def check_target(target: Target, timeout: float) -> Result:
    last_error: HTTPError | None = None
    for method in ("HEAD", "GET"):
        try:
            with _request(target.url, method, timeout) as response:
                status = int(response.status)
                return Result(
                    target.url,
                    target.sources,
                    target.used_by,
                    target.snapshot_status,
                    classify_status(status),
                    status,
                    response.geturl(),
                    method,
                )
        except HTTPError as error:
            last_error = error
            if method == "HEAD" and error.code in RESTRICTED_STATUS_CODES | {405, 501}:
                continue
            return Result(
                target.url,
                target.sources,
                target.used_by,
                target.snapshot_status,
                classify_status(error.code),
                error.code,
                error.geturl(),
                str(error.reason),
            )
        except (URLError, TimeoutError, OSError) as error:
            return Result(
                target.url,
                target.sources,
                target.used_by,
                target.snapshot_status,
                "error",
                None,
                None,
                str(getattr(error, "reason", error)),
            )
    assert last_error is not None
    return Result(
        target.url,
        target.sources,
        target.used_by,
        target.snapshot_status,
        classify_status(last_error.code),
        last_error.code,
        last_error.geturl(),
        str(last_error.reason),
    )


def render_text(results: list[Result]) -> str:
    counts = {state: sum(result.state == state for result in results) for state in ("ok", "restricted", "broken", "error")}
    lines = [
        (
            f"External links: {len(results)} total, {counts['ok']} ok, {counts['restricted']} restricted, "
            f"{counts['broken']} broken, {counts['error']} transient/error"
        )
    ]
    for result in sorted(results, key=lambda item: (item.state == "ok", item.state, -item.used_by, item.url)):
        label = ", ".join(result.sources)
        lines.append(
            f"[{result.state.upper()}] {result.status or '-'} used-by={result.used_by} "
            f"snapshot={result.snapshot_status} {label} — {result.url}"
        )
    return "\n".join(lines)


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser(description="Check source_urls and rank preservation risk")
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--timeout", type=float, default=15.0)
    parser.add_argument("--workers", type=int, default=8)
    parser.add_argument("--json", action="store_true", dest="as_json")
    parser.add_argument("--fail-on-broken", action="store_true")
    args = parser.parse_args()

    targets = collect_targets(args.root.resolve())
    results: list[Result] = []
    with ThreadPoolExecutor(max_workers=max(1, args.workers)) as executor:
        futures = {executor.submit(check_target, target, args.timeout): target for target in targets}
        for future in as_completed(futures):
            results.append(future.result())
    results.sort(key=lambda item: (-item.used_by, item.url))

    if args.as_json:
        print(json.dumps([asdict(result) for result in results], ensure_ascii=False, indent=2))
    else:
        print(render_text(results))
    return 1 if args.fail_on_broken and any(result.state == "broken" for result in results) else 0


if __name__ == "__main__":
    raise SystemExit(main())
