# @storybridge/cms

"Studio" — the editorial CMS. Next.js 16 (App Router, Turbopack), Firebase Auth (email/password + Google).

Run from the repo root: `pnpm dev:cms` (port 3001). See the root [README](../../README.md) for the full picture.

- Copy `.env.example` to `.env.local` and fill in the web app config from the Firebase console once the `storybridge` project's web app is registered — the sign-in screen renders without it, but auth calls will fail until it's set.
- `src/lib/firebase.ts` initializes lazily (`getFirebase()`), on first call inside a client event handler only — every route here is `force-dynamic`, so a module-scope Firebase init would run during SSR and throw before real credentials exist. Keep new Firebase usage inside handlers/effects, not at module scope.
- This is Phase 04 scaffolding only: sign-in UI is wired to real `firebase/auth` calls, but there's no route protection, role/claims check, or dashboard yet — see the roadmap's Phase 04–06 for what's next.
- Never index this app — `robots: noindex` is already set in the root layout; keep it that way.
