// VERZUS M11.6 SERVER-AUTHORITATIVE PROFILE INSIGHT READ MODELS

import type {
  ProfileAchievementCategoryFilter,
  ProfileAchievementStateFilter,
  ProfileInsightScenario,
} from "../model/player-identity-insights.types";

const achievementFixtures = [
  {
    id: "achievement-first-five",
    title: "First Five",
    description: "Win five verified competitive matches.",
    category: "competitive",
    rarity: "common",
    state: "unlocked",
    progress_current: 5,
    progress_target: 5,
    progress_label: "5 / 5 verified wins",
    unlocked_at_label: "12 May 2026",
    reward_label: "250 XP",
    evidence_label: "Verified match ledger",
  },
  {
    id: "achievement-weekly-warrior",
    title: "Weekly Warrior",
    description: "Complete ten verified matches during one competitive week.",
    category: "season",
    rarity: "rare",
    state: "unlocked",
    progress_current: 10,
    progress_target: 10,
    progress_label: "10 / 10 matches",
    unlocked_at_label: "30 Jun 2026",
    reward_label: "Season crest",
    evidence_label: "Season Zero weekly summary",
  },
  {
    id: "achievement-clean-sheet",
    title: "Clean Sheet Protocol",
    description: "Win three EA FC matches without conceding.",
    category: "competitive",
    rarity: "epic",
    state: "in-progress",
    progress_current: 2,
    progress_target: 3,
    progress_label: "2 / 3 clean-sheet wins",
    unlocked_at_label: null,
    reward_label: "Neon keeper banner",
    evidence_label: "Verified EA FC results",
  },
  {
    id: "achievement-crew-standard",
    title: "Crew Standard",
    description: "Contribute 1,000 confirmed points to your Crew.",
    category: "crew",
    rarity: "rare",
    state: "in-progress",
    progress_current: 820,
    progress_target: 1000,
    progress_label: "820 / 1,000 Crew points",
    unlocked_at_label: null,
    reward_label: "Crew standard badge",
    evidence_label: "Xenon Esports contribution ledger",
  },
  {
    id: "achievement-trusted-competitor",
    title: "Trusted Competitor",
    description: "Maintain a trust score of 90 or higher for four weeks.",
    category: "trust",
    rarity: "epic",
    state: "in-progress",
    progress_current: 3,
    progress_target: 4,
    progress_label: "3 / 4 qualifying weeks",
    unlocked_at_label: null,
    reward_label: "Trusted competitor frame",
    evidence_label: "Trust history review",
  },
  {
    id: "achievement-flawless-month",
    title: "Flawless Month",
    description: "Complete a calendar month with no forfeits or penalties.",
    category: "trust",
    rarity: "legendary",
    state: "locked",
    progress_current: 18,
    progress_target: 30,
    progress_label: "18 / 30 compliant days",
    unlocked_at_label: null,
    reward_label: "Legendary integrity title",
    evidence_label: "Compliance and attendance ledger",
  },
  {
    id: "achievement-captains-call",
    title: "Captain's Call",
    description: "Lead a Crew lineup to five verified victories.",
    category: "crew",
    rarity: "epic",
    state: "locked",
    progress_current: 0,
    progress_target: 5,
    progress_label: "Requires captain role",
    unlocked_at_label: null,
    reward_label: "Captain signal emote",
    evidence_label: "Crew role and match ledger",
  },
  {
    id: "achievement-season-finisher",
    title: "Season Finisher",
    description: "Complete every Season Zero weekly objective.",
    category: "season",
    rarity: "legendary",
    state: "locked",
    progress_current: 7,
    progress_target: 12,
    progress_label: "7 / 12 objectives",
    unlocked_at_label: null,
    reward_label: "Season Zero champion card",
    evidence_label: "Season objective ledger",
  },
] as const;

