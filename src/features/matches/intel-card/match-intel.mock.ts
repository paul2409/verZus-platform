import type { MatchIntelViewModel, WarMatchIntelViewModel } from "./match-intel.types";

const mainlandTitans = {
  name: "MAINLAND TITANS",
  tag: "MT",
  sideLabel: "Home",
  emblemSrc: "/intel-cards/mainland-titans.svg",
} as const;

const lagosLynx = {
  name: "LAGOS LYNX",
  tag: "LLX",
  sideLabel: "Away",
  emblemSrc: "/intel-cards/lagos-lynx.svg",
} as const;

export const matchIntelMock: MatchIntelViewModel = {
  id: "match-m-1487",
  weekLabel: "Week 14",
  statusLabel: "Check-in open",
  countdownLabel: "18:30",
  startsAtLabel: "Starts in",
  gameLabel: "EA FC",
  formatLabel: "BO3 - War Day - Ranked 1v1 - 4 lanes",
  home: mainlandTitans,
  away: lagosLynx,
  prizePoolLabel: "520",
  stakesLabel: "60",
  checkInClosesLabel: "17:50",
  matchHref: "/matches/match-m-1487",
  checkInHref: "/matches/match-m-1487/check-in",
};

export const warMatchIntelMock: WarMatchIntelViewModel = {
  id: "war-w-125",
  statusLabel: "War match",
  live: true,
  scoreLabel: "2 - 1",
  formatLabel: "BO5 - 4 lanes",
  home: mainlandTitans,
  away: lagosLynx,
  lanes: [
    { laneLabel: "Lane 1", result: "W" },
    { laneLabel: "Lane 2", result: "W" },
    { laneLabel: "Lane 3", result: "L" },
    { laneLabel: "Lane 4", result: "P" },
  ],
  roundLabel: "4 / 5",
  mapLabel: "N/A",
  startedAtLabel: "19:40",
  warHref: "/matches/war-w-125",
  followHref: "/matches/war-w-125/live",
};
