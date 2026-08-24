import type { MetadataRoute } from "next";
import { SITE_URL } from "@/i18n/metadata";

/**
 * The CMS is kept out of the index by an X-Robots-Tag header in firebase.json
 * and by its own metadata; this covers the public site only.
 */
// output:"export" builds this to a static file at build time; Next requires the
// intent to be declared rather than inferred.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
