import type {
  CompetitionDiscoveryEntryFee,
  CompetitionDiscoveryFilters,
  CompetitionDiscoveryGame,
  CompetitionDiscoveryItem,
  CompetitionDiscoveryResult,
  CompetitionDiscoverySort,
  CompetitionDiscoveryTab,
  CompetitionDiscoveryTeamSize,
} from "./competition-discovery.types";

export const COMPETITION_DISCOVERY_PAGE_SIZE = 4;

export const defaultCompetitionDiscoveryFilters: CompetitionDiscoveryFilters = {
  search: "",
  tab: "all",
  game: "all",
  teamSize: "all",
  entryFee: "all",
  sort: "starts-soon",
  page: 1,
};

const tabs = new Set<CompetitionDiscoveryTab>(["all", "live", "upcoming", "entered", "popular"]);
const games = new Set<CompetitionDiscoveryGame>([
  "all",
  "ea-fc",
  "cod-mobile",
  "clash-royale",
  "league-of-legends",
]);
const teamSizes = new Set<CompetitionDiscoveryTeamSize>(["all", "1V1", "4V4", "5V5"]);
const entryFees = new Set<CompetitionDiscoveryEntryFee>(["all", "free", "paid"]);
const sorts = new Set<CompetitionDiscoverySort>([
  "starts-soon",
  "popular",
  "prize-high",
  "availability",
]);

function readEnum<T extends string>(value: string | null, values: Set<T>, fallback: T): T {
  return value && values.has(value as T) ? (value as T) : fallback;
}

function readPage(value: string | null): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function parseCompetitionDiscoverySearchParams(
  params: URLSearchParams,
): CompetitionDiscoveryFilters {
  return {
    search: (params.get("q") ?? "").trim().slice(0, 80),
    tab: readEnum(params.get("tab"), tabs, "all"),
    game: readEnum(params.get("game"), games, "all"),
    teamSize: readEnum(params.get("team"), teamSizes, "all"),
    entryFee: readEnum(params.get("fee"), entryFees, "all"),
    sort: readEnum(params.get("sort"), sorts, "starts-soon"),
    page: readPage(params.get("page")),
  };
}

export function serializeCompetitionDiscoverySearchParams(
  filters: CompetitionDiscoveryFilters,
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search.trim()) params.set("q", filters.search.trim());
  if (filters.tab !== "all") params.set("tab", filters.tab);
  if (filters.game !== "all") params.set("game", filters.game);
  if (filters.teamSize !== "all") params.set("team", filters.teamSize);
  if (filters.entryFee !== "all") params.set("fee", filters.entryFee);
  if (filters.sort !== "starts-soon") params.set("sort", filters.sort);
  if (filters.page > 1) params.set("page", String(filters.page));

  return params;
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase("en");
}

function compareText(left: string, right: string): number {
  return left.localeCompare(right, "en", { sensitivity: "base" });
}

function compareCompetitions(
  left: CompetitionDiscoveryItem,
  right: CompetitionDiscoveryItem,
  sort: CompetitionDiscoverySort,
): number {
  if (sort === "popular") {
    return (
      right.popularity - left.popularity ||
      left.startsAtOrder - right.startsAtOrder ||
      compareText(left.id, right.id)
    );
  }

  if (sort === "prize-high") {
    return (
      right.prizeValue - left.prizeValue ||
      left.startsAtOrder - right.startsAtOrder ||
      compareText(left.id, right.id)
    );
  }

  if (sort === "availability") {
    return (
      right.remainingCapacity - left.remainingCapacity ||
      left.startsAtOrder - right.startsAtOrder ||
      compareText(left.id, right.id)
    );
  }

  return left.startsAtOrder - right.startsAtOrder || compareText(left.id, right.id);
}

export function filterCompetitionDiscoveryItems(
  competitions: CompetitionDiscoveryItem[],
  filters: CompetitionDiscoveryFilters,
): CompetitionDiscoveryItem[] {
  const search = normalize(filters.search);
  const effectiveSort = filters.tab === "popular" ? "popular" : filters.sort;

  return competitions
    .filter((competition) => {
      const tabMatch =
        filters.tab === "all" || filters.tab === "popular" || competition.state === filters.tab;
      const gameMatch = filters.game === "all" || competition.gameFilterValue === filters.game;
      const teamMatch = filters.teamSize === "all" || competition.teamSize === filters.teamSize;
      const feeMatch = filters.entryFee === "all" || competition.entryFeeType === filters.entryFee;
      const searchMatch =
        !search ||
        normalize(
          [
            competition.name,
            competition.game,
            competition.format,
            competition.statusLabel,
            ...competition.searchTerms,
          ].join(" "),
        ).includes(search);

      return tabMatch && gameMatch && teamMatch && feeMatch && searchMatch;
    })
    .sort((left, right) => compareCompetitions(left, right, effectiveSort));
}

export function paginateCompetitionDiscoveryItems(
  competitions: CompetitionDiscoveryItem[],
  filters: CompetitionDiscoveryFilters,
  pageSize = COMPETITION_DISCOVERY_PAGE_SIZE,
): CompetitionDiscoveryResult {
  const filtered = filterCompetitionDiscoveryItems(competitions, filters);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(Math.max(filters.page, 1), pageCount);
  const start = (page - 1) * pageSize;

  return {
    items: filtered.slice(start, start + pageSize),
    page,
    pageCount,
    total: filtered.length,
    hasPreviousPage: page > 1,
    hasNextPage: page < pageCount,
  };
}

export function hasActiveCompetitionDiscoveryFilters(
  filters: CompetitionDiscoveryFilters,
): boolean {
  return (
    Boolean(filters.search.trim()) ||
    filters.tab !== "all" ||
    filters.game !== "all" ||
    filters.teamSize !== "all" ||
    filters.entryFee !== "all" ||
    filters.sort !== "starts-soon"
  );
}
