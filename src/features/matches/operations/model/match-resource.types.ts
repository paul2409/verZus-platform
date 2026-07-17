// VERZUS M7.3 MATCH OPERATIONS RESOURCE CONTRACTS

import type {
  MatchClockSnapshot,
  MatchOperationAction,
  MatchOperationParticipant,
  MatchOperationsViewModel,
  MatchOperationState,
  MatchOperationTone,
  MatchTimelineItem,
} from "./match-operations.types";

export const matchOperationResourceNames = [
  "summary",
  "participants",
  "timeline",
  "clock",
  "check-in",
  "lobby",
  "result",
  "evidence",
  "dispute",
  "support",
] as const;

export type MatchOperationResourceName = (typeof matchOperationResourceNames)[number];

export const matchOperationReadScenarios = [
  "normal",
  "stale",
  "malformed",
  "offline",
  "unauthorized",
  "forbidden",
  "not_found",
  "maintenance",
  "partial_failure",
] as const;

export type MatchOperationReadScenario = (typeof matchOperationReadScenarios)[number];

export type MatchResourceFreshness = "fresh" | "stale";

export type MatchResourceMeta = {
  requestId: string;
  serverNow: string;
  lastUpdatedAt: string;
  freshness: MatchResourceFreshness;
};

export type MatchResourceData<TValue> = {
  value: TValue;
  meta: MatchResourceMeta;
};

export type MatchResourceState =
  | "loading"
  | "success"
  | "empty"
  | "stale"
  | "error"
  | "offline"
  | "retrying"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "maintenance"
  | "partial_failure";

export type MatchResource<TData> = {
  state: MatchResourceState;
  data: TData | null;
  errorCode: string | null;
  requestId: string | null;
  canRetry: boolean;
};

export type MatchSummaryViewModel = Pick<
  MatchOperationsViewModel,
  | "id"
  | "state"
  | "stateLabel"
  | "stateTone"
  | "competitionName"
  | "roundLabel"
  | "gameLabel"
  | "formatLabel"
  | "scheduledAtLabel"
  | "matchVersion"
>;

export type MatchParticipantsViewModel = Pick<MatchOperationsViewModel, "home" | "away" | "score">;

export type MatchTimelineViewModel = Pick<MatchOperationsViewModel, "timeline" | "serverTimeLabel">;

export type MatchCommandPanelViewModel = {
  visible: boolean;
  stateTone: MatchOperationTone;
  title: string;
  description: string;
  timerLabel: string | null;
  timerCaption: string | null;
  primaryAction: MatchOperationAction | null;
  secondaryAction: MatchOperationAction | null;
};

export type MatchCheckInViewModel = MatchCommandPanelViewModel;

export type MatchLobbyViewModel = MatchCommandPanelViewModel & {
  lobbyCode: string;
  connectionStatus: "waiting" | "available" | "connected" | "in_progress";
  platform: string;
  serverRegion: string;
  joinInstructions: string;
  currentUserEntered: boolean;
  currentUserReady: boolean;
  opponentEntered: boolean;
  opponentReady: boolean;
  canEnter: boolean;
  canConfirmReady: boolean;
  canStartMatch: boolean;
  canReportIssue: boolean;
  issueCount: number;
  lastIssueId: string | null;
};

export type MatchResultViewModel = Omit<
  MatchCommandPanelViewModel,
  "timerLabel" | "timerCaption"
> & {
  score: { home: number; away: number } | null;
  resultNote: string | null;
  xpEarned: number | null;
  submissionId: string | null;
  submittedAt: string | null;
  confirmedAt: string | null;
  confirmationStatus: "not_submitted" | "awaiting_opponent" | "confirmed" | "conflict" | "disputed";
  canSubmit: boolean;
  canConfirm: boolean;
  canDispute: boolean;
  conflictCode: string | null;
};

export type MatchEvidenceViewModel = {
  visible: boolean;
  maxFiles: number;
  maxFileSizeBytes: number;
  acceptedMimeTypes: string[];
  uploadedCount: number;
  uploadEnabled: boolean;
  attachments: Array<{
    evidenceId: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    sha256: string;
    uploadedAt: string;
  }>;
};

export type MatchDisputeViewModel = {
  visible: boolean;
  title: string;
  resultNote: string | null;
  disputeId: string | null;
  statusLabel: string;
  secondaryAction: MatchOperationAction | null;
  reasonCode: string | null;
  summary: string | null;
  createdAt: string | null;
  auditEventCount: number;
  canCreate: boolean;
};

export type MatchSupportViewModel = {
  matchId: string;
  gameLabel: string;
  formatLabel: string;
  lobbyCode: string;
  chatAvailable: boolean;
  supportAvailable: boolean;
  note: string;
};

export type MatchOperationResourceValueMap = {
  summary: MatchSummaryViewModel;
  participants: MatchParticipantsViewModel;
  timeline: MatchTimelineViewModel;
  clock: MatchClockSnapshot;
  "check-in": MatchCheckInViewModel;
  lobby: MatchLobbyViewModel;
  result: MatchResultViewModel;
  evidence: MatchEvidenceViewModel;
  dispute: MatchDisputeViewModel;
  support: MatchSupportViewModel;
};

export type MatchResourceQueryTarget = {
  matchId: string;
  state: MatchOperationState;
  scenario: MatchOperationReadScenario;
};

export type MatchParticipantResourceValue = MatchOperationParticipant;
export type MatchTimelineResourceValue = MatchTimelineItem;
