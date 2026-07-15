// VERZUS M5 STEPS 5.1-5.4

import type { PlayScreenVariant, PlayWidgetId } from "../contracts";
import type { CrewSummary, CurrentCheckIn, NextMatch, RecommendedCompetition } from "./play.schema";

export interface PlayStateInput {
  online: boolean;
  nextMatch: NextMatch | null;
  checkIn: CurrentCheckIn | null;
  crew: CrewSummary | null;
  recommendedCompetitions: readonly RecommendedCompetition[];
  failedWidgets: readonly PlayWidgetId[];
}

export function derivePlayScreenVariant(input: PlayStateInput): PlayScreenVariant {
  if (!input.online) {
    return "offline";
  }

  if (input.failedWidgets.length > 0) {
    return "partial_api_failure";
  }

  if (input.nextMatch?.status === "starting_soon") {
    return "match_starting_soon";
  }

  if (input.checkIn?.state === "checked_in" || input.nextMatch?.status === "checked_in") {
    return "checked_in";
  }

  if (input.checkIn?.state === "open" || input.nextMatch?.status === "check_in_open") {
    return "check_in_open";
  }

  if (!input.nextMatch) {
    return "no_match_scheduled";
  }

  if (input.crew?.liveActivityCount && input.crew.liveActivityCount > 0) {
    return "crew_activity_present";
  }

  if (!input.crew) {
    return "no_crew";
  }

  if (input.recommendedCompetitions.some((competition) => competition.isFeatured)) {
    return "opportunities_available";
  }

  return "normal";
}
