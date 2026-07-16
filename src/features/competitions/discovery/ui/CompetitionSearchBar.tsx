import { Icon } from "@/components/primitives/icon";

import styles from "./CompetitionDiscovery.module.css";

export type CompetitionSearchBarProps = {
  value: string;
  resultCount: number;
  isPending: boolean;
  onChange: (value: string) => void;
  onClear: () => void;
};

export function CompetitionSearchBar({
  value,
  resultCount,
  isPending,
  onChange,
  onClear,
}: CompetitionSearchBarProps) {
  return (
    <div className={styles.searchRegion} role="search">
      <label className={styles.searchField}>
        <Icon decorative name="search" size="sm" />
        <span className={styles.srOnly}>Search competitions</span>
        <input
          aria-label="Search competitions"
          autoComplete="off"
          maxLength={80}
          onChange={(event) => onChange(event.target.value)}
          placeholder="SEARCH COMPETITIONS"
          type="search"
          value={value}
        />
        {value ? (
          <button aria-label="Clear competition search" onClick={onClear} type="button">
            <Icon decorative name="x" size="xs" />
          </button>
        ) : null}
      </label>

      <p aria-live="polite" className={styles.resultStatus}>
        <strong>{resultCount}</strong> RESULTS
        {isPending ? <span>UPDATING…</span> : null}
      </p>
    </div>
  );
}
