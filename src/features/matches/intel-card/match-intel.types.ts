export type MatchSideViewModel = {
  name: string;
  tag: string;
  sideLabel: string;
  emblemSrc: string;
};

export type MatchIntelViewModel = {
  id: string;
  weekLabel: string;
  statusLabel: string;
  countdownLabel: string;
  startsAtLabel: string;
  gameLabel: string;
  formatLabel: string;
  home: MatchSideViewModel;
  away: MatchSideViewModel;
  prizePoolLabel: string;
  stakesLabel: string;
  checkInClosesLabel: string;
  matchHref: string;
  checkInHref: string | null;
};

export type WarLaneResult = {
  laneLabel: string;
  result: "W" | "L" | "P";
};

export type WarMatchIntelViewModel = {
  id: string;
  statusLabel: string;
  live: boolean;
  scoreLabel: string;
  formatLabel: string;
  home: MatchSideViewModel;
  away: MatchSideViewModel;
  lanes: readonly WarLaneResult[];
  roundLabel: string;
  mapLabel: string;
  startedAtLabel: string;
  warHref: string;
  followHref: string | null;
};
