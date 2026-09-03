#!/usr/bin/env python3
"""Generate the app icons for both apps from scripts/icons/source/favicon.svg
(the shipped mark: Content Cream circle, Narrative Navy keyline, navy glyph).

    python3 scripts/build-icons.py

Writes, into apps/website/src/app and apps/cms/src/app:

    icon.svg          the source SVG, copied verbatim
    favicon.ico       16 / 32 / 48, rasterised from it
    apple-icon.png    180x180, on a Content Cream tile (iOS wants opaque
                       corners; the source SVG's own circle is transparent
                       outside its ring)

favicon.svg only uses straight M/L/Z path segments plus one <circle>, so both
parse cleanly into polygons for scripts/icons/raster.py's scanline
rasteriser — no image-processing dependency needed.

There used to be a from-scratch geometry module here generating a different
mark procedurally; its output wasn't right, so it's gone. This script now
treats scripts/icons/source/favicon.svg as the single source of truth and
just rasterises it.
"""

import math
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "icons"))

import raster  # noqa: E402

ROOT = os.path.dirname(HERE)
SOURCE_SVG = os.path.join(HERE, "icons", "source", "favicon.svg")
TARGETS = [
    os.path.join(ROOT, "apps", "website", "src", "app"),
    os.path.join(ROOT, "apps", "cms", "src", "app"),
]

ICO_SIZES = (16, 32, 48)
APPLE_SIZE = 180
CREAM = "#FDF8F1"


def _num_pairs(text):
    nums = re.findall(r"-?\d+(?:\.\d+)?", text)
    return [(float(nums[i]), float(nums[i + 1])) for i in range(0, len(nums), 2)]


def _attr(tag, name):
    m = re.search(rf'{name}="([^"]+)"', tag)
    return m.group(1) if m else None


def load_source():
    """Parse favicon.svg's viewBox, <circle>, and its one transformed <path>
    into plain polygons, all in viewBox space."""
    src = open(SOURCE_SVG).read()

    viewbox = [float(v) for v in _attr(src, "viewBox").split()]
    vb_size = viewbox[2]

    circle_tag = re.search(r"<circle[^>]*/>", src).group(0)
    cx, cy, r = (float(_attr(circle_tag, a)) for a in ("cx", "cy", "r"))
    stroke_w = float(_attr(circle_tag, "stroke-width"))
    ring_fill = _attr(circle_tag, "fill")
    ring_stroke = _attr(circle_tag, "stroke")

    path_tag = re.search(r"<path[^>]*/>", src).group(0)
    glyph_fill = _attr(path_tag, "fill")
    glyph_pts = _num_pairs(_attr(path_tag, "d"))

    transform = _attr(path_tag, "transform") or ""
    # translate(cx cy) scale(s) translate(-cx -cy) -- pull s out generically
    # rather than assuming these exact numbers.
    scale_m = re.search(r"scale\(([-\d.]+)\)", transform)
    s = float(scale_m.group(1)) if scale_m else 1.0
    tx_m = re.findall(r"translate\(([-\d.]+)[ ,]([-\d.]+)\)", transform)
    if len(tx_m) >= 1:
        ox, oy = float(tx_m[0][0]), float(tx_m[0][1])
    else:
        ox, oy = cx, cy
    glyph_pts = [(ox + s * (x - ox), oy + s * (y - oy)) for x, y in glyph_pts]

    return {
        "vb_size": vb_size,
        "cx": cx, "cy": cy, "r": r, "stroke_w": stroke_w,
        "ring_fill": ring_fill, "ring_stroke": ring_stroke,
        "glyph_fill": glyph_fill, "glyph_pts": glyph_pts,
    }


def _circle_poly(cx, cy, r, n=256):
    return [(cx + r * math.cos(2 * math.pi * i / n),
             cy + r * math.sin(2 * math.pi * i / n)) for i in range(n)]


def layers_for(source, size, square_bg=None):
    k = size / source["vb_size"]
    scale = lambda pts: [(x * k, y * k) for x, y in pts]

    out = []
    if square_bg:
        out.append(([(0, 0), (size, 0), (size, size), (0, size)], square_bg))
    out.append((scale(_circle_poly(source["cx"], source["cy"],
                                    source["r"] + source["stroke_w"] / 2)),
                source["ring_stroke"]))
    out.append((scale(_circle_poly(source["cx"], source["cy"],
                                    source["r"] - source["stroke_w"] / 2)),
                source["ring_fill"]))
    out.append((scale(source["glyph_pts"]), source["glyph_fill"]))
    return out


def main():
    source = load_source()
    icon_svg = open(SOURCE_SVG).read()

    ico = [(s, raster.render(layers_for(source, s), s)) for s in ICO_SIZES]
    apple = raster.render(layers_for(source, APPLE_SIZE, square_bg=CREAM), APPLE_SIZE)

    for target in TARGETS:
        if not os.path.isdir(target):
            raise SystemExit(f"no such directory: {target}")
        with open(os.path.join(target, "icon.svg"), "w") as fh:
            fh.write(icon_svg)
        raster.write_ico(os.path.join(target, "favicon.ico"), ico)
        raster.write_png(os.path.join(target, "apple-icon.png"), APPLE_SIZE, apple)
        rel = os.path.relpath(target, ROOT)
        print(f"  {rel}/icon.svg  favicon.ico  apple-icon.png")

    print(f"\nfavicon.ico carries {', '.join(f'{s}x{s}' for s in ICO_SIZES)}, "
          f"all rasterised from {os.path.relpath(SOURCE_SVG, ROOT)}.")


if __name__ == "__main__":
    main()
