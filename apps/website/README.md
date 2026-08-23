# @storybridge/website

The public marketing site — Next.js 16 (App Router, Turbopack), server-rendered, trilingual (`en` / `fr` / `ar`, RTL for Arabic) via `next-intl`.

Run from the repo root: `pnpm dev:website` (port 3000). See the root [README](../../README.md) for the full picture — architecture, roadmap, open questions.

- `src/app/[locale]/` — routed pages. Every route lives under a locale segment; there is no un-prefixed route.
- `src/i18n/` — `next-intl` routing, request config, typed navigation helpers.
- `messages/{en,fr,ar}.json` — copy, one file per locale. **The `fr` and `ar` files are draft machine translations** written to prove the layout in all three languages — they have not been reviewed by Imen. Treat as placeholder copy, not final, until a native pass happens (see root README, open question on translation review).
- Design tokens come from `@storybridge/ui` (`packages/ui/src/tokens.css`), ported 1:1 from the Graphic Charter board — don't hand-pick colors here.
