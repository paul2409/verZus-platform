import "server-only";

import type {
  OnboardingAvailabilityOptionsData,
  OnboardingCrewOptionsData,
  OnboardingGameOptionsData,
  OnboardingIdentityOptionsData,
  OnboardingLocationOptionsData,
} from "../api/onboarding-options.schema";

function meta(
  status: "complete" | "partial" = "complete",
  warnings: OnboardingGameOptionsData["meta"]["warnings"] = [],
) {
  return { status, warnings, generatedAt: new Date().toISOString() } as const;
}

export function getProductionGameOptions(): OnboardingGameOptionsData {
  return {
    games: [
      {
        id: "ea-sports-fc",
        name: "EA Sports FC",
        shortName: "EAFC",
        active: true,
        competitive: true,
        platforms: ["playstation", "xbox", "pc"],
      },
    ],
    recommendedGameIds: ["ea-sports-fc"],
    maximumSelections: 1,
    meta: meta(),
  };
}

export function getProductionLocationOptions(): OnboardingLocationOptionsData {
  return {
    countries: [{ code: "NG", name: "Nigeria" }],
    regions: [
      { id: "ng-la", countryCode: "NG", name: "Lagos" },
      { id: "ng-fc", countryCode: "NG", name: "Federal Capital Territory" },
    ],
    cities: [
      { id: "ng-la-lagos", countryCode: "NG", regionId: "ng-la", name: "Lagos" },
      { id: "ng-fc-abuja", countryCode: "NG", regionId: "ng-fc", name: "Abuja" },
    ],
    timezones: ["Africa/Lagos"],
    selectedCountryCode: "NG",
    selectedRegionId: "ng-la",
    meta: meta("partial", [
      {
        source: "launch-location-catalog",
        message:
          "The initial production launch supports Lagos and Abuja. Expand the catalog before opening additional regions.",
        retryable: false,
      },
    ]),
  };
}

export function getProductionIdentityOptions(gamerTag: string): OnboardingIdentityOptionsData {
  return {
    currentGamerTag: gamerTag,
    platforms: [
      { id: "playstation", label: "PlayStation", handleLabel: "PlayStation Network ID" },
      { id: "xbox", label: "Xbox", handleLabel: "Xbox gamertag" },
      { id: "pc", label: "PC", handleLabel: "EA/Steam/Epic handle" },
    ],
    gamerTagRules: {
      minimumLength: 3,
      maximumLength: 24,
      reservedWords: ["admin", "verzus", "support"],
    },
    meta: meta(),
  };
}

export function getProductionAvailabilityOptions(
  timezone: string,
): OnboardingAvailabilityOptionsData {
  return {
    days: [
      { id: "monday", label: "Monday" },
      { id: "tuesday", label: "Tuesday" },
      { id: "wednesday", label: "Wednesday" },
      { id: "thursday", label: "Thursday" },
      { id: "friday", label: "Friday" },
      { id: "saturday", label: "Saturday" },
      { id: "sunday", label: "Sunday" },
    ],
    timezone,
    slotRules: { minuteIncrement: 30, minimumDurationMinutes: 30, maximumWindows: 21 },
    meta: meta(),
  };
}

export function getProductionCrewOptions(gameId: string | null): OnboardingCrewOptionsData {
  return {
    crews: [],
    canSkip: true,
    maximumSuggestions: 6,
    requestedGameId: gameId,
    meta: meta("partial", [
      {
        source: "crew-domain",
        message: "Crew suggestions will appear after the Crew domain is connected to PostgreSQL.",
        retryable: false,
      },
    ]),
  };
}
