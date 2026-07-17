// VERZUS M8.9 PLAYER INTEL RESOURCE CLIENT

import {
  adaptPlayerIntelPayload,
  PlayerIntelResourceError,
  type PlayerIntelResource,
} from "./player-intel-resource.adapter";
import type { PlayerIntelResourceScenario } from "./player-intel-resource.schema";

export async function getPlayerIntelResource(
  playerId: string,
  input: { scenario?: PlayerIntelResourceScenario; signal?: AbortSignal } = {},
): Promise<PlayerIntelResource> {
  const params = new URLSearchParams();
  if (input.scenario && input.scenario !== "normal") params.set("scenario", input.scenario);
  const query = params.size > 0 ? `?${params.toString()}` : "";

  let response: Response;
  try {
    response = await fetch(`/api/players/${encodeURIComponent(playerId)}/intel${query}`, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: { accept: "application/json" },
      ...(input.signal ? { signal: input.signal } : {}),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new PlayerIntelResourceError({
      code: "offline",
      message: "Player intel is unavailable while offline.",
      requestId: "player-intel-offline",
      retryable: true,
    });
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new PlayerIntelResourceError({
      code: "PLAYER_INTEL_INVALID_JSON",
      message: "Player intel returned unreadable data.",
      requestId: response.headers.get("x-request-id") ?? "player-intel-invalid-json",
      retryable: true,
    });
  }

  return adaptPlayerIntelPayload(payload);
}
