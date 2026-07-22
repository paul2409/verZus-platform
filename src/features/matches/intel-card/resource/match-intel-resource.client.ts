// VERZUS M8.9 MATCH INTEL RESOURCE CLIENT

import {
  adaptMatchIntelPayload,
  MatchIntelResourceError,
  type MatchIntelResource,
} from "./match-intel-resource.adapter";
import type { MatchIntelResourceScenario } from "./match-intel-resource.schema";

export async function getMatchIntelResource(
  matchId: string,
  input: { scenario?: MatchIntelResourceScenario; signal?: AbortSignal } = {},
): Promise<MatchIntelResource> {
  let response: Response;
  try {
    response = await fetch(`/api/matches/${encodeURIComponent(matchId)}/intel`, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: { accept: "application/json" },
      ...(input.signal ? { signal: input.signal } : {}),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new MatchIntelResourceError({
      code: "offline",
      message: "Match intel is unavailable while offline.",
      requestId: "match-intel-offline",
      retryable: true,
    });
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new MatchIntelResourceError({
      code: "MATCH_INTEL_INVALID_JSON",
      message: "Match intel returned unreadable data.",
      requestId: response.headers.get("x-request-id") ?? "match-intel-invalid-json",
      retryable: true,
    });
  }

  return adaptMatchIntelPayload(payload);
}
