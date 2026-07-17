"use client";

// VERZUS M8.5 LIVE UPDATE HOOK

import { useQuery } from "@tanstack/react-query";

import type { LeaderboardQueryState } from "../../explorer";
import { leaderboardLiveUpdateQueryOptions } from "../api/leaderboard-live.query";
import type { LeaderboardLiveUpdateScenario } from "../model/leaderboard-live.types";

export function useLeaderboardLiveUpdates(
  state: LeaderboardQueryState,
  scenario: LeaderboardLiveUpdateScenario = "normal",
  enabled = true,
) {
  return useQuery(leaderboardLiveUpdateQueryOptions(state, scenario, enabled));
}