const gameIdentityFixtures = [
  {
    id: "identity-eafc",
    game_label: "EA FC 26",
    handle: "PrismoFC",
    platform_label: "PlayStation 5",
    rank_label: "Elite Division",
    record_label: "142W · 61L · 18D",
    status: "verified",
    visibility: "public",
    linked_at_label: "6 Apr 2026",
    last_verified_at_label: "18 Jul 2026",
  },
  {
    id: "identity-cod",
    game_label: "Call of Duty",
    handle: "PRSM-117",
    platform_label: "PC",
    rank_label: "Diamond II",
    record_label: "68W · 42L",
    status: "verified",
    visibility: "friends",
    linked_at_label: "18 Apr 2026",
    last_verified_at_label: "15 Jul 2026",
  },
  {
    id: "identity-nba",
    game_label: "NBA 2K26",
    handle: "PrismoBuckets",
    platform_label: "Xbox Series X|S",
    rank_label: "Gold I",
    record_label: "34W · 25L · 6D",
    status: "pending",
    visibility: "private",
    linked_at_label: "2 Jul 2026",
    last_verified_at_label: null,
  },
] as const;

const trustCategories = [
  {
    id: "sportsmanship",
    label: "Sportsmanship",
    score: 96,
    detail: "No abusive-conduct reports in the current season.",
  },
  {
    id: "reliability",
    label: "Reliability",
    score: 91,
    detail: "98% check-in completion across confirmed matches.",
  },
  {
    id: "verification",
    label: "Result integrity",
    score: 94,
    detail: "Evidence and result confirmations remain consistent.",
  },
  {
    id: "disputes",
    label: "Dispute record",
    score: 88,
    detail: "One resolved dispute with no active penalties.",
  },
] as const;

const trustHistoryFixtures = [
  {
    id: "trust-event-008",
    type: "verified-result",
    title: "Verified result streak",
    detail: "Ten consecutive results were confirmed without correction.",
    delta: 2,
    score_after: 92,
    occurred_at_label: "18 Jul 2026",
    reference_label: "TRUST-2026-0718",
    actor_label: "VERZUS trust engine",
  },
  {
    id: "trust-event-007",
    type: "sportsmanship",
    title: "Opponent commendation",
    detail: "An opponent marked the match conduct as exemplary.",
    delta: 1,
    score_after: 90,
    occurred_at_label: "13 Jul 2026",
    reference_label: "MATCH-PRISMO-016",
    actor_label: "Opponent feedback",
  },
  {
    id: "trust-event-006",
    type: "reliability",
    title: "Check-in consistency",
    detail: "Five consecutive scheduled matches were checked into on time.",
    delta: 1,
    score_after: 89,
    occurred_at_label: "7 Jul 2026",
    reference_label: "CHECKIN-W27",
    actor_label: "Match operations",
  },
  {
    id: "trust-event-005",
    type: "manual-review",
    title: "Manual evidence review completed",
    detail: "Uploaded result evidence was reviewed and confirmed.",
    delta: 0,
    score_after: 88,
    occurred_at_label: "29 Jun 2026",
    reference_label: "REVIEW-4091",
    actor_label: "VERZUS operations",
  },
  {
    id: "trust-event-004",
    type: "dispute",
    title: "Dispute resolved",
    detail: "A score discrepancy was resolved with no conduct penalty.",
    delta: -1,
    score_after: 88,
    occurred_at_label: "18 Jun 2026",
    reference_label: "DISPUTE-1182",
    actor_label: "Dispute operations",
  },
  {
    id: "trust-event-003",
    type: "verified-result",
    title: "Evidence verification",
    detail: "Three submitted results included complete evidence.",
    delta: 2,
    score_after: 89,
    occurred_at_label: "9 Jun 2026",
    reference_label: "EVIDENCE-W23",
    actor_label: "VERZUS trust engine",
  },
  {
    id: "trust-event-002",
    type: "penalty",
    title: "Late check-in warning",
    detail: "A late check-in warning was recorded without a points deduction.",
    delta: -1,
    score_after: 87,
    occurred_at_label: "27 May 2026",
    reference_label: "WARNING-2705",
    actor_label: "Match operations",
  },
  {
    id: "trust-event-001",
    type: "reliability",
    title: "Profile verification complete",
    detail: "Primary game identity and player account were verified.",
    delta: 3,
    score_after: 88,
    occurred_at_label: "12 May 2026",
    reference_label: "IDENTITY-VERIFY-001",
    actor_label: "Identity service",
  },
] as const;

