// VERZUS M4 STEP 4.6

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthState } from "../model/auth-state";
import { getAuthStateDestination } from "../routing/auth-destination";
import { authStateFromMockSession, MOCK_SESSION_COOKIE } from "./mock-auth.service";

export interface ServerAuthContext {
  state: AuthState;
  authenticated: boolean;
  destination: string;
}

export async function getServerAuthState(): Promise<AuthState> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(MOCK_SESSION_COOKIE)?.value ?? null;
  return authStateFromMockSession(cookieValue);
}

export async function getServerAuthContext(): Promise<ServerAuthContext> {
  const state = await getServerAuthState();
  return {
    state,
    authenticated: state === "authenticated",
    destination: getAuthStateDestination(state),
  };
}

export async function requireAuthenticatedServerSession(): Promise<void> {
  const state = await getServerAuthState();
  if (state !== "authenticated") redirect(getAuthStateDestination(state));
}

export async function requireServerAuthStates(
  allowedStates: readonly AuthState[],
): Promise<AuthState> {
  const state = await getServerAuthState();
  if (!allowedStates.includes(state)) redirect(getAuthStateDestination(state));
  return state;
}
