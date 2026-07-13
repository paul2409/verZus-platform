"use client";

import type { AriaAttributes } from "react";

import { CrewIdentity, PlayerIdentity } from "@/components/primitives/avatar";
import { Badge, MovementBadge, RankBadge } from "@/components/primitives/badge";

import type {
  LeaderboardEntryViewModel,
  LeaderboardSort,
  LeaderboardSortKey,
} from "../model/leaderboard.types";
import styles from "./Leaderboard.module.css";
import { formatRecord, joinClassNames, nextSort } from "./utils";

export type LeaderboardTableProps = {
  entries: readonly LeaderboardEntryViewModel[];
  caption?: string;
  sort?: LeaderboardSort;
  onSortChange?: (sort: LeaderboardSort) => void;
  pinnedEntry?: LeaderboardEntryViewModel;
};

type SortableHeaderProps = {
  label: string;
  sortKey: LeaderboardSortKey;
  sort: LeaderboardSort | undefined;
  onSortChange: ((sort: LeaderboardSort) => void) | undefined;
  className: string | undefined;
};

function getAriaSort(
  sort: LeaderboardSort | undefined,
  key: LeaderboardSortKey,
): AriaAttributes["aria-sort"] {
  if (sort?.key !== key) {
    return "none";
  }

  return sort.direction;
}

function SortableHeader({ label, sortKey, sort, onSortChange, className }: SortableHeaderProps) {
  const ariaSort = getAriaSort(sort, sortKey);

  return (
    <th aria-sort={ariaSort} className={joinClassNames(styles.headerCell, className)} scope="col">
      {onSortChange ? (
        <button
          className={styles.sortButton ?? ""}
          onClick={() => onSortChange(nextSort(sort, sortKey))}
          type="button"
        >
          <span>{label}</span>
          <span aria-hidden="true" className={styles.sortGlyph ?? ""}>
            {ariaSort === "ascending" ? "↑" : ariaSort === "descending" ? "↓" : "↕"}
          </span>
        </button>
      ) : (
        label
      )}
    </th>
  );
}

function PlayerCell({ entry }: { entry: LeaderboardEntryViewModel }) {
  return (
    <div className={styles.identityCell ?? ""}>
      <PlayerIdentity
        avatarInitials={entry.player.initials}
        avatarTone={entry.player.tone}
        compact
        name={entry.player.name}
        presence={entry.player.presence}
        size="sm"
        verified={entry.player.verified}
        {...(entry.player.handle ? { handle: entry.player.handle } : {})}
        {...(entry.player.avatarSrc ? { avatarSrc: entry.player.avatarSrc } : {})}
      />

      {entry.isCurrentPlayer ? (
        <Badge size="sm" tone="positive" variant="outline">
          You
        </Badge>
      ) : null}
    </div>
  );
}

function CrewCell({ entry }: { entry: LeaderboardEntryViewModel }) {
  if (!entry.crew) {
    return <span className={styles.mutedValue ?? ""}>Independent</span>;
  }

  return (
    <CrewIdentity
      compact
      emblemInitials={entry.crew.initials}
      emblemTone={entry.crew.tone}
      name={entry.crew.name}
      size="sm"
      tag={entry.crew.tag}
      verified={entry.crew.verified}
      {...(entry.crew.emblemSrc ? { emblemSrc: entry.crew.emblemSrc } : {})}
    />
  );
}

function LeaderboardRow({
  entry,
  pinned = false,
}: {
  entry: LeaderboardEntryViewModel;
  pinned?: boolean;
}) {
  return (
    <tr
      className={joinClassNames(
        styles.row,
        entry.isCurrentPlayer && styles.currentRow,
        pinned && styles.pinnedRow,
      )}
      data-current-player={entry.isCurrentPlayer ? "true" : undefined}
      data-leaderboard-entry={entry.id}
      data-pinned-entry={pinned ? "true" : undefined}
    >
      <td className={joinClassNames(styles.cell, styles.rankCell)}>
        <RankBadge rank={entry.rank} size="sm" tier={entry.rankTier} />
      </td>

      <td className={joinClassNames(styles.cell, styles.playerCell)}>
        <PlayerCell entry={entry} />
      </td>

      <td className={joinClassNames(styles.cell, styles.crewCell)}>
        <CrewCell entry={entry} />
      </td>

      <td className={joinClassNames(styles.cell, styles.numericCell)}>{entry.played}</td>

      <td className={joinClassNames(styles.cell, styles.recordCell)}>
        <span className={styles.recordValue ?? ""}>{formatRecord(entry)}</span>
        <span className={styles.recordLabel ?? ""}>W-D-L</span>
      </td>

      <td className={joinClassNames(styles.cell, styles.pointsCell)}>
        {entry.points.toLocaleString()}
      </td>

      <td className={joinClassNames(styles.cell, styles.movementCell)}>
        <MovementBadge
          movement={entry.movement}
          size="sm"
          {...(entry.movementValue !== null ? { value: entry.movementValue } : {})}
        />
      </td>
    </tr>
  );
}

export function LeaderboardTable({
  entries,
  caption = "Leaderboard rankings",
  sort,
  onSortChange,
  pinnedEntry,
}: LeaderboardTableProps) {
  return (
    <div className={styles.tableViewport ?? ""} data-leaderboard-presentation="table">
      <table className={styles.table ?? ""}>
        <caption className={styles.srOnly ?? ""}>{caption}</caption>

        <thead className={styles.tableHead ?? ""}>
          <tr>
            <SortableHeader
              className={styles.rankCell}
              label="Rank"
              onSortChange={onSortChange}
              sort={sort}
              sortKey="rank"
            />
            <SortableHeader
              className={styles.playerCell}
              label="Player"
              onSortChange={onSortChange}
              sort={sort}
              sortKey="player"
            />
            <th className={joinClassNames(styles.headerCell, styles.crewCell)} scope="col">
              Crew
            </th>
            <SortableHeader
              className={styles.numericCell}
              label="Played"
              onSortChange={onSortChange}
              sort={sort}
              sortKey="played"
            />
            <SortableHeader
              className={styles.recordCell}
              label="Record"
              onSortChange={onSortChange}
              sort={sort}
              sortKey="wins"
            />
            <SortableHeader
              className={styles.pointsCell}
              label="Points"
              onSortChange={onSortChange}
              sort={sort}
              sortKey="points"
            />
            <th className={joinClassNames(styles.headerCell, styles.movementCell)} scope="col">
              Move
            </th>
          </tr>
        </thead>

        {pinnedEntry ? (
          <tbody className={styles.pinnedBody ?? ""} data-leaderboard-section="pinned">
            <LeaderboardRow entry={pinnedEntry} pinned />
          </tbody>
        ) : null}

        <tbody data-leaderboard-section="rankings">
          {entries.map((entry) => (
            <LeaderboardRow entry={entry} key={entry.id} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
