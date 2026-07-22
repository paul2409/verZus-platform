import "server-only";

import { createHash, randomUUID } from "node:crypto";

import type { PoolClient, QueryResultRow } from "pg";

import type { PlatformRole } from "@/lib/session/runtime-session.types";
import type {
  MatchClockSnapshot,
  MatchOperationState,
  MatchOperationsViewModel,
} from "@/features/matches/operations/model/match-operations.types";
import { queryDatabase, withDatabaseTransaction } from "@/lib/db";

export type MatchResourceName =
  | "summary"
  | "participants"
  | "timeline"
  | "check-in"
  | "lobby"
  | "result"
  | "evidence"
  | "dispute"
  | "support";

export class ProductionMatchError extends Error {
  readonly status: number;
  readonly code: string;
  readonly retryable: boolean;
  readonly fieldErrors: Record<string, string[]> | undefined;

  constructor(input: {
    status: number;
    code: string;
    message: string;
    retryable?: boolean;
    fieldErrors?: Record<string, string[]>;
  }) {
    super(input.message);
    this.name = "ProductionMatchError";
    this.status = input.status;
    this.code = input.code;
    this.retryable = input.retryable ?? false;
    this.fieldErrors = input.fieldErrors;
  }
}

type MatchRow = QueryResultRow & {
  id: string;
  competition_id: string | null;
  competition_name: string | null;
  game_id: string;
  game_name: string;
  game_filter: string;
  state: MatchOperationState;
  round_label: string;
  format_label: string;
  scheduled_at: Date;
  check_in_opens_at: Date;
  check_in_closes_at: Date;
  lobby_opens_at: Date;
  match_starts_at: Date;
  result_due_at: Date;
  lobby_code: string;
  platform: string;
  server_region: string;
  join_method: string;
  version: number;
  terminal_reason: string | null;
  terminal_at: Date | null;
  terminal_actor_role: "current_user" | "support" | "admin" | "system" | null;
  created_at: Date;
  updated_at: Date;
};

type ParticipantRow = QueryResultRow & {
  id: string;
  match_id: string;
  user_id: string;
  side: "home" | "away";
  rank_label: string;
  checked_in_at: Date | null;
  lobby_entered_at: Date | null;
  ready_at: Date | null;
  display_name: string;
  handle: string;
  avatar_url: string | null;
  country_code: string | null;
};

type ResultRow = QueryResultRow & {
  id: string;
  match_id: string;
  submitted_by: string;
  home_score: number;
  away_score: number;
  note: string | null;
  status: "pending" | "confirmed" | "conflict" | "disputed" | "void";
  confirmed_by: string | null;
  confirmation_home_score: number | null;
  confirmation_away_score: number | null;
  submitted_at: Date;
  confirmed_at: Date | null;
  updated_at: Date;
};

type DisputeRow = QueryResultRow & {
  id: string;
  match_id: string;
  created_by: string;
  reason: string;
  summary: string;
  claimed_home_score: number | null;
  claimed_away_score: number | null;
  status: "open" | "resolved" | "rejected";
  audit_event_id: string;
  created_at: Date;
};

type EvidenceRow = QueryResultRow & {
  id: string;
  file_name: string;
  mime_type: "image/png" | "image/jpeg" | "video/mp4";
  size_bytes: number;
  sha256: string;
  uploaded_at: Date;
};

type IssueRow = QueryResultRow & {
  id: string;
  category: "connection" | "opponent" | "rules" | "other";
  summary: string;
  status: "open" | "resolved" | "dismissed";
  created_at: Date;
};

type EventRow = QueryResultRow & {
  id: string;
  event_type: string;
  payload: Record<string, unknown>;
  match_version: number;
  created_at: Date;
};

export type MatchContext = {
  match: MatchRow;
  participants: ParticipantRow[];
  currentParticipant: ParticipantRow | null;
  opponentParticipant: ParticipantRow | null;
  result: ResultRow | null;
  dispute: DisputeRow | null;
  evidence: EvidenceRow[];
  issues: IssueRow[];
  events: EventRow[];
};

type Queryable = Pick<PoolClient, "query">;

const elevatedRoles: readonly PlatformRole[] = ["referee", "admin", "superadmin"];
const terminalStates = new Set<MatchOperationState>(["forfeit", "cancelled", "completed"]);

function iso(value: Date): string {
  return value.toISOString();
}

