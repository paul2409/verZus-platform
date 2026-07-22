// VERZUS M5 STEPS 5.1-5.4

export const playScreenVariants = [
  "normal",
  "check_in_open",
  "checked_in",
  "match_starting_soon",
  "no_match_scheduled",
  "crew_activity_present",
  "no_crew",
  "opportunities_available",
  "partial_api_failure",
  "offline",
] as const;

export type PlayScreenVariant = (typeof playScreenVariants)[number];

export const playReferenceViewports = [390, 768, 1440] as const;

export type PlayReferenceViewport = (typeof playReferenceViewports)[number];

export const playWidgetIds = [
  "player-status",
  "next-match",
  "check-in",
  "current-position",
  "crew-pulse",
  "opportunities",
  "recent-activity",
  "quick-actions",
] as const;

export type PlayWidgetId = (typeof playWidgetIds)[number];

export const playWidgetStates = [
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

export type PlayWidgetState = (typeof playWidgetStates)[number];

export interface PlayWidgetContract {
  id: PlayWidgetId;
  component: string;
  purpose: string;
  endpoint: string | null;
  essential: boolean;
  supportedStates: readonly PlayWidgetState[];
  failureBehavior: string;
}

export const playPrimaryQuestions = [
  "What do I need to do now?",
  "Who am I playing next?",
  "Have I checked in?",
  "Where do I currently rank?",
  "What is happening with my Crew?",
  "What opportunities can I enter?",
] as const;

export const playWidgetContracts: readonly PlayWidgetContract[] = [
  {
    id: "player-status",
    component: "PlayOverviewStrip",
    purpose: "Establish the current player, game lane, week, trust, and notification context.",
    endpoint: "/api/me/status",
    essential: true,
    supportedStates: [
      "loading",
      "success",
      "stale",
      "error",
      "offline",
      "unauthorized",
      "forbidden",
      "maintenance",
    ],
    failureBehavior:
      "Render an isolated identity fallback while preserving navigation and the primary match action.",
  },
  {
    id: "next-match",
    component: "NextMatchCard",
    purpose: "Show the next opponent, game, format, time, and current match state.",
    endpoint: "/api/matches/next",
    essential: true,
    supportedStates: [
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
    ],
    failureBehavior:
      "Show a retry card. Do not hide check-in or page navigation when cached check-in data remains usable.",
  },
  {
    id: "check-in",
    component: "CheckInControl",
    purpose: "Expose the highest-priority match action using server-authoritative timing.",
    endpoint: "/api/check-ins/current",
    essential: true,
    supportedStates: [
      "loading",
      "success",
      "empty",
      "stale",
      "error",
      "offline",
      "retrying",
      "unauthorized",
      "forbidden",
      "maintenance",
    ],
    failureBehavior:
      "Keep the action area visible, disable unsafe mutation, and provide a focused retry path.",
  },
  {
    id: "current-position",
    component: "CurrentPositionWidget",
    purpose: "Show weekly rank, points, movement, record, streak, and progress.",
    endpoint: "/api/leaderboards/me",
    essential: false,
    supportedStates: [
      "loading",
      "success",
      "empty",
      "stale",
      "error",
      "offline",
      "retrying",
      "maintenance",
    ],
    failureBehavior:
      "Keep the previous rank visible when stale. Otherwise show a compact unavailable state.",
  },
  {
    id: "crew-pulse",
    component: "CrewPulseWidget",
    purpose: "Show Crew identity, rank, online members, live activity, and the next Crew fixture.",
    endpoint: "/api/crews/me/summary",
    essential: false,
    supportedStates: [
      "loading",
      "success",
      "empty",
      "stale",
      "error",
      "offline",
      "retrying",
      "maintenance",
      "partial_failure",
    ],
    failureBehavior:
      "Crew failure must not affect the next-match, check-in, opportunities, or navigation widgets.",
  },
  {
    id: "opportunities",
    component: "OpportunityRail",
    purpose: "Recommend competitions the player is eligible to enter next.",
    endpoint: "/api/competitions/recommended",
    essential: false,
    supportedStates: [
      "loading",
      "success",
      "empty",
      "stale",
      "error",
      "offline",
      "retrying",
      "maintenance",
      "partial_failure",
    ],
    failureBehavior:
      "Show recommendations unavailable without removing the primary match action or quick actions.",
  },
  {
    id: "recent-activity",
    component: "RecentActivityWidget",
    purpose: "Summarize recent results, points, rank movement, and Crew events.",
    endpoint: "/api/activity/recent",
    essential: false,
    supportedStates: [
      "loading",
      "success",
      "empty",
      "stale",
      "error",
      "offline",
      "retrying",
      "maintenance",
      "partial_failure",
    ],
    failureBehavior:
      "Collapse to an isolated retry card while all other dashboard widgets remain interactive.",
  },
  {
    id: "quick-actions",
    component: "QuickActions",
    purpose:
      "Provide stable links to finding a match, competitions, leaderboards, and Crew actions.",
    endpoint: null,
    essential: true,
    supportedStates: ["success", "offline", "forbidden", "maintenance"],
    failureBehavior:
      "Static navigation actions remain available and must not depend on any Play data request.",
  },
] as const;

export const playIndependentEndpoints = playWidgetContracts
  .map((widget) => widget.endpoint)
  .filter((endpoint): endpoint is string => endpoint !== null);

export function getPlayWidgetContract(id: PlayWidgetId): PlayWidgetContract {
  const contract = playWidgetContracts.find((widget) => widget.id === id);

  if (!contract) {
    throw new Error(`Unknown Play widget contract: ${id}`);
  }

  return contract;
}

export function validatePlayScreenContract(): readonly string[] {
  const violations: string[] = [];
  const widgetIds = new Set<string>();
  const endpoints = new Set<string>();

  for (const widget of playWidgetContracts) {
    if (widgetIds.has(widget.id)) {
      violations.push(`Duplicate widget id: ${widget.id}`);
    }

    widgetIds.add(widget.id);

    if (widget.endpoint) {
      if (endpoints.has(widget.endpoint)) {
        violations.push(`Duplicate endpoint ownership: ${widget.endpoint}`);
      }

      endpoints.add(widget.endpoint);
    }

    if (widget.supportedStates.length === 0) {
      violations.push(`Widget has no supported states: ${widget.id}`);
    }
  }

  const requiredEssentialWidgets: readonly PlayWidgetId[] = [
    "player-status",
    "next-match",
    "check-in",
    "quick-actions",
  ];

  for (const id of requiredEssentialWidgets) {
    if (!getPlayWidgetContract(id).essential) {
      violations.push(`Essential widget is not marked essential: ${id}`);
    }
  }

  return violations;
}
