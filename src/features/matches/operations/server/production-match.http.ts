import "server-only";

import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { AuthRole } from "@/features/auth/model/auth-state";
import { getServerAuthSession } from "@/features/auth/server/auth-session.server";
import { matchCheckInRequestRawSchema } from "@/features/matches/operations/api/match-check-in-api.schema";
import { matchLobbyRequestRawSchema } from "@/features/matches/operations/api/match-lobby-api.schema";
import {
  matchDisputeRequestRawSchema,
  matchResultRequestRawSchema,
} from "@/features/matches/operations/api/match-result-api.schema";
import { matchTerminalRequestRawSchema } from "@/features/matches/operations/api/match-terminal-api.schema";
import {
  executeCheckIn,
  executeDispute,
  executeLobbyAction,
  executeResultAction,
  executeTerminal,
  getNextMatchForUser,
  playCheckInPayload,
  playNextMatchPayload,
  ProductionMatchError,
  readMatchClock,
  readMatchResource,
  readTerminalSnapshot,
  type MatchResourceName,
} from "./production-match.service";

export const noStoreHeaders = (requestId: string) => ({
  "Cache-Control": "no-store, max-age=0",
  "X-Request-ID": requestId,
});

async function authUser(): Promise<{ userId: string; role: AuthRole }> {
  const session = await getServerAuthSession();
  if (session.state !== "authenticated" || !session.user) {
    throw new ProductionMatchError({
      status: 401,
      code: "unauthorized",
      message: "Authentication is required.",
    });
  }
  return { userId: session.user.id, role: session.user.role };
}

function failure(requestId: string, error: unknown): NextResponse {
  const known =
    error instanceof ProductionMatchError
      ? error
      : new ProductionMatchError({
          status: 500,
          code: "match_internal_error",
          message: "The match operation could not be completed.",
          retryable: true,
        });
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: known.code,
        message: known.message,
        request_id: requestId,
        retryable: known.retryable,
        ...(known.fieldErrors ? { field_errors: known.fieldErrors } : {}),
      },
    },
    { status: known.status, headers: noStoreHeaders(requestId) },
  );
}

async function body(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ProductionMatchError({
      status: 400,
      code: "invalid_json",
      message: "The request body is not valid JSON.",
    });
  }
}

function idempotencyKey(request: NextRequest): string {
  const value = request.headers.get("idempotency-key")?.trim();
  if (!value || value.length < 16 || value.length > 128) {
    throw new ProductionMatchError({
      status: 400,
      code: "invalid_idempotency_key",
      message: "A 16 to 128 character Idempotency-Key header is required.",
    });
  }
  return value;
}

export async function handleMatchRead(
  request: NextRequest,
  context: { params: Promise<{ matchId: string }> },
  resource: MatchResourceName,
): Promise<NextResponse> {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  try {
    const [{ matchId }, actor] = await Promise.all([context.params, authUser()]);
    const result = await readMatchResource({ matchId, ...actor, resource });
    return NextResponse.json(
      {
        ok: true,
        data: result.data,
        request_id: requestId,
        meta: {
          server_now: result.serverNow,
          last_updated_at: result.lastUpdatedAt,
          freshness: "fresh",
        },
      },
      { status: 200, headers: noStoreHeaders(requestId) },
    );
  } catch (error) {
    return failure(requestId, error);
  }
}

export async function handleMatchClockRead(
  request: NextRequest,
  context: { params: Promise<{ matchId: string }> },
): Promise<NextResponse> {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  try {
    const [{ matchId }, actor] = await Promise.all([context.params, authUser()]);
    const clock = await readMatchClock({ matchId, ...actor });
    return NextResponse.json(
      { data: clock, meta: { requestId, source: "match-api" } },
      { status: 200, headers: noStoreHeaders(requestId) },
    );
  } catch (error) {
    return failure(requestId, error);
  }
}

