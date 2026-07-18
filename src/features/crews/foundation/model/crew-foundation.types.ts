// VERZUS M9.1 CREW FOUNDATION TYPES

export const crewFoundationTabs = [
  "overview",
  "roster",
  "requests",
  "activity",
  "rankings",
  "achievements",
  "settings",
] as const;

export type CrewFoundationTab = (typeof crewFoundationTabs)[number];
export type CrewLifecycle =
  "forming" | "active" | "inactive" | "suspended" | "disbanded" | "archived";
export type CrewRole = "owner" | "captain" | "manager" | "member" | "trial";
export type CrewActivityTone = "win" | "loss" | "neutral";

export type CrewFoundationIdentity = {
  id: string;
  name: string;
  tag: string;
  tagline: string;
  description: string;
  crestSrc: string;
  bannerSrc: string;
  verified: boolean;
  tier: string;
  games: readonly string[];
  memberCount: number;
  region: string;
  visibility: "public" | "private";
  foundedAtLabel: string;
  lifecycle: CrewLifecycle;
};

export type CrewFoundationStats = {
  rank: number;
  movement: number;
  points: number;
  wins: number;
  losses: number;
  winRate: number;
  streak: number;
  trust: number;
  activeMembers: number;
};

export type CrewFoundationMember = {
  id: string;
  name: string;
  handle: string;
  initials: string;
  role: CrewRole;
  contribution: number;
  status: "online" | "away" | "offline";
};

export type CrewFoundationActivity = {
  id: string;
  title: string;
  game: string;
  occurredAtLabel: string;
  scoreLabel: string | null;
  tone: CrewActivityTone;
};

export type CrewFoundationRequest = {
  id: string;
  playerName: string;
  handle: string;
  game: string;
  trust: number;
  status: "pending" | "reviewing";
};

export type CrewFoundationAchievement = {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
};

export type CrewFoundationViewModel = {
  identity: CrewFoundationIdentity;
  stats: CrewFoundationStats;
  members: readonly CrewFoundationMember[];
  activity: readonly CrewFoundationActivity[];
  requests: readonly CrewFoundationRequest[];
  achievements: readonly CrewFoundationAchievement[];
  settings: {
    recruiting: boolean;
    primaryGame: string;
    language: string;
    minimumRank: string;
    communityLinkLabel: string;
  };
};

export function isCrewFoundationTab(value: string | null | undefined): value is CrewFoundationTab {
  return crewFoundationTabs.includes(value as CrewFoundationTab);
}
