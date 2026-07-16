import { Icon } from "@/components/primitives/icon";

import type {
  CompetitionDiscoveryEntryFee,
  CompetitionDiscoveryFilterOptions,
  CompetitionDiscoveryGame,
  CompetitionDiscoveryTeamSize,
  CompetitionEntryViewModel,
  CompetitionGuideLink,
  CompetitionResourceState,
} from "../model/competition-discovery.types";
import { CompetitionResourceState as ResourceState } from "./CompetitionResourceState";
import styles from "./CompetitionDiscovery.module.css";

export type CompetitionSidebarProps = {
  entry: CompetitionEntryViewModel | null;
  entryState: CompetitionResourceState;
  entryRequestId: string | null;
  guideLinks: CompetitionGuideLink[];
  guideState: CompetitionResourceState;
  guideRequestId: string | null;
  filterOptions: CompetitionDiscoveryFilterOptions;
  game: CompetitionDiscoveryGame;
  teamSize: CompetitionDiscoveryTeamSize;
  entryFee: CompetitionDiscoveryEntryFee;
  isFiltered: boolean;
  onEntryFeeChange: (value: CompetitionDiscoveryEntryFee) => void;
  onGameChange: (value: CompetitionDiscoveryGame) => void;
  onTeamSizeChange: (value: CompetitionDiscoveryTeamSize) => void;
  onClearFilters: () => void;
  onRetryEntry: () => void;
  onRetryGuide: () => void;
};

export function CompetitionSidebar({
  entry,
  entryState,
  entryRequestId,
  guideLinks,
  guideState,
  guideRequestId,
  filterOptions,
  game,
  teamSize,
  entryFee,
  isFiltered,
  onEntryFeeChange,
  onGameChange,
  onTeamSizeChange,
  onClearFilters,
  onRetryEntry,
  onRetryGuide,
}: CompetitionSidebarProps) {
  return (
    <aside className={styles.sidebar} aria-label="Competition controls">
      <section className={styles.sidePanel}>
        <div className={styles.sidePanelHeader}>
          <h2>QUICK FILTERS</h2>
          {isFiltered ? (
            <button className={styles.clearLink} onClick={onClearFilters} type="button">
              CLEAR
            </button>
          ) : null}
        </div>
        <label>
          <span>GAME</span>
          <select
            onChange={(event) => onGameChange(event.target.value as CompetitionDiscoveryGame)}
            value={game}
          >
            {filterOptions.games.map((option) => (
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
              onTeamSizeChange(event.target.value as CompetitionDiscoveryTeamSize)
            }
            value={teamSize}
          >
            {filterOptions.teamSizes.map((option) => (
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
              onEntryFeeChange(event.target.value as CompetitionDiscoveryEntryFee)
            }
            value={entryFee}
          >
            {filterOptions.entryFees.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <a className={styles.secondaryAction} href="#competition-list">
          APPLY FILTERS
        </a>
      </section>

      <section className={styles.sidePanel}>
        <div className={styles.sidePanelHeader}>
          <h2>YOUR ENTRIES</h2>
          <a href="#competition-list">VIEW ALL</a>
        </div>
        {entry ? (
          <>
            <strong className={styles.entryName}>{entry.competitionName}</strong>
            <span className={styles.entryState}>{entry.stateLabel}</span>
            <p>{entry.teamLabel}</p>
            <p>{entry.statusLabel}</p>
            {entryState === "stale" || entryState === "retrying" ? (
              <span className={styles.freshnessBadge}>UPDATING</span>
            ) : null}
            <button className={styles.secondaryAction} type="button">
              MANAGE ENTRY
            </button>
          </>
        ) : (
          <ResourceState
            compact
            onRetry={onRetryEntry}
            requestId={entryRequestId}
            state={entryState}
          />
        )}
      </section>

      <section className={styles.sidePanel}>
        <h2>COMPETE GUIDE</h2>
        {guideLinks.length > 0 ? (
          <nav aria-label="Compete guide">
            {guideLinks.map((link) => (
              <a href="#competition-list" key={link.id}>
                {link.label}
                <Icon decorative name="chevron-right" size="xs" />
              </a>
            ))}
          </nav>
        ) : (
          <ResourceState
            compact
            onRetry={onRetryGuide}
            requestId={guideRequestId}
            state={guideState}
          />
        )}
      </section>
    </aside>
  );
}