function nowIso(): string {
  return new Date().toISOString();
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function labels(state: MatchOperationState): {
  label: string;
  tone: "neutral" | "info" | "success" | "warning" | "danger";
  title: string;
  description: string;
} {
  const values: Record<MatchOperationState, ReturnType<typeof labels>> = {
    scheduled: {
      label: "Scheduled",
      tone: "neutral",
      title: "Match scheduled",
      description: "Your match is confirmed. Return when server-controlled check-in opens.",
    },
    "check-in-unavailable": {
      label: "Check-in unavailable",
      tone: "neutral",
      title: "Check-in unavailable",
      description: "Check-in is not open yet. Deadlines are controlled by server time.",
    },
    "check-in-open": {
      label: "Check-in open",
      tone: "success",
      title: "Check-in is open",
      description: "Confirm your presence before the server deadline.",
    },
    "checked-in": {
      label: "Checked in",
      tone: "success",
      title: "You are checked in",
      description: "Your presence is saved. Waiting for the opponent.",
    },
    "opponent-not-checked-in": {
      label: "Opponent pending",
      tone: "warning",
      title: "Opponent not checked in",
      description: "Your check-in is safe. Match policy applies after the deadline.",
    },
    "both-ready": {
      label: "Both ready",
      tone: "success",
      title: "Both players are ready",
      description: "The lobby becomes available when the server opens it.",
    },
    "lobby-open": {
      label: "Lobby open",
      tone: "info",
      title: "Lobby is open",
      description: "Enter with the server-issued code and confirm readiness.",
    },
    "in-progress": {
      label: "In progress",
      tone: "danger",
      title: "Match in progress",
      description: "Play the match and report blocking issues without leaving this route.",
    },
    "submit-result": {
      label: "Submit result",
      tone: "info",
      title: "Submit final result",
      description: "The latest match version is checked before the score is accepted.",
    },
    "awaiting-opponent-confirmation": {
      label: "Awaiting confirmation",
      tone: "success",
      title: "Result submitted",
      description: "Waiting for the opponent to confirm or dispute the score.",
    },
    "result-confirmed": {
      label: "Result confirmed",
      tone: "success",
      title: "Result confirmed",
      description: "The verified result now contributes to production rankings.",
    },
    disputed: {
      label: "Disputed",
      tone: "warning",
      title: "Dispute in progress",
      description: "The result is locked for an auditable review.",
    },
    forfeit: {
      label: "Forfeited",
      tone: "warning",
      title: "Match forfeited",
      description: "The authoritative forfeit reason remains in the audit history.",
    },
    cancelled: {
      label: "Cancelled",
      tone: "neutral",
      title: "Match cancelled",
      description: "This match will not affect rankings.",
    },
    completed: {
      label: "Completed",
      tone: "success",
      title: "Match completed",
      description: "The final score and ranking impact are available.",
    },
  };
  return values[state];
}

async function loadMatchContextWith(
  database: Queryable,
  matchId: string,
  userId: string,
  role: PlatformRole,
  lock = false,
): Promise<MatchContext> {
  const matchResult = await database.query<MatchRow>(
    `
      SELECT
        match_record.*,
        competition.name AS competition_name,
        game.name AS game_name,
        game.filter_value AS game_filter
      FROM matches AS match_record
      LEFT JOIN competitions AS competition ON competition.id = match_record.competition_id
      JOIN games AS game ON game.id = match_record.game_id
      WHERE match_record.id = $1
      ${lock ? "FOR UPDATE OF match_record" : ""}
    `,
    [matchId],
  );

  const match = matchResult.rows[0];
  if (!match) {
    throw new ProductionMatchError({
      status: 404,
      code: "match_not_found",
      message: "The requested match was not found.",
    });
  }

  const participantsResult = await database.query<ParticipantRow>(
    `
      SELECT
        participant.*,
        COALESCE(NULLIF(profile.display_name, ''), user_account.gamer_tag) AS display_name,
        COALESCE(NULLIF(profile.handle, ''), '@' || user_account.normalized_gamer_tag) AS handle,
        profile.avatar_url,
        profile.country_code
      FROM match_participants AS participant
      JOIN users AS user_account ON user_account.id = participant.user_id
      LEFT JOIN player_profiles AS profile ON profile.user_id = participant.user_id
      WHERE participant.match_id = $1
      ORDER BY CASE participant.side WHEN 'home' THEN 0 ELSE 1 END
      ${lock ? "FOR UPDATE OF participant" : ""}
    `,
    [matchId],
  );

  const currentParticipant =
    participantsResult.rows.find((participant) => participant.user_id === userId) ?? null;
  if (!currentParticipant && !elevatedRoles.includes(role)) {
    throw new ProductionMatchError({
      status: 403,
      code: "match_forbidden",
      message: "You do not have access to this match.",
    });
  }

  const opponentParticipant = currentParticipant
    ? participantsResult.rows.find((participant) => participant.user_id !== userId) ?? null
    : null;

  const [result, dispute, evidence, issues, events] = await Promise.all([
    database.query<ResultRow>("SELECT * FROM match_results WHERE match_id = $1", [matchId]),
    database.query<DisputeRow>("SELECT * FROM match_disputes WHERE match_id = $1", [matchId]),
    database.query<EvidenceRow>(
      "SELECT id, file_name, mime_type, size_bytes, sha256, uploaded_at FROM match_evidence WHERE match_id = $1 AND scan_status = 'clean' ORDER BY uploaded_at",
      [matchId],
    ),
    database.query<IssueRow>(
      "SELECT id, category, summary, status, created_at FROM match_lobby_issues WHERE match_id = $1 ORDER BY created_at DESC",
      [matchId],
    ),
    database.query<EventRow>(
      "SELECT id, event_type, payload, match_version, created_at FROM match_events WHERE match_id = $1 ORDER BY created_at ASC",
      [matchId],
    ),
  ]);

  return {
    match,
    participants: participantsResult.rows,
    currentParticipant,
    opponentParticipant,
    result: result.rows[0] ?? null,
    dispute: dispute.rows[0] ?? null,
    evidence: evidence.rows,
    issues: issues.rows,
    events: events.rows,
  };
}

export function resolveMatchState(context: MatchContext, at = new Date()): MatchOperationState {
  if (terminalStates.has(context.match.state)) return context.match.state;
  if (context.dispute?.status === "open") return "disputed";
  if (context.result?.status === "confirmed") return "result-confirmed";
  if (context.result) return "awaiting-opponent-confirmation";

  const current = context.currentParticipant;
  const opponent = context.opponentParticipant;
  const participants = context.participants;
  const bothChecked = participants.length === 2 && participants.every((item) => item.checked_in_at);
  const bothEntered = participants.length === 2 && participants.every((item) => item.lobby_entered_at);
  const bothReady = participants.length === 2 && participants.every((item) => item.ready_at);

  if (bothReady && at >= toDate(context.match.result_due_at)) return "submit-result";
  if (bothReady && at >= toDate(context.match.match_starts_at)) return "in-progress";
  if (bothEntered || (bothChecked && at >= toDate(context.match.lobby_opens_at))) return "lobby-open";
  if (bothChecked) return "both-ready";

  if (current?.checked_in_at && !opponent?.checked_in_at) {
    return at >= toDate(context.match.check_in_closes_at)
      ? "opponent-not-checked-in"
      : "checked-in";
  }

  if (at >= toDate(context.match.check_in_opens_at) && at < toDate(context.match.check_in_closes_at)) {
    return "check-in-open";
  }
  if (at < toDate(context.match.check_in_opens_at)) {
    const farAway = toDate(context.match.check_in_opens_at).getTime() - at.getTime() > 24 * 60 * 60 * 1000;
    return farAway ? "scheduled" : "check-in-unavailable";
  }

  return context.match.state;
}

export function buildClock(context: MatchContext, at = new Date()): MatchClockSnapshot {
  const state = resolveMatchState(context, at);
  const deadlines: Array<{
    kind: NonNullable<MatchClockSnapshot["activeDeadlineKind"]>;
    at: Date;
  }> = [
    { kind: "check_in_opens", at: toDate(context.match.check_in_opens_at) },
    { kind: "check_in_closes", at: toDate(context.match.check_in_closes_at) },
    { kind: "lobby_opens", at: toDate(context.match.lobby_opens_at) },
    { kind: "match_starts", at: toDate(context.match.match_starts_at) },
    { kind: "result_due", at: toDate(context.match.result_due_at) },
  ];
  const active = deadlines.find((deadline) => deadline.at > at) ?? null;
  const elapsed = state === "in-progress" && at >= toDate(context.match.match_starts_at);

  return {
    matchId: context.match.id,
    state,
    matchVersion: context.match.version,
    serverNow: iso(at),
    issuedAt: iso(at),
    scheduledAt: iso(toDate(context.match.scheduled_at)),
    checkInOpensAt: iso(toDate(context.match.check_in_opens_at)),
    checkInClosesAt: iso(toDate(context.match.check_in_closes_at)),
    lobbyOpensAt: iso(toDate(context.match.lobby_opens_at)),
    matchStartsAt: iso(toDate(context.match.match_starts_at)),
    resultDueAt: iso(toDate(context.match.result_due_at)),
    activeDeadlineKind: elapsed ? null : active?.kind ?? null,
    activeDeadlineAt: elapsed ? null : active ? iso(active.at) : null,
    mode: elapsed ? "elapsed" : active ? "countdown" : "none",
    timezone: "UTC",
  };
}

function participantRaw(participant: ParticipantRow, currentUserId: string) {
  return {
    participant_id: participant.id,
    name: participant.display_name,
    handle: participant.handle,
    rank_label: participant.rank_label,
    emblem: participant.side === "home" ? ("rebels" as const) : ("apex" as const),
    side_label: participant.side === "home" ? "HOME" : "AWAY",
    checked_in: Boolean(participant.checked_in_at),
    ready: Boolean(participant.ready_at),
    is_current_user: participant.user_id === currentUserId,
  };
}

function action(
  label: string,
  tone: "primary" | "secondary" | "danger" = "primary",
  disabled = false,
) {
  return { label, tone, disabled };
}

function commandPresentation(state: MatchOperationState) {
  const presentation = labels(state);
  const checkInVisible = [
    "scheduled",
    "check-in-unavailable",
    "check-in-open",
    "checked-in",
    "opponent-not-checked-in",
    "both-ready",
  ].includes(state);
  const lobbyVisible = ["both-ready", "lobby-open", "in-progress"].includes(state);
  const resultVisible = [
    "in-progress",
    "submit-result",
    "awaiting-opponent-confirmation",
    "result-confirmed",
    "disputed",
    "completed",
    "forfeit",
  ].includes(state);

  return { presentation, checkInVisible, lobbyVisible, resultVisible };
}

export function buildReadResource(
  context: MatchContext,
  resource: MatchResourceName,
  userId: string,
  at = new Date(),
): unknown {
  const state = resolveMatchState(context, at);
  const clock = buildClock(context, at);
  const { presentation, checkInVisible, lobbyVisible, resultVisible } = commandPresentation(state);
  const home = context.participants.find((participant) => participant.side === "home");
  const away = context.participants.find((participant) => participant.side === "away");
  if (!home || !away) {
    throw new ProductionMatchError({
      status: 409,
      code: "match_participants_incomplete",
      message: "The match does not yet have both participants.",
    });
  }

  const score = context.result
    ? { home: context.result.home_score, away: context.result.away_score }
    : null;
  const current = context.currentParticipant;
  const opponent = context.opponentParticipant;
  const latestIssue = context.issues[0] ?? null;

  switch (resource) {
    case "summary":
      return {
        match_id: context.match.id,
        state,
        state_label: presentation.label,
        state_tone: presentation.tone,
        competition_name: context.match.competition_name ?? "Scheduled match",
        round_label: context.match.round_label,
        game_label: context.match.game_name,
        format_label: context.match.format_label,
        scheduled_at_label: toDate(context.match.scheduled_at).toLocaleString("en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "UTC",
        }),
        match_version: context.match.version,
      };
    case "participants":
      return {
        home: participantRaw(home, userId),
        away: participantRaw(away, userId),
        score,
      };
    case "timeline": {
      const milestones = [
        { id: "scheduled", label: "Match scheduled", at: context.match.scheduled_at },
        { id: "check-in", label: "Check-in opens", at: context.match.check_in_opens_at },
        { id: "lobby", label: "Lobby opens", at: context.match.lobby_opens_at },
        { id: "start", label: "Match starts", at: context.match.match_starts_at },
        { id: "result", label: "Result due", at: context.match.result_due_at },
      ];
      return {
        items: milestones.map((item) => ({
          id: item.id,
          label: item.label,
          time_label: toDate(item.at).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "UTC",
          }),
          state:
            toDate(item.at) < at
              ? "complete"
              : clock.activeDeadlineAt === iso(toDate(item.at))
                ? "current"
                : "future",
        })),
        server_time_label: `${at.toLocaleTimeString("en-GB", { timeZone: "UTC" })} UTC`,
      };
    }
    case "check-in":
      return {
        visible: checkInVisible,
        state_tone: presentation.tone,
        title: presentation.title,
        description: presentation.description,
        timer_label: clock.activeDeadlineAt,
        timer_caption: clock.activeDeadlineKind?.replaceAll("_", " ") ?? null,
        primary_action:
          state === "check-in-open" && !current?.checked_in_at ? action("Check in") : null,
        secondary_action: null,
      };
    case "lobby":
      return {
        visible: lobbyVisible,
        state_tone: presentation.tone,
        title: presentation.title,
        description: presentation.description,
        lobby_code: context.match.lobby_code,
        connection_status:
          state === "in-progress"
            ? "in_progress"
            : current?.lobby_entered_at
              ? "connected"
              : at >= toDate(context.match.lobby_opens_at)
                ? "available"
                : "waiting",
        platform: context.match.platform,
        server_region: context.match.server_region,
        join_instructions: context.match.join_method,
        current_user_entered: Boolean(current?.lobby_entered_at),
        current_user_ready: Boolean(current?.ready_at),
        opponent_entered: Boolean(opponent?.lobby_entered_at),
        opponent_ready: Boolean(opponent?.ready_at),
        can_enter:
          (state === "both-ready" || state === "lobby-open") &&
          at >= toDate(context.match.lobby_opens_at) &&
          !current?.lobby_entered_at,
        can_confirm_ready:
          state === "lobby-open" && Boolean(current?.lobby_entered_at) && !current?.ready_at,
        can_start_match:
          state === "lobby-open" &&
          Boolean(current?.ready_at) &&
          Boolean(opponent?.ready_at) &&
          at >= toDate(context.match.match_starts_at),
        can_report_issue: state === "lobby-open" || state === "in-progress",
        issue_count: context.issues.length,
        last_issue_id: latestIssue?.id ?? null,
        timer_label: clock.activeDeadlineAt,
        timer_caption: clock.activeDeadlineKind?.replaceAll("_", " ") ?? null,
        primary_action:
          (state === "both-ready" || state === "lobby-open") && !current?.lobby_entered_at
            ? action("Enter lobby")
            : state === "lobby-open" && current?.lobby_entered_at && !current?.ready_at
              ? action("I'm ready")
              : null,
        secondary_action:
          state === "lobby-open" || state === "in-progress"
            ? action("Report issue", "danger")
            : null,
      };
    case "result": {
      const conflict = context.result?.status === "conflict";
      const confirmed = context.result?.status === "confirmed";
      return {
        visible: resultVisible,
        state_tone: presentation.tone,
        title: presentation.title,
        description: presentation.description,
        primary_action:
          ["in-progress", "submit-result"].includes(state) && !context.result
            ? action("Submit result")
            : state === "awaiting-opponent-confirmation" &&
                context.result?.submitted_by !== userId
              ? action("Confirm result")
              : null,
        secondary_action:
          ["in-progress", "submit-result", "awaiting-opponent-confirmation", "result-confirmed"].includes(
            state,
          ) && !context.dispute
            ? action("Open dispute", "danger")
            : null,
        score,
        result_note: conflict
          ? "The confirmation score does not match. Open a dispute for review."
          : context.result?.note ?? null,
        xp_earned: confirmed ? 75 : null,
        submission_id: context.result?.id ?? null,
        submitted_at: context.result ? iso(toDate(context.result.submitted_at)) : null,
        confirmed_at: context.result?.confirmed_at ? iso(toDate(context.result.confirmed_at)) : null,
        confirmation_status: context.dispute
          ? "disputed"
          : conflict
            ? "conflict"
            : confirmed
              ? "confirmed"
              : context.result
                ? "awaiting_opponent"
                : "not_submitted",
        can_submit: ["in-progress", "submit-result"].includes(state) && !context.result,
        can_confirm:
          state === "awaiting-opponent-confirmation" &&
          Boolean(context.result) &&
          context.result?.submitted_by !== userId,
        can_dispute:
          ["in-progress", "submit-result", "awaiting-opponent-confirmation", "result-confirmed"].includes(
            state,
          ) && !context.dispute,
        conflict_code: conflict ? "MATCH_RESULT_SCORE_CONFLICT" : null,
      };
    }
    case "evidence":
      return {
        visible: ["in-progress", "submit-result", "awaiting-opponent-confirmation", "disputed"].includes(
          state,
        ),
        max_files: 5,
        max_file_size_bytes: 25 * 1024 * 1024,
        accepted_mime_types: ["image/png", "image/jpeg", "video/mp4"],
        uploaded_count: context.evidence.length,
        upload_enabled: false,
        attachments: context.evidence.map((item) => ({
          evidence_id: item.id,
          file_name: item.file_name,
          mime_type: item.mime_type,
          size_bytes: item.size_bytes,
          sha256: item.sha256,
          uploaded_at: iso(toDate(item.uploaded_at)),
        })),
      };
    case "dispute":
      return {
        visible:
          Boolean(context.dispute) ||
          ["in-progress", "submit-result", "awaiting-opponent-confirmation", "result-confirmed"].includes(
            state,
          ),
        title: context.dispute ? "Dispute in progress" : "Open a dispute",
        result_note: context.dispute?.summary ?? context.result?.note ?? null,
        dispute_id: context.dispute?.id ?? null,
        status_label: context.dispute ? "Under review" : "Not opened",
        secondary_action: null,
        reason_code: context.dispute?.reason ?? null,
        summary: context.dispute?.summary ?? null,
        created_at: context.dispute ? iso(toDate(context.dispute.created_at)) : null,
        audit_event_count: context.dispute ? 1 : 0,
        can_create:
          !context.dispute &&
          ["in-progress", "submit-result", "awaiting-opponent-confirmation", "result-confirmed"].includes(
            state,
          ),
      };
    case "support":
      return {
        match_id: context.match.id,
        game_label: context.match.game_name,
        format_label: context.match.format_label,
        lobby_code: context.match.lobby_code,
        chat_available: false,
        support_available: true,
        note: "Match support remains available when an unrelated panel fails.",
      };
  }
}

