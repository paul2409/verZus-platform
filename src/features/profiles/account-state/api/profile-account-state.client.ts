// VERZUS M11.7 PROFILE ACCOUNT-STATE API CLIENT

import {
  adaptProfileAccountState,
  adaptProfileAccountStateError,
} from "../adapter/profile-account-state.adapter";
import type {
  ProfileAccountState,
  ProfileAccountStateScenario,
} from "../model/profile-account-state.types";

export async function fetchProfileAccountState(input: {
  scenario: ProfileAccountStateScenario;
  signal?: AbortSignal;
}): Promise<ProfileAccountState> {
  const search = new URLSearchParams();
  if (input.scenario !== "normal") search.set("scenario", input.scenario);
  const response = await fetch(`/api/profile/account-state?${search.toString()}`, {
    cache: "no-store",
    headers: { accept: "application/json" },
    signal: input.signal ?? null,
  });
  if (!response.ok) throw await adaptProfileAccountStateError(response);
  return adaptProfileAccountState(await response.json());
}
