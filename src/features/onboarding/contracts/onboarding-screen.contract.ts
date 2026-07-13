// VERZUS M4 STEP 4.8

import type { OnboardingStep } from "../model";

export const onboardingScreenStateValues = [
  "loading",
  "success",
  "empty",
  "stale",
  "error",
  "offline",
  "retrying",
  "unauthorized",
  "forbidden",
  "not_found",
  "maintenance",
  "partial_failure",
] as const;

export type OnboardingScreenState = (typeof onboardingScreenStateValues)[number];

export type OnboardingDependencySource =
  | "onboarding_progress"
  | "game_catalog"
  | "location_catalog"
  | "timezone_resolution"
  | "crew_discovery"
  | "player_profile";

export interface OnboardingDataDependency {
  key: string;
  source: OnboardingDependencySource;
  required: boolean;
  failureBehavior: string;
}

export interface OnboardingFailureIsolationRule {
  widget: string;
  isolatedFailure: string;
  survivingActions: readonly string[];
}

export interface OnboardingResponsiveContract {
  mobile390: string;
  tablet768: string;
  desktop1440: string;
}

export interface OnboardingScreenContract {
  id: OnboardingStep;
  route: string;
  purpose: string;
  primaryAction: string;
  previousStep: OnboardingStep | null;
  nextStep: OnboardingStep | null;
  requiredComponents: readonly string[];
  dataDependencies: readonly OnboardingDataDependency[];
  supportedStates: readonly OnboardingScreenState[];
  failureIsolation: readonly OnboardingFailureIsolationRule[];
  responsive: OnboardingResponsiveContract;
}

const baselineStates = [
  "loading",
  "success",
  "stale",
  "error",
  "offline",
  "retrying",
  "unauthorized",
  "forbidden",
  "maintenance",
] as const satisfies readonly OnboardingScreenState[];

