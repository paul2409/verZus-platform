// VERZUS M8.6 LEADERBOARD RELIABILITY POLICY

import type { LeaderboardApiClientError } from "../../resources/api/leaderboard-api.adapter";
import type {
  LeaderboardEntriesResourceData,
  LeaderboardResourceScenario,
} from "../../resources/model/leaderboard-resource.types";
import {
  leaderboardReliabilityIntents,
  leaderboardReliabilityResourceNames,
  leaderboardReliabilityTargets,
  type LeaderboardReliabilityIntent,
  type LeaderboardReliabilityQueryInput,
  type LeaderboardReliabilityResourceName,
  type LeaderboardReliabilitySelection,
  type LeaderboardReliabilityTarget,
  type LeaderboardReliabilityView,
  type LeaderboardResourceHealth,
  type LeaderboardResourceScenarioPlan,
} from "./leaderboard-reliability.types";

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isIntent(value: string | undefined): value is LeaderboardReliabilityIntent {
  return leaderboardReliabilityIntents.includes(value as LeaderboardReliabilityIntent);
}

function isTarget(value: string | undefined): value is LeaderboardReliabilityTarget {
  return leaderboardReliabilityTargets.includes(value as LeaderboardReliabilityTarget);
}

function normalPlan(): LeaderboardResourceScenarioPlan {
  return {
    composition: "normal",
    summary: "normal",
    entries: "normal",
    "current-position": "normal",
    rewards: "normal",
    status: "normal",
  };
}

function scenarioForIntent(intent: LeaderboardReliabilityIntent): LeaderboardResourceScenario {
  switch (intent) {
    case "loading":
      return "slow";
    case "empty":
      return "empty";
    case "stale":
      return "stale";
    case "error":
      return "error";
    case "offline":
      return "offline";
    case "unauthorized":
      return "unauthorized";
    case "malformed-row":
      return "malformed-row";
    case "normal":
      return "normal";
  }
}

export function parseLeaderboardReliabilitySelection(
  input: LeaderboardReliabilityQueryInput,
): LeaderboardReliabilitySelection {
  const rawIntent = first(input.reliability);
  const rawTarget = first(input.resource);
  const intent = isIntent(rawIntent) ? rawIntent : "normal";
  const defaultTarget: LeaderboardReliabilityTarget =
    intent === "malformed-row" || intent === "empty" ? "entries" : "all";
  const target = isTarget(rawTarget) ? rawTarget : defaultTarget;
  const scenarios = normalPlan();

  if (intent === "normal") return { intent, target, scenarios };

  if (intent === "empty" && target === "all") {
    scenarios.entries = "empty";
    scenarios["current-position"] = "empty";
    scenarios.rewards = "empty";
    return { intent, target, scenarios };
  }

  if (intent === "malformed-row") {
    scenarios.entries = "malformed-row";
    return { intent, target: "entries", scenarios };
  }

  const scenario = scenarioForIntent(intent);
  if (target === "all") {
    for (const resource of leaderboardReliabilityResourceNames) scenarios[resource] = scenario;
  } else {
    scenarios[target] = scenario;
  }

  return { intent, target, scenarios };
}

export type LeaderboardQueryHealthInput = {
  resource: LeaderboardReliabilityResourceName;
  data: unknown;
  error: unknown;
  isPending: boolean;
  isFetching: boolean;
};

function errorDetails(error: unknown): {
  code: string;
  message: string;
  requestId: string;
  retryable: boolean;
} | null {
  if (!(error instanceof Error)) return null;
  const candidate = error as LeaderboardApiClientError;
  return {
    code: typeof candidate.code === "string" ? candidate.code : "leaderboard_error",
    message: candidate.message,
    requestId:
      typeof candidate.requestId === "string" ? candidate.requestId : "leaderboard-client-error",
    retryable: typeof candidate.retryable === "boolean" ? candidate.retryable : true,
  };
}

function isEmptyResource(resource: LeaderboardReliabilityResourceName, data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  if (resource === "entries") {
    const items = (data as { items?: unknown[] }).items;
    return Array.isArray(items) && items.length === 0;
  }
  if (resource === "current-position") {
    return "entry" in data && (data as { entry?: unknown }).entry === null;
  }
  if (resource === "rewards") {
    const items = (data as { items?: unknown[] }).items;
    return Array.isArray(items) && items.length === 0;
  }
  return false;
}

function isStaleResource(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const candidate = data as {
    freshness?: string;
    meta?: { freshness?: string };
  };
  return candidate.freshness === "stale" || candidate.meta?.freshness === "stale";
}

