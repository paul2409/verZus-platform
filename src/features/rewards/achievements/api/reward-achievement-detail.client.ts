// VERZUS M10.6 ABORTABLE ACHIEVEMENT DETAIL CLIENT

import {
  adaptRewardAchievementDetailPayload,
  RewardAchievementDetailError,
} from "../adapter/reward-achievement-detail.adapter";
import type { RewardAchievementDetailSnapshot } from "../model/reward-achievement.types";

export async function getRewardAchievementDetail(
  achievementId: string,
  signal?: AbortSignal,
): Promise<RewardAchievementDetailSnapshot> {
  let response: Response;
  try {
    response = await fetch(`/api/rewards/achievements/${encodeURIComponent(achievementId)}`, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: { accept: "application/json" },
      ...(signal ? { signal } : {}),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new RewardAchievementDetailError({
      code: "REWARD_ACHIEVEMENT_DETAIL_OFFLINE",
      message: "Achievement detail is unavailable while offline.",
      requestId: "reward-achievement-detail-offline",
      retryable: true,
    });
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new RewardAchievementDetailError({
      code: "REWARD_ACHIEVEMENT_DETAIL_INVALID_JSON",
      message: "Achievement detail returned unreadable data.",
      requestId: response.headers.get("x-request-id") ?? "reward-achievement-detail-invalid-json",
      retryable: true,
    });
  }

  return adaptRewardAchievementDetailPayload(payload);
}
