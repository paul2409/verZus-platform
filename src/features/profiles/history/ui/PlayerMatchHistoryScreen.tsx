// VERZUS M11.5 COMPLETE MATCH HISTORY AND DETAILED STATISTICS

"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Badge } from "@/components/primitives/badge";

import { PlayerHistoryResourceError } from "../adapter/player-history.adapter";
import {
  playerDetailedStatisticsQueryOptions,
  playerMatchHistoryQueryOptions,
} from "../api/player-history.query";
import type {
  PlayerDetailedStatistics,
  PlayerHistoryGameFilter,
  PlayerHistoryResourceName,
  PlayerHistoryResultFilter,
  PlayerHistoryScenario,
  PlayerMatchHistoryEntry,
  PlayerStatisticsWindow,
} from "../model/player-history.types";
import styles from "./PlayerMatchHistoryScreen.module.css";

const gameFilters: PlayerHistoryGameFilter[] = ["all", "EA FC 26", "Call of Duty", "NBA 2K26"];
const resultFilters: PlayerHistoryResultFilter[] = ["all", "win", "loss", "draw"];
const windows: PlayerStatisticsWindow[] = ["season", "30d", "7d"];
const scenarios: PlayerHistoryScenario[] = [
  "normal",
  "stale",
  "empty",
  "error",
  "offline",
  "slow",
  "malformed",
  "unauthorized",
  "forbidden",
  "not-found",
  "maintenance",
];

function asGame(value: string | null): PlayerHistoryGameFilter {
  return gameFilters.includes(value as PlayerHistoryGameFilter)
    ? (value as PlayerHistoryGameFilter)
    : "all";
}

function asResult(value: string | null): PlayerHistoryResultFilter {
  return resultFilters.includes(value as PlayerHistoryResultFilter)
    ? (value as PlayerHistoryResultFilter)
    : "all";
}

function asWindow(value: string | null): PlayerStatisticsWindow {
  return windows.includes(value as PlayerStatisticsWindow)
    ? (value as PlayerStatisticsWindow)
    : "season";
}

function asScenario(value: string | null): PlayerHistoryScenario {
  return scenarios.includes(value as PlayerHistoryScenario)
    ? (value as PlayerHistoryScenario)
    : "normal";
}

function asPage(value: string | null): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function asTarget(value: string | null): PlayerHistoryResourceName | undefined {
  return value === "matches" || value === "statistics" ? value : undefined;
}

function resultLabel(result: PlayerMatchHistoryEntry["result"]): string {
  if (result === "win") return "Victory";
  if (result === "loss") return "Defeat";
  return "Draw";
}

function deltaLabel(value: number): string {
  if (value > 0) return `+${value}`;
  return String(value);
}

function QueryStateCard({
  title,
  error,
  isLoading,
  isFetching,
  hasData,
  onRetry,
}: {
  title: string;
  error: unknown;
  isLoading: boolean;
  isFetching: boolean;
  hasData: boolean;
  onRetry: () => void;
}) {
  if (isLoading && !hasData) {
    return (
      <section aria-live="polite" className={styles.stateCard} data-state="loading">
        <strong>Loading {title.toLowerCase()}</strong>
        <p>Confirmed profile data is being prepared.</p>
      </section>
    );
  }

  if (error && !hasData) {
    const resourceError =
      error instanceof PlayerHistoryResourceError
        ? error
        : new PlayerHistoryResourceError({
            code: "PLAYER_HISTORY_UNKNOWN_ERROR",
            message: `${title} could not be loaded.`,
            requestId: "profile-history-unknown",
            retryable: true,
          });

    return (
      <section aria-live="assertive" className={styles.stateCard} data-state="error">
        <strong>{resourceError.message}</strong>
        <p>Error ID: {resourceError.requestId}</p>
        {resourceError.retryable ? (
          <button type="button" onClick={onRetry}>
            Retry {title.toLowerCase()}
          </button>
        ) : null}
      </section>
    );
  }

  if (isFetching && hasData) {
    return (
      <p aria-live="polite" className={styles.refreshNote}>
        Refreshing {title.toLowerCase()} while confirmed data remains visible…
      </p>
    );
  }

  return null;
}

