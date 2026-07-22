import {
  adaptProfilePrivacyError,
  adaptProfilePrivacyResponse,
} from "../adapter/profile-privacy.adapter";
import type {
  ProfilePrivacySnapshot,
  ProfilePrivacyUpdateCommand,
} from "../model/profile-privacy.types";

export async function fetchProfilePrivacy(input: {
  signal?: AbortSignal;
}): Promise<ProfilePrivacySnapshot> {
  const response = await fetch("/api/profile/privacy", {
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
  signal?: AbortSignal;
}): Promise<ProfilePrivacySnapshot> {
  const response = await fetch("/api/profile/privacy", {
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
