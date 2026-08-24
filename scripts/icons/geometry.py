"""The flat two-comma reduction of the StoryBridge mark.

The Graphic Charter is explicit about why this exists:

    "Below 40px the master's gradients and inner highlight turn to mud —
     switch to the flat two-comma reduction and ship a hand-tuned SVG per
     size, never a scaled one."

The master artwork (assets/storybridge-mark.png) is a bronze opening comma
interlocked with a larger navy closing comma, both modelled with gradients and
an inner highlight. None of that survives a favicon, so this module rebuilds the
same gesture from scratch as two flat outlines: one centreline per comma, swept
with a width profile that runs from a needle at the tip to the full weight of
the bowl. Sizes are then tuned individually rather than scaled — see SIZES.
"""

import math

# --- the comma centreline, in its own 34 x 54 space -------------------------
# Four cubics: the tail sweeping in from the tip, down the left, around the
# bowl, and curling back inside. The bowl is deliberately open — the counter is
# the feature that has to survive being shrunk.
SEGMENTS = [
    ((30.0, 4.0),  (16.0, 5.0),  (6.0, 14.0),  (5.0, 27.0)),
    ((5.0, 27.0),  (4.5, 38.0),  (10.0, 47.0), (19.0, 49.5)),
    ((19.0, 49.5), (27.0, 51.0), (33.0, 46.0), (34.0, 37.0)),
    ((34.0, 37.0), (34.5, 31.0), (31.0, 27.0), (27.5, 26.0)),
]

BRONZE = "#B57D49"
NAVY = "#002D62"
CREAM = "#FDF8F1"
NAVY_DEEP = "#001838"


def _bezier(p0, c1, c2, p1, t):
    u = 1 - t
    return (u*u*u*p0[0] + 3*u*u*t*c1[0] + 3*u*t*t*c2[0] + t*t*t*p1[0],
            u*u*u*p0[1] + 3*u*u*t*c1[1] + 3*u*t*t*c2[1] + t*t*t*p1[1])


