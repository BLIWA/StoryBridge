"""A small scanline rasteriser, so building the icons needs nothing but Python.

8x8 supersampled coverage per polygon, then source-over compositing. That is far
more than two flat shapes need, and it keeps the pipeline free of ImageMagick /
librsvg / Pillow, none of which this repo otherwise depends on.
"""

import struct
import zlib

SUPERSAMPLE = 8


def _hex_rgb(value):
    value = value.lstrip("#")
    return tuple(int(value[i:i+2], 16) for i in (0, 2, 4))


def coverage(poly, size, ss=SUPERSAMPLE):
    """Per-pixel coverage 0..1 of a closed polygon, even-odd fill."""
    n = size * ss
    acc = [0.0] * (size * size)
    edges = [(y0, y1, x0, x1)
             for (x0, y0), (x1, y1) in zip(poly, poly[1:] + poly[:1])
             if y0 != y1]
    if not edges:
        return acc

    lo = max(0, int(min(min(e[0], e[1]) for e in edges) * ss))
    hi = min(n - 1, int(max(max(e[0], e[1]) for e in edges) * ss) + 1)

    for sy in range(lo, hi + 1):
        yc = (sy + 0.5) / ss
        xs = [x0 + (yc - y0) * (x1 - x0) / (y1 - y0)
              for y0, y1, x0, x1 in edges
              if (y0 <= yc < y1) or (y1 <= yc < y0)]
        if not xs:
            continue
        xs.sort()
        row = (sy // ss) * size
        for i in range(0, len(xs) - 1, 2):
            xa, xb = xs[i] * ss, xs[i+1] * ss
            first, last = max(0, int(xa)), min(n - 1, int(xb))
            for sx in range(first, last + 1):
                left, right = max(xa, sx), min(xb, sx + 1)
                if right > left:
                    acc[row + sx // ss] += right - left

    inv = 1.0 / (ss * ss)
    return [min(1.0, v * inv) for v in acc]


def render(layers, size, background=None):
    """layers: [(polygon, "#rrggbb")] painted in order. Returns RGBA bytes."""
    if background:
        r, g, b = _hex_rgb(background)
        buf = [[float(r), float(g), float(b), 1.0] for _ in range(size * size)]
    else:
        buf = [[0.0, 0.0, 0.0, 0.0] for _ in range(size * size)]

    for poly, colour in layers:
        cr, cg, cb = _hex_rgb(colour)
        for i, a in enumerate(coverage(poly, size)):
            if a <= 0:
                continue
            dst = buf[i]
            out_a = a + dst[3] * (1 - a)
            if out_a <= 0:
                continue
            keep = dst[3] * (1 - a)
            dst[0] = (cr * a + dst[0] * keep) / out_a
            dst[1] = (cg * a + dst[1] * keep) / out_a
            dst[2] = (cb * a + dst[2] * keep) / out_a
            dst[3] = out_a

    out = bytearray(size * size * 4)
    for i, d in enumerate(buf):
        out[i*4+0] = max(0, min(255, round(d[0])))
        out[i*4+1] = max(0, min(255, round(d[1])))
        out[i*4+2] = max(0, min(255, round(d[2])))
        out[i*4+3] = max(0, min(255, round(d[3] * 255)))
    return bytes(out)


def write_png(path, size, rgba):
    raw = b"".join(b"\x00" + rgba[y*size*4:(y+1)*size*4] for y in range(size))
    def chunk(tag, data):
        return (struct.pack(">I", len(data)) + tag + data
                + struct.pack(">I", zlib.crc32(tag + data) & 0xffffffff))
    png = (b"\x89PNG\r\n\x1a\n"
           + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
           + chunk(b"IDAT", zlib.compress(raw, 9))
           + chunk(b"IEND", b""))
    with open(path, "wb") as fh:
        fh.write(png)
    return png


def png_bytes(size, rgba):
    raw = b"".join(b"\x00" + rgba[y*size*4:(y+1)*size*4] for y in range(size))
    def chunk(tag, data):
        return (struct.pack(">I", len(data)) + tag + data
                + struct.pack(">I", zlib.crc32(tag + data) & 0xffffffff))
    return (b"\x89PNG\r\n\x1a\n"
            + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(raw, 9))
            + chunk(b"IEND", b""))


def write_ico(path, entries):
    """entries: [(size, rgba_bytes)]. PNG-compressed ICO — read by every browser
    still in support, and a fraction of the size of the BMP form."""
    images = [(size, png_bytes(size, rgba)) for size, rgba in entries]
    header = struct.pack("<HHH", 0, 1, len(images))
    offset = len(header) + 16 * len(images)
    directory, blobs = b"", b""
    for size, blob in images:
        directory += struct.pack(
            "<BBBBHHII",
            0 if size >= 256 else size, 0 if size >= 256 else size,
            0, 0, 1, 32, len(blob), offset)
        blobs += blob
        offset += len(blob)
    with open(path, "wb") as fh:
        fh.write(header + directory + blobs)
