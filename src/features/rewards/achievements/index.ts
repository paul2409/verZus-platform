export * from "./adapter/reward-achievement-detail.adapter";
export * from "./api/reward-achievement-detail.client";
export * from "./api/reward-achievement-detail.query";
export * from "./model/reward-achievement.types";
export * from "./schema/reward-achievement.schema";
export * from "./ui";

export function parseRewardAchievementId(value: string | string[] | undefined): string | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate || candidate.length > 96 || !/^[a-z0-9-]+$/.test(candidate)) return undefined;
  return candidate;
}
