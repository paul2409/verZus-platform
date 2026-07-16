import { queryOptions } from "@tanstack/react-query";

import type { CompetitionEntryScenario } from "../model/competition-entry.types";
import { CompetitionEntryApiClientError } from "./competition-entry-api.adapter";
import { getCompetitionEntryControl } from "./competition-entry-api.client";

export const competitionEntryQueryKeys = {
  all: ["competitions", "entry"] as const,
  control: (competitionId: string, scenario: CompetitionEntryScenario) =>
    ["competitions", "entry", competitionId, scenario] as const,
};

export function competitionEntryControlQueryOptions(
  competitionId: string,
  scenario: CompetitionEntryScenario,
) {
  return queryOptions({
    queryKey: competitionEntryQueryKeys.control(competitionId, scenario),
    queryFn: ({ signal }) =>
      getCompetitionEntryControl(competitionId, {
        ...(scenario === "normal" ? {} : { scenario }),
        signal,
      }),
    staleTime: 15_000,
    gcTime: 10 * 60_000,
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      return error instanceof CompetitionEntryApiClientError ? error.retryable : true;
    },
  });
}
