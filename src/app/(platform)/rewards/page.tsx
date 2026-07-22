import type { Metadata } from "next";

import { getPlatformRouteById } from "@/components/layout/app-shell";
import {
  parseRewardAchievementId,
  parseRewardHistoryPage,
  RewardsScreen,
} from "@/features/rewards";

const route = getPlatformRouteById("rewards");

export const metadata: Metadata = {
  title: route.title,
  description: route.description,
};

export default async function RewardsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;

  return (
    <RewardsScreen
      historyPage={parseRewardHistoryPage(query.historyPage)}
      selectedAchievementId={parseRewardAchievementId(query.achievement)}
    />
  );
}
