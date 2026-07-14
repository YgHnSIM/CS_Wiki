"""Build a corpus-based D2Coding webfont subset for the static site."""

from __future__ import annotations

from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "site" / "font-sources"
OUTPUT_DIR = ROOT / "site" / "assets" / "fonts"
FONT_NAMES = ("D2Coding.woff2", "D2Coding-Bold.woff2")


def corpus_text() -> str:
    paths = [
        *sorted((ROOT / "wiki").rglob("*.md")),
        *sorted((ROOT / "site").glob("*.mjs")),
        *sorted((ROOT / "site" / "assets").glob("*.js")),
        *sorted((ROOT / "site" / "assets").glob("*.css")),
        ROOT / "README.md",
        ROOT / "AGENTS.md",
    ]
    text = "\n".join(path.read_text(encoding="utf-8") for path in paths if path.exists())
    ascii_and_controls = "".join(chr(codepoint) for codepoint in range(0x20, 0x7F))
    return text + ascii_and_controls + "\n\t"


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
    missing = [name for name in FONT_NAMES if not (SOURCE_DIR / name).exists()]
    if missing:
        print(f"Missing source fonts in {SOURCE_DIR}: {', '.join(missing)}")
        return 1

    text = corpus_text()
    before = 0
    after = 0
    for name in FONT_NAMES:
        source_size, target_size = subset_font(SOURCE_DIR / name, OUTPUT_DIR / name, text)
        before += source_size
        after += target_size
        print(f"{name}: {source_size:,} -> {target_size:,} bytes")

    reduction = 100 * (1 - after / before)
    print(f"Total: {before:,} -> {after:,} bytes ({reduction:.1f}% smaller)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
