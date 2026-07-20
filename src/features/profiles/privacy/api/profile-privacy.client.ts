// VERZUS M11.7 PROFILE PRIVACY API CLIENT

import {
  adaptProfilePrivacyError,
  adaptProfilePrivacyResponse,
} from "../adapter/profile-privacy.adapter";
import type {
  ProfilePrivacySaveScenario,
  ProfilePrivacyScenario,
  ProfilePrivacySnapshot,
  ProfilePrivacyUpdateCommand,
} from "../model/profile-privacy.types";

export async function fetchProfilePrivacy(input: {
  scenario: ProfilePrivacyScenario;
  signal?: AbortSignal;
}): Promise<ProfilePrivacySnapshot> {
  const search = new URLSearchParams();
  if (input.scenario !== "normal") search.set("scenario", input.scenario);
  const response = await fetch(`/api/profile/privacy?${search.toString()}`, {
    cache: "no-store",
    headers: { accept: "application/json" },
    signal: input.signal ?? null,
  });

  if (!response.ok) throw await adaptProfilePrivacyError(response);
  return adaptProfilePrivacyResponse(await response.json());
}

export async function updateProfilePrivacy(input: {
  command: ProfilePrivacyUpdateCommand;
  idempotencyKey: string;
  scenario: ProfilePrivacySaveScenario;
  signal?: AbortSignal;
}): Promise<ProfilePrivacySnapshot> {
  const search = new URLSearchParams();
  if (input.scenario !== "normal") search.set("scenario", input.scenario);

  const response = await fetch(`/api/profile/privacy?${search.toString()}`, {
    method: "PATCH",
    cache: "no-store",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "idempotency-key": input.idempotencyKey,
    },
    body: JSON.stringify({
      expected_version: input.command.expectedVersion,
      profile_visibility: input.command.settings.profileVisibility,
      field_audiences: {
        location: input.command.settings.location,
        crew: input.command.settings.crew,
        statistics: input.command.settings.statistics,
        trust_score: input.command.settings.trustScore,
        match_history: input.command.settings.matchHistory,
        game_handles: input.command.settings.gameHandles,
        achievements: input.command.settings.achievements,
        availability: input.command.settings.availability,
      },
    }),
    signal: input.signal ?? null,
  });

  if (!response.ok) throw await adaptProfilePrivacyError(response);
  return adaptProfilePrivacyResponse(await response.json());
}
