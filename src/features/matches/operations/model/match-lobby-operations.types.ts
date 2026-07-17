// VERZUS M7.5 LOBBY AND IN-PROGRESS CONTRACTS

import type { MatchClockSnapshot, MatchOperationState } from "./match-operations.types";

export const matchLobbyActions = [
  "enter_lobby",
  "confirm_ready",
  "start_match",
  "report_issue",
] as const;

export type MatchLobbyAction = (typeof matchLobbyActions)[number];

export const matchLobbyIssueCategories = ["connection", "opponent", "rules", "other"] as const;

export type MatchLobbyIssueCategory = (typeof matchLobbyIssueCategories)[number];

export type MatchLobbyParticipantStatus = {
  participantId: string;
  checkedIn: boolean;
  entered: boolean;
  ready: boolean;
};

export type MatchLobbyConnection = {
  lobbyCode: string;
  platform: string;
  serverRegion: string;
  joinMethod: string;
};

export type MatchLobbyIssue = {
  issueId: string;
  category: MatchLobbyIssueCategory;
  summary: string;
  status: "open";
  createdAt: string;
};

export type MatchLobbyOperationsSnapshot = {
  matchId: string;
  seedState: MatchOperationState;
  state: MatchOperationState;
  matchVersion: number;
  currentUser: MatchLobbyParticipantStatus;
  opponent: MatchLobbyParticipantStatus;
  connection: MatchLobbyConnection;
  actionEventCount: number;
  issueCount: number;
  lastIssue: MatchLobbyIssue | null;
  lastEventId: string | null;
  lastUpdatedAt: string;
  clock: MatchClockSnapshot;
};

export type MatchLobbyCommand = {
  matchId: string;
  seedState: MatchOperationState;
  expectedState: MatchOperationState;
  expectedVersion: number;
  idempotencyKey: string;
  action: MatchLobbyAction;
  issue?: {
    category: MatchLobbyIssueCategory;
    summary: string;
  };
};

export type MatchLobbyOutcome =
  "lobby_entered" | "ready_confirmed" | "match_started" | "issue_reported" | "already_applied";

export type MatchLobbyEvent = {
  eventId: string | null;
  action: MatchLobbyAction;
  createdAt: string;
  replayed: boolean;
};

export type MatchLobbyResult = {
  outcome: MatchLobbyOutcome;
  snapshot: MatchLobbyOperationsSnapshot;
  event: MatchLobbyEvent;
};
