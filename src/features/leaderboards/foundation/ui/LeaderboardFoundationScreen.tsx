"use client";

// VERZUS M8.1 LEADERBOARD RESPONSIVE FOUNDATION SCREEN
// VERZUS M8.2 SEARCH, FILTERS, SORTING, PAGINATION AND URL STATE
// VERZUS M8.3 SCHEMA-VALIDATED RESOURCE PIPELINE
// VERZUS M8.4 MODE RESOURCES AND RANKING COMPOSITION
// VERZUS M8.5 CURRENT POSITION, MOVEMENT AND UPDATE STABILITY
// VERZUS M8.6 RELIABILITY AND EDGE STATES
// VERZUS M8.7 PERFORMANCE, ACCESSIBILITY AND FAILURE ISOLATION
// VERZUS M8.8 COLOR AND ENTITY INTEL COMPOSITION
// VERZUS M8.9 API-BACKED ENTITY INTEL CARD SYSTEM
// VERZUS M8.10.2 SINGLE-PAGE PAGINATION SUPPRESSION
// VERZUS M8.10 INTERACTION RELIABILITY AND RELEASE

import { useEffect, useMemo, useState } from "react";

import {
  buildLeaderboardPage,
  leaderboardPageSizes,
  type LeaderboardPageSize,
  type LeaderboardQueryInput,
  type LeaderboardSortDirection,
  useDebouncedValue,
  useLeaderboardUrlState,
} from "../../explorer";
import { leaderboardFoundationBoards } from "../mocks/leaderboard-foundation.mock";
import {
  leaderboardGameLabels,
  type LeaderboardFoundationBoard,
  type LeaderboardFoundationRow,
  type LeaderboardGame,
  type LeaderboardScope,
  type LeaderboardSortKey,
} from "../model/leaderboard-foundation.types";
import type { LeaderboardResourceSnapshot } from "../../resources/model/leaderboard-resource.types";
import type { LeaderboardLiveViewState } from "../../live";
import {
  createLeaderboardRenderPlan,
  LeaderboardModeTabs,
  LeaderboardWidgetBoundary,
  type LeaderboardCrashTarget,
} from "../../quality";
import {
  LeaderboardReliabilityBanner,
  LeaderboardResourceStateCard,
  type LeaderboardReliabilityView,
} from "../../reliability";
import {
  getLeaderboardModeComposition,
  getLeaderboardModeResetState,
  getLeaderboardModeSwitchPatch,
  hasActiveLeaderboardModeFilters,
  normalizeLeaderboardQueryForMode,
} from "../../modes/model/leaderboard-mode.registry";
import {
  LeaderboardModeDesktopTable,
  LeaderboardModeMobileList,
} from "../../modes/ui/LeaderboardModePresentation";
import {
  LeaderboardColorLegend,
  LeaderboardIntelPreview,
  LeaderboardInteractiveIdentity,
  parseLeaderboardIntelSelection,
  type LeaderboardIntelQueryInput,
  type LeaderboardIntelSelection,
} from "../../interactions";
import styles from "./LeaderboardFoundationScreen.module.css";

export type LeaderboardExplorerController = ReturnType<typeof useLeaderboardUrlState>;

export type LeaderboardFoundationScreenProps = {
  initialSearchParams?: LeaderboardQueryInput & LeaderboardIntelQueryInput;
  controlledExplorer?: LeaderboardExplorerController;
  crashTarget?: LeaderboardCrashTarget | null;
  intelSelection?: LeaderboardIntelSelection | null;
  liveUpdate?: LeaderboardLiveViewState;
  onRecoverWidget?: () => void;
  onRetryResources?: () => void;
  reliability?: LeaderboardReliabilityView;
  resourceSnapshot?: LeaderboardResourceSnapshot;
};

function movementLabel(row: LeaderboardFoundationRow): string {
  if (row.movement === "new") return "NEW";
  if (row.movement === "same") return "—";
  const arrow = row.movement === "up" ? "▲" : "▼";
  return `${arrow} ${row.movementDelta ?? 0}`;
}

