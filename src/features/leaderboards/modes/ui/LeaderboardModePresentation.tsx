// VERZUS M8.4 MODE-SPECIFIC DESKTOP AND MOBILE PRESENTATIONS
// VERZUS M8.5 LIVE-CHANGED ROW MARKERS
// VERZUS M8.6 OPTIONAL PINNED POSITION
// VERZUS M8.7 TABLE SORT SEMANTICS AND RENDER METADATA
// VERZUS M8.8 COLOR BANDS AND ENTITY INTEL TRIGGERS
// VERZUS M8.10.2 WIDTH-BALANCED DESKTOP TABLE

import {
  leaderboardGameLabels,
  type LeaderboardFoundationRow,
  type LeaderboardSortKey,
} from "../../foundation/model/leaderboard-foundation.types";
import styles from "../../foundation/ui/LeaderboardFoundationScreen.module.css";
import type { LeaderboardSortDirection } from "../../explorer/model/leaderboard-query-state";
import {
  getLeaderboardRowVisualState,
  LeaderboardAffiliationLink,
  LeaderboardInteractiveIdentity,
  LeaderboardRecentMatchLink,
} from "../../interactions";
import type {
  LeaderboardModeColumnKey,
  LeaderboardModeComposition,
  LeaderboardModeMetricKey,
} from "../model/leaderboard-mode.types";

function movementLabel(row: LeaderboardFoundationRow): string {
  if (row.movement === "new") return "NEW";
  if (row.movement === "same") return "—";
  return `${row.movement === "up" ? "▲" : "▼"} ${row.movementDelta ?? 0}`;
}

function RankCell({ row }: { row: LeaderboardFoundationRow }) {
  const visual = getLeaderboardRowVisualState(row);
  return (
    <div
      aria-label={visual.rankZoneLabel}
      className={styles.rankCell}
      data-podium={row.rank <= 3 ? String(row.rank) : undefined}
    >
      <strong>{row.rank}</strong>
      <span className={styles.movement} data-direction={row.movement}>
        {movementLabel(row)}
      </span>
    </div>
  );
}

function metricValue(
  metric: LeaderboardModeMetricKey | LeaderboardModeColumnKey,
  row: LeaderboardFoundationRow,
  composition: LeaderboardModeComposition,
): string {
  switch (metric) {
    case "affiliation":
      return row.crewName ?? row.handle;
    case "members":
      return row.memberCount ? row.memberCount.toLocaleString() : "—";
    case "game":
      return composition.mode === "combine" ? "4 game lanes" : leaderboardGameLabels[row.game];
    case "record":
      return `${row.wins}-${row.losses}`;
    case "win-rate":
      return `${row.winRate}%`;
    case "streak":
      return row.streak > 0 ? `${row.streak}W` : "—";
    case "trust":
      return `${row.trust}`;
    case "points":
      return row.points.toLocaleString();
    case "rank":
      return String(row.rank);
    case "identity":
      return row.name;
    case "recent-match":
      return "Recent match";
  }
}

function columnSortKey(columnKey: LeaderboardModeColumnKey): LeaderboardSortKey | null {
  switch (columnKey) {
    case "rank":
    case "points":
    case "win-rate":
      return columnKey;
    case "record":
      return "wins";
    default:
      return null;
  }
}

function columnAriaSort(
  columnKey: LeaderboardModeColumnKey,
  sortKey: LeaderboardSortKey,
  direction: LeaderboardSortDirection,
): "ascending" | "descending" | "none" | undefined {
  const mappedKey = columnSortKey(columnKey);
  if (!mappedKey) return undefined;
  if (mappedKey !== sortKey) return "none";
  return direction === "asc" ? "ascending" : "descending";
}

function DesktopModeRow({
  changed = false,
  composition,
  pinned = false,
  row,
}: {
  changed?: boolean;
  composition: LeaderboardModeComposition;
  pinned?: boolean;
  row: LeaderboardFoundationRow;
}) {
  const visual = getLeaderboardRowVisualState(row);
  return (
    <tr
      aria-label={visual.accessibleLabel}
      data-current={pinned ? "true" : undefined}
      data-entity-type={row.entityType}
      data-game={row.game}
      data-live-changed={changed ? "true" : undefined}
      data-rank-zone={visual.rankZone}
      data-tier={row.tier}
    >
      {composition.desktopColumns.map((column) => {
        if (column.key === "rank") {
          return (
            <td data-column={column.key} key={column.key}>
              <RankCell row={row} />
            </td>
          );
        }
        if (column.key === "identity") {
          return (
            <td data-column={column.key} key={column.key}>
              <LeaderboardInteractiveIdentity row={row} variant="table" />
            </td>
          );
        }
        if (column.key === "affiliation") {
          return (
            <td data-column={column.key} key={column.key}>
              <LeaderboardAffiliationLink row={row} />
            </td>
          );
        }
        if (column.key === "recent-match") {
          return (
            <td data-column={column.key} key={column.key}>
              <LeaderboardRecentMatchLink row={row} />
            </td>
          );
        }
        return (
          <td
            className={column.key === "points" ? styles.points : undefined}
            data-align={column.alignment}
            data-column={column.key}
            key={column.key}
          >
            {metricValue(column.key, row, composition)}
          </td>
        );
      })}
    </tr>
  );
}

