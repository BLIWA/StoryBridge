import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Shared renderer for opengraph-image.tsx and twitter-image.tsx.
 *
 * Not a route itself — nothing here matches a Next file convention, so it's
 * just a colocated module. The link-preview card pairs the actual master
 * mark (public/assets/storybridge-mark.png — the same gradient artwork the
 * site header, footer, and Bridge emails all use) with the wordmark, on
 * Content Cream. "The default in every medium."
 *
 * This used to redraw the mark as a flat single-color SVG trace — first the
 * two-comma reduction, briefly the favicon's own glyph — on the theory that
 * satori/ImageResponse couldn't rasterize the gradient PNG. It can (satori
 * supports <img> same as any raster source); embedding the real artwork
 * directly is what keeps this card matching the site everywhere else,
 * rather than inventing a third rendering of the logo.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "StoryBridge — Content & Media";

// Master artwork is 1205x1305 — keep that aspect ratio at the card's scale.
const MARK_WIDTH = 139;
const MARK_HEIGHT = 150;

// Neither depends on request data — read once at module scope.
const assetsPromise = Promise.all([
  readFile(join(process.cwd(), "src/assets/fonts/SourceSerif4-SemiBold.ttf")),
  readFile(join(process.cwd(), "src/assets/fonts/SourceSerif4-Regular.ttf")),
  readFile(join(process.cwd(), "public/assets/storybridge-mark.png")),
]);

export async function renderOgImage() {
  const [semibold, regular, mark] = await assetsPromise;
  const markSrc = `data:image/png;base64,${mark.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FDF8F1",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 44 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- satori renders this, not the browser */}
          <img src={markSrc} width={MARK_WIDTH} height={MARK_HEIGHT} alt="" />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                fontFamily: "Source Serif 4",
                fontWeight: 600,
                fontSize: 98,
                lineHeight: 1,
                color: "#002D62",
                letterSpacing: "-0.015em",
              }}
            >
              StoryBridge
            </div>
            <div
              style={{
                fontFamily: "Source Serif 4",
                fontWeight: 400,
                fontSize: 37,
                lineHeight: 1,
                color: "#B57D49",
                letterSpacing: "0.15em",
              }}
            >
              Content &amp; Media
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Source Serif 4", data: semibold, weight: 600, style: "normal" },
        { name: "Source Serif 4", data: regular, weight: 400, style: "normal" },
      ],
    },
  );
}
