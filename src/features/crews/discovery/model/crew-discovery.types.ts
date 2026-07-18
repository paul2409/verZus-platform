// VERZUS M9.2 CREW DISCOVERY TYPES

import type { CrewLifecycle } from "../../foundation";

export const crewDiscoveryGames = ["all", "EA FC", "COD Mobile", "Clash Royale"] as const;
export const crewDiscoveryRegions = ["all", "Nigeria", "West Africa", "Global"] as const;
export const crewDiscoveryVisibility = ["all", "public", "private"] as const;
export const crewDiscoveryRecruiting = ["all", "open", "closed"] as const;
export const crewDiscoverySorts = [
  "recommended",
  "rank",
  "points",
  "win-rate",
  "open-slots",
  "trust",
] as const;

export type CrewDiscoveryGame = (typeof crewDiscoveryGames)[number];
export type CrewDiscoveryRegion = (typeof crewDiscoveryRegions)[number];
export type CrewDiscoveryVisibility = (typeof crewDiscoveryVisibility)[number];
export type CrewDiscoveryRecruiting = (typeof crewDiscoveryRecruiting)[number];
export type CrewDiscoverySort = (typeof crewDiscoverySorts)[number];
export type CrewMembershipState = "current" | "none";
export type CrewRootView = "profile" | "discover";

export type CrewDiscoveryRecord = {
  id: string;
  name: string;
  tag: string;
  initials: string;
  accent: "purple" | "cyan" | "gold" | "green" | "red" | "blue";
  description: string;
  verified: boolean;
  lifecycle: CrewLifecycle;
  games: readonly Exclude<CrewDiscoveryGame, "all">[];
  region: Exclude<CrewDiscoveryRegion, "all">;
  visibility: Exclude<CrewDiscoveryVisibility, "all">;
  recruiting: Exclude<CrewDiscoveryRecruiting, "all">;
  memberCount: number;
  capacity: number;
  rank: number;
  points: number;
  winRate: number;
  trust: number;
  minimumRank: string;
  recommendationScore: number;
};

export type CrewDiscoveryQuery = {
  q: string;
  game: CrewDiscoveryGame;
  region: CrewDiscoveryRegion;
  visibility: CrewDiscoveryVisibility;
  recruiting: CrewDiscoveryRecruiting;
  sort: CrewDiscoverySort;
  page: number;
  size: 6;
  joinCrewId: string | null;
};

export type CrewDiscoveryResult = {
  items: readonly CrewDiscoveryRecord[];
  total: number;
  page: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export const defaultCrewDiscoveryQuery: CrewDiscoveryQuery = {
  q: "",
  game: "all",
  region: "all",
  visibility: "all",
  recruiting: "open",
  sort: "recommended",
  page: 1,
  size: 6,
  joinCrewId: null,
};
