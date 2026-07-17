// VERZUS M7.3 MATCH OPERATIONS DOMAIN ADAPTERS

import {
  matchCheckInSchema,
  matchClockSnapshotSchema,
  matchDisputeSchema,
  matchEvidenceSchema,
  matchLobbySchema,
  matchParticipantsSchema,
  matchResourceDataSchema,
  matchResultSchema,
  matchSummarySchema,
  matchSupportSchema,
  matchTimelineSchema,
} from "../model/match-resource.schema";
import type {
  MatchCheckInViewModel,
  MatchDisputeViewModel,
  MatchEvidenceViewModel,
  MatchLobbyViewModel,
  MatchParticipantsViewModel,
  MatchResourceData,
  MatchResultViewModel,
  MatchSummaryViewModel,
  MatchSupportViewModel,
  MatchTimelineViewModel,
} from "../model/match-resource.types";
import type { MatchClockSnapshot } from "../model/match-operations.types";
import {
  clockResponseSchema,
  type MatchOperationsApiErrorRaw,
  matchOperationsResponseSchemas,
} from "./match-operations-api.schema";

export class MatchOperationsApiClientError extends Error {
  readonly code: string;
  readonly requestId: string;
  readonly retryable: boolean;
  readonly fieldErrors: Record<string, string[]> | undefined;

  constructor(input: {
    code: string;
    message: string;
    requestId: string;
    retryable: boolean;
    fieldErrors?: Record<string, string[]>;
  }) {
    super(input.message);
    this.name = "MatchOperationsApiClientError";
    this.code = input.code;
    this.requestId = input.requestId;
    this.retryable = input.retryable;
    this.fieldErrors = input.fieldErrors;
  }
}

function failure(error: MatchOperationsApiErrorRaw) {
  return new MatchOperationsApiClientError({
    code: error.code,
    message: error.message,
    requestId: error.request_id,
    retryable: error.retryable,
  });
}

function invalid(resource: string) {
  return new MatchOperationsApiClientError({
    code: "invalid_response",
    message: `The match ${resource} resource returned invalid data.`,
    requestId: `match-operations-invalid-${resource}`,
    retryable: true,
  });
}

function adaptMeta(
  requestId: string,
  input: { server_now: string; last_updated_at: string; freshness: "fresh" | "stale" },
) {
  return {
    requestId,
    serverNow: input.server_now,
    lastUpdatedAt: input.last_updated_at,
    freshness: input.freshness,
  } as const;
}

function action<
  T extends { label: string; tone: "primary" | "secondary" | "danger"; disabled: boolean },
>(value: T | null) {
  return value ? { label: value.label, tone: value.tone, disabled: value.disabled } : null;
}

function participant(input: {
  participant_id: string;
  name: string;
  handle: string;
  rank_label: string;
  emblem: "rebels" | "apex";
  side_label: string;
  checked_in: boolean;
  ready: boolean;
}) {
  return {
    id: input.participant_id,
    name: input.name,
    handle: input.handle,
    rankLabel: input.rank_label,
    emblem: input.emblem,
    sideLabel: input.side_label,
    checkedIn: input.checked_in,
    ready: input.ready,
  };
}

export function adaptMatchSummary(payload: unknown): MatchResourceData<MatchSummaryViewModel> {
  const parsed = matchOperationsResponseSchemas.summary.safeParse(payload);
  if (!parsed.success) throw invalid("summary");
  if (!parsed.data.ok) throw failure(parsed.data.error);
  const raw = parsed.data.data;
  return matchResourceDataSchema(matchSummarySchema).parse({
    value: {
      id: raw.match_id,
      state: raw.state,
      stateLabel: raw.state_label,
      stateTone: raw.state_tone,
      competitionName: raw.competition_name,
      roundLabel: raw.round_label,
      gameLabel: raw.game_label,
      formatLabel: raw.format_label,
      scheduledAtLabel: raw.scheduled_at_label,
      matchVersion: raw.match_version,
    },
    meta: adaptMeta(parsed.data.request_id, parsed.data.meta),
  });
}

