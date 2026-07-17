// VERZUS M7.3 MATCH OPERATIONS MOCK API FIXTURES

import { getMatchOperationsMock } from "../mocks/match-operations.mock";
import type {
  MatchOperationReadScenario,
  MatchOperationResourceName,
} from "../model/match-resource.types";
import type { MatchOperationState } from "../model/match-operations.types";
import { getMatchLobbyOperationsSnapshot } from "./match-lobby.store";
import { getMatchResultOperationsSnapshot } from "./match-result.store";
import { getMatchTerminalSnapshot } from "./match-terminal.store";

const checkInStates = new Set<MatchOperationState>([
  "scheduled",
  "check-in-unavailable",
  "check-in-open",
  "checked-in",
  "opponent-not-checked-in",
  "both-ready",
]);
const resultStates = new Set<MatchOperationState>([
  "submit-result",
  "awaiting-opponent-confirmation",
  "result-confirmed",
  "forfeit",
  "cancelled",
  "completed",
]);
const evidenceStates = new Set<MatchOperationState>([
  "submit-result",
  "awaiting-opponent-confirmation",
  "disputed",
]);

function action(value: ReturnType<typeof getMatchOperationsMock>["primaryAction"]) {
  return value ? { label: value.label, tone: value.tone, disabled: value.disabled } : null;
}

function participant(value: ReturnType<typeof getMatchOperationsMock>["home"]) {
  return {
    participant_id: value.id,
    name: value.name,
    handle: value.handle,
    rank_label: value.rankLabel,
    emblem: value.emblem,
    side_label: value.sideLabel,
    checked_in: value.checkedIn,
    ready: value.ready,
  };
}

