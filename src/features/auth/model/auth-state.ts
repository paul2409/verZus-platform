// VERZUS M4 STEP 4.1

export const authStates = [
  "anonymous",
  "authenticating",
  "authenticated",
  "email_unverified",
  "onboarding_incomplete",
  "suspended",
  "banned",
  "session_expired",
] as const;

export type AuthState = (typeof authStates)[number];

export const authRoles = [
  "player",
  "captain",
  "creator",
  "referee",
  "admin",
  "superadmin",
] as const;

export type AuthRole = (typeof authRoles)[number];

export const authStateDestinations: Record<AuthState, string> = {
  anonymous: "/login",
  authenticating: "/login",
  authenticated: "/play",
  email_unverified: "/verify-email",
  onboarding_incomplete: "/onboarding",
  suspended: "/account/suspended",
  banned: "/account/banned",
  session_expired: "/session-expired",
};

export function getAuthDestination(state: AuthState): string {
  return authStateDestinations[state];
}

export function isTerminalAuthRestriction(state: AuthState): state is "suspended" | "banned" {
  return state === "suspended" || state === "banned";
}

export function canAccessAuthenticatedRoutes(state: AuthState): boolean {
  return state === "authenticated";
}
