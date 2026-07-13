// VERZUS M4 STEP 4.9

import type {
  OnboardingAvailabilityOptionsData,
  OnboardingCrewOptionsData,
  OnboardingGameOptionsData,
  OnboardingIdentityOptionsData,
  OnboardingLocationOptionsData,
  OnboardingOptionMeta,
} from "../../features/onboarding/api/onboarding-options.schema";

const generatedAt = "2026-07-13T12:00:00.000Z";

const completeMeta: OnboardingOptionMeta = {
  status: "complete",
  warnings: [],
  generatedAt,
};

export const mockOnboardingGameOptions: OnboardingGameOptionsData = {
  games: [
    {
      id: "ea-fc",
      name: "EA SPORTS FC",
      shortName: "EA FC",
      active: true,
      competitive: true,
      platforms: ["playstation", "xbox", "pc"],
    },
    {
      id: "efootball",
      name: "eFootball",
      shortName: "eFootball",
      active: true,
      competitive: true,
      platforms: ["playstation", "xbox", "pc", "mobile"],
    },
  ],
  recommendedGameIds: ["ea-fc"],
  maximumSelections: 5,
  meta: completeMeta,
};

export const mockOnboardingLocationOptions: OnboardingLocationOptionsData = {
  countries: [{ code: "NG", name: "Nigeria" }],
  regions: [
    {
      id: "ng-lagos",
      countryCode: "NG",
      name: "Lagos",
    },
    {
      id: "ng-fct",
      countryCode: "NG",
      name: "Federal Capital Territory",
    },
  ],
  cities: [
    {
      id: "ng-lagos-lagos",
      countryCode: "NG",
      regionId: "ng-lagos",
      name: "Lagos",
    },
    {
      id: "ng-fct-abuja",
      countryCode: "NG",
      regionId: "ng-fct",
      name: "Abuja",
    },
  ],
  timezones: ["Africa/Lagos"],
  selectedCountryCode: null,
  selectedRegionId: null,
  meta: completeMeta,
};

export const mockOnboardingIdentityOptions: OnboardingIdentityOptionsData = {
  platforms: [
    {
      id: "playstation",
      label: "PlayStation",
      handleLabel: "PSN ID",
    },
    {
      id: "xbox",
      label: "Xbox",
      handleLabel: "Xbox gamertag",
    },
    {
      id: "pc",
      label: "PC",
      handleLabel: "Platform username",
    },
    {
      id: "mobile",
      label: "Mobile",
      handleLabel: "In-game username",
    },
    {
      id: "nintendo",
      label: "Nintendo",
      handleLabel: "Nintendo nickname",
    },
  ],
  gamerTagRules: {
    minimumLength: 3,
    maximumLength: 24,
    reservedWords: ["admin", "moderator", "verzus", "support"],
  },
  meta: completeMeta,
};

export const mockOnboardingAvailabilityOptions: OnboardingAvailabilityOptionsData = {
  days: [
    { id: "monday", label: "Monday" },
    { id: "tuesday", label: "Tuesday" },
    { id: "wednesday", label: "Wednesday" },
    { id: "thursday", label: "Thursday" },
    { id: "friday", label: "Friday" },
    { id: "saturday", label: "Saturday" },
    { id: "sunday", label: "Sunday" },
  ],
  timezone: "Africa/Lagos",
  slotRules: {
    minuteIncrement: 30,
    minimumDurationMinutes: 60,
    maximumWindows: 21,
  },
  meta: completeMeta,
};

export const mockOnboardingCrewOptions: OnboardingCrewOptionsData = {
  crews: [
    {
      id: "crew-lagos-elite",
      name: "Lagos Elite",
      tag: "LGE",
      memberCount: 18,
      acceptingMembers: true,
      supportedGameIds: ["ea-fc"],
      fitReasons: ["Plays EA SPORTS FC", "Active in the Africa/Lagos timezone"],
    },
    {
      id: "crew-naija-strikers",
      name: "Naija Strikers",
      tag: "NSG",
      memberCount: 12,
      acceptingMembers: true,
      supportedGameIds: ["ea-fc", "efootball"],
      fitReasons: ["Supports both selected football games"],
    },
  ],
  canSkip: true,
  maximumSuggestions: 6,
  requestedGameId: null,
  meta: completeMeta,
};
