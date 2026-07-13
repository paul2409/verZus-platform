import type {
  LeaderboardEntryViewModel,
  LeaderboardSort,
  LeaderboardSortKey,
} from "../model/leaderboard.types";

export function joinClassNames(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

export function formatRecord(entry: LeaderboardEntryViewModel): string {
  return `${entry.wins}-${entry.draws}-${entry.losses}`;
}

export function nextSort(
  currentSort: LeaderboardSort | undefined,
  key: LeaderboardSortKey,
): LeaderboardSort {
  if (currentSort?.key === key) {
    return {
      key,
      direction: currentSort.direction === "ascending" ? "descending" : "ascending",
    };
  }

  return {
    key,
    direction: key === "player" ? "ascending" : "descending",
  };
}

export function sortEntries(
  entries: readonly LeaderboardEntryViewModel[],
  sort: LeaderboardSort,
): LeaderboardEntryViewModel[] {
  const direction = sort.direction === "ascending" ? 1 : -1;

  return [...entries].sort((left, right) => {
    let comparison = 0;

    if (sort.key === "player") {
      comparison = left.player.name.localeCompare(right.player.name);
    } else {
      comparison = left[sort.key] - right[sort.key];
    }

    if (comparison === 0) {
      comparison = left.rank - right.rank;
    }

    return comparison * direction;
  });
}
