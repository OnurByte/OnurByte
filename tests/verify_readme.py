#!/usr/bin/env python3
"""Structural gate for the OnurByte profile README.

Drives the real shipped artifact (./README.md) — no reimplementation of
content, no hard-coded full-body expectations. Fails if the profile card
regresses to a stub, invents banned vibe labels, or drops grounded skills.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
README = ROOT / "README.md"

BANNED = re.compile(
    r"Max\s+Stirner|Stirner|ancap|anarcho-capitalist|"
    r"American\s+Psycho|Patrick\s+Bateman",
    re.IGNORECASE,
)

PLACEHOLDERS = re.compile(
    r"\bTODO\b|\bFIXME\b|\blorem\b|your name|\bxxx\b",
    re.IGNORECASE,
)

REQUIRED_SKILLS = (
    "PHP",
    "Java",
    "TypeScript",
    "JavaScript",
    "Rust",
    "Lua",
    "Linux",
    "Neovim",
    "PocketMine",
)

REQUIRED_SECTIONS = (
    re.compile(r"^#\s+OnurByte\s*$", re.MULTILINE),
    re.compile(r"^##\s+Stack\s*$", re.MULTILINE),
    re.compile(r"^##\s+What I actually build\s*$", re.MULTILINE),
    re.compile(r"^##\s+Selected work\s*$", re.MULTILINE),
)


def main() -> int:
    errors: list[str] = []

    if not README.is_file():
        print("FAIL: README.md missing at workspace root")
        return 1

    text = README.read_text(encoding="utf-8")
    size = len(text.encode("utf-8"))
    lines = text.count("\n") + (0 if text.endswith("\n") or not text else 1)

    if size < 1500:
        errors.append(f"size too small: {size} bytes (want >= 1500)")
    if lines < 40:
        errors.append(f"too few lines: {lines} (want >= 40)")

    banned_hits = BANNED.findall(text)
    if banned_hits:
        errors.append(f"banned tokens present: {banned_hits!r}")

    ph_hits = PLACEHOLDERS.findall(text)
    if ph_hits:
        errors.append(f"placeholders present: {ph_hits!r}")

    for skill in REQUIRED_SKILLS:
        if skill not in text:
            errors.append(f"missing skill signal: {skill}")

    for pat in REQUIRED_SECTIONS:
        if not pat.search(text):
            errors.append(f"missing section pattern: {pat.pattern}")

    if "I had a potential" not in text:
        errors.append("missing bio motif: 'I had a potential'")

    # All http(s) links must be https
    for url in re.findall(r"https?://[^\s)\"'>]+", text):
        if url.startswith("http://"):
            errors.append(f"non-https URL: {url}")

    # Balanced fenced code blocks
    fence_count = len(re.findall(r"^```", text, re.MULTILINE))
    if fence_count % 2 != 0:
        errors.append(f"unbalanced code fences: {fence_count}")

    if errors:
        print("FAIL: README verification")
        for e in errors:
            print(f"  - {e}")
        return 1

    print("PASS: README.md profile gates")
    print(f"  bytes={size} lines={lines} fences={fence_count}")
    print(f"  skills={', '.join(REQUIRED_SKILLS)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
