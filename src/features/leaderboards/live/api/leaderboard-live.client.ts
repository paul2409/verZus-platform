// VERZUS M8.5 ABORTABLE LIVE UPDATE CLIENT

import { serializeLeaderboardQueryState } from "../../explorer";
import type { LeaderboardQueryState } from "../../explorer";
import { LeaderboardApiClientError } from "../../resources/api/leaderboard-api.adapter";
import type {
  LeaderboardLiveUpdateData,
  LeaderboardLiveUpdateScenario,
} from "../model/leaderboard-live.types";
import { adaptLeaderboardLiveUpdatePayload } from "./leaderboard-live.adapter";

export async function getLeaderboardLiveUpdate(
  state: LeaderboardQueryState,
  scenario: LeaderboardLiveUpdateScenario,
  signal?: AbortSignal,
): Promise<LeaderboardLiveUpdateData> {
  const params = serializeLeaderboardQueryState(state);
  params.delete("mode");
  if (scenario !== "normal") params.set("scenario", scenario);
  const url = `/api/leaderboards/${encodeURIComponent(state.mode)}/updates?${params.toString()}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: { accept: "application/json" },
      ...(signal ? { signal } : {}),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new LeaderboardApiClientError({
      code: "offline",
      message: "Live leaderboard updates are unavailable while offline.",
      requestId: "leaderboard-live-offline",
      retryable: true,
    });
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new LeaderboardApiClientError({
      code: "invalid_response",
      message: "The live leaderboard update response was unreadable.",
      requestId: response.headers.get("x-request-id") ?? "leaderboard-live-invalid-json",
      retryable: true,
    });
  }

  return adaptLeaderboardLiveUpdatePayload(payload);
}
