"use client";

// VERZUS M9.4 INDEPENDENT CREW QUERY HOOKS

import { useQuery } from "@tanstack/react-query";

import { CrewResourceError } from "../adapter/crew-resource.adapter";
import {
  crewAchievementsQueryOptions,
  crewActivityQueryOptions,
  crewProfileQueryOptions,
  crewRankingsQueryOptions,
  crewRequestsQueryOptions,
  crewRosterQueryOptions,
  crewSettingsQueryOptions,
} from "../api/crew-resource.query";
import type {
  CrewResourceHealth,
  CrewResourceName,
  CrewResourceScenario,
  CrewResourceSnapshotMap,
} from "../model/crew-resource.types";

function scenarioFor(
  resource: CrewResourceName,
  target: CrewResourceName | undefined,
  scenario: CrewResourceScenario,
): CrewResourceScenario {
  return target === resource ? scenario : "normal";
}

function healthFromQuery(
  name: CrewResourceName,
  query: {
    isPending: boolean;
    isError: boolean;
    error: Error | null;
    data: { meta: { requestId: string; freshness: "fresh" | "stale" } } | undefined;
  },
): CrewResourceHealth {
  if (query.isPending && !query.data) {
    return { name, state: "loading", requestId: null, message: null, retryable: true };
  }

  if (query.isError) {
    const error = query.error;
    return {
      name,
      state: "error",
      requestId: error instanceof CrewResourceError ? error.requestId : null,
      message: error?.message ?? `${name} is unavailable.`,
      retryable: error instanceof CrewResourceError ? error.retryable : true,
    };
  }

  return {
    name,
    state: query.data?.meta.freshness === "stale" ? "stale" : "success",
    requestId: query.data?.meta.requestId ?? null,
    message: null,
    retryable: true,
  };
}

export function useCrewResources(
  crewId: string,
  target: CrewResourceName | undefined,
  scenario: CrewResourceScenario,
) {
  const profile = useQuery(
    crewProfileQueryOptions(crewId, scenarioFor("profile", target, scenario)),
  );
  const roster = useQuery(crewRosterQueryOptions(crewId, scenarioFor("roster", target, scenario)));
  const requests = useQuery(
    crewRequestsQueryOptions(crewId, scenarioFor("requests", target, scenario)),
  );
  const activity = useQuery(
    crewActivityQueryOptions(crewId, scenarioFor("activity", target, scenario)),
  );
  const rankings = useQuery(
    crewRankingsQueryOptions(crewId, scenarioFor("rankings", target, scenario)),
  );
  const achievements = useQuery(
    crewAchievementsQueryOptions(crewId, scenarioFor("achievements", target, scenario)),
  );
  const settings = useQuery(
    crewSettingsQueryOptions(crewId, scenarioFor("settings", target, scenario)),
  );

  const snapshots: CrewResourceSnapshotMap = {
    ...(profile.data ? { profile: profile.data } : {}),
    ...(roster.data ? { roster: roster.data } : {}),
    ...(requests.data ? { requests: requests.data } : {}),
    ...(activity.data ? { activity: activity.data } : {}),
    ...(rankings.data ? { rankings: rankings.data } : {}),
    ...(achievements.data ? { achievements: achievements.data } : {}),
    ...(settings.data ? { settings: settings.data } : {}),
  };

  const health: Record<CrewResourceName, CrewResourceHealth> = {
    profile: healthFromQuery("profile", profile),
    roster: healthFromQuery("roster", roster),
    requests: healthFromQuery("requests", requests),
    activity: healthFromQuery("activity", activity),
    rankings: healthFromQuery("rankings", rankings),
    achievements: healthFromQuery("achievements", achievements),
    settings: healthFromQuery("settings", settings),
  };

  const refetchers = {
    profile: profile.refetch,
    roster: roster.refetch,
    requests: requests.refetch,
    activity: activity.refetch,
    rankings: rankings.refetch,
    achievements: achievements.refetch,
    settings: settings.refetch,
  } as const;

  return {
    snapshots,
    health,
    retry: async (resource: CrewResourceName) => {
      await refetchers[resource]();
    },
  };
}