export async function readMatchResource(input: {
  matchId: string;
  userId: string;
  role: PlatformRole;
  resource: MatchResourceName;
}) {
  const context = await loadMatchContextWith(
    { query: queryDatabase as Queryable["query"] },
    input.matchId,
    input.userId,
    input.role,
  );
  const at = new Date();
  return {
    data: buildReadResource(context, input.resource, input.userId, at),
    context,
    serverNow: iso(at),
    lastUpdatedAt: iso(toDate(context.match.updated_at)),
  };
}

export async function readMatchClock(input: {
  matchId: string;
  userId: string;
  role: PlatformRole;
}) {
  const context = await loadMatchContextWith(
    { query: queryDatabase as Queryable["query"] },
    input.matchId,
    input.userId,
    input.role,
  );
  return buildClock(context);
}

function assertExpected(context: MatchContext, expectedState: MatchOperationState, expectedVersion: number) {
  const currentState = resolveMatchState(context);
  if (context.match.version !== expectedVersion || currentState !== expectedState) {
    throw new ProductionMatchError({
      status: 409,
      code: "MATCH_STATE_CONFLICT",
      message: "The match changed. Refresh before trying again.",
      fieldErrors: {
        expected_state: [`Current state is ${currentState}.`],
        expected_version: [`Current version is ${context.match.version}.`],
      },
    });
  }
  if (terminalStates.has(currentState)) {
    throw new ProductionMatchError({
      status: 409,
      code: "MATCH_TERMINAL_STATE",
      message: `The match is already ${currentState}.`,
    });
  }
}

