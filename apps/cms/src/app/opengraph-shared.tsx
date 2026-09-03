import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Shared renderer for opengraph-image.tsx and twitter-image.tsx.
 *
 * Mirrors apps/website/src/app/opengraph-shared.tsx: the charter's own
 * "Primary lockup" (Logo system, 01) — the flat two-comma reduction, same as
 * the favicon, paired with the wordmark, on Content Cream. Kept identical to
 * the public site's card rather than inventing a "Studio" sub-lockup the
 * charter doesn't define — this is still the StoryBridge brand, just an
 * internal tool's link preview.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "StoryBridge — Studio";

// Same outline as icon.svg, traced once and reused rather than scaled from
// the master artwork — see apps/website/scripts/icons/geometry.py for why.
const BRONZE_D =
  "M24.13,1.87L24.00,1.63L23.88,1.53L23.40,1.31L22.57,1.12L21.63,1.02L20.58,1.01L19.44,1.09L18.31,1.25L17.20,1.50L15.27,2.12L13.33,3.01L11.53,4.14L9.87,5.50L8.46,6.98L7.28,8.54L6.22,10.35L5.40,12.21L4.78,14.19L4.36,16.27L4.20,18.40L4.25,20.45L4.46,22.27L4.76,23.65L5.58,25.67L6.63,27.55L7.89,29.26L9.21,30.65L10.68,31.86L12.29,32.87L14.20,33.74L16.36,34.35L17.70,34.48L19.20,34.45L20.95,34.16L22.45,33.66L23.97,32.87L25.31,31.84L25.96,31.20L26.63,30.37L27.22,29.48L27.71,28.53L28.12,27.54L28.44,26.49L28.68,25.41L28.83,24.29L28.90,23.12L28.86,22.19L28.72,21.20L28.50,20.26L28.19,19.39L27.77,18.49L27.27,17.69L26.70,16.97L25.88,16.18L24.92,15.50L23.98,15.03L22.95,14.72L22.16,17.40L21.62,17.10L21.26,16.59L21.16,15.98L21.34,15.38L21.52,15.12L22.03,14.77L22.33,14.68L22.95,14.72L22.16,17.40L22.75,17.74L23.31,18.21L23.78,18.77L24.16,19.44L24.42,20.15L24.57,20.87L24.62,21.66L24.56,22.46L24.29,23.62L23.88,24.73L23.34,25.73L22.74,26.53L22.04,27.16L21.31,27.58L20.48,27.85L19.59,27.94L18.73,27.87L17.87,27.66L17.97,27.66L16.89,27.11L16.25,26.67L15.60,26.10L15.08,25.54L14.55,24.85L13.82,23.55L13.29,22.17L12.47,19.25L12.29,18.24L12.14,16.92L12.17,15.81L12.29,14.66L12.49,13.63L12.80,12.57L13.20,11.54L13.69,10.55L14.28,9.60L14.92,8.75L16.28,7.31L17.91,6.00L19.99,4.73L23.47,2.99L23.97,2.63L24.16,2.26Z";
const NAVY_D =
  "M31.27,61.75L31.46,62.10L31.63,62.24L32.32,62.55L33.50,62.83L34.85,62.97L36.35,62.99L37.99,62.88L39.61,62.64L41.20,62.29L42.59,61.89L43.96,61.40L45.29,60.84L46.73,60.12L48.11,59.31L49.31,58.50L50.59,57.52L51.68,56.56L52.72,55.54L53.70,54.45L55.39,52.21L56.18,50.94L56.91,49.61L57.56,48.23L58.08,46.96L58.97,44.13L59.57,41.14L59.79,38.10L59.73,35.16L59.43,32.56L59.16,31.14L59.00,30.59L58.50,29.25L57.82,27.69L57.17,26.44L56.32,25.00L55.37,23.64L54.51,22.55L53.60,21.53L52.63,20.57L51.60,19.67L50.52,18.84L49.39,18.07L48.22,17.39L46.75,16.66L45.48,16.15L43.92,15.64L42.39,15.26L40.47,15.08L38.34,15.13L36.95,15.31L35.82,15.54L34.73,15.86L33.67,16.25L32.66,16.72L31.50,17.39L30.60,18.01L29.58,18.86L28.66,19.78L27.69,20.96L26.86,22.24L26.15,23.59L25.56,25.02L25.10,26.51L24.77,28.06L24.55,29.67L24.45,31.34L24.51,32.67L24.70,34.09L25.02,35.44L25.46,36.69L26.07,37.96L26.79,39.12L27.60,40.14L28.77,41.28L30.14,42.25L31.49,42.92L32.96,43.37L34.09,39.52L34.50,39.70L34.87,39.96L35.16,40.29L35.38,40.69L35.50,41.12L35.52,41.57L35.45,42.01L35.27,42.42L35.01,42.79L34.68,43.08L34.28,43.30L33.85,43.42L33.40,43.44L32.96,43.37L34.09,39.52L33.24,39.04L32.45,38.37L31.78,37.56L31.23,36.61L30.85,35.60L30.64,34.56L30.57,33.43L30.66,32.29L31.05,30.63L31.64,29.04L32.40,27.60L33.27,26.47L34.27,25.57L35.31,24.96L36.49,24.57L37.77,24.45L39.00,24.55L40.24,24.84L40.09,24.84L41.63,25.63L42.55,26.27L43.48,27.08L44.23,27.88L44.98,28.87L45.58,29.83L46.04,30.73L46.79,32.70L47.96,36.87L48.23,38.33L48.43,40.22L48.39,41.81L48.22,43.45L47.93,44.92L47.49,46.45L46.92,47.92L46.21,49.33L45.37,50.69L44.45,51.91L43.49,53.00L42.51,53.97L41.35,54.96L40.18,55.84L38.81,56.75L37.21,57.67L32.22,60.15L31.50,60.66L31.36,60.83L31.23,61.20Z";

// The font doesn't depend on request data — read once at module scope.
// Same two cuts of Source Serif 4 the app itself loads in app/layout.tsx,
// just as static TTFs (satori doesn't parse woff2).
const fontsPromise = Promise.all([
  readFile(join(process.cwd(), "src/assets/fonts/SourceSerif4-SemiBold.ttf")),
  readFile(join(process.cwd(), "src/assets/fonts/SourceSerif4-Regular.ttf")),
]);

export async function renderOgImage() {
  const [semibold, regular] = await fontsPromise;

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
          <svg width="150" height="150" viewBox="0 0 64 64">
            <path fill="#B57D49" d={BRONZE_D} />
            <path fill="#002D62" d={NAVY_D} />
          </svg>
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
              Studio
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
