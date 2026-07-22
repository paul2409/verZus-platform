import type { SearchDomainDefinition } from "../model/search-foundation.types";

export const searchDomainDefinitions: readonly SearchDomainDefinition[] = [
  {
    id: "all",
    label: "All records",
    shortLabel: "All",
    description: "Search every production domain independently.",
  },
  {
    id: "players",
    label: "Players",
    shortLabel: "Players",
    description: "Public player identities and your own profile.",
  },
  {
    id: "crews",
    label: "Crews",
    shortLabel: "Crews",
    description: "Public active Crews and recruiting rosters.",
  },
  {
    id: "competitions",
    label: "Competitions",
    shortLabel: "Compete",
    description: "Published competition records and registration windows.",
  },
  {
    id: "matches",
    label: "Matches",
    shortLabel: "Matches",
    description: "Matches in which you are a participant.",
  },
];