export function buildMatchResourceFixtures(
  matchId: string,
  requestedState: MatchOperationState,
  serverNow = new Date(),
) {
  const resultSnapshot = getMatchResultOperationsSnapshot(matchId, requestedState, serverNow);
  const terminalSnapshot = getMatchTerminalSnapshot(matchId, resultSnapshot.state, serverNow);
  const lobbySnapshot = getMatchLobbyOperationsSnapshot(matchId, terminalSnapshot.state, serverNow);
  const clock = terminalSnapshot.clock;
  const match = getMatchOperationsMock(matchId, terminalSnapshot.state, clock);
  match.matchVersion = terminalSnapshot.matchVersion;

  return {
    clock,
    summary: {
      match_id: match.id,
      state: match.state,
      state_label: match.stateLabel,
      state_tone: match.stateTone,
      competition_name: match.competitionName,
      round_label: match.roundLabel,
      game_label: match.gameLabel,
      format_label: match.formatLabel,
      scheduled_at_label: match.scheduledAtLabel,
      match_version: match.matchVersion,
    },
    participants: {
      home: {
        ...participant(match.home),
        checked_in: lobbySnapshot.currentUser.checkedIn,
        ready: lobbySnapshot.currentUser.ready,
      },
      away: {
        ...participant(match.away),
        checked_in: lobbySnapshot.opponent.checkedIn,
        ready: lobbySnapshot.opponent.ready,
      },
      score: resultSnapshot.submission?.score ?? match.score,
    },
    timeline: {
      items: match.timeline.map((item) => ({
        id: item.id,
        label: item.label,
        time_label: item.timeLabel,
        state: item.state,
      })),
      server_time_label: match.serverTimeLabel,
    },
    "check-in": {
      visible: checkInStates.has(match.state),
      state_tone: match.stateTone,
      title: match.title,
      description: match.description,
      timer_label: match.timerLabel,
      timer_caption: match.timerCaption,
      primary_action: action(match.primaryAction),
      secondary_action: action(match.secondaryAction),
    },
    lobby: {
      visible: ["both-ready", "lobby-open", "in-progress"].includes(match.state),
      state_tone: match.stateTone,
      title: match.title,
      description: match.description,
      lobby_code: lobbySnapshot.connection.lobbyCode,
      connection_status:
        match.state === "in-progress"
          ? "in_progress"
          : lobbySnapshot.currentUser.entered
            ? "connected"
            : Date.parse(clock.lobbyOpensAt) <= serverNow.getTime()
              ? "available"
              : "waiting",
      platform: lobbySnapshot.connection.platform,
      server_region: lobbySnapshot.connection.serverRegion,
      join_instructions: lobbySnapshot.connection.joinMethod,
      current_user_entered: lobbySnapshot.currentUser.entered,
      current_user_ready: lobbySnapshot.currentUser.ready,
      opponent_entered: lobbySnapshot.opponent.entered,
      opponent_ready: lobbySnapshot.opponent.ready,
      can_enter:
        match.state === "both-ready" &&
        serverNow.getTime() >= Date.parse(clock.lobbyOpensAt) &&
        serverNow.getTime() < Date.parse(clock.matchStartsAt),
      can_confirm_ready:
        match.state === "lobby-open" &&
        lobbySnapshot.currentUser.entered &&
        !lobbySnapshot.currentUser.ready,
      can_start_match:
        match.state === "lobby-open" &&
        lobbySnapshot.currentUser.ready &&
        lobbySnapshot.opponent.ready &&
        serverNow.getTime() >= Date.parse(clock.matchStartsAt),
      can_report_issue: match.state === "lobby-open" || match.state === "in-progress",
      issue_count: lobbySnapshot.issueCount,
      last_issue_id: lobbySnapshot.lastIssue?.issueId ?? null,
      timer_label: match.timerLabel,
      timer_caption: match.timerCaption,
      primary_action: action(match.primaryAction),
      secondary_action: action(match.secondaryAction),
    },
    result: {
      visible: resultStates.has(match.state) || match.state === "disputed",
      state_tone: match.stateTone,
      title: match.title,
      description: match.description,
      primary_action: action(match.primaryAction),
      secondary_action: action(match.secondaryAction),
      score: resultSnapshot.submission?.score ?? match.score,
      result_note: resultSnapshot.conflict
        ? "Opponent confirmation conflicts with the submitted score. Open a dispute to preserve an auditable review path."
        : match.resultNote,
      xp_earned: match.xpEarned,
      submission_id: resultSnapshot.submission?.submissionId ?? null,
      submitted_at: resultSnapshot.submission?.submittedAt ?? null,
      confirmed_at: resultSnapshot.confirmation?.confirmedAt ?? null,
      confirmation_status: resultSnapshot.dispute
        ? "disputed"
        : resultSnapshot.conflict
          ? "conflict"
          : resultSnapshot.confirmation
            ? "confirmed"
            : resultSnapshot.submission
              ? "awaiting_opponent"
              : "not_submitted",
      can_submit: match.state === "submit-result" && !resultSnapshot.submission,
      can_confirm:
        match.state === "awaiting-opponent-confirmation" && Boolean(resultSnapshot.submission),
      can_dispute:
        ["submit-result", "awaiting-opponent-confirmation", "result-confirmed"].includes(
          match.state,
        ) && !resultSnapshot.dispute,
      conflict_code: resultSnapshot.conflict ? "MATCH_RESULT_SCORE_CONFLICT" : null,
    },
    evidence: {
      visible: evidenceStates.has(match.state),
      max_files: 5,
      max_file_size_bytes: 25 * 1024 * 1024,
      accepted_mime_types: ["image/png", "image/jpeg", "video/mp4"],
      uploaded_count: resultSnapshot.evidenceAttachments.length,
      upload_enabled:
        ["submit-result", "awaiting-opponent-confirmation", "disputed"].includes(match.state) &&
        resultSnapshot.evidenceAttachments.length < 5,
      attachments: resultSnapshot.evidenceAttachments.map((attachment) => ({
        evidence_id: attachment.evidenceId,
        file_name: attachment.fileName,
        mime_type: attachment.mimeType,
        size_bytes: attachment.sizeBytes,
        sha256: attachment.sha256,
        uploaded_at: attachment.uploadedAt,
      })),
    },
    dispute: {
      visible:
        match.state === "disputed" ||
        ["submit-result", "awaiting-opponent-confirmation", "result-confirmed"].includes(
          match.state,
        ),
      title: resultSnapshot.dispute ? "Dispute in progress" : "Open a dispute",
      result_note: resultSnapshot.dispute?.summary ?? match.resultNote,
      dispute_id: resultSnapshot.dispute?.disputeId ?? null,
      status_label: resultSnapshot.dispute ? "Under review" : "Not opened",
      secondary_action: action(match.secondaryAction),
      reason_code: resultSnapshot.dispute?.reason ?? null,
      summary: resultSnapshot.dispute?.summary ?? null,
      created_at: resultSnapshot.dispute?.createdAt ?? null,
      audit_event_count: resultSnapshot.disputeEventCount,
      can_create:
        ["submit-result", "awaiting-opponent-confirmation", "result-confirmed"].includes(
          match.state,
        ) && !resultSnapshot.dispute,
    },
    support: {
      match_id: match.id,
      game_label: match.gameLabel,
      format_label: match.formatLabel,
      lobby_code: match.lobbyCode,
      chat_available: true,
      support_available: true,
      note: "Navigation and support remain available when an unrelated match panel fails.",
    },
  } as const;
}

export type MatchResourceFixtures = ReturnType<typeof buildMatchResourceFixtures>;

export function getMatchResourceFixture(
  fixtures: MatchResourceFixtures,
  resource: Exclude<MatchOperationResourceName, "clock">,
) {
  return fixtures[resource];
}

export function parseMatchOperationReadScenario(value: string | null): MatchOperationReadScenario {
  switch (value) {
    case "stale":
    case "malformed":
    case "offline":
    case "unauthorized":
    case "forbidden":
    case "not_found":
    case "maintenance":
    case "partial_failure":
      return value;
    default:
      return "normal";
  }
}
