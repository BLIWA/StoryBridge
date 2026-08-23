import { getTranslations, setRequestLocale } from "next-intl/server";

const PILLAR_KEYS = ["editorial", "translation", "editing", "media"] as const;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
      <section className="border-b border-rule pb-14">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-bronze-deep">
          {t("eyebrow")}
        </p>
        <h1 className="mt-4 max-w-3xl text-balance font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-navy sm:text-6xl">
          {t("title")}
        </h1>
        <p className="mt-3 font-serif text-xl italic text-ink-mute">{t("subtitle")}</p>
        <p className="mt-8 max-w-2xl text-pretty text-[17px] leading-relaxed text-ink-soft">
          {t("about")}
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="#contact"
            className="rounded-sb bg-navy px-7 py-3.5 text-[15px] font-semibold text-cream transition-colors hover:bg-navy-hover"
          >
            {t("ctaPrimary")}
          </a>
          <a
            href="#how-we-work"
            className="rounded-sb border border-bronze px-7 py-3.5 text-[15px] font-semibold text-bronze-deep transition-colors hover:bg-bronze-tint"
          >
            {t("ctaSecondary")}
          </a>
        </div>
      </section>

      <section className="py-14">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-bronze-deep">
          {t("pillarsEyebrow")}
        </p>
        <div className="mt-6 grid gap-8 sm:grid-cols-2">
          {PILLAR_KEYS.map((key, i) => (
            <div key={key} className="border-t-2 border-navy pt-4">
              <span className="font-mono text-sm text-bronze-deep">
                0{i + 1}
              </span>
              <h3 className="mt-2 font-serif text-xl font-semibold text-navy">
                {t(`pillars.${key}.title`)}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                {t(`pillars.${key}.body`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t-2 border-navy py-10">
        <p className="font-serif text-lg italic text-ink-mute">{t("tagline")}</p>
      </footer>
    </main>
  );
}
