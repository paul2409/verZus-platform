import {
  adaptPlayerIntelPayload,
  PlayerIntelResourceError,
  type PlayerIntelResource,
} from "./player-intel-resource.adapter";

export async function getPlayerIntelResource(
  playerId: string,
  input: { signal?: AbortSignal } = {},
): Promise<PlayerIntelResource> {
  let response: Response;
  try {
    response = await fetch(`/api/players/${encodeURIComponent(playerId)}/intel`, {
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
