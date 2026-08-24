import { getTranslations } from "next-intl/server";
import { isDraftLocale } from "@/i18n/status";

/**
 * Says plainly, in the reader's own language, that they are looking at an
 * unreviewed translation. Rendered under the masthead on draft locales only —
 * see i18n/status.ts for why this exists rather than a silent ship.
 *
 * It reuses the bronze band the board already draws under the Arabic masthead,
 * so it costs the design nothing.
 */
export async function TranslationNotice({ locale }: { locale: string }) {
  if (!isDraftLocale(locale)) return null;
  const t = await getTranslations("Common");

  return (
    <div
      role="note"
      style={{ background: "#EFE1D2", borderTop: "1px solid #DEC5A9" }}
    >
      <div
        style={{
          maxWidth: "1320px",
          margin: "0 auto",
          padding: "9px 40px",
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