export function LeaderboardFoundationScreen({
  initialSearchParams = {},
  controlledExplorer,
  crashTarget = null,
  intelSelection,
  liveUpdate,
  onRecoverWidget,
  onRetryResources,
  reliability,
  resourceSnapshot,
}: LeaderboardFoundationScreenProps) {
  const localExplorer = useLeaderboardUrlState(initialSearchParams);
  const resolvedIntelSelection =
    intelSelection ?? parseLeaderboardIntelSelection(initialSearchParams);
  const { state: explorerState, update, replace } = controlledExplorer ?? localExplorer;
  const localComposition = getLeaderboardModeComposition(explorerState.mode);
  const composition = resourceSnapshot?.composition ?? localComposition;
  const state = normalizeLeaderboardQueryForMode(explorerState, composition);
  const [searchDraft, setSearchDraft] = useState({
    value: state.search,
    sourceSearch: state.search,
  });
  const searchInput = searchDraft.sourceSearch === state.search ? searchDraft.value : state.search;
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const localBoard = leaderboardFoundationBoards[state.mode];
  const board = useMemo<LeaderboardFoundationBoard>(() => {
    const summary = resourceSnapshot?.summary;
    return {
      ...localBoard,
      ...(summary
        ? {
            mode: summary.mode,
            eyebrow: summary.eyebrow,
            title: summary.title,
            description: summary.description,
            periodLabel: summary.periodLabel,
            countdownLabel: summary.countdownLabel,
            totalCompetitors: summary.totalCompetitors,
            percentileLabel: summary.percentileLabel,
          }
        : {}),
      rows: resourceSnapshot?.entries?.items ?? (reliability ? [] : localBoard.rows),
      currentEntry: resourceSnapshot?.currentPosition?.entry ?? localBoard.currentEntry,
      rewards: resourceSnapshot?.rewards?.items ?? (reliability ? [] : localBoard.rewards),
    };
  }, [localBoard, reliability, resourceSnapshot]);

  useEffect(() => {
    if (debouncedSearch !== searchInput || debouncedSearch === state.search) return;
    const timer = window.setTimeout(() => {
      update({ search: debouncedSearch, page: 1 }, "replace");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [debouncedSearch, searchInput, state.search, update]);

  const page = useMemo(() => {
    const entries = resourceSnapshot?.entries;
    if (!entries) return buildLeaderboardPage(board.rows, state);
    return {
      rows: entries.items,
      filteredCount: entries.total,
      totalPages: entries.pageCount,
      page: entries.page,
      startIndex: entries.startIndex,
      endIndex: entries.endIndex,
    };
  }, [board.rows, resourceSnapshot?.entries, state]);

  const renderPlan = useMemo(
    () => createLeaderboardRenderPlan(page.rows, state.pageSize),
    [page.rows, state.pageSize],
  );

  useEffect(() => {
    if (page.page === state.page) return;
    const timer = window.setTimeout(() => {
      update({ page: page.page }, "replace");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [page.page, state.page, update]);

  const activeFilters = hasActiveLeaderboardModeFilters(state, composition);
  const noResults = page.filteredCount === 0;
  const freshnessLabel =
    resourceSnapshot?.status?.freshness === "stale" ? "Stale snapshot" : "Fresh snapshot";
  const updatedLabel = resourceSnapshot?.status
    ? `Updated ${new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      }).format(new Date(resourceSnapshot.status.lastUpdatedAt))} UTC`
    : "Updated 2 minutes ago";
  const changedEntryIds = liveUpdate?.changedEntryIds ?? [];
  const currentInsight = liveUpdate?.currentPosition;
  const entriesHealth = reliability?.resources.entries;
  const currentPositionHealth = reliability?.resources["current-position"];
  const rewardsHealth = reliability?.resources.rewards;
  const showCurrentPosition = !reliability || currentPositionHealth?.hasData === true;
  const showRewards = !reliability || rewardsHealth?.hasData === true;
  const entriesBlocked =
    Boolean(entriesHealth) &&
    !entriesHealth?.hasData &&
    ["loading", "error", "offline", "unauthorized"].includes(entriesHealth?.state ?? "ready");

  const resetExplorer = () => {
    setSearchDraft({ value: "", sourceSearch: "" });
    replace(getLeaderboardModeResetState(state.mode, state.pageSize));
  };

  return (
    <main
      className={styles.page}
      data-m8-stage="8.10"
      data-rendered-row-count={renderPlan.renderedRowCount}
      data-resource-source={resourceSnapshot ? "api" : "local"}
    >
      <a className={styles.skipLink} href="#leaderboard-results">
        Skip to rankings
      </a>

      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>M8 // {board.eyebrow}</p>
          <h1>Leaderboards</h1>
          <p className={styles.tagline}>Rank. Compete. Dominate.</p>
          <p className={styles.description}>{board.description}</p>
        </div>

        <div className={styles.heroStats} aria-label="Leaderboard summary">
          <div>
            <span>Your rank</span>
            <strong>{showCurrentPosition ? `#${board.currentEntry.rank}` : "—"}</strong>
          </div>
          <div>
            <span>Percentile</span>
            <strong>
              {reliability?.resources.summary.hasData === false ? "—" : board.percentileLabel}
            </strong>
          </div>
          <div>
            <span>Competitors</span>
            <strong>
              {reliability?.resources.summary.hasData === false
                ? "—"
                : board.totalCompetitors.toLocaleString()}
            </strong>
          </div>
        </div>
      </header>

      <LeaderboardModeTabs
        activeMode={state.mode}
        onSelect={(mode) => update(getLeaderboardModeSwitchPatch(mode), "push")}
      />

      <section className={styles.controlBar} aria-label="Leaderboard controls">
        <div className={styles.boardHeading}>
          <span>{board.periodLabel}</span>
          <h2>{board.title}</h2>
          <small>{board.countdownLabel}</small>
          <em className={styles.rankingBasis}>{composition.rankingBasis}</em>
        </div>

        <div className={styles.controls}>
          <label className={styles.searchControl}>
            <span>Search rankings</span>
            <input
              aria-describedby="leaderboard-search-help"
              aria-label="Search rankings"
              autoComplete="off"
              className={styles.searchInput}
              onChange={(event) =>
                setSearchDraft({ value: event.target.value, sourceSearch: state.search })
              }
              placeholder="Player, Crew, handle or country"
              type="search"
              value={searchInput}
            />
            <small id="leaderboard-search-help">Updates after 300 ms</small>
          </label>

          <label>
            <span>Game</span>
            <select
              disabled={composition.allowedGames.length === 1}
              value={state.game}
              onChange={(event) =>
                update({ game: event.target.value as LeaderboardGame, page: 1 }, "push")
              }
            >
              {composition.allowedGames.map((value) => (
                <option key={value} value={value}>
                  {leaderboardGameLabels[value]}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Scope</span>
            <select
              disabled={composition.allowedScopes.length === 1}
              value={state.scope}
              onChange={(event) =>
                update({ scope: event.target.value as LeaderboardScope, page: 1 }, "push")
              }
            >
              {composition.allowedScopes.map((value) => (
                <option key={value} value={value}>
                  {value === "global" ? "Global" : "Friends"}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Sort</span>
            <select
              value={state.sort}
              onChange={(event) =>
                update({ sort: event.target.value as LeaderboardSortKey, page: 1 }, "push")
              }
            >
              <option value="rank">Rank</option>
              <option value="points">Points</option>
              <option value="wins">Wins</option>
              <option value="win-rate">Win rate</option>
            </select>
          </label>

          <label>
            <span>Direction</span>
            <select
              value={state.direction}
              onChange={(event) =>
                update(
                  { direction: event.target.value as LeaderboardSortDirection, page: 1 },
                  "push",
                )
              }
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </label>

          <label>
            <span>Rows per page</span>
            <select
              value={state.pageSize}
              onChange={(event) =>
                update(
                  {
                    pageSize: Number(event.target.value) as LeaderboardPageSize,
                    page: 1,
                  },
                  "push",
                )
              }
            >
              {leaderboardPageSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {activeFilters ? (
        <section aria-label="Active leaderboard filters" className={styles.activeFilters}>
          <div>
            <strong>Filtered view</strong>
            <span>
              {state.search ? `Search: “${state.search}”` : "No search term"} ·{" "}
              {leaderboardGameLabels[state.game]} · {state.scope}
            </span>
          </div>
          <button onClick={resetExplorer} type="button">
            Reset filters
          </button>
        </section>
      ) : null}

      <LeaderboardWidgetBoundary
        crashTarget={crashTarget}
        label="Leaderboard status"
        onRecover={onRecoverWidget}
        target="status"
      >
        <LeaderboardReliabilityBanner onRetry={onRetryResources} view={reliability} />
      </LeaderboardWidgetBoundary>

      <div className={styles.layout}>
        <section
          aria-label={`${board.title} rankings`}
          className={styles.rankingPanel}
          id="leaderboard-results"
          tabIndex={-1}
        >
          <LeaderboardWidgetBoundary
            crashTarget={crashTarget}
            label="Ranking entries"
            onRecover={onRecoverWidget}
            target="ranking"
          >
            <div className={styles.freshness} role="status">
              <span>{freshnessLabel}</span>
              <span>
                {page.startIndex}-{page.endIndex} of {page.filteredCount} filtered entries
              </span>
              <span>{updatedLabel}</span>
              <span
                className={styles.liveStatus}
                aria-live="polite"
                data-changed={liveUpdate?.hasChanges ? "true" : undefined}
              >
                {liveUpdate?.isFetching
                  ? "Checking revision…"
                  : liveUpdate
                    ? `Revision ${liveUpdate.revision} · ${
                        liveUpdate.hasChanges ? "stable update applied" : "no rank changes"
                      }`
                    : "Live revision pending"}
              </span>
            </div>

            {entriesBlocked && entriesHealth ? (
              <LeaderboardResourceStateCard health={entriesHealth} onRetry={onRetryResources} />
            ) : !noResults ? (
              <>
                <LeaderboardModeDesktopTable
                  boardTitle={board.title}
                  changedEntryIds={changedEntryIds}
                  composition={composition}
                  currentEntry={showCurrentPosition ? board.currentEntry : undefined}
                  rows={renderPlan.rows}
                  sortDirection={state.direction}
                  sortKey={state.sort}
                />

                <LeaderboardModeMobileList
                  changedEntryIds={changedEntryIds}
                  composition={composition}
                  currentEntry={showCurrentPosition ? board.currentEntry : undefined}
                  rows={renderPlan.rows}
                  startIndex={page.startIndex}
                />

                {page.totalPages > 1 ? (
                  <nav aria-label="Leaderboard pagination" className={styles.pagination}>
                    <button
                      disabled={page.page <= 1}
                      onClick={() => update({ page: page.page - 1 }, "push")}
                      type="button"
                    >
                      Previous
                    </button>
                    <span aria-live="polite">
                      Page {page.page} of {page.totalPages}
                    </span>
                    <button
                      disabled={page.page >= page.totalPages}
                      onClick={() => update({ page: page.page + 1 }, "push")}
                      type="button"
                    >
                      Next
                    </button>
                  </nav>
                ) : null}
              </>
            ) : (
              <div className={styles.emptyState} role="status">
                <strong>
                  {activeFilters
                    ? "No rankings match your search and filters"
                    : "No rankings are available for this leaderboard"}
                </strong>
                <span>
                  {activeFilters
                    ? "Change the search term, game or scope. The current-player position remains available."
                    : "No validated ranking entries are available for this mode yet."}
                </span>
                {activeFilters ? (
                  <button onClick={resetExplorer} type="button">
                    Reset filters
                  </button>
                ) : null}
              </div>
            )}
          </LeaderboardWidgetBoundary>
        </section>

        <aside className={styles.sideRail}>
          <LeaderboardWidgetBoundary
            crashTarget={crashTarget}
            label="Current position"
            onRecover={onRecoverWidget}
            target="current-position"
          >
            {showCurrentPosition ? (
              <section className={styles.currentCard} aria-labelledby="current-position-title">
                <p>{composition.currentPositionLabel}</p>
                <h2 id="current-position-title">#{board.currentEntry.rank}</h2>
                <LeaderboardInteractiveIdentity row={board.currentEntry} />
                <dl>
                  <div>
                    <dt>Points</dt>
                    <dd>{board.currentEntry.points.toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt>Win rate</dt>
                    <dd>{board.currentEntry.winRate}%</dd>
                  </div>
                  <div>
                    <dt>Movement</dt>
                    <dd>{movementLabel(board.currentEntry)}</dd>
                  </div>
                  <div>
                    <dt>Previous rank</dt>
                    <dd>
                      {(currentInsight?.previousRank ?? board.currentEntry.previousRank)
                        ? `#${currentInsight?.previousRank ?? board.currentEntry.previousRank}`
                        : "NEW"}
                    </dd>
                  </div>
                  <div>
                    <dt>Next target</dt>
                    <dd>
                      {currentInsight?.nextRank
                        ? `#${currentInsight.nextRank} · ${currentInsight.pointsToNextRank?.toLocaleString() ?? 0} pts`
                        : "Top rank"}
                    </dd>
                  </div>
                </dl>
              </section>
            ) : currentPositionHealth ? (
              <LeaderboardResourceStateCard
                compact
                health={currentPositionHealth}
                onRetry={onRetryResources}
              />
            ) : null}
          </LeaderboardWidgetBoundary>

          <LeaderboardWidgetBoundary
            crashTarget={crashTarget}
            label="Placement rewards"
            onRecover={onRecoverWidget}
            target="rewards"
          >
            {showRewards ? (
              <section className={styles.rewardsCard} aria-labelledby="top-rewards-title">
                <p>Placement rewards</p>
                <h2 id="top-rewards-title">Top rewards</h2>
                <ol>
                  {board.rewards.map((reward) => (
                    <li key={reward.rankLabel}>
                      <strong>{reward.rankLabel}</strong>
                      <span>{reward.xp.toLocaleString()} XP</span>
                      <small>{reward.cashLabel}</small>
                    </li>
                  ))}
                </ol>
              </section>
            ) : rewardsHealth ? (
              <LeaderboardResourceStateCard
                compact
                health={rewardsHealth}
                onRetry={onRetryResources}
              />
            ) : null}
          </LeaderboardWidgetBoundary>

          <section className={styles.legendCard} aria-labelledby="movement-legend-title">
            <h2 id="movement-legend-title">Movement legend</h2>
            <p>
              <span data-direction="up">▲</span> Climbed since the previous snapshot
            </p>
            <p>
              <span data-direction="down">▼</span> Dropped since the previous snapshot
            </p>
            <p>
              <span data-direction="new">NEW</span> First ranked appearance
            </p>
          </section>

          <LeaderboardColorLegend />
        </aside>
      </div>

      <LeaderboardIntelPreview
        rows={[...board.rows, board.currentEntry]}
        selection={resolvedIntelSelection}
      />

      <footer className={styles.foundationNote}>
        <strong>M8.10 INTERACTION-READY LEADERBOARDS</strong>
        <span>
          Player, Crew and match triggers now resolve through independent schema-validated domain
          resources and the shared intel-card system. Cached card failures remain isolated from the
          ranking surface.
        </span>
      </footer>
    </main>
  );
}
