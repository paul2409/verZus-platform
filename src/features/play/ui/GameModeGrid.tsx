// VERZUS STAGE 3 GAME MODE GRID

import { GameModeCard, type GameModeCardProps } from "./GameModeCard";
import { StatusChip } from "./StatusChip";
import styles from "./game-mode-grid.module.css";

const modes: readonly GameModeCardProps[] = [
  {
    game: "EA FC",
    mode: "Rookie Cup",
    participation: "1V1",
    requirement: "Rookie tier",
    status: "Live",
    statusTone: "live",
    tone: "green",
    glyph: "FC",
    href: "/compete?game=ea-fc",
  },
  {
    game: "League of Legends",
    mode: "Ranked",
    participation: "5V5",
    requirement: "Level 30+",
    status: "Scheduled",
    statusTone: "scheduled",
    tone: "cyan",
    glyph: "L",
    href: "/compete?game=league-of-legends",
  },
  {
    game: "Clash Royale",
    mode: "Ladder",
    participation: "1V1",
    requirement: "Trophy gate",
    status: "Verified",
    statusTone: "verified",
    tone: "gold",
    glyph: "CR",
    href: "/compete?game=clash-royale",
  },
  {
    game: "COD Mobile",
    mode: "Squad Battles",
    participation: "5V5",
    requirement: "Full squad",
    status: "Locked",
    statusTone: "locked",
    tone: "magenta",
    glyph: "CM",
    href: "/compete?game=cod-mobile",
  },
] as const;

export function GameModeGrid() {
  return (
    <section className={styles.section} aria-labelledby="play-game-modes-title">
      <header className={styles.sectionHeader}>
        <div>
          <span>GAME DIRECTORY</span>
          <h2 id="play-game-modes-title">Choose your arena</h2>
        </div>
        <StatusChip tone="live">4 GAME LANES</StatusChip>
      </header>

      <div className={styles.grid}>
        {modes.map((mode) => (
          <GameModeCard {...mode} key={`${mode.game}-${mode.mode}`} />
        ))}
      </div>
    </section>
  );
}
