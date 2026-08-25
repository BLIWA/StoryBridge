/**
 * TOTP (authenticator-app) multi-factor auth — the "2FA requirement" from
 * the QA follow-up. This is enrollment plus the sign-in challenge, not an
 * enforced-for-everyone policy: making it mandatory project-wide is a
 * separate Identity Platform setting (Console → Authentication → Sign-in
 * method → Advanced → Multi-factor authentication → Enforcement), the
 * project owner's call, not this code's.
 *
 * All of it needs that same Console page's MFA support switched on first —
 * a console-only step, the same shape as the Blaze upgrade and the Storage
 * bucket region pick earlier in this project. Every function below turns
 * the SDK's error for "not turned on yet" into MfaNotEnabledError, so the
 * UI can say that plainly instead of surfacing a raw Firebase error code.
 */

import {
  multiFactor,
  TotpMultiFactorGenerator,
  getMultiFactorResolver,
  type TotpSecret,
  type User,
  type MultiFactorInfo,
  type MultiFactorResolver,
  type MultiFactorError,
  type AuthError,
} from "firebase/auth";
import { getFirebase } from "./firebase";

export class MfaNotEnabledError extends Error {}

const NOT_ENABLED_CODE = new Set(["auth/operation-not-allowed", "auth/admin-restricted-operation"]);

function rethrowFriendly(err: unknown): never {
  const code = (err as { code?: string })?.code ?? "";
  if (NOT_ENABLED_CODE.has(code)) {
    throw new MfaNotEnabledError(
      "Two-factor sign-in isn't turned on for this project yet. Ask an owner to enable it in Firebase Console → Authentication → Sign-in method → Advanced.",
    );
  }
  throw err;
}

export type EnrollmentStart = { secret: TotpSecret; qrCodeUrl: string; secretKey: string };

/** Step 1: get a fresh TOTP secret and a scannable otpauth:// URL for it. */
export async function startEnrollment(user: User): Promise<EnrollmentStart> {
  try {
    const session = await multiFactor(user).getSession();
    const secret = await TotpMultiFactorGenerator.generateSecret(session);
    const qrCodeUrl = secret.generateQrCodeUrl(user.email ?? "StoryBridge", "StoryBridge Studio");
    return { secret, qrCodeUrl, secretKey: secret.secretKey };
  } catch (err) {
    return rethrowFriendly(err);
  }
}

/** Step 2: the 6-digit code from the authenticator app confirms the secret actually took. */
export async function finishEnrollment(
  user: User,
  secret: TotpSecret,
  code: string,
  displayName: string,
): Promise<void> {
  const assertion = TotpMultiFactorGenerator.assertionForEnrollment(secret, code.trim());
  try {
    await multiFactor(user).enroll(assertion, displayName.trim() || "Authenticator app");
  } catch (err) {
    const errCode = (err as { code?: string })?.code ?? "";
    if (errCode === "auth/invalid-verification-code") {
      throw new Error("That code didn't match. Check the app and try again — codes refresh every 30 seconds.");
    }
    return rethrowFriendly(err);
  }
}

export function enrolledFactors(user: User): MultiFactorInfo[] {
  return multiFactor(user).enrolledFactors;
}

export async function unenrollFactor(user: User, factorUid: string): Promise<void> {
  await multiFactor(user).unenroll(factorUid);
}

// ---------------------------------------------------------------------------
// Sign-in challenge — thrown by signInWithEmailAndPassword/signInWithPopup
// when the account has an enrolled factor. See sign-in-form.tsx.

export function isMfaRequired(err: unknown): err is MultiFactorError {
  return (err as AuthError)?.code === "auth/multi-factor-auth-required";
}

export function resolverFor(err: MultiFactorError): MultiFactorResolver {
  return getMultiFactorResolver(getFirebase().auth, err);
}

/** The TOTP hint to challenge — the only factor type this project enrolls. */
export function totpHint(resolver: MultiFactorResolver) {
  return resolver.hints.find((h) => h.factorId === TotpMultiFactorGenerator.FACTOR_ID) ?? resolver.hints[0];
}

export async function resolveSignIn(resolver: MultiFactorResolver, hintUid: string, code: string): Promise<void> {
  const assertion = TotpMultiFactorGenerator.assertionForSignIn(hintUid, code.trim());
  await resolver.resolveSignIn(assertion);
}
