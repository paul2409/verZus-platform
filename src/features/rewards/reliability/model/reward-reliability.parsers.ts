// VERZUS M10.7 REWARD RELIABILITY QUERY PARSERS

import {
  rewardWidgetNames,
  rewardWidgetScenarios,
  type RewardWidgetName,
  type RewardWidgetScenario,
} from "./reward-reliability.types";

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseRewardWidgetName(
  value: string | string[] | undefined,
): RewardWidgetName | undefined {
  const candidate = first(value);
  return rewardWidgetNames.find((item) => item === candidate);
}

export function parseRewardWidgetScenario(
  value: string | string[] | undefined,
): RewardWidgetScenario {
  const candidate = first(value);
  return rewardWidgetScenarios.find((item) => item === candidate) ?? "normal";
}
