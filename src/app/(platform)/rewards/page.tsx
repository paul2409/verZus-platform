// VERZUS M10.7 REWARD RESOURCE, CLAIM, ACHIEVEMENT, HISTORY AND RELIABILITY ROUTE

import type { Metadata } from "next";

import { getPlatformRouteById } from "@/components/layout/app-shell";
import {
  parseRewardAchievementId,
  parseRewardClaimScenario,
  parseRewardHistoryPage,
  parseRewardResourceName,
  parseRewardResourceScenario,
  parseRewardWidgetName,
  parseRewardWidgetScenario,
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
      claimScenario={parseRewardClaimScenario(query.claimScenario)}
      historyPage={parseRewardHistoryPage(query.historyPage)}
      resource={parseRewardResourceName(query.resource)}
      scenario={parseRewardResourceScenario(query.scenario)}
      selectedAchievementId={parseRewardAchievementId(query.achievement)}
      selectedWidget={parseRewardWidgetName(query.widget)}
      widgetScenario={parseRewardWidgetScenario(query.widgetScenario)}
    />
  );
}
