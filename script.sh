#!/usr/bin/env bash
set -Eeuo pipefail

MODE="${1:-install}"
SCRIPT_NAME="VERZUS_M11_11_2_Public_Profile_Permission_Boundaries_NO_TESTS.sh"
BACKUP_ROOT=".verzus-backups/m11-11-2-public-profile-permissions"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="${BACKUP_ROOT}/${STAMP}"
ARCHIVE="${BACKUP_DIR}/verzus-m11-11-2-before.tar.gz"
BACKUP_CREATED="false"
INSTALL_COMPLETE="false"

print_plan() {
  cat <<'PLAN'
VERZUS M11.2 - Public Player Profile and Permission Boundaries

KEEP
  - M11.1 own-profile composition, approved mobile hierarchy and local artwork
  - Completed M10 Rewards and Progression domain
  - Existing Player intel-card resources and shared profile primitives
  - Current application shell, navigation, design tokens and route boundaries
  - Read-only profile foundation and no-tests installation policy

REUSE
  - M11.1 identity, Crew, statistics, game identity, match and achievement types
  - M11.1 responsive profile visual language
  - Existing Badge, Image and Link primitives
  - Existing /profile route as the private owner experience
  - Existing long-name and missing-avatar safeguards

REPLACE
  - No M11.1 screen or route
  - No existing public-player implementation
  - No browser-decided field visibility

DELETE
  - No Rewards, Crew, Leaderboard, Match or Profile foundation code
  - No sensitive field sent to the public UI when policy denies access
  - No public edit controls or fake relationship mutations
  - No client-side permission authority
  - No Vitest or Playwright execution during installation

CREATE
  - Dynamic /players/[playerId] public-profile route
  - Server-side viewer and privacy policy projection
  - Distinct owner, friend, member, anonymous and blocked viewer modes
  - Public, friends-only and private profile visibility enforcement
  - Field-level controls for location, Crew, statistics, trust, matches, game handles, achievements and availability
  - Full, limited and blocked public-profile presentations
  - Long-name and missing-avatar public fixtures
  - Server-side not-found handling for unknown players
  - Own-profile link to the public representation
  - Focused structural verifier, ESLint and TypeScript gate
  - Timestamped backup, automatic failed-install restoration and rollback
PLAN
}

require_repo_root() {
  [[ -f package.json && -d src/app && -d src/features ]] || {
    echo "Error: run $SCRIPT_NAME from the VERZUS repository root."
    exit 1
  }
}

require_m11_1_prerequisite() {
  require_repo_root

  local required=(
    package.json
    scripts/verify-m11-11-1.mjs
    src/features/profiles/foundation/model/player-profile.types.ts
    src/features/profiles/foundation/mocks/player-profile.mock.ts
    src/features/profiles/foundation/ui/PlayerProfileFoundationScreen.tsx
    src/features/profiles/foundation/ui/PlayerProfileFoundationScreen.module.css
    'src/app/(platform)/profile/page.tsx'
  )

  local file
  for file in "${required[@]}"; do
    [[ -f "$file" ]] || {
      echo "Error: missing M11.1 prerequisite: $file"
      exit 1
    }
  done

  echo "Running M11.1 prerequisite marker verification..."
  node scripts/verify-m11-11-1.mjs

  local owned_new_files=(
    src/features/profiles/public-profile/model/public-player-profile.types.ts
    src/features/profiles/public-profile/mocks/public-player-profile.mock.ts
    src/features/profiles/public-profile/server/public-profile-policy.ts
    src/features/profiles/public-profile/ui/PlayerPublicProfileScreen.tsx
    src/features/profiles/public-profile/ui/PlayerPublicProfileScreen.module.css
    src/features/profiles/public-profile/ui/index.ts
    src/features/profiles/public-profile/index.ts
    'src/app/(platform)/players/[playerId]/page.tsx'
    'src/app/(platform)/players/[playerId]/loading.tsx'
    'src/app/(platform)/players/[playerId]/error.tsx'
    'src/app/(platform)/players/[playerId]/not-found.tsx'
    docs/milestones/M11/m11-11-2-public-profile-permissions.md
    scripts/verify-m11-11-2.mjs
    tsconfig.m11-11-2.json
  )

  for file in "${owned_new_files[@]}"; do
    if [[ -f "$file" ]] && ! grep -q 'VERZUS M11.2\|M11.2 —' "$file"; then
      echo "Error: refusing to overwrite unowned file: $file"
      exit 1
    fi
  done
}

backup_current_state() {
  mkdir -p "$BACKUP_DIR"

  local candidates=(
    package.json
    src/features/profiles/foundation/ui/PlayerProfileFoundationScreen.tsx
    src/features/profiles/foundation/ui/PlayerProfileFoundationScreen.module.css
    src/features/profiles/public-profile/model/public-player-profile.types.ts
    src/features/profiles/public-profile/mocks/public-player-profile.mock.ts
    src/features/profiles/public-profile/server/public-profile-policy.ts
    src/features/profiles/public-profile/ui/PlayerPublicProfileScreen.tsx
    src/features/profiles/public-profile/ui/PlayerPublicProfileScreen.module.css
    src/features/profiles/public-profile/ui/index.ts
    src/features/profiles/public-profile/index.ts
    'src/app/(platform)/players/[playerId]/page.tsx'
    'src/app/(platform)/players/[playerId]/loading.tsx'
    'src/app/(platform)/players/[playerId]/error.tsx'
    'src/app/(platform)/players/[playerId]/not-found.tsx'
    docs/milestones/M11/m11-11-2-public-profile-permissions.md
    scripts/verify-m11-11-2.mjs
    tsconfig.m11-11-2.json
  )

  local paths=()
  local file
  for file in "${candidates[@]}"; do
    [[ -f "$file" ]] && paths+=("$file")
  done

  tar -czf "$ARCHIVE" "${paths[@]}"

  cat > "$BACKUP_DIR/manifest.txt" <<MANIFEST
VERZUS M11.2 backup
Created: $(date -Iseconds)
Branch: $(git branch --show-current 2>/dev/null || echo unavailable)
Commit: $(git rev-parse HEAD 2>/dev/null || echo unavailable)
Archive: $ARCHIVE
Rollback: bash ./$SCRIPT_NAME rollback
MANIFEST

  BACKUP_CREATED="true"
  echo "Rollback archive created: $ARCHIVE"
}

remove_m11_2_files() {
  rm -f \
    src/features/profiles/public-profile/model/public-player-profile.types.ts \
    src/features/profiles/public-profile/mocks/public-player-profile.mock.ts \
    src/features/profiles/public-profile/server/public-profile-policy.ts \
    src/features/profiles/public-profile/ui/PlayerPublicProfileScreen.tsx \
    src/features/profiles/public-profile/ui/PlayerPublicProfileScreen.module.css \
    src/features/profiles/public-profile/ui/index.ts \
    src/features/profiles/public-profile/index.ts \
    'src/app/(platform)/players/[playerId]/page.tsx' \
    'src/app/(platform)/players/[playerId]/loading.tsx' \
    'src/app/(platform)/players/[playerId]/error.tsx' \
    'src/app/(platform)/players/[playerId]/not-found.tsx' \
    docs/milestones/M11/m11-11-2-public-profile-permissions.md \
    scripts/verify-m11-11-2.mjs \
    tsconfig.m11-11-2.json

  rmdir 'src/app/(platform)/players/[playerId]' 2>/dev/null || true
  rmdir 'src/app/(platform)/players' 2>/dev/null || true
  rmdir src/features/profiles/public-profile/model 2>/dev/null || true
  rmdir src/features/profiles/public-profile/mocks 2>/dev/null || true
  rmdir src/features/profiles/public-profile/server 2>/dev/null || true
  rmdir src/features/profiles/public-profile/ui 2>/dev/null || true
  rmdir src/features/profiles/public-profile 2>/dev/null || true
}

