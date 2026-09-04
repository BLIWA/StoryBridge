import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for classic Firebase Hosting (*.web.app). The CMS's own
  // auth is entirely client-side (Firebase JS SDK), so no server is needed
  // yet. Route protection / server-verified sessions in Phase 04+ may
  // require revisiting this — see the root README.
  output: "export",
  images: { unoptimized: true },
  // @storybridge/content and @storybridge/site-ui ship raw TS — see
  // apps/website/next.config.ts. site-ui is the real website page bodies +
  // chrome, rendered here live (fed by in-progress edits) for the Site copy
  // editor's high-fidelity preview — see
  // src/components/views/site-content/live-preview.tsx.
  transpilePackages: ["@storybridge/content", "@storybridge/site-ui"],
};

export default nextConfig;
