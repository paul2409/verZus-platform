import type { PlayCheckInCommand, PlayCheckInResult } from "../model";
import { adaptPlayCheckInPayload } from "./check-in-api.adapter";

export interface SubmitPlayCheckInRequest {
  command: PlayCheckInCommand;
  signal?: AbortSignal | undefined;
}

export async function submitPlayCheckIn({
  command,
  signal,
}: SubmitPlayCheckInRequest): Promise<PlayCheckInResult> {
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

  if (signal) init.signal = signal;

  const response = await fetch("/api/check-ins/current", init);
  const payload: unknown = await response.json();
  return adaptPlayCheckInPayload(payload);
}
