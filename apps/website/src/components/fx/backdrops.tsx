/**
 * Backdrop layers from "StoryBridge Website v2.dc.html".
 *
 * The board repeats these SVG pattern fills on nearly every page with only the
 * pattern id changing (ids must stay unique per instance or the <defs> collide),
 * so they're factored out here rather than pasted per page. Geometry, stroke
 * widths, opacities and animation timings are copied exactly from the board.
 */

/** Interlocking arcs — the "weave". Hero of Home, Founders, How, and dark sections. */
export function ArcWeave({
  id,
  width = 144,
  height = 72,
  navyOpacity = 0.16,
  bronzeOpacity = 0.28,
}: {
  id: string;
  width?: number;
  height?: number;
  navyOpacity?: number;
  bronzeOpacity?: number;
}) {
  const r = height / 2;
  return (
    <svg width="100%" height="100%" style={{ display: "block" }}>
      <defs>
        <pattern id={id} width={width} height={height} patternUnits="userSpaceOnUse">
          <path
            d={`M 0,${height} A ${r},${r} 0 0 1 ${width / 2},${height} A ${r},${r} 0 0 1 ${width},${height}`}
            style={{ fill: "none", stroke: "#002D62", strokeWidth: "1.1px", opacity: navyOpacity }}
          />
          <path
            d={`M -${r},${r} A ${r},${r} 0 0 1 ${r},${r} A ${r},${r} 0 0 1 ${width / 2 + r},${r} A ${r},${r} 0 0 1 ${width + r},${r}`}
            style={{ fill: "none", stroke: "#B57D49", strokeWidth: "1.1px", opacity: bronzeOpacity }}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/** Bronze-on-navy weave used inside the dark (#001838) bands. */
export function ArcWeaveDark({ id }: { id: string }) {
  return (
    <svg width="100%" height="100%" style={{ display: "block" }}>
      <defs>
        <pattern id={id} width="72" height="36" patternUnits="userSpaceOnUse">
          <path
            d="M 0,36 A 18,18 0 0 1 36,36 A 18,18 0 0 1 72,36"
            style={{ fill: "none", stroke: "#B57D49", strokeWidth: "1.2px" }}
          />
          <path
            d="M -18,18 A 18,18 0 0 1 18,18 A 18,18 0 0 1 54,18 A 18,18 0 0 1 90,18"
            style={{ fill: "none", stroke: "#B57D49", strokeWidth: "1.2px" }}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/** Tiled open/close quotation marks — the "proof" bands and Journal sections. */
export function QuoteTile({
  id,
  size = 56,
  glyph = 40,
  opacity = 0.26,
}: {
  id: string;
  size?: number;
  glyph?: number;
  opacity?: number;
}) {
  return (
    <svg width="100%" height="100%" style={{ display: "block" }}>
      <defs>
        <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
          <text
            x="3"
            y={size * 0.64}
            fontFamily="'Source Serif 4',serif"
            fontSize={glyph}
            fill="#002D62"
            opacity={opacity}
          >
            &#8220;
          </text>
          <text
            x={size * 0.52}
            y={size}
            fontFamily="'Source Serif 4',serif"
            fontSize={glyph}
            fill="#B57D49"
            opacity={opacity}
          >
            &#8221;
          </text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/**
 * The drawn bridge: a span of arcs on a deck line with piers dropping from it.
 * Stroke-dash animation draws it in on load. `height` matches the board's
 * per-page viewBox (320 on Home, 180 on the inner-page heroes).
 */
export function BridgeArcs({ height = 180 }: { height?: number }) {
  const deck = height === 320 ? 240 : 132;
  return (
    <svg
      viewBox={`0 0 1600 ${height}`}
      preserveAspectRatio="none"
      width="100%"
      height="100%"
      style={{ display: "block" }}
    >
      <g
        data-a
        fill="none"
        stroke="#002D62"
        strokeOpacity="0.26"
        strokeLinecap="round"
        pathLength="1000"
        strokeDasharray="1000"
        strokeDashoffset="1000"
      >
        <path
          d={`M0,${deck} A 200,200 0 0 1 400,${deck} A 200,200 0 0 1 800,${deck} A 200,200 0 0 1 1200,${deck} A 200,200 0 0 1 1600,${deck}`}
          strokeWidth="1.6"
          style={{ animation: "sb-draw 2.2s cubic-bezier(.4,0,.2,1) .3s forwards" }}
        />
        <path
          d={`M0,${deck} L1600,${deck}`}
          strokeWidth="1.3"
          style={{ animation: "sb-draw 2.4s cubic-bezier(.4,0,.2,1) .15s forwards" }}
        />
        {height === 320 && (
          <path
            d={`M0,${deck + 8} L1600,${deck + 8}`}
            strokeWidth="0.7"
            strokeOpacity="0.5"
            style={{ animation: "sb-draw 2.6s cubic-bezier(.4,0,.2,1) .3s forwards" }}
          />
        )}
      </g>
      <g
        data-a
        fill="none"
        stroke="#B57D49"
        strokeOpacity="0.5"
        strokeLinecap="round"
        pathLength="1000"
        strokeDasharray="1000"
        strokeDashoffset="1000"
      >
        <path
          d={`M0,${height} L0,${deck} M400,${height} L400,${deck} M800,${height} L800,${deck} M1200,${height} L1200,${deck} M1600,${height} L1600,${deck}`}
          strokeWidth="1.3"
          style={{ animation: "sb-draw 1.3s ease-out 1.5s forwards" }}
        />
      </g>
    </svg>
  );
}

/**
 * Standard inner-page hero backdrop: weave or quote tile, an oversized
 * bronze quotation glyph, the drawn bridge, and a cream scrim over all of it.
 */
export function PageHeroBackdrop({
  id,
  variant = "arcs",
  glyph = "“",
}: {
  id: string;
  variant?: "arcs" | "quotes";
  glyph?: string;
}) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div
        data-parallax="26"
        style={{ position: "absolute", left: 0, right: 0, top: "-18%", height: "136%", willChange: "transform" }}
      >
        {variant === "arcs" ? (
          <ArcWeave id={id} width={120} height={60} bronzeOpacity={0.26} />
        ) : (
          <QuoteTile id={id} size={68} glyph={48} opacity={0.15} />
        )}
      </div>
      <div
        data-parallax="-52"
        style={{
          position: "absolute",
          insetInlineEnd: "2%",
          top: "-6%",
          fontFamily: "'Source Serif 4',serif",
          fontSize: "320px",
          lineHeight: "0.66",
          color: "#B57D49",
          opacity: 0.1,
          willChange: "transform",
        }}
      >
        {glyph}
      </div>
      <div
        data-parallax="14"
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "180px", willChange: "transform" }}
      >
        <BridgeArcs height={180} />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg,rgba(253,248,241,0.9) 0%,rgba(253,248,241,0.74) 46%,rgba(253,248,241,0.95) 100%)",
        }}
      />
    </div>
  );
}
