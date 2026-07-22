import type { MatchViewModel } from "../model/match.types";

export const matchPreviewMock: MatchViewModel = {
  id: "match-weekly-open-r4-01",
  competitionName: "VERZUS Weekly Open",
  roundLabel: "Round 4",
  status: "check-in-open",
  timerLabel: "00:12:48",
  home: {
    id: "player-jayflex",
    name: "JAYFLEX",
    handle: "@jayflex",
    initials: "JF",
    avatarSrc: null,
    presence: "online",
    tone: "green",
    verified: true,
    score: null,
  },
  away: {
    id: "player-r3dstorm",
    name: "R3DSTORM",
    handle: "@r3dstorm",
    initials: "RS",
    avatarSrc: null,
    presence: "online",
    tone: "violet",
    verified: true,
    score: null,
  },
};
