// VERZUS M7.4 IDEMPOTENT CHECK-IN CONTRACTS

import type { MatchClockSnapshot, MatchOperationState } from "./match-operations.types";

export type MatchCheckInParticipantStatus = {
  participantId: string;
  checkedIn: boolean;
  ready: boolean;
};

export type MatchCheckInSnapshot = {
  matchId: string;
  seedState: MatchOperationState;
  state: MatchOperationState;
  matchVersion: number;
  currentUser: MatchCheckInParticipantStatus;
  opponent: MatchCheckInParticipantStatus;
  checkInEventCount: number;
  lastEventId: string | null;
  lastUpdatedAt: string;
  clock: MatchClockSnapshot;
};

export type MatchCheckInCommand = {
  matchId: string;
  seedState: MatchOperationState;
  expectedState: MatchOperationState;
  expectedVersion: number;
  idempotencyKey: string;
};

export type MatchCheckInOutcome = "checked_in" | "both_ready" | "already_checked_in";

export type MatchCheckInEvent = {
  eventId: string | null;
  createdAt: string;
  replayed: boolean;
};

export type MatchCheckInResult = {
  outcome: MatchCheckInOutcome;
  snapshot: MatchCheckInSnapshot;
  event: MatchCheckInEvent;
};
