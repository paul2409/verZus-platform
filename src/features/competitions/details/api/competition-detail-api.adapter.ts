import {
  competitionBracketSchema,
  competitionDetailResourceDataSchema,
  competitionEligibilitySchema,
  competitionParticipantsSchema,
  competitionRewardsSchema,
  competitionRulesSchema,
  competitionScheduleSchema,
  competitionSummarySchema,
} from "../model/competition-detail.schema";
import type {
  CompetitionBracketViewModel,
  CompetitionDetailResourceData,
  CompetitionEligibilityViewModel,
  CompetitionParticipantsViewModel,
  CompetitionRewardsViewModel,
  CompetitionRulesViewModel,
  CompetitionScheduleViewModel,
  CompetitionSummaryViewModel,
} from "../model/competition-detail.types";
import {
  type CompetitionDetailApiErrorRaw,
  competitionDetailResponseSchemas,
} from "./competition-detail-api.schema";

export class CompetitionDetailApiClientError extends Error {
  readonly code: string;
  readonly requestId: string;
  readonly retryable: boolean;

  constructor(input: { code: string; message: string; requestId: string; retryable: boolean }) {
    super(input.message);
    this.name = "CompetitionDetailApiClientError";
    this.code = input.code;
    this.requestId = input.requestId;
    this.retryable = input.retryable;
  }
}

function failure(error: CompetitionDetailApiErrorRaw) {
  return new CompetitionDetailApiClientError({
    code: error.code,
    message: error.message,
    requestId: error.request_id,
    retryable: error.retryable,
  });
}

function invalid(resource: string) {
  return new CompetitionDetailApiClientError({
    code: "invalid_response",
    message: `The competition ${resource} resource returned invalid data.`,
    requestId: `competition-detail-invalid-${resource}`,
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

export function adaptCompetitionSummary(
  payload: unknown,
): CompetitionDetailResourceData<CompetitionSummaryViewModel> {
  const parsed = competitionDetailResponseSchemas.summary.safeParse(payload);
  if (!parsed.success) throw invalid("summary");
  if (!parsed.data.ok) throw failure(parsed.data.error);
  const raw = parsed.data.data;
  return competitionDetailResourceDataSchema(competitionSummarySchema).parse({
    value: {
      id: raw.competition_id,
      eyebrow: raw.eyebrow,
      name: raw.name,
      description: raw.description,
      statusLabel: raw.status_label,
      seasonLabel: raw.season_label,
      weekLabel: raw.week_label,
      gameLabel: raw.game_label,
      formatLabel: raw.format_label,
      regionLabel: raw.region_label,
      teamSizeLabel: raw.team_size_label,
      capacityLabel: raw.capacity_label,
      entryFeeLabel: raw.entry_fee_label,
      prizePoolLabel: raw.prize_pool_label,
      rewardNote: raw.reward_note,
      countdownLabel: raw.countdown_label,
      artKey: raw.art_key,
      tags: raw.tags,
    },
    meta: adaptMeta(parsed.data.request_id, parsed.data.meta),
  });
}

export function adaptCompetitionEligibility(
  payload: unknown,
): CompetitionDetailResourceData<CompetitionEligibilityViewModel> {
  const parsed = competitionDetailResponseSchemas.eligibility.safeParse(payload);
  if (!parsed.success) throw invalid("eligibility");
  if (!parsed.data.ok) throw failure(parsed.data.error);
  return competitionDetailResourceDataSchema(competitionEligibilitySchema).parse({
    value: parsed.data.data,
    meta: adaptMeta(parsed.data.request_id, parsed.data.meta),
  });
}

export function adaptCompetitionSchedule(
  payload: unknown,
): CompetitionDetailResourceData<CompetitionScheduleViewModel> {
  const parsed = competitionDetailResponseSchemas.schedule.safeParse(payload);
  if (!parsed.success) throw invalid("schedule");
  if (!parsed.data.ok) throw failure(parsed.data.error);
  return competitionDetailResourceDataSchema(competitionScheduleSchema).parse({
    value: {
      timezoneLabel: parsed.data.data.timezone_label,
      stages: parsed.data.data.stages.map((stage) => ({
        id: stage.id,
        label: stage.label,
        dateLabel: stage.date_label,
        timeLabel: stage.time_label,
        status: stage.status,
      })),
    },
    meta: adaptMeta(parsed.data.request_id, parsed.data.meta),
  });
}

export function adaptCompetitionRewards(
  payload: unknown,
): CompetitionDetailResourceData<CompetitionRewardsViewModel> {
  const parsed = competitionDetailResponseSchemas.rewards.safeParse(payload);
  if (!parsed.success) throw invalid("rewards");
  if (!parsed.data.ok) throw failure(parsed.data.error);
  return competitionDetailResourceDataSchema(competitionRewardsSchema).parse({
    value: {
      prizePoolLabel: parsed.data.data.prize_pool_label,
      rewardNote: parsed.data.data.reward_note,
      breakdown: parsed.data.data.breakdown.map((item) => ({
        id: item.id,
        label: item.label,
        valueLabel: item.value_label,
      })),
    },
    meta: adaptMeta(parsed.data.request_id, parsed.data.meta),
  });
}

export function adaptCompetitionRules(
  payload: unknown,
): CompetitionDetailResourceData<CompetitionRulesViewModel> {
  const parsed = competitionDetailResponseSchemas.rules.safeParse(payload);
  if (!parsed.success) throw invalid("rules");
  if (!parsed.data.ok) throw failure(parsed.data.error);
  return competitionDetailResourceDataSchema(competitionRulesSchema).parse({
    value: {
      updatedLabel: parsed.data.data.updated_label,
      sections: parsed.data.data.sections,
    },
    meta: adaptMeta(parsed.data.request_id, parsed.data.meta),
  });
}

export function adaptCompetitionParticipants(
  payload: unknown,
): CompetitionDetailResourceData<CompetitionParticipantsViewModel> {
  const parsed = competitionDetailResponseSchemas.participants.safeParse(payload);
  if (!parsed.success) throw invalid("participants");
  if (!parsed.data.ok) throw failure(parsed.data.error);
  return competitionDetailResourceDataSchema(competitionParticipantsSchema).parse({
    value: {
      totalLabel: parsed.data.data.total_label,
      confirmedLabel: parsed.data.data.confirmed_label,
      participants: parsed.data.data.participants.map((participant) => ({
        id: participant.participant_id,
        seed: participant.seed,
        name: participant.name,
        tag: participant.tag,
        statusLabel: participant.status_label,
        avatarInitials: participant.avatar_initials,
      })),
    },
    meta: adaptMeta(parsed.data.request_id, parsed.data.meta),
  });
}

export function adaptCompetitionBracket(
  payload: unknown,
): CompetitionDetailResourceData<CompetitionBracketViewModel> {
  const parsed = competitionDetailResponseSchemas.bracket.safeParse(payload);
  if (!parsed.success) throw invalid("bracket");
  if (!parsed.data.ok) throw failure(parsed.data.error);
  return competitionDetailResourceDataSchema(competitionBracketSchema).parse({
    value: {
      statusLabel: parsed.data.data.status_label,
      rounds: parsed.data.data.rounds.map((round) => ({
        id: round.id,
        label: round.label,
        matches: round.matches.map((match) => ({
          id: match.id,
          leftLabel: match.left_label,
          rightLabel: match.right_label,
          scoreLabel: match.score_label,
          state: match.state,
        })),
      })),
    },
    meta: adaptMeta(parsed.data.request_id, parsed.data.meta),
  });
}
