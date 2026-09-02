# StoryBridge Content & Media — monorepo

Website + CMS for StoryBridge Content & Media. Full build plan, architecture rationale and every open question live in the roadmap document — read that first:

**→ [Roadmap & Open Questions](https://claude.ai/code/artifact/a1b752c4-215f-4508-a2a8-7a09287cba5a)**

**Live now:**
- Website — https://storybridge.news (custom domain; `storybridge-eb71e.web.app` still works too) — redirects `/` → `/en`; `/fr`, `/ar` also live, RTL for Arabic
- CMS — https://cms.storybridge.news (custom domain; `cma-storybridge.web.app` still works too) — sign-in screen; `noindex`

Custom domains were attached to Firebase Hosting on 2 Sep 2026; SSL provisioning
on Firebase's side can take a little while after DNS is pointed at it, so give
a fresh domain a bit before treating a cert mismatch as a real problem.

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

### Developing against sample data instead of production

`storybridge-eb71e` has a second Firestore database, `test` — same project, same `firestore.rules`, no real content. To point either app at it instead of production:

```bash
# in apps/website/.env.local and/or apps/cms/.env.local
NEXT_PUBLIC_FIRESTORE_DATABASE_ID=test
```

Populate it with a representative sample (a few staff roles, articles in every status, contact submissions, subscribers, media):

```bash
./scripts/seed-test-db.sh storybridge-eb71e you@example.com   # 2nd arg optional — seeds *you* an owner record there too
```

Firebase Auth is project-wide, not per-database, so your real sign-in works against `test` the same as production; the sample roster otherwise is fake `@example.com` addresses nobody can actually sign in as. Cloud Functions (the Resend pipeline) always read/write the `(default)` database regardless of which one either app's UI points at — there's no test-mode mail pipeline, so nothing in `test` triggers a real email.

## Hosting: static export today, App Hosting later

Both apps currently build with `output: "export"` and deploy as static files to classic Firebase Hosting — two sites in the one `storybridge-eb71e` project, mapped via `.firebaserc` targets (`website` → `storybridge-eb71e`, `cms` → `cma-storybridge`):

```bash
pnpm build                              # writes apps/{website,cms}/out
firebase deploy --only hosting --project storybridge-eb71e
```

This was the pragmatic call for the first deploy: the requested URLs are `*.web.app`, which is what classic Hosting gives you (App Hosting backends get a different default domain shape), and static Hosting needs no Blaze plan — nothing in either app requires a server yet, so there was no reason to put billing on the table just to get something live.

**`apphosting.yaml` is still in the repo for both apps** — real SSR via Firebase App Hosting remains the Phase 09 plan, revisited once something actually needs a server (ISR'd Journal posts, for instance). Billing is no longer the blocker (Blaze has been on since the Resend/Functions work), and the domain question is resolved (`storybridge.news` / `cms.storybridge.news`, attached to classic Hosting as of 2 Sep 2026) — App Hosting migration is now purely "once something needs a server," not blocked on anything external.

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

The `storybridge-eb71e` project is provisioned and in use:

| Piece | State |
| --- | --- |
| Web app | Registered. Config committed in `apps/cms/.env.production` — public identifiers, not secrets |
| Auth | Email/password **and** Google both enabled; TOTP-based 2FA is available (not yet enforced project-wide) — see `apps/cms/src/lib/mfa.ts` |
| Authorised domains | `localhost`, `storybridge-eb71e.web.app`, `cma-storybridge.web.app`, `storybridge.news`, `cms.storybridge.news` (+ the two `.firebaseapp.com` forms) |
| Firestore | Native mode, **`eur3`** (Europe multi-region) — permanent, chosen for Tunis/EU latency and keeping content in the EU. Two databases: `(default)` (production) and `test` (sample data, same rules) — see "Developing against sample data" above |
| Firestore rules | Real for every collection in use (`staff`, `media`, `articles`, `siteContent`, `submissions`, `subscribers`); deny-by-default everywhere else |
| Storage | Live, bucket `storybridge-eb71e.firebasestorage.app`, region `EU` — backs the CMS media library |
| Cloud Functions | Live, `functions/`, region `europe-west1` (Blaze) — the Resend mail pipeline and server-side reCAPTCHA verification. See `functions/src/index.ts` |
| Billing | **Blaze.** Cloud Functions and the MFA/Identity-Platform features above both need it |

`cma-storybridge.web.app` had to be added to the authorised-domain list —
without it Google sign-in fails on the live CMS with `auth/unauthorized-domain`,
because the list Firebase seeds a project with only covers the default site.
Same reason `storybridge.news` and `cms.storybridge.news` were added the
moment the custom domains went live (via the Identity Toolkit admin API,
not the console) — otherwise Google sign-in would fail on the real domain
the moment DNS/SSL finished propagating.

### Roles without Cloud Functions

Role enforcement predates the move to Blaze and was deliberately built without custom claims (which need the Admin SDK in a Cloud Function): a person's role lives in their `staff/{email}` document and `firestore.rules` reads it with a `get()`. That costs one extra document read per rule evaluation and bought genuine server-side enforcement back when this project was still on Spark. It hasn't been revisited since Blaze landed — `lib/staff.ts` and the rules' helper functions are still the source of truth.

## A note on the `fr`/`ar` copy in the repo

`packages/content/messages/fr.json` and `ar.json` (read by both apps; CMS-editable overrides layer on top per-page via the `siteContent` Firestore collection — see `packages/content/src/merge.ts`) exist so the trilingual layout (including RTL) could be verified end-to-end during scaffolding. They are **my draft translations**, not reviewed by Imen — StoryBridge's own translator. Treat every non-English string in this repo as placeholder until a native pass happens; this is exactly the kind of gap a company selling translation quality shouldn't ship silently.
