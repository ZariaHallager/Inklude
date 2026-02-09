#!/usr/bin/env python3
"""Print all lexicon entries as a quick sanity check / inventory report."""

from app.nlp.lexicon import get_all_entries


def main() -> None:
    entries = get_all_entries()
    print(f"Inklude Lexicon — {len(entries)} entries\n")
    print(f"{'Term':<30} {'Category':<25} {'Severity':<10} Alternatives")
    print("-" * 100)
    for e in sorted(entries, key=lambda x: (x.category.value, x.term)):
        alts = ", ".join(e.alternatives[:3])
        print(f"{e.term:<30} {e.category.value:<25} {e.severity.value:<10} {alts}")


if __name__ == "__main__":
    main()
