// VERZUS M11.2 SERVER-AUTHORITATIVE PUBLIC PROFILE PROJECTION

import type {
  ProfileFieldAudience,
  PublicPlayerProfileRecord,
  PublicPlayerProfileViewModel,
  PublicProfilePermissions,
  PublicProfileViewerMode,
} from "../model/public-player-profile.types";
import { publicProfileViewerModes } from "../model/public-player-profile.types";

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parsePublicProfileViewerMode(
  value: string | string[] | undefined,
): PublicProfileViewerMode {
  const candidate = first(value);
  return publicProfileViewerModes.includes(candidate as PublicProfileViewerMode)
    ? (candidate as PublicProfileViewerMode)
    : "member";
}

function audienceAllows(
  audience: ProfileFieldAudience,
  viewerMode: PublicProfileViewerMode,
): boolean {
  if (viewerMode === "owner") return true;
  if (audience === "public") return viewerMode !== "blocked";
  if (audience === "friends") return viewerMode === "friend";
  return false;
}

function derivePermissions(
  record: PublicPlayerProfileRecord,
  viewerMode: PublicProfileViewerMode,
): PublicProfilePermissions {
  if (viewerMode === "blocked") {
    return {
      canEdit: false,
      canViewLocation: false,
      canViewCrew: false,
      canViewStatistics: false,
      canViewTrustScore: false,
      canViewMatchHistory: false,
      canViewGameHandles: false,
      canViewAchievements: false,
      canViewAvailability: false,
    };
  }

  const profileAccess =
    record.identity.profileVisibility === "public" ||
    viewerMode === "owner" ||
    (record.identity.profileVisibility === "friends" && viewerMode === "friend");

  if (!profileAccess) {
    return {
      canEdit: false,
      canViewLocation: false,
      canViewCrew: false,
      canViewStatistics: false,
      canViewTrustScore: false,
      canViewMatchHistory: false,
      canViewGameHandles: false,
      canViewAchievements: false,
      canViewAvailability: false,
    };
  }

  return {
    canEdit: viewerMode === "owner",
    canViewLocation: audienceAllows(record.privacy.location, viewerMode),
    canViewCrew: audienceAllows(record.privacy.crew, viewerMode),
    canViewStatistics: audienceAllows(record.privacy.statistics, viewerMode),
    canViewTrustScore: audienceAllows(record.privacy.trustScore, viewerMode),
    canViewMatchHistory: audienceAllows(record.privacy.matchHistory, viewerMode),
    canViewGameHandles: audienceAllows(record.privacy.gameHandles, viewerMode),
    canViewAchievements: audienceAllows(record.privacy.achievements, viewerMode),
    canViewAvailability: audienceAllows(record.privacy.availability, viewerMode),
  };
}

export function projectPublicPlayerProfile(
  record: PublicPlayerProfileRecord,
  viewerMode: PublicProfileViewerMode,
): PublicPlayerProfileViewModel {
  const permissions = derivePermissions(record, viewerMode);
  const blocked = viewerMode === "blocked";
  const hasProfileAccess =
    !blocked &&
    (record.identity.profileVisibility === "public" ||
      viewerMode === "owner" ||
      (record.identity.profileVisibility === "friends" && viewerMode === "friend"));
  const access = blocked ? "blocked" : hasProfileAccess ? "full" : "limited";

  const redactedFields = Object.entries({
    location: permissions.canViewLocation,
    crew: permissions.canViewCrew,
    statistics: permissions.canViewStatistics,
    trust: permissions.canViewTrustScore,
    matches: permissions.canViewMatchHistory,
    gameHandles: permissions.canViewGameHandles,
    achievements: permissions.canViewAchievements,
    availability: permissions.canViewAvailability,
  })
    .filter(([, allowed]) => !allowed)
    .map(([field]) => field);

  return {
    access,
    viewerMode,
    identity: {
      id: record.identity.id,
      displayName: record.identity.displayName,
      handle: record.identity.handle,
      title: record.identity.title,
      bio: hasProfileAccess ? record.identity.bio : null,
      locationLabel: permissions.canViewLocation ? record.identity.locationLabel : null,
      avatarSrc: blocked ? null : record.identity.avatarSrc,
      avatarAlt: record.identity.avatarAlt,
      bannerSrc: record.identity.bannerSrc,
      verified: blocked ? false : record.identity.verified,
      visibility: record.identity.profileVisibility,
      joinedLabel: record.identity.joinedLabel,
    },
    permissions,
    crew: permissions.canViewCrew ? record.crew : null,
    stats: permissions.canViewStatistics
      ? {
          ...record.stats,
          trustScore: permissions.canViewTrustScore ? record.stats.trustScore : null,
        }
      : null,
    games: hasProfileAccess
      ? record.games.map((game) => ({
          ...game,
          handle: permissions.canViewGameHandles ? game.handle : null,
        }))
      : [],
    recentMatches: permissions.canViewMatchHistory ? record.recentMatches : [],
    achievements: permissions.canViewAchievements ? record.achievements : [],
    availability: hasProfileAccess
      ? {
          state: record.availability.state,
          label: record.availability.publicLabel,
          detail: permissions.canViewAvailability ? record.availability.privateDetail : null,
          nextWindowLabel: permissions.canViewAvailability
            ? record.availability.nextWindowLabel
            : null,
        }
      : null,
    redactedFields,
  };
}
