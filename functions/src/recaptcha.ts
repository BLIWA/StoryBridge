/**
 * Server-side half of reCAPTCHA v3 on the public contact form. The client
 * (apps/website/src/components/contact-form.tsx) gets a token from Google's
 * script and hands it to submitContact(); this is the only place that can be
 * trusted to check it, since the secret key never reaches the browser.
 *
 * Deliberately fails open when RECAPTCHA_SECRET_KEY isn't set yet: the site
 * key/secret pair has to be registered at
 * https://www.google.com/recaptcha/admin for this project's domains first —
 * a console-only step, same shape as the Blaze upgrade and the Storage
 * bucket region pick earlier in this project. Until that happens the contact
 * form keeps working, just without the extra layer.
 */

const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

// v3 scores range 0 (bot) to 1 (human). 0.5 is Google's own suggested
// starting threshold — low enough not to reject real enquiries filled in
// quickly, high enough to catch obvious automation.
const SCORE_THRESHOLD = 0.5;

export async function verifyRecaptcha(
  secret: string,
  token: string | undefined,
  expectedAction: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!token) return { ok: false, reason: "missing-token" };

  const res = await fetch(VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }),
  });
  if (!res.ok) return { ok: false, reason: `siteverify-http-${res.status}` };

  const data = (await res.json()) as {
    success?: boolean;
    score?: number;
    action?: string;
    "error-codes"?: string[];
  };

  if (!data.success) return { ok: false, reason: (data["error-codes"] ?? ["unknown"]).join(",") };
  if (data.action !== expectedAction) return { ok: false, reason: "action-mismatch" };
  if (typeof data.score === "number" && data.score < SCORE_THRESHOLD) return { ok: false, reason: "low-score" };

  return { ok: true };
}