restore_archive() {
  local archive="$1"
  remove_m11_2_files
  tar -xzf "$archive"
}

on_error() {
  local code=$?
  if [[ "$MODE" == "install" && "$BACKUP_CREATED" == "true" && "$INSTALL_COMPLETE" != "true" ]]; then
    echo
    echo "M11.2 installation failed. Restoring the pre-install archive..."
    restore_archive "$ARCHIVE"
    echo "Restored: $ARCHIVE"
  fi
  exit "$code"
}

trap on_error ERR

write_types() {
  mkdir -p src/features/profiles/public-profile/model

  cat > src/features/profiles/public-profile/model/public-player-profile.types.ts <<'EOF'
// VERZUS M11.2 PUBLIC PROFILE TYPES AND PERMISSION CONTRACT

import type {
  PlayerAchievementPreview,
  PlayerCrewIdentity,
  PlayerMatchResult,
  PlayerProfileStats,
  PlayerProfileVisibility,
} from "../../foundation";

export const publicProfileViewerModes = [
  "anonymous",
  "member",
  "friend",
  "owner",
  "blocked",
] as const;

export type PublicProfileViewerMode = (typeof publicProfileViewerModes)[number];
export type PublicProfileAccess = "full" | "limited" | "blocked";
export type ProfileFieldAudience = "public" | "friends" | "private";

export type PublicProfileIdentityRecord = {
  id: string;
  displayName: string;
  handle: string;
  title: string;
  bio: string;
  locationLabel: string;
  avatarSrc: string | null;
  avatarAlt: string;
  bannerSrc: string;
  verified: boolean;
  profileVisibility: PlayerProfileVisibility;
  joinedLabel: string;
};

export type PublicProfileGameRecord = {
  id: string;
  gameLabel: string;
  handle: string;
  platformLabel: string;
  rankLabel: string;
  recordLabel: string;
  verified: boolean;
};

export type PublicProfileMatchRecord = {
  id: string;
  opponentLabel: string;
  competitionLabel: string;
  gameLabel: string;
  scoreLabel: string;
  result: PlayerMatchResult;
  playedAtLabel: string;
  href: string;
};

export type PublicProfileAvailabilityRecord = {
  state: "available" | "limited" | "unavailable";
  publicLabel: string;
  privateDetail: string;
  nextWindowLabel: string;
};

export type PublicProfilePrivacyPolicy = {
  location: ProfileFieldAudience;
  crew: ProfileFieldAudience;
  statistics: ProfileFieldAudience;
  trustScore: ProfileFieldAudience;
  matchHistory: ProfileFieldAudience;
  gameHandles: ProfileFieldAudience;
  achievements: ProfileFieldAudience;
  availability: ProfileFieldAudience;
};

export type PublicPlayerProfileRecord = {
  identity: PublicProfileIdentityRecord;
  crew: PlayerCrewIdentity | null;
  stats: PlayerProfileStats;
  games: readonly PublicProfileGameRecord[];
  recentMatches: readonly PublicProfileMatchRecord[];
  achievements: readonly PlayerAchievementPreview[];
  availability: PublicProfileAvailabilityRecord;
  privacy: PublicProfilePrivacyPolicy;
};

export type PublicProfilePermissions = {
  canEdit: boolean;
  canViewLocation: boolean;
  canViewCrew: boolean;
  canViewStatistics: boolean;
  canViewTrustScore: boolean;
  canViewMatchHistory: boolean;
  canViewGameHandles: boolean;
  canViewAchievements: boolean;
  canViewAvailability: boolean;
};

export type PublicPlayerIdentityView = {
  id: string;
  displayName: string;
  handle: string;
  title: string;
  bio: string | null;
  locationLabel: string | null;
  avatarSrc: string | null;
  avatarAlt: string;
  bannerSrc: string;
  verified: boolean;
  visibility: PlayerProfileVisibility;
  joinedLabel: string;
};

export type PublicGameIdentityView = Omit<PublicProfileGameRecord, "handle"> & {
  handle: string | null;
};

export type PublicAvailabilityView = {
  state: PublicProfileAvailabilityRecord["state"];
  label: string;
  detail: string | null;
  nextWindowLabel: string | null;
};

export type PublicPlayerProfileViewModel = {
  access: PublicProfileAccess;
  viewerMode: PublicProfileViewerMode;
  identity: PublicPlayerIdentityView;
  permissions: PublicProfilePermissions;
  crew: PlayerCrewIdentity | null;
  stats: Omit<PlayerProfileStats, "trustScore"> & { trustScore: number | null } | null;
  games: readonly PublicGameIdentityView[];
  recentMatches: readonly PublicProfileMatchRecord[];
  achievements: readonly PlayerAchievementPreview[];
  availability: PublicAvailabilityView | null;
  redactedFields: readonly string[];
};
EOF
}

