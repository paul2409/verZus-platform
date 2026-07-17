// VERZUS M8.8 INTERACTIVE LEADERBOARD IDENTITY
// VERZUS M8.10.1 COMPACT TWO-LINE IDENTITY
// VERZUS M8.10.2 TABLE IDENTITY AND AFFILIATION LINKS

import { leaderboardGameLabels, type LeaderboardFoundationRow } from "../../foundation";
import foundationStyles from "../../foundation/ui/LeaderboardFoundationScreen.module.css";
import { getLeaderboardRowInteractions } from "../model/leaderboard-interaction.types";
import { LeaderboardEntityLink } from "./LeaderboardEntityLink";
import styles from "./LeaderboardInteractions.module.css";

function titleCase(value: string): string {
  return value.replace(
    /(^|-)([a-z])/g,
    (_, separator: string, letter: string) =>
      `${separator === "-" ? " " : ""}${letter.toUpperCase()}`,
  );
}

export function LeaderboardInteractiveIdentity({
  row,
  variant = "default",
}: {
  row: LeaderboardFoundationRow;
  variant?: "default" | "table";
}) {
  const interactions = getLeaderboardRowInteractions(row);
  const secondary =
    variant === "table"
      ? row.entityType === "crew" && row.memberCount
        ? `${row.memberCount} members · ${row.handle}`
        : row.entityType === "pool" && row.memberCount
          ? `${row.memberCount} players · ${row.handle}`
          : `${row.handle} · ${row.countryCode}`
      : row.entityType === "crew" && row.memberCount
        ? `${row.memberCount} members`
        : (row.crewName ?? row.handle);

  return (
    <div className={foundationStyles.identity}>
      <span aria-hidden="true" className={foundationStyles.avatar} data-tier={row.tier}>
        {row.initials}
      </span>
      <div className={foundationStyles.identityCopy}>
        {interactions.identity ? (
          <LeaderboardEntityLink descriptor={interactions.identity}>
            {row.name}
          </LeaderboardEntityLink>
        ) : (
          <strong>{row.name}</strong>
        )}
        <span className={styles.compactMeta}>
          <small>
            {variant === "table" ? (
              secondary
            ) : interactions.affiliation ? (
              <>
                Crew:{" "}
                <LeaderboardEntityLink descriptor={interactions.affiliation} variant="affiliation">
                  {interactions.affiliation.label}
                </LeaderboardEntityLink>
              </>
            ) : (
              secondary
            )}
          </small>
          <span aria-hidden="true" className={styles.metaDot}>
            •
          </span>
          <span
            aria-label={`${titleCase(row.tier)} tier, ${leaderboardGameLabels[row.game]}`}
            className={styles.badges}
          >
            <span data-tier={row.tier}>{titleCase(row.tier)}</span>
            <span data-game={row.game}>{leaderboardGameLabels[row.game]}</span>
          </span>
        </span>
      </div>
    </div>
  );
}

export function LeaderboardRecentMatchLink({ row }: { row: LeaderboardFoundationRow }) {
  const descriptor = getLeaderboardRowInteractions(row).recentMatch;
  return (
    <LeaderboardEntityLink descriptor={descriptor} variant="match">
      Match {descriptor.label}
    </LeaderboardEntityLink>
  );
}

export function LeaderboardAffiliationLink({ row }: { row: LeaderboardFoundationRow }) {
  const descriptor = getLeaderboardRowInteractions(row).affiliation;

  if (descriptor) {
    return (
      <LeaderboardEntityLink descriptor={descriptor} variant="affiliation">
        {descriptor.label}
      </LeaderboardEntityLink>
    );
  }

  if (row.entityType === "crew" && row.memberCount) {
    return <span>{row.memberCount.toLocaleString()}</span>;
  }

  return <span>{row.crewName ?? "—"}</span>;
}
