// VERZUS M5 STEPS 5.9-5.13

import { playCheckInCommandRawSchema } from "../api/check-in-api.schema";
import type { PlayScenario } from "../model";
import { getMockPlaySnapshot } from "./mock-play.data";
import type { StoredMockCheckIn } from "./mock-check-in.cookie";

interface MockCheckInInput {
  scenario: PlayScenario;
  payload: unknown;
  idempotencyHeader: string | null;
  existingRecord: StoredMockCheckIn | null;
  now?: string | undefined;
}

export interface MockCheckInDecision {
  status: number;
  body: unknown;
  recordToPersist: StoredMockCheckIn | null;
}

function requestId(): string {
  return `mock-play-check-in-${globalThis.crypto.randomUUID()}`;
}

function failure(
  status: number,
  code: string,
  message: string,
  retryable: boolean,
): MockCheckInDecision {
  return {
    status,
    recordToPersist: null,
    body: {
      ok: false,
      error: {
        code,
        message,
        request_id: requestId(),
        retryable,
        field_errors: {},
      },
    },
  };
}

function success(record: StoredMockCheckIn, duplicate: boolean): MockCheckInDecision {
  return {
    status: 200,
    recordToPersist: record,
    body: {
      ok: true,
      data: {
        match_id: record.matchId,
        state: "checked_in",
        checked_in_at: record.checkedInAt,
        idempotency_key: record.idempotencyKey,
        duplicate,
      },
      request_id: requestId(),
    },
  };
}

export function decideMockPlayCheckIn({
  scenario,
  payload,
  idempotencyHeader,
  existingRecord,
  now = new Date().toISOString(),
}: MockCheckInInput): MockCheckInDecision {
  const command = playCheckInCommandRawSchema.safeParse(payload);

  if (!command.success) {
    return failure(400, "invalid_check_in_command", "The check-in request is invalid.", false);
  }

  if (!idempotencyHeader) {
    return failure(
      400,
      "idempotency_key_required",
      "Check-in requires an Idempotency-Key header.",
      false,
    );
  }

  if (idempotencyHeader !== command.data.idempotency_key) {
    return failure(
      400,
      "idempotency_key_mismatch",
      "The check-in header and request key do not match.",
      false,
    );
  }

  if (existingRecord?.matchId === command.data.match_id) {
    return success(existingRecord, true);
  }

  if (existingRecord && existingRecord.matchId !== command.data.match_id) {
    return failure(
      409,
      "active_check_in_conflict",
      "A different match is already checked in for this mock session.",
      false,
    );
  }

  const snapshot = getMockPlaySnapshot(scenario);
  const current = snapshot.currentCheckIn;

  if (current.match_id !== command.data.match_id) {
    return failure(
      404,
      "check_in_not_found",
      "The requested match has no current check-in window.",
      false,
    );
  }

  if (current.mutation_key !== command.data.mutation_key) {
    return failure(
      409,
      "stale_check_in_state",
      "The check-in state changed. Refresh before retrying.",
      true,
    );
  }

  if (current.state !== "open" || !current.can_check_in) {
    return failure(
      409,
      "check_in_not_open",
      "Check-in is not currently open for this match.",
      false,
    );
  }

  const record: StoredMockCheckIn = {
    matchId: command.data.match_id,
    checkedInAt: now,
    idempotencyKey: command.data.idempotency_key,
  };

  return success(record, false);
}
