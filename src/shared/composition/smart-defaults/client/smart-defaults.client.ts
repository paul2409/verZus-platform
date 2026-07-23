import { adaptSmartDefaultsResponse } from "../adapter";
import type { SmartDefaultsSnapshot, SmartPreferencePatch } from "../model";
import { smartDefaultsResponseSchema } from "../schema";

export class SmartDefaultsClientError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly retryable: boolean,
    readonly requestId: string | null,
  ) {
    super(message);
    this.name = "SmartDefaultsClientError";
  }
}

async function parseResponse(response: Response): Promise<SmartDefaultsSnapshot> {
  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const error =
      payload && typeof payload === "object" && "error" in payload
        ? (payload.error as Record<string, unknown>)
        : null;
    throw new SmartDefaultsClientError(
      typeof error?.message === "string" ? error.message : "Smart defaults are unavailable.",
      typeof error?.code === "string" ? error.code : "SMART_DEFAULTS_REQUEST_FAILED",
      error?.retryable === true,
      typeof error?.request_id === "string" ? error.request_id : null,
    );
  }

  return adaptSmartDefaultsResponse(smartDefaultsResponseSchema.parse(payload));
}

export async function readSmartDefaults(): Promise<SmartDefaultsSnapshot> {
  return parseResponse(
    await fetch("/api/smart-defaults", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: { accept: "application/json" },
    }),
  );
}

export async function rememberSmartDefaults(
  patch: SmartPreferencePatch,
): Promise<SmartDefaultsSnapshot> {
  return parseResponse(
    await fetch("/api/smart-defaults", {
      method: "PATCH",
      credentials: "same-origin",
      cache: "no-store",
      headers: { accept: "application/json", "content-type": "application/json" },
      body: JSON.stringify({
        competition_game: patch.competitionGame,
        competition_sort: patch.competitionSort,
        leaderboard_mode: patch.leaderboardMode,
        leaderboard_game: patch.leaderboardGame,
        search_domain: patch.searchDomain,
      }),
    }),
  );
}
