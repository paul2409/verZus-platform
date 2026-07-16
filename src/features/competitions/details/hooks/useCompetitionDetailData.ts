"use client";

import { useQuery } from "@tanstack/react-query";

import {
  competitionBracketQueryOptions,
  competitionEligibilityQueryOptions,
  competitionParticipantsQueryOptions,
  competitionRewardsQueryOptions,
  competitionRulesQueryOptions,
  competitionScheduleQueryOptions,
  competitionSummaryQueryOptions,
} from "../api";
import type { CompetitionDetailScenario } from "../model/competition-detail.types";
import { competitionDetailResourceFromQuery } from "../ui/competition-detail-resource";

export function useCompetitionDetailData(id: string, scenario: CompetitionDetailScenario) {
  const summary = useQuery(competitionSummaryQueryOptions(id, scenario));
  const eligibility = useQuery(competitionEligibilityQueryOptions(id, scenario));
  const schedule = useQuery(competitionScheduleQueryOptions(id, scenario));
  const rewards = useQuery(competitionRewardsQueryOptions(id, scenario));
  const rules = useQuery(competitionRulesQueryOptions(id, scenario));
  const participants = useQuery(competitionParticipantsQueryOptions(id, scenario));
  const bracket = useQuery(competitionBracketQueryOptions(id, scenario));

  return {
    summary: competitionDetailResourceFromQuery(summary),
    eligibility: competitionDetailResourceFromQuery(eligibility),
    schedule: competitionDetailResourceFromQuery(schedule),
    rewards: competitionDetailResourceFromQuery(rewards),
    rules: competitionDetailResourceFromQuery(rules),
    participants: competitionDetailResourceFromQuery(participants),
    bracket: competitionDetailResourceFromQuery(bracket),
    retrySummary: () => void summary.refetch(),
    retryEligibility: () => void eligibility.refetch(),
    retrySchedule: () => void schedule.refetch(),
    retryRewards: () => void rewards.refetch(),
    retryRules: () => void rules.refetch(),
    retryParticipants: () => void participants.refetch(),
    retryBracket: () => void bracket.refetch(),
  };
}