function mobileMetricLabel(metric: LeaderboardModeMetricKey): string {
  switch (metric) {
    case "points":
      return "pts";
    case "record":
      return "record";
    case "win-rate":
      return "win rate";
    case "members":
      return "members";
    case "game":
      return "lane";
    case "streak":
      return "streak";
    case "trust":
      return "trust";
  }
}

function MobileModeRow({
  changed = false,
  composition,
  pinned = false,
  row,
}: {
  changed?: boolean;
  composition: LeaderboardModeComposition;
  pinned?: boolean;
  row: LeaderboardFoundationRow;
}) {
  const visual = getLeaderboardRowVisualState(row);
  const secondary = composition.mobileSecondaryMetrics
    .map((metric) => `${metricValue(metric, row, composition)} ${mobileMetricLabel(metric)}`)
    .join(" · ");

  return (
    <li
      aria-current={pinned ? "true" : undefined}
      aria-label={visual.accessibleLabel}
      className={styles.mobileRow}
      data-current={pinned ? "true" : undefined}
      data-entity-type={row.entityType}
      data-game={row.game}
      data-live-changed={changed ? "true" : undefined}
      data-rank-zone={visual.rankZone}
      data-tier={row.tier}
    >
      <RankCell row={row} />
      <LeaderboardInteractiveIdentity row={row} />
      <div className={styles.mobilePoints}>
        <strong>{metricValue(composition.mobilePrimaryMetric, row, composition)}</strong>
        <span>{secondary}</span>
        <LeaderboardRecentMatchLink row={row} />
      </div>
    </li>
  );
}

export function LeaderboardModeDesktopTable({
  boardTitle,
  changedEntryIds = [],
  composition,
  currentEntry,
  rows,
  sortDirection = "asc",
  sortKey = "rank",
}: {
  boardTitle: string;
  changedEntryIds?: readonly string[];
  composition: LeaderboardModeComposition;
  currentEntry?: LeaderboardFoundationRow | undefined;
  rows: readonly LeaderboardFoundationRow[];
  sortDirection?: LeaderboardSortDirection;
  sortKey?: LeaderboardSortKey;
}) {
  return (
    <div
      className={styles.desktopPresentation}
      data-rendered-row-count={rows.length}
      data-leaderboard-mode={composition.mode}
      data-leaderboard-presentation="table"
    >
      <table>
        <caption>
          {boardTitle} — {composition.rankingBasis}
        </caption>
        <thead>
          <tr>
            {composition.desktopColumns.map((column) => (
              <th
                aria-sort={columnAriaSort(column.key, sortKey, sortDirection)}
                data-align={column.alignment}
                data-column={column.key}
                key={column.key}
                scope="col"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <DesktopModeRow
              changed={changedEntryIds.includes(row.id)}
              composition={composition}
              key={row.id}
              row={row}
            />
          ))}
        </tbody>
        {currentEntry ? (
          <tbody
            className={styles.pinnedBody}
            aria-label={composition.currentPositionLabel}
            data-desktop-pinned="true"
          >
            <DesktopModeRow
              changed={changedEntryIds.includes(currentEntry.id)}
              composition={composition}
              pinned
              row={currentEntry}
            />
          </tbody>
        ) : null}
      </table>
    </div>
  );
}

export function LeaderboardModeMobileList({
  changedEntryIds = [],
  composition,
  currentEntry,
  rows,
  startIndex,
}: {
  changedEntryIds?: readonly string[];
  composition: LeaderboardModeComposition;
  currentEntry?: LeaderboardFoundationRow | undefined;
  rows: readonly LeaderboardFoundationRow[];
  startIndex: number;
}) {
  return (
    <div
      className={styles.mobilePresentation}
      data-rendered-row-count={rows.length}
      data-leaderboard-mode={composition.mode}
      data-leaderboard-presentation="mobile-list"
    >
      <ol
        aria-label={`${composition.identityLabel} rankings`}
        className={styles.mobileList}
        start={startIndex}
      >
        {rows.map((row) => (
          <MobileModeRow
            changed={changedEntryIds.includes(row.id)}
            composition={composition}
            key={row.id}
            row={row}
          />
        ))}
      </ol>
      {currentEntry ? (
        <section className={styles.mobilePinned} aria-label={composition.currentPositionLabel}>
          <p>{composition.currentPositionLabel}</p>
          <MobileModeRow
            changed={changedEntryIds.includes(currentEntry.id)}
            composition={composition}
            pinned
            row={currentEntry}
          />
        </section>
      ) : null}
    </div>
  );
}
