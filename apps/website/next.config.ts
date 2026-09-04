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
  // @storybridge/content and @storybridge/site-ui ship raw TS — Next only
  // transpiles node_modules-linked packages it's told to. site-ui is the
  // shared page bodies + chrome also rendered live by apps/cms's preview —
  // see packages/site-ui/package.json.
  transpilePackages: ["@storybridge/content", "@storybridge/site-ui"],
};

export default withNextIntl(nextConfig);
