// VERZUS M4 STEP 4.1

import type { AuthRole, AuthState } from "./auth-state";
import { authSessionResponseSchema, type AuthSessionResponse } from "./auth-session.schema";

export interface AuthSessionViewModel {
  state: AuthState;
  userId: string | null;
  role: AuthRole | null;
  emailVerified: boolean;
  onboardingComplete: boolean;
  expiresAt: string | null;
  refreshable: boolean;
  restrictionReason: string | null;
  requestId: string;
}

export function parseAuthSessionResponse(input: unknown): AuthSessionResponse {
  return authSessionResponseSchema.parse(input);
}

export function adaptAuthSession(response: AuthSessionResponse): AuthSessionViewModel {
  return {
    state: response.state,
    userId: response.user?.id ?? null,
    role: response.user?.role ?? null,
    emailVerified: response.user?.emailVerified ?? false,
    onboardingComplete: response.user?.onboardingComplete ?? false,
    expiresAt: response.session?.expiresAt ?? null,
    refreshable: response.session?.refreshable ?? false,
    restrictionReason: response.restrictionReason,
    requestId: response.requestId,
  };
}
