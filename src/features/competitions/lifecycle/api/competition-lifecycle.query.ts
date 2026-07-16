import type { CompetitionLifecycleScenario } from "../model/competition-lifecycle.types";
import {
  CompetitionLifecycleApiClientError,
  getCompetitionLifecycle,
} from "./competition-lifecycle-api.client";

export const competitionLifecycleQueryKeys = {
  all: ["competitions", "lifecycle"] as const,
  detail: (competitionId: string, scenario: CompetitionLifecycleScenario) =>
    [...competitionLifecycleQueryKeys.all, competitionId, scenario] as const,
};

export function competitionLifecycleQueryOptions(
  competitionId: string,
  scenario: CompetitionLifecycleScenario,
) {
  return {
    queryKey: competitionLifecycleQueryKeys.detail(competitionId, scenario),
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      getCompetitionLifecycle(competitionId, scenario, signal),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: (failureCount: number, error: Error) =>
      error instanceof CompetitionLifecycleApiClientError && error.retryable && failureCount < 1,
  };
}