function isolatedRowCount(data: unknown): number {
  if (!data || typeof data !== "object") return 0;
  const value = (data as { isolatedRowCount?: unknown }).isolatedRowCount;
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function createLeaderboardResourceHealth(
  input: LeaderboardQueryHealthInput,
): LeaderboardResourceHealth {
  const hasData = input.data !== undefined;
  const failure = errorDetails(input.error);

  if (failure) {
    if (hasData) {
      return {
        resource: input.resource,
        state: "stale",
        hasData: true,
        isFetching: input.isFetching,
        retryable: failure.retryable,
        message: "Refresh failed. The last validated snapshot remains visible.",
        requestId: failure.requestId,
      };
    }

    const state =
      failure.code === "offline"
        ? "offline"
        : failure.code === "leaderboard_unauthorized"
          ? "unauthorized"
          : "error";
    return {
      resource: input.resource,
      state,
      hasData: false,
      isFetching: input.isFetching,
      retryable: failure.retryable,
      message: failure.message,
      requestId: failure.requestId,
    };
  }

  if (input.isPending && !hasData) {
    return {
      resource: input.resource,
      state: "loading",
      hasData: false,
      isFetching: true,
      retryable: false,
      message: null,
      requestId: null,
    };
  }

  if (isEmptyResource(input.resource, input.data)) {
    return {
      resource: input.resource,
      state: "empty",
      hasData,
      isFetching: input.isFetching,
      retryable: false,
      message: null,
      requestId: null,
    };
  }

  if (input.resource === "entries" && isolatedRowCount(input.data) > 0) {
    return {
      resource: input.resource,
      state: "degraded",
      hasData,
      isFetching: input.isFetching,
      retryable: false,
      message: "One or more malformed ranking rows were isolated.",
      requestId: null,
    };
  }

  if (isStaleResource(input.data)) {
    return {
      resource: input.resource,
      state: "stale",
      hasData,
      isFetching: input.isFetching,
      retryable: true,
      message: "Showing the last validated leaderboard snapshot.",
      requestId: null,
    };
  }

  return {
    resource: input.resource,
    state: "ready",
    hasData,
    isFetching: input.isFetching,
    retryable: false,
    message: null,
    requestId: null,
  };
}

function countState(
  resources: LeaderboardReliabilityView["resources"],
  state: LeaderboardResourceHealth["state"],
): number {
  return leaderboardReliabilityResourceNames.filter(
    (resource) => resources[resource].state === state,
  ).length;
}

export function createLeaderboardReliabilityView(input: {
  intent: LeaderboardReliabilityIntent;
  target: LeaderboardReliabilityTarget;
  resources: LeaderboardReliabilityView["resources"];
  entries?: LeaderboardEntriesResourceData;
}): LeaderboardReliabilityView {
  const total = leaderboardReliabilityResourceNames.length;
  const entries = input.resources.entries;
  const failing = ["error", "offline", "unauthorized"] as const;
  const failureCount = failing.reduce((sum, state) => sum + countState(input.resources, state), 0);
  const loadingCount = countState(input.resources, "loading");
  const staleCount = countState(input.resources, "stale");
  const degradedCount = countState(input.resources, "degraded");
  const isolatedRows = input.entries?.isolatedRowCount ?? 0;

  let overall: LeaderboardReliabilityView["overall"] = "ready";
  if (countState(input.resources, "unauthorized") === total) overall = "unauthorized";
  else if (countState(input.resources, "offline") === total) overall = "offline";
  else if (countState(input.resources, "error") === total) overall = "error";
  else if (loadingCount === total) overall = "loading";
  else if (
    entries.state === "unauthorized" ||
    entries.state === "offline" ||
    entries.state === "error"
  ) {
    overall = input.target === "all" ? entries.state : "partial-failure";
  } else if (failureCount > 0 || loadingCount > 0) overall = "partial-failure";
  else if (degradedCount > 0 || isolatedRows > 0) overall = "degraded";
  else if (staleCount > 0) overall = "stale";
  else if (entries.state === "empty") overall = "empty";

  return {
    intent: input.intent,
    target: input.target,
    overall,
    resources: input.resources,
    isolatedRowCount: isolatedRows,
    isolatedRowIds: input.entries?.isolatedRowIds ?? [],
    retryable: leaderboardReliabilityResourceNames.some(
      (resource) => input.resources[resource].retryable,
    ),
  };
}