async function replayCommand(client: Queryable, userId: string, idempotencyKey: string) {
  const result = await client.query<{ status_code: number; response_body: unknown }>(
    "SELECT status_code, response_body FROM match_operation_commands WHERE actor_user_id = $1 AND idempotency_key = $2",
    [userId, idempotencyKey],
  );
  const existing = result.rows[0];
  if (!existing) return null;
  const body = structuredClone(existing.response_body) as Record<string, unknown>;
  const data = body.data;
  if (data && typeof data === "object" && "event" in data) {
    const event = (data as { event?: unknown }).event;
    if (event && typeof event === "object") {
      (event as { replayed?: boolean }).replayed = true;
    }
  }
  return { status: existing.status_code, body };
}

async function storeCommand(
  client: Queryable,
  input: {
    matchId: string;
    userId: string;
    operation: string;
    idempotencyKey: string;
    status: number;
    body: unknown;
  },
) {
  await client.query(
    `
      INSERT INTO match_operation_commands (
        match_id, actor_user_id, operation, idempotency_key, status_code, response_body
      ) VALUES ($1, $2, $3, $4, $5, $6::jsonb)
    `,
    [input.matchId, input.userId, input.operation, input.idempotencyKey, input.status, JSON.stringify(input.body)],
  );
}

async function addEvent(
  client: Queryable,
  input: {
    matchId: string;
    userId: string | null;
    eventType: string;
    payload?: Record<string, unknown>;
    version: number;
  },
) {
  const eventId = randomUUID();
  await client.query(
    `INSERT INTO match_events (id, match_id, actor_user_id, event_type, payload, match_version)
     VALUES ($1, $2, $3, $4, $5::jsonb, $6)`,
    [eventId, input.matchId, input.userId, input.eventType, JSON.stringify(input.payload ?? {}), input.version],
  );
  return eventId;
}

async function addAudit(
  client: Queryable,
  input: {
    actorUserId: string | null;
    action: string;
    matchId: string;
    reason?: string | null;
    requestId: string;
    metadata?: Record<string, unknown>;
  },
) {
  const auditId = randomUUID();
  await client.query(
    `INSERT INTO audit_events (id, actor_user_id, action, target_type, target_id, reason, request_id, metadata)
     VALUES ($1, $2, $3, 'match', $4, $5, $6, $7::jsonb)`,
    [
      auditId,
      input.actorUserId,
      input.action,
      input.matchId,
      input.reason ?? null,
      input.requestId,
      JSON.stringify(input.metadata ?? {}),
    ],
  );
  return auditId;
}

function rawCheckInSnapshot(context: MatchContext, eventId: string | null, replayed: boolean) {
  const current = context.currentParticipant;
  const opponent = context.opponentParticipant;
  if (!current || !opponent) {
    throw new ProductionMatchError({ status: 409, code: "match_participants_incomplete", message: "Both participants are required." });
  }
  const state = resolveMatchState(context);
  return {
    match_id: context.match.id,
    seed_state: state,
    state,
    match_version: context.match.version,
    current_user: {
      participant_id: current.id,
      checked_in: Boolean(current.checked_in_at),
      ready: Boolean(current.ready_at),
    },
    opponent: {
      participant_id: opponent.id,
      checked_in: Boolean(opponent.checked_in_at),
      ready: Boolean(opponent.ready_at),
    },
    check_in_event_count: context.events.filter((event) => event.event_type === "match.checked_in").length,
    last_event_id: eventId,
    last_updated_at: iso(toDate(context.match.updated_at)),
    clock: buildClock(context),
    event: { event_id: eventId, created_at: nowIso(), replayed },
  };
}

export async function executeCheckIn(input: {
  matchId: string;
  userId: string;
  role: PlatformRole;
  expectedState: MatchOperationState;
  expectedVersion: number;
  idempotencyKey: string;
  requestId: string;
}) {
  return withDatabaseTransaction(async (client) => {
    const replay = await replayCommand(client, input.userId, input.idempotencyKey);
    if (replay) return replay;

    let context = await loadMatchContextWith(client, input.matchId, input.userId, input.role, true);
    assertExpected(context, input.expectedState, input.expectedVersion);
    if (!context.currentParticipant) {
      throw new ProductionMatchError({ status: 403, code: "match_forbidden", message: "Only a participant can check in." });
    }
    const state = resolveMatchState(context);
    if (state !== "check-in-open" && !context.currentParticipant.checked_in_at) {
      throw new ProductionMatchError({ status: 409, code: "MATCH_CHECK_IN_CLOSED", message: "Check-in is not open." });
    }

    let outcome: "checked_in" | "both_ready" | "already_checked_in" = "already_checked_in";
    let eventId: string | null = null;
    if (!context.currentParticipant.checked_in_at) {
      await client.query(
        "UPDATE match_participants SET checked_in_at = now(), updated_at = now() WHERE id = $1",
        [context.currentParticipant.id],
      );
      const nextVersion = context.match.version + 1;
      await client.query("UPDATE matches SET version = $2, updated_at = now() WHERE id = $1", [input.matchId, nextVersion]);
      eventId = await addEvent(client, {
        matchId: input.matchId,
        userId: input.userId,
        eventType: "match.checked_in",
        version: nextVersion,
      });
      await addAudit(client, {
        actorUserId: input.userId,
        action: "match.check_in",
        matchId: input.matchId,
        requestId: input.requestId,
      });
      context = await loadMatchContextWith(client, input.matchId, input.userId, input.role);
      outcome = context.opponentParticipant?.checked_in_at ? "both_ready" : "checked_in";
    }

    const body = {
      ok: true,
      data: { outcome, ...rawCheckInSnapshot(context, eventId, false) },
      request_id: input.requestId,
    };
    await storeCommand(client, {
      matchId: input.matchId,
      userId: input.userId,
      operation: "check-in",
      idempotencyKey: input.idempotencyKey,
      status: 200,
      body,
    });
    return { status: 200, body };
  });
}