export function adaptMatchParticipants(
  payload: unknown,
): MatchResourceData<MatchParticipantsViewModel> {
  const parsed = matchOperationsResponseSchemas.participants.safeParse(payload);
  if (!parsed.success) throw invalid("participants");
  if (!parsed.data.ok) throw failure(parsed.data.error);
  return matchResourceDataSchema(matchParticipantsSchema).parse({
    value: {
      home: participant(parsed.data.data.home),
      away: participant(parsed.data.data.away),
      score: parsed.data.data.score,
    },
    meta: adaptMeta(parsed.data.request_id, parsed.data.meta),
  });
}

export function adaptMatchTimeline(payload: unknown): MatchResourceData<MatchTimelineViewModel> {
  const parsed = matchOperationsResponseSchemas.timeline.safeParse(payload);
  if (!parsed.success) throw invalid("timeline");
  if (!parsed.data.ok) throw failure(parsed.data.error);
  return matchResourceDataSchema(matchTimelineSchema).parse({
    value: {
      timeline: parsed.data.data.items.map((item) => ({
        id: item.id,
        label: item.label,
        timeLabel: item.time_label,
        state: item.state,
      })),
      serverTimeLabel: parsed.data.data.server_time_label,
    },
    meta: adaptMeta(parsed.data.request_id, parsed.data.meta),
  });
}

export function adaptMatchClock(payload: unknown): MatchResourceData<MatchClockSnapshot> {
  const parsed = clockResponseSchema.safeParse(payload);
  if (!parsed.success) throw invalid("clock");
  return matchResourceDataSchema(matchClockSnapshotSchema).parse({
    value: parsed.data.data,
    meta: {
      requestId: parsed.data.meta.requestId,
      serverNow: parsed.data.data.serverNow,
      lastUpdatedAt: parsed.data.data.issuedAt,
      freshness: "fresh",
    },
  });
}

export function adaptMatchCheckIn(payload: unknown): MatchResourceData<MatchCheckInViewModel> {
  const parsed = matchOperationsResponseSchemas["check-in"].safeParse(payload);
  if (!parsed.success) throw invalid("check-in");
  if (!parsed.data.ok) throw failure(parsed.data.error);
  const raw = parsed.data.data;
  return matchResourceDataSchema(matchCheckInSchema).parse({
    value: {
      visible: raw.visible,
      stateTone: raw.state_tone,
      title: raw.title,
      description: raw.description,
      timerLabel: raw.timer_label,
      timerCaption: raw.timer_caption,
      primaryAction: action(raw.primary_action),
      secondaryAction: action(raw.secondary_action),
    },
    meta: adaptMeta(parsed.data.request_id, parsed.data.meta),
  });
}

export function adaptMatchLobby(payload: unknown): MatchResourceData<MatchLobbyViewModel> {
  const parsed = matchOperationsResponseSchemas.lobby.safeParse(payload);
  if (!parsed.success) throw invalid("lobby");
  if (!parsed.data.ok) throw failure(parsed.data.error);
  const raw = parsed.data.data;
  return matchResourceDataSchema(matchLobbySchema).parse({
    value: {
      visible: raw.visible,
      stateTone: raw.state_tone,
      title: raw.title,
      description: raw.description,
      lobbyCode: raw.lobby_code,
      connectionStatus: raw.connection_status,
      platform: raw.platform,
      serverRegion: raw.server_region,
      joinInstructions: raw.join_instructions,
      currentUserEntered: raw.current_user_entered,
      currentUserReady: raw.current_user_ready,
      opponentEntered: raw.opponent_entered,
      opponentReady: raw.opponent_ready,
      canEnter: raw.can_enter,
      canConfirmReady: raw.can_confirm_ready,
      canStartMatch: raw.can_start_match,
      canReportIssue: raw.can_report_issue,
      issueCount: raw.issue_count,
      lastIssueId: raw.last_issue_id,
      timerLabel: raw.timer_label,
      timerCaption: raw.timer_caption,
      primaryAction: action(raw.primary_action),
      secondaryAction: action(raw.secondary_action),
    },
    meta: adaptMeta(parsed.data.request_id, parsed.data.meta),
  });
}

