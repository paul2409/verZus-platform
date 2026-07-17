// VERZUS M7.5 LOBBY MUTATION RESPONSE ADAPTER

import { matchLobbyResultSchema } from "../model/match-lobby-operations.schema";
import type { MatchLobbyResult } from "../model/match-lobby-operations.types";
import { MatchOperationsApiClientError } from "./match-operations-api.adapter";
import { matchLobbyResponseRawSchema } from "./match-lobby-api.schema";

export function adaptMatchLobbyMutation(payload: unknown): MatchLobbyResult {
  const parsed = matchLobbyResponseRawSchema.safeParse(payload);
  if (!parsed.success) {
    throw new MatchOperationsApiClientError({
      code: "invalid_response",
      message: "The match lobby endpoint returned invalid data.",
      requestId: "match-lobby-invalid-response",
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
  return matchLobbyResultSchema.parse({
    outcome: value.outcome,
    snapshot: {
      matchId: value.match_id,
      seedState: value.seed_state,
      state: value.state,
      matchVersion: value.match_version,
      currentUser: {
        participantId: value.current_user.participant_id,
        checkedIn: value.current_user.checked_in,
        entered: value.current_user.entered,
        ready: value.current_user.ready,
      },
      opponent: {
        participantId: value.opponent.participant_id,
        checkedIn: value.opponent.checked_in,
        entered: value.opponent.entered,
        ready: value.opponent.ready,
      },
      connection: {
        lobbyCode: value.connection.lobby_code,
        platform: value.connection.platform,
        serverRegion: value.connection.server_region,
        joinMethod: value.connection.join_method,
      },
      actionEventCount: value.action_event_count,
      issueCount: value.issue_count,
      lastIssue: value.last_issue
        ? {
            issueId: value.last_issue.issue_id,
            category: value.last_issue.category,
            summary: value.last_issue.summary,
            status: value.last_issue.status,
            createdAt: value.last_issue.created_at,
          }
        : null,
      lastEventId: value.last_event_id,
      lastUpdatedAt: value.last_updated_at,
      clock: value.clock,
    },
    event: {
      eventId: value.event.event_id,
      action: value.event.action,
      createdAt: value.event.created_at,
      replayed: value.event.replayed,
    },
  });
}
