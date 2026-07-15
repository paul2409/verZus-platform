// VERZUS M5 STEPS 5.1-5.4

import type { PlayWidgetId, PlayWidgetState } from "../contracts";
import {
  derivePlayScreenVariant,
  type CrewSummary,
  type CurrentCheckIn,
  type CurrentPosition,
  type NextMatch,
  type PlayerStatus,
  type RecentActivityItem,
  type RecommendedCompetition,
} from "../model";

export interface PlayResource<T> {
  state: PlayWidgetState;
  data: T | null;
  errorCode: string | null;
  requestId: string | null;
}

export interface PlayResources {
  playerStatus: PlayResource<PlayerStatus>;
  nextMatch: PlayResource<NextMatch>;
  currentCheckIn: PlayResource<CurrentCheckIn>;
  currentPosition: PlayResource<CurrentPosition>;
  crewSummary: PlayResource<CrewSummary>;
  recommendedCompetitions: PlayResource<RecommendedCompetition[]>;
  recentActivity: PlayResource<RecentActivityItem[]>;
}

export interface PlayWidgetView<T> extends PlayResource<T> {
  id: PlayWidgetId;
  available: boolean;
  stale: boolean;
}

export interface PlayCommandCenterViewModel {
  variant: ReturnType<typeof derivePlayScreenVariant>;
  online: boolean;
  partialFailureCount: number;
  essentialActionsAvailable: boolean;
  playerStatus: PlayWidgetView<PlayerStatus>;
  nextMatch: PlayWidgetView<NextMatch>;
  currentCheckIn: PlayWidgetView<CurrentCheckIn>;
  currentPosition: PlayWidgetView<CurrentPosition>;
  crewSummary: PlayWidgetView<CrewSummary>;
  recommendedCompetitions: PlayWidgetView<RecommendedCompetition[]>;
  recentActivity: PlayWidgetView<RecentActivityItem[]>;
}

const failureStates = new Set<PlayWidgetState>([
  "error",
  "offline",
  "unauthorized",
  "forbidden",
  "not_found",
  "maintenance",
  "partial_failure",
]);

function widgetView<T>(id: PlayWidgetId, resource: PlayResource<T>): PlayWidgetView<T> {
  return {
    ...resource,
    id,
    available: !failureStates.has(resource.state),
    stale: resource.state === "stale",
  };
}

export function createPlayResource<T>(
  state: PlayWidgetState,
  data: T | null,
  errorCode: string | null = null,
  requestId: string | null = null,
): PlayResource<T> {
  return {
    state,
    data,
    errorCode,
    requestId,
  };
}

export function buildPlayCommandCenterViewModel(
  resources: PlayResources,
  online: boolean,
): PlayCommandCenterViewModel {
  const playerStatus = widgetView("player-status", resources.playerStatus);
  const nextMatch = widgetView("next-match", resources.nextMatch);
  const currentCheckIn = widgetView("check-in", resources.currentCheckIn);
  const currentPosition = widgetView("current-position", resources.currentPosition);
  const crewSummary = widgetView("crew-pulse", resources.crewSummary);
  const recommendedCompetitions = widgetView("opportunities", resources.recommendedCompetitions);
  const recentActivity = widgetView("recent-activity", resources.recentActivity);

  const widgetViews = [
    playerStatus,
    nextMatch,
    currentCheckIn,
    currentPosition,
    crewSummary,
    recommendedCompetitions,
    recentActivity,
  ] as const;

  const failedWidgets = widgetViews
    .filter((widget) => !widget.available)
    .map((widget) => widget.id);

  const essentialActionsAvailable = online && nextMatch.available && currentCheckIn.available;

  return {
    variant: derivePlayScreenVariant({
      online,
      nextMatch: nextMatch.data,
      checkIn: currentCheckIn.data,
      crew: crewSummary.data,
      recommendedCompetitions: recommendedCompetitions.data ?? [],
      failedWidgets,
    }),
    online,
    partialFailureCount: failedWidgets.length,
    essentialActionsAvailable,
    playerStatus,
    nextMatch,
    currentCheckIn,
    currentPosition,
    crewSummary,
    recommendedCompetitions,
    recentActivity,
  };
}
