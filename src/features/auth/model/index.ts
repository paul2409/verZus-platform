// VERZUS M4 STEP 4.1

export {
  authRoles,
  authStateDestinations,
  authStates,
  canAccessAuthenticatedRoutes,
  getAuthDestination,
  isTerminalAuthRestriction,
} from "./auth-state";
export type { AuthRole, AuthState } from "./auth-state";

export { reduceAuthState } from "./auth-state-machine";
export type { AuthenticatedEntryState, AuthEvent } from "./auth-state-machine";

export { adaptAuthSession, parseAuthSessionResponse } from "./auth-session.adapter";
export type { AuthSessionViewModel } from "./auth-session.adapter";

export {
  authenticatedUserSchema,
  authRoleSchema,
  authSessionResponseSchema,
  authSessionSchema,
  authStateSchema,
} from "./auth-session.schema";
export type { AuthenticatedUser, AuthSession, AuthSessionResponse } from "./auth-session.schema";
