// VERZUS M3 STEP 3.6
"use client";

import { useState } from "react";

import { Modal } from "@/components/primitives/overlay";

import styles from "./ShellOverlays.module.css";

export interface ShellSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const searchShortcuts = [
  {
    href: "/search?domain=players",
    label: "Players",
    description: "Find competitors and public profiles",
  },
  {
    href: "/search?domain=crews",
    label: "Crews",
    description: "Find teams, rosters and rankings",
  },
  {
    href: "/search?domain=competitions",
    label: "Competitions",
    description: "Find open and upcoming events",
  },
  {
    href: "/search?domain=matches",
    label: "Matches",
    description: "Find match records and results",
  },
] as const;

export function ShellSearchModal({ open, onOpenChange }: ShellSearchModalProps) {
  const [query, setQuery] = useState("");

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setQuery("");
    }

    onOpenChange(nextOpen);
  };

  return (
    <Modal
      description="Search players, Crews, competitions and matches."
      onOpenChange={handleOpenChange}
      open={open}
      size="lg"
      title="Search VERZUS"
    >
      <form
        action="/search"
        className={styles.searchForm}
        method="get"
        onSubmit={() => handleOpenChange(false)}
      >
        <div className={styles.searchField}>
          <label htmlFor="global-shell-search">Search query</label>
          <input
            autoComplete="off"
            className={styles.searchInput}
            id="global-shell-search"
            name="q"
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Player, Crew, competition or match"
            type="search"
            value={query}
          />
        </div>

        <div className={styles.searchActions}>
          <button
            className={styles.primaryAction}
            disabled={query.trim().length === 0}
            type="submit"
          >
            Search
          </button>
          <button
            className={styles.secondaryAction}
            onClick={() => handleOpenChange(false)}
            type="button"
          >
            Cancel
          </button>
        </div>

        <section aria-labelledby="shell-search-shortcuts" className={styles.searchShortcuts}>
          <p className={styles.sectionLabel} id="shell-search-shortcuts">
            Search by domain
          </p>
          <div className={styles.shortcutGrid}>
            {searchShortcuts.map((shortcut) => (
              <a
                className={styles.shortcut}
                href={shortcut.href}
                key={shortcut.href}
                onClick={() => handleOpenChange(false)}
              >
                <strong>{shortcut.label}</strong>
                <span>{shortcut.description}</span>
              </a>
            ))}
          </div>
        </section>
      </form>
    </Modal>
  );
}
