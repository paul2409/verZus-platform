import type { CompetitionArtKey } from "../../discovery/model/competition-discovery.types";
import type { CompetitionDetailMock } from "../model/competition-detail.types";

type CompetitionIdentity = {
  id: string;
  name: string;
  gameLabel: string;
  formatLabel: string;
  teamSizeLabel: string;
  capacityLabel: string;
  entryFeeLabel: string;
  prizePoolLabel: string;
  artKey: CompetitionArtKey;
};

const identities: CompetitionIdentity[] = [
  {
    id: "verzus-championship-series",
    name: "VERZUS CHAMPIONSHIP SERIES",
    gameLabel: "MULTI-GAME",
    formatLabel: "CREW CHAMPIONSHIP",
    teamSizeLabel: "5V5 CREWS",
    capacityLabel: "32 / 32 CREWS",
    entryFeeLabel: "INVITATION",
    prizePoolLabel: "$25,000",
    artKey: "championship",
  },
  {
    id: "ea-fc-rookie-cup",
    name: "EA FC ROOKIE CUP",
    gameLabel: "EA FC",
    formatLabel: "SWISS FORMAT",
    teamSizeLabel: "1V1",
    capacityLabel: "128 / 256 PLAYERS",
    entryFeeLabel: "FREE",
    prizePoolLabel: "$5,000",
    artKey: "ea-fc",
  },
  {
    id: "cod-mobile-squad-battles",
    name: "COD MOBILE: SQUAD BATTLES",
    gameLabel: "COD MOBILE",
    formatLabel: "DOUBLE ELIMINATION",
    teamSizeLabel: "4V4",
    capacityLabel: "64 / 128 TEAMS",
    entryFeeLabel: "FREE",
    prizePoolLabel: "$7,500",
    artKey: "cod-mobile",
  },
  {
    id: "clash-royale-ladder",
    name: "CLASH ROYALE LADDER",
    gameLabel: "CLASH ROYALE",
    formatLabel: "LADDER SPRINT",
    teamSizeLabel: "1V1",
    capacityLabel: "96 / 128 PLAYERS",
    entryFeeLabel: "500 VS CREDITS",
    prizePoolLabel: "$3,500",
    artKey: "clash-royale",
  },
  {
    id: "league-of-legends-ranked-open",
    name: "LEAGUE OF LEGENDS RANKED OPEN",
    gameLabel: "LEAGUE OF LEGENDS",
    formatLabel: "ROUND ROBIN",
    teamSizeLabel: "5V5",
    capacityLabel: "16 / 32 TEAMS",
    entryFeeLabel: "1,000 VS CREDITS",
    prizePoolLabel: "$10,000",
    artKey: "league-of-legends",
  },
];