export const onboardingScreenContracts = {
  welcome: {
    id: "welcome",
    route: "/onboarding",
    purpose:
      "Explain the onboarding value, confirm the required sequence, and let the player begin or resume safely.",
    primaryAction: "Begin onboarding",
    previousStep: null,
    nextStep: "games",
    requiredComponents: [
      "OnboardingFrame",
      "OnboardingProgress",
      "WelcomeHero",
      "OnboardingValueList",
      "ResumeNotice",
      "PrimaryAction",
    ],
    dataDependencies: [
      {
        key: "draft",
        source: "onboarding_progress",
        required: true,
        failureBehavior:
          "Show a retryable full-step error without exposing protected application navigation.",
      },
    ],
    supportedStates: [...baselineStates, "partial_failure"],
    failureIsolation: [
      {
        widget: "WelcomeHero",
        isolatedFailure: "Decorative media or illustration fails to load.",
        survivingActions: ["Read onboarding summary", "Begin onboarding", "Resume onboarding"],
      },
    ],
    responsive: {
      mobile390:
        "Single-column priority flow with the primary action visible without horizontal scrolling.",
      tablet768: "Single-column or restrained split composition only after mobile approval.",
      desktop1440:
        "Centered onboarding stage with supporting atmosphere; no stretched mobile card.",
    },
  },
  games: {
    id: "games",
    route: "/onboarding/games",
    purpose:
      "Collect the player’s initial supported games and explain how selections affect matches, rankings, and opportunities.",
    primaryAction: "Save games",
    previousStep: "welcome",
    nextStep: "location",
    requiredComponents: [
      "OnboardingFrame",
      "OnboardingProgress",
      "GameSelectionGrid",
      "SelectedGameSummary",
      "SelectionLimitMessage",
      "BackAction",
      "PrimaryAction",
    ],
    dataDependencies: [
      {
        key: "draft",
        source: "onboarding_progress",
        required: true,
        failureBehavior: "Keep navigation blocked until resumable progress can be loaded.",
      },
      {
        key: "games",
        source: "game_catalog",
        required: true,
        failureBehavior: "Show an isolated catalog retry state while preserving back navigation.",
      },
    ],
    supportedStates: [...baselineStates, "empty", "partial_failure"],
    failureIsolation: [
      {
        widget: "GameSelectionGrid",
        isolatedFailure: "Game catalog cannot load or returns no eligible games.",
        survivingActions: ["Return to welcome", "Retry game catalog", "Read selection guidance"],
      },
    ],
    responsive: {
      mobile390:
        "Touch-first selectable game cards in a vertical or two-column grid with persistent selection feedback.",
      tablet768:
        "Wider grid only when card labels remain readable and touch targets remain compliant.",
      desktop1440: "Multi-column catalog beside a compact selected-games summary; no dense table.",
    },
  },
  location: {
    id: "location",
    route: "/onboarding/location",
    purpose:
      "Capture competition location and timezone data used for eligibility, scheduling, and regional discovery.",
    primaryAction: "Save location",
    previousStep: "games",
    nextStep: "identity",
    requiredComponents: [
      "OnboardingFrame",
      "OnboardingProgress",
      "CountryField",
      "RegionField",
      "CityField",
      "TimezonePreview",
      "LocationPrivacyNotice",
      "BackAction",
      "PrimaryAction",
    ],
    dataDependencies: [
      {
        key: "draft",
        source: "onboarding_progress",
        required: true,
        failureBehavior: "Block mutation until the resumable draft is available.",
      },
      {
        key: "locations",
        source: "location_catalog",
        required: false,
        failureBehavior: "Allow validated manual location entry when suggestions fail.",
      },
      {
        key: "timezone",
        source: "timezone_resolution",
        required: false,
        failureBehavior: "Allow manual timezone selection without losing entered location fields.",
      },
    ],
    supportedStates: [...baselineStates, "empty", "partial_failure"],
    failureIsolation: [
      {
        widget: "TimezonePreview",
        isolatedFailure: "Automatic timezone resolution is unavailable.",
        survivingActions: [
          "Edit country",
          "Edit region",
          "Edit city",
          "Select timezone manually",
          "Return to games",
        ],
      },
    ],
    responsive: {
      mobile390:
        "Stacked fields with no side-by-side controls and clear keyboard-safe primary action placement.",
      tablet768:
        "Country and region may share a row only when labels and errors remain fully visible.",
      desktop1440:
        "Two-column form and contextual privacy panel without widening inputs beyond readable measure.",
    },
  },
  identity: {
    id: "identity",
    route: "/onboarding/identity",
    purpose:
      "Create the public player identity used in matches, rankings, Crews, and platform recognition.",
    primaryAction: "Save identity",
    previousStep: "location",
    nextStep: "availability",
    requiredComponents: [
      "OnboardingFrame",
      "OnboardingProgress",
      "GamerTagField",
      "GamingPlatformSelector",
      "PlatformHandleField",
      "IdentityPreview",
      "BackAction",
      "PrimaryAction",
    ],
    dataDependencies: [
      {
        key: "draft",
        source: "onboarding_progress",
        required: true,
        failureBehavior: "Prevent edits from overwriting unknown resumable progress.",
      },
      {
        key: "profile",
        source: "player_profile",
        required: false,
        failureBehavior:
          "Continue with local identity preview if profile enrichment is unavailable.",
      },
    ],
    supportedStates: [...baselineStates, "partial_failure"],
    failureIsolation: [
      {
        widget: "IdentityPreview",
        isolatedFailure: "Preview rendering or profile enrichment fails.",
        survivingActions: [
          "Edit gamer tag",
          "Select platform",
          "Edit platform handle",
          "Save identity",
          "Return to location",
        ],
      },
    ],
    responsive: {
      mobile390:
        "Single-column fields followed by a compact identity preview; preview never pushes actions below an excessive fold.",
      tablet768: "Form and preview may use a controlled split after mobile approval.",
      desktop1440: "Balanced form-and-preview layout with independent preview failure state.",
    },
  },
  availability: {
    id: "availability",
    route: "/onboarding/availability",
    purpose:
      "Collect realistic weekly play windows for check-ins, matchmaking, and competition scheduling.",
    primaryAction: "Save availability",
    previousStep: "identity",
    nextStep: "crew",
    requiredComponents: [
      "OnboardingFrame",
      "OnboardingProgress",
      "DaySelector",
      "TimeRangeEditor",
      "AvailabilityWindowList",
      "AvailabilityEmptyState",
      "TimezoneReminder",
      "BackAction",
      "PrimaryAction",
    ],
    dataDependencies: [
      {
        key: "draft",
        source: "onboarding_progress",
        required: true,
        failureBehavior: "Preserve unsaved local entries and provide retry before mutation.",
      },
    ],
    supportedStates: [...baselineStates, "empty", "partial_failure"],
    failureIsolation: [
      {
        widget: "AvailabilityWindowList",
        isolatedFailure: "One saved row cannot render or validate.",
        survivingActions: [
          "Add another window",
          "Edit unaffected windows",
          "Remove affected window",
          "Return to identity",
        ],
      },
    ],
    responsive: {
      mobile390:
        "Day and time editing use touch-sized controls and stacked rows; no desktop scheduler grid.",
      tablet768:
        "Two-column day and time controls only when each row remains independently editable.",
      desktop1440:
        "Weekly editor may show a denser summary beside the active editor, never a compressed mobile form.",
    },
  },
  crew: {
    id: "crew",
    route: "/onboarding/crew",
    purpose: "Let the player join a Crew or explicitly skip without blocking platform access.",
    primaryAction: "Save Crew choice",
    previousStep: "availability",
    nextStep: "complete",
    requiredComponents: [
      "OnboardingFrame",
      "OnboardingProgress",
      "CrewChoiceCards",
      "CrewDiscoveryPreview",
      "JoinCrewAction",
      "SkipCrewAction",
      "BackAction",
      "PrimaryAction",
    ],
    dataDependencies: [
      {
        key: "draft",
        source: "onboarding_progress",
        required: true,
        failureBehavior: "Do not submit a Crew choice against an unknown draft.",
      },
      {
        key: "crewSuggestions",
        source: "crew_discovery",
        required: false,
        failureBehavior: "Keep the skip path available when discovery fails.",
      },
    ],
    supportedStates: [...baselineStates, "empty", "partial_failure"],
    failureIsolation: [
      {
        widget: "CrewDiscoveryPreview",
        isolatedFailure: "Crew suggestions are unavailable.",
        survivingActions: [
          "Skip Crew",
          "Retry discovery",
          "Return to availability",
          "Continue onboarding",
        ],
      },
    ],
    responsive: {
      mobile390:
        "Join and skip choices are explicit stacked cards; skip is never hidden in secondary text.",
      tablet768: "Choice cards may sit side by side when their descriptions remain readable.",
      desktop1440:
        "Crew discovery can occupy a secondary panel while the join-or-skip decision remains primary.",
    },
  },
  complete: {
    id: "complete",
    route: "/onboarding/complete",
    purpose:
      "Summarize the validated setup, surface any incomplete item, and explicitly enter the platform.",
    primaryAction: "Enter VERZUS",
    previousStep: "crew",
    nextStep: null,
    requiredComponents: [
      "OnboardingFrame",
      "OnboardingProgress",
      "CompletionSummary",
      "PlayerIdentitySummary",
      "GamesSummary",
      "AvailabilitySummary",
      "CrewChoiceSummary",
      "EditStepLinks",
      "PrimaryAction",
    ],
    dataDependencies: [
      {
        key: "draft",
        source: "onboarding_progress",
        required: true,
        failureBehavior: "Do not complete onboarding until the full validated draft is available.",
      },
    ],
    supportedStates: [...baselineStates, "partial_failure"],
    failureIsolation: [
      {
        widget: "CompletionSummary",
        isolatedFailure: "One optional summary widget cannot render.",
        survivingActions: [
          "Edit available steps",
          "Retry summary",
          "Complete onboarding when required data remains valid",
        ],
      },
    ],
    responsive: {
      mobile390:
        "Vertical review cards with edit links and a prominent completion action; no summary table.",
      tablet768: "Two-column review groups only after mobile approval.",
      desktop1440:
        "Structured review dashboard with independently failing summary cards and a stable completion action.",
    },
  },
} as const satisfies Record<OnboardingStep, OnboardingScreenContract>;

export function getOnboardingScreenContract(step: OnboardingStep): OnboardingScreenContract {
  return onboardingScreenContracts[step];
}