export async function handleCheckInMutation(
  request: NextRequest,
  context: { params: Promise<{ matchId: string }> },
): Promise<NextResponse> {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  try {
    const [{ matchId }, actor, raw] = await Promise.all([context.params, authUser(), body(request)]);
    const parsed = matchCheckInRequestRawSchema.safeParse(raw);
    if (!parsed.success) {
      throw new ProductionMatchError({
        status: 400,
        code: "validation_error",
        message: "The check-in command is invalid.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      });
    }
    const result = await executeCheckIn({
      matchId,
      ...actor,
      expectedState: parsed.data.expected_state,
      expectedVersion: parsed.data.expected_version,
      idempotencyKey: idempotencyKey(request),
      requestId,
    });
    return NextResponse.json(result.body, {
      status: result.status,
      headers: noStoreHeaders(requestId),
    });
  } catch (error) {
    return failure(requestId, error);
  }
}

export async function handleLobbyMutation(
  request: NextRequest,
  context: { params: Promise<{ matchId: string }> },
): Promise<NextResponse> {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  try {
    const [{ matchId }, actor, raw] = await Promise.all([context.params, authUser(), body(request)]);
    const parsed = matchLobbyRequestRawSchema.safeParse(raw);
    if (!parsed.success) {
      throw new ProductionMatchError({
        status: 400,
        code: "match_lobby_validation_failed",
        message: "The lobby command is invalid.",
        fieldErrors: { request: parsed.error.issues.map((issue: { message: string }) => issue.message) },
      });
    }
    const result = await executeLobbyAction({
      matchId,
      ...actor,
      action: parsed.data.action,
      ...(parsed.data.issue ? { issue: parsed.data.issue } : {}),
      expectedState: parsed.data.expected_state,
      expectedVersion: parsed.data.expected_version,
      idempotencyKey: idempotencyKey(request),
      requestId,
    });
    return NextResponse.json(result.body, {
      status: result.status,
      headers: noStoreHeaders(requestId),
    });
  } catch (error) {
    return failure(requestId, error);
  }
}

export async function handleResultMutation(
  request: NextRequest,
  context: { params: Promise<{ matchId: string }> },
): Promise<NextResponse> {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  try {
    const [{ matchId }, actor, raw] = await Promise.all([context.params, authUser(), body(request)]);
    const parsed = matchResultRequestRawSchema.safeParse(raw);
    if (!parsed.success) {
      throw new ProductionMatchError({
        status: 400,
        code: "match_result_validation_failed",
        message: "The result command is invalid.",
        fieldErrors: { request: parsed.error.issues.map((issue: { message: string }) => issue.message) },
      });
    }
    const result = await executeResultAction({
      matchId,
      ...actor,
      action: parsed.data.action,
      score: parsed.data.score,
      ...(parsed.data.note ? { note: parsed.data.note } : {}),
      expectedState: parsed.data.expected_state,
      expectedVersion: parsed.data.expected_version,
      idempotencyKey: idempotencyKey(request),
      requestId,
    });
    return NextResponse.json(result.body, {
      status: result.status,
      headers: noStoreHeaders(requestId),
    });
  } catch (error) {
    return failure(requestId, error);
  }
}

export async function handleDisputeMutation(
  request: NextRequest,
  context: { params: Promise<{ matchId: string }> },
): Promise<NextResponse> {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  try {
    const [{ matchId }, actor, raw] = await Promise.all([context.params, authUser(), body(request)]);
    const parsed = matchDisputeRequestRawSchema.safeParse(raw);
    if (!parsed.success) {
      throw new ProductionMatchError({
        status: 400,
        code: "match_dispute_validation_failed",
        message: "The dispute request is invalid.",
        fieldErrors: { request: parsed.error.issues.map((issue: { message: string }) => issue.message) },
      });
    }
    const result = await executeDispute({
      matchId,
      ...actor,
      reason: parsed.data.reason,
      summary: parsed.data.summary,
      claimedScore: parsed.data.claimed_score,
      expectedState: parsed.data.expected_state,
      expectedVersion: parsed.data.expected_version,
      idempotencyKey: idempotencyKey(request),
      requestId,
    });
    return NextResponse.json(result.body, {
      status: result.status,
      headers: noStoreHeaders(requestId),
    });
  } catch (error) {
    return failure(requestId, error);
  }
}

export async function handleEvidenceMutation(request: NextRequest): Promise<NextResponse> {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "evidence_storage_unavailable",
        message: "Evidence upload is disabled until restricted object storage and malware scanning are configured.",
        request_id: requestId,
        retryable: false,
        field_errors: {},
      },
    },
    { status: 503, headers: noStoreHeaders(requestId) },
  );
}

export async function handleTerminalRead(
  request: NextRequest,
  context: { params: Promise<{ matchId: string }> },
): Promise<NextResponse> {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  try {
    const [{ matchId }, actor] = await Promise.all([context.params, authUser()]);
    const snapshot = await readTerminalSnapshot({ matchId, ...actor });
    return NextResponse.json(
      { ok: true, data: snapshot, request_id: requestId },
      { status: 200, headers: noStoreHeaders(requestId) },
    );
  } catch (error) {
    return failure(requestId, error);
  }
}

export async function handleTerminalMutation(
  request: NextRequest,
  context: { params: Promise<{ matchId: string }> },
): Promise<NextResponse> {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  try {
    const [{ matchId }, actor, raw] = await Promise.all([context.params, authUser(), body(request)]);
    const parsed = matchTerminalRequestRawSchema.safeParse(raw);
    if (!parsed.success) {
      throw new ProductionMatchError({
        status: 400,
        code: "match_terminal_validation_failed",
        message: "The terminal command is invalid.",
        fieldErrors: { request: parsed.error.issues.map((issue: { message: string }) => issue.message) },
      });
    }
    const result = await executeTerminal({
      matchId,
      ...actor,
      action: parsed.data.action,
      reason: parsed.data.reason,
      expectedState: parsed.data.expected_state,
      expectedVersion: parsed.data.expected_version,
      idempotencyKey: idempotencyKey(request),
      requestId,
    });
    return NextResponse.json(result.body, {
      status: result.status,
      headers: noStoreHeaders(requestId),
    });
  } catch (error) {
    return failure(requestId, error);
  }
}

export async function handlePlayNextMatch(request: NextRequest): Promise<NextResponse> {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  try {
    const actor = await authUser();
    const context = await getNextMatchForUser(actor.userId, actor.role);
    return NextResponse.json(
      { ok: true, data: context ? playNextMatchPayload(context) : null, request_id: requestId },
      { status: 200, headers: noStoreHeaders(requestId) },
    );
  } catch (error) {
    return failure(requestId, error);
  }
}

export async function handlePlayCurrentCheckIn(request: NextRequest): Promise<NextResponse> {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  try {
    const actor = await authUser();
    const context = await getNextMatchForUser(actor.userId, actor.role);
    const empty = {
      match_id: null,
      state: "unavailable",
      opens_at: null,
      closes_at: null,
      checked_in_at: null,
      server_now: new Date().toISOString(),
      can_check_in: false,
      mutation_key: null,
    };
    return NextResponse.json(
      { ok: true, data: context ? playCheckInPayload(context) : empty, request_id: requestId },
      { status: 200, headers: noStoreHeaders(requestId) },
    );
  } catch (error) {
    return failure(requestId, error);
  }
}
