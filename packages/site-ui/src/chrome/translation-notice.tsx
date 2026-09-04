"use client";

import { useTranslations } from "next-intl";
import { isDraftLocale } from "../status";

/**
 * Says plainly, in the reader's own language, that they are looking at an
 * unreviewed translation. Rendered under the masthead on draft locales only —
 * see ../status.ts for why this exists rather than a silent ship.
 *
 * It reuses the bronze band the board already draws under the Arabic masthead,
 * so it costs the design nothing.
 *
 * Client `useTranslations`, not server `getTranslations` — moved here so the
 * CMS preview (a client tree, no next-intl/server request context) can mount
 * it too; the website already wraps everything in a NextIntlClientProvider,
 * so this resolves the same way there as it always did.
 */
export function TranslationNotice({ locale }: { locale: string }) {
  const t = useTranslations("Common");
  if (!isDraftLocale(locale)) return null;

  return (
    <div role="note" style={{ background: "#EFE1D2", borderTop: "1px solid #DEC5A9" }}>
      <div
        style={{
          maxWidth: "1320px",
          margin: "0 auto",
          padding: "9px var(--sb-gutter)",
          fontFamily: "'IBM Plex Mono',monospace",
          fontSize: "11.5px",
          lineHeight: 1.6,
          letterSpacing: "0.04em",
          color: "#8F6135",
        }}
      >
        {t("draftTranslation")}
      </div>
    </div>
  );
}
