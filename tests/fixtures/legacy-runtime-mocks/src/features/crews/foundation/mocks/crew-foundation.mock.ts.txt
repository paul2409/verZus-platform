// VERZUS M9.1 CREW FOUNDATION MOCK

import type { CrewFoundationViewModel } from "../model/crew-foundation.types";

export const xenonCrewFoundationMock: CrewFoundationViewModel = {
  identity: {
    id: "crew-xenon-esports",
    name: "Xenon Esports",
    tag: "XEN",
    tagline: "We do not just play. We compete.",
    description:
      "Xenon Esports is a competitive crew built on discipline, teamwork and consistent verified results across multiple game lanes.",
    crestSrc: "/crews/xenon-esports-crest.svg",
    bannerSrc: "/crews/xenon-esports-banner.svg",
    verified: true,
    tier: "Platinum",
    games: ["EA FC", "COD Mobile"],
    memberCount: 25,
    region: "Nigeria",
    visibility: "public",
    foundedAtLabel: "Nov 18, 2024",
    lifecycle: "active",
  },
  stats: {
    rank: 8,
    movement: 2,
    points: 42860,
    wins: 48,
    losses: 21,
    winRate: 69,
    streak: 7,
    trust: 97,
    activeMembers: 18,
  },
  members: [
    {
      id: "player-prismo",
      name: "Prismo",
      handle: "@prismo",
      initials: "PR",
      role: "owner",
      contribution: 2450,
      status: "online",
    },
    {
      id: "player-rivalking",
      name: "RivalKing",
      handle: "@rivalking",
      initials: "RK",
      role: "captain",
      contribution: 2120,
      status: "online",
    },
    {
      id: "player-ghosty",
      name: "Ghosty",
      handle: "@ghosty",
      initials: "GH",
      role: "manager",
      contribution: 1980,
      status: "away",
    },
    {
      id: "player-venom",
      name: "Venom",
      handle: "@venom",
      initials: "VN",
      role: "member",
      contribution: 1760,
      status: "offline",
    },
    {
      id: "player-kage",
      name: "Kage",
      handle: "@kage",
      initials: "KG",
      role: "trial",
      contribution: 1540,
      status: "online",
    },
  ],
  activity: [
    {
      id: "activity-1",
      title: "Beat Apex Knights",
      game: "EA FC",
      occurredAtLabel: "2 hours ago",
      scoreLabel: "3 - 1",
      tone: "win",
    },
    {
      id: "activity-2",
      title: "Beat Night Riders",
      game: "COD Mobile",
      occurredAtLabel: "1 day ago",
      scoreLabel: "5 - 2",
      tone: "win",
    },
    {
      id: "activity-3",
      title: "Lost to Prime Legion",
      game: "EA FC",
      occurredAtLabel: "2 days ago",
      scoreLabel: "1 - 2",
      tone: "loss",
    },
    {
      id: "activity-4",
      title: "Beat Shadow Unit",
      game: "COD Mobile",
      occurredAtLabel: "3 days ago",
      scoreLabel: "4 - 0",
      tone: "win",
    },
  ],
  requests: [
    {
      id: "request-1",
      playerName: "Nova",
      handle: "@nova",
      game: "EA FC",
      trust: 94,
      status: "pending",
    },
    {
      id: "request-2",
      playerName: "Razor",
      handle: "@razor",
      game: "COD Mobile",
      trust: 91,
      status: "reviewing",
    },
    {
      id: "request-3",
      playerName: "Luna",
      handle: "@luna",
      game: "EA FC",
      trust: 89,
      status: "pending",
    },
  ],
  achievements: [
    {
      id: "achievement-1",
      name: "Verified Crew",
      description: "Completed identity and trust verification.",
      unlocked: true,
    },
    {
      id: "achievement-2",
      name: "Seven-Win Run",
      description: "Won seven verified matches consecutively.",
      unlocked: true,
    },
    {
      id: "achievement-3",
      name: "Top Five Finish",
      description: "Finish a weekly Crew Championship in the top five.",
      unlocked: false,
    },
  ],
  settings: {
    recruiting: true,
    primaryGame: "EA FC",
    language: "English",
    minimumRank: "Diamond",
    communityLinkLabel: "discord.gg/xenon",
  },
};

export function getCrewFoundationMock(crewId: string): CrewFoundationViewModel {
  return {
    ...xenonCrewFoundationMock,
    identity: {
      ...xenonCrewFoundationMock.identity,
      id: crewId,
    },
  };
}
