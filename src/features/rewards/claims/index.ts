// VERZUS M10.4 REWARD CLAIM FEATURE EXPORTS

export * from "./api/reward-claim.client";
export * from "./hooks/useRewardClaim";
export * from "./model/reward-claim.types";
export * from "./schema/reward-claim.schema";
export * from "./ui";

import { rewardClaimScenarios, type RewardClaimScenario } from "./model/reward-claim.types";

export function parseRewardClaimScenario(
  value: string | string[] | undefined,
): RewardClaimScenario {
  const candidate = Array.isArray(value) ? value[0] : value;
  return rewardClaimScenarios.find((item) => item === candidate) ?? "normal";
}
