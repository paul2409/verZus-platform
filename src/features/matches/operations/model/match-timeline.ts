// VERZUS M7.2 MATCH TIMELINE POLICY

import { matchOperationStateLabels } from "./match-operations.state";
import { formatMatchTimelineTime } from "./match-clock.policy";
import type {
  MatchClockSnapshot,
  MatchOperationState,
  MatchTimelineItem,
} from "./match-operations.types";

const timelineOrder = [
  "scheduled",
  "check-in-open",
  "both-ready",
  "lobby-open",
  "in-progress",
  "submit-result",
  "completed",
] as const satisfies readonly MatchOperationState[];

const progressState: Record<MatchOperationState, (typeof timelineOrder)[number]> = {
  scheduled: "scheduled",
  "check-in-unavailable": "scheduled",
  "check-in-open": "check-in-open",
  "checked-in": "check-in-open",
  "opponent-not-checked-in": "check-in-open",
  "both-ready": "both-ready",
  "lobby-open": "lobby-open",
  "in-progress": "in-progress",
  "submit-result": "submit-result",
  "awaiting-opponent-confirmation": "submit-result",
  "result-confirmed": "submit-result",
  disputed: "completed",
  forfeit: "completed",
  cancelled: "completed",
  completed: "completed",
};

function timelineTimeLabel(
  item: (typeof timelineOrder)[number],
  clock: MatchClockSnapshot,
): string {
  switch (item) {
    case "scheduled":
      return `Starts ${formatMatchTimelineTime(clock.scheduledAt)} UTC`;
    case "check-in-open":
      return formatMatchTimelineTime(clock.checkInOpensAt) + " UTC";
    case "both-ready":
      return "Event-driven readiness";
    case "lobby-open":
      return formatMatchTimelineTime(clock.lobbyOpensAt) + " UTC";
    case "in-progress":
      return formatMatchTimelineTime(clock.matchStartsAt) + " UTC";
    case "submit-result":
      return `Due ${formatMatchTimelineTime(clock.resultDueAt)} UTC`;
    case "completed":
      return "Final server state";
  }
}

export function buildMatchTimeline(
  state: MatchOperationState,
  clock: MatchClockSnapshot,
): MatchTimelineItem[] {
  const currentIndex = timelineOrder.indexOf(progressState[state]);
  const warningState = state === "disputed" || state === "forfeit" || state === "cancelled";

  return timelineOrder.map((item, index) => ({
    id: item,
    label: matchOperationStateLabels[item],
    timeLabel: timelineTimeLabel(item, clock),
    state:
      index < currentIndex
        ? "complete"
        : index === currentIndex
          ? warningState
            ? "warning"
            : "current"
          : "future",
  }));
}