export function adaptMatchResult(payload: unknown): MatchResourceData<MatchResultViewModel> {
  const parsed = matchOperationsResponseSchemas.result.safeParse(payload);
  if (!parsed.success) throw invalid("result");
  if (!parsed.data.ok) throw failure(parsed.data.error);
  const raw = parsed.data.data;
  return matchResourceDataSchema(matchResultSchema).parse({
    value: {
      visible: raw.visible,
      stateTone: raw.state_tone,
      title: raw.title,
      description: raw.description,
      primaryAction: action(raw.primary_action),
      secondaryAction: action(raw.secondary_action),
      score: raw.score,
      resultNote: raw.result_note,
      xpEarned: raw.xp_earned,
      submissionId: raw.submission_id ?? null,
      submittedAt: raw.submitted_at ?? null,
      confirmedAt: raw.confirmed_at ?? null,
      confirmationStatus: raw.confirmation_status ?? "not_submitted",
      canSubmit: raw.can_submit ?? false,
      canConfirm: raw.can_confirm ?? false,
      canDispute: raw.can_dispute ?? false,
      conflictCode: raw.conflict_code ?? null,
    },
    meta: adaptMeta(parsed.data.request_id, parsed.data.meta),
  });
}

export function adaptMatchEvidence(payload: unknown): MatchResourceData<MatchEvidenceViewModel> {
  const parsed = matchOperationsResponseSchemas.evidence.safeParse(payload);
  if (!parsed.success) throw invalid("evidence");
  if (!parsed.data.ok) throw failure(parsed.data.error);
  const raw = parsed.data.data;
  return matchResourceDataSchema(matchEvidenceSchema).parse({
    value: {
      visible: raw.visible,
      maxFiles: raw.max_files,
      maxFileSizeBytes: raw.max_file_size_bytes ?? 25 * 1024 * 1024,
      acceptedMimeTypes: raw.accepted_mime_types,
      uploadedCount: raw.uploaded_count,
      uploadEnabled: raw.upload_enabled,
      attachments: (raw.attachments ?? []).map((attachment) => ({
        evidenceId: attachment.evidence_id,
        fileName: attachment.file_name,
        mimeType: attachment.mime_type,
        sizeBytes: attachment.size_bytes,
        sha256: attachment.sha256,
        uploadedAt: attachment.uploaded_at,
      })),
    },
    meta: adaptMeta(parsed.data.request_id, parsed.data.meta),
  });
}

export function adaptMatchDispute(payload: unknown): MatchResourceData<MatchDisputeViewModel> {
  const parsed = matchOperationsResponseSchemas.dispute.safeParse(payload);
  if (!parsed.success) throw invalid("dispute");
  if (!parsed.data.ok) throw failure(parsed.data.error);
  const raw = parsed.data.data;
  return matchResourceDataSchema(matchDisputeSchema).parse({
    value: {
      visible: raw.visible,
      title: raw.title,
      resultNote: raw.result_note,
      disputeId: raw.dispute_id,
      statusLabel: raw.status_label,
      secondaryAction: action(raw.secondary_action),
      reasonCode: raw.reason_code ?? null,
      summary: raw.summary ?? null,
      createdAt: raw.created_at ?? null,
      auditEventCount: raw.audit_event_count ?? 0,
      canCreate: raw.can_create ?? false,
    },
    meta: adaptMeta(parsed.data.request_id, parsed.data.meta),
  });
}

export function adaptMatchSupport(payload: unknown): MatchResourceData<MatchSupportViewModel> {
  const parsed = matchOperationsResponseSchemas.support.safeParse(payload);
  if (!parsed.success) throw invalid("support");
  if (!parsed.data.ok) throw failure(parsed.data.error);
  const raw = parsed.data.data;
  return matchResourceDataSchema(matchSupportSchema).parse({
    value: {
      matchId: raw.match_id,
      gameLabel: raw.game_label,
      formatLabel: raw.format_label,
      lobbyCode: raw.lobby_code,
      chatAvailable: raw.chat_available,
      supportAvailable: raw.support_available,
      note: raw.note,
    },
    meta: adaptMeta(parsed.data.request_id, parsed.data.meta),
  });
}
