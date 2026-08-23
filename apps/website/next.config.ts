import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Static export for classic Firebase Hosting (*.web.app). Firebase App
  // Hosting (real SSR) is the Phase 09 target once billing/SEO needs justify
  // it — see apphosting.yaml and the roadmap. Nothing here needs a server yet.
  output: "export",
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "firebasestorage.googleapis.com" }],
  },
};

export default withNextIntl(nextConfig);
