"""Build or verify a corpus-based D2Coding webfont subset for the static site."""

from __future__ import annotations

import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "site" / "font-sources"
OUTPUT_DIR = ROOT / "site" / "assets" / "fonts"
FONT_NAMES = ("D2Coding.woff2", "D2Coding-Bold.woff2")


def corpus_paths() -> list[Path]:
    return [
        *sorted(path for path in (ROOT / "wiki").rglob("*.md") if path.parent.name != "logs"),
        *sorted((ROOT / "site").rglob("*.mjs")),
        *sorted((ROOT / "site" / "assets").rglob("*.js")),
        *sorted((ROOT / "site" / "styles").rglob("*.css")),
        ROOT / "README.md",
        ROOT / "AGENTS.md",
    ]


def corpus_text() -> str:
    text = "\n".join(path.read_text(encoding="utf-8") for path in corpus_paths() if path.exists())
    ascii_and_controls = "".join(chr(codepoint) for codepoint in range(0x20, 0x7F))
    return text + ascii_and_controls + "\n\t"


def required_codepoints(text: str) -> set[int]:
    return {ord(character) for character in text if character not in "\r\n\t"}


def missing_codepoints(font_path: Path, codepoints: set[int]) -> list[int]:
    font = TTFont(font_path)
    try:
        cmap = font.getBestCmap() or {}
        return sorted(codepoint for codepoint in codepoints if codepoint not in cmap)
    finally:
        font.close()


def check_fonts(text: str) -> int:
    codepoints = required_codepoints(text)
    failed = False
    for name in FONT_NAMES:
        target = OUTPUT_DIR / name
        if not target.exists():
            print(f"{name}: missing output font at {target}; run `npm run fonts:subset`")
            failed = True
            continue
        missing = missing_codepoints(target, codepoints)
        if missing:
            failed = True
            sample = " ".join(f"U+{codepoint:04X}" for codepoint in missing[:20])
            print(f"{name}: {len(missing)} required codepoints are missing: {sample}")
        else:
            print(f"{name}: all {len(codepoints)} required codepoints are covered")
    return 1 if failed else 0


def subset_font(source: Path, target: Path, text: str) -> tuple[int, int]:
    options = subset.Options()
    options.layout_features = ["*"]
    options.name_IDs = [0, 1, 2, 3, 4, 5, 6]
    options.name_legacy = True
    options.name_languages = ["*"]
    options.recalc_average_width = True
    options.recalc_max_context = True

    font = TTFont(source)
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(text=text)
    subsetter.subset(font)
    font.flavor = "woff2"
    target.parent.mkdir(parents=True, exist_ok=True)
    font.save(target)
    return source.stat().st_size, target.stat().st_size


def main() -> int:
    text = corpus_text()
    if "--check" in sys.argv:
        return check_fonts(text)

    missing = [name for name in FONT_NAMES if not (SOURCE_DIR / name).exists()]
    if missing:
        print(f"Missing source fonts in {SOURCE_DIR}: {', '.join(missing)}")
        return 1

    before = 0
    after = 0
    for name in FONT_NAMES:
        source_size, target_size = subset_font(SOURCE_DIR / name, OUTPUT_DIR / name, text)
        before += source_size
        after += target_size
        print(f"{name}: {source_size:,} -> {target_size:,} bytes")

    reduction = 100 * (1 - after / before)
    print(f"Total: {before:,} -> {after:,} bytes ({reduction:.1f}% smaller)")
    return check_fonts(text)


if __name__ == "__main__":
    raise SystemExit(main())
