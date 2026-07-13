// VERZUS M4 STEP 4.6

import type { AuthState } from "../model/auth-state";

const blockedPostAuthDestinations = [
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/session-expired",
  "/account/suspended",
  "/account/banned",
  "/onboarding",
] as const;

function matchesPath(pathname: string, candidate: string): boolean {
  return pathname === candidate || pathname.startsWith(`${candidate}/`);
}

export function sanitizeInternalNextPath(value: string | null | undefined): string | null {
  if (!value) return null;

  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001F\u007F]/u.test(value)
  ) {
    return null;
  }

  try {
    const parsed = new URL(value, "https://verzus.local");
    if (parsed.origin !== "https://verzus.local") return null;

    if (blockedPostAuthDestinations.some((path) => matchesPath(parsed.pathname, path))) {
      return null;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

export function readSafeNextPath(search: string): string | null {
  return sanitizeInternalNextPath(new URLSearchParams(search).get("next"));
}

export function getAuthStateDestination(
  state: AuthState,
  safeNextPath: string | null = null,
): string {
  switch (state) {
    case "authenticated":
      return safeNextPath ?? "/play";
    case "email_unverified":
      return "/verify-email";
    case "onboarding_incomplete":
      return "/onboarding";
    case "suspended":
      return "/account/suspended";
    case "banned":
      return "/account/banned";
    case "session_expired":
    case "anonymous":
    case "authenticating":
      return "/login";
  }
}
