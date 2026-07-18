// VERZUS M10.3 ABORTABLE REWARD RESOURCE CLIENTS

import {
  adaptRewardAchievementsPayload,
  adaptRewardHistoryPayload,
  adaptRewardInventoryPayload,
  adaptRewardProgressPayload,
  adaptRewardSeasonPayload,
  RewardResourceError,
} from "../adapter/reward-resource.adapter";
import type {
  RewardResourceScenario,
  RewardResourceSnapshot,
} from "../model/reward-resource.types";

async function requestRewardResource(
  resource: string,
  input: { scenario?: RewardResourceScenario; signal?: AbortSignal },
): Promise<unknown> {
  const params = new URLSearchParams();
  if (input.scenario && input.scenario !== "normal") params.set("scenario", input.scenario);
  const suffix = params.size > 0 ? `?${params.toString()}` : "";

  let response: Response;
  try {
    response = await fetch(`/api/rewards/${resource}${suffix}`, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: { accept: "application/json" },
      ...(input.signal ? { signal: input.signal } : {}),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new RewardResourceError({
      code: "REWARD_RESOURCE_OFFLINE",
      message: `${resource} is unavailable while offline.`,
      requestId: `reward-${resource}-offline`,
      retryable: true,
    });
  }

  try {
    return await response.json();
  } catch {
    throw new RewardResourceError({
      code: "REWARD_RESOURCE_INVALID_JSON",
      message: `${resource} returned unreadable data.`,
      requestId: response.headers.get("x-request-id") ?? `reward-${resource}-invalid-json`,
      retryable: true,
    });
  }
}

export async function getRewardProgressResource(
  input: { scenario?: RewardResourceScenario; signal?: AbortSignal } = {},
): Promise<RewardResourceSnapshot<"progress">> {
  return adaptRewardProgressPayload(await requestRewardResource("progress", input));
}

export async function getRewardSeasonResource(
  input: { scenario?: RewardResourceScenario; signal?: AbortSignal } = {},
): Promise<RewardResourceSnapshot<"season">> {
  return adaptRewardSeasonPayload(await requestRewardResource("season", input));
}

export async function getRewardInventoryResource(
  input: { scenario?: RewardResourceScenario; signal?: AbortSignal } = {},
): Promise<RewardResourceSnapshot<"inventory">> {
  return adaptRewardInventoryPayload(await requestRewardResource("inventory", input));
}

export async function getRewardHistoryResource(
  input: { scenario?: RewardResourceScenario; signal?: AbortSignal } = {},
): Promise<RewardResourceSnapshot<"history">> {
  return adaptRewardHistoryPayload(await requestRewardResource("history", input));
}

export async function getRewardAchievementsResource(
  input: { scenario?: RewardResourceScenario; signal?: AbortSignal } = {},
): Promise<RewardResourceSnapshot<"achievements">> {
  return adaptRewardAchievementsPayload(await requestRewardResource("achievements", input));
}
