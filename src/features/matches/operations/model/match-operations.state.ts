// VERZUS M7.1 MATCH OPERATIONS FOUNDATION

import { matchOperationStates, type MatchOperationState } from "./match-operations.types";

export const defaultMatchOperationState: MatchOperationState = "check-in-open";

export const matchOperationStateLabels: Record<MatchOperationState, string> = {
  scheduled: "Scheduled",
  "check-in-unavailable": "Check-in unavailable",
  "check-in-open": "Check-in open",
  "checked-in": "Checked in",
  "opponent-not-checked-in": "Opponent not checked in",
  "both-ready": "Both ready",
  "lobby-open": "Lobby open",
  "in-progress": "Match in progress",
  "submit-result": "Submit result",
  "awaiting-opponent-confirmation": "Awaiting opponent confirmation",
  "result-confirmed": "Result confirmed",
  disputed: "Disputed",
  forfeit: "Forfeit",
  cancelled: "Cancelled",
  completed: "Completed",
};

export function parseMatchOperationState(
  value: string | string[] | undefined,
): MatchOperationState {
  const candidate = Array.isArray(value) ? value[0] : value;
  return matchOperationStates.includes(candidate as MatchOperationState)
    ? (candidate as MatchOperationState)
    : defaultMatchOperationState;
}
