// VERZUS M4 STEP 4.1

import type { AuthState } from "./auth-state";

export type AuthEvent =
  | { type: "AUTHENTICATION_STARTED" }
  | { type: "AUTHENTICATION_FAILED" }
  | { type: "AUTHENTICATION_SUCCEEDED"; nextState: AuthenticatedEntryState }
  | { type: "EMAIL_VERIFIED" }
  | { type: "ONBOARDING_COMPLETED" }
  | { type: "SESSION_EXPIRED" }
  | { type: "ACCOUNT_SUSPENDED" }
  | { type: "ACCOUNT_BANNED" }
  | { type: "SIGNED_OUT" };

export type AuthenticatedEntryState =
  "authenticated" | "email_unverified" | "onboarding_incomplete" | "suspended" | "banned";

export function reduceAuthState(currentState: AuthState, event: AuthEvent): AuthState {
  switch (event.type) {
    case "AUTHENTICATION_STARTED":
      return "authenticating";

    case "AUTHENTICATION_FAILED":
    case "SIGNED_OUT":
      return "anonymous";

    case "AUTHENTICATION_SUCCEEDED":
      return event.nextState;

    case "EMAIL_VERIFIED":
      return currentState === "email_unverified" ? "onboarding_incomplete" : currentState;

    case "ONBOARDING_COMPLETED":
      return currentState === "onboarding_incomplete" ? "authenticated" : currentState;

    case "SESSION_EXPIRED":
      return "session_expired";

    case "ACCOUNT_SUSPENDED":
      return "suspended";

    case "ACCOUNT_BANNED":
      return "banned";
  }
}
