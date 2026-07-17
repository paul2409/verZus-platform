// VERZUS M8.2 LEADERBOARD URL-STATE ROUTE

import type { Metadata } from "next";

import { getPlatformRouteById } from "@/components/layout/app-shell";
import { LeaderboardScreen } from "@/features/leaderboards";

const route = getPlatformRouteById("leaderboards-weekly");

export const metadata: Metadata = {
  title: route.title,
  description: route.description,
};

export default async function WeeklyLeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const initialSearchParams = await searchParams;
  return <LeaderboardScreen initialSearchParams={initialSearchParams} />;
}
