import { size, contentType, alt, renderOgImage } from "./opengraph-shared";

// Static export (output: "export") needs every route explicitly opted into
// build-time generation — see opengraph-shared.tsx for why this is safe to
// prerender once.
export const dynamic = "force-static";
export { size, contentType, alt };

export default async function Image() {
  return renderOgImage();
}
