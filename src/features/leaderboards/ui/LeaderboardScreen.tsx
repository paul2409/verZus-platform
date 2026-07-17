"use client";

// VERZUS M8.1 LEADERBOARD RESPONSIVE FOUNDATION ROUTE WRAPPER
// VERZUS M8.2 URL-STATE ROUTE WRAPPER
// VERZUS M8.3 RESOURCE-CONNECTED ROUTE WRAPPER
// VERZUS M8.8 INTEL QUERY INPUT

import type { LeaderboardQueryInput } from "../explorer";
import type { LeaderboardIntelQueryInput } from "../interactions";
import { LeaderboardFoundationScreen } from "../foundation";
import { LeaderboardResourceScreen } from "../resources";

export type LeaderboardScreenProps = {
  initialSearchParams?: LeaderboardQueryInput & LeaderboardIntelQueryInput;
  enableRemoteResources?: boolean;
};

export function LeaderboardScreen({
  initialSearchParams = {},
  enableRemoteResources = true,
}: LeaderboardScreenProps) {
  if (!enableRemoteResources) {
    return <LeaderboardFoundationScreen initialSearchParams={initialSearchParams} />;
  }

  return <LeaderboardResourceScreen initialSearchParams={initialSearchParams} />;
}
