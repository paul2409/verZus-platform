// VERZUS M7.4 CHECK-IN RESPONSE ADAPTER

import { matchCheckInResultSchema } from "../model/match-check-in.schema";
import type { MatchCheckInResult } from "../model/match-check-in.types";
import { MatchOperationsApiClientError } from "./match-operations-api.adapter";
import { matchCheckInResponseRawSchema } from "./match-check-in-api.schema";

export function adaptMatchCheckInMutation(payload: unknown): MatchCheckInResult {
  const parsed = matchCheckInResponseRawSchema.safeParse(payload);
  if (!parsed.success) {
    throw new MatchOperationsApiClientError({
      code: "invalid_response",
      message: "The match check-in endpoint returned invalid data.",
      requestId: "match-check-in-invalid-response",
      retryable: true,
    });
  }

  if (!parsed.data.ok) {
    throw new MatchOperationsApiClientError({
      code: parsed.data.error.code,
      message: parsed.data.error.message,
      requestId: parsed.data.error.request_id,
      retryable: parsed.data.error.retryable,
    });
  }

  const value = parsed.data.data;
  return matchCheckInResultSchema.parse({
    outcome: value.outcome,
    snapshot: {
      matchId: value.match_id,
      seedState: value.seed_state,
      state: value.state,
      matchVersion: value.match_version,
      currentUser: {
        participantId: value.current_user.participant_id,
        checkedIn: value.current_user.checked_in,
        ready: value.current_user.ready,
      },
      opponent: {
        participantId: value.opponent.participant_id,
        checkedIn: value.opponent.checked_in,
        ready: value.opponent.ready,
      },
      checkInEventCount: value.check_in_event_count,
      lastEventId: value.last_event_id,
      lastUpdatedAt: value.last_updated_at,
      clock: value.clock,
    },
    event: {
      eventId: value.event.event_id,
      createdAt: value.event.created_at,
      replayed: value.event.replayed,
    },
  });
}
