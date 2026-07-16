import { competitionDiscoveryMock } from "../mocks/competition-discovery.mock";
import { competitionDiscoveryFilterOptionsFallback } from "../model/competition-discovery.constants";
import {
  COMPETITION_DISCOVERY_PAGE_SIZE,
  paginateCompetitionDiscoveryItems,
  parseCompetitionDiscoverySearchParams,
} from "../model/competition-discovery.query";
import type {
  CompetitionDiscoveryItem,
  CompetitionDiscoveryScenario,
  FeaturedCompetitionViewModel,
} from "../model/competition-discovery.types";

export type CompetitionDiscoveryResourceName = "featured" | "list" | "metadata" | "current-entry";

const serverNow = "2026-07-19T12:00:00.000Z";
const freshUpdatedAt = "2026-07-19T11:59:30.000Z";
const staleUpdatedAt = "2026-07-19T10:30:00.000Z";

function requestId(resource: CompetitionDiscoveryResourceName) {
  return `mock-competition-${resource}-${globalThis.crypto.randomUUID()}`;
}

function failure(
  resource: CompetitionDiscoveryResourceName,
  status: number,
  code: string,
  message: string,
  retryable: boolean,
) {
  return {
    status,
    body: {
      ok: false,
      error: {
        code,
        message,
        request_id: requestId(resource),
        retryable,
        field_errors: {},
      },
    },
  };
}

function success(
  resource: CompetitionDiscoveryResourceName,
  scenario: CompetitionDiscoveryScenario,
  data: unknown,
) {
  return {
    status: 200,
    body: {
      ok: true,
      data,
      request_id: requestId(resource),
      meta: {
        server_now: serverNow,
        last_updated_at: scenario === "stale" ? staleUpdatedAt : freshUpdatedAt,
        freshness: scenario === "stale" ? "stale" : "fresh",
      },
    },
  };
}

function featuredRaw(featured: FeaturedCompetitionViewModel) {
  return {
    competition_id: featured.id,
    eyebrow: featured.eyebrow,
    name: featured.name,
    season_label: featured.seasonLabel,
    week_label: featured.weekLabel,
    game_label: featured.gameLabel,
    format_label: featured.formatLabel,
    prize_pool_label: featured.prizePoolLabel,
    reward_note: featured.rewardNote,
    countdown_label: featured.countdownLabel,
    status_label: featured.statusLabel,
    art_key: featured.artKey,
  };
}

function itemRaw(item: CompetitionDiscoveryItem) {
  return {
    competition_id: item.id,
    name: item.name,
    game: item.game,
    game_filter_value: item.gameFilterValue,
    team_size: item.teamSize,
    format: item.format,
    state: item.state,
    status_label: item.statusLabel,
    capacity_label: item.capacityLabel,
    timing_label: item.timingLabel,
    prize_pool_label: item.prizePoolLabel ?? null,
    entry_fee_label: item.entryFeeLabel,
    entry_fee_type: item.entryFeeType,
    popularity: item.popularity,
    starts_at_order: item.startsAtOrder,
    prize_value: item.prizeValue,
    remaining_capacity: item.remainingCapacity,
    search_terms: item.searchTerms,
    art_key: item.artKey,
  };
}

function scenarioFailure(
  resource: CompetitionDiscoveryResourceName,
  scenario: CompetitionDiscoveryScenario,
) {
  switch (scenario) {
    case "offline":
      return failure(resource, 503, "offline", "Competition discovery is offline.", true);
    case "maintenance":
      return failure(
        resource,
        503,
        "maintenance",
        "Competition discovery is under maintenance.",
        true,
      );
    case "unauthorized":
      return failure(resource, 401, "unauthorized", "Sign in before browsing competitions.", false);
    case "forbidden":
      return failure(resource, 403, "forbidden", "Competition access is restricted.", false);
    case "partial_failure":
      return resource === "current-entry"
        ? failure(resource, 503, "upstream_unavailable", "Entry status is unavailable.", true)
        : null;
    default:
      return null;
  }
}

export function getMockCompetitionDiscoveryResource(
  resource: CompetitionDiscoveryResourceName,
  scenario: CompetitionDiscoveryScenario,
  searchParams: URLSearchParams = new URLSearchParams(),
) {
  const forcedFailure = scenarioFailure(resource, scenario);
  if (forcedFailure) return forcedFailure;

  if (scenario === "malformed" && resource === "list") {
    return success(resource, scenario, { items: "invalid-list-shape" });
  }

  if (resource === "featured") {
    return success(
      resource,
      scenario,
      scenario === "empty" ? null : featuredRaw(competitionDiscoveryMock.featured),
    );
  }

  if (resource === "list") {
    const filters = parseCompetitionDiscoverySearchParams(searchParams);
    const source = scenario === "empty" ? [] : competitionDiscoveryMock.competitions;
    const result = paginateCompetitionDiscoveryItems(
      source,
      filters,
      COMPETITION_DISCOVERY_PAGE_SIZE,
    );

    return success(resource, scenario, {
      items: result.items.map(itemRaw),
      page: result.page,
      page_count: result.pageCount,
      total: result.total,
      has_previous_page: result.hasPreviousPage,
      has_next_page: result.hasNextPage,
    });
  }

  if (resource === "metadata") {
    return success(resource, scenario, {
      journey: competitionDiscoveryMock.journey,
      guide_links: competitionDiscoveryMock.guideLinks,
      filter_options: {
        tabs: competitionDiscoveryFilterOptionsFallback.tabs,
        games: competitionDiscoveryFilterOptionsFallback.games,
        team_sizes: competitionDiscoveryFilterOptionsFallback.teamSizes,
        entry_fees: competitionDiscoveryFilterOptionsFallback.entryFees,
        sorts: competitionDiscoveryFilterOptionsFallback.sorts,
      },
    });
  }

  return success(
    resource,
    scenario,
    scenario === "empty"
      ? null
      : {
          entry_id: competitionDiscoveryMock.entry.id,
          competition_name: competitionDiscoveryMock.entry.competitionName,
          state_label: competitionDiscoveryMock.entry.stateLabel,
          team_label: competitionDiscoveryMock.entry.teamLabel,
          status_label: competitionDiscoveryMock.entry.statusLabel,
        },
  );
}
