#!/usr/bin/env python3
"""Generate the app icons for both apps from the charter's two-comma reduction.

    python3 scripts/build-icons.py

Writes, into apps/website/src/app and apps/cms/src/app:

    icon.svg          vector mark, transparent — what modern browsers prefer
    favicon.ico       16 / 32 / 48, each cut from its own tuning, not scaled
    apple-icon.png    180x180, bronze + cream on the charter's #001838 tile

The geometry, and the reason it is not just the master artwork shrunk, is in
scripts/icons/geometry.py.
"""

import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "icons"))

import geometry as g          # noqa: E402
import raster                 # noqa: E402

ROOT = os.path.dirname(HERE)
TARGETS = [
    os.path.join(ROOT, "apps", "website", "src", "app"),
    os.path.join(ROOT, "apps", "cms", "src", "app"),
]

ICO_SIZES = (16, 32, 48)
APPLE_SIZE = 180
# Apple masks the corners itself, so the tile is full-bleed and the mark carries
# its own breathing room instead.
APPLE_INSET = 0.20


def mark(size, tuning=None):
    return g.compose(size, **(tuning or g.tuning_for(size)))


def svg_source(size=64):
    bronze, navy = mark(size, g.LARGE)
    bronze, navy = g.simplify(bronze), g.simplify(navy)
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" '
        f'role="img" aria-label="StoryBridge">'
        f'<title>StoryBridge</title>'
        f'<path fill="{g.BRONZE}" d="{g.path_d(bronze)}"/>'
        f'<path fill="{g.NAVY}" d="{g.path_d(navy)}"/>'
        f'</svg>\n'
    )


def apple_rgba():
    size = APPLE_SIZE
    inner = round(size * (1 - 2 * APPLE_INSET))
    bronze, navy = mark(inner, g.LARGE)
    shift = (size - inner) / 2
    move = lambda poly: [(x + shift, y + shift) for x, y in poly]
    # Navy-on-navy would vanish; the charter's own app tile puts the mark in
    # cream on #001838, so the closing comma takes cream and bronze stays the
    # accent (5.1:1 on deep navy, per the charter's contrast table).
    return raster.render(
        [(move(bronze), g.BRONZE), (move(navy), g.CREAM)],
        size, background=g.NAVY_DEEP)


def main():
    svg = svg_source()
    ico = [(s, raster.render([(b, g.BRONZE), (n, g.NAVY)], s))
           for s in ICO_SIZES
           for b, n in [mark(s)]]
    apple = apple_rgba()

    for target in TARGETS:
        if not os.path.isdir(target):
            raise SystemExit(f"no such directory: {target}")
        with open(os.path.join(target, "icon.svg"), "w") as fh:
            fh.write(svg)
        raster.write_ico(os.path.join(target, "favicon.ico"), ico)
        raster.write_png(os.path.join(target, "apple-icon.png"), APPLE_SIZE, apple)
        rel = os.path.relpath(target, ROOT)
        print(f"  {rel}/icon.svg  favicon.ico  apple-icon.png")

    print(f"\nfavicon.ico carries {', '.join(f'{s}x{s}' for s in ICO_SIZES)} "
          f"({'small' if g.tuning_for(16) is g.SMALL else 'large'} cut at 16/24, "
          f"large cut from 32 up).")


if __name__ == "__main__":
    main()
