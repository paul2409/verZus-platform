// VERZUS M8.6 LEADERBOARD RELIABILITY CONTRACTS

import type { LeaderboardQueryInput } from "../../explorer";
import type { LeaderboardResourceScenario } from "../../resources/model/leaderboard-resource.types";

export const leaderboardReliabilityIntents = [
  "normal",
  "loading",
  "empty",
  "stale",
  "error",
  "offline",
  "unauthorized",
  "malformed-row",
] as const;

export type LeaderboardReliabilityIntent = (typeof leaderboardReliabilityIntents)[number];

export const leaderboardReliabilityResourceNames = [
  "composition",
  "summary",
  "entries",
  "current-position",
  "rewards",
  "status",
] as const;

export type LeaderboardReliabilityResourceName =
  (typeof leaderboardReliabilityResourceNames)[number];

export const leaderboardReliabilityTargets = [
  "all",
  ...leaderboardReliabilityResourceNames,
] as const;

export type LeaderboardReliabilityTarget = (typeof leaderboardReliabilityTargets)[number];

export type LeaderboardResourceScenarioPlan = Record<
  LeaderboardReliabilityResourceName,
  LeaderboardResourceScenario
>;

export type LeaderboardResourceHealthState =
  "loading" | "ready" | "empty" | "stale" | "degraded" | "error" | "offline" | "unauthorized";

export type LeaderboardResourceHealth = {
  resource: LeaderboardReliabilityResourceName;
  state: LeaderboardResourceHealthState;
  hasData: boolean;
  isFetching: boolean;
  retryable: boolean;
  message: string | null;
  requestId: string | null;
};

export type LeaderboardReliabilityOverallState =
  | "ready"
  | "loading"
  | "empty"
  | "stale"
  | "degraded"
  | "partial-failure"
  | "error"
  | "offline"
  | "unauthorized";

export type LeaderboardReliabilityView = {
  intent: LeaderboardReliabilityIntent;
  target: LeaderboardReliabilityTarget;
  overall: LeaderboardReliabilityOverallState;
  resources: Record<LeaderboardReliabilityResourceName, LeaderboardResourceHealth>;
  isolatedRowCount: number;
  isolatedRowIds: string[];
  retryable: boolean;
};

export type LeaderboardReliabilitySelection = {
  intent: LeaderboardReliabilityIntent;
  target: LeaderboardReliabilityTarget;
  scenarios: LeaderboardResourceScenarioPlan;
};

export type LeaderboardReliabilityQueryInput = LeaderboardQueryInput & {
  reliability?: string | string[];
  resource?: string | string[];
};
