# StoryBridge Content & Media — monorepo

Website + CMS for StoryBridge Content & Media. Full build plan, architecture rationale and every open question live in the roadmap document — read that first:

**→ [Roadmap & Open Questions](https://claude.ai/code/artifact/a1b752c4-215f-4508-a2a8-7a09287cba5a)**

This repo is at **Phase 01 (infrastructure scaffold)**: the monorepo, both Next.js apps, shared design tokens, and Firebase project files exist and build cleanly. Nothing is deployed and no Firebase resources have been created yet — see "What's not done yet" below.

## Locked decisions

Confirmed while scaffolding this phase:

- **Rendering**: Next.js 16 (App Router, Turbopack), server-rendered — not static export, not a client-only SPA.
- **i18n**: full trilingual site — every route lives under `/en`, `/fr`, `/ar`, with RTL layout for Arabic. Not English-primary-with-multilingual-blog.
- **Case studies**: ships as a placeholder/"coming soon" section, not omitted, not seeded with fake work.
- **Newsletter send**: custom pipeline (Cloud Functions + a transactional email API — Resend/SendGrid, not yet chosen), not a third-party ESP.

## Layout

```
apps/website/   Public site — Next.js, next-intl (en/fr/ar), no Firebase client yet
apps/cms/       "Studio" — Next.js, Firebase Auth (email/password + Google)
packages/ui/    Design tokens ported from the Graphic Charter board — the single
                source both apps import (packages/ui/src/tokens.css)
firebase.json, .firebaserc, firestore.rules, firestore.indexes.json, storage.rules
                Firebase project config — deny-by-default rules until Phase 04–06
apps/*/apphosting.yaml
                Firebase App Hosting config, one backend per app (see below)
```

## Running locally

```bash
pnpm install
pnpm dev            # both apps, via turbo
pnpm dev:website     # → http://localhost:3000
pnpm dev:cms         # → http://localhost:3001
```

`apps/cms` needs `.env.local` (copy `.env.example`) with real Firebase web-app config before sign-in actually works — see [apps/cms/README.md](apps/cms/README.md).

## Why Firebase App Hosting, not classic Hosting

The site needs real SSR (Phase 00 decision), so this repo targets **Firebase App Hosting**, not `firebase.json`'s classic `hosting` key (that's for static files / rewrites to Cloud Functions, the older pattern). Each app carries its own `apphosting.yaml`. Two backends will exist in the one `sotrybridge` project — one per app, per your "separate hosting, subdomain" instruction:

```bash
firebase apphosting:backends:create --project=sotrybridge   # run once per app, rootDir apps/website
firebase apphosting:backends:create --project=sotrybridge   # again, rootDir apps/cms
```

Custom domains (root domain → website backend, `cms.[domain]` → cms backend) get attached after each backend exists — that's Phase 09, and needs the real domain and DNS access (open question).

## What's not done yet

Everything past Phase 01. In order:

1. Design system components (`packages/ui`) beyond raw tokens
2. The 10 marketing-site sections, with real copy
3. CMS auth hardening — route protection, role/claims, staff invite flow
4. Article/page/newsletter/forms CMS modules
5. Content migration into Firestore
6. QA, security rules, legal pages, launch

Full detail, durations and the specific questions blocking each step: see the roadmap link above.

## A note on the `fr`/`ar` copy already in the repo

`apps/website/messages/fr.json` and `ar.json` exist so the trilingual layout (including RTL) could be verified end-to-end during scaffolding. They are **my draft translations**, not reviewed by Imen — StoryBridge's own translator. Treat every non-English string in this repo as placeholder until a native pass happens; this is exactly the kind of gap a company selling translation quality shouldn't ship silently.