function createDetail(identity: CompetitionIdentity): CompetitionDetailMock {
  return {
    summary: {
      id: identity.id,
      eyebrow: "COMPETITION INTEL",
      name: identity.name,
      description:
        "A verified VERZUS competition built for structured entry, clear match operations and auditable championship progression.",
      statusLabel: "REGISTRATION OPEN",
      seasonLabel: "SEASON 1",
      weekLabel: "WEEK 4",
      gameLabel: identity.gameLabel,
      formatLabel: identity.formatLabel,
      regionLabel: "LAGOS",
      teamSizeLabel: identity.teamSizeLabel,
      capacityLabel: identity.capacityLabel,
      entryFeeLabel: identity.entryFeeLabel,
      prizePoolLabel: identity.prizePoolLabel,
      rewardNote: "+ EXCLUSIVE VERZUS REWARDS",
      countdownLabel: "02D : 14H : 36M",
      artKey: identity.artKey,
      tags: ["VERIFIED", "SERVER-TIMED", "AUDITED"],
    },
    eligibility: {
      state: "eligible",
      label: "ELIGIBLE",
      summary:
        "Your player identity and current competitive status satisfy the entry requirements.",
      checks: [
        { id: "profile", label: "PLAYER IDENTITY", detail: "Verified profile", met: true },
        { id: "trust", label: "VS TRUST", detail: "98 / 80 required", met: true },
        { id: "lane", label: "GAME LANE", detail: identity.gameLabel, met: true },
        { id: "availability", label: "AVAILABILITY", detail: "War window confirmed", met: true },
      ],
    },
    schedule: {
      timezoneLabel: "ALL TIMES WAT",
      stages: [
        {
          id: "registration",
          label: "REGISTRATION",
          dateLabel: "JUL 16",
          timeLabel: "OPEN",
          status: "current",
        },
        {
          id: "check-in",
          label: "CHECK-IN",
          dateLabel: "JUL 19",
          timeLabel: "17:30",
          status: "upcoming",
        },
        {
          id: "round-one",
          label: "ROUND ONE",
          dateLabel: "JUL 19",
          timeLabel: "18:30",
          status: "upcoming",
        },
        {
          id: "finals",
          label: "FINALS",
          dateLabel: "JUL 20",
          timeLabel: "20:00",
          status: "upcoming",
        },
      ],
    },
    rewards: {
      prizePoolLabel: identity.prizePoolLabel,
      rewardNote: "Funded pool. Rewards settle only after verified results.",
      breakdown: [
        { id: "champion", label: "CHAMPION", valueLabel: "55%" },
        { id: "runner-up", label: "RUNNER-UP", valueLabel: "25%" },
        { id: "semi-finalists", label: "SEMI-FINALISTS", valueLabel: "15%" },
        { id: "mvp", label: "MVP BONUS", valueLabel: "5%" },
      ],
    },
    rules: {
      updatedLabel: "UPDATED JUL 15, 2026",
      sections: [
        {
          id: "entry",
          title: "ENTRY AND ROSTER",
          items: [
            "Players must use their verified VERZUS identity.",
            "Roster changes lock when competition check-in opens.",
            "One active entry is permitted per eligible player or Crew.",
          ],
        },
        {
          id: "operations",
          title: "MATCH OPERATIONS",
          items: [
            "Server time controls every deadline and check-in window.",
            "Results require both participant confirmation or moderator review.",
            "Evidence uploads remain independent from result submission.",
          ],
        },
      ],
    },
    participants: {
      totalLabel: identity.capacityLabel,
      confirmedLabel: "VERIFIED ENTRANTS",
      participants: [
        {
          id: "night-hawks",
          seed: 1,
          name: "NIGHTHAWKS",
          tag: "NH",
          statusLabel: "CONFIRMED",
          avatarInitials: "NH",
        },
        {
          id: "iron-sentinels",
          seed: 2,
          name: "IRON SENTINELS",
          tag: "IS",
          statusLabel: "CONFIRMED",
          avatarInitials: "IS",
        },
        {
          id: "neon-phoenix",
          seed: 3,
          name: "NEON PHOENIX",
          tag: "NP",
          statusLabel: "CONFIRMED",
          avatarInitials: "NP",
        },
        {
          id: "shadow-strike",
          seed: 4,
          name: "SHADOW STRIKE",
          tag: "SS",
          statusLabel: "CHECKING IN",
          avatarInitials: "SS",
        },
        {
          id: "voltage-crew",
          seed: 5,
          name: "VOLTAGE CREW",
          tag: "VC",
          statusLabel: "CONFIRMED",
          avatarInitials: "VC",
        },
        {
          id: "glitch-rebels",
          seed: 6,
          name: "GLITCH REBELS",
          tag: "GR",
          statusLabel: "PENDING",
          avatarInitials: "GR",
        },
      ],
    },
    bracket: {
      statusLabel: "PREVIEW BRACKET",
      rounds: [
        {
          id: "quarter-finals",
          label: "QUARTER FINALS",
          matches: [
            {
              id: "qf-1",
              leftLabel: "NIGHTHAWKS",
              rightLabel: "GLITCH REBELS",
              scoreLabel: "SAT 18:30",
              state: "scheduled",
            },
            {
              id: "qf-2",
              leftLabel: "IRON SENTINELS",
              rightLabel: "VOLTAGE CREW",
              scoreLabel: "SAT 19:00",
              state: "scheduled",
            },
          ],
        },
        {
          id: "semi-finals",
          label: "SEMI FINALS",
          matches: [
            {
              id: "sf-1",
              leftLabel: "QF1 WINNER",
              rightLabel: "QF2 WINNER",
              scoreLabel: "SUN 18:30",
              state: "scheduled",
            },
          ],
        },
        {
          id: "final",
          label: "FINAL",
          matches: [
            {
              id: "final-1",
              leftLabel: "SF1 WINNER",
              rightLabel: "SF2 WINNER",
              scoreLabel: "SUN 20:00",
              state: "scheduled",
            },
          ],
        },
      ],
    },
  };
}

export const competitionDetailMockById = Object.fromEntries(
  identities.map((identity) => [identity.id, createDetail(identity)]),
) as Record<string, CompetitionDetailMock>;
