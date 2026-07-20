// VERZUS M11.6 ABORTABLE PROFILE INSIGHT CLIENTS

import { ZodError } from "zod";

import {
  adaptProfileAchievementPage,
  adaptProfileGameIdentityCollection,
  adaptProfileInsightError,
  adaptProfileTrustHistory,
  ProfileInsightResourceError,
} from "../adapter/player-identity-insights.adapter";
import type {
  ProfileAchievementCategoryFilter,
  ProfileAchievementPage,
  ProfileAchievementStateFilter,
  ProfileGameIdentityCollection,
  ProfileInsightScenario,
  ProfileTrustHistoryPage,
} from "../model/player-identity-insights.types";

async function requestJson(path: string, signal?: AbortSignal): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: { accept: "application/json" },
      ...(signal ? { signal } : {}),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new ProfileInsightResourceError({
      code: "PROFILE_INSIGHT_OFFLINE",
      message: "Profile insight data is unavailable while offline.",
      requestId: "profile-insight-offline",
      retryable: true,
    });
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ProfileInsightResourceError({
      code: "PROFILE_INSIGHT_INVALID_JSON",
      message: "Profile insight data returned unreadable content.",
      requestId: response.headers.get("x-request-id") ?? "profile-insight-invalid-json",
      retryable: true,
      status: response.status,
    });
  }

  if (!response.ok) throw adaptProfileInsightError(payload, response.status);
  return payload;
}

function wrapSchemaFailure(error: unknown, resource: string): never {
  if (error instanceof ProfileInsightResourceError) throw error;
  if (error instanceof ZodError) {
    throw new ProfileInsightResourceError({
      code: "PROFILE_INSIGHT_SCHEMA_INVALID",
      message: `${resource} returned malformed data.`,
      requestId: `profile-${resource}-schema-invalid`,
      retryable: true,
    });
  }
  throw error;
}

export async function getProfileAchievements(input: {
  category: ProfileAchievementCategoryFilter;
  state: ProfileAchievementStateFilter;
  page: number;
  scenario: ProfileInsightScenario;
  signal?: AbortSignal;
}): Promise<ProfileAchievementPage> {
  const params = new URLSearchParams({
    category: input.category,
    state: input.state,
    page: String(input.page),
  });
  if (input.scenario !== "normal") params.set("scenario", input.scenario);

  try {
    return adaptProfileAchievementPage(
      await requestJson(`/api/profile/achievements?${params.toString()}`, input.signal),
    );
  } catch (error) {
    return wrapSchemaFailure(error, "achievements");
  }
}

export async function getProfileGameIdentities(input: {
  scenario: ProfileInsightScenario;
  signal?: AbortSignal;
}): Promise<ProfileGameIdentityCollection> {
  const params = new URLSearchParams();
  if (input.scenario !== "normal") params.set("scenario", input.scenario);

  try {
    return adaptProfileGameIdentityCollection(
      await requestJson(`/api/profile/game-identities?${params.toString()}`, input.signal),
    );
  } catch (error) {
    return wrapSchemaFailure(error, "game-identities");
  }
}

export async function getProfileTrustHistory(input: {
  page: number;
  scenario: ProfileInsightScenario;
  signal?: AbortSignal;
}): Promise<ProfileTrustHistoryPage> {
  const params = new URLSearchParams({ page: String(input.page) });
  if (input.scenario !== "normal") params.set("scenario", input.scenario);

  try {
    return adaptProfileTrustHistory(
      await requestJson(`/api/profile/trust-history?${params.toString()}`, input.signal),
    );
  } catch (error) {
    return wrapSchemaFailure(error, "trust-history");
  }
}
