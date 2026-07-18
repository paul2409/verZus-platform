// VERZUS M10.6 ACHIEVEMENT SUMMARY AND DETAIL FIXTURES

import type {
  RewardAchievementDetail,
  RewardAchievementSummary,
} from "../model/reward-achievement.types";

export const rewardAchievementSummaryMock: RewardAchievementSummary[] = [
  {
    id: "achievement-first-five",
    title: "First Five",
    description: "Complete five verified matches.",
    state: "unlocked",
    progressCurrent: 5,
    progressTarget: 5,
    rewardId: "inventory-level-23-coins",
    artworkSrc: "/rewards/crew-sticker.svg",
    artworkAlt: "Unlocked First Five achievement badge",
  },
  {
    id: "achievement-weekly-warrior",
    title: "Weekly Warrior",
    description: "Complete ten verified matches in one week.",
    state: "in_progress",
    progressCurrent: 7,
    progressTarget: 10,
    rewardId: "inventory-weekly-150-coins",
    artworkSrc: "/rewards/level-shield.svg",
    artworkAlt: "Weekly Warrior achievement shield",
  },
  {
    id: "achievement-crew-standard",
    title: "Crew Standard",
    description: "Win five verified Crew matches.",
    state: "locked",
    progressCurrent: 2,
    progressTarget: 5,
    rewardId: "inventory-crew-victory-crate",
    artworkSrc: "/rewards/reward-crate.svg",
    artworkAlt: "Locked Crew Standard achievement badge",
  },
];

export const rewardAchievementDetailMockById: Record<string, RewardAchievementDetail> = {
  "achievement-first-five": {
    ...rewardAchievementSummaryMock[0]!,
    categoryLabel: "Match consistency",
    rarity: "common",
    requirementLabel: "Complete 5 server-verified matches in any supported game lane.",
    unlockedAt: "2026-07-13T18:30:00.000Z",
    unlockedAtLabel: "Unlocked 5 days ago",
    linkedReward: {
      id: "inventory-level-23-coins",
      title: "100 VERZUS Coins",
      amountLabel: "100 coins",
      state: "claimed",
    },
    provenance: [
      {
        sourceType: "match",
        sourceId: "match-eafc-1042",
        sourceLabel: "Verified EA FC match vs Mainland Titans",
        verifiedAt: "2026-07-13T18:30:00.000Z",
        verifiedAtLabel: "13 Jul 2026 · 19:30 WAT",
      },
    ],
  },
  "achievement-weekly-warrior": {
    ...rewardAchievementSummaryMock[1]!,
    categoryLabel: "Weekly performance",
    rarity: "rare",
    requirementLabel: "Complete 10 server-verified matches before the weekly reset.",
    unlockedAt: null,
    unlockedAtLabel: null,
    linkedReward: {
      id: "inventory-weekly-150-coins",
      title: "150 VERZUS Coins",
      amountLabel: "150 coins",
      state: "claimable",
    },
    provenance: [
      {
        sourceType: "match",
        sourceId: "week-2026-29",
        sourceLabel: "Seven verified matches recorded this week",
        verifiedAt: "2026-07-18T08:15:00.000Z",
        verifiedAtLabel: "Updated today · 09:15 WAT",
      },
    ],
  },
  "achievement-crew-standard": {
    ...rewardAchievementSummaryMock[2]!,
    categoryLabel: "Crew competition",
    rarity: "epic",
    requirementLabel: "Win 5 verified Crew matches while listed on the active roster.",
    unlockedAt: null,
    unlockedAtLabel: null,
    linkedReward: {
      id: "inventory-crew-victory-crate",
      title: "Crew Victory Crate",
      amountLabel: "Rare crew crate",
      state: "locked",
    },
    provenance: [
      {
        sourceType: "crew",
        sourceId: "crew-xenon-esports",
        sourceLabel: "Two verified wins for Xenon Esports",
        verifiedAt: "2026-07-17T20:10:00.000Z",
        verifiedAtLabel: "17 Jul 2026 · 21:10 WAT",
      },
    ],
  },
};
