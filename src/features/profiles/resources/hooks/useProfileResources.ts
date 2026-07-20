// VERZUS M11.4 INDEPENDENT PROFILE QUERY HOOKS

"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { ProfileResourceError } from "../adapter/profile-resource.adapter";
import {
  profileAvailabilityQueryOptions,
  profileCompetitiveSummaryQueryOptions,
  profileCrewQueryOptions,
  profileIdentityQueryOptions,
} from "../api/profile-resource.query";
import type {
  ProfileResourceHealth,
  ProfileResourceHealthState,
  ProfileResourceName,
  ProfileResourceScenario,
  ProfileResourceSnapshotMap,
} from "../model/profile-resource.types";

function scenarioFor(
  resource: ProfileResourceName,
  target: ProfileResourceName | undefined,
  scenario: ProfileResourceScenario,
): ProfileResourceScenario {
  return target === resource ? scenario : "normal";
}

function errorState(error: Error | null): ProfileResourceHealthState {
  if (!(error instanceof ProfileResourceError)) return "error";

  switch (error.code) {
    case "PROFILE_RESOURCE_OFFLINE":
      return "offline";
    case "PROFILE_RESOURCE_UNAUTHORIZED":
      return "unauthorized";
    case "PROFILE_RESOURCE_FORBIDDEN":
      return "forbidden";
    case "PROFILE_RESOURCE_NOT_FOUND":
      return "not-found";
    case "PROFILE_RESOURCE_MAINTENANCE":
      return "maintenance";
    default:
      return "error";
  }
}

function healthFromQuery(
  name: ProfileResourceName,
  retrying: boolean,
  query: {
    isPending: boolean;
    isError: boolean;
    error: Error | null;
    data: { data: unknown; meta: { requestId: string; freshness: "fresh" | "stale" } } | undefined;
  },
): ProfileResourceHealth {
  if (retrying) {
    return {
      name,
      state: "retrying",
      code: null,
      requestId: query.data?.meta.requestId ?? null,
      message: "Retrying without clearing confirmed profile data.",
      retryable: false,
    };
  }

  if (query.isPending && !query.data) {
    return { name, state: "loading", code: null, requestId: null, message: null, retryable: true };
  }

  if (query.isError) {
    const error = query.error;
    return {
      name,
      state: errorState(error),
      code: error instanceof ProfileResourceError ? error.code : "PROFILE_RESOURCE_UNKNOWN",
      requestId: error instanceof ProfileResourceError ? error.requestId : null,
      message: error?.message ?? `${name} is unavailable.`,
      retryable: error instanceof ProfileResourceError ? error.retryable : true,
    };
  }

  if (name === "crew" && query.data?.data === null) {
    return {
      name,
      state: "empty",
      code: null,
      requestId: query.data.meta.requestId,
      message: "No Crew membership is currently attached to this profile.",
      retryable: true,
    };
  }

  return {
    name,
    state: query.data?.meta.freshness === "stale" ? "stale" : "success",
    code: null,
    requestId: query.data?.meta.requestId ?? null,
    message: null,
    retryable: true,
  };
}

export function useProfileResources(
  target: ProfileResourceName | undefined,
  scenario: ProfileResourceScenario,
) {
  const [retrying, setRetrying] = useState<Set<ProfileResourceName>>(() => new Set());
  const identity = useQuery(profileIdentityQueryOptions(scenarioFor("identity", target, scenario)));
  const summary = useQuery(
    profileCompetitiveSummaryQueryOptions(scenarioFor("competitive-summary", target, scenario)),
  );
  const crew = useQuery(profileCrewQueryOptions(scenarioFor("crew", target, scenario)));
  const availability = useQuery(
    profileAvailabilityQueryOptions(scenarioFor("availability", target, scenario)),
  );

  const snapshots: ProfileResourceSnapshotMap = {
    ...(identity.data ? { identity: identity.data } : {}),
    ...(summary.data ? { "competitive-summary": summary.data } : {}),
    ...(crew.data ? { crew: crew.data } : {}),
    ...(availability.data ? { availability: availability.data } : {}),
  };

  const health: Record<ProfileResourceName, ProfileResourceHealth> = {
    identity: healthFromQuery("identity", retrying.has("identity"), identity),
    "competitive-summary": healthFromQuery(
      "competitive-summary",
      retrying.has("competitive-summary"),
      summary,
    ),
    crew: healthFromQuery("crew", retrying.has("crew"), crew),
    availability: healthFromQuery("availability", retrying.has("availability"), availability),
  };

  const refetchers = {
    identity: identity.refetch,
    "competitive-summary": summary.refetch,
    crew: crew.refetch,
    availability: availability.refetch,
  } as const;

  const retry = async (resource: ProfileResourceName): Promise<void> => {
    setRetrying((current) => new Set(current).add(resource));
    try {
      await refetchers[resource]();
    } finally {
      setRetrying((current) => {
        const next = new Set(current);
        next.delete(resource);
        return next;
      });
    }
  };

  return { snapshots, health, retry };
}
