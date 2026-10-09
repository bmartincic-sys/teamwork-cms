#!/usr/bin/env python3
"""
optimize.py - make WebP versions of the site's raster images.

Writes a .webp beside each JPG/PNG the built site references, plus a smaller
-1200 variant of large photos for phones, and records them in manifest.json.
The originals stay: the build (an Eleventy transform) swaps each <img> to the
WebP at output time, so templates keep their readable .jpg/.png paths and a
missing WebP simply falls back to the original.

Run locally after adding images, then commit the .webp files:

    npm run build
    python3 tools/images/optimize.py

Needs cwebp (brew install webp) and Pillow. Netlify does not run this.

Sizing is by what the image is, not one cap for everything:
  security badges   displayed ~60px          -> max 200px
  logos             displayed ~150px         -> max 600px, alpha kept
  photos/screens    up to full-bleed heroes  -> max 2000px, plus 1200px variant
A WebP is only kept if it is meaningfully smaller than the original.
"""
import glob
import json
import os
import re
import subprocess
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, "src")
SITE = os.path.join(ROOT, "_site")
MANIFEST = os.path.join(ROOT, "tools", "images", "manifest.json")
SMALL_W = 1200


def referenced():
    refs = set()
    pat = re.compile(r"(/assets/images/[^\"'\s)?,]+\.(?:jpe?g|png))", re.I)
    for f in glob.glob(SITE + "/**/*.html", recursive=True) + glob.glob(SITE + "/assets/css/*.css"):
        if "/lp/" in f:
            continue
        refs.update(pat.findall(open(f, encoding="utf8", errors="ignore").read()))
    return sorted(refs)


def kind(url):
    if "/security/" in url:
        return "badge"
    if "/logos/" in url or re.search(r"logo", os.path.basename(url), re.I):
        return "logo"
    return "photo"


def cwebp(src, dst, width, quality, alpha=False):
    args = ["cwebp", "-quiet", "-mt", "-q", str(quality), "-m", "6"]
    if alpha:
        args += ["-alpha_q", "100", "-exact"]
    if width:
        args += ["-resize", str(width), "0"]
    subprocess.run(args + [src, "-o", dst], check=True)


def main():
    if not os.path.isdir(SITE):
        sys.exit("run `npm run build` first; this reads the built site")
    # Start from the existing manifest. The built site already serves every recorded
    # image as WebP, so a fresh scan cannot see those originals; a rewrite from scratch
    # silently dropped them all (which is how the case-study photos went back to JPG).
    manifest = {}
    if os.path.exists(MANIFEST):
        with open(MANIFEST) as fh:
            manifest = json.load(fh)
        manifest = {u: e for u, e in manifest.items() if os.path.exists(SRC + u) and os.path.exists(SRC + e["webp"])}
    saved = 0
    for url in referenced():
        if url in manifest:
            continue
        path = SRC + url
        if not os.path.exists(path):
            continue
        im = Image.open(path)
        w, h = im.size
        has_alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)
        k = kind(url)
        cap = {"badge": 200, "logo": 600, "photo": 2000}[k]
        q = {"badge": 88, "logo": 90, "photo": 78}[k]
        out_w = min(w, cap)

        base = os.path.splitext(path)[0]
        webp = base + ".webp"
        cwebp(path, webp, out_w if out_w < w else 0, q, alpha=has_alpha)
        orig = os.path.getsize(path)
        new = os.path.getsize(webp)
        if new > orig * 0.9:
            os.remove(webp)              # not worth it; keep serving the original
            continue

        entry = {"webp": os.path.splitext(url)[0] + ".webp", "w": out_w}
        if k == "photo" and out_w > SMALL_W + 200:
            small = base + f"-{SMALL_W}.webp"
            cwebp(path, small, SMALL_W, q, alpha=has_alpha)
            entry["small"] = os.path.splitext(url)[0] + f"-{SMALL_W}.webp"
        manifest[url] = entry
        saved += orig - new

    with open(MANIFEST, "w") as fh:
        json.dump(manifest, fh, indent=1, sort_keys=True)
    print(f"{len(manifest)} images converted, {saved/1024/1024:.1f} MB smaller at full size -> {MANIFEST}")


if __name__ == "__main__":
    main()
