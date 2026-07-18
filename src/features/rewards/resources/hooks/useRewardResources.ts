"use client";

// VERZUS M10.3 INDEPENDENT REWARD QUERY HOOKS
// VERZUS M10.7 EXPLICIT RETRY AND EDGE-STATE HEALTH

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { RewardResourceError } from "../adapter/reward-resource.adapter";
import {
  rewardAchievementsQueryOptions,
  rewardHistoryQueryOptions,
  rewardInventoryQueryOptions,
  rewardProgressQueryOptions,
  rewardSeasonQueryOptions,
} from "../api/reward-resource.query";
import type {
  RewardResourceHealth,
  RewardResourceHealthState,
  RewardResourceName,
  RewardResourceScenario,
  RewardResourceSnapshotMap,
} from "../model/reward-resource.types";

function scenarioFor(
  resource: RewardResourceName,
  target: RewardResourceName | undefined,
  scenario: RewardResourceScenario,
): RewardResourceScenario {
  return target === resource ? scenario : "normal";
}

function errorState(error: Error | null): RewardResourceHealthState {
  if (!(error instanceof RewardResourceError)) return "error";

  switch (error.code) {
    case "REWARD_RESOURCE_OFFLINE":
      return "offline";
    case "REWARD_RESOURCE_UNAUTHORIZED":
      return "unauthorized";
    case "REWARD_RESOURCE_FORBIDDEN":
      return "forbidden";
    case "REWARD_RESOURCE_NOT_FOUND":
      return "not-found";
    case "REWARD_RESOURCE_MAINTENANCE":
      return "maintenance";
    default:
      return "error";
  }
}

function healthFromQuery(
  name: RewardResourceName,
  retrying: boolean,
  query: {
    isPending: boolean;
    isError: boolean;
    error: Error | null;
    data:
      | {
          data: { items?: unknown[]; claimableRewards?: unknown[]; season?: unknown };
          meta: { requestId: string; freshness: "fresh" | "stale" };
        }
      | undefined;
  },
): RewardResourceHealth {
  if (retrying) {
    return {
      name,
      state: "retrying",
      code: null,
      requestId: query.data?.meta.requestId ?? null,
      message: "Retrying this resource without clearing confirmed data.",
      retryable: false,
    };
  }

  if (query.isPending && !query.data) {
    return {
      name,
      state: "loading",
      code: null,
      requestId: null,
      message: null,
      retryable: true,
    };
  }

  if (query.isError) {
    const error = query.error;
    return {
      name,
      state: errorState(error),
      code: error instanceof RewardResourceError ? error.code : "REWARD_RESOURCE_UNKNOWN",
      requestId: error instanceof RewardResourceError ? error.requestId : null,
      message: error?.message ?? `${name} is unavailable.`,
      retryable: error instanceof RewardResourceError ? error.retryable : true,
    };
  }

  const collection = query.data?.data.items ?? query.data?.data.claimableRewards;
  if (query.data?.data.season === null || (Array.isArray(collection) && collection.length === 0)) {
    return {
      name,
      state: "empty",
      code: null,
      requestId: query.data?.meta.requestId ?? null,
      message: null,
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

export function useRewardResources(
  target: RewardResourceName | undefined,
  scenario: RewardResourceScenario,
) {
  const [retrying, setRetrying] = useState<Set<RewardResourceName>>(() => new Set());
  const progress = useQuery(rewardProgressQueryOptions(scenarioFor("progress", target, scenario)));
  const season = useQuery(rewardSeasonQueryOptions(scenarioFor("season", target, scenario)));
  const inventory = useQuery(
    rewardInventoryQueryOptions(scenarioFor("inventory", target, scenario)),
  );
  const history = useQuery(rewardHistoryQueryOptions(scenarioFor("history", target, scenario)));
  const achievements = useQuery(
    rewardAchievementsQueryOptions(scenarioFor("achievements", target, scenario)),
  );

  const snapshots: RewardResourceSnapshotMap = {
    ...(progress.data ? { progress: progress.data } : {}),
    ...(season.data ? { season: season.data } : {}),
    ...(inventory.data ? { inventory: inventory.data } : {}),
    ...(history.data ? { history: history.data } : {}),
    ...(achievements.data ? { achievements: achievements.data } : {}),
  };

  const health: Record<RewardResourceName, RewardResourceHealth> = {
    progress: healthFromQuery("progress", retrying.has("progress"), progress),
    season: healthFromQuery("season", retrying.has("season"), season),
    inventory: healthFromQuery("inventory", retrying.has("inventory"), inventory),
    history: healthFromQuery("history", retrying.has("history"), history),
    achievements: healthFromQuery("achievements", retrying.has("achievements"), achievements),
  };

  const refetchers = {
    progress: progress.refetch,
    season: season.refetch,
    inventory: inventory.refetch,
    history: history.refetch,
    achievements: achievements.refetch,
  } as const;

  const retry = async (resource: RewardResourceName): Promise<void> => {
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

  return {
    snapshots,
    health,
    inventoryVersion: inventory.data?.data.version ?? 0,
    retry,
  };
}
