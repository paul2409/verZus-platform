"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/primitives/icon";

import { useCompetitionDiscoveryData } from "../discovery/hooks/useCompetitionDiscoveryData";
import { useCompetitionDiscoveryUrlState } from "../discovery/hooks/useCompetitionDiscoveryUrlState";
import { competitionDiscoveryFilterOptionsFallback } from "../discovery/model/competition-discovery.constants";
import type {
  CompetitionDiscoveryEntryFee,
  CompetitionDiscoveryGame,
  CompetitionDiscoveryItem,
  CompetitionDiscoverySort,
  CompetitionDiscoveryTeamSize,
} from "../discovery/model/competition-discovery.types";
import {
  CompetitionCard,
  CompetitionHero,
  CompetitionJourney,
  CompetitionPagination,
  CompetitionResourceState,
  CompetitionSearchBar,
  CompetitionSidebar,
} from "../discovery/ui";
import styles from "./CompetitionDiscoveryScreen.module.css";

export function CompetitionDiscoveryScreen() {
  const router = useRouter();
  const {
    filters,
    scenario,
    searchInput,
    isSearchPending,
    isFiltered,
    setSearchInput,
    setTab,
    setGame,
    setTeamSize,
    setEntryFee,
    setSort,
    setPage,
    clearFilters,
  } = useCompetitionDiscoveryUrlState();
  const resources = useCompetitionDiscoveryData(filters, scenario);
  const [selection, setSelection] = useState(
    "Select a competition to inspect its M6 preview state.",
  );

  const featured = resources.featured.data?.competition ?? null;
  const result = resources.list.data;
  const metadata = resources.metadata.data;
  const entry = resources.entry.data?.entry ?? null;
  const options = metadata?.filterOptions ?? competitionDiscoveryFilterOptionsFallback;

  const selectCompetition = (competition: CompetitionDiscoveryItem) => {
    setSelection(`${competition.name} selected. Opening competition details.`);
    router.push(`/compete/${competition.id}`);
  };

  return (
    <main className={styles.page} data-m6-stage="6.4">
      <header className={styles.pageHeader}>
        <div>
          <h1>COMPETE</h1>
          <p>DISCOVER. ENTER. COMPETE.</p>
        </div>
        <div className={styles.headerStats} aria-label="Player competition statistics">
          <span>
            VS POINTS<strong>2,450</strong>
          </span>
          <span>
            TRUST<strong>98</strong>
          </span>
        </div>
      </header>

      {featured ? (
        <CompetitionHero competition={featured} />
      ) : (
        <CompetitionResourceState
          onRetry={resources.retryFeatured}
          requestId={resources.featured.requestId}
          state={resources.featured.state}
        />
      )}

      {metadata?.journey.length ? (
        <CompetitionJourney steps={metadata.journey} />
      ) : (
        <CompetitionResourceState
          compact
          onRetry={resources.retryMetadata}
          requestId={resources.metadata.requestId}
          state={resources.metadata.state}
        />
      )}

      <div className={styles.discoveryLayout}>
        <section aria-labelledby="competition-list-title" className={styles.discoveryMain}>
          <div className={styles.sectionTitleRow}>
            <div className={styles.sectionTitleGroup}>
              <h2 id="competition-list-title">ALL COMPETITIONS</h2>
              {resources.list.state === "stale" || resources.list.state === "retrying" ? (
                <span className={styles.freshnessBadge}>UPDATING</span>
              ) : null}
            </div>
            {isFiltered ? (
              <button onClick={clearFilters} type="button">
                CLEAR FILTERS
              </button>
            ) : (
              <a href="#competition-list">VIEW ALL</a>
            )}
          </div>

          <CompetitionSearchBar
            isPending={isSearchPending || resources.list.state === "retrying"}
            onChange={setSearchInput}
            onClear={() => setSearchInput("")}
            resultCount={result?.total ?? 0}
            value={searchInput}
          />

          <div className={styles.discoveryControls}>
            <div aria-label="Competition states" className={styles.tabs} role="tablist">
              {options.tabs.map((tab) => (
                <button
                  aria-selected={filters.tab === tab.value}
                  data-active={filters.tab === tab.value ? "true" : undefined}
                  key={tab.value}
                  onClick={() => setTab(tab.value)}
                  role="tab"
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className={styles.desktopSelects}>
              <label>
                <span className={styles.srOnly}>Game</span>
                <select
                  onChange={(event) => setGame(event.target.value as CompetitionDiscoveryGame)}
                  value={filters.game}
                >
                  {options.games.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className={styles.srOnly}>Sort competitions</span>
                <select
                  onChange={(event) => setSort(event.target.value as CompetitionDiscoverySort)}
                  value={filters.sort}
                >
                  {options.sorts.map((option) => (
                    <option key={option.value} value={option.value}>
                      SORT: {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <details className={styles.mobileFilters}>
            <summary>
              QUICK FILTERS
              <Icon decorative name="chevron-down" size="xs" />
            </summary>
            <div>
              <label>
                <span>GAME</span>
                <select
                  onChange={(event) => setGame(event.target.value as CompetitionDiscoveryGame)}
                  value={filters.game}
                >
                  {options.games.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>TEAM SIZE</span>
                <select
                  onChange={(event) =>
                    setTeamSize(event.target.value as CompetitionDiscoveryTeamSize)
                  }
                  value={filters.teamSize}
                >
                  {options.teamSizes.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>ENTRY FEE</span>
                <select
                  onChange={(event) =>
                    setEntryFee(event.target.value as CompetitionDiscoveryEntryFee)
                  }
                  value={filters.entryFee}
                >
                  {options.entryFees.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>SORT</span>
                <select
                  onChange={(event) => setSort(event.target.value as CompetitionDiscoverySort)}
                  value={filters.sort}
                >
                  {options.sorts.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </details>

          <p aria-live="polite" className={styles.selectionStatus}>
            {selection}
          </p>

          <div className={styles.competitionList} id="competition-list">
            {result?.items.length ? (
              result.items.map((competition) => (
                <CompetitionCard
                  competition={competition}
                  key={competition.id}
                  onSelect={selectCompetition}
                />
              ))
            ) : resources.list.state === "empty" ? (
              <div className={styles.emptyState}>
                <Icon decorative name="search" size="lg" />
                <h3>NO COMPETITIONS FOUND</h3>
                <p>Adjust the current search and filters to reveal more opportunities.</p>
                <button onClick={clearFilters} type="button">
                  RESET FILTERS
                </button>
              </div>
            ) : (
              <CompetitionResourceState
                onRetry={resources.retryList}
                requestId={resources.list.requestId}
                state={resources.list.state}
              />
            )}
          </div>

          {result ? (
            <CompetitionPagination
              hasNextPage={result.hasNextPage}
              hasPreviousPage={result.hasPreviousPage}
              onPageChange={setPage}
              page={result.page}
              pageCount={result.pageCount}
            />
          ) : null}

          <button className={styles.browseAction} type="button">
            BROWSE ALL COMPETITIONS
            <Icon decorative name="chevron-right" size="sm" />
          </button>
        </section>

        <CompetitionSidebar
          entry={entry}
          entryFee={filters.entryFee}
          entryRequestId={resources.entry.requestId}
          entryState={resources.entry.state}
          filterOptions={options}
          game={filters.game}
          guideLinks={metadata?.guideLinks ?? []}
          guideRequestId={resources.metadata.requestId}
          guideState={resources.metadata.state}
          isFiltered={isFiltered}
          onClearFilters={clearFilters}
          onEntryFeeChange={setEntryFee}
          onGameChange={setGame}
          onRetryEntry={resources.retryEntry}
          onRetryGuide={resources.retryMetadata}
          onTeamSizeChange={setTeamSize}
          teamSize={filters.teamSize}
        />
      </div>
    </main>
  );
}
