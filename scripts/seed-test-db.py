#!/usr/bin/env python3
"""Writes sample data into the "test" Firestore database via the REST API.

Invoked by seed-test-db.sh, which supplies PROJECT/TOKEN/OWNER_EMAIL as
environment variables — see that file for usage. Uses only the standard
library (urllib), matching the no-extra-dependencies style of the rest of
scripts/.
"""

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone

PROJECT = os.environ["PROJECT"]
TOKEN = os.environ["TOKEN"]
OWNER_EMAIL = os.environ.get("OWNER_EMAIL", "").strip().lower()

BASE = f"https://firestore.googleapis.com/v1/projects/{PROJECT}/databases/test/documents"
NOW = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def value(v):
    if isinstance(v, bool):
        return {"booleanValue": v}
    if isinstance(v, str):
        if v == "SERVER_TIMESTAMP":
            return {"timestampValue": NOW}
        return {"stringValue": v}
    if isinstance(v, int):
        return {"integerValue": str(v)}
    if v is None:
        return {"nullValue": None}
    raise TypeError(f"unhandled type for Firestore payload: {type(v)}")


def put(collection: str, doc_id: str, fields: dict):
    """PATCH == create-or-overwrite by id, which is what makes this script idempotent."""
    # Document ids that are email addresses (subscribers, staff) need their
    # "@" percent-encoded — an unencoded one in the URL path 404s instead of
    # reaching the intended document.
    url = f"{BASE}/{collection}/{urllib.parse.quote(doc_id, safe='')}"
    body = json.dumps({"fields": {k: value(v) for k, v in fields.items()}}).encode()
    req = urllib.request.Request(url, data=body, method="PATCH")
    req.add_header("Authorization", f"Bearer {TOKEN}")
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req) as resp:
            resp.read()
        print(f"  ✔ {collection}/{doc_id}")
    except urllib.error.HTTPError as e:
        print(f"  ✘ {collection}/{doc_id}: HTTP {e.code} {e.read().decode()[:300]}", file=sys.stderr)
        sys.exit(1)


# ---- staff ------------------------------------------------------------
print("staff")
put("staff", "chief.test@example.com", {
    "name": "Chief Test Account", "role": "chief", "active": True,
    "invitedBy": "seed-script", "createdAt": "SERVER_TIMESTAMP", "lastSignInAt": None,
})
put("staff", "journalist.test@example.com", {
    "name": "Journalist Test Account", "role": "journalist", "active": True,
    "invitedBy": "seed-script", "createdAt": "SERVER_TIMESTAMP", "lastSignInAt": None,
})
put("staff", "contributor.test@example.com", {
    "name": "Contributor Test Account", "role": "contributor", "active": True,
    "invitedBy": "seed-script", "createdAt": "SERVER_TIMESTAMP", "lastSignInAt": None,
})
if OWNER_EMAIL:
    put("staff", OWNER_EMAIL, {
        "name": "You (seeded owner)", "role": "owner", "active": True,
        "invitedBy": "seed-script", "createdAt": "SERVER_TIMESTAMP", "lastSignInAt": "SERVER_TIMESTAMP",
    })
else:
    print("  (no OWNER_EMAIL passed — pass your own email as the 2nd argument to sign in and see this data)")

AUTHOR = OWNER_EMAIL or "chief.test@example.com"

# ---- articles -----------------------------------------------------------
print("articles")
put("articles", "seed-published-1", {
    "title": "Five things a Tunis newsroom gets right that a Paris one doesn't",
    "slug": "tunis-newsroom-lessons", "lang": "EN", "cat": "Editorial",
    "author": "Chief Test Account", "authorEmail": AUTHOR, "status": "Published",
    "date": "12 Aug 2026", "words": 1240,
    "excerpt": "A working newsroom teaches you things a style guide can't.",
    "body": "This is sample article body text for local testing against the test database.",
})
put("articles", "seed-draft-1", {
    "title": "Draft: translation pricing, revisited",
    "slug": "translation-pricing-revisited", "lang": "EN", "cat": "Business",
    "author": "Journalist Test Account", "authorEmail": "journalist.test@example.com", "status": "Draft",
    "date": "20 Aug 2026", "words": 340,
    "excerpt": "An unfinished piece, for testing the editor on a draft.",
    "body": "Draft body — still being written.",
})
put("articles", "seed-review-1", {
    "title": "In review: what makes a pull quote earn its place",
    "slug": "pull-quote-craft", "lang": "EN", "cat": "Craft",
    "author": "Contributor Test Account", "authorEmail": "contributor.test@example.com", "status": "In review",
    "date": "22 Aug 2026", "words": 610,
    "excerpt": "Sent up for a chief's read, for testing the review queue.",
    "body": "Body text pending review.",
})
put("articles", "seed-scheduled-1", {
    "title": "Scheduled: our September style-guide update",
    "slug": "september-style-guide", "lang": "EN", "cat": "Editorial",
    "author": "Chief Test Account", "authorEmail": AUTHOR, "status": "Scheduled",
    "date": "01 Sep 2026", "words": 480,
    "excerpt": "Queued ahead, for testing the Scheduled filter.",
    "body": "Body text for a scheduled piece.",
})

# ---- submissions ----------------------------------------------------------
print("submissions")
put("submissions", "seed-submission-new", {
    "name": "Sample Enquirer", "email": "enquirer@example.com", "org": "Example Org",
    "need": "translation", "langs": "EN to FR", "deadline": "mid-September",
    "body": "This is a sample contact-form enquiry for testing the Inbox.",
    "status": "New", "createdAt": "SERVER_TIMESTAMP",
})
put("submissions", "seed-submission-replied", {
    "name": "Already Handled", "email": "handled@example.com", "org": "",
    "need": "editing", "langs": "", "deadline": "",
    "body": "A sample enquiry already marked Replied, for testing the filter tabs.",
    "status": "Replied", "createdAt": "SERVER_TIMESTAMP",
})
put("submissions", "seed-submission-archived", {
    "name": "Old Enquiry", "email": "old@example.com", "org": "Past Co",
    "need": "unsure", "langs": "", "deadline": "",
    "body": "A sample enquiry already Archived.",
    "status": "Archived", "createdAt": "SERVER_TIMESTAMP",
})

# ---- subscribers ------------------------------------------------------
print("subscribers")
for i, (email, lang, source) in enumerate([
    ("subscriber-en@example.com", "EN", "Website"),
    ("subscriber-fr@example.com", "FR", "Website"),
    ("subscriber-ar@example.com", "AR", "Footer"),
    ("subscriber-second@example.com", "EN", "Newsletter page"),
]):
    put("subscribers", email, {
        "status": "Subscribed", "lang": lang, "source": source, "subscribedAt": "SERVER_TIMESTAMP",
    })

# ---- media --------------------------------------------------------------
print("media")
put("media", "seed-media-1", {
    "path": "media/seed-1.jpg", "url": "https://picsum.photos/seed/storybridge1/1200/675",
    "credit": "Sample credit, seed script", "alt": "Sample placeholder photo",
    "uploadedBy": AUTHOR,
})
put("media", "seed-media-2", {
    "path": "media/seed-2.jpg", "url": "https://picsum.photos/seed/storybridge2/1200/675",
    "credit": "Sample credit, seed script", "alt": "Second sample placeholder photo",
    "uploadedBy": AUTHOR,
})

print("\nDone. Point a local .env.local at NEXT_PUBLIC_FIRESTORE_DATABASE_ID=test to browse this.")
