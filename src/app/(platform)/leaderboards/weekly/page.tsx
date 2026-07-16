import type { Metadata } from "next";

import { getPlatformRouteById } from "@/components/layout/app-shell";
import { LeaderboardScreen } from "@/features/leaderboards";

const route = getPlatformRouteById("leaderboards-weekly");

export const metadata: Metadata = {
  title: route.title,
  description: route.description,
};

export default function WeeklyLeaderboardPage() {
  return <LeaderboardScreen />;
}
