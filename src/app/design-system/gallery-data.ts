export type GalleryPreview = {
  step: number;
  title: string;
  href: string;
  description: string;
  capabilities: readonly string[];
};

export type GalleryGroup = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  previews: readonly GalleryPreview[];
};

export const galleryGroups: readonly GalleryGroup[] = [
  {
    id: "foundation",
    eyebrow: "Steps 2-6",
    title: "Visual foundation",
    description:
      "Tokens, atmosphere, fonts, typography and icons establish the shared visual contract.",
    previews: [
      {
        step: 2,
        title: "Design tokens",
        href: "/token-preview",
        description: "Semantic colour, spacing, elevation, border and motion variables.",
        capabilities: ["Semantic tokens", "Theme-safe values", "Responsive spacing"],
      },
      {
        step: 3,
        title: "Global atmosphere",
        href: "/atmosphere-preview",
        description: "Global reset, background texture and premium mechanical atmosphere.",
        capabilities: ["Page atmosphere", "Reset rules", "Overflow protection"],
      },
      {
        step: 4,
        title: "Font system",
        href: "/font-preview",
        description: "Rajdhani display typography with Inter for dense interface content.",
        capabilities: ["Font loading", "Fallback stack", "Weight verification"],
      },
      {
        step: 5,
        title: "Typography",
        href: "/typography-preview",
        description: "Responsive display, heading, body, label and data-number styles.",
        capabilities: ["Type scale", "Data numerals", "Accessible line height"],
      },
      {
        step: 6,
        title: "Icon system",
        href: "/icon-preview",
        description: "Consistent icons and icon-only actions with accessible labelling.",
        capabilities: ["Icon catalogue", "Icon buttons", "Decorative semantics"],
      },
    ],
  },
  {
    id: "controls",
    eyebrow: "Steps 7, 8 and 12",
    title: "Controls and selection",
    description:
      "Actions, form inputs, tabs and segmented controls preserve keyboard access and touch sizing.",
    previews: [
      {
        step: 7,
        title: "Buttons",
        href: "/button-preview",
        description: "Primary, secondary, danger and ghost actions with loading behaviour.",
        capabilities: ["Action hierarchy", "Loading state", "Button groups"],
      },
      {
        step: 8,
        title: "Forms",
        href: "/form-preview",
        description: "Inputs, selects, checkboxes and field-level validation contracts.",
        capabilities: ["Labels", "Validation", "Disabled and required states"],
      },
      {
        step: 12,
        title: "Tabs and segmented controls",
        href: "/tabs-preview",
        description: "Keyboard-operable content tabs and compact view filters.",
        capabilities: ["Automatic or manual tabs", "Radiogroup controls", "Mobile scrolling"],
      },
    ],
  },
  {
    id: "surfaces-identities",
    eyebrow: "Steps 9-11",
    title: "Surfaces, status and identity",
    description:
      "Mechanical cards, operational badges and player or Crew identities form reusable presentation blocks.",
    previews: [
      {
        step: 9,
        title: "Cards and panels",
        href: "/card-preview",
        description: "Collectible-card surfaces and resilient panel modules.",
        capabilities: ["Card rarities", "Panel states", "Independent modules"],
      },
      {
        step: 10,
        title: "Badges and status",
        href: "/badge-preview",
        description: "Rank, movement, presence and compact performance indicators.",
        capabilities: ["Semantic badges", "Rank tiers", "Movement indicators"],
      },
      {
        step: 11,
        title: "Avatars and identities",
        href: "/avatar-preview",
        description: "Player portraits, Crew emblems and reusable identity rows.",
        capabilities: ["Image fallback", "Presence", "Player and Crew identity"],
      },
    ],
  },
  {
    id: "competition-data",
    eyebrow: "Steps 13-14",
    title: "Competition and match data",
    description:
      "Dense competitive information uses dedicated mobile and desktop presentations with explicit lifecycle states.",
    previews: [
      {
        step: 13,
        title: "Leaderboards",
        href: "/leaderboard-preview",
        description: "Semantic desktop tables and dedicated mobile ranking cards.",
        capabilities: ["Deterministic sorting", "Pinned player", "Partial failure"],
      },
      {
        step: 14,
        title: "Matches and competitions",
        href: "/match-competition-preview",
        description: "Match lifecycle, check-in, bracket, competition and overlay primitives.",
        capabilities: ["Check-in states", "Competition status", "Modal and drawer overlays"],
      },
    ],
  },
  {
    id: "navigation-resilience",
    eyebrow: "Steps 15-16",
    title: "Navigation and resilience",
    description:
      "Essential navigation survives unrelated failures while every system state remains visible and actionable.",
    previews: [
      {
        step: 15,
        title: "Bottom navigation",
        href: "/bottom-navigation-preview",
        description:
          "Mobile-first navigation with current, partial, disabled and notification states.",
        capabilities: ["Safe-area support", "Prominent Play action", "Failure isolation"],
      },
      {
        step: 16,
        title: "Feedback and system states",
        href: "/feedback-preview",
        description: "Loading, empty, error, offline, maintenance and partial-failure feedback.",
        capabilities: ["11 state contracts", "Toasts", "Skeletons and section structure"],
      },
    ],
  },
  // M2 STEP 19 GALLERY
  {
    id: "intel-cards",
    eyebrow: "Step 19",
    title: "Command-centre Intel Cards",
    description:
      "Player, Match, Crew and War Match summaries with independent loading and failure states.",
    previews: [
      {
        step: 19,
        title: "Intel cards",
        href: "/intel-cards-preview",
        description:
          "Responsive command-centre cards for identity, check-in, Crew performance and live Crew wars.",
        capabilities: [
          "Four domain-owned cards",
          "Container-responsive layouts",
          "Independent failure states",
        ],
      },
    ],
  },
] as const;

export const supportedStates = [
  ["Loading", "Data is being requested without collapsing the layout."],
  ["Success", "Validated data is available and current."],
  ["Empty", "The request succeeded but no records match the current context."],
  ["Stale", "Cached data remains visible while freshness is disclosed."],
  ["Error", "The affected module failed and exposes recovery where possible."],
  ["Offline", "Network-dependent actions are restricted while safe cached data remains."],
  ["Retrying", "A controlled retry is in progress."],
  ["Unauthorized", "Authentication is required before the operation can continue."],
  ["Forbidden", "The user is authenticated but lacks permission."],
  ["Not found", "The requested resource does not exist or is no longer available."],
  ["Maintenance", "The capability is temporarily unavailable by design."],
  ["Partial failure", "One module failed while essential actions and sibling modules survive."],
] as const;

export const viewportChecks = [
  ["360 px", "Small Android baseline"],
  ["390 px", "Primary approved mobile reference"],
  ["430 px", "Large mobile"],
  ["768 px", "Tablet transition"],
  ["1024 px", "Compact desktop or landscape tablet"],
  ["1440 px", "Primary desktop audit"],
] as const;
