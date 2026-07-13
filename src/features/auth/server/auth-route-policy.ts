// VERZUS M4 STEP 4.6

import type { AuthState } from "../model/auth-state";
import { getAuthStateDestination, readSafeNextPath } from "../routing/auth-destination";

export const publicAuthPaths = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/session-expired",
] as const;

export const protectedRoutePrefixes = [
  "/play",
  "/rankings",
  "/leaderboards",
  "/crew",
  "/crews",
  "/inbox",
  "/profile",
  "/opportunities",
  "/notifications",
  "/wallet",
  "/settings",
  "/matches",
  "/competitions",
] as const;

export const onboardingRoutePrefix = "/onboarding";
export const verifyEmailPath = "/verify-email";
export const suspendedAccountPath = "/account/suspended";
export const bannedAccountPath = "/account/banned";

export type AuthRouteDecision =
  { action: "allow"; reason: string } | { action: "redirect"; destination: string; reason: string };

function matchesPath(pathname: string, candidate: string): boolean {
  return pathname === candidate || pathname.startsWith(`${candidate}/`);
}

export function isPublicAuthPath(pathname: string): boolean {
  return publicAuthPaths.some((path) => matchesPath(pathname, path));
}

export function isProtectedRoute(pathname: string): boolean {
  return protectedRoutePrefixes.some((path) => matchesPath(pathname, path));
}

export function isOnboardingRoute(pathname: string): boolean {
  return matchesPath(pathname, onboardingRoutePrefix);
}

export function isRestrictionRoute(pathname: string): boolean {
  return matchesPath(pathname, suspendedAccountPath) || matchesPath(pathname, bannedAccountPath);
}

export function createLoginDestination(pathname: string, search = ""): string {
  return `/login?next=${encodeURIComponent(`${pathname}${search}`)}`;
}

export function createSessionExpiredDestination(pathname: string, search = ""): string {
  return `/session-expired?next=${encodeURIComponent(`${pathname}${search}`)}`;
}

export function decideAuthRouteAccess(
  pathname: string,
  state: AuthState,
  search = "",
): AuthRouteDecision {
  if (state === "banned") {
    return matchesPath(pathname, bannedAccountPath)
      ? { action: "allow", reason: "Banned account is on its enforcement route." }
      : {
          action: "redirect",
          destination: bannedAccountPath,
          reason: "Banned accounts cannot access other routes.",
        };
  }

  if (state === "suspended") {
    return matchesPath(pathname, suspendedAccountPath)
      ? { action: "allow", reason: "Suspended account is on its restriction route." }
      : {
          action: "redirect",
          destination: suspendedAccountPath,
          reason: "Suspended accounts must remain restricted.",
        };
  }

  if (state === "email_unverified") {
    if (matchesPath(pathname, verifyEmailPath)) {
      return { action: "allow", reason: "Player may complete verification." };
    }

    if (
      isPublicAuthPath(pathname) ||
      isProtectedRoute(pathname) ||
      isOnboardingRoute(pathname) ||
      isRestrictionRoute(pathname)
    ) {
      return {
        action: "redirect",
        destination: verifyEmailPath,
        reason: "Email verification is required.",
      };
    }

    return { action: "allow", reason: "The route is public." };
  }

  if (state === "onboarding_incomplete") {
    if (isOnboardingRoute(pathname)) {
      return { action: "allow", reason: "Player may continue onboarding." };
    }

    if (
      isPublicAuthPath(pathname) ||
      isProtectedRoute(pathname) ||
      matchesPath(pathname, verifyEmailPath) ||
      isRestrictionRoute(pathname)
    ) {
      return {
        action: "redirect",
        destination: onboardingRoutePrefix,
        reason: "Onboarding must be completed first.",
      };
    }

    return { action: "allow", reason: "The route is public." };
  }

  if (state === "authenticated") {
    if (
      isPublicAuthPath(pathname) ||
      matchesPath(pathname, verifyEmailPath) ||
      isOnboardingRoute(pathname) ||
      isRestrictionRoute(pathname)
    ) {
      return {
        action: "redirect",
        destination: getAuthStateDestination(state, readSafeNextPath(search)),
        reason: "Authenticated player should enter the platform.",
      };
    }

    return { action: "allow", reason: "Authenticated access is allowed." };
  }

  if (state === "session_expired") {
    if (matchesPath(pathname, "/session-expired")) {
      return { action: "allow", reason: "Expired session is on recovery route." };
    }

    if (isProtectedRoute(pathname) || isOnboardingRoute(pathname)) {
      return {
        action: "redirect",
        destination: createSessionExpiredDestination(pathname, search),
        reason: "The session has expired.",
      };
    }

    if (matchesPath(pathname, verifyEmailPath) || isRestrictionRoute(pathname)) {
      return { action: "redirect", destination: "/login", reason: "A valid session is required." };
    }

    return { action: "allow", reason: "Public recovery access is allowed." };
  }

  if (state === "anonymous" || state === "authenticating") {
    if (isProtectedRoute(pathname) || isOnboardingRoute(pathname)) {
      return {
        action: "redirect",
        destination: createLoginDestination(pathname, search),
        reason: "Authentication is required.",
      };
    }

    if (matchesPath(pathname, verifyEmailPath) || isRestrictionRoute(pathname)) {
      return {
        action: "redirect",
        destination: "/login",
        reason: "An authenticated identity is required.",
      };
    }

    return { action: "allow", reason: "Anonymous access is allowed." };
  }

  return { action: "redirect", destination: "/login", reason: "Unknown authentication state." };
}
