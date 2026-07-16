"use client";

import { useQuery } from "@tanstack/react-query";

import { competitionLifecycleQueryOptions } from "../api/competition-lifecycle.query";
import type { CompetitionLifecycleScenario } from "../model/competition-lifecycle.types";

export function useCompetitionLifecycle(
  competitionId: string,
  scenario: CompetitionLifecycleScenario,
) {
  return useQuery(competitionLifecycleQueryOptions(competitionId, scenario));
}
