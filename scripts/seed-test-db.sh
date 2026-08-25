#!/usr/bin/env bash
#
# Populates the "test" Firestore database (same project, same rules, no
# real data — see firebase.json and apps/*/src/lib/firebase.ts) with
# representative sample content: a few staff roles, articles in every
# status, contact submissions, subscribers, and media. Point a local
# .env.local at it with NEXT_PUBLIC_FIRESTORE_DATABASE_ID=test to browse or
# develop against this instead of production data.
#
# The sample roster is entirely fake @example.com addresses (nobody can
# actually sign in as them — that's fine, they're there for the People
# table, co-author picker, etc. to have more than one name to show). Pass
# your own email as the second argument to also seed *you* an owner record
# in this database, so you can sign in with your real account and actually
# see the sample data:
#
#   ./scripts/seed-test-db.sh storybridge-eb71e you@example.com
#
# Safe to re-run — every document id is fixed, so this overwrites its own
# sample data rather than duplicating it. Never touches the "(default)"
# database.

set -euo pipefail

PROJECT="${1:-storybridge-eb71e}"
OWNER_EMAIL="${2:-}"
TOKEN="$(gcloud auth print-access-token --project "$PROJECT")"

PROJECT="$PROJECT" TOKEN="$TOKEN" OWNER_EMAIL="$OWNER_EMAIL" python3 "$(dirname "$0")/seed-test-db.py"