function rawLobbySnapshot(context: MatchContext, eventId: string | null, actionName: string, replayed: boolean) {
  const current = context.currentParticipant;
  const opponent = context.opponentParticipant;
  if (!current || !opponent) {
    throw new ProductionMatchError({ status: 409, code: "match_participants_incomplete", message: "Both participants are required." });
  }
  const lastIssue = context.issues[0] ?? null;
  const state = resolveMatchState(context);
  return {
    match_id: context.match.id,
    seed_state: state,
    state,
    match_version: context.match.version,
    current_user: {
      participant_id: current.id,
      checked_in: Boolean(current.checked_in_at),
      entered: Boolean(current.lobby_entered_at),
      ready: Boolean(current.ready_at),
    },
    opponent: {
      participant_id: opponent.id,
      checked_in: Boolean(opponent.checked_in_at),
      entered: Boolean(opponent.lobby_entered_at),
      ready: Boolean(opponent.ready_at),
    },
    connection: {
      lobby_code: context.match.lobby_code,
      platform: context.match.platform,
      server_region: context.match.server_region,
      join_method: context.match.join_method,
    },
    action_event_count: context.events.filter((event) => event.event_type.startsWith("match.lobby")).length,
    issue_count: context.issues.length,
    last_issue: lastIssue
      ? {
          issue_id: lastIssue.id,
          category: lastIssue.category,
          summary: lastIssue.summary,
          status: "open",
          created_at: iso(toDate(lastIssue.created_at)),
        }
      : null,
    last_event_id: eventId,
    last_updated_at: iso(toDate(context.match.updated_at)),
    clock: buildClock(context),
    event: { event_id: eventId, action: actionName, created_at: nowIso(), replayed },
  };
}

export async function executeLobbyAction(input: {
  matchId: string;
  userId: string;
  role: PlatformRole;
  action: "enter_lobby" | "confirm_ready" | "start_match" | "report_issue";
  issue?: { category: "connection" | "opponent" | "rules" | "other"; summary: string };
  expectedState: MatchOperationState;
  expectedVersion: number;
  idempotencyKey: string;
  requestId: string;
}) {
  return withDatabaseTransaction(async (client) => {
    const replay = await replayCommand(client, input.userId, input.idempotencyKey);
    if (replay) return replay;
    let context = await loadMatchContextWith(client, input.matchId, input.userId, input.role, true);
    assertExpected(context, input.expectedState, input.expectedVersion);
    const participant = context.currentParticipant;
    if (!participant) {
      throw new ProductionMatchError({ status: 403, code: "match_forbidden", message: "Only a participant can use the lobby." });
    }

    const state = resolveMatchState(context);
    let outcome: "lobby_entered" | "ready_confirmed" | "match_started" | "issue_reported" | "already_applied";
    const nextVersion = context.match.version + 1;

    if (input.action === "enter_lobby") {
      if (state !== "both-ready" && state !== "lobby-open") {
        throw new ProductionMatchError({ status: 409, code: "MATCH_LOBBY_UNAVAILABLE", message: "The lobby is not available." });
      }
      await client.query(
        "UPDATE match_participants SET lobby_entered_at = COALESCE(lobby_entered_at, now()), updated_at = now() WHERE id = $1",
        [participant.id],
      );
      outcome = participant.lobby_entered_at ? "already_applied" : "lobby_entered";
    } else if (input.action === "confirm_ready") {
      if (!participant.lobby_entered_at) {
        throw new ProductionMatchError({ status: 409, code: "MATCH_LOBBY_ENTRY_REQUIRED", message: "Enter the lobby before confirming readiness." });
      }
      await client.query(
        "UPDATE match_participants SET ready_at = COALESCE(ready_at, now()), updated_at = now() WHERE id = $1",
        [participant.id],
      );
      outcome = participant.ready_at ? "already_applied" : "ready_confirmed";
    } else if (input.action === "start_match") {
      const bothReady = context.participants.length === 2 && context.participants.every((item) => item.ready_at);
      if (!bothReady || new Date() < toDate(context.match.match_starts_at)) {
        throw new ProductionMatchError({ status: 409, code: "MATCH_START_BLOCKED", message: "Both players must be ready and server start time must be reached." });
      }
      await client.query("UPDATE matches SET state = 'in-progress', version = $2, updated_at = now() WHERE id = $1", [input.matchId, nextVersion]);
      outcome = "match_started";
    } else {
      if (!input.issue) {
        throw new ProductionMatchError({ status: 400, code: "MATCH_ISSUE_REQUIRED", message: "Issue details are required." });
      }
      await client.query(
        "INSERT INTO match_lobby_issues (id, match_id, reported_by, category, summary) VALUES ($1, $2, $3, $4, $5)",
        [randomUUID(), input.matchId, input.userId, input.issue.category, input.issue.summary],
      );
      outcome = "issue_reported";
    }

    if (input.action !== "start_match") {
      await client.query("UPDATE matches SET version = $2, updated_at = now() WHERE id = $1", [input.matchId, nextVersion]);
    }
    const eventId = await addEvent(client, {
      matchId: input.matchId,
      userId: input.userId,
      eventType: `match.lobby.${input.action}`,
      payload: input.issue ?? {},
      version: nextVersion,
    });
    await addAudit(client, {
      actorUserId: input.userId,
      action: `match.lobby.${input.action}`,
      matchId: input.matchId,
      requestId: input.requestId,
      metadata: input.issue ?? {},
    });
    context = await loadMatchContextWith(client, input.matchId, input.userId, input.role);
    const body = {
      ok: true,
      data: { outcome, ...rawLobbySnapshot(context, eventId, input.action, false) },
      request_id: input.requestId,
    };
    await storeCommand(client, {
      matchId: input.matchId,
      userId: input.userId,
      operation: `lobby.${input.action}`,
      idempotencyKey: input.idempotencyKey,
      status: 200,
      body,
    });
    return { status: 200, body };
  });
}

function rawResultSnapshot(context: MatchContext) {
  const result = context.result;
  const dispute = context.dispute;
  const conflict = result?.status === "conflict" && result.confirmation_home_score !== null && result.confirmation_away_score !== null;
  const state = resolveMatchState(context);
  return {
    match_id: context.match.id,
    seed_state: state,
    state,
    match_version: context.match.version,
    submission: result
      ? {
          submission_id: result.id,
          score: { home: result.home_score, away: result.away_score },
          note: result.note,
          submitted_by: "current_user",
          submitted_at: iso(toDate(result.submitted_at)),
        }
      : null,
    confirmation:
      result?.confirmed_at && result.confirmation_home_score !== null && result.confirmation_away_score !== null
        ? {
            confirmation_id: `${result.id}-confirmation`,
            score: { home: result.confirmation_home_score, away: result.confirmation_away_score },
            confirmed_by: "opponent",
            confirmed_at: iso(toDate(result.confirmed_at)),
          }
        : null,
    conflict:
      conflict
        ? {
            conflict_id: `${result.id}-conflict`,
            submitted_score: { home: result.home_score, away: result.away_score },
            confirmation_score: {
              home: result.confirmation_home_score as number,
              away: result.confirmation_away_score as number,
            },
            detected_at: iso(toDate(result.updated_at)),
          }
        : null,
    evidence_attachments: context.evidence.map((item) => ({
      evidence_id: item.id,
      file_name: item.file_name,
      mime_type: item.mime_type,
      size_bytes: item.size_bytes,
      sha256: item.sha256,
      uploaded_at: iso(toDate(item.uploaded_at)),
    })),
    dispute: dispute
      ? {
          dispute_id: dispute.id,
          reason: dispute.reason,
          summary: dispute.summary,
          claimed_score:
            dispute.claimed_home_score !== null && dispute.claimed_away_score !== null
              ? { home: dispute.claimed_home_score, away: dispute.claimed_away_score }
              : null,
          status: "open",
          created_by: "current_user",
          created_at: iso(toDate(dispute.created_at)),
          audit_event_id: dispute.audit_event_id,
        }
      : null,
    result_event_count: context.events.filter((event) => event.event_type.startsWith("match.result")).length,
    evidence_event_count: context.events.filter((event) => event.event_type === "match.evidence.uploaded").length,
    dispute_event_count: context.events.filter((event) => event.event_type === "match.dispute.created").length,
    last_event_id: context.events.at(-1)?.id ?? null,
    last_updated_at: iso(toDate(context.match.updated_at)),
    clock: buildClock(context),
  };
}