def _centreline(n=240):
    pts = []
    for i, seg in enumerate(SEGMENTS):
        steps = n if i == 0 else max(24, n // 2)
        for k in range(steps + 1):
            if i > 0 and k == 0:
                continue
            pts.append(_bezier(*seg, k / steps))
    return pts


def _normalised_arclength(pts):
    run = [0.0]
    for a, b in zip(pts, pts[1:]):
        run.append(run[-1] + math.hypot(b[0]-a[0], b[1]-a[1]))
    return [v / run[-1] for v in run]


def _halfwidth(s, wmax, wend, peak=0.45, tip=0.30):
    """Needle at the tip, full weight through the bowl, easing off as it curls
    back in so the stroke reads as ending rather than being cut."""
    if s <= peak:
        return tip + (wmax - tip) * (s / peak) ** 0.50
    u = (s - peak) / (1 - peak)
    return wmax + (wend - wmax) * (u ** 1.15)


def comma_outline(wmax, wend, n=240):
    """Closed outline of one comma, as a point list."""
    pts = _centreline(n)
    ss = _normalised_arclength(pts)
    left, right = [], []
    for i, p in enumerate(pts):
        a, b = pts[max(0, i-1)], pts[min(len(pts)-1, i+1)]
        tx, ty = b[0]-a[0], b[1]-a[1]
        length = math.hypot(tx, ty) or 1e-9
        nx, ny = -ty/length, tx/length
        w = _halfwidth(ss[i], wmax, wend)
        left.append((p[0] + nx*w, p[1] + ny*w))
        right.append((p[0] - nx*w, p[1] - ny*w))
    # Round the closing end rather than leaving a flat cut.
    end, prev = pts[-1], pts[-2]
    wcap = _halfwidth(1.0, wmax, wend)
    ang = math.atan2(end[1]-prev[1], end[0]-prev[0])
    cap = [(end[0] + math.cos(ang - math.pi/2 + k*math.pi/14) * wcap,
            end[1] + math.sin(ang - math.pi/2 + k*math.pi/14) * wcap)
           for k in range(15)]
    return left + cap + right[::-1]


def _bbox(poly):
    xs = [p[0] for p in poly]
    ys = [p[1] for p in poly]
    return min(xs), min(ys), max(xs), max(ys)


def _place(scale, rotate_deg, wmax, wend):
    poly = comma_outline(wmax, wend)
    x0, y0, x1, y1 = _bbox(poly)
    cx, cy = (x0+x1)/2, (y0+y1)/2
    r = math.radians(rotate_deg)
    cos_r, sin_r = math.cos(r), math.sin(r)
    out = []
    for x, y in poly:
        x, y = (x-cx)*scale, (y-cy)*scale
        out.append((x*cos_r - y*sin_r, x*sin_r + y*cos_r))
    bx0, by0, _, _ = _bbox(out)
    return [(x-bx0, y-by0) for x, y in out]


def compose(size, ox, oy, wmax, wend, gap, bronze_scale=0.545, navy_scale=0.78):
    """Bronze opening comma upper-left, navy closing comma lower-right.

    `ox`/`oy` offset the navy by a fraction of the bronze's own box, which is how
    the master holds the two apart: the navy is ~1.4x taller and sits down and to
    the right, overlapping the bronze's solid bulb but never its counter.
    Returns (bronze_polygon, navy_polygon) fitted to a `size` x `size` box.
    """
    bronze = _place(bronze_scale, 0, wmax, wend)
    navy = _place(navy_scale, 180, wmax, wend)
    bx0, by0, bx1, by1 = _bbox(bronze)
    bw, bh = bx1-bx0, by1-by0
    navy = [(x + bw*ox, y + bh*oy) for x, y in navy]

    x0, y0, x1, y1 = _bbox(bronze + navy)
    w, h = x1-x0, y1-y0
    s = (size - 2*gap) / max(w, h)
    dx, dy = (size - w*s)/2 - x0*s, (size - h*s)/2 - y0*s
    fit = lambda poly: [(x*s+dx, y*s+dy) for x, y in poly]
    return fit(bronze), fit(navy)


# --- per-size tuning --------------------------------------------------------
# Not scaled from one another. Below ~24px the counters close and the strokes go
# wispy, so the small cut is bolder, tighter and pushes the two commas further
# apart; the large cut can afford the master's own spacing.
LARGE = dict(ox=0.82, oy=0.42, wmax=6.8, wend=2.2, gap=1.0)
SMALL = dict(ox=0.92, oy=0.30, wmax=7.0, wend=2.4, gap=0.2)

SIZES = {16: SMALL, 24: SMALL, 32: LARGE, 48: LARGE, 64: LARGE,
         128: LARGE, 180: LARGE, 192: LARGE, 512: LARGE}


def tuning_for(size):
    if size in SIZES:
        return SIZES[size]
    return SMALL if size < 28 else LARGE


def simplify(poly, tol=0.04):
    """Douglas-Peucker. The outline is sampled far denser than an icon needs;
    this gets the committed SVG down to a few KB without a visible change."""
    if len(poly) < 3:
        return poly

    def rdp(pts):
        if len(pts) < 3:
            return pts
        (x0, y0), (x1, y1) = pts[0], pts[-1]
        dx, dy = x1-x0, y1-y0
        norm = math.hypot(dx, dy)
        worst, index = -1.0, 0
        for i in range(1, len(pts)-1):
            px, py = pts[i]
            d = (abs(dy*px - dx*py + x1*y0 - y1*x0) / norm if norm
                 else math.hypot(px-x0, py-y0))
            if d > worst:
                worst, index = d, i
        if worst <= tol:
            return [pts[0], pts[-1]]
        return rdp(pts[:index+1])[:-1] + rdp(pts[index:])

    import sys
    limit = sys.getrecursionlimit()
    sys.setrecursionlimit(max(limit, len(poly) + 100))
    try:
        return rdp(list(poly))
    finally:
        sys.setrecursionlimit(limit)


def path_d(poly, prec=2):
    d = [f"M{poly[0][0]:.{prec}f},{poly[0][1]:.{prec}f}"]
    for x, y in poly[1:]:
        d.append(f"L{x:.{prec}f},{y:.{prec}f}")
    return "".join(d) + "Z"
