"use client";

// VERZUS M8.7 KEYBOARD-OPERABLE LEADERBOARD MODE TABS

import { useRef, type KeyboardEvent } from "react";

import {
  leaderboardModeLabels,
  leaderboardModes,
  type LeaderboardMode,
} from "../../foundation/model/leaderboard-foundation.types";
import styles from "../../foundation/ui/LeaderboardFoundationScreen.module.css";

export function LeaderboardModeTabs({
  activeMode,
  onSelect,
}: {
  activeMode: LeaderboardMode;
  onSelect: (mode: LeaderboardMode) => void;
}) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const moveSelection = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = (index + 1) % leaderboardModes.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex = (index - 1 + leaderboardModes.length) % leaderboardModes.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = leaderboardModes.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const nextMode = leaderboardModes[nextIndex];
    if (!nextMode) return;
    onSelect(nextMode);
    buttonRefs.current[nextIndex]?.focus();
  };

  return (
    <div aria-label="Leaderboard modes" className={styles.modeTabs} role="tablist">
      {leaderboardModes.map((mode, index) => {
        const selected = activeMode === mode;
        return (
          <button
            aria-controls="leaderboard-results"
            aria-selected={selected}
            className={styles.modeTab}
            data-active={selected ? "true" : undefined}
            id={`leaderboard-mode-${mode}`}
            key={mode}
            onClick={() => onSelect(mode)}
            onKeyDown={(event) => moveSelection(event, index)}
            ref={(node) => {
              buttonRefs.current[index] = node;
            }}
            role="tab"
            tabIndex={selected ? 0 : -1}
            type="button"
          >
            {leaderboardModeLabels[mode]}
          </button>
        );
      })}
    </div>
  );
}
