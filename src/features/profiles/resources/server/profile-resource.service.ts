// VERZUS M11.4 SERVER-AUTHORITATIVE PROFILE READ MODELS

import { ownPlayerProfileMock } from "../../foundation";
import { readProfilePrivacyForPublicProjection } from "../../privacy/server/profile-privacy.store";
import type { ProfileResourceName, ProfileResourceScenario } from "../model/profile-resource.types";

export function normalizeProfileResourceScenario(value: string | null): ProfileResourceScenario {
  const allowed: ProfileResourceScenario[] = [
    "normal",
    "stale",
    "empty",
    "error",
    "offline",
    "slow",
    "malformed",
    "unauthorized",
    "forbidden",
    "not-found",
    "maintenance",
  ];
  return allowed.includes(value as ProfileResourceScenario)
    ? (value as ProfileResourceScenario)
    : "normal";
}

export function serializeProfileResource(
  resource: ProfileResourceName,
  scenario: ProfileResourceScenario,
): unknown {
  const privacySettings = readProfilePrivacyForPublicProjection();
  switch (resource) {
    case "identity":
      return {
        id: ownPlayerProfileMock.identity.id,
        display_name: ownPlayerProfileMock.identity.displayName,
        handle: ownPlayerProfileMock.identity.handle,
        title: ownPlayerProfileMock.identity.title,
        bio: ownPlayerProfileMock.identity.bio,
        location_label: ownPlayerProfileMock.identity.locationLabel,
        country_code: ownPlayerProfileMock.identity.countryCode,
        avatar_src: ownPlayerProfileMock.identity.avatarSrc,
        avatar_alt: ownPlayerProfileMock.identity.avatarAlt,
        banner_src: ownPlayerProfileMock.identity.bannerSrc,
        verified: ownPlayerProfileMock.identity.verified,
        profile_visibility: privacySettings.profileVisibility,
        joined_label: ownPlayerProfileMock.identity.joinedLabel,
      };
    case "competitive-summary":
      return {
        matches: ownPlayerProfileMock.stats.matches,
        wins: ownPlayerProfileMock.stats.wins,
        losses: ownPlayerProfileMock.stats.losses,
        draws: ownPlayerProfileMock.stats.draws,
        win_rate_label: ownPlayerProfileMock.stats.winRateLabel,
        rating: ownPlayerProfileMock.stats.rating,
        weekly_rank: ownPlayerProfileMock.stats.weeklyRank,
        points: ownPlayerProfileMock.stats.points,
        trust_score: ownPlayerProfileMock.stats.trustScore,
        current_streak_label: ownPlayerProfileMock.stats.currentStreakLabel,
      };
    case "crew":
      return {
        crew:
          scenario === "empty" || !ownPlayerProfileMock.crew
            ? null
            : {
                id: ownPlayerProfileMock.crew.id,
                name: ownPlayerProfileMock.crew.name,
                tag: ownPlayerProfileMock.crew.tag,
                role_label: ownPlayerProfileMock.crew.roleLabel,
                href: ownPlayerProfileMock.crew.href,
              },
      };
    case "availability":
      return {
        state: ownPlayerProfileMock.availability.state,
        label: ownPlayerProfileMock.availability.label,
        detail: ownPlayerProfileMock.availability.detail,
        next_window_label: ownPlayerProfileMock.availability.nextWindowLabel,
      };
  }
}
