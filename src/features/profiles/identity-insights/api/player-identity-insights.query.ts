// VERZUS M11.6 PROFILE INSIGHT QUERY OPTIONS

import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import type {
  ProfileAchievementCategoryFilter,
  ProfileAchievementStateFilter,
  ProfileInsightScenario,
} from "../model/player-identity-insights.types";
import {
  getProfileAchievements,
  getProfileGameIdentities,
  getProfileTrustHistory,
} from "./player-identity-insights.client";

export const profileInsightKeys = {
  all: ["profile", "identity-insights"] as const,
  achievements: (input: {
    category: ProfileAchievementCategoryFilter;
    state: ProfileAchievementStateFilter;
    page: number;
    scenario: ProfileInsightScenario;
  }) => [...profileInsightKeys.all, "achievements", input] as const,
  gameIdentities: (input: { scenario: ProfileInsightScenario }) =>
    [...profileInsightKeys.all, "game-identities", input] as const,
  trustHistory: (input: { page: number; scenario: ProfileInsightScenario }) =>
    [...profileInsightKeys.all, "trust-history", input] as const,
};

export function profileAchievementsQueryOptions(input: {
  category: ProfileAchievementCategoryFilter;
  state: ProfileAchievementStateFilter;
  page: number;
  scenario: ProfileInsightScenario;
}) {
  return queryOptions({
    queryKey: profileInsightKeys.achievements(input),
    queryFn: ({ signal }) => getProfileAchievements({ ...input, signal }),
    staleTime: 60_000,
    gcTime: 15 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
}

export function profileGameIdentitiesQueryOptions(input: { scenario: ProfileInsightScenario }) {
  return queryOptions({
    queryKey: profileInsightKeys.gameIdentities(input),
    queryFn: ({ signal }) => getProfileGameIdentities({ ...input, signal }),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
}

export function profileTrustHistoryQueryOptions(input: {
  page: number;
  scenario: ProfileInsightScenario;
}) {
  return queryOptions({
    queryKey: profileInsightKeys.trustHistory(input),
    queryFn: ({ signal }) => getProfileTrustHistory({ ...input, signal }),
    staleTime: 60_000,
    gcTime: 15 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
}
