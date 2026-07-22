"use client";

// VERZUS M10.3 RESOURCE-AWARE REWARDS COMPOSITION
// VERZUS M10.4 CLAIM PROVIDER COMPOSITION
// VERZUS M10.6 ACHIEVEMENT AND AUDIT HISTORY COMPOSITION
// VERZUS M10.7 RELIABILITY AND OBSERVABILITY COMPOSITION
// VERZUS M10.8 RELEASE-READY REWARD COMPOSITION

import { RewardClaimProvider, type RewardClaimScenario } from "../../claims";
import {
  emptyRewardAchievements,
  emptyRewardInventory,
  emptyRewardSeason,
  emptyRewardsFoundation,
  RewardsFoundationScreen,
} from "../../foundation";
import type { RewardWidgetName, RewardWidgetScenario } from "../../reliability";
import {
  recordRewardTelemetry,
  RewardResourceTelemetry,
  RewardSurfaceTelemetry,
} from "../../telemetry";
import { useRewardResources } from "../hooks/useRewardResources";
import { mergeRewardResourceSnapshots } from "../model/reward-resource.merge";
import type { RewardResourceName, RewardResourceScenario } from "../model/reward-resource.types";
import { RewardResourceStatusStrip } from "./RewardResourceStatusStrip";

export function RewardsResourceScreen({
  targetResource,
  scenario = "normal",
  claimScenario = "normal",
  selectedAchievementId,
  historyPage = 1,
  selectedWidget,
  widgetScenario = "normal",
}: {
  targetResource?: RewardResourceName | undefined;
  scenario?: RewardResourceScenario;
  claimScenario?: RewardClaimScenario;
  selectedAchievementId?: string | undefined;
  historyPage?: number;
  selectedWidget?: RewardWidgetName | undefined;
  widgetScenario?: RewardWidgetScenario;
}) {
  const resources = useRewardResources(targetResource, scenario);
  const model = mergeRewardResourceSnapshots(
    emptyRewardsFoundation,
    emptyRewardInventory,
    emptyRewardSeason,
    emptyRewardAchievements,
    resources.snapshots,
  );

  const retryResource = (resource: RewardResourceName): void => {
    recordRewardTelemetry({
      eventName: "reward_resource_retry_requested",
      surface: "resource",
      resource,
      widget: null,
      rewardId: null,
      state: "retrying",
      errorCode: resources.health[resource].code,
      requestId: resources.health[resource].requestId,
    });
    void resources.retry(resource);
  };

  return (
    <div>
      <RewardSurfaceTelemetry />
      <RewardResourceTelemetry health={resources.health} />
      <RewardResourceStatusStrip health={resources.health} onRetry={retryResource} />
      <RewardClaimProvider inventoryVersion={resources.inventoryVersion} scenario={claimScenario}>
        <RewardsFoundationScreen
          achievements={model.achievements}
          historyPage={historyPage}
          inventoryItems={model.inventory}
          model={model.foundation}
          season={model.season}
          selectedAchievementId={selectedAchievementId}
          selectedWidget={selectedWidget}
          widgetScenario={widgetScenario}
        />
      </RewardClaimProvider>
    </div>
  );
}