async function updateCompetitiveSummaries(client: Queryable, context: MatchContext, result: ResultRow) {
  const home = context.participants.find((participant) => participant.side === "home");
  const away = context.participants.find((participant) => participant.side === "away");
  if (!home || !away) return;
  const homeWon = result.home_score > result.away_score;
  const awayWon = result.away_score > result.home_score;
  for (const participant of [home, away]) {
    const won = participant.side === "home" ? homeWon : awayWon;
    const lost = participant.side === "home" ? awayWon : homeWon;
    await client.query(
      `
        INSERT INTO player_competitive_summaries (user_id, matches, wins, losses, draws, points, current_streak)
        VALUES ($1, 1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id) DO UPDATE SET
          matches = player_competitive_summaries.matches + 1,
          wins = player_competitive_summaries.wins + EXCLUDED.wins,
          losses = player_competitive_summaries.losses + EXCLUDED.losses,
          draws = player_competitive_summaries.draws + EXCLUDED.draws,
          points = player_competitive_summaries.points + EXCLUDED.points,
          current_streak = CASE
            WHEN EXCLUDED.wins = 1 THEN GREATEST(player_competitive_summaries.current_streak, 0) + 1
            WHEN EXCLUDED.losses = 1 THEN LEAST(player_competitive_summaries.current_streak, 0) - 1
            ELSE 0
          END,
          updated_at = now()
      `,
      [participant.user_id, won ? 1 : 0, lost ? 1 : 0, !won && !lost ? 1 : 0, won ? 3 : !lost ? 1 : 0, won ? 1 : lost ? -1 : 0],
    );
  }
}

