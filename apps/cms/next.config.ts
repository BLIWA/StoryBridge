import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for classic Firebase Hosting (*.web.app). The CMS's own
  // auth is entirely client-side (Firebase JS SDK), so no server is needed
  // yet. Route protection / server-verified sessions in Phase 04+ may
  // require revisiting this — see the root README.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
