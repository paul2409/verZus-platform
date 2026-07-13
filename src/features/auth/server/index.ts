// VERZUS M4 STEP 4.6

export {
  bannedAccountPath,
  createLoginDestination,
  createSessionExpiredDestination,
  decideAuthRouteAccess,
  isOnboardingRoute,
  isProtectedRoute,
  isPublicAuthPath,
  isRestrictionRoute,
  onboardingRoutePrefix,
  protectedRoutePrefixes,
  publicAuthPaths,
  suspendedAccountPath,
  verifyEmailPath,
} from "./auth-route-policy";
export type { AuthRouteDecision } from "./auth-route-policy";

export {
  getServerAuthContext,
  getServerAuthState,
  requireAuthenticatedServerSession,
  requireServerAuthStates,
} from "./auth-session.server";
export type { ServerAuthContext } from "./auth-session.server";
