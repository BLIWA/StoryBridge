#!/usr/bin/env bash
#
# Seeds the first owner into Firestore's `staff` collection.
#
# firestore.rules only lets an existing owner create staff records, which is
# correct and also a chicken-and-egg: a fresh project has no owner, so nobody
# can make one from the CMS. This script writes that first record through the
# Firestore REST API using your gcloud credentials. Project IAM owners bypass
# security rules, which is exactly the privilege escalation the rules are meant
# to prevent from the client — so this runs from a terminal, never from the app.
#
# After the first owner exists, everyone else gets added from
# Studio → Settings → People. You should not need this again, except to recover
# from having removed every owner.
#
# Usage:
#   ./scripts/bootstrap-owner.sh assia@storybridge.tn "Assia Touati"
#   ./scripts/bootstrap-owner.sh assia@storybridge.tn "Assia Touati" my-project-id

set -euo pipefail

EMAIL_RAW="${1:-}"
NAME="${2:-}"
PROJECT="${3:-storybridge-eb71e}"

if [[ -z "$EMAIL_RAW" || -z "$NAME" ]]; then
  echo "usage: $0 <email> <full name> [project-id]" >&2
  exit 64
fi

# Document ids are lowercased emails — lib/staff.ts and firestore.rules both
# assume it, so normalise here too.
EMAIL="$(printf '%s' "$EMAIL_RAW" | tr '[:upper:]' '[:lower:]' | tr -d '[:space:]')"

TOKEN="$(gcloud auth print-access-token --project "$PROJECT")"
BASE="https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/staff"
NOW="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

BODY=$(NAME="$NAME" NOW="$NOW" python3 -c '
import json, os
print(json.dumps({"fields": {
    "name":         {"stringValue": os.environ["NAME"]},
    "role":         {"stringValue": "owner"},
    "active":       {"booleanValue": True},
    "invitedBy":    {"stringValue": "bootstrap"},
    "createdAt":    {"timestampValue": os.environ["NOW"]},
    "lastSignInAt": {"nullValue": None},
}}))')

STATUS=$(curl -sS -o /tmp/bootstrap-owner.json -w '%{http_code}' \
  -X POST "${BASE}?documentId=${EMAIL}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$BODY")

if [[ "$STATUS" == "200" ]]; then
  echo "✔  ${EMAIL} is now an owner of ${PROJECT}."
  echo "   They can sign in at the CMS with Google, or with email + password"
  echo "   after using “Forgot?” on the sign-in screen to set one."
elif [[ "$STATUS" == "409" ]]; then
  echo "•  ${EMAIL} already has a staff record — nothing changed." >&2
  echo "   Change their role from Studio → Settings → People." >&2
  exit 1
else
  echo "✘  Firestore refused the write (HTTP ${STATUS}):" >&2
  cat /tmp/bootstrap-owner.json >&2
  exit 1
fi
