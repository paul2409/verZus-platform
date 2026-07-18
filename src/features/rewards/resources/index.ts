// VERZUS M10.3 REWARD RESOURCE EXPORTS

export * from "./adapter/reward-resource.adapter";
export * from "./api/reward-resource.client";
export * from "./api/reward-resource.query";
export * from "./hooks/useRewardResources";
export * from "./model/reward-resource.merge";
export * from "./model/reward-resource.types";
export * from "./schema/reward-resource.schema";
export * from "./ui";

import {
  rewardResourceNames,
  rewardResourceScenarios,
  type RewardResourceName,
  type RewardResourceScenario,
} from "./model/reward-resource.types";

export function parseRewardResourceName(
  value: string | string[] | undefined,
): RewardResourceName | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  return rewardResourceNames.find((item) => item === candidate);
}

export function parseRewardResourceScenario(
  value: string | string[] | undefined,
): RewardResourceScenario {
  const candidate = Array.isArray(value) ? value[0] : value;
  return rewardResourceScenarios.find((item) => item === candidate) ?? "normal";
}
