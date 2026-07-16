import { queryOptions } from "@tanstack/react-query";

import type { CompetitionDetailScenario } from "../model/competition-detail.types";
import { CompetitionDetailApiClientError } from "./competition-detail-api.adapter";
import {
  getCompetitionBracket,
  getCompetitionEligibility,
  getCompetitionParticipants,
  getCompetitionRewards,
  getCompetitionRules,
  getCompetitionSchedule,
  getCompetitionSummary,
  type CompetitionDetailReadRequest,
} from "./competition-detail-api.client";

export const competitionDetailQueryKeys = {
  all: ["competitions", "detail"] as const,
  resource: (id: string, resource: string, scenario: CompetitionDetailScenario) =>
    ["competitions", "detail", id, resource, scenario] as const,
};

function request(
  scenario: CompetitionDetailScenario,
  signal: AbortSignal,
): CompetitionDetailReadRequest {
  return scenario === "normal" ? { signal } : { scenario, signal };
}

function retry(failureCount: number, error: Error) {
  if (failureCount >= 2) return false;
  return error instanceof CompetitionDetailApiClientError ? error.retryable : true;
}

function resourceOptions<TData>(
  id: string,
  resource: string,
  scenario: CompetitionDetailScenario,
  load: (id: string, request: CompetitionDetailReadRequest) => Promise<TData>,
  staleTime: number,
) {
  return queryOptions({
    queryKey: competitionDetailQueryKeys.resource(id, resource, scenario),
    queryFn: ({ signal }) => load(id, request(scenario, signal)),
    staleTime,
    gcTime: 15 * 60_000,
    retry,
  });
}

export const competitionSummaryQueryOptions = (id: string, scenario: CompetitionDetailScenario) =>
  resourceOptions(id, "summary", scenario, getCompetitionSummary, 60_000);
export const competitionEligibilityQueryOptions = (
  id: string,
  scenario: CompetitionDetailScenario,
) => resourceOptions(id, "eligibility", scenario, getCompetitionEligibility, 20_000);
export const competitionScheduleQueryOptions = (id: string, scenario: CompetitionDetailScenario) =>
  resourceOptions(id, "schedule", scenario, getCompetitionSchedule, 30_000);
export const competitionRewardsQueryOptions = (id: string, scenario: CompetitionDetailScenario) =>
  resourceOptions(id, "rewards", scenario, getCompetitionRewards, 2 * 60_000);
export const competitionRulesQueryOptions = (id: string, scenario: CompetitionDetailScenario) =>
  resourceOptions(id, "rules", scenario, getCompetitionRules, 10 * 60_000);
export const competitionParticipantsQueryOptions = (
  id: string,
  scenario: CompetitionDetailScenario,
) => resourceOptions(id, "participants", scenario, getCompetitionParticipants, 30_000);
export const competitionBracketQueryOptions = (id: string, scenario: CompetitionDetailScenario) =>
  resourceOptions(id, "bracket", scenario, getCompetitionBracket, 30_000);
