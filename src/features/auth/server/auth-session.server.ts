import "server-only";

import { cache } from "react";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { AuthSessionResponse } from "../model/auth-session.schema";
import type { AuthState } from "../model/auth-state";
import { getAuthStateDestination } from "../routing/auth-destination";
import { AUTH_SESSION_COOKIE } from "./auth.constants";
import { readAccountSession } from "./auth.service";

export interface ServerAuthContext {
  state: AuthState;
  authenticated: boolean;
  destination: string;
  session: AuthSessionResponse;
}

const resolveServerSession = cache(async (rawToken: string | null) => readAccountSession(rawToken));

export async function getServerAuthSession(): Promise<AuthSessionResponse> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(AUTH_SESSION_COOKIE)?.value ?? null;
  return resolveServerSession(rawToken);
}

export async function getServerAuthState(): Promise<AuthState> {
  return (await getServerAuthSession()).state;
}

export async function getServerAuthContext(): Promise<ServerAuthContext> {
  const session = await getServerAuthSession();
  return {
    state: session.state,
    authenticated: session.state === "authenticated",
    destination: getAuthStateDestination(session.state),
    session,
  };
}

export async function requireAuthenticatedServerSession(): Promise<AuthSessionResponse> {
  const session = await getServerAuthSession();

  if (session.state !== "authenticated") {
    redirect(getAuthStateDestination(session.state));
  }

  return session;
}

export async function requireServerAuthStates(
  allowedStates: readonly AuthState[],
): Promise<AuthSessionResponse> {
  const session = await getServerAuthSession();

  if (!allowedStates.includes(session.state)) {
    redirect(getAuthStateDestination(session.state));
  }

  return session;
}
