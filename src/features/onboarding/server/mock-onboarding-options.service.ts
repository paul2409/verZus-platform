// VERZUS M4 STEP 4.9

import {
  mockOnboardingAvailabilityOptions,
  mockOnboardingCrewOptions,
  mockOnboardingGameOptions,
  mockOnboardingIdentityOptions,
  mockOnboardingLocationOptions,
} from "../../../mocks/onboarding/onboarding-options.mock";
import type { OnboardingApiFailure } from "../api/onboarding-api.schema";
import type {
  OnboardingAvailabilityOptionsData,
  OnboardingAvailabilityOptionsSuccess,
  OnboardingCrewOptionsData,
  OnboardingCrewOptionsSuccess,
  OnboardingGameOptionsData,
  OnboardingGameOptionsSuccess,
  OnboardingIdentityOptionsData,
  OnboardingIdentityOptionsSuccess,
  OnboardingLocationOptionsData,
  OnboardingLocationOptionsSuccess,
  OnboardingOptionMeta,
} from "../api/onboarding-options.schema";

export const onboardingMockScenarioValues = [
  "success",
  "empty",
  "partial_failure",
  "maintenance",
  "rate_limited",
] as const;

export type OnboardingMockScenario = (typeof onboardingMockScenarioValues)[number];

export interface MockOnboardingOptionsResult<TBody> {
  status: number;
  body: TBody;
}

function requestId(resource: string): string {
  return `mock-onboarding-${resource}-${globalThis.crypto.randomUUID()}`;
}

function failure(
  resource: string,
  status: number,
  code: string,
  message: string,
  retryable: boolean,
): MockOnboardingOptionsResult<OnboardingApiFailure> {
  return {
    status,
    body: {
      ok: false,
      error: {
        code,
        message,
        requestId: requestId(resource),
        retryable,
        fieldErrors: {},
      },
    },
  };
}

function scenarioFailure(
  resource: string,
  scenario: OnboardingMockScenario,
): MockOnboardingOptionsResult<OnboardingApiFailure> | null {
  if (scenario === "maintenance") {
    return failure(
      resource,
      503,
      "maintenance",
      `${resource} options are temporarily unavailable.`,
      true,
    );
  }

  if (scenario === "rate_limited") {
    return failure(
      resource,
      429,
      "rate_limited",
      `Too many ${resource} option requests. Retry shortly.`,
      true,
    );
  }

  return null;
}

function partialMeta(resource: string): OnboardingOptionMeta {
  return {
    status: "partial",
    warnings: [
      {
        source: resource,
        message: `Some ${resource} option data is temporarily unavailable.`,
        retryable: true,
      },
    ],
    generatedAt: new Date().toISOString(),
  };
}

function currentMeta(): OnboardingOptionMeta {
  return {
    status: "complete",
    warnings: [],
    generatedAt: new Date().toISOString(),
  };
}

function gameData(scenario: OnboardingMockScenario): OnboardingGameOptionsData {
  return {
    ...mockOnboardingGameOptions,
    games: scenario === "empty" ? [] : mockOnboardingGameOptions.games,
    recommendedGameIds: scenario === "empty" ? [] : mockOnboardingGameOptions.recommendedGameIds,
    meta: scenario === "partial_failure" ? partialMeta("game") : currentMeta(),
  };
}

function locationData(
  scenario: OnboardingMockScenario,
  countryCode: string | null,
  regionId: string | null,
): OnboardingLocationOptionsData {
  const normalizedCountry = countryCode?.toUpperCase() ?? null;

  return {
    ...mockOnboardingLocationOptions,
    countries: scenario === "empty" ? [] : mockOnboardingLocationOptions.countries,
    regions:
      scenario === "empty"
        ? []
        : mockOnboardingLocationOptions.regions.filter(
            (region) => !normalizedCountry || region.countryCode === normalizedCountry,
          ),
    cities:
      scenario === "empty"
        ? []
        : mockOnboardingLocationOptions.cities.filter(
            (city) =>
              (!normalizedCountry || city.countryCode === normalizedCountry) &&
              (!regionId || city.regionId === regionId),
          ),
    selectedCountryCode: normalizedCountry,
    selectedRegionId: regionId,
    meta: scenario === "partial_failure" ? partialMeta("location") : currentMeta(),
  };
}

