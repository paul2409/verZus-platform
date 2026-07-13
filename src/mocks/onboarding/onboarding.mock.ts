// VERZUS M4 STEP 4.7

import type { OnboardingProgressUpdate } from "../../features/onboarding/model";

export const mockOnboardingUpdates = {
  welcome: {
    step: "welcome",
    payload: {
      acknowledged: true,
    },
  },
  games: {
    step: "games",
    payload: {
      selectedGameIds: ["ea-fc", "efootball"],
    },
  },
  location: {
    step: "location",
    payload: {
      countryCode: "NG",
      region: "Lagos",
      city: "Lagos",
      timezone: "Africa/Lagos",
    },
  },
  identity: {
    step: "identity",
    payload: {
      gamerTag: "JayFlex",
      platform: "playstation",
      platformHandle: "JayFlexPSN",
    },
  },
  availability: {
    step: "availability",
    payload: {
      slots: [
        {
          day: "saturday",
          startTime: "18:00",
          endTime: "22:00",
        },
      ],
    },
  },
  crew: {
    step: "crew",
    payload: {
      decision: "skip",
      crewId: null,
    },
  },
} as const satisfies Record<string, OnboardingProgressUpdate>;
