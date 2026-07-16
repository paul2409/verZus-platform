import type {
  CompetitionBracketViewModel,
  CompetitionDetailResourceData,
  CompetitionDetailScenario,
  CompetitionEligibilityViewModel,
  CompetitionParticipantsViewModel,
  CompetitionRewardsViewModel,
  CompetitionRulesViewModel,
  CompetitionScheduleViewModel,
  CompetitionSummaryViewModel,
} from "../model/competition-detail.types";
import {
  adaptCompetitionBracket,
  adaptCompetitionEligibility,
  adaptCompetitionParticipants,
  adaptCompetitionRewards,
  adaptCompetitionRules,
  adaptCompetitionSchedule,
  adaptCompetitionSummary,
  CompetitionDetailApiClientError,
} from "./competition-detail-api.adapter";

export type CompetitionDetailReadRequest = {
  scenario?: CompetitionDetailScenario;
  signal?: AbortSignal;
};

type Adapter<TData> = (payload: unknown) => CompetitionDetailResourceData<TData>;

async function read<TData>(
  competitionId: string,
  resource: string,
  adapter: Adapter<TData>,
  request: CompetitionDetailReadRequest,
) {
  const params = new URLSearchParams();
  if (request.scenario && request.scenario !== "normal") params.set("scenario", request.scenario);
  const query = params.size ? `?${params.toString()}` : "";

  let response: Response;
  try {
    response = await fetch(
      `/api/competitions/${encodeURIComponent(competitionId)}/${resource}${query}`,
      {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
        headers: { accept: "application/json" },
        ...(request.signal ? { signal: request.signal } : {}),
      },
    );
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new CompetitionDetailApiClientError({
      code: "offline",
      message: "Competition details are unavailable while offline.",
      requestId: "competition-detail-offline",
      retryable: true,
    });
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new CompetitionDetailApiClientError({
      code: "invalid_response",
      message: "Competition details returned unreadable data.",
      requestId: response.headers.get("x-request-id") ?? "competition-detail-invalid-json",
      retryable: true,
    });
  }

  return adapter(payload);
}

export const getCompetitionSummary = (id: string, request: CompetitionDetailReadRequest = {}) =>
  read<CompetitionSummaryViewModel>(id, "summary", adaptCompetitionSummary, request);
export const getCompetitionEligibility = (id: string, request: CompetitionDetailReadRequest = {}) =>
  read<CompetitionEligibilityViewModel>(id, "eligibility", adaptCompetitionEligibility, request);
export const getCompetitionSchedule = (id: string, request: CompetitionDetailReadRequest = {}) =>
  read<CompetitionScheduleViewModel>(id, "schedule", adaptCompetitionSchedule, request);
export const getCompetitionRewards = (id: string, request: CompetitionDetailReadRequest = {}) =>
  read<CompetitionRewardsViewModel>(id, "rewards", adaptCompetitionRewards, request);
export const getCompetitionRules = (id: string, request: CompetitionDetailReadRequest = {}) =>
  read<CompetitionRulesViewModel>(id, "rules", adaptCompetitionRules, request);
export const getCompetitionParticipants = (
  id: string,
  request: CompetitionDetailReadRequest = {},
) =>
  read<CompetitionParticipantsViewModel>(id, "participants", adaptCompetitionParticipants, request);
export const getCompetitionBracket = (id: string, request: CompetitionDetailReadRequest = {}) =>
  read<CompetitionBracketViewModel>(id, "bracket", adaptCompetitionBracket, request);
