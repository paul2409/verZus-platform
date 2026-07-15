// VERZUS M5 STEPS 5.9-5.13

import type { PlayCheckInCommand, PlayCheckInResult, PlayScenario } from "../model";
import { adaptPlayCheckInPayload } from "./check-in-api.adapter";

export interface SubmitPlayCheckInRequest {
  scenario: PlayScenario;
  command: PlayCheckInCommand;
  signal?: AbortSignal | undefined;
}

export async function submitPlayCheckIn({
  scenario,
  command,
  signal,
}: SubmitPlayCheckInRequest): Promise<PlayCheckInResult> {
  const search = new URLSearchParams({ scenario });
  const init: RequestInit = {
    method: "POST",
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "idempotency-key": command.idempotencyKey,
    },
    body: JSON.stringify({
      match_id: command.matchId,
      mutation_key: command.mutationKey,
      idempotency_key: command.idempotencyKey,
    }),
  };

  if (signal) {
    init.signal = signal;
  }

  const response = await fetch(`/api/check-ins/current?${search.toString()}`, init);
  const payload: unknown = await response.json();

  return adaptPlayCheckInPayload(payload);
}
