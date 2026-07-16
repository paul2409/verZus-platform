import type { CompetitionDiscoveryFilterOptions } from "./competition-discovery.types";

export const competitionDiscoveryFilterOptionsFallback = {
  tabs: [
    { value: "all", label: "ALL" },
    { value: "live", label: "LIVE" },
    { value: "upcoming", label: "UPCOMING" },
    { value: "entered", label: "ENTERED" },
    { value: "popular", label: "POPULAR" },
  ],
  games: [
    { value: "all", label: "ALL GAMES" },
    { value: "ea-fc", label: "EA FC" },
    { value: "cod-mobile", label: "COD MOBILE" },
    { value: "clash-royale", label: "CLASH ROYALE" },
    { value: "league-of-legends", label: "LEAGUE OF LEGENDS" },
  ],
  teamSizes: [
    { value: "all", label: "ALL SIZES" },
    { value: "1V1", label: "1V1" },
    { value: "4V4", label: "4V4" },
    { value: "5V5", label: "5V5" },
  ],
  entryFees: [
    { value: "all", label: "ALL" },
    { value: "free", label: "FREE ENTRY" },
    { value: "paid", label: "VS CREDITS" },
  ],
  sorts: [
    { value: "starts-soon", label: "STARTS SOON" },
    { value: "popular", label: "POPULAR" },
    { value: "prize-high", label: "PRIZE HIGH" },
    { value: "availability", label: "AVAILABILITY" },
  ],
} satisfies CompetitionDiscoveryFilterOptions;
