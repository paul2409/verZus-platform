// VERZUS M9.2 CREW DISCOVERY QUERY POLICY

import {
  crewDiscoveryGames,
  crewDiscoveryRecruiting,
  crewDiscoveryRegions,
  crewDiscoverySorts,
  crewDiscoveryVisibility,
  defaultCrewDiscoveryQuery,
  type CrewDiscoveryQuery,
  type CrewDiscoveryRecord,
  type CrewDiscoveryResult,
} from "./crew-discovery.types";

type QueryInput = URLSearchParams | Record<string, string | string[] | undefined>;

function readValue(input: QueryInput, key: string): string | undefined {
  if (input instanceof URLSearchParams) return input.get(key) ?? undefined;
  const value = input[key];
  return Array.isArray(value) ? value[0] : value;
}

function isAllowed<T extends readonly string[]>(
  values: T,
  value: string | undefined,
): value is T[number] {
  return Boolean(value && values.includes(value as T[number]));
}

function normalizePage(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function parseCrewDiscoveryQuery(input: QueryInput): CrewDiscoveryQuery {
  const game = readValue(input, "game");
  const region = readValue(input, "region");
  const visibility = readValue(input, "visibility");
  const recruiting = readValue(input, "recruiting");
  const sort = readValue(input, "sort");

  return {
    q: (readValue(input, "q") ?? "").trim().slice(0, 80),
    game: isAllowed(crewDiscoveryGames, game) ? game : defaultCrewDiscoveryQuery.game,
    region: isAllowed(crewDiscoveryRegions, region) ? region : defaultCrewDiscoveryQuery.region,
    visibility: isAllowed(crewDiscoveryVisibility, visibility)
      ? visibility
      : defaultCrewDiscoveryQuery.visibility,
    recruiting: isAllowed(crewDiscoveryRecruiting, recruiting)
      ? recruiting
      : defaultCrewDiscoveryQuery.recruiting,
    sort: isAllowed(crewDiscoverySorts, sort) ? sort : defaultCrewDiscoveryQuery.sort,
    page: normalizePage(readValue(input, "page")),
    size: 6,
    joinCrewId: (readValue(input, "join") ?? "").trim() || null,
  };
}

export function buildCrewDiscoverySearchParams(
  query: CrewDiscoveryQuery,
  extras: Record<string, string | null> = {},
): URLSearchParams {
  const params = new URLSearchParams();
  params.set("view", "discover");

  if (query.q) params.set("q", query.q);
  if (query.game !== defaultCrewDiscoveryQuery.game) params.set("game", query.game);
  if (query.region !== defaultCrewDiscoveryQuery.region) params.set("region", query.region);
  if (query.visibility !== defaultCrewDiscoveryQuery.visibility) {
    params.set("visibility", query.visibility);
  }
  if (query.recruiting !== defaultCrewDiscoveryQuery.recruiting) {
    params.set("recruiting", query.recruiting);
  }
  if (query.sort !== defaultCrewDiscoveryQuery.sort) params.set("sort", query.sort);
  if (query.page > 1) params.set("page", String(query.page));
  if (query.joinCrewId) params.set("join", query.joinCrewId);

  for (const [key, value] of Object.entries(extras)) {
    if (value) params.set(key, value);
  }

  return params;
}

function compareNumberDescending(left: number, right: number): number {
  return right - left;
}

function openSlots(crew: CrewDiscoveryRecord): number {
  return Math.max(0, crew.capacity - crew.memberCount);
}

function compareCrews(
  left: CrewDiscoveryRecord,
  right: CrewDiscoveryRecord,
  sort: CrewDiscoveryQuery["sort"],
): number {
  let comparison = 0;

  switch (sort) {
    case "rank":
      comparison = left.rank - right.rank;
      break;
    case "points":
      comparison = compareNumberDescending(left.points, right.points);
      break;
    case "win-rate":
      comparison = compareNumberDescending(left.winRate, right.winRate);
      break;
    case "open-slots":
      comparison = compareNumberDescending(openSlots(left), openSlots(right));
      break;
    case "trust":
      comparison = compareNumberDescending(left.trust, right.trust);
      break;
    case "recommended":
      comparison = compareNumberDescending(left.recommendationScore, right.recommendationScore);
      break;
  }

  return comparison || left.rank - right.rank || left.id.localeCompare(right.id);
}

export function applyCrewDiscoveryQuery(
  records: readonly CrewDiscoveryRecord[],
  query: CrewDiscoveryQuery,
): CrewDiscoveryResult {
  const search = query.q.toLocaleLowerCase();
  const filtered = records
    .filter((crew) => {
      const searchable = [
        crew.name,
        crew.tag,
        crew.description,
        crew.region,
        crew.minimumRank,
        ...crew.games,
      ]
        .join(" ")
        .toLocaleLowerCase();

      return (
        (!search || searchable.includes(search)) &&
        (query.game === "all" || crew.games.includes(query.game)) &&
        (query.region === "all" || crew.region === query.region) &&
        (query.visibility === "all" || crew.visibility === query.visibility) &&
        (query.recruiting === "all" || crew.recruiting === query.recruiting)
      );
    })
    .sort((left, right) => compareCrews(left, right, query.sort));

  const pageCount = Math.max(1, Math.ceil(filtered.length / query.size));
  const page = Math.min(query.page, pageCount);
  const start = (page - 1) * query.size;

  return {
    items: filtered.slice(start, start + query.size),
    total: filtered.length,
    page,
    pageCount,
    hasPreviousPage: page > 1,
    hasNextPage: page < pageCount,
  };
}

export function hasActiveCrewDiscoveryFilters(query: CrewDiscoveryQuery): boolean {
  return Boolean(
    query.q ||
    query.game !== "all" ||
    query.region !== "all" ||
    query.visibility !== "all" ||
    query.recruiting !== "open" ||
    query.sort !== "recommended",
  );
}
