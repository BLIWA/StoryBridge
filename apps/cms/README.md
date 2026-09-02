# @storybridge/cms

"Studio" — the editorial CMS. Next.js 16 (App Router, Turbopack), Firebase Auth
(email/password + Google), Firestore-backed staff and roles.

Run from the repo root: `pnpm dev:cms` (port 3001). See the root
[README](../../README.md) for the full picture.

## Firebase config

The `storybridge-eb71e` web app is registered and its config is committed in
`.env.production`. **There is nothing to fill in** — a fresh clone builds and
deploys with working auth. `NEXT_PUBLIC_FIREBASE_*` values are public project
identifiers, not credentials; the security boundary is Firebase Auth plus
`firestore.rules`, never the secrecy of an API key.

`.env.local` (git-ignored) overrides them per-machine — copy `.env.example` if
you need to point Studio at a different Firebase project.

`src/lib/firebase.ts` initializes lazily (`getFirebase()`). Every route here is
a client component, so a module-scope Firebase init would run during the static
render. Keep new Firebase usage inside handlers/effects, not at module scope.

## Who can get in

Access is two separate questions:

1. **Is this a real Firebase user?** Anyone can become one — the sign-in screen
   is on the public internet and the project allows self-registration.
2. **Are they on the StoryBridge team?** This is the actual gate: a person has
   access if and only if `staff/{their lowercased email}` exists in Firestore
   with `active: true`.

Someone who passes (1) but not (2) lands on the "you're signed in, but not on
the team" screen and can read nothing — `firestore.rules` makes the same check
on every read and write, so the UI is a courtesy and the rules are the control.

That staff document also carries the person's role — `owner`, `chief`,
`journalist` or `contributor`. `src/lib/staff.ts` holds the role→capability
table; `firestore.rules` encodes the same table and wins any disagreement.

## Adding people

Studio → **Settings → People → Invite someone**. Owners only. It:

1. writes the `staff/{email}` record — this document *is* the access grant; and
2. provisions their Firebase Auth account and emails them a set-your-password
   link.

Step 2 is convenience. If it fails, or they already have an account, the invite
is still valid — they can sign in with Google on the same address, or use
"Forgot?" on the sign-in screen.

The account is created through a throwaway secondary Firebase app.
`createUserWithEmailAndPassword` signs the new user in on whatever Auth instance
it is handed, which on the default instance would kick the owner out of their
own session mid-invite. See the comment on `inviteStaff()`.

Owners can also change roles and remove people from the same table. Two things
are deliberately impossible, in the rules and not just the UI: **removing or
demoting yourself**, and **emptying the last owner seat** — both lock the
project out with no way back in.

### The first owner

`firestore.rules` only lets an existing owner create staff records, which is
correct and also a chicken-and-egg on a fresh project. Seed the first one from
a terminal:

```bash
./scripts/bootstrap-owner.sh assia@storybridge.news "Assia Touati"
```

It writes through the Firestore REST API with your gcloud credentials — project
IAM owners bypass security rules, which is exactly the escalation the rules
prevent from the client, so this runs from a terminal and never from the app.
After that, everyone else is added from Settings → People.

## Still scaffolding

People and roles are real and persisted. Articles, pages, issues and the inbox
are still the design board's sample data in `src/content/seed.ts`, held in React
state — edits vanish on reload, and every control that has no backend says so.
Their Firestore collections stay denied in `firestore.rules` until roadmap
Phase 05–06.

Never index this app — `robots: noindex` is set in the root layout; keep it.