export function normalizeProfileInsightScenario(value: string | null): ProfileInsightScenario {
  const allowed: ProfileInsightScenario[] = [
    "normal",
    "stale",
    "empty",
    "error",
    "offline",
    "slow",
    "malformed",
    "unauthorized",
    "forbidden",
    "not-found",
    "maintenance",
  ];
  return allowed.includes(value as ProfileInsightScenario)
    ? (value as ProfileInsightScenario)
    : "normal";
}

export function normalizeAchievementCategory(
  value: string | null,
): ProfileAchievementCategoryFilter {
  const allowed: ProfileAchievementCategoryFilter[] = [
    "all",
    "competitive",
    "crew",
    "trust",
    "season",
  ];
  return allowed.includes(value as ProfileAchievementCategoryFilter)
    ? (value as ProfileAchievementCategoryFilter)
    : "all";
}

export function normalizeAchievementState(value: string | null): ProfileAchievementStateFilter {
  const allowed: ProfileAchievementStateFilter[] = ["all", "unlocked", "in-progress", "locked"];
  return allowed.includes(value as ProfileAchievementStateFilter)
    ? (value as ProfileAchievementStateFilter)
    : "all";
}

function requestId(resource: string) {
  return `profile-${resource}-${Date.now().toString(36)}`;
}

export async function buildProfileAchievements(input: {
  category: ProfileAchievementCategoryFilter;
  state: ProfileAchievementStateFilter;
  page: number;
  scenario: ProfileInsightScenario;
}) {
  if (input.scenario === "slow") await new Promise((resolve) => setTimeout(resolve, 1400));
  const filtered = achievementFixtures.filter(
    (entry) =>
      (input.category === "all" || entry.category === input.category) &&
      (input.state === "all" || entry.state === input.state),
  );
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(Math.max(1, input.page), totalPages);
  const entries =
    input.scenario === "empty" ? [] : filtered.slice((page - 1) * pageSize, page * pageSize);

  return {
    data: {
      entries,
      page,
      page_size: pageSize,
      total_entries: input.scenario === "empty" ? 0 : filtered.length,
      total_pages: input.scenario === "empty" ? 0 : totalPages,
      unlocked_count: achievementFixtures.filter((entry) => entry.state === "unlocked").length,
      in_progress_count: achievementFixtures.filter((entry) => entry.state === "in-progress")
        .length,
      locked_count: achievementFixtures.filter((entry) => entry.state === "locked").length,
      freshness: input.scenario === "stale" ? "stale" : "fresh",
    },
    meta: { request_id: requestId("achievements"), generated_at: new Date().toISOString() },
  };
}

export async function buildProfileGameIdentities(input: { scenario: ProfileInsightScenario }) {
  if (input.scenario === "slow") await new Promise((resolve) => setTimeout(resolve, 1200));
  const entries = input.scenario === "empty" ? [] : gameIdentityFixtures;
  return {
    data: {
      entries,
      verified_count: entries.filter((entry) => entry.status === "verified").length,
      pending_count: entries.filter((entry) => entry.status === "pending").length,
      private_count: entries.filter((entry) => entry.visibility === "private").length,
      freshness: input.scenario === "stale" ? "stale" : "fresh",
    },
    meta: { request_id: requestId("game-identities"), generated_at: new Date().toISOString() },
  };
}

export async function buildProfileTrustHistory(input: {
  page: number;
  scenario: ProfileInsightScenario;
}) {
  if (input.scenario === "slow") await new Promise((resolve) => setTimeout(resolve, 1300));
  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(trustHistoryFixtures.length / pageSize));
  const page = Math.min(Math.max(1, input.page), totalPages);
  const entries =
    input.scenario === "empty"
      ? []
      : trustHistoryFixtures.slice((page - 1) * pageSize, page * pageSize);
  return {
    data: {
      score: 92,
      status_label: "Excellent",
      trend: 4,
      categories: trustCategories,
      entries,
      page,
      page_size: pageSize,
      total_entries: input.scenario === "empty" ? 0 : trustHistoryFixtures.length,
      total_pages: input.scenario === "empty" ? 0 : totalPages,
      freshness: input.scenario === "stale" ? "stale" : "fresh",
    },
    meta: { request_id: requestId("trust-history"), generated_at: new Date().toISOString() },
  };
}