export async function executeResultAction(input: {
  matchId: string;
  userId: string;
  role: PlatformRole;
  action: "submit_result" | "confirm_result";
  score: { home: number; away: number };
  note?: string;
  expectedState: MatchOperationState;
  expectedVersion: number;
  idempotencyKey: string;
  requestId: string;
}) {
  return withDatabaseTransaction(async (client) => {
    const replay = await replayCommand(client, input.userId, input.idempotencyKey);
    if (replay) return replay;
    let context = await loadMatchContextWith(client, input.matchId, input.userId, input.role, true);
    assertExpected(context, input.expectedState, input.expectedVersion);
    if (!context.currentParticipant) {
      throw new ProductionMatchError({ status: 403, code: "match_forbidden", message: "Only a participant can submit or confirm results." });
    }

    let outcome: "result_submitted" | "result_confirmed" | "result_conflict_detected" | "already_applied";
    const nextVersion = context.match.version + 1;
    if (input.action === "submit_result") {
      if (context.result) {
        outcome = "already_applied";
      } else {
        await client.query(
          `INSERT INTO match_results (id, match_id, submitted_by, home_score, away_score, note)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [randomUUID(), input.matchId, input.userId, input.score.home, input.score.away, input.note ?? null],
        );
        await client.query(
          "UPDATE matches SET state = 'awaiting-opponent-confirmation', version = $2, updated_at = now() WHERE id = $1",
          [input.matchId, nextVersion],
        );
        outcome = "result_submitted";
      }
    } else {
      if (!context.result) {
        throw new ProductionMatchError({ status: 409, code: "MATCH_RESULT_MISSING", message: "There is no submitted result to confirm." });
      }
      if (context.result.submitted_by === input.userId) {
        throw new ProductionMatchError({ status: 403, code: "MATCH_RESULT_SELF_CONFIRMATION", message: "The submitting player cannot confirm their own result." });
      }
      if (context.result.status === "confirmed") {
        outcome = "already_applied";
      } else {
        const same = context.result.home_score === input.score.home && context.result.away_score === input.score.away;
        await client.query(
        `UPDATE match_results
         SET status = $2, confirmed_by = $3, confirmation_home_score = $4, confirmation_away_score = $5,
             confirmed_at = now(), updated_at = now()
         WHERE match_id = $1`,
        [input.matchId, same ? "confirmed" : "conflict", input.userId, input.score.home, input.score.away],
      );
        await client.query(
          "UPDATE matches SET state = $2, version = $3, updated_at = now() WHERE id = $1",
          [input.matchId, same ? "result-confirmed" : "awaiting-opponent-confirmation", nextVersion],
        );
        outcome = same ? "result_confirmed" : "result_conflict_detected";
      }
    }

    const eventVersion = outcome === "already_applied" ? context.match.version : nextVersion;
    const eventId =
      outcome === "already_applied"
        ? null
        : await addEvent(client, {
            matchId: input.matchId,
            userId: input.userId,
            eventType: `match.result.${input.action}`,
            payload: { score: input.score },
            version: eventVersion,
          });
    if (outcome !== "already_applied") {
      await addAudit(client, {
        actorUserId: input.userId,
        action: `match.result.${input.action}`,
        matchId: input.matchId,
        requestId: input.requestId,
        metadata: { score: input.score },
      });
    }
    context = await loadMatchContextWith(client, input.matchId, input.userId, input.role);
    if (outcome === "result_confirmed" && context.result) {
      await updateCompetitiveSummaries(client, context, context.result);
      await client.query("UPDATE leaderboard_revisions SET revision = revision + 1, updated_at = now() WHERE mode IN ('weekly', 'game', 'combine')");
    }
    const body = {
      ok: true,
      data: {
        outcome,
        snapshot: rawResultSnapshot(context),
        event: { event_id: eventId, action: input.action, created_at: nowIso(), replayed: false },
      },
      request_id: input.requestId,
    };
    await storeCommand(client, {
      matchId: input.matchId,
      userId: input.userId,
      operation: `result.${input.action}`,
      idempotencyKey: input.idempotencyKey,
      status: 200,
      body,
    });
    return { status: 200, body };
  });
}

export async function executeDispute(input: {
  matchId: string;
  userId: string;
  role: PlatformRole;
  reason: "score_mismatch" | "opponent_no_show" | "rule_violation" | "connection_failure" | "other";
  summary: string;
  claimedScore: { home: number; away: number } | null;
  expectedState: MatchOperationState;
  expectedVersion: number;
  idempotencyKey: string;
  requestId: string;
}) {
  return withDatabaseTransaction(async (client) => {
    const replay = await replayCommand(client, input.userId, input.idempotencyKey);
    if (replay) return replay;
    let context = await loadMatchContextWith(client, input.matchId, input.userId, input.role, true);
    assertExpected(context, input.expectedState, input.expectedVersion);
    if (!context.currentParticipant) {
      throw new ProductionMatchError({ status: 403, code: "match_forbidden", message: "Only a participant can create a dispute." });
    }
    if (context.dispute) {
      const body = {
        ok: true,
        data: {
          outcome: "already_applied",
          snapshot: rawResultSnapshot(context),
          event: { event_id: null, created_at: nowIso(), replayed: false },
        },
        request_id: input.requestId,
      };
      await storeCommand(client, {
        matchId: input.matchId,
        userId: input.userId,
        operation: "dispute.create",
        idempotencyKey: input.idempotencyKey,
        status: 200,
        body,
      });
      return { status: 200, body };
    }

    const auditId = await addAudit(client, {
      actorUserId: input.userId,
      action: "match.dispute.create",
      matchId: input.matchId,
      reason: input.summary,
      requestId: input.requestId,
      metadata: { reason: input.reason, claimedScore: input.claimedScore },
    });
    const disputeId = randomUUID();
    await client.query(
      `INSERT INTO match_disputes (
         id, match_id, created_by, reason, summary, claimed_home_score, claimed_away_score, audit_event_id
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        disputeId,
        input.matchId,
        input.userId,
        input.reason,
        input.summary,
        input.claimedScore?.home ?? null,
        input.claimedScore?.away ?? null,
        auditId,
      ],
    );
    await client.query(
      "UPDATE match_results SET status = 'disputed', updated_at = now() WHERE match_id = $1",
      [input.matchId],
    );
    const nextVersion = context.match.version + 1;
    await client.query("UPDATE matches SET state = 'disputed', version = $2, updated_at = now() WHERE id = $1", [input.matchId, nextVersion]);
    const eventId = await addEvent(client, {
      matchId: input.matchId,
      userId: input.userId,
      eventType: "match.dispute.created",
      payload: { disputeId, reason: input.reason },
      version: nextVersion,
    });
    context = await loadMatchContextWith(client, input.matchId, input.userId, input.role);
    const body = {
      ok: true,
      data: {
        outcome: "dispute_created",
        snapshot: rawResultSnapshot(context),
        event: { event_id: eventId, created_at: nowIso(), replayed: false },
      },
      request_id: input.requestId,
    };
    await storeCommand(client, {
      matchId: input.matchId,
      userId: input.userId,
      operation: "dispute.create",
      idempotencyKey: input.idempotencyKey,
      status: 200,
      body,
    });
    return { status: 200, body };
  });
}

export async function readTerminalSnapshot(input: { matchId: string; userId: string; role: PlatformRole }) {
  const context = await loadMatchContextWith(
    { query: queryDatabase as Queryable["query"] },
    input.matchId,
    input.userId,
    input.role,
  );
  const latestTerminal = [...context.events].reverse().find((event) => event.event_type.startsWith("match.terminal."));
  return {
    match_id: context.match.id,
    seed_state: context.match.state,
    state: resolveMatchState(context),
    match_version: context.match.version,
    terminal_reason: context.match.terminal_reason,
    terminal_at: context.match.terminal_at ? iso(toDate(context.match.terminal_at)) : null,
    actor_role: context.match.terminal_actor_role,
    audit_event_id:
      latestTerminal && typeof latestTerminal.payload.auditEventId === "string"
        ? latestTerminal.payload.auditEventId
        : null,
    terminal_event_count: context.events.filter((event) => event.event_type.startsWith("match.terminal.")).length,
    last_updated_at: iso(toDate(context.match.updated_at)),
    clock: buildClock(context),
  };
}

export async function executeTerminal(input: {
  matchId: string;
  userId: string;
  role: PlatformRole;
  action: "forfeit_match" | "cancel_match" | "complete_match";
  reason: string;
  expectedState: MatchOperationState;
  expectedVersion: number;
  idempotencyKey: string;
  requestId: string;
}) {
  return withDatabaseTransaction(async (client) => {
    const replay = await replayCommand(client, input.userId, input.idempotencyKey);
    if (replay) return replay;
    let context = await loadMatchContextWith(client, input.matchId, input.userId, input.role, true);
    assertExpected(context, input.expectedState, input.expectedVersion);
    const canForfeit = input.action === "forfeit_match" && Boolean(context.currentParticipant);
    const canOperate = elevatedRoles.includes(input.role);
    if (!canForfeit && !canOperate) {
      throw new ProductionMatchError({ status: 403, code: "MATCH_TERMINAL_FORBIDDEN", message: "Elevated permission is required for this operation." });
    }
    const nextState: MatchOperationState =
      input.action === "forfeit_match"
        ? "forfeit"
        : input.action === "cancel_match"
          ? "cancelled"
          : "completed";
    const actorRole = canOperate ? (input.role === "referee" ? "support" : "admin") : "current_user";
    const previousState = resolveMatchState(context);
    const nextVersion = context.match.version + 1;
    const auditId = await addAudit(client, {
      actorUserId: input.userId,
      action: `match.terminal.${input.action}`,
      matchId: input.matchId,
      reason: input.reason,
      requestId: input.requestId,
      metadata: { previousState, nextState },
    });
    await client.query(
      `UPDATE matches
       SET state = $2, version = $3, terminal_reason = $4, terminal_at = now(), terminal_actor_role = $5, updated_at = now()
       WHERE id = $1`,
      [input.matchId, nextState, nextVersion, input.reason, actorRole],
    );
    const eventId = await addEvent(client, {
      matchId: input.matchId,
      userId: input.userId,
      eventType: `match.terminal.${input.action}`,
      payload: { auditEventId: auditId, reason: input.reason },
      version: nextVersion,
    });
    context = await loadMatchContextWith(client, input.matchId, input.userId, input.role);
    const latestTerminal = [...context.events]
      .reverse()
      .find((event) => event.event_type.startsWith("match.terminal."));
    const snapshot = {
      match_id: context.match.id,
      seed_state: context.match.state,
      state: resolveMatchState(context),
      match_version: context.match.version,
      terminal_reason: context.match.terminal_reason,
      terminal_at: context.match.terminal_at ? iso(toDate(context.match.terminal_at)) : null,
      actor_role: context.match.terminal_actor_role,
      audit_event_id:
        latestTerminal && typeof latestTerminal.payload.auditEventId === "string"
          ? latestTerminal.payload.auditEventId
          : null,
      terminal_event_count: context.events.filter((event) =>
        event.event_type.startsWith("match.terminal."),
      ).length,
      last_updated_at: iso(toDate(context.match.updated_at)),
      clock: buildClock(context),
    };
    const body = {
      ok: true,
      data: {
        outcome:
          input.action === "forfeit_match"
            ? "match_forfeited"
            : input.action === "cancel_match"
              ? "match_cancelled"
              : "match_completed",
        snapshot,
        event: {
          audit_event_id: auditId,
          action: input.action,
          actor_role: actorRole,
          reason: input.reason,
          previous_state: previousState,
          next_state: nextState,
          previous_version: input.expectedVersion,
          next_version: nextVersion,
          created_at: nowIso(),
          replayed: false,
        },
      },
      request_id: input.requestId,
    };
    await storeCommand(client, {
      matchId: input.matchId,
      userId: input.userId,
      operation: `terminal.${input.action}`,
      idempotencyKey: input.idempotencyKey,
      status: 200,
      body,
    });
    void eventId;
    return { status: 200, body };
  });
}

export async function getInitialMatchViewModel(input: {
  matchId: string;
  userId: string;
  role: PlatformRole;
}): Promise<MatchOperationsViewModel> {
  const context = await loadMatchContextWith(
    { query: queryDatabase as Queryable["query"] },
    input.matchId,
    input.userId,
    input.role,
  );
  const state = resolveMatchState(context);
  const clock = buildClock(context);
  const summary = buildReadResource(context, "summary", input.userId) as Record<string, unknown>;
  const participants = buildReadResource(context, "participants", input.userId) as {
    home: ReturnType<typeof participantRaw>;
    away: ReturnType<typeof participantRaw>;
    score: { home: number; away: number } | null;
  };
  const timeline = buildReadResource(context, "timeline", input.userId) as {
    items: Array<{ id: string; label: string; time_label: string; state: "complete" | "current" | "future" | "warning" }>;
    server_time_label: string;
  };
  const presentation = labels(state);
  return {
    id: context.match.id,
    state,
    stateLabel: String(summary.state_label),
    stateTone: summary.state_tone as MatchOperationsViewModel["stateTone"],
    competitionName: String(summary.competition_name),
    roundLabel: String(summary.round_label),
    gameLabel: String(summary.game_label),
    formatLabel: String(summary.format_label),
    scheduledAtLabel: String(summary.scheduled_at_label),
    serverTimeLabel: timeline.server_time_label,
    lobbyCode: context.match.lobby_code,
    matchVersion: context.match.version,
    clock,
    home: {
      id: participants.home.participant_id,
      name: participants.home.name,
      handle: participants.home.handle,
      rankLabel: participants.home.rank_label,
      emblem: participants.home.emblem,
      sideLabel: participants.home.side_label,
      checkedIn: participants.home.checked_in,
      ready: participants.home.ready,
    },
    away: {
      id: participants.away.participant_id,
      name: participants.away.name,
      handle: participants.away.handle,
      rankLabel: participants.away.rank_label,
      emblem: participants.away.emblem,
      sideLabel: participants.away.side_label,
      checkedIn: participants.away.checked_in,
      ready: participants.away.ready,
    },
    title: presentation.title,
    description: presentation.description,
    timerLabel: clock.activeDeadlineAt,
    timerCaption: clock.activeDeadlineKind?.replaceAll("_", " ") ?? null,
    primaryAction: null,
    secondaryAction: null,
    score: participants.score,
    resultNote: context.result?.note ?? context.dispute?.summary ?? context.match.terminal_reason,
    xpEarned: context.result?.status === "confirmed" ? 75 : null,
    disputeId: context.dispute?.id ?? null,
    timeline: timeline.items.map((item) => ({
      id: item.id,
      label: item.label,
      timeLabel: item.time_label,
      state: item.state,
    })),
  };
}

export type MatchListItem = {
  id: string;
  time: string;
  live: boolean;
  match: string;
  game: string;
  tone: "orange" | "green" | "blue" | "purple";
  detail: string;
  ranks: string;
};

export async function listVisibleMatches(userId: string, role: PlatformRole): Promise<MatchListItem[]> {
  const elevated = elevatedRoles.includes(role);
  const result = await queryDatabase<
    QueryResultRow & {
      id: string;
      scheduled_at: Date;
      state: MatchOperationState;
      format_label: string;
      game_name: string;
      game_filter: string;
      home_name: string;
      away_name: string;
      home_rank: string;
      away_rank: string;
    }
  >(
    `
      SELECT
        match_record.id,
        match_record.scheduled_at,
        match_record.state,
        match_record.format_label,
        game.name AS game_name,
        game.filter_value AS game_filter,
        MAX(CASE WHEN participant.side = 'home' THEN COALESCE(NULLIF(profile.display_name, ''), user_account.gamer_tag) END) AS home_name,
        MAX(CASE WHEN participant.side = 'away' THEN COALESCE(NULLIF(profile.display_name, ''), user_account.gamer_tag) END) AS away_name,
        MAX(CASE WHEN participant.side = 'home' THEN participant.rank_label END) AS home_rank,
        MAX(CASE WHEN participant.side = 'away' THEN participant.rank_label END) AS away_rank
      FROM matches AS match_record
      JOIN games AS game ON game.id = match_record.game_id
      JOIN match_participants AS participant ON participant.match_id = match_record.id
      JOIN users AS user_account ON user_account.id = participant.user_id
      LEFT JOIN player_profiles AS profile ON profile.user_id = participant.user_id
      WHERE match_record.state NOT IN ('cancelled', 'completed', 'forfeit')
        AND ($2::boolean OR EXISTS (
          SELECT 1 FROM match_participants AS viewer
          WHERE viewer.match_id = match_record.id AND viewer.user_id = $1
        ))
      GROUP BY match_record.id, game.name, game.filter_value
      ORDER BY match_record.scheduled_at ASC
      LIMIT 50
    `,
    [userId, elevated],
  );

  const tones: Record<string, MatchListItem["tone"]> = {
    "ea-fc": "green",
    "cod-mobile": "orange",
    "clash-royale": "blue",
    "league-of-legends": "purple",
  };
  return result.rows.map((row) => ({
    id: row.id,
    time:
      row.state === "in-progress"
        ? "LIVE"
        : toDate(row.scheduled_at).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "UTC",
          }),
    live: row.state === "in-progress",
    match: `${row.home_name} vs ${row.away_name}`,
    game: row.game_name,
    tone: tones[row.game_filter] ?? "green",
    detail: row.format_label,
    ranks: `${row.home_rank} vs ${row.away_rank}`,
  }));
}

