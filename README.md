# StoryBridge Content & Media — monorepo

Website + CMS for StoryBridge Content & Media. Full build plan, architecture rationale and every open question live in the roadmap document — read that first:

**→ [Roadmap & Open Questions](https://claude.ai/code/artifact/a1b752c4-215f-4508-a2a8-7a09287cba5a)**

**Live now:**
- Website — https://sotrybridge.web.app (redirects `/` → `/en`; `/fr`, `/ar` also live, RTL for Arabic)
- CMS — https://cms-sotrybridge.web.app (sign-in screen; `noindex`)

This repo is past Phase 01 (infrastructure scaffold) and has a first deploy live via classic Firebase Hosting static export — see "Hosting: static export today, App Hosting later" below for why. See "What's not done yet" for everything still ahead.

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
                Firebase project config. firestore.rules is real for `staff`
                (see below) and deny-by-default for everything else
scripts/bootstrap-owner.sh
                Seeds the first CMS owner — the one grant the rules can't make
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

The CMS ships with working Firebase config committed in `apps/cms/.env.production` — nothing to fill in. Sign-in works out of the box; who it lets *in* is a separate question, answered in [apps/cms/README.md](apps/cms/README.md).

## Hosting: static export today, App Hosting later

Both apps currently build with `output: "export"` and deploy as static files to classic Firebase Hosting — two sites in the one `sotrybridge` project, mapped via `.firebaserc` targets (`website` → `sotrybridge`, `cms` → `cms-sotrybridge`):

```bash
pnpm build                              # writes apps/{website,cms}/out
firebase deploy --only hosting --project sotrybridge
```

This was the pragmatic call for the first deploy: the requested URLs are `*.web.app`, which is what classic Hosting gives you (App Hosting backends get a different default domain shape), and static Hosting needs no Blaze plan — nothing in either app requires a server yet, so there was no reason to put billing on the table just to get something live.

**`apphosting.yaml` is still in the repo for both apps** — real SSR via Firebase App Hosting remains the Phase 09 plan, revisited once something actually needs a server (ISR'd Journal posts, for instance) or once Blaze billing is a deliberate decision rather than a side effect of a first deploy. Custom domains (root domain → website, `cms.[domain]` → cms) get attached at that point too, once there's a real domain and DNS access (open question).

## What's not done yet

CMS auth is done — the project is provisioned, sign-in works, and staff/roles
are real and enforced in `firestore.rules` (see "Firebase project state" below).
What remains, in order:

1. Design system components (`packages/ui`) beyond raw tokens
2. The 10 marketing-site sections, with real copy
3. Article/page/newsletter/forms CMS modules
4. Content migration into Firestore
5. Security rules for those content collections
6. QA, legal pages, launch

Full detail, durations and the specific questions blocking each step: see the roadmap link above.

## Firebase project state

The `sotrybridge` project is provisioned and in use:

| Piece | State |
| --- | --- |
| Web app | Registered. Config committed in `apps/cms/.env.production` — public identifiers, not secrets |
| Auth | Email/password **and** Google both enabled |
| Authorised domains | `localhost`, `sotrybridge.web.app`, `cms-sotrybridge.web.app` (+ the two `.firebaseapp.com` forms) |
| Firestore | Native mode, **`eur3`** (Europe multi-region) — permanent, chosen for Tunis/EU latency and keeping content in the EU |
| Firestore rules | Real for `staff`; deny-by-default everywhere else |
| Storage | API not enabled yet; rules stay deny-all until the Phase 05 media library |
| Billing | Still Spark. Nothing added here needs Blaze |

`cms-sotrybridge.web.app` had to be added to the authorised-domain list —
without it Google sign-in fails on the live CMS with `auth/unauthorized-domain`,
because the list Firebase seeds a project with only covers the default site.

### Roles without Cloud Functions

Role enforcement usually means Firebase custom claims, which means the Admin SDK
in a Cloud Function, which means Blaze billing. Instead a person's role lives in
their `staff/{email}` document and `firestore.rules` reads it with a `get()`.
That costs one extra document read per rule evaluation and buys genuine
server-side enforcement on the free plan today. Moving to claims later touches
`lib/staff.ts` and the rules' helper functions; nothing else.

## A note on the `fr`/`ar` copy already in the repo

`apps/website/messages/fr.json` and `ar.json` exist so the trilingual layout (including RTL) could be verified end-to-end during scaffolding. They are **my draft translations**, not reviewed by Imen — StoryBridge's own translator. Treat every non-English string in this repo as placeholder until a native pass happens; this is exactly the kind of gap a company selling translation quality shouldn't ship silently.
