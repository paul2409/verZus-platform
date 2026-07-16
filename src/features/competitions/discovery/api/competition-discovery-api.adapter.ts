import {
  competitionEntryResourceDataSchema,
  competitionListResourceDataSchema,
  competitionMetadataResourceDataSchema,
  featuredCompetitionResourceDataSchema,
} from "../model/competition-discovery.schema";
import type {
  CompetitionDiscoveryEntryFee,
  CompetitionDiscoveryGame,
  CompetitionDiscoverySort,
  CompetitionDiscoveryTab,
  CompetitionDiscoveryTeamSize,
  CompetitionEntryResourceData,
  CompetitionListResourceData,
  CompetitionMetadataResourceData,
  FeaturedCompetitionResourceData,
} from "../model/competition-discovery.types";
import {
  competitionDiscoveryListResponseSchema,
  competitionDiscoveryMetadataResponseSchema,
  currentCompetitionEntryResponseSchema,
  featuredCompetitionResponseSchema,
  type CompetitionDiscoveryApiErrorRaw,
} from "./competition-discovery-api.schema";

export class CompetitionDiscoveryApiClientError extends Error {
  readonly code: string;
  readonly requestId: string;
  readonly retryable: boolean;
  readonly fieldErrors: Record<string, string[]>;

  constructor(input: {
    code: string;
    message: string;
    requestId: string;
    retryable: boolean;
    fieldErrors?: Record<string, string[]>;
  }) {
    super(input.message);
    this.name = "CompetitionDiscoveryApiClientError";
    this.code = input.code;
    this.requestId = input.requestId;
    this.retryable = input.retryable;
    this.fieldErrors = input.fieldErrors ?? {};
  }
}

function apiFailure(error: CompetitionDiscoveryApiErrorRaw): CompetitionDiscoveryApiClientError {
  return new CompetitionDiscoveryApiClientError({
    code: error.code,
    message: error.message,
    requestId: error.request_id,
    retryable: error.retryable,
    fieldErrors: error.field_errors,
  });
}

function invalidResponse(resource: string): CompetitionDiscoveryApiClientError {
  return new CompetitionDiscoveryApiClientError({
    code: "invalid_response",
    message: `The competition ${resource} service returned an invalid response.`,
    requestId: `competition-client-invalid-${resource}`,
    retryable: true,
  });
}

function adaptMeta(
  requestId: string,
  meta: { server_now: string; last_updated_at: string; freshness: "fresh" | "stale" },
) {
  return {
    requestId,
    serverNow: meta.server_now,
    lastUpdatedAt: meta.last_updated_at,
    freshness: meta.freshness,
  } as const;
}

export function adaptFeaturedCompetitionPayload(payload: unknown): FeaturedCompetitionResourceData {
  const parsed = featuredCompetitionResponseSchema.safeParse(payload);
  if (!parsed.success) throw invalidResponse("featured");
  if (!parsed.data.ok) throw apiFailure(parsed.data.error);

  const raw = parsed.data.data;
  return featuredCompetitionResourceDataSchema.parse({
    competition: raw
      ? {
          id: raw.competition_id,
          eyebrow: raw.eyebrow,
          name: raw.name,
          seasonLabel: raw.season_label,
          weekLabel: raw.week_label,
          gameLabel: raw.game_label,
          formatLabel: raw.format_label,
          prizePoolLabel: raw.prize_pool_label,
          rewardNote: raw.reward_note,
          countdownLabel: raw.countdown_label,
          statusLabel: raw.status_label,
          artKey: raw.art_key,
        }
      : null,
    meta: adaptMeta(parsed.data.request_id, parsed.data.meta),
  });
}

export function adaptCompetitionDiscoveryListPayload(
  payload: unknown,
): CompetitionListResourceData {
  const parsed = competitionDiscoveryListResponseSchema.safeParse(payload);
  if (!parsed.success) throw invalidResponse("discovery-list");
  if (!parsed.data.ok) throw apiFailure(parsed.data.error);

  return competitionListResourceDataSchema.parse({
    items: parsed.data.data.items.map((raw) => ({
      id: raw.competition_id,
      name: raw.name,
      game: raw.game,
      gameFilterValue: raw.game_filter_value,
      teamSize: raw.team_size,
      format: raw.format,
      state: raw.state,
      statusLabel: raw.status_label,
      capacityLabel: raw.capacity_label,
      timingLabel: raw.timing_label,
      ...(raw.prize_pool_label ? { prizePoolLabel: raw.prize_pool_label } : {}),
      entryFeeLabel: raw.entry_fee_label,
      entryFeeType: raw.entry_fee_type,
      popularity: raw.popularity,
      startsAtOrder: raw.starts_at_order,
      prizeValue: raw.prize_value,
      remainingCapacity: raw.remaining_capacity,
      searchTerms: raw.search_terms,
      artKey: raw.art_key,
    })),
    page: parsed.data.data.page,
    pageCount: parsed.data.data.page_count,
    total: parsed.data.data.total,
    hasPreviousPage: parsed.data.data.has_previous_page,
    hasNextPage: parsed.data.data.has_next_page,
    meta: adaptMeta(parsed.data.request_id, parsed.data.meta),
  });
}

export function adaptCompetitionDiscoveryMetadataPayload(
  payload: unknown,
): CompetitionMetadataResourceData {
  const parsed = competitionDiscoveryMetadataResponseSchema.safeParse(payload);
  if (!parsed.success) throw invalidResponse("metadata");
  if (!parsed.data.ok) throw apiFailure(parsed.data.error);

  const options = parsed.data.data.filter_options;
  return competitionMetadataResourceDataSchema.parse({
    journey: parsed.data.data.journey,
    guideLinks: parsed.data.data.guide_links,
    filterOptions: {
      tabs: options.tabs as Array<{ value: CompetitionDiscoveryTab; label: string }>,
      games: options.games as Array<{ value: CompetitionDiscoveryGame; label: string }>,
      teamSizes: options.team_sizes as Array<{
        value: CompetitionDiscoveryTeamSize;
        label: string;
      }>,
      entryFees: options.entry_fees as Array<{
        value: CompetitionDiscoveryEntryFee;
        label: string;
      }>,
      sorts: options.sorts as Array<{ value: CompetitionDiscoverySort; label: string }>,
    },
    meta: adaptMeta(parsed.data.request_id, parsed.data.meta),
  }) as CompetitionMetadataResourceData;
}

export function adaptCurrentCompetitionEntryPayload(
  payload: unknown,
): CompetitionEntryResourceData {
  const parsed = currentCompetitionEntryResponseSchema.safeParse(payload);
  if (!parsed.success) throw invalidResponse("current-entry");
  if (!parsed.data.ok) throw apiFailure(parsed.data.error);

  const raw = parsed.data.data;
  return competitionEntryResourceDataSchema.parse({
    entry: raw
      ? {
          id: raw.entry_id,
          competitionName: raw.competition_name,
          stateLabel: raw.state_label,
          teamLabel: raw.team_label,
          statusLabel: raw.status_label,
        }
      : null,
    meta: adaptMeta(parsed.data.request_id, parsed.data.meta),
  });
}
