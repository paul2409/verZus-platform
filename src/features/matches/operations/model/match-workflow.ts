import type { MatchOperationState } from "./match-operations.types";

export type MatchWorkflowSections = {
  checkIn: boolean;
  lobby: boolean;
  terminal: boolean;
  result: boolean;
  dispute: boolean;
  evidence: boolean;
};

const checkInStates = new Set<MatchOperationState>([
  "scheduled",
  "check-in-unavailable",
  "check-in-open",
  "checked-in",
  "opponent-not-checked-in",
  "both-ready",
]);

const lobbyStates = new Set<MatchOperationState>(["both-ready", "lobby-open", "in-progress"]);
const resultStates = new Set<MatchOperationState>([
  "in-progress",
  "submit-result",
  "awaiting-opponent-confirmation",
  "result-confirmed",
  "completed",
  "forfeit",
]);
const disputeStates = new Set<MatchOperationState>(["awaiting-opponent-confirmation", "disputed"]);
const evidenceStates = new Set<MatchOperationState>([
  "submit-result",
  "awaiting-opponent-confirmation",
  "disputed",
]);
const terminalStates = new Set<MatchOperationState>([
  "scheduled",
  "check-in-unavailable",
  "check-in-open",
  "checked-in",
  "opponent-not-checked-in",
  "both-ready",
  "lobby-open",
  "in-progress",
  "submit-result",
  "awaiting-opponent-confirmation",
]);

export function getMatchWorkflowSections(state: MatchOperationState): MatchWorkflowSections {
  return {
    checkIn: checkInStates.has(state),
    lobby: lobbyStates.has(state),
    terminal: terminalStates.has(state),
    result: resultStates.has(state),
    dispute: disputeStates.has(state),
    evidence: evidenceStates.has(state),
  };
}
