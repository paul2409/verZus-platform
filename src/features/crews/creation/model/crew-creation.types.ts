// VERZUS M9.3 CREW CREATION TYPES

import type { CrewLifecycle, CrewRole } from "../../foundation";

export const crewCreationSteps = ["basics", "identity", "settings", "review", "created"] as const;
export const crewCreationGames = [
  "EA FC",
  "COD Mobile",
  "Clash Royale",
  "League of Legends",
] as const;
export const crewCreationRegions = ["Nigeria", "West Africa", "Global"] as const;
export const crewCreationLanguages = ["English", "French", "Portuguese"] as const;
export const crewCreationMinimumRanks = ["Open", "Gold", "Platinum", "Diamond", "Elite"] as const;
export const crewCreationCrestPresets = ["neon-v", "orbit", "strike"] as const;
export const crewCreationBannerPresets = ["neon-grid", "cosmic", "stadium"] as const;

export type CrewCreationStep = (typeof crewCreationSteps)[number];
export type CrewCreationGame = (typeof crewCreationGames)[number];
export type CrewCreationRegion = (typeof crewCreationRegions)[number];
export type CrewCreationLanguage = (typeof crewCreationLanguages)[number];
export type CrewCreationMinimumRank = (typeof crewCreationMinimumRanks)[number];
export type CrewCreationCrestPreset = (typeof crewCreationCrestPresets)[number];
export type CrewCreationBannerPreset = (typeof crewCreationBannerPresets)[number];
export type CrewCreationVisibility = "public" | "private";

export type CrewCreationDraft = {
  version: 1;
  submissionId: string;
  name: string;
  tag: string;
  description: string;
  primaryGame: CrewCreationGame;
  region: CrewCreationRegion;
  crestPreset: CrewCreationCrestPreset;
  bannerPreset: CrewCreationBannerPreset;
  visibility: CrewCreationVisibility;
  recruiting: boolean;
  language: CrewCreationLanguage;
  minimumRank: CrewCreationMinimumRank;
};

export type CrewCreationOwner = {
  id: string;
  name: string;
  role: Extract<CrewRole, "owner">;
};

export type CrewCreationRecord = {
  id: string;
  createdAt: string;
  lifecycle: Extract<CrewLifecycle, "forming">;
  memberCount: 1;
  owner: CrewCreationOwner;
  identity: {
    name: string;
    tag: string;
    description: string;
    primaryGame: CrewCreationGame;
    region: CrewCreationRegion;
    crestSrc: string;
    bannerSrc: string;
    visibility: CrewCreationVisibility;
  };
  settings: {
    recruiting: boolean;
    language: CrewCreationLanguage;
    minimumRank: CrewCreationMinimumRank;
  };
  submissionId: string;
};

export type CrewCreationPersistedState = {
  version: 1;
  draft: CrewCreationDraft;
  created: CrewCreationRecord | null;
};

export type CrewCreationField = keyof Pick<
  CrewCreationDraft,
  "name" | "tag" | "description" | "primaryGame" | "region" | "crestPreset" | "bannerPreset"
>;

export type CrewCreationErrors = Partial<Record<CrewCreationField, string>>;

export const crewCreationAssetPaths = {
  crest: {
    "neon-v": "/crews/create/crest-neon-v.svg",
    orbit: "/crews/create/crest-orbit.svg",
    strike: "/crews/create/crest-strike.svg",
  },
  banner: {
    "neon-grid": "/crews/create/banner-neon-grid.svg",
    cosmic: "/crews/create/banner-cosmic.svg",
    stadium: "/crews/create/banner-stadium.svg",
  },
} as const;

export function parseCrewCreationStep(value: string | string[] | undefined): CrewCreationStep {
  const candidate = Array.isArray(value) ? value[0] : value;
  return crewCreationSteps.includes(candidate as CrewCreationStep)
    ? (candidate as CrewCreationStep)
    : "basics";
}

export function createInitialCrewCreationDraft(submissionId: string): CrewCreationDraft {
  return {
    version: 1,
    submissionId,
    name: "",
    tag: "",
    description: "",
    primaryGame: "EA FC",
    region: "Nigeria",
    crestPreset: "neon-v",
    bannerPreset: "neon-grid",
    visibility: "public",
    recruiting: true,
    language: "English",
    minimumRank: "Open",
  };
}
