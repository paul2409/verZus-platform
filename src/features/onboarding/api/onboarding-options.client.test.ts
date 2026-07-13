// VERZUS M4 STEP 4.9

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getOnboardingCrewOptions,
  getOnboardingLocationOptions,
} from "./onboarding-options.client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("onboarding options client", () => {
  it("encodes location filters", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            ok: true,
            data: {
              countries: [],
              regions: [],
              cities: [],
              timezones: ["Africa/Lagos"],
              selectedCountryCode: "NG",
              selectedRegionId: "ng-lagos",
              meta: {
                status: "complete",
                warnings: [],
                generatedAt: "2026-07-13T12:00:00.000Z",
              },
            },
            requestId: "location-client-1",
          }),
        ),
    );

    vi.stubGlobal("fetch", fetchMock);

    await getOnboardingLocationOptions({
      countryCode: "NG",
      regionId: "ng-lagos",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/onboarding/options/locations?countryCode=NG&regionId=ng-lagos",
      expect.objectContaining({
        method: "GET",
        cache: "no-store",
      }),
    );
  });

  it("preserves Crew skip when suggestions are empty", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              ok: true,
              data: {
                crews: [],
                canSkip: true,
                maximumSuggestions: 6,
                requestedGameId: "ea-fc",
                meta: {
                  status: "complete",
                  warnings: [],
                  generatedAt: "2026-07-13T12:00:00.000Z",
                },
              },
              requestId: "crew-client-1",
            }),
          ),
      ),
    );

    const data = await getOnboardingCrewOptions({
      gameId: "ea-fc",
    });

    expect(data.canSkip).toBe(true);
    expect(data.crews).toEqual([]);
  });
});
