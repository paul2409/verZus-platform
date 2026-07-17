// VERZUS M7.1 MATCH OPERATIONS FOUNDATION

export const matchOperationStates = [
  "scheduled",
  "check-in-unavailable",
  "check-in-open",
  "checked-in",
  "opponent-not-checked-in",
  "both-ready",
  "lobby-open",
  "in-progress",
  "submit-result",
  "awaiting-opponent-confirmation",
  "result-confirmed",
  "disputed",
  "forfeit",
  "cancelled",
  "completed",
] as const;

export type MatchOperationState = (typeof matchOperationStates)[number];

// VERZUS M7.2 SERVER CLOCK CONTRACT
export type MatchClockMode = "countdown" | "elapsed" | "none";

export type MatchDeadlineKind =
  "check_in_opens" | "check_in_closes" | "lobby_opens" | "match_starts" | "result_due" | null;

export type MatchClockSnapshot = {
  matchId: string;
  state: MatchOperationState;
  matchVersion: number;
  serverNow: string;
  issuedAt: string;
  scheduledAt: string;
  checkInOpensAt: string;
  checkInClosesAt: string;
  lobbyOpensAt: string;
  matchStartsAt: string;
  resultDueAt: string;
  activeDeadlineKind: MatchDeadlineKind;
  activeDeadlineAt: string | null;
  mode: MatchClockMode;
  timezone: "UTC";
};

export type MatchOperationTone = "neutral" | "info" | "success" | "warning" | "danger";
export type MatchOperationActionTone = "primary" | "secondary" | "danger";
export type MatchTimelineItemState = "complete" | "current" | "future" | "warning";

export type MatchOperationParticipant = {
  id: string;
  name: string;
  handle: string;
  rankLabel: string;
  emblem: "rebels" | "apex";
  sideLabel: string;
  checkedIn: boolean;
  ready: boolean;
};

export type MatchOperationAction = {
  label: string;
  tone: MatchOperationActionTone;
  disabled: boolean;
};

export type MatchTimelineItem = {
  id: string;
  label: string;
  timeLabel: string;
  state: MatchTimelineItemState;
};

export type MatchOperationsViewModel = {
  id: string;
  state: MatchOperationState;
  stateLabel: string;
  stateTone: MatchOperationTone;
  competitionName: string;
  roundLabel: string;
  gameLabel: string;
  formatLabel: string;
  scheduledAtLabel: string;
  serverTimeLabel: string;
  lobbyCode: string;
  matchVersion: number;
  clock: MatchClockSnapshot;
  home: MatchOperationParticipant;
  away: MatchOperationParticipant;
  title: string;
  description: string;
  timerLabel: string | null;
  timerCaption: string | null;
  primaryAction: MatchOperationAction | null;
  secondaryAction: MatchOperationAction | null;
  score: { home: number; away: number } | null;
  resultNote: string | null;
  xpEarned: number | null;
  disputeId: string | null;
  timeline: MatchTimelineItem[];
};
