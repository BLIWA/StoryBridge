import { size, contentType, alt, renderOgImage } from "./opengraph-shared";

export const dynamic = "force-static";
export { size, contentType, alt };

export default async function Image() {
  return renderOgImage();
}