function identityData(scenario: OnboardingMockScenario): OnboardingIdentityOptionsData {
  return {
    ...mockOnboardingIdentityOptions,
    platforms: scenario === "empty" ? [] : mockOnboardingIdentityOptions.platforms,
    meta: scenario === "partial_failure" ? partialMeta("identity") : currentMeta(),
  };
}

function availabilityData(
  scenario: OnboardingMockScenario,
  timezone: string | null,
): OnboardingAvailabilityOptionsData {
  return {
    ...mockOnboardingAvailabilityOptions,
    days: scenario === "empty" ? [] : mockOnboardingAvailabilityOptions.days,
    timezone: timezone ?? mockOnboardingAvailabilityOptions.timezone,
    meta: scenario === "partial_failure" ? partialMeta("availability") : currentMeta(),
  };
}

function crewData(
  scenario: OnboardingMockScenario,
  gameId: string | null,
): OnboardingCrewOptionsData {
  return {
    ...mockOnboardingCrewOptions,
    crews:
      scenario === "empty"
        ? []
        : mockOnboardingCrewOptions.crews.filter(
            (crew) => !gameId || crew.supportedGameIds.includes(gameId),
          ),
    requestedGameId: gameId,
    meta: scenario === "partial_failure" ? partialMeta("crew") : currentMeta(),
  };
}

export function getMockOnboardingGameOptions(
  scenario: OnboardingMockScenario,
): MockOnboardingOptionsResult<OnboardingGameOptionsSuccess | OnboardingApiFailure> {
  const failed = scenarioFailure("game", scenario);

  if (failed) {
    return failed;
  }

  return {
    status: 200,
    body: {
      ok: true,
      data: gameData(scenario),
      requestId: requestId("game"),
    },
  };
}

export function getMockOnboardingLocationOptions(
  scenario: OnboardingMockScenario,
  countryCode: string | null,
  regionId: string | null,
): MockOnboardingOptionsResult<OnboardingLocationOptionsSuccess | OnboardingApiFailure> {
  const failed = scenarioFailure("location", scenario);

  if (failed) {
    return failed;
  }

  return {
    status: 200,
    body: {
      ok: true,
      data: locationData(scenario, countryCode, regionId),
      requestId: requestId("location"),
    },
  };
}

export function getMockOnboardingIdentityOptions(
  scenario: OnboardingMockScenario,
): MockOnboardingOptionsResult<OnboardingIdentityOptionsSuccess | OnboardingApiFailure> {
  const failed = scenarioFailure("identity", scenario);

  if (failed) {
    return failed;
  }

  return {
    status: 200,
    body: {
      ok: true,
      data: identityData(scenario),
      requestId: requestId("identity"),
    },
  };
}

export function getMockOnboardingAvailabilityOptions(
  scenario: OnboardingMockScenario,
  timezone: string | null,
): MockOnboardingOptionsResult<OnboardingAvailabilityOptionsSuccess | OnboardingApiFailure> {
  const failed = scenarioFailure("availability", scenario);

  if (failed) {
    return failed;
  }

  return {
    status: 200,
    body: {
      ok: true,
      data: availabilityData(scenario, timezone),
      requestId: requestId("availability"),
    },
  };
}

export function getMockOnboardingCrewOptions(
  scenario: OnboardingMockScenario,
  gameId: string | null,
): MockOnboardingOptionsResult<OnboardingCrewOptionsSuccess | OnboardingApiFailure> {
  const failed = scenarioFailure("crew", scenario);

  if (failed) {
    return failed;
  }

  return {
    status: 200,
    body: {
      ok: true,
      data: crewData(scenario, gameId),
      requestId: requestId("crew"),
    },
  };
}
