import "server-only";

import { createHash, randomUUID } from "node:crypto";

import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import type { QueryResultRow } from "pg";

import { queryDatabase } from "@/lib/db";

import type {
  PlatformRole,
  RuntimeSessionResponse,
  RuntimeSessionState,
} from "./runtime-session.types";

export const RUNTIME_SESSION_COOKIE = "verzus_session";

type RuntimeSessionRow = QueryResultRow & {
  session_id: string;
  expires_at: Date;
  device_id: string | null;
  user_id: string;
  email: string | null;
  phone: string | null;
  role: PlatformRole;
  status: "active" | "suspended" | "banned";
  restriction_reason: string | null;
  email_verified_at: Date | null;
  onboarding_completed_at: Date | null;
};

function requestId(): string {
  return `runtime-session-${randomUUID()}`;
}

function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

function emptySession(state: "anonymous" | "session_expired"): RuntimeSessionResponse {
  return {
    state,
    user: null,
    session: null,
    restrictionReason: null,
    requestId: requestId(),
  };
}

function stateFor(row: RuntimeSessionRow): RuntimeSessionState {
  if (row.status === "suspended") return "suspended";
  if (row.status === "banned") return "banned";
  if (!row.email_verified_at) return "email_unverified";
  if (!row.onboarding_completed_at) return "onboarding_incomplete";
  return "authenticated";
}

export function readRuntimeSessionToken(request: NextRequest): string | null {
  return request.cookies.get(RUNTIME_SESSION_COOKIE)?.value ?? null;
}

export async function readRuntimeSession(rawToken: string | null): Promise<RuntimeSessionResponse> {
  if (!rawToken) return emptySession("anonymous");

  const result = await queryDatabase<RuntimeSessionRow>(
    `SELECT
       sessions.id AS session_id,
       sessions.expires_at,
       sessions.device_id,
       users.id AS user_id,
       users.email,
       users.phone,
       users.role,
       users.status,
       users.restriction_reason,
       users.email_verified_at,
       users.onboarding_completed_at
     FROM auth_sessions AS sessions
     INNER JOIN users ON users.id = sessions.user_id
     WHERE sessions.token_hash = $1
       AND sessions.revoked_at IS NULL
     LIMIT 1`,
    [hashToken(rawToken)],
  );

  const row = result.rows[0];
  if (!row || row.expires_at.getTime() <= Date.now()) {
    return emptySession("session_expired");
  }

  return {
    state: stateFor(row),
    user: {
      id: row.user_id,
      email: row.email,
      phone: row.phone,
      role: row.role,
      emailVerified: row.email_verified_at !== null,
      onboardingComplete: row.onboarding_completed_at !== null,
    },
    session: {
      id: row.session_id,
      expiresAt: row.expires_at.toISOString(),
      refreshable: true,
      deviceId: row.device_id,
    },
    restrictionReason: row.restriction_reason,
    requestId: requestId(),
  };
}

export async function getServerRuntimeSession(): Promise<RuntimeSessionResponse> {
  const cookieStore = await cookies();
  return readRuntimeSession(cookieStore.get(RUNTIME_SESSION_COOKIE)?.value ?? null);
}
