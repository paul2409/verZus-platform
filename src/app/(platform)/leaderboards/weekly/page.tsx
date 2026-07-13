import type { Metadata } from "next";

import { getPlatformRouteById, PlatformRoutePlaceholder } from "@/components/layout/app-shell";

const route = getPlatformRouteById("leaderboards-weekly");

export const metadata: Metadata = {
  title: route.title,
  description: route.description,
};

export default function WeeklyLeaderboardPage() {
  return <PlatformRoutePlaceholder routeId="leaderboards-weekly" />;
}