function StatisticsOverview({ statistics }: { statistics: PlayerDetailedStatistics }) {
  const metrics = [
    ["Matches", statistics.matches],
    ["Win rate", `${statistics.winRate}%`],
    ["Rating", statistics.rating.toLocaleString("en-US")],
    ["Rating change", deltaLabel(statistics.ratingDelta)],
    ["Current streak", statistics.currentStreak],
    ["Best streak", statistics.bestStreak],
    ["Verified", `${statistics.verifiedRate}%`],
    ["Avg. score", `${statistics.averagePointsFor}–${statistics.averagePointsAgainst}`],
  ] as const;

  return (
    <section aria-labelledby="detailed-stats-title" className={styles.panel}>
      <div className={styles.panelHeading}>
        <div>
          <p>Confirmed performance</p>
          <h2 id="detailed-stats-title">Detailed statistics</h2>
        </div>
        <div className={styles.headingBadges}>
          {statistics.freshness === "stale" ? (
            <Badge tone="warning" variant="soft">
              Stale
            </Badge>
          ) : null}
          <Badge tone="positive" variant="soft">
            {statistics.window === "season" ? "Season" : statistics.window}
          </Badge>
        </div>
      </div>

      <dl className={styles.metricGrid}>
        {metrics.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <div className={styles.formRow} aria-label="Recent form">
        <span>Recent form</span>
        <div>
          {statistics.form.length > 0 ? (
            statistics.form.map((result, index) => (
              <i data-result={result} key={`${result}-${index}`}>
                {result.slice(0, 1).toUpperCase()}
              </i>
            ))
          ) : (
            <small>No matches in this window.</small>
          )}
        </div>
      </div>

      <div className={styles.breakdownGrid}>
        {statistics.gameBreakdown.map((game) => (
          <article key={game.gameLabel}>
            <div>
              <strong>{game.gameLabel}</strong>
              <span>{game.matches} matches</span>
            </div>
            <b>{game.winRate}%</b>
            <p>
              {game.wins}W · {game.losses}L · {game.draws}D
            </p>
            <small>
              Rating {game.rating.toLocaleString("en-US")} · {deltaLabel(game.ratingDelta)}
            </small>
          </article>
        ))}
      </div>
    </section>
  );
}

function MobileMatchCard({ match }: { match: PlayerMatchHistoryEntry }) {
  return (
    <article className={styles.mobileMatchCard} data-result={match.result}>
      <div className={styles.matchCardTopline}>
        <Badge
          tone={
            match.result === "win" ? "positive" : match.result === "loss" ? "negative" : "warning"
          }
          variant="soft"
        >
          {resultLabel(match.result)}
        </Badge>
        <span>{match.playedAtLabel}</span>
      </div>
      <div className={styles.matchIdentity}>
        <div>
          <p>Opponent</p>
          <Link href={match.opponentHref}>{match.opponentLabel}</Link>
        </div>
        <strong>{match.scoreLabel}</strong>
      </div>
      <p className={styles.matchContext}>
        {match.gameLabel} · {match.competitionLabel}
      </p>
      <dl className={styles.matchMeta}>
        <div>
          <dt>Rank</dt>
          <dd data-positive={match.rankDelta >= 0}>{deltaLabel(match.rankDelta)}</dd>
        </div>
        <div>
          <dt>Trust</dt>
          <dd data-positive={match.trustDelta >= 0}>{deltaLabel(match.trustDelta)}</dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>{match.durationMinutes}m</dd>
        </div>
        <div>
          <dt>Evidence</dt>
          <dd>{match.verified ? "Verified" : "Pending"}</dd>
        </div>
      </dl>
      <Link className={styles.openMatchLink} href={match.matchHref}>
        Open match
      </Link>
    </article>
  );
}

function DesktopMatchTable({ matches }: { matches: readonly PlayerMatchHistoryEntry[] }) {
  return (
    <div className={styles.desktopTableWrap}>
      <table className={styles.desktopTable}>
        <caption className={styles.srOnly}>Complete player match history</caption>
        <thead>
          <tr>
            <th scope="col">Result</th>
            <th scope="col">Opponent</th>
            <th scope="col">Game</th>
            <th scope="col">Competition</th>
            <th scope="col">Score</th>
            <th scope="col">Rank</th>
            <th scope="col">Trust</th>
            <th scope="col">Played</th>
            <th scope="col">
              <span className={styles.srOnly}>Open</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match) => (
            <tr data-result={match.result} key={match.id}>
              <td>
                <span className={styles.tableResult} data-result={match.result}>
                  {resultLabel(match.result)}
                </span>
              </td>
              <td>
                <Link href={match.opponentHref}>{match.opponentLabel}</Link>
              </td>
              <td>{match.gameLabel}</td>
              <td>{match.competitionLabel}</td>
              <td className={styles.numeric}>{match.scoreLabel}</td>
              <td className={styles.numeric} data-positive={match.rankDelta >= 0}>
                {deltaLabel(match.rankDelta)}
              </td>
              <td className={styles.numeric} data-positive={match.trustDelta >= 0}>
                {deltaLabel(match.trustDelta)}
              </td>
              <td>{match.playedAtLabel}</td>
              <td>
                <Link className={styles.tableOpenLink} href={match.matchHref}>
                  Open
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PlayerMatchHistoryScreen() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const game = asGame(searchParams.get("game"));
  const result = asResult(searchParams.get("result"));
  const page = asPage(searchParams.get("page"));
  const statsGame = asGame(searchParams.get("statsGame"));
  const statsWindow = asWindow(searchParams.get("statsWindow"));
  const target = asTarget(searchParams.get("resource"));
  const scenario = asScenario(searchParams.get("scenario"));

  const matchesQuery = useQuery(
    playerMatchHistoryQueryOptions({
      game,
      result,
      page,
      scenario: target === "matches" ? scenario : "normal",
    }),
  );
  const statisticsQuery = useQuery(
    playerDetailedStatisticsQueryOptions({
      game: statsGame,
      window: statsWindow,
      scenario: target === "statistics" ? scenario : "normal",
    }),
  );

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "" || value === "all" || value === "season") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const matches = matchesQuery.data;
  const statistics = statisticsQuery.data;

  return (
    <main className={styles.page} data-m11-stage="11.5" data-profile-history="paginated">
      <header className={styles.pageHeader}>
        <div>
          <p>Season Zero · Own profile</p>
          <h1>Match history</h1>
          <span>Verified results, competitive form and game-by-game performance.</span>
        </div>
        <Link href="/profile">Back to profile</Link>
      </header>

      <section aria-label="Statistics filters" className={styles.filterBar}>
        <label>
          <span>Statistics game</span>
          <select
            value={statsGame}
            onChange={(event) => updateParams({ statsGame: event.target.value })}
          >
            {gameFilters.map((item) => (
              <option key={item} value={item}>
                {item === "all" ? "All games" : item}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Time window</span>
          <select
            value={statsWindow}
            onChange={(event) => updateParams({ statsWindow: event.target.value })}
          >
            <option value="season">Season</option>
            <option value="30d">Last 30 days</option>
            <option value="7d">Last 7 days</option>
          </select>
        </label>
      </section>

      <QueryStateCard
        error={statisticsQuery.error}
        hasData={Boolean(statistics)}
        isFetching={statisticsQuery.isFetching}
        isLoading={statisticsQuery.isLoading}
        onRetry={() => void statisticsQuery.refetch()}
        title="Statistics"
      />
      {statistics ? <StatisticsOverview statistics={statistics} /> : null}

      <section aria-labelledby="match-history-title" className={styles.panel}>
        <div className={styles.panelHeading}>
          <div>
            <p>Complete record</p>
            <h2 id="match-history-title">Matches</h2>
          </div>
          <div className={styles.headingBadges}>
            {matches?.freshness === "stale" ? (
              <Badge tone="warning" variant="soft">
                Stale
              </Badge>
            ) : null}
            <Badge tone="information" variant="outline">
              {matches?.totalItems ?? 0} results
            </Badge>
          </div>
        </div>

        <div className={styles.matchFilters}>
          <label>
            <span>Game</span>
            <select
              value={game}
              onChange={(event) => updateParams({ game: event.target.value, page: null })}
            >
              {gameFilters.map((item) => (
                <option key={item} value={item}>
                  {item === "all" ? "All games" : item}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Result</span>
            <select
              value={result}
              onChange={(event) => updateParams({ result: event.target.value, page: null })}
            >
              {resultFilters.map((item) => (
                <option key={item} value={item}>
                  {item === "all" ? "All results" : item[0]?.toUpperCase() + item.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => updateParams({ game: null, result: null, page: null })}
          >
            Reset filters
          </button>
        </div>

        <QueryStateCard
          error={matchesQuery.error}
          hasData={Boolean(matches)}
          isFetching={matchesQuery.isFetching}
          isLoading={matchesQuery.isLoading}
          onRetry={() => void matchesQuery.refetch()}
          title="Match history"
        />

        {matches && matches.items.length === 0 ? (
          <div className={styles.emptyState}>
            <strong>No matches found</strong>
            <p>Change the game or result filter to inspect another part of the record.</p>
            <button
              type="button"
              onClick={() => updateParams({ game: null, result: null, page: null })}
            >
              Clear filters
            </button>
          </div>
        ) : null}

        {matches && matches.items.length > 0 ? (
          <>
            <div className={styles.mobileMatchList}>
              {matches.items.map((match) => (
                <MobileMatchCard key={match.id} match={match} />
              ))}
            </div>
            <DesktopMatchTable matches={matches.items} />

            <nav aria-label="Match-history pages" className={styles.pagination}>
              <button
                disabled={matches.page <= 1 || matchesQuery.isFetching}
                type="button"
                onClick={() => updateParams({ page: String(matches.page - 1) })}
              >
                Previous
              </button>
              <span>
                Page {matches.page} of {Math.max(matches.totalPages, 1)}
              </span>
              <button
                disabled={matches.page >= matches.totalPages || matchesQuery.isFetching}
                type="button"
                onClick={() => updateParams({ page: String(matches.page + 1) })}
              >
                Next
              </button>
            </nav>
          </>
        ) : null}
      </section>

      <footer className={styles.dataNote}>
        <strong>Independent resources</strong>
        <p>
          Statistics and paginated matches load separately. A failure in one section does not remove
          confirmed data from the other.
        </p>
      </footer>
    </main>
  );
}
