import {
  adaptCrewAchievementsPayload,
  adaptCrewActivityPayload,
  adaptCrewProfilePayload,
  adaptCrewRankingsPayload,
  adaptCrewRequestsPayload,
  adaptCrewRosterPayload,
  adaptCrewSettingsPayload,
  CrewResourceError,
} from "../adapter/crew-resource.adapter";
import type { CrewResourceSnapshot } from "../model/crew-resource.types";

async function requestCrewResource(
  crewId: string,
  resource: string,
  signal?: AbortSignal,
): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`/api/crews/${encodeURIComponent(crewId)}/${resource}`, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: { accept: "application/json" },
      ...(signal ? { signal } : {}),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new CrewResourceError({
      code: "CREW_RESOURCE_OFFLINE",
      message: `${resource} is unavailable while offline.`,
      requestId: `crew-${resource}-offline`,
      retryable: true,
    });
  }

  try {
    return await response.json();
  } catch {
    throw new CrewResourceError({
      code: "CREW_RESOURCE_INVALID_JSON",
      message: `${resource} returned unreadable data.`,
      requestId: response.headers.get("x-request-id") ?? `crew-${resource}-invalid-json`,
      retryable: true,
    });
  }
}

export async function getCrewProfileResource(
  crewId: string,
  input: { signal?: AbortSignal } = {},
): Promise<CrewResourceSnapshot<"profile">> {
  return adaptCrewProfilePayload(await requestCrewResource(crewId, "profile", input.signal));
}

export async function getCrewRosterResource(
  crewId: string,
  input: { signal?: AbortSignal } = {},
): Promise<CrewResourceSnapshot<"roster">> {
  return adaptCrewRosterPayload(await requestCrewResource(crewId, "roster", input.signal));
}

export async function getCrewRequestsResource(
  crewId: string,
  input: { signal?: AbortSignal } = {},
): Promise<CrewResourceSnapshot<"requests">> {
  return adaptCrewRequestsPayload(await requestCrewResource(crewId, "requests", input.signal));
}

export async function getCrewActivityResource(
  crewId: string,
  input: { signal?: AbortSignal } = {},
): Promise<CrewResourceSnapshot<"activity">> {
  return adaptCrewActivityPayload(await requestCrewResource(crewId, "activity", input.signal));
}

export async function getCrewRankingsResource(
  crewId: string,
  input: { signal?: AbortSignal } = {},
): Promise<CrewResourceSnapshot<"rankings">> {
  return adaptCrewRankingsPayload(await requestCrewResource(crewId, "rankings", input.signal));
}

export async function getCrewAchievementsResource(
  crewId: string,
  input: { signal?: AbortSignal } = {},
): Promise<CrewResourceSnapshot<"achievements">> {
  return adaptCrewAchievementsPayload(
    await requestCrewResource(crewId, "achievements", input.signal),
  );
}

export async function getCrewSettingsResource(
  crewId: string,
  input: { signal?: AbortSignal } = {},
): Promise<CrewResourceSnapshot<"settings">> {
  return adaptCrewSettingsPayload(await requestCrewResource(crewId, "settings", input.signal));
}
