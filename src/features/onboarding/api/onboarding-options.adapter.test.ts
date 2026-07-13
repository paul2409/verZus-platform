// VERZUS M4 STEP 4.9

import { describe, expect, it } from "vitest";

import {
  adaptOnboardingAvailabilityOptionsPayload,
  adaptOnboardingCrewOptionsPayload,
  adaptOnboardingGameOptionsPayload,
  adaptOnboardingIdentityOptionsPayload,
  adaptOnboardingLocationOptionsPayload,
} from "./onboarding-options.adapter";
import { OnboardingApiClientError } from "./onboarding-progress.adapter";

const meta = {
  status: "complete",
  warnings: [],
  generatedAt: "2026-07-13T12:00:00.000Z",
} as const;

describe("onboarding options adapters", () => {
  it("adapts game options", () => {
    const data = adaptOnboardingGameOptionsPayload({
      ok: true,
      data: {
        games: [
          {
            id: "ea-fc",
            name: "EA SPORTS FC",
            shortName: "EA FC",
            active: true,
            competitive: true,
            platforms: ["playstation", "xbox", "pc"],
          },
        ],
        recommendedGameIds: ["ea-fc"],
        maximumSelections: 5,
        meta,
      },
      requestId: "options-games-1",
    });

    expect(data.games[0]?.id).toBe("ea-fc");
  });

  it("adapts location options", () => {
    const data = adaptOnboardingLocationOptionsPayload({
      ok: true,
      data: {
        countries: [{ code: "NG", name: "Nigeria" }],
        regions: [],
        cities: [],
        timezones: ["Africa/Lagos"],
        selectedCountryCode: "NG",
        selectedRegionId: null,
        meta,
      },
      requestId: "options-locations-1",
    });

    expect(data.timezones).toContain("Africa/Lagos");
  });

  it("adapts identity options", () => {
    const data = adaptOnboardingIdentityOptionsPayload({
      ok: true,
      data: {
        platforms: [
          {
            id: "playstation",
            label: "PlayStation",
            handleLabel: "PSN ID",
          },
        ],
        gamerTagRules: {
          minimumLength: 3,
          maximumLength: 24,
          reservedWords: ["admin"],
        },
        meta,
      },
      requestId: "options-identity-1",
    });

    expect(data.platforms[0]?.id).toBe("playstation");
  });

  it("adapts availability options", () => {
    const data = adaptOnboardingAvailabilityOptionsPayload({
      ok: true,
      data: {
        days: [{ id: "monday", label: "Monday" }],
        timezone: "Africa/Lagos",
        slotRules: {
          minuteIncrement: 30,
          minimumDurationMinutes: 60,
          maximumWindows: 21,
        },
        meta,
      },
      requestId: "options-availability-1",
    });

    expect(data.slotRules.minuteIncrement).toBe(30);
  });

  it("adapts Crew options and preserves the skip path", () => {
    const data = adaptOnboardingCrewOptionsPayload({
      ok: true,
      data: {
        crews: [],
        canSkip: true,
        maximumSuggestions: 6,
        requestedGameId: "ea-fc",
        meta,
      },
      requestId: "options-crews-1",
    });

    expect(data.canSkip).toBe(true);
  });

  it("converts a service failure into a client error", () => {
    expect(() =>
      adaptOnboardingGameOptionsPayload({
        ok: false,
        error: {
          code: "maintenance",
          message: "Game options are unavailable.",
          requestId: "options-games-2",
          retryable: true,
          fieldErrors: {},
        },
      }),
    ).toThrow(OnboardingApiClientError);
  });
});
