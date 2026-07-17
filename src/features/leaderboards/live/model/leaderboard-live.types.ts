// VERZUS M8.5 LIVE LEADERBOARD CONTRACTS

import type { LeaderboardQueryInput } from "../../explorer";
import type {
  LeaderboardFoundationRow,
  LeaderboardMode,
  LeaderboardMovement,
} from "../../foundation/model/leaderboard-foundation.types";
import type { LeaderboardResourceMeta } from "../../resources/model/leaderboard-resource.types";

export const leaderboardLiveUpdateScenarios = ["normal", "advance", "tie"] as const;

export type LeaderboardLiveUpdateScenario = (typeof leaderboardLiveUpdateScenarios)[number];

export type LeaderboardCurrentPositionInsight = {
  entry: LeaderboardFoundationRow | null;
  previousRank: number | null;
  movement: LeaderboardMovement;
  movementDelta: number | null;
  nextRank: number | null;
  pointsToNextRank: number | null;
};

export type LeaderboardLiveUpdateData = {
  mode: LeaderboardMode;
  revision: number;
  baseRevision: number;
  hasChanges: boolean;
  changedEntryIds: string[];
  items: LeaderboardFoundationRow[];
  currentPosition: LeaderboardCurrentPositionInsight;
  nextPollAt: string;
  meta: LeaderboardResourceMeta;
};

export type LeaderboardLiveViewState = {
  scenario: LeaderboardLiveUpdateScenario;
  revision: number;
  hasChanges: boolean;
  changedEntryIds: readonly string[];
  currentPosition: LeaderboardCurrentPositionInsight;
  nextPollAt: string;
  isFetching: boolean;
};

function readValue(input: LeaderboardQueryInput, key: string): string | undefined {
  if (input instanceof URLSearchParams) return input.get(key) ?? undefined;
  const value = input[key];
  return Array.isArray(value) ? value[0] : value;
}

export function parseLeaderboardLiveUpdateScenario(
  input: LeaderboardQueryInput,
): LeaderboardLiveUpdateScenario {
  const value = readValue(input, "live") ?? "normal";
  return leaderboardLiveUpdateScenarios.includes(value as LeaderboardLiveUpdateScenario)
    ? (value as LeaderboardLiveUpdateScenario)
    : "normal";
}