write_mocks() {
  mkdir -p src/features/profiles/public-profile/mocks

  cat > src/features/profiles/public-profile/mocks/public-player-profile.mock.ts <<'EOF'
// VERZUS M11.2 DETERMINISTIC PUBLIC PLAYER RECORDS

import type { PublicPlayerProfileRecord } from "../model/public-player-profile.types";

const baseMatches = [
  {
    id: "match-prismo-9076",
    opponentLabel: "Team Alpha",
    competitionLabel: "Weekly Elite Pool",
    gameLabel: "EA FC",
    scoreLabel: "2-0",
    result: "win" as const,
    playedAtLabel: "2 hours ago",
    href: "/matches/match-prismo-9076",
  },
  {
    id: "match-prismo-8190",
    opponentLabel: "Night Owls",
    competitionLabel: "Xenon Crew Series",
    gameLabel: "EA FC",
    scoreLabel: "1-2",
    result: "loss" as const,
    playedAtLabel: "1 day ago",
    href: "/matches/match-prismo-8190",
  },
  {
    id: "match-prismo-7481",
    opponentLabel: "Apex Crew",
    competitionLabel: "COD Mobile Clash",
    gameLabel: "COD Mobile",
    scoreLabel: "3-1",
    result: "win" as const,
    playedAtLabel: "2 days ago",
    href: "/matches/match-prismo-7481",
  },
] as const;

const baseGames = [
  {
    id: "identity-eafc",
    gameLabel: "EA FC",
    handle: "Prismo_PS",
    platformLabel: "PlayStation",
    rankLabel: "Elite Division",
    recordLabel: "128-36",
    verified: true,
  },
  {
    id: "identity-codm",
    gameLabel: "COD Mobile",
    handle: "PrismoX",
    platformLabel: "Mobile",
    rankLabel: "Legendary",
    recordLabel: "64-28",
    verified: true,
  },
  {
    id: "identity-clash",
    gameLabel: "Clash Royale",
    handle: "PrismoCR",
    platformLabel: "Mobile",
    rankLabel: "Ultimate Champion",
    recordLabel: "17-11",
    verified: false,
  },
] as const;

const baseAchievements = [
  {
    id: "achievement-first-blood",
    title: "First blood",
    rarity: "rare" as const,
    progressLabel: "Unlocked",
    unlocked: true,
  },
  {
    id: "achievement-weekly-warrior",
    title: "Weekly warrior",
    rarity: "epic" as const,
    progressLabel: "80%",
    unlocked: false,
  },
  {
    id: "achievement-tournament-contender",
    title: "Tournament contender",
    rarity: "legendary" as const,
    progressLabel: "50%",
    unlocked: false,
  },
] as const;

const prismo: PublicPlayerProfileRecord = {
  identity: {
    id: "player-prismo",
    displayName: "Prismo",
    handle: "@prismo",
    title: "Competitive warrior",
    bio: "EA FC competitor, Crew contributor and verified VERZUS player focused on clean wins and consistent improvement.",
    locationLabel: "Lagos, Nigeria",
    avatarSrc: "/profiles/prismo-avatar.svg",
    avatarAlt: "Prismo profile avatar",
    bannerSrc: "/profiles/prismo-banner.svg",
    verified: true,
    profileVisibility: "public",
    joinedLabel: "Joined November 2024",
  },
  crew: {
    id: "crew-xenon-esports",
    name: "Xenon Esports",
    tag: "XEN",
    roleLabel: "Captain",
    href: "/crews/crew-xenon-esports",
  },
  stats: {
    matches: 312,
    wins: 209,
    losses: 91,
    draws: 12,
    winRateLabel: "67%",
    rating: 2184,
    weeklyRank: 23,
    points: 9840,
    trustScore: 92,
    currentStreakLabel: "4W",
  },
  games: baseGames,
  recentMatches: baseMatches,
  achievements: baseAchievements,
  availability: {
    state: "available",
    publicLabel: "Available for competition",
    privateDetail: "Open to ranked EA FC matches and Crew fixtures.",
    nextWindowLabel: "Today, 18:00-23:00 WAT",
  },
  privacy: {
    location: "public",
    crew: "public",
    statistics: "public",
    trustScore: "public",
    matchHistory: "public",
    gameHandles: "friends",
    achievements: "public",
    availability: "friends",
  },
};

const rivalKing: PublicPlayerProfileRecord = {
  ...prismo,
  identity: {
    ...prismo.identity,
    id: "player-rivalking",
    displayName: "RivalKing",
    handle: "@rivalking",
    title: "Calculated finisher",
    bio: "Ranked EA FC player known for controlled possession and late-match pressure.",
    locationLabel: "Abuja, Nigeria",
    avatarSrc: null,
    avatarAlt: "RivalKing avatar",
    joinedLabel: "Joined January 2025",
  },
  crew: {
    id: "crew-nova",
    name: "Nova",
    tag: "NO",
    roleLabel: "Member",
    href: "/crews/crew-nova",
  },
  stats: {
    ...prismo.stats,
    matches: 296,
    wins: 213,
    losses: 75,
    draws: 8,
    winRateLabel: "72%",
    rating: 2310,
    weeklyRank: 2,
    points: 24330,
    trustScore: 95,
    currentStreakLabel: "2W",
  },
};

const ghosty: PublicPlayerProfileRecord = {
  ...prismo,
  identity: {
    ...prismo.identity,
    id: "player-ghosty",
    displayName: "Ghosty",
    handle: "@ghosty",
    title: "Clutch specialist",
    bio: "Competitive player profile shared with approved friends.",
    locationLabel: "Accra, Ghana",
    profileVisibility: "friends",
  },
  privacy: {
    location: "friends",
    crew: "friends",
    statistics: "friends",
    trustScore: "friends",
    matchHistory: "friends",
    gameHandles: "friends",
    achievements: "friends",
    availability: "friends",
  },
};

const privatePlayer: PublicPlayerProfileRecord = {
  ...prismo,
  identity: {
    ...prismo.identity,
    id: "player-private",
    displayName: "Cipher",
    handle: "@cipher",
    title: "Private competitor",
    bio: "This biography must not be exposed to unauthorized viewers.",
    locationLabel: "Private location",
    avatarSrc: null,
    avatarAlt: "Cipher avatar",
    profileVisibility: "private",
  },
  crew: null,
  privacy: {
    location: "private",
    crew: "private",
    statistics: "private",
    trustScore: "private",
    matchHistory: "private",
    gameHandles: "private",
    achievements: "private",
    availability: "private",
  },
};

const longNamePlayer: PublicPlayerProfileRecord = {
  ...rivalKing,
  identity: {
    ...rivalKing.identity,
    id: "player-long-name",
    displayName: "The Relentless Continental Champion",
    handle: "@relentless-continental-champion",
    title: "Long-content resilience preview",
    avatarSrc: null,
    avatarAlt: "Long-name player avatar",
  },
};

const records: Record<string, PublicPlayerProfileRecord> = {
  [prismo.identity.id]: prismo,
  [rivalKing.identity.id]: rivalKing,
  [ghosty.identity.id]: ghosty,
  [privatePlayer.identity.id]: privatePlayer,
  [longNamePlayer.identity.id]: longNamePlayer,
};

export function getPublicPlayerProfileRecord(playerId: string): PublicPlayerProfileRecord | null {
  return records[playerId] ?? null;
}

export const publicPlayerProfileIds = Object.freeze(Object.keys(records));
EOF
}

