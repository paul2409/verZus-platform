// VERZUS M7.2 MATCH CLOCK SERVER SERVICE

import { createMatchClockSnapshot } from "../model/match-clock.policy";
import type { MatchClockSnapshot, MatchOperationState } from "../model/match-operations.types";

export const MATCH_REFERENCE_PREVIEW_ID = "m7-preview";

export type MatchClockEnvelope = {
  data: MatchClockSnapshot;
  meta: {
    requestId: string;
    source: "mock-match-clock";
  };
};

export function resolveMockMatchOperationState(
  matchId: string,
  requestedState: MatchOperationState,
): MatchOperationState {
  return matchId === MATCH_REFERENCE_PREVIEW_ID ? requestedState : "scheduled";
}

export function getMockMatchClockSnapshot(
  matchId: string,
  requestedState: MatchOperationState,
  serverNow: Date = new Date(),
): MatchClockSnapshot {
  const authoritativeState = resolveMockMatchOperationState(matchId, requestedState);
  return createMatchClockSnapshot(matchId, authoritativeState, serverNow, 12);
}

export function createMatchClockEnvelope(
  clock: MatchClockSnapshot,
  requestId: string,
): MatchClockEnvelope {
  return {
    data: clock,
    meta: {
      requestId,
      source: "mock-match-clock",
    },
  };
}
