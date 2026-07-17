// VERZUS M7.7 TERMINAL OPERATIONS API CLIENT

import { MatchOperationsApiClientError } from "./match-operations-api.adapter";
import { adaptMatchTerminalMutation, adaptMatchTerminalRead } from "./match-terminal-api.adapter";
import type {
  MatchTerminalAction,
  MatchTerminalMutationResult,
  MatchTerminalRole,
  MatchTerminalSnapshot,
} from "../model/match-terminal-operations.types";
import type { MatchOperationState } from "../model/match-operations.types";

async function payload(response: Response): Promise<unknown> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new MatchOperationsApiClientError({
      code: "MATCH_TERMINAL_INVALID_RESPONSE",
      message: "The terminal operation returned unreadable data.",
      requestId: response.headers.get("x-request-id") ?? "terminal-invalid-response",
      retryable: true,
    });
  }
  if (!response.ok) {
    const error = body as {
      error?: { code?: string; message?: string; request_id?: string; retryable?: boolean };
    };
    throw new MatchOperationsApiClientError({
      code: error.error?.code ?? "MATCH_TERMINAL_REQUEST_FAILED",
      message: error.error?.message ?? "The terminal operation failed.",
      requestId:
        error.error?.request_id ?? response.headers.get("x-request-id") ?? "terminal-failed",
      retryable: error.error?.retryable ?? false,
    });
  }
  return body;
}

export async function getMatchTerminalSnapshot(input: {
  matchId: string;
  seedState: MatchOperationState;
  role: MatchTerminalRole;
  signal?: AbortSignal;
}): Promise<MatchTerminalSnapshot> {
  const params = new URLSearchParams({ state: input.seedState });
  const response = await fetch(
    `/api/matches/${encodeURIComponent(input.matchId)}/terminal?${params.toString()}`,
    {
      cache: "no-store",
      credentials: "same-origin",
      headers: { accept: "application/json", "x-verzus-role": input.role },
      ...(input.signal ? { signal: input.signal } : {}),
    },
  );
  return adaptMatchTerminalRead(await payload(response));
}

export async function mutateMatchTerminal(input: {
  matchId: string;
  seedState: MatchOperationState;
  expectedState: MatchOperationState;
  expectedVersion: number;
  idempotencyKey: string;
  action: MatchTerminalAction;
  role: MatchTerminalRole;
  reason: string;
}): Promise<MatchTerminalMutationResult> {
  const params = new URLSearchParams({ state: input.seedState });
  const response = await fetch(
    `/api/matches/${encodeURIComponent(input.matchId)}/terminal?${params.toString()}`,
    {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "idempotency-key": input.idempotencyKey,
        "x-verzus-role": input.role,
      },
      body: JSON.stringify({
        expected_state: input.expectedState,
        expected_version: input.expectedVersion,
        action: input.action,
        reason: input.reason,
      }),
    },
  );
  return adaptMatchTerminalMutation(await payload(response));
}
