#!/usr/bin/env python3
"""
rephrase.py - apply exact-text copy replacements across the site.

Built for the FAQ parity trap: an answer can exist in three places at once (the
shared faq-sections.njk include, a page's visible .faq-answer, and that page's
JSON-LD acceptedAnswer twin). Hand-editing one and missing another silently
breaks parity, so this applies every replacement everywhere and reports where
each one landed.

Each replacement is applied independently. A miss is reported and the rest
still go in, rather than one bad pattern discarding the whole run.

Usage:  python3 tools/rephrase.py edits/<file>.json [--dry-run]
"""
import json
import sys
import glob
import os
import re

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('-')]
    dry = '--dry-run' in sys.argv
    if not args:
        print(__doc__)
        return 1

    edits = json.load(open(args[0], encoding='utf8'))
    files = [f for f in sorted(glob.glob('src/**/*.njk', recursive=True)
                               + glob.glob('src/_data/*.js'))
             if '/es/' not in f.replace(os.sep, '/')]
    sources = {f: open(f, encoding='utf8').read() for f in files}

    total_hits = 0
    misses = []

    for i, e in enumerate(edits, 1):
        old, new = e['old'], e['new']
        hits = {}
        for f in files:
            n = sources[f].count(old)
            if n:
                hits[f] = n
                sources[f] = sources[f].replace(old, new)
        if not hits:
            misses.append((i, e.get('note', ''), old))
            print("  %2d. NO MATCH  %s" % (i, e.get('note', old[:60])))
            continue
        total_hits += sum(hits.values())
        print("  %2d. %-52s %s" % (
            i, e.get('note', '')[:52],
            ", ".join("%s x%d" % (os.path.relpath(f, 'src'), n) for f, n in hits.items())))

    if not dry:
        for f, text in sources.items():
            with open(f, 'w', encoding='utf8') as fh:
                fh.write(text)

    print("\n%d replacement(s) applied in %d place(s)%s"
          % (len(edits) - len(misses), total_hits, " [DRY RUN]" if dry else ""))
    if misses:
        print("%d did not match:" % len(misses))
        for i, note, old in misses:
            print("   %2d. %s\n       %r" % (i, note, old[:110]))
        return 2
    return 0

if __name__ == '__main__':
    sys.exit(main())
