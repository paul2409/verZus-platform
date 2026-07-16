import Link from "next/link";

import { StatusChip, type StatusChipTone } from "./StatusChip";
import styles from "./game-mode-grid.module.css";

export type GameModeTone = "cyan" | "violet" | "gold" | "pink";

export type GameModeCardProps = {
  game: string;
  mode: string;
  players: string;
  requirement: string;
  status: string;
  statusTone: StatusChipTone;
  tone: GameModeTone;
  glyph: string;
  href: string;
};

export function GameModeCard({
  game,
  mode,
  players,
  requirement,
  status,
  statusTone,
  tone,
  glyph,
  href,
}: GameModeCardProps) {
  return (
    <article className={styles.card} data-game-mode-tone={tone}>
      <div className={styles.cardTopline}>
        <span className={styles.glyph} aria-hidden="true">
          {glyph}
        </span>
        <StatusChip tone={statusTone}>{status}</StatusChip>
      </div>

      <div className={styles.cardCopy}>
        <span>{game}</span>
        <h3>{mode}</h3>
      </div>

      <dl className={styles.cardFacts}>
        <div>
          <dt>PLAYERS</dt>
          <dd>{players}</dd>
        </div>
        <div>
          <dt>ENTRY</dt>
          <dd>{requirement}</dd>
        </div>
      </dl>

      <Link className={styles.cardAction} href={href}>
        OPEN MODE
      </Link>
    </article>
  );
}