export async function getNextMatchForUser(userId: string, role: PlatformRole) {
  const result = await queryDatabase<QueryResultRow & { id: string }>(
    `
      SELECT match_record.id
      FROM matches AS match_record
      JOIN match_participants AS participant ON participant.match_id = match_record.id
      WHERE participant.user_id = $1
        AND match_record.state NOT IN ('cancelled', 'completed', 'forfeit')
      ORDER BY match_record.scheduled_at ASC
      LIMIT 1
    `,
    [userId],
  );
  const row = result.rows[0];
  if (!row) return null;
  return loadMatchContextWith(
    { query: queryDatabase as Queryable["query"] },
    row.id,
    userId,
    role,
  );
}

export function playNextMatchPayload(context: MatchContext) {
  const current = context.currentParticipant;
  const opponent = context.opponentParticipant;
  if (!current || !opponent) return null;
  const state = resolveMatchState(context);
  const status =
    state === "check-in-open"
      ? "check_in_open"
      : state === "checked-in" || state === "both-ready" || state === "lobby-open"
        ? "checked_in"
        : state === "in-progress" || state === "submit-result"
          ? "in_progress"
          : state === "completed" || state === "result-confirmed"
            ? "completed"
            : state === "cancelled" || state === "forfeit"
              ? "cancelled"
              : toDate(context.match.match_starts_at).getTime() - Date.now() <= 15 * 60 * 1000
                ? "starting_soon"
                : "scheduled";
  const mapParticipant = (participant: ParticipantRow, isCurrentPlayer: boolean) => ({
    player_id: participant.user_id,
    handle: participant.handle,
    avatar_url: participant.avatar_url,
    rank: /^#?(\d+)$/u.test(participant.rank_label)
      ? Number(participant.rank_label.replace("#", ""))
      : null,
    location_label: participant.country_code ?? "GLOBAL",
    is_current_player: isCurrentPlayer,
  });
  return {
    match_id: context.match.id,
    competition_id: context.match.competition_id ?? context.match.id,
    competition_name: context.match.competition_name ?? "Scheduled match",
    game: context.match.game_name,
    format: context.match.format_label,
    status,
    starts_at: iso(toDate(context.match.match_starts_at)),
    check_in_opens_at: iso(toDate(context.match.check_in_opens_at)),
    check_in_closes_at: iso(toDate(context.match.check_in_closes_at)),
    server_now: nowIso(),
    self: mapParticipant(current, true),
    opponent: mapParticipant(opponent, false),
  };
}

export function playCheckInPayload(context: MatchContext) {
  const state = resolveMatchState(context);
  const current = context.currentParticipant;
  const checkInState = current?.checked_in_at
    ? "checked_in"
    : state === "check-in-open"
      ? "open"
      : new Date() >= toDate(context.match.check_in_closes_at)
        ? "closed"
        : "unavailable";
  return {
    match_id: context.match.id,
    state: checkInState,
    opens_at: iso(toDate(context.match.check_in_opens_at)),
    closes_at: iso(toDate(context.match.check_in_closes_at)),
    checked_in_at: current?.checked_in_at ? iso(toDate(current.checked_in_at)) : null,
    server_now: nowIso(),
    can_check_in: checkInState === "open",
    mutation_key: checkInState === "open" ? createHash("sha256").update(`${context.match.id}:${context.match.version}`).digest("hex") : null,
  };
}
