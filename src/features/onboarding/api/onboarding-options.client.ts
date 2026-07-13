// VERZUS M4 STEP 4.9

import {
  adaptOnboardingAvailabilityOptionsPayload,
  adaptOnboardingCrewOptionsPayload,
  adaptOnboardingGameOptionsPayload,
  adaptOnboardingIdentityOptionsPayload,
  adaptOnboardingLocationOptionsPayload,
} from "./onboarding-options.adapter";
import type {
  OnboardingAvailabilityOptionsData,
  OnboardingCrewOptionsData,
  OnboardingGameOptionsData,
  OnboardingIdentityOptionsData,
  OnboardingLocationOptionsData,
} from "./onboarding-options.schema";

async function getJson(path: string): Promise<unknown> {
  const response = await fetch(path, {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
  });

  return response.json();
}

export async function getOnboardingGameOptions(): Promise<OnboardingGameOptionsData> {
  return adaptOnboardingGameOptionsPayload(await getJson("/api/onboarding/options/games"));
}

export interface OnboardingLocationOptionsQuery {
  countryCode?: string;
  regionId?: string;
}

export async function getOnboardingLocationOptions(
  query: OnboardingLocationOptionsQuery = {},
): Promise<OnboardingLocationOptionsData> {
  const params = new URLSearchParams();

  if (query.countryCode) {
    params.set("countryCode", query.countryCode);
  }

  if (query.regionId) {
    params.set("regionId", query.regionId);
  }

  const suffix = params.size > 0 ? `?${params.toString()}` : "";

  return adaptOnboardingLocationOptionsPayload(
    await getJson(`/api/onboarding/options/locations${suffix}`),
  );
}

export async function getOnboardingIdentityOptions(): Promise<OnboardingIdentityOptionsData> {
  return adaptOnboardingIdentityOptionsPayload(await getJson("/api/onboarding/options/identity"));
}

export interface OnboardingAvailabilityOptionsQuery {
  timezone?: string;
}

export async function getOnboardingAvailabilityOptions(
  query: OnboardingAvailabilityOptionsQuery = {},
): Promise<OnboardingAvailabilityOptionsData> {
  const params = new URLSearchParams();

  if (query.timezone) {
    params.set("timezone", query.timezone);
  }

  const suffix = params.size > 0 ? `?${params.toString()}` : "";

  return adaptOnboardingAvailabilityOptionsPayload(
    await getJson(`/api/onboarding/options/availability${suffix}`),
  );
}

export interface OnboardingCrewOptionsQuery {
  gameId?: string;
}

export async function getOnboardingCrewOptions(
  query: OnboardingCrewOptionsQuery = {},
): Promise<OnboardingCrewOptionsData> {
  const params = new URLSearchParams();

  if (query.gameId) {
    params.set("gameId", query.gameId);
  }

  const suffix = params.size > 0 ? `?${params.toString()}` : "";

  return adaptOnboardingCrewOptionsPayload(await getJson(`/api/onboarding/options/crews${suffix}`));
}
