// VERZUS M11.4 ABORTABLE PROFILE RESOURCE CLIENTS

import {
  adaptProfileAvailabilityPayload,
  adaptProfileCompetitiveSummaryPayload,
  adaptProfileCrewPayload,
  adaptProfileIdentityPayload,
  adaptProfileResourceError,
  ProfileResourceError,
} from "../adapter/profile-resource.adapter";
import type {
  ProfileResourceScenario,
  ProfileResourceSnapshot,
} from "../model/profile-resource.types";

async function requestProfileResource(
  resource: string,
  input: { scenario?: ProfileResourceScenario; signal?: AbortSignal },
): Promise<unknown> {
  const params = new URLSearchParams();
  if (input.scenario && input.scenario !== "normal") params.set("scenario", input.scenario);
  const suffix = params.size > 0 ? `?${params.toString()}` : "";

  let response: Response;
  try {
    response = await fetch(`/api/profile/${resource}${suffix}`, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: { accept: "application/json" },
      ...(input.signal ? { signal: input.signal } : {}),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new ProfileResourceError({
      code: "PROFILE_RESOURCE_OFFLINE",
      message: `${resource} is unavailable while offline.`,
      requestId: `profile-${resource}-offline`,
      retryable: true,
    });
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ProfileResourceError({
      code: "PROFILE_RESOURCE_INVALID_JSON",
      message: `${resource} returned unreadable data.`,
      requestId: response.headers.get("x-request-id") ?? `profile-${resource}-invalid-json`,
      retryable: true,
      status: response.status,
    });
  }

  if (!response.ok) throw adaptProfileResourceError(payload, response.status);
  return payload;
}

export async function getProfileIdentityResource(
  input: { scenario?: ProfileResourceScenario; signal?: AbortSignal } = {},
): Promise<ProfileResourceSnapshot<"identity">> {
  return adaptProfileIdentityPayload(await requestProfileResource("identity", input));
}

export async function getProfileCompetitiveSummaryResource(
  input: { scenario?: ProfileResourceScenario; signal?: AbortSignal } = {},
): Promise<ProfileResourceSnapshot<"competitive-summary">> {
  return adaptProfileCompetitiveSummaryPayload(
    await requestProfileResource("competitive-summary", input),
  );
}

export async function getProfileCrewResource(
  input: { scenario?: ProfileResourceScenario; signal?: AbortSignal } = {},
): Promise<ProfileResourceSnapshot<"crew">> {
  return adaptProfileCrewPayload(await requestProfileResource("crew", input));
}

export async function getProfileAvailabilityResource(
  input: { scenario?: ProfileResourceScenario; signal?: AbortSignal } = {},
): Promise<ProfileResourceSnapshot<"availability">> {
  return adaptProfileAvailabilityPayload(await requestProfileResource("availability", input));
}
