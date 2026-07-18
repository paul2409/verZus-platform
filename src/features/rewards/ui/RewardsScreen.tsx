// VERZUS M10.4 REWARDS CLAIM ROUTE COMPOSITION
// VERZUS M10.6 ACHIEVEMENT DETAIL AND HISTORY ROUTE STATE
// VERZUS M10.7 WIDGET FAILURE-INJECTION ROUTE STATE

import type { RewardClaimScenario } from "../claims";
import type { RewardWidgetName, RewardWidgetScenario } from "../reliability";
import {
  RewardsResourceScreen,
  type RewardResourceName,
  type RewardResourceScenario,
} from "../resources";

export function RewardsScreen({
  resource,
  scenario = "normal",
  claimScenario = "normal",
  selectedAchievementId,
  historyPage = 1,
  selectedWidget,
  widgetScenario = "normal",
}: {
  resource?: RewardResourceName | undefined;
  scenario?: RewardResourceScenario;
  claimScenario?: RewardClaimScenario;
  selectedAchievementId?: string | undefined;
  historyPage?: number;
  selectedWidget?: RewardWidgetName | undefined;
  widgetScenario?: RewardWidgetScenario;
}) {
  return (
    <RewardsResourceScreen
      claimScenario={claimScenario}
      historyPage={historyPage}
      scenario={scenario}
      selectedAchievementId={selectedAchievementId}
      selectedWidget={selectedWidget}
      targetResource={resource}
      widgetScenario={widgetScenario}
    />
  );
}
