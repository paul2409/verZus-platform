// VERZUS M11.2 DETERMINISTIC PUBLIC PLAYER RECORDS

import type { PublicPlayerProfileRecord } from "../model/public-player-profile.types";
import { readProfilePrivacyForPublicProjection } from "../../privacy/server/profile-privacy.store";

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
  const record = records[playerId] ?? null;
  if (!record || playerId !== "player-prismo") return record;

  const privacy = readProfilePrivacyForPublicProjection();
  return {
    ...record,
    identity: { ...record.identity, profileVisibility: privacy.profileVisibility },
    privacy: {
      location: privacy.location,
      crew: privacy.crew,
      statistics: privacy.statistics,
      trustScore: privacy.trustScore,
      matchHistory: privacy.matchHistory,
      gameHandles: privacy.gameHandles,
      achievements: privacy.achievements,
      availability: privacy.availability,
    },
  };
}

export const publicPlayerProfileIds = Object.freeze(Object.keys(records));
