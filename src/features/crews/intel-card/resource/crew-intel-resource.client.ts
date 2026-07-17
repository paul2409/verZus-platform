// VERZUS M8.9 CREW INTEL RESOURCE CLIENT

import {
  adaptCrewIntelPayload,
  CrewIntelResourceError,
  type CrewIntelResource,
} from "./crew-intel-resource.adapter";
import type { CrewIntelResourceScenario } from "./crew-intel-resource.schema";

export async function getCrewIntelResource(
  crewId: string,
  input: { scenario?: CrewIntelResourceScenario; signal?: AbortSignal } = {},
): Promise<CrewIntelResource> {
  const params = new URLSearchParams();
  if (input.scenario && input.scenario !== "normal") params.set("scenario", input.scenario);
  const query = params.size > 0 ? `?${params.toString()}` : "";

  let response: Response;
  try {
    response = await fetch(`/api/crews/${encodeURIComponent(crewId)}/intel${query}`, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: { accept: "application/json" },
      ...(input.signal ? { signal: input.signal } : {}),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new CrewIntelResourceError({
      code: "offline",
      message: "Crew intel is unavailable while offline.",
      requestId: "crew-intel-offline",
      retryable: true,
    });
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new CrewIntelResourceError({
      code: "CREW_INTEL_INVALID_JSON",
      message: "Crew intel returned unreadable data.",
      requestId: response.headers.get("x-request-id") ?? "crew-intel-invalid-json",
      retryable: true,
    });
  }

  return adaptCrewIntelPayload(payload);
}
