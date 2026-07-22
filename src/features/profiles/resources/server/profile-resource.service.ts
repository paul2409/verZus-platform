import "server-only";

import { readCurrentCrewSummary } from "@/lib/read-models/current-crew.server";

import type { ProfileResourceName } from "../model/profile-resource.types";
import {
  readProfileAvailability,
  readProfileCompetitiveSummary,
  readProfileIdentity,
} from "./profile-resource.repository";

function joinedLabel(value: Date): string {
  return `Joined ${new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(value)}`;
}

function percent(wins: number, matches: number): string {
  if (matches === 0) return "Not ranked";
  return `${Math.round((wins / matches) * 100)}%`;
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function timeLabel(value: string | null): string {
  return value ? value.slice(0, 5) : "";
}

export async function serializeProfileResource(
  userId: string,
  resource: ProfileResourceName,
): Promise<unknown | null> {
  switch (resource) {
    case "identity": {
      const identity = await readProfileIdentity(userId);
      if (!identity) return null;
      return {
        id: identity.id,
        display_name: identity.displayName,
        handle: identity.handle,
        title: identity.title,
        bio: identity.bio,
        location_label: identity.locationLabel,
        country_code: identity.countryCode,
        avatar_src: identity.avatarUrl,
        avatar_alt: `${identity.displayName} player avatar`,
        banner_src: identity.bannerUrl ?? "",
        verified: identity.verified,
        profile_visibility: identity.profileVisibility,
        joined_label: joinedLabel(identity.joinedAt),
      };
    }
    case "competitive-summary": {
      const summary = await readProfileCompetitiveSummary(userId);
      return {
        matches: summary.matches,
        wins: summary.wins,
        losses: summary.losses,
        draws: summary.draws,
        win_rate_label: percent(summary.wins, summary.matches),
        rating: summary.rating,
        weekly_rank: summary.weeklyRank,
        points: summary.points,
        trust_score: summary.trustScore,
        current_streak_label:
          summary.currentStreak === 0 ? "No active" : `${summary.currentStreak}`,
      };
    }
    case "crew": {
      const crew = await readCurrentCrewSummary(userId);
      return {
        crew: crew
          ? {
              id: crew.id,
              name: crew.name,
              tag: crew.tag,
              role_label: crew.roleLabel,
              href: `/crews/${crew.id}`,
            }
          : null,
      };
    }
    case "availability": {
      const availability = await readProfileAvailability(userId);
      if (
        availability.slotCount === 0 ||
        !availability.dayOfWeek ||
        !availability.startTime ||
        !availability.endTime
      ) {
        return {
          state: "unavailable",
          label: "No availability set",
          detail: "Add availability from your profile settings.",
          next_window_label: "No upcoming window",
        };
      }

      return {
        state: "available",
        label: "Availability configured",
        detail: `${availability.slotCount} weekly window${availability.slotCount === 1 ? "" : "s"}`,
        next_window_label: `${titleCase(availability.dayOfWeek)} ${timeLabel(availability.startTime)}-${timeLabel(availability.endTime)}${availability.timezone ? ` ${availability.timezone}` : ""}`,
      };
    }
  }
}
