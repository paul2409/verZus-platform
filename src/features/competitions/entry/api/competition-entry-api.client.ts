import type {
  CompetitionEntryCommand,
  CompetitionEntryControlResourceData,
  CompetitionEntryMutationResult,
  CompetitionEntryScenario,
} from "../model/competition-entry.types";
import {
  adaptCompetitionEntryControl,
  adaptCompetitionEntryMutation,
  CompetitionEntryApiClientError,
} from "./competition-entry-api.adapter";

export type CompetitionEntryReadRequest = {
  scenario?: CompetitionEntryScenario;
  signal?: AbortSignal;
};

export type CompetitionEntrySubmitRequest = {
  scenario?: CompetitionEntryScenario;
  command: CompetitionEntryCommand;
};

function endpoint(competitionId: string, scenario?: CompetitionEntryScenario) {
  const params = new URLSearchParams();
  if (scenario && scenario !== "normal") params.set("scenario", scenario);
  const query = params.toString();
  return `/api/competitions/${encodeURIComponent(competitionId)}/entry${query ? `?${query}` : ""}`;
}

async function parse(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new CompetitionEntryApiClientError({
      code: "invalid_json",
      message: "The competition entry service returned invalid JSON.",
      requestId: response.headers.get("x-request-id") ?? "competition-entry-invalid-json",
      retryable: response.status >= 500,
    });
  }
}

export async function getCompetitionEntryControl(
  competitionId: string,
  request: CompetitionEntryReadRequest = {},
): Promise<CompetitionEntryControlResourceData> {
  const response = await fetch(endpoint(competitionId, request.scenario), {
    method: "GET",
    cache: "no-store",
    headers: { accept: "application/json" },
    ...(request.signal ? { signal: request.signal } : {}),
  });
  return adaptCompetitionEntryControl(await parse(response));
}

export async function submitCompetitionEntry({
  scenario,
  command,
}: CompetitionEntrySubmitRequest): Promise<CompetitionEntryMutationResult> {
  const response = await fetch(endpoint(command.competitionId, scenario), {
    method: "POST",
    cache: "no-store",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "idempotency-key": command.idempotencyKey,
    },
    body: JSON.stringify({
      competition_id: command.competitionId,
      expected_state_version: command.expectedStateVersion,
      idempotency_key: command.idempotencyKey,
      accepted_terms: command.acceptedTerms,
    }),
  });
  return adaptCompetitionEntryMutation(await parse(response));
}
