// VERZUS M4 STEP 4.7 BOUNDARY REPAIR

export const sharedSessionStateValues = [
  "anonymous",
  "authenticating",
  "authenticated",
  "email_unverified",
  "onboarding_incomplete",
  "suspended",
  "banned",
  "session_expired",
] as const;

export type SharedSessionState = (typeof sharedSessionStateValues)[number];

export const MOCK_SESSION_COOKIE = "verzus_mock_session";

export const mockSessionValues: Record<
  Exclude<SharedSessionState, "anonymous" | "authenticating" | "session_expired">,
  string
> = {
  authenticated: "mock-authenticated",
  email_unverified: "mock-email-unverified",
  onboarding_incomplete: "mock-onboarding-incomplete",
  suspended: "mock-suspended",
  banned: "mock-banned",
};

export function authStateFromMockSession(cookieValue: string | null): SharedSessionState {
  if (cookieValue === mockSessionValues.authenticated) {
    return "authenticated";
  }

  if (cookieValue === mockSessionValues.email_unverified) {
    return "email_unverified";
  }

  if (cookieValue === mockSessionValues.onboarding_incomplete) {
    return "onboarding_incomplete";
  }

  if (cookieValue === mockSessionValues.suspended) {
    return "suspended";
  }

  if (cookieValue === mockSessionValues.banned) {
    return "banned";
  }

  return "anonymous";
}

export function isMockSessionEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_MOCKS === "true";
}