write_policy() {
  mkdir -p src/features/profiles/public-profile/server

  cat > src/features/profiles/public-profile/server/public-profile-policy.ts <<'EOF'
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

function audienceAllows(audience: ProfileFieldAudience, viewerMode: PublicProfileViewerMode): boolean {
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
EOF
}

write_ui() {
  mkdir -p src/features/profiles/public-profile/ui

  cat > src/features/profiles/public-profile/ui/PlayerPublicProfileScreen.tsx <<'EOF'
// VERZUS M11.2 PUBLIC PROFILE PRESENTATION

import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/primitives/badge";

import type {
  PublicGameIdentityView,
  PublicPlayerProfileViewModel,
  PublicProfileMatchRecord,
} from "../model/public-player-profile.types";
import styles from "./PlayerPublicProfileScreen.module.css";

const numberFormatter = new Intl.NumberFormat("en-US");

function initialsFor(displayName: string): string {
  return (
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "P"
  );
}

function PublicAvatar({ model }: { model: PublicPlayerProfileViewModel }) {
  return (
    <div className={styles.avatarWrap}>
      {model.identity.avatarSrc ? (
        <Image
          alt={model.identity.avatarAlt}
          className={styles.avatar}
          height={112}
          priority
          src={model.identity.avatarSrc}
          width={112}
        />
      ) : (
        <span
          aria-label={`${model.identity.displayName} avatar fallback`}
          className={styles.avatarFallback}
        >
          {initialsFor(model.identity.displayName)}
        </span>
      )}
      {model.identity.verified ? (
        <span aria-label="Verified player" className={styles.verifiedMark}>
          ✓
        </span>
      ) : null}
    </div>
  );
}

function AccessNotice({ model }: { model: PublicPlayerProfileViewModel }) {
  const copy =
    model.viewerMode === "owner"
      ? "You are reviewing the public representation of your profile. Private controls remain on your own profile."
      : model.viewerMode === "friend"
        ? "Friend-level fields are visible because the server-authorized viewer relationship permits them."
        : "Only fields allowed by this player's privacy policy are included in this public view.";

  return (
    <aside className={styles.accessNotice} data-access={model.access}>
      <div>
        <strong>{model.access === "full" ? "Permission-aware profile" : "Restricted profile"}</strong>
        <p>{copy}</p>
      </div>
      <Badge tone={model.access === "full" ? "positive" : "warning"} variant="soft">
        {model.viewerMode}
      </Badge>
    </aside>
  );
}

function RestrictedProfile({ model }: { model: PublicPlayerProfileViewModel }) {
  const blocked = model.access === "blocked";

  return (
    <main
      className={styles.page}
      data-m11-stage="11.2"
      data-profile-access={model.access}
      data-profile-scope="public"
    >
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Season Zero · Public profile</p>
          <h1>Player profile</h1>
        </div>
        <Badge tone={blocked ? "negative" : "warning"} variant="outline">
          {blocked ? "Blocked" : model.identity.visibility}
        </Badge>
      </header>

      <section className={styles.restrictedCard}>
        <span aria-hidden="true" className={styles.restrictedGlyph}>
          {blocked ? "⊘" : "◇"}
        </span>
        <p>{model.identity.handle}</p>
        <h2>{blocked ? "Profile unavailable" : "This profile is restricted"}</h2>
        <p>
          {blocked
            ? "This viewer relationship cannot access the player profile. No private profile data was sent to this screen."
            : "The player shares profile details only with approved viewers. Public identity is intentionally limited."}
        </p>
        <Link className={styles.secondaryAction} href="/leaderboards/weekly">
          Return to leaderboards
        </Link>
      </section>
    </main>
  );
}

function StatPanel({ model }: { model: PublicPlayerProfileViewModel }) {
  if (!model.stats) {
    return (
      <section className={styles.redactedPanel}>
        <strong>Statistics are private</strong>
        <p>The server projection did not include competitive statistics for this viewer.</p>
      </section>
    );
  }

  const items = [
    ["Matches", numberFormatter.format(model.stats.matches)],
    ["Win rate", model.stats.winRateLabel],
    ["Rating", numberFormatter.format(model.stats.rating)],
    ["Trust", model.stats.trustScore === null ? "Private" : `${model.stats.trustScore}`],
  ] as const;

  return (
    <section aria-labelledby="public-stats-title" className={styles.panel} id="statistics">
      <div className={styles.sectionHeading}>
        <div>
          <p>Confirmed record</p>
          <h2 id="public-stats-title">Competitive statistics</h2>
        </div>
        <Badge tone="positive" variant="soft">
          {model.stats.currentStreakLabel} streak
        </Badge>
      </div>
      <dl className={styles.statGrid}>
        {items.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <div className={styles.recordLine}>
        <span>{model.stats.wins} wins</span>
        <span>{model.stats.losses} losses</span>
        <span>{model.stats.draws} draws</span>
        <span>#{model.stats.weeklyRank} weekly</span>
      </div>
    </section>
  );
}

function GameRow({ game }: { game: PublicGameIdentityView }) {
  return (
    <li className={styles.gameRow}>
      <span aria-hidden="true" className={styles.gameGlyph}>
        {game.gameLabel.slice(0, 2).toUpperCase()}
      </span>
      <div>
        <strong>{game.gameLabel}</strong>
        <span>
          {game.handle ?? "Handle hidden"} · {game.platformLabel}
        </span>
      </div>
      <p>
        <strong>{game.rankLabel}</strong>
        <span>{game.verified ? "Verified" : "Pending"}</span>
      </p>
    </li>
  );
}

function MatchRow({ match }: { match: PublicProfileMatchRecord }) {
  const resultLabel = match.result === "win" ? "Victory" : match.result === "loss" ? "Defeat" : "Draw";

  return (
    <li>
      <Link className={styles.matchRow} href={match.href}>
        <span className={styles.matchResult} data-result={match.result}>
          {resultLabel}
        </span>
        <div>
          <strong>vs {match.opponentLabel}</strong>
          <span>
            {match.gameLabel} · {match.competitionLabel}
          </span>
        </div>
        <p>
          <strong>{match.scoreLabel}</strong>
          <span>{match.playedAtLabel}</span>
        </p>
      </Link>
    </li>
  );
}

export function PlayerPublicProfileScreen({
  model,
}: {
  model: PublicPlayerProfileViewModel;
}) {
  if (model.access !== "full") return <RestrictedProfile model={model} />;

  return (
    <main
      className={styles.page}
      data-m11-stage="11.2"
      data-profile-access={model.access}
      data-profile-scope="public"
      data-viewer-mode={model.viewerMode}
    >
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Season Zero · Public profile</p>
          <h1>Player profile</h1>
        </div>
        <Badge tone="information" variant="outline">
          Public view
        </Badge>
      </header>

      <AccessNotice model={model} />

      <section aria-labelledby="public-profile-name" className={styles.identityCard}>
        <div className={styles.banner} style={{ backgroundImage: `url(${model.identity.bannerSrc})` }} />
        <div className={styles.identityBody}>
          <PublicAvatar model={model} />
          <div className={styles.identityHeading}>
            <div className={styles.nameRow}>
              <h2 id="public-profile-name">{model.identity.displayName}</h2>
              <Badge tone="special" variant="outline">
                Public
              </Badge>
            </div>
            <p className={styles.handle}>{model.identity.handle}</p>
            <p className={styles.playerTitle}>{model.identity.title}</p>
          </div>

          <div className={styles.identityBadges}>
            {model.identity.verified ? <Badge tone="positive">Verified</Badge> : null}
            {model.identity.locationLabel ? (
              <Badge tone="information" variant="outline">
                {model.identity.locationLabel}
              </Badge>
            ) : null}
            <Badge tone="special" variant="soft">
              {model.identity.visibility}
            </Badge>
          </div>

          {model.identity.bio ? <p className={styles.bio}>{model.identity.bio}</p> : null}

          <div className={styles.profileActions}>
            {model.permissions.canEdit ? (
              <Link className={styles.primaryAction} href="/profile">
                Open own profile
              </Link>
            ) : null}
            {model.crew ? (
              <Link className={styles.primaryAction} href={model.crew.href}>
                View Crew
              </Link>
            ) : null}
            <Link
              className={styles.secondaryAction}
              href={`/leaderboards/weekly?q=${encodeURIComponent(model.identity.displayName)}`}
            >
              Weekly ranking
            </Link>
          </div>
        </div>
      </section>

      <nav aria-label="Public profile sections" className={styles.sectionNav}>
        <a href="#overview">Overview</a>
        <a href="#statistics">Stats</a>
        <a href="#matches">Matches</a>
        <a href="#achievements">Achievements</a>
      </nav>

      <StatPanel model={model} />

      <div className={styles.contentGrid} id="overview">
        <section aria-labelledby="public-availability-title" className={styles.panel}>
          <div className={styles.sectionHeading}>
            <div>
              <p>Competition readiness</p>
              <h2 id="public-availability-title">Availability</h2>
            </div>
          </div>
          {model.availability ? (
            <div className={styles.availabilityCard}>
              <strong>{model.availability.label}</strong>
              <p>{model.availability.detail ?? "Exact availability is shared with approved friends."}</p>
              {model.availability.nextWindowLabel ? <span>{model.availability.nextWindowLabel}</span> : null}
            </div>
          ) : (
            <div className={styles.redactedInline}>Availability is private.</div>
          )}
        </section>

        <section aria-labelledby="public-crew-title" className={styles.panel}>
          <div className={styles.sectionHeading}>
            <div>
              <p>Competitive team</p>
              <h2 id="public-crew-title">Crew</h2>
            </div>
          </div>
          {model.crew ? (
            <Link className={styles.crewCard} href={model.crew.href}>
              <span aria-hidden="true">{model.crew.tag}</span>
              <div>
                <strong>{model.crew.name}</strong>
                <p>
                  {model.crew.roleLabel} · {model.crew.tag}
                </p>
              </div>
              <b>Open</b>
            </Link>
          ) : (
            <div className={styles.redactedInline}>Crew membership is private or unavailable.</div>
          )}
        </section>

        <section aria-labelledby="public-games-title" className={styles.panel}>
          <div className={styles.sectionHeading}>
            <div>
              <p>Connected platforms</p>
              <h2 id="public-games-title">Game identities</h2>
            </div>
            {!model.permissions.canViewGameHandles ? <span>Handles hidden</span> : null}
          </div>
          <ul className={styles.list}>
            {model.games.map((game) => (
              <GameRow game={game} key={game.id} />
            ))}
          </ul>
        </section>

        <section aria-labelledby="public-matches-title" className={styles.panel} id="matches">
          <div className={styles.sectionHeading}>
            <div>
              <p>Verified results</p>
              <h2 id="public-matches-title">Recent matches</h2>
            </div>
          </div>
          {model.permissions.canViewMatchHistory ? (
            <ul className={styles.list}>
              {model.recentMatches.map((match) => (
                <MatchRow key={match.id} match={match} />
              ))}
            </ul>
          ) : (
            <div className={styles.redactedInline}>Match history is private.</div>
          )}
        </section>

        <section aria-labelledby="public-achievements-title" className={styles.panel} id="achievements">
          <div className={styles.sectionHeading}>
            <div>
              <p>Milestones</p>
              <h2 id="public-achievements-title">Achievements</h2>
            </div>
          </div>
          {model.permissions.canViewAchievements ? (
            <ul className={styles.achievementList}>
              {model.achievements.map((achievement) => (
                <li data-rarity={achievement.rarity} key={achievement.id}>
                  <span aria-hidden="true">✦</span>
                  <div>
                    <strong>{achievement.title}</strong>
                    <p>{achievement.rarity}</p>
                  </div>
                  <b>{achievement.progressLabel}</b>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.redactedInline}>Achievements are private.</div>
          )}
        </section>
      </div>

      {model.redactedFields.length > 0 ? (
        <aside className={styles.redactionSummary}>
          <strong>Privacy protections active</strong>
          <p>Hidden for this viewer: {model.redactedFields.join(", ")}.</p>
        </aside>
      ) : null}
    </main>
  );
}
EOF

  cat > src/features/profiles/public-profile/ui/PlayerPublicProfileScreen.module.css <<'EOF'
/* VERZUS M11.2 PUBLIC PROFILE PRESENTATION */

.page {
  display: grid;
  width: min(100%, 76rem);
  min-width: 0;
  gap: 1rem;
  margin: 0 auto;
  padding: 1rem 0 6.75rem;
}

.pageHeader,
.sectionHeading,
.nameRow,
.recordLine,
.profileActions,
.accessNotice {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
}

.pageHeader > div,
.sectionHeading > div,
.identityHeading,
.gameRow > div,
.matchRow > div,
.crewCard > div,
.achievementList li > div {
  min-width: 0;
}

.pageHeader h1,
.pageHeader p,
.identityHeading h2,
.identityHeading p,
.bio,
.accessNotice p,
.sectionHeading h2,
.sectionHeading p,
.availabilityCard p,
.crewCard p,
.gameRow p,
.matchRow p,
.achievementList p,
.redactedPanel p,
.redactedInline,
.redactionSummary p,
.restrictedCard p,
.restrictedCard h2 {
  margin: 0;
}

.pageHeader h1 {
  font-family: var(--vz-font-display);
  font-size: clamp(1.8rem, 9vw, 2.8rem);
  letter-spacing: 0.04em;
  line-height: 1;
  text-transform: uppercase;
}

.eyebrow,
.sectionHeading p {
  color: var(--vz-color-purple-400);
  font-family: var(--vz-font-interface);
  font-size: var(--vz-text-xs);
  font-weight: var(--vz-font-weight-bold);
  letter-spacing: var(--vz-tracking-label);
  text-transform: uppercase;
}

.identityCard,
.panel,
.redactedPanel,
.restrictedCard,
.redactionSummary,
.accessNotice {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 88% 8%, rgb(136 81 255 / 12%), transparent 34%),
    linear-gradient(145deg, rgb(25 31 37 / 98%), rgb(12 16 20 / 98%));
  border: 1px solid rgb(177 132 255 / 16%);
  border-radius: 1.25rem;
  box-shadow: 0 1rem 2.6rem rgb(0 0 0 / 24%);
}

.accessNotice {
  align-items: flex-start;
  padding: 0.9rem 1rem;
  border-left: 3px solid var(--vz-color-purple-400);
}

.accessNotice[data-access="limited"],
.accessNotice[data-access="blocked"] {
  border-left-color: #ffbc42;
}

.accessNotice p,
.redactionSummary p,
.restrictedCard p {
  margin-top: 0.25rem;
  color: var(--vz-color-text-secondary);
  line-height: 1.5;
}

.banner {
  min-height: 8.5rem;
  background-color: #11131a;
  background-position: center;
  background-size: cover;
  border-bottom: 1px solid rgb(177 132 255 / 18%);
}

.identityBody {
  display: grid;
  min-width: 0;
  gap: 0.8rem;
  padding: 0 1rem 1rem;
}

.avatarWrap {
  position: relative;
  width: 6.5rem;
  height: 6.5rem;
  margin-top: -3.25rem;
}

.avatar,
.avatarFallback {
  display: grid;
  width: 6.5rem;
  height: 6.5rem;
  place-items: center;
  object-fit: cover;
  color: white;
  font-family: var(--vz-font-display);
  font-size: 2rem;
  background: linear-gradient(135deg, #30125f, #111820 60%, #0ef0d2);
  border: 4px solid rgb(12 16 20);
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgb(170 115 255 / 56%), 0 0.9rem 2rem rgb(0 0 0 / 32%);
}

.verifiedMark {
  position: absolute;
  right: -0.1rem;
  bottom: 0.45rem;
  display: grid;
  width: 1.65rem;
  height: 1.65rem;
  place-items: center;
  color: #04110e;
  font-weight: 900;
  background: var(--vz-color-green-400, #23f0a5);
  border: 3px solid rgb(12 16 20);
  border-radius: 50%;
}

.identityHeading {
  display: grid;
  gap: 0.2rem;
}

.nameRow {
  align-items: flex-start;
}

.identityHeading h2 {
  min-width: 0;
  overflow-wrap: anywhere;
  font-family: var(--vz-font-display);
  font-size: clamp(2rem, 11vw, 3.6rem);
  letter-spacing: 0.02em;
  line-height: 0.95;
}

.handle {
  color: var(--vz-color-text-secondary);
  font-family: var(--vz-font-numeric);
  font-size: var(--vz-text-sm);
  overflow-wrap: anywhere;
}

.playerTitle {
  color: var(--vz-color-purple-300, #c7a7ff);
  font-weight: var(--vz-font-weight-bold);
  text-transform: uppercase;
}

.identityBadges,
.profileActions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.bio {
  max-width: 50rem;
  color: var(--vz-color-text-secondary);
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.primaryAction,
.secondaryAction {
  display: inline-grid;
  min-height: 2.75rem;
  place-items: center;
  padding: 0.65rem 0.9rem;
  color: white;
  font-weight: 800;
  text-align: center;
  text-decoration: none;
  border-radius: 0.7rem;
}

.primaryAction {
  background: linear-gradient(135deg, #7d3eff, #5621b6);
  border: 1px solid rgb(190 149 255 / 55%);
}

.secondaryAction {
  background: rgb(255 255 255 / 4%);
  border: 1px solid rgb(255 255 255 / 12%);
}

.primaryAction:focus-visible,
.secondaryAction:focus-visible,
.sectionNav a:focus-visible,
.matchRow:focus-visible,
.crewCard:focus-visible {
  outline: 2px solid var(--vz-color-purple-300, #c7a7ff);
  outline-offset: 3px;
}

.sectionNav {
  display: grid;
  grid-auto-columns: minmax(6.8rem, 1fr);
  grid-auto-flow: column;
  gap: 0.4rem;
  padding: 0.45rem;
  overflow-x: auto;
  background: rgb(8 12 16 / 86%);
  border: 1px solid rgb(177 132 255 / 14%);
  border-radius: 0.9rem;
  scrollbar-width: thin;
}

.sectionNav a {
  display: grid;
  min-height: 2.75rem;
  place-items: center;
  color: var(--vz-color-text-secondary);
  font-size: var(--vz-text-sm);
  font-weight: var(--vz-font-weight-bold);
  text-decoration: none;
  border-radius: 0.6rem;
}

.sectionNav a:first-child,
.sectionNav a:hover {
  color: white;
  background: rgb(134 75 255 / 17%);
}

.panel,
.redactedPanel,
.redactionSummary {
  display: grid;
  gap: 1rem;
  padding: 1rem;
}

.sectionHeading h2 {
  font-family: var(--vz-font-display);
  font-size: 1.08rem;
  letter-spacing: 0.055em;
  text-transform: uppercase;
}

.sectionHeading > span {
  color: var(--vz-color-text-secondary);
  font-size: var(--vz-text-sm);
}

.statGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
  margin: 0;
}

.statGrid > div {
  display: grid;
  gap: 0.25rem;
  min-width: 0;
  padding: 0.8rem;
  background: rgb(255 255 255 / 3%);
  border: 1px solid rgb(255 255 255 / 7%);
  border-radius: 0.8rem;
}

.statGrid dt {
  color: var(--vz-color-text-secondary);
  font-size: var(--vz-text-xs);
  text-transform: uppercase;
}

.statGrid dd {
  margin: 0;
  font-family: var(--vz-font-numeric);
  font-size: clamp(1.35rem, 7vw, 2rem);
  font-weight: 800;
}

.recordLine {
  flex-wrap: wrap;
  justify-content: flex-start;
  color: var(--vz-color-text-secondary);
  font-size: var(--vz-text-sm);
}

.recordLine span:not(:last-child)::after {
  content: "·";
  margin-left: 0.75rem;
  color: var(--vz-color-purple-400);
}

.contentGrid {
  display: grid;
  gap: 1rem;
}

.availabilityCard {
  display: grid;
  gap: 0.35rem;
  padding: 0.9rem;
  background: rgb(0 255 163 / 5%);
  border: 1px solid rgb(0 255 163 / 16%);
  border-left: 3px solid var(--vz-color-green-400, #23f0a5);
  border-radius: 0.8rem;
}

.availabilityCard p,
.availabilityCard span,
.crewCard p,
.gameRow span,
.gameRow p,
.matchRow span,
.achievementList p {
  color: var(--vz-color-text-secondary);
  font-size: var(--vz-text-sm);
}

.crewCard {
  display: grid;
  grid-template-columns: 3rem minmax(0, 1fr) auto;
  gap: 0.75rem;
  align-items: center;
  min-width: 0;
  padding: 0.85rem;
  color: inherit;
  text-decoration: none;
  background: rgb(134 75 255 / 6%);
  border: 1px solid rgb(177 132 255 / 16%);
  border-radius: 0.8rem;
}

.crewCard > span,
.gameGlyph {
  display: grid;
  width: 3rem;
  aspect-ratio: 1;
  place-items: center;
  color: var(--vz-color-purple-300, #c7a7ff);
  font-family: var(--vz-font-display);
  background: rgb(134 75 255 / 14%);
  border: 1px solid rgb(177 132 255 / 30%);
  border-radius: 0.7rem;
}

.crewCard strong,
.crewCard p,
.gameRow strong,
.gameRow span,
.matchRow strong,
.matchRow span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list,
.achievementList {
  display: grid;
  gap: 0.55rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.gameRow,
.matchRow,
.achievementList li {
  display: grid;
  align-items: center;
  min-width: 0;
  padding: 0.78rem;
  background: rgb(255 255 255 / 2.7%);
  border: 1px solid rgb(255 255 255 / 7%);
  border-radius: 0.75rem;
}

.gameRow {
  grid-template-columns: 3rem minmax(0, 1fr);
  gap: 0.7rem;
}

.gameRow > p {
  grid-column: 2;
}

.gameRow > p span,
.gameRow > p strong {
  display: block;
}

.matchRow {
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 0.65rem;
  color: inherit;
  text-decoration: none;
}

.matchResult {
  min-width: 3.7rem;
  color: #ffcb5c !important;
  font-size: var(--vz-text-xs) !important;
  font-weight: 900;
  text-transform: uppercase;
}

.matchResult[data-result="win"] {
  color: var(--vz-color-green-400, #23f0a5) !important;
}

.matchResult[data-result="loss"] {
  color: #ff6c7d !important;
}

.matchRow > p {
  text-align: right;
}

.achievementList li {
  grid-template-columns: 2.5rem minmax(0, 1fr) auto;
  gap: 0.7rem;
}

.achievementList li > span {
  display: grid;
  width: 2.5rem;
  aspect-ratio: 1;
  place-items: center;
  color: #c7a7ff;
  background: rgb(134 75 255 / 14%);
  border-radius: 50%;
}

.achievementList li[data-rarity="legendary"] > span {
  color: #ffd061;
}

.redactedInline,
.redactedPanel {
  color: var(--vz-color-text-secondary);
  background: rgb(255 188 66 / 4%);
  border-color: rgb(255 188 66 / 18%);
}

.redactionSummary {
  border-left: 3px solid #ffbc42;
}

.restrictedCard {
  display: grid;
  justify-items: center;
  gap: 0.75rem;
  padding: clamp(2rem, 10vw, 5rem) 1.25rem;
  text-align: center;
}

.restrictedGlyph {
  display: grid;
  width: 5rem;
  aspect-ratio: 1;
  place-items: center;
  color: #ffbc42;
  font-size: 2.5rem;
  background: rgb(255 188 66 / 8%);
  border: 1px solid rgb(255 188 66 / 24%);
  border-radius: 50%;
}

.restrictedCard h2 {
  max-width: 30rem;
  font-family: var(--vz-font-display);
  font-size: clamp(1.7rem, 8vw, 2.8rem);
  text-transform: uppercase;
}

.restrictedCard > p {
  max-width: 36rem;
}

@media (min-width: 48rem) {
  .page {
    gap: 1.2rem;
    padding: 1.5rem 0 3rem;
  }

  .identityBody {
    grid-template-columns: auto minmax(0, 1fr);
    column-gap: 1.2rem;
    padding: 0 1.4rem 1.4rem;
  }

  .avatarWrap {
    grid-row: 1 / span 4;
  }

  .identityBadges,
  .bio,
  .profileActions {
    grid-column: 2;
  }

  .contentGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .gameRow {
    grid-template-columns: 3rem minmax(0, 1fr) auto;
  }

  .gameRow > p {
    grid-column: auto;
    text-align: right;
  }
}

@media (min-width: 64rem) {
  .page {
    grid-template-columns: minmax(0, 1.65fr) minmax(18rem, 0.75fr);
    align-items: start;
  }

  .pageHeader,
  .accessNotice,
  .identityCard,
  .sectionNav,
  .redactionSummary,
  .restrictedCard {
    grid-column: 1 / -1;
  }

  .contentGrid {
    grid-column: 1 / -1;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (prefers-reduced-motion: reduce) {
  .primaryAction,
  .secondaryAction,
  .sectionNav a,
  .matchRow,
  .crewCard {
    scroll-behavior: auto;
    transition: none;
  }
}
EOF

  cat > src/features/profiles/public-profile/ui/index.ts <<'EOF'
// VERZUS M11.2 PUBLIC PROFILE UI EXPORTS
export * from "./PlayerPublicProfileScreen";
EOF

  cat > src/features/profiles/public-profile/index.ts <<'EOF'
// VERZUS M11.2 PUBLIC PROFILE EXPORTS
export * from "./model/public-player-profile.types";
export * from "./mocks/public-player-profile.mock";
export * from "./server/public-profile-policy";
export * from "./ui";
EOF
}

write_routes() {
  mkdir -p 'src/app/(platform)/players/[playerId]'

  cat > 'src/app/(platform)/players/[playerId]/page.tsx' <<'EOF'
// VERZUS M11.2 SERVER-AUTHORITATIVE PUBLIC PLAYER ROUTE

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getPublicPlayerProfileRecord,
  parsePublicProfileViewerMode,
  PlayerPublicProfileScreen,
  projectPublicPlayerProfile,
} from "@/features/profiles/public-profile";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ playerId: string }>;
}): Promise<Metadata> {
  const { playerId } = await params;
  const record = getPublicPlayerProfileRecord(playerId);

  if (!record) {
    return {
      title: "Player not found — VERZUS",
      description: "The requested VERZUS player profile could not be found.",
    };
  }

  return {
    title: `${record.identity.displayName} — VERZUS`,
    description: `View ${record.identity.displayName}'s permission-aware public VERZUS player profile.`,
  };
}

export default async function PublicPlayerPage({
  params,
  searchParams,
}: {
  params: Promise<{ playerId: string }>;
  searchParams: Promise<{ viewer?: string | string[] }>;
}) {
  const [{ playerId }, query] = await Promise.all([params, searchParams]);
  const record = getPublicPlayerProfileRecord(playerId);

  if (!record) notFound();

  const viewerMode = parsePublicProfileViewerMode(query.viewer);
  const model = projectPublicPlayerProfile(record, viewerMode);

  return <PlayerPublicProfileScreen model={model} />;
}
EOF

  cat > 'src/app/(platform)/players/[playerId]/loading.tsx' <<'EOF'
// VERZUS M11.2 PUBLIC PROFILE LOADING STATE

export default function PublicPlayerLoading() {
  return (
    <main aria-busy="true" aria-label="Loading player profile" data-m11-stage="11.2">
      <div className="vz-route-boundary vz-route-boundary--loading">
        <p>Loading public player profile…</p>
      </div>
    </main>
  );
}
EOF

  cat > 'src/app/(platform)/players/[playerId]/error.tsx' <<'EOF'
"use client";

// VERZUS M11.2 PUBLIC PROFILE ROUTE ERROR

export default function PublicPlayerError({ reset }: { reset: () => void }) {
  return (
    <main data-m11-stage="11.2">
      <div className="vz-route-boundary vz-route-boundary--error">
        <h1>Player profile unavailable</h1>
        <p>The public profile could not be loaded. Other VERZUS features remain available.</p>
        <button onClick={reset} type="button">
          Retry profile
        </button>
      </div>
    </main>
  );
}
EOF

  cat > 'src/app/(platform)/players/[playerId]/not-found.tsx' <<'EOF'
// VERZUS M11.2 PUBLIC PROFILE NOT-FOUND STATE

import Link from "next/link";

export default function PublicPlayerNotFound() {
  return (
    <main data-m11-stage="11.2">
      <div className="vz-route-boundary vz-route-boundary--not-found">
        <h1>Player not found</h1>
        <p>This profile may have been removed, renamed or never existed.</p>
        <Link href="/leaderboards/weekly">Browse weekly players</Link>
      </div>
    </main>
  );
}
EOF
}

patch_own_profile_link() {
  node <<'NODE'
const fs = require("node:fs");
const screenPath = "src/features/profiles/foundation/ui/PlayerProfileFoundationScreen.tsx";
const cssPath = "src/features/profiles/foundation/ui/PlayerProfileFoundationScreen.module.css";
let screen = fs.readFileSync(screenPath, "utf8");
let css = fs.readFileSync(cssPath, "utf8");

if (!screen.includes("VERZUS M11.2 PUBLIC VIEW LINK")) {
  const before = `        <Badge tone="positive" variant="outline">Active</Badge>\n`;
  const after = `        <div className={styles.profileHeaderActions}>\n          <Badge tone="positive" variant="outline">Active</Badge>\n          {/* VERZUS M11.2 PUBLIC VIEW LINK */}\n          <Link className={styles.publicViewLink} href={\`/players/\${model.identity.id}?viewer=owner\`}>\n            Public view\n          </Link>\n        </div>\n`;
  if (!screen.includes(before)) {
    throw new Error("M11.2 could not locate the M11.1 profile header action marker.");
  }
  screen = screen.replace(before, after);
}

if (!css.includes("VERZUS M11.2 PUBLIC VIEW LINK")) {
  css += `\n\n/* VERZUS M11.2 PUBLIC VIEW LINK */\n.profileHeaderActions {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  justify-content: flex-end;\n}\n\n.publicViewLink {\n  display: inline-grid;\n  min-height: 2.75rem;\n  place-items: center;\n  padding: 0.55rem 0.8rem;\n  color: white;\n  font-size: var(--vz-text-sm);\n  font-weight: 800;\n  text-decoration: none;\n  background: rgb(134 75 255 / 12%);\n  border: 1px solid rgb(177 132 255 / 28%);\n  border-radius: 0.65rem;\n}\n\n.publicViewLink:focus-visible {\n  outline: 2px solid var(--vz-color-purple-300, #c7a7ff);\n  outline-offset: 3px;\n}\n`;
}

fs.writeFileSync(screenPath, screen);
fs.writeFileSync(cssPath, css);
NODE
}

write_docs() {
  mkdir -p docs/milestones/M11

  cat > docs/milestones/M11/m11-11-2-public-profile-permissions.md <<'EOF'
# M11.2 — Public Player Profile and Permission Boundaries

<!-- VERZUS M11.2 -->

## Purpose

Add a public player route without reusing the own-profile permission surface. The server projects only the fields permitted for the resolved viewer relationship and profile policy.

## Route

```text
/players/[playerId]
```

Preview-only viewer modes:

```text
?viewer=anonymous
?viewer=member
?viewer=friend
?viewer=owner
?viewer=blocked
```

The query parameter is interpreted on the server for deterministic review. It does not grant browser authority and must be replaced by authenticated server context when production identity integration arrives.

## Visibility policy

Profile visibility:

- `public`: authorized public fields may be shown.
- `friends`: full profile is available only to a server-confirmed friend or owner.
- `private`: only a restricted identity state is returned to non-owners.

Field audiences:

- `public`
- `friends`
- `private`

Controlled fields:

- location
- Crew membership
- competitive statistics
- trust score
- match history
- game handles
- achievements
- exact availability

## Security boundary

The UI receives a projected `PublicPlayerProfileViewModel`; it never receives the source privacy record. Hidden fields are removed or replaced with null before rendering.

No public route contains profile editing or privacy mutations. Unknown player IDs use the route not-found boundary.

## Deterministic previews

```text
/players/player-prismo
/players/player-prismo?viewer=friend
/players/player-prismo?viewer=owner
/players/player-rivalking
/players/player-ghosty
/players/player-ghosty?viewer=friend
/players/player-private
/players/player-private?viewer=owner
/players/player-long-name
/players/player-prismo?viewer=blocked
```

## Deferred

- authenticated viewer resolution
- friend-request mutations
- Crew invite mutations from the public profile
- production profile API resources
- profile editing
- suspended and platform-blocked account states
EOF
}

write_verifier() {
  cat > scripts/verify-m11-11-2.mjs <<'EOF'
// VERZUS M11.2 STRUCTURAL VERIFIER

import { existsSync, readFileSync } from "node:fs";

const requiredFiles = [
  "src/features/profiles/public-profile/model/public-player-profile.types.ts",
  "src/features/profiles/public-profile/mocks/public-player-profile.mock.ts",
  "src/features/profiles/public-profile/server/public-profile-policy.ts",
  "src/features/profiles/public-profile/ui/PlayerPublicProfileScreen.tsx",
  "src/features/profiles/public-profile/ui/PlayerPublicProfileScreen.module.css",
  "src/features/profiles/public-profile/ui/index.ts",
  "src/features/profiles/public-profile/index.ts",
  "src/app/(platform)/players/[playerId]/page.tsx",
  "src/app/(platform)/players/[playerId]/loading.tsx",
  "src/app/(platform)/players/[playerId]/error.tsx",
  "src/app/(platform)/players/[playerId]/not-found.tsx",
  "docs/milestones/M11/m11-11-2-public-profile-permissions.md",
  "tsconfig.m11-11-2.json",
];

for (const file of requiredFiles) {
  if (!existsSync(file)) throw new Error(`M11.2 missing required file: ${file}`);
}

const types = readFileSync(
  "src/features/profiles/public-profile/model/public-player-profile.types.ts",
  "utf8",
);
const policy = readFileSync(
  "src/features/profiles/public-profile/server/public-profile-policy.ts",
  "utf8",
);
const screen = readFileSync(
  "src/features/profiles/public-profile/ui/PlayerPublicProfileScreen.tsx",
  "utf8",
);
const route = readFileSync("src/app/(platform)/players/[playerId]/page.tsx", "utf8");
const ownScreen = readFileSync(
  "src/features/profiles/foundation/ui/PlayerProfileFoundationScreen.tsx",
  "utf8",
);
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

for (const marker of [
  "PublicProfileViewerMode",
  "PublicProfilePrivacyPolicy",
  "PublicProfilePermissions",
  "PublicPlayerProfileViewModel",
  "redactedFields",
]) {
  if (!types.includes(marker)) throw new Error(`M11.2 type marker missing: ${marker}`);
}

for (const marker of [
  "derivePermissions",
  "audienceAllows",
  "projectPublicPlayerProfile",
  'viewerMode === "blocked"',
  'record.identity.profileVisibility === "friends"',
]) {
  if (!policy.includes(marker)) throw new Error(`M11.2 policy marker missing: ${marker}`);
}

for (const marker of [
  'data-m11-stage="11.2"',
  'data-profile-scope="public"',
  "Permission-aware profile",
  "Competitive statistics",
  "Game identities",
  "Recent matches",
  "Privacy protections active",
]) {
  if (!screen.includes(marker)) throw new Error(`M11.2 screen marker missing: ${marker}`);
}

for (const marker of [
  "notFound()",
  "parsePublicProfileViewerMode",
  "projectPublicPlayerProfile",
  "PlayerPublicProfileScreen",
]) {
  if (!route.includes(marker)) throw new Error(`M11.2 route marker missing: ${marker}`);
}

if (!ownScreen.includes("VERZUS M11.2 PUBLIC VIEW LINK")) {
  throw new Error("M11.2 own-profile public-view link is missing.");
}

for (const script of ["m11:preview", "typecheck:m11:11.2", "verify:m11:11.2"]) {
  if (!packageJson.scripts?.[script]) throw new Error(`M11.2 package script missing: ${script}`);
}

const publicFiles = `${screen}\n${route}`;
if (/useMutation|method:\s*["'](?:POST|PUT|PATCH|DELETE)|fetch\([^)]*api\/profile\/me/.test(publicFiles)) {
  throw new Error("M11.2 public profile must remain read-only and non-authoritative.");
}

if (/privacy:\s*record\.privacy|record\.privacy\s*[},]/.test(screen)) {
  throw new Error("M11.2 UI must not receive the source privacy record.");
}

console.log(
  "M11.2 public-player route, server permission projection, field redaction, restricted states and owner/public separation are installed.",
);
EOF

  cat > tsconfig.m11-11-2.json <<'EOF'
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": true
  },
  "include": [
    "next-env.d.ts",
    "src/features/profiles/foundation/**/*.ts",
    "src/features/profiles/foundation/**/*.tsx",
    "src/features/profiles/public-profile/**/*.ts",
    "src/features/profiles/public-profile/**/*.tsx",
    "src/app/(platform)/profile/**/*.ts",
    "src/app/(platform)/profile/**/*.tsx",
    "src/app/(platform)/players/**/*.ts",
    "src/app/(platform)/players/**/*.tsx"
  ],
  "exclude": ["node_modules"]
}
EOF
}

update_package_json() {
  node <<'NODE'
const fs = require("node:fs");
const path = "package.json";
const pkg = JSON.parse(fs.readFileSync(path, "utf8"));
pkg.scripts = pkg.scripts || {};
pkg.scripts["typecheck:m11:11.2"] = "tsc --noEmit -p tsconfig.m11-11-2.json";
pkg.scripts["verify:m11:11.2"] = "node scripts/verify-m11-11-2.mjs && eslint src/features/profiles/public-profile src/features/profiles/foundation/ui/PlayerProfileFoundationScreen.tsx \"src/app/(platform)/players\" scripts/verify-m11-11-2.mjs --max-warnings=0 && npm run typecheck:m11:11.2";
fs.writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`);
NODE
}

format_owned_files() {
  local prettier="./node_modules/.bin/prettier"
  if [[ -x "$prettier" ]]; then
    "$prettier" --write \
      package.json \
      src/features/profiles/public-profile \
      src/features/profiles/foundation/ui/PlayerProfileFoundationScreen.tsx \
      src/features/profiles/foundation/ui/PlayerProfileFoundationScreen.module.css \
      'src/app/(platform)/players' \
      docs/milestones/M11/m11-11-2-public-profile-permissions.md \
      scripts/verify-m11-11-2.mjs \
      tsconfig.m11-11-2.json >/dev/null
  else
    echo "Prettier binary not present; files were written in repository format."
  fi
}

run_verification() {
  echo "Running focused M11.2 verification..."
  npm run verify:m11:11.2
}

install_stage() {
  print_plan
  require_m11_1_prerequisite
  backup_current_state
  write_types
  write_mocks
  write_policy
  write_ui
  write_routes
  patch_own_profile_link
  write_docs
  write_verifier
  update_package_json
  format_owned_files
  run_verification
  INSTALL_COMPLETE="true"

  cat <<'DONE'

M11.2 installation complete.

Preview:
  npm run m11:preview

Public profile:
  http://127.0.0.1:3123/players/player-prismo

Friend-authorized view:
  http://127.0.0.1:3123/players/player-prismo?viewer=friend

Owner review:
  http://127.0.0.1:3123/players/player-prismo?viewer=owner

Friends-only profile:
  http://127.0.0.1:3123/players/player-ghosty
  http://127.0.0.1:3123/players/player-ghosty?viewer=friend

Private profile:
  http://127.0.0.1:3123/players/player-private

Missing avatar and long-name resilience:
  http://127.0.0.1:3123/players/player-rivalking
  http://127.0.0.1:3123/players/player-long-name

Blocked viewer:
  http://127.0.0.1:3123/players/player-prismo?viewer=blocked

Unknown player:
  http://127.0.0.1:3123/players/player-unknown

Verify again:
  npm run verify:m11:11.2

Rollback:
  bash ./VERZUS_M11_11_2_Public_Profile_Permission_Boundaries_NO_TESTS.sh rollback
DONE
}

rollback_stage() {
  require_repo_root

  local latest
  latest="$(find "$BACKUP_ROOT" -type f -name 'verzus-m11-11-2-before.tar.gz' 2>/dev/null | sort | tail -n 1)"

  if [[ -z "$latest" ]]; then
    echo "Error: no M11.2 rollback archive found under $BACKUP_ROOT."
    exit 1
  fi

  echo "Restoring M11.2 predecessor from: $latest"
  restore_archive "$latest"
  echo "Rollback complete. M11.1 was restored."
}

case "$MODE" in
  install)
    install_stage
    ;;
  rollback)
    rollback_stage
    ;;
  plan)
    print_plan
    ;;
  *)
    echo "Usage: bash ./$SCRIPT_NAME [install|rollback|plan]"
    exit 1
    ;;
esac
