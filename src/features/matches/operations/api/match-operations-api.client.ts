// VERZUS M7.3 MATCH OPERATIONS ABORT-SAFE API CLIENT

import type {
  MatchCheckInViewModel,
  MatchDisputeViewModel,
  MatchEvidenceViewModel,
  MatchLobbyViewModel,
  MatchOperationReadScenario,
  MatchParticipantsViewModel,
  MatchResourceData,
  MatchResultViewModel,
  MatchSummaryViewModel,
  MatchSupportViewModel,
  MatchTimelineViewModel,
} from "../model/match-resource.types";
import type { MatchClockSnapshot, MatchOperationState } from "../model/match-operations.types";
import {
  adaptMatchCheckIn,
  adaptMatchClock,
  adaptMatchDispute,
  adaptMatchEvidence,
  adaptMatchLobby,
  adaptMatchParticipants,
  adaptMatchResult,
  adaptMatchSummary,
  adaptMatchSupport,
  adaptMatchTimeline,
  MatchOperationsApiClientError,
} from "./match-operations-api.adapter";

export type MatchOperationsReadRequest = {
  state: MatchOperationState;
  scenario?: MatchOperationReadScenario;
  signal?: AbortSignal;
};

type Adapter<TData> = (payload: unknown) => MatchResourceData<TData>;

async function read<TData>(
  matchId: string,
  resource: string,
  adapter: Adapter<TData>,
  request: MatchOperationsReadRequest,
) {
  const params = new URLSearchParams({ state: request.state });
  if (request.scenario && request.scenario !== "normal") params.set("scenario", request.scenario);

  let response: Response;
  try {
    response = await fetch(
      `/api/matches/${encodeURIComponent(matchId)}/${resource}?${params.toString()}`,
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
    throw new MatchOperationsApiClientError({
      code: "offline",
      message: "Match Operations is unavailable while offline.",
      requestId: `match-operations-offline-${resource}`,
      retryable: true,
    });
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new MatchOperationsApiClientError({
      code: "invalid_response",
      message: `The match ${resource} resource returned unreadable data.`,
      requestId:
        response.headers.get("x-request-id") ?? `match-operations-invalid-json-${resource}`,
      retryable: true,
    });
  }

  return adapter(payload);
}

export const getMatchSummary = (id: string, request: MatchOperationsReadRequest) =>
  read<MatchSummaryViewModel>(id, "summary", adaptMatchSummary, request);
export const getMatchParticipants = (id: string, request: MatchOperationsReadRequest) =>
  read<MatchParticipantsViewModel>(id, "participants", adaptMatchParticipants, request);
export const getMatchTimeline = (id: string, request: MatchOperationsReadRequest) =>
  read<MatchTimelineViewModel>(id, "timeline", adaptMatchTimeline, request);
export const getMatchClock = (id: string, request: MatchOperationsReadRequest) =>
  read<MatchClockSnapshot>(id, "clock", adaptMatchClock, request);
export const getMatchCheckIn = (id: string, request: MatchOperationsReadRequest) =>
  read<MatchCheckInViewModel>(id, "check-in", adaptMatchCheckIn, request);
export const getMatchLobby = (id: string, request: MatchOperationsReadRequest) =>
  read<MatchLobbyViewModel>(id, "lobby", adaptMatchLobby, request);
export const getMatchResult = (id: string, request: MatchOperationsReadRequest) =>
  read<MatchResultViewModel>(id, "result", adaptMatchResult, request);
export const getMatchEvidence = (id: string, request: MatchOperationsReadRequest) =>
  read<MatchEvidenceViewModel>(id, "evidence", adaptMatchEvidence, request);
export const getMatchDispute = (id: string, request: MatchOperationsReadRequest) =>
  read<MatchDisputeViewModel>(id, "dispute", adaptMatchDispute, request);
export const getMatchSupport = (id: string, request: MatchOperationsReadRequest) =>
  read<MatchSupportViewModel>(id, "support", adaptMatchSupport, request);
