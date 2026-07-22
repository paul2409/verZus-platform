"use client";

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
  CrewResourceSnapshotMap,
} from "../model/crew-resource.types";

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
    const offline = error instanceof CrewResourceError && error.code === "CREW_RESOURCE_OFFLINE";
    return {
      name,
      state: offline ? "offline" : "error",
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

export function useCrewResources(crewId: string) {
  const profile = useQuery(crewProfileQueryOptions(crewId));
  const roster = useQuery(crewRosterQueryOptions(crewId));
  const requests = useQuery(crewRequestsQueryOptions(crewId));
  const activity = useQuery(crewActivityQueryOptions(crewId));
  const rankings = useQuery(crewRankingsQueryOptions(crewId));
  const achievements = useQuery(crewAchievementsQueryOptions(crewId));
  const settings = useQuery(crewSettingsQueryOptions(crewId));

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
