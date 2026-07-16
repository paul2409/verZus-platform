#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-install}"

echo "VERZUS - Premium esports Play design system"
echo "Mode: ${MODE}"
echo "No branch will be created or changed."
echo

ROOT_LAYOUT="src/app/layout.tsx"
PLAY_COMPONENT="src/features/play/ui/PlayCommandCenter.tsx"
PLAY_INDEX="src/features/play/ui/index.ts"
PLAY_CSS="src/features/play/ui/play-command-center.module.css"
THEME_FILE="src/styles/verzus-esports-design-system.css"
HEADER_CSS="src/features/play/ui/play-premium.module.css"
STATUS_COMPONENT="src/features/play/ui/StatusChip.tsx"
STATUS_CSS="src/features/play/ui/status-chip.module.css"
MODE_CARD="src/features/play/ui/GameModeCard.tsx"
MODE_GRID="src/features/play/ui/GameModeGrid.tsx"
MODE_CSS="src/features/play/ui/game-mode-grid.module.css"
BACKUP_ROOT=".verzus-backups/premium-esports-play"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="${BACKUP_ROOT}/${STAMP}"
PREVIEW_PORT="3110"

print_plan() {
  cat <<'PLAN'
KEEP
  - Existing routes, APIs, schemas, adapters, mocks, queries and view models
  - Existing check-in logic, authorization, telemetry and isolated widget failures
  - Existing shell navigation and mobile bottom-navigation ownership
  - Existing responsive Play widgets and all ten M5 scenarios

REUSE
  - Current PlayCommandCenter composition and live API-backed widgets
  - Existing NextMatchCard, CurrentPositionWidget, OpportunityRail and QuickActions
  - Rajdhani for futuristic interface text and Inter for readable body copy
  - Existing shared component and feature boundaries

REPLACE
  - Colour and typography tokens with the approved esports signal system
  - Play surface, borders, buttons, hover states and information hierarchy
  - Green-dominant decoration with cyan-dominant Play actions and violet structure

DELETE
  - No production route
  - No domain logic
  - No test
  - No API contract

CREATE
  - src/styles/verzus-esports-design-system.css
  - src/features/play/ui/StatusChip.tsx
  - src/features/play/ui/GameModeCard.tsx
  - src/features/play/ui/GameModeGrid.tsx
  - Focused CSS modules for the new presentational components
  - Timestamped rollback backup
PLAN
}

require_repo() {
  local required=(
    "package.json"
    "$ROOT_LAYOUT"
    "$PLAY_COMPONENT"
    "$PLAY_INDEX"
    "$PLAY_CSS"
  )

  for file in "${required[@]}"; do
    if [[ ! -f "$file" ]]; then
      echo "Error: required file not found: $file"
      echo "Run this script from the VERZUS repository root."
      exit 1
    fi
  done
}

backup_files() {
  mkdir -p "$BACKUP_DIR/src/app" "$BACKUP_DIR/src/styles" "$BACKUP_DIR/src/features/play/ui"

  cp "$ROOT_LAYOUT" "$BACKUP_DIR/src/app/layout.tsx"
  cp "$PLAY_COMPONENT" "$BACKUP_DIR/src/features/play/ui/PlayCommandCenter.tsx"
  cp "$PLAY_INDEX" "$BACKUP_DIR/src/features/play/ui/index.ts"
  cp "$PLAY_CSS" "$BACKUP_DIR/src/features/play/ui/play-command-center.module.css"

  for file in "$THEME_FILE" "$HEADER_CSS" "$STATUS_COMPONENT" "$STATUS_CSS" "$MODE_CARD" "$MODE_GRID" "$MODE_CSS"; do
    if [[ -f "$file" ]]; then
      mkdir -p "$BACKUP_DIR/$(dirname "$file")"
      cp "$file" "$BACKUP_DIR/$file"
    fi
  done

  cat > "$BACKUP_DIR/manifest.txt" <<MANIFEST
VERZUS premium esports Play backup
Created: $(date -Iseconds)
Theme existed: $([[ -f "$THEME_FILE" ]] && echo yes || echo no)
StatusChip existed: $([[ -f "$STATUS_COMPONENT" ]] && echo yes || echo no)
GameModeCard existed: $([[ -f "$MODE_CARD" ]] && echo yes || echo no)
GameModeGrid existed: $([[ -f "$MODE_GRID" ]] && echo yes || echo no)
MANIFEST

  echo "Rollback backup created:"
  echo "  $BACKUP_DIR"
}

write_theme() {
  cat > "$THEME_FILE" <<'CSS'
/*
 * VERZUS PREMIUM ESPORTS DESIGN SYSTEM
 *
 * Colour is semantic, not decorative:
 * Cyan = live, active, primary information and Play actions
 * Pink = rivalry, alerts and opponent pressure
 * Gold = rewards, timers and VS Credits
 * Green = confirmed, verified and wins
 * Violet = structure, borders and inactive controls
 */

:root,
html[data-theme="retro-competitive"] {
  color-scheme: dark;

  --vz-esports-void: #0a0a14;
  --vz-esports-panel: #12101f;
  --vz-esports-panel-raised: #18152a;
  --vz-esports-violet: #7f5af0;
  --vz-esports-cyan: #00e5ff;
  --vz-esports-pink: #ff3ea5;
  --vz-esports-gold: #ffc400;
  --vz-esports-green: #39ff14;
  --vz-esports-text: #f1f0ff;
  --vz-esports-muted: #8a87b8;
  --vz-esports-line: rgb(127 90 240 / 56%);
  --vz-esports-line-soft: rgb(127 90 240 / 24%);

  --vz-font-display: "Rajdhani", "Arial Narrow", sans-serif;
  --vz-font-body: "Inter Variable", "Inter", system-ui, sans-serif;
  --vz-font-numeric: ui-monospace, "SFMono-Regular", Consolas, "Liberation Mono", monospace;

  --vz-retro-black: var(--vz-esports-void);
  --vz-retro-black-soft: #0d0c18;
  --vz-retro-surface: var(--vz-esports-panel);
  --vz-retro-surface-2: var(--vz-esports-panel-raised);
  --vz-retro-surface-3: #1d1932;
  --vz-retro-line: var(--vz-esports-violet);
  --vz-retro-line-soft: var(--vz-esports-line-soft);
  --vz-retro-green: var(--vz-esports-green);
  --vz-retro-green-bright: #7dff67;
  --vz-retro-cyan: var(--vz-esports-cyan);
  --vz-retro-purple: var(--vz-esports-violet);
  --vz-retro-blue: #4f8dff;
  --vz-retro-orange: var(--vz-esports-gold);
  --vz-retro-gold: var(--vz-esports-gold);
  --vz-retro-red: var(--vz-esports-pink);
  --vz-retro-pink: var(--vz-esports-pink);
  --vz-retro-white: var(--vz-esports-text);
  --vz-retro-muted: var(--vz-esports-muted);

  --vz-color-background-deep: var(--vz-esports-void);
  --vz-color-background: var(--vz-esports-void);
  --vz-color-background-elevated: #0d0c18;
  --vz-color-background-muted: var(--vz-esports-panel);
  --vz-color-surface-base: var(--vz-esports-panel);
  --vz-color-surface-elevated: var(--vz-esports-panel-raised);
  --vz-color-surface-interactive: #1d1932;
  --vz-color-panel: rgb(18 16 31 / 97%);
  --vz-color-panel-muted: rgb(18 16 31 / 88%);
  --vz-color-panel-hover: rgb(29 25 50 / 98%);
  --vz-color-panel-active: rgb(0 229 255 / 7%);

  --vz-color-text-primary: var(--vz-esports-text);
  --vz-color-text-secondary: var(--vz-esports-muted);
  --vz-color-text-tertiary: #706d9d;
  --vz-color-text-muted: #5f5c83;
  --vz-color-text-brand: var(--vz-esports-cyan);
  --vz-color-text-link: var(--vz-esports-cyan);

  --vz-color-action-primary: var(--vz-esports-cyan);
  --vz-color-action-primary-hover: #62f2ff;
  --vz-color-action-primary-active: #00b9ce;
  --vz-color-action-secondary: var(--vz-esports-violet);
  --vz-color-action-secondary-hover: #a78bff;
  --vz-color-action-secondary-active: #6341d4;

  --vz-color-success: var(--vz-esports-green);
  --vz-color-info: var(--vz-esports-cyan);
  --vz-color-warning: var(--vz-esports-gold);
  --vz-color-danger: var(--vz-esports-pink);
  --vz-color-status-live: var(--vz-esports-cyan);
  --vz-color-status-upcoming: var(--vz-esports-violet);
  --vz-color-status-completed: var(--vz-esports-green);
  --vz-color-status-cancelled: var(--vz-esports-pink);

  --vz-color-border-subtle: rgb(127 90 240 / 16%);
  --vz-color-border-default: rgb(127 90 240 / 32%);
  --vz-color-border-strong: rgb(127 90 240 / 62%);
  --vz-color-border-active: var(--vz-esports-cyan);
  --vz-color-border-information: var(--vz-esports-cyan);
  --vz-color-border-warning: var(--vz-esports-gold);
  --vz-color-border-danger: var(--vz-esports-pink);
  --vz-color-focus-ring: var(--vz-esports-cyan);
  --vz-color-focus-ring-secondary: var(--vz-esports-violet);

  --vz-gradient-brand: linear-gradient(90deg, var(--vz-esports-cyan), var(--vz-esports-violet));
  --vz-gradient-brand-horizontal: linear-gradient(
    90deg,
    var(--vz-esports-cyan),
    var(--vz-esports-violet)
  );
  --vz-gradient-primary: linear-gradient(180deg, #62f2ff, var(--vz-esports-cyan));

  --vz-radius-xs: 2px;
  --vz-radius-sm: 3px;
  --vz-radius-md: 4px;
  --vz-radius-lg: 4px;
  --vz-radius-xl: 4px;

  --vz-shadow-focus: 0 0 0 2px rgb(0 229 255 / 24%);
  --vz-shadow-glow-green: 0 0 14px rgb(57 255 20 / 16%);
  --vz-shadow-glow-cyan: 0 0 14px rgb(0 229 255 / 16%);
  --vz-shadow-glow-purple: 0 0 14px rgb(127 90 240 / 18%);
  --vz-shadow-glow-gold: 0 0 14px rgb(255 196 0 / 16%);

  --vz-shell-background:
    linear-gradient(rgb(10 10 20 / 96%), rgb(10 10 20 / 99%)),
    radial-gradient(circle at 16% 8%, rgb(0 229 255 / 6%), transparent 25rem),
    radial-gradient(circle at 84% 14%, rgb(127 90 240 / 8%), transparent 28rem),
    var(--vz-esports-void);
  --vz-shell-border: var(--vz-esports-line-soft);
  --vz-shell-text: var(--vz-esports-text);
  --vz-shell-muted: var(--vz-esports-muted);
  --vz-shell-active: var(--vz-esports-cyan);
  --vz-shell-partial: var(--vz-esports-gold);
  --vz-shell-danger: var(--vz-esports-pink);

  --vz-bottom-nav-surface: linear-gradient(180deg, rgb(18 16 31 / 98%), rgb(10 10 20 / 100%));
  --vz-bottom-nav-surface-elevated: linear-gradient(
    180deg,
    rgb(24 21 42 / 99%),
    rgb(10 10 20 / 100%)
  );
  --vz-bottom-nav-border: rgb(127 90 240 / 38%);
  --vz-bottom-nav-border-strong: rgb(0 229 255 / 70%);
  --vz-bottom-nav-shadow: none;
  --vz-bottom-nav-shadow-floating: none;
  --vz-bottom-nav-item-text: var(--vz-esports-muted);
  --vz-bottom-nav-item-hover: var(--vz-esports-text);
  --vz-bottom-nav-item-active: var(--vz-esports-cyan);
  --vz-bottom-nav-item-partial: var(--vz-esports-gold);
  --vz-bottom-nav-item-background-active: rgb(0 229 255 / 8%);
  --vz-bottom-nav-item-background-hover: rgb(127 90 240 / 8%);
  --vz-bottom-nav-item-background-partial: rgb(255 196 0 / 7%);
  --vz-bottom-nav-prominent-background: linear-gradient(180deg, #62f2ff, var(--vz-esports-cyan));
  --vz-bottom-nav-prominent-foreground: var(--vz-esports-void);
  --vz-bottom-nav-prominent-ring: 0 0 0 2px rgb(0 229 255 / 22%);
}

html[data-theme="retro-competitive"] {
  min-width: 320px;
  background: var(--vz-esports-void);
}

html[data-theme="retro-competitive"] body {
  min-height: 100vh;
  color: var(--vz-esports-text);
  background:
    linear-gradient(rgb(10 10 20 / 95%), rgb(10 10 20 / 98%)),
    radial-gradient(circle at 15% 10%, rgb(0 229 255 / 6%), transparent 26rem),
    radial-gradient(circle at 82% 18%, rgb(127 90 240 / 8%), transparent 30rem),
    var(--vz-esports-void);
  background-attachment: fixed;
  font-family: var(--vz-font-body);
}

html[data-theme="retro-competitive"] body::before {
  opacity: 0.14;
  background-image:
    linear-gradient(rgb(127 90 240 / 4%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(0 229 255 / 3%) 1px, transparent 1px);
  background-size: 36px 36px;
}

html[data-theme="retro-competitive"] body::after {
  opacity: 0.05;
}

html[data-theme="retro-competitive"] :is(h1, h2, h3, h4, h5, h6, button, nav a, th) {
  font-family: var(--vz-font-display);
}

html[data-theme="retro-competitive"] :is(h1, h2, h3, h4, h5, h6) {
  color: var(--vz-esports-text);
  font-weight: 700;
  letter-spacing: 0.075em;
  text-transform: uppercase;
}

html[data-theme="retro-competitive"] :is(p, li, dd, input, textarea, select) {
  font-family: var(--vz-font-body);
}

html[data-theme="retro-competitive"] :is(td, time, output, [data-numeric]) {
  font-family: var(--vz-font-numeric);
  font-variant-numeric: tabular-nums lining-nums;
}

html[data-theme="retro-competitive"] :is(p, li, dd) {
  color: var(--vz-color-text-secondary);
}

html[data-theme="retro-competitive"] ::selection {
  color: var(--vz-esports-void);
  background: var(--vz-esports-cyan);
}

html[data-theme="retro-competitive"] :focus-visible {
  outline-color: var(--vz-esports-cyan);
}

html[data-theme="retro-competitive"] a[data-navigation-current="true"] {
  color: var(--vz-esports-cyan) !important;
  border-color: rgb(0 229 255 / 44%) !important;
  background: rgb(0 229 255 / 7%) !important;
}

html[data-theme="retro-competitive"] [data-bottom-navigation-items="5"] li:nth-child(1) {
  --vz-nav-signal: var(--vz-esports-cyan);
}

html[data-theme="retro-competitive"] [data-bottom-navigation-items="5"] li:nth-child(2) {
  --vz-nav-signal: var(--vz-esports-pink);
}

html[data-theme="retro-competitive"] [data-bottom-navigation-items="5"] li:nth-child(3) {
  --vz-nav-signal: var(--vz-esports-gold);
}

html[data-theme="retro-competitive"] [data-bottom-navigation-items="5"] li:nth-child(4) {
  --vz-nav-signal: var(--vz-esports-green);
}

html[data-theme="retro-competitive"] [data-bottom-navigation-items="5"] li:nth-child(5) {
  --vz-nav-signal: var(--vz-esports-violet);
}

html[data-theme="retro-competitive"]
  [data-bottom-navigation-items="5"]
  li[data-navigation-current="true"] {
  color: var(--vz-nav-signal) !important;
}

html[data-theme="retro-competitive"]
  [data-bottom-navigation-items="5"]
  li[data-navigation-current="true"]
  a {
  border-top-color: var(--vz-nav-signal) !important;
  background: transparent !important;
}

@media (prefers-reduced-motion: reduce) {
  html[data-theme="retro-competitive"] *,
  html[data-theme="retro-competitive"] *::before,
  html[data-theme="retro-competitive"] *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
CSS
}

write_status_chip() {
  cat > "$STATUS_COMPONENT" <<'TSX'
import type { HTMLAttributes } from "react";

import styles from "./status-chip.module.css";

export type StatusChipTone = "live" | "scheduled" | "verified" | "locked";

export type StatusChipProps = HTMLAttributes<HTMLSpanElement> & {
  tone: StatusChipTone;
};

export function StatusChip({ tone, className, children, ...props }: StatusChipProps) {
  return (
    <span
      {...props}
      className={`${styles.chip} ${styles[tone]} ${className ?? ""}`}
      data-status-chip={tone}
    >
      {children}
    </span>
  );
}
TSX

  cat > "$STATUS_CSS" <<'CSS'
.chip {
  display: inline-flex;
  min-height: 1.45rem;
  align-items: center;
  justify-content: center;
  padding: 0.2rem 0.5rem;
  color: var(--vz-esports-text);
  border: 1px solid currentColor;
  border-radius: 3px;
  background: rgb(10 10 20 / 72%);
  font-family: var(--vz-font-display);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.11em;
  line-height: 1;
  text-transform: uppercase;
}

.live {
  color: var(--vz-esports-cyan);
}

.scheduled {
  color: var(--vz-esports-violet);
}

.verified {
  color: var(--vz-esports-green);
}

.locked {
  color: var(--vz-esports-muted);
}
CSS
}

write_game_modes() {
  cat > "$MODE_CARD" <<'TSX'
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
TSX

  cat > "$MODE_GRID" <<'TSX'
import { GameModeCard, type GameModeCardProps } from "./GameModeCard";
import { StatusChip } from "./StatusChip";
import styles from "./game-mode-grid.module.css";

const modes: readonly GameModeCardProps[] = [
  {
    game: "EA FC",
    mode: "Rookie Cup",
    players: "128 active",
    requirement: "Rookie tier",
    status: "Live",
    statusTone: "live",
    tone: "cyan",
    glyph: "FC",
    href: "/compete?game=ea-fc",
  },
  {
    game: "League of Legends",
    mode: "Ranked",
    players: "64 queued",
    requirement: "Level 30+",
    status: "Scheduled",
    statusTone: "scheduled",
    tone: "violet",
    glyph: "L",
    href: "/compete?game=league-of-legends",
  },
  {
    game: "Clash Royale",
    mode: "Ladder",
    players: "96 active",
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
    players: "40 squads",
    requirement: "Full squad",
    status: "Locked",
    statusTone: "locked",
    tone: "pink",
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
        <StatusChip tone="live">4 modes online</StatusChip>
      </header>

      <div className={styles.grid}>
        {modes.map((mode) => (
          <GameModeCard {...mode} key={`${mode.game}-${mode.mode}`} />
        ))}
      </div>
    </section>
  );
}
TSX

  cat > "$MODE_CSS" <<'CSS'
.section {
  display: grid;
  gap: 0.85rem;
  margin-top: 1rem;
  padding: clamp(0.85rem, 2vw, 1.15rem);
  border: 1px solid var(--vz-esports-line-soft);
  background: rgb(18 16 31 / 78%);
}

.sectionHeader {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.sectionHeader > div {
  min-width: 0;
}

.sectionHeader span {
  color: var(--vz-esports-cyan);
  font-family: var(--vz-font-display);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.sectionHeader h2 {
  margin: 0.15rem 0 0;
  font-size: clamp(1.25rem, 3vw, 1.8rem);
  line-height: 1;
}

.grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.75rem;
}

.card {
  --mode-signal: var(--vz-esports-cyan);

  position: relative;
  display: grid;
  min-width: 0;
  gap: 0.9rem;
  padding: 0.95rem;
  overflow: hidden;
  border: 1px solid var(--vz-esports-line);
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--mode-signal) 7%, transparent), transparent 46%),
    var(--vz-esports-panel);
  clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
  transition:
    transform 150ms ease,
    border-color 150ms ease,
    background-color 150ms ease;
}

.card::before {
  position: absolute;
  top: 0;
  left: 0;
  width: 3.25rem;
  height: 2px;
  content: "";
  background: var(--mode-signal);
}

.card[data-game-mode-tone="violet"] {
  --mode-signal: var(--vz-esports-violet);
}

.card[data-game-mode-tone="gold"] {
  --mode-signal: var(--vz-esports-gold);
}

.card[data-game-mode-tone="pink"] {
  --mode-signal: var(--vz-esports-pink);
}

.card:hover {
  border-color: var(--mode-signal);
  transform: translateY(-2px);
}

.card:focus-within {
  border-color: var(--mode-signal);
}

.cardTopline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.glyph {
  display: grid;
  width: 2.65rem;
  height: 2.65rem;
  place-items: center;
  color: var(--mode-signal);
  border: 1px solid currentColor;
  background: rgb(10 10 20 / 72%);
  font-family: var(--vz-font-display);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.cardCopy > span,
.cardFacts dt {
  color: var(--vz-esports-muted);
  font-family: var(--vz-font-display);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.cardCopy h3 {
  margin: 0.15rem 0 0;
  font-size: 1.08rem;
  line-height: 1.05;
}

.cardFacts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
  margin: 0;
}

.cardFacts div {
  min-width: 0;
  padding-top: 0.55rem;
  border-top: 1px solid var(--vz-esports-line-soft);
}

.cardFacts dd {
  margin: 0.2rem 0 0;
  color: var(--vz-esports-text);
  font-family: var(--vz-font-numeric);
  font-size: 0.82rem;
}

.cardAction {
  display: inline-flex;
  min-height: 2.7rem;
  align-items: center;
  justify-content: center;
  padding: 0.65rem 0.8rem;
  color: var(--mode-signal);
  border: 1px solid currentColor;
  background: transparent;
  font-family: var(--vz-font-display);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-decoration: none;
  text-transform: uppercase;
}

.cardAction:hover {
  color: var(--vz-esports-void);
  background: var(--mode-signal);
}

@media (min-width: 40rem) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 70rem) {
  .grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 27rem) {
  .sectionHeader {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (prefers-reduced-motion: reduce) {
  .card {
    transition: none;
  }
}
CSS
}

write_header_styles() {
  cat > "$HEADER_CSS" <<'CSS'
.playHeader {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
  padding: 0.35rem 0;
}

.playHeaderCopy {
  min-width: 0;
}

.playHeaderCopy > span {
  color: var(--vz-esports-cyan);
  font-family: var(--vz-font-display);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.playHeaderCopy h1 {
  margin: 0.1rem 0 0;
  font-size: clamp(2.25rem, 7vw, 4.8rem);
  line-height: 0.86;
}

.playHeaderStatus {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  min-width: min(100%, 12rem);
  gap: 0.55rem;
  padding: 0.6rem 0.75rem;
  color: var(--vz-esports-cyan);
  border: 1px solid currentColor;
  background: rgb(18 16 31 / 78%);
}

.playHeaderStatus > i {
  width: 0.5rem;
  height: 0.5rem;
  background: currentColor;
  border-radius: 50%;
}

.playHeaderStatus[data-online="false"] {
  color: var(--vz-esports-muted);
}

.playHeaderStatus strong,
.playHeaderStatus small {
  display: block;
}

.playHeaderStatus strong {
  color: currentColor;
  font-family: var(--vz-font-display);
  font-size: 0.75rem;
  letter-spacing: 0.11em;
}

.playHeaderStatus small {
  margin-top: 0.1rem;
  color: var(--vz-esports-muted);
  font-size: 0.72rem;
}

@media (max-width: 38rem) {
  .playHeader {
    align-items: flex-start;
    flex-direction: column;
  }

  .playHeaderStatus {
    width: 100%;
  }
}
CSS
}

patch_layout_and_play() {
  node <<'NODE'
const fs = require("node:fs");

function insertAfterLastImport(source, importLine, file) {
  if (source.includes(importLine)) {
    return source;
  }

  const matches = [...source.matchAll(/^import\s+[^;]+;\s*$/gm)];

  if (matches.length === 0) {
    throw new Error(`Could not locate any import statement in ${file}.`);
  }

  const last = matches[matches.length - 1];
  const insertionIndex = last.index + last[0].length;

  return `${source.slice(0, insertionIndex)}\n${importLine}${source.slice(insertionIndex)}`;
}

function ensureLocalImport(source, importLine, anchorLine, file) {
  if (source.includes(importLine)) {
    return source;
  }

  if (source.includes(anchorLine)) {
    return source.replace(anchorLine, `${anchorLine}\n${importLine}`);
  }

  return insertAfterLastImport(source, importLine, file);
}

{
  const file = "src/app/layout.tsx";
  let source = fs.readFileSync(file, "utf8");
  const importLine = 'import "@/styles/verzus-esports-design-system.css";';

  // Remove an older copy first so the premium theme can be placed last.
  source = source.replace(
    /^import\s+["']@\/styles\/verzus-esports-design-system\.css["'];\s*\n?/gm,
    "",
  );

  const styleImports = [
    ...source.matchAll(/^import\s+["']@\/styles\/[^"']+\.css["'];\s*$/gm),
  ];

  if (styleImports.length > 0) {
    const last = styleImports[styleImports.length - 1];
    const insertionIndex = last.index + last[0].length;
    source = `${source.slice(0, insertionIndex)}\n${importLine}${source.slice(insertionIndex)}`;
  } else {
    source = insertAfterLastImport(source, importLine, file);
  }

  // The premium CSS is intentionally scoped to this theme name.
  if (/data-theme=["'][^"']+["']/.test(source)) {
    source = source.replace(
      /data-theme=["'][^"']+["']/,
      'data-theme="retro-competitive"',
    );
  } else {
    source = source.replace(
      /<html\s+lang=["']en["']>/,
      '<html lang="en" data-theme="retro-competitive">',
    );
  }

  fs.writeFileSync(file, source, "utf8");
}

{
  const file = "src/features/play/ui/PlayCommandCenter.tsx";
  let source = fs.readFileSync(file, "utf8");

  source = ensureLocalImport(
    source,
    'import { GameModeGrid } from "./GameModeGrid";',
    'import { CrewPulseWidget } from "./CrewPulseWidget";',
    file,
  );

  source = ensureLocalImport(
    source,
    'import premiumStyles from "./play-premium.module.css";',
    'import styles from "./play-command-center.module.css";',
    file,
  );

  const headerMarkup = `      <header className={premiumStyles.playHeader}>
        <div className={premiumStyles.playHeaderCopy}>
          <span>LIVE COMPETITIVE DASHBOARD</span>
          <h1>PLAY</h1>
        </div>
        <div className={premiumStyles.playHeaderStatus} data-online={viewModel.online}>
          <i aria-hidden="true" />
          <div>
            <strong>{viewModel.online ? "NETWORK LIVE" : "OFFLINE MODE"}</strong>
            <small>Choose a game, protect check-in, improve your weekly rank.</small>
          </div>
        </div>
      </header>

`;

  if (!source.includes("LIVE COMPETITIVE DASHBOARD")) {
    const toolbarPattern = /(\s*<ScenarioToolbar\s+active=\{viewModel\.variant\}\s*\/>\s*)/;

    if (!toolbarPattern.test(source)) {
      throw new Error(
        `Could not locate ScenarioToolbar insertion point in ${file}.`,
      );
    }

    source = source.replace(toolbarPattern, `$1\n${headerMarkup}`);
  }

  if (!source.includes("<GameModeGrid />")) {
    const mainMarker = '<main className={styles.lobbyGrid}>';

    if (!source.includes(mainMarker)) {
      throw new Error(`Could not locate lobbyGrid in ${file}.`);
    }

    source = source.replace(
      mainMarker,
      `      <GameModeGrid />\n\n      ${mainMarker}`,
    );
  }

  fs.writeFileSync(file, source, "utf8");
}

{
  const file = "src/features/play/ui/index.ts";
  let source = fs.readFileSync(file, "utf8");
  const exports = [
    'export { GameModeCard } from "./GameModeCard";',
    'export { GameModeGrid } from "./GameModeGrid";',
    'export { StatusChip } from "./StatusChip";',
  ];

  for (const line of exports) {
    if (!source.includes(line)) {
      source += `\n${line}`;
    }
  }

  fs.writeFileSync(file, `${source.trim()}\n`, "utf8");
}
NODE
}

patch_play_css() {
  node <<'NODE'
const fs = require("node:fs");

const file = "src/features/play/ui/play-command-center.module.css";
let source = fs.readFileSync(file, "utf8");

const start = "/* VERZUS PREMIUM_ESPORTS_PLAY START */";
const end = "/* VERZUS PREMIUM_ESPORTS_PLAY END */";
const block = `${start}
.playRoot {
  --play-green: var(--vz-esports-cyan);
  --play-green-bright: #62f2ff;
  --play-green-deep: #073843;
  --play-cyan: var(--vz-esports-cyan);
  --play-blue: var(--vz-esports-violet);
  --play-orange: var(--vz-esports-gold);
  --play-amber: var(--vz-esports-gold);
  --play-brown: #765b13;
  --play-red: var(--vz-esports-pink);
  --play-purple: var(--vz-esports-violet);
  --play-panel: rgb(18 16 31 / 97%);
  --play-panel-raised: rgb(24 21 42 / 98%);
  --play-border: rgb(127 90 240 / 56%);
  --play-border-muted: rgb(127 90 240 / 24%);

  color: var(--vz-esports-text);
  background:
    radial-gradient(circle at 18% 8%, rgb(0 229 255 / 6%), transparent 28rem),
    radial-gradient(circle at 82% 16%, rgb(127 90 240 / 8%), transparent 30rem),
    var(--vz-esports-void);
}

.playRoot::before {
  opacity: 0.18;
  background-image:
    linear-gradient(rgb(127 90 240 / 4%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(0 229 255 / 3%) 1px, transparent 1px);
  background-size: 36px 36px;
}

.playRoot::after {
  opacity: 0.04;
}

.statusStrip,
.liveRibbon,
.globalBanner,
.widget,
.playHero,
.matchCard,
.checkInControl,
.quickActionGrid a,
.opportunityCard {
  border-color: var(--play-border-muted);
  border-radius: 0;
  background-color: var(--vz-esports-panel);
  box-shadow: none;
}

.statusStrip,
.widget,
.playHero,
.matchCard,
.checkInControl,
.quickActionGrid a,
.opportunityCard {
  clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
}

.statusStrip::before,
.widget::before,
.playHero::before {
  background: var(--vz-esports-cyan);
  box-shadow: none;
}

.liveRibbon {
  color: var(--vz-esports-cyan);
  border-color: rgb(0 229 255 / 42%);
  background: rgb(18 16 31 / 92%);
}

.statusDot[data-online="true"] {
  background: var(--vz-esports-cyan);
  box-shadow: none;
}

.globalBanner {
  color: var(--vz-esports-gold);
  border-left-color: var(--vz-esports-gold);
}

.degradedBanner {
  color: var(--vz-esports-pink);
  border-left-color: var(--vz-esports-pink);
}

.widgetHeader > div > span,
.playerIdentity > div > span,
.matchTopline span,
.positionGrid span,
.opportunityBody > span {
  color: var(--vz-esports-muted);
}

.widgetHeader b,
.matchTopline b,
.stalePill {
  color: var(--vz-esports-cyan);
  border-color: currentColor;
  background: rgb(0 229 255 / 6%);
}

.matchCard {
  border-left: 3px solid var(--vz-esports-pink);
}

.matchTopline b,
.versus {
  color: var(--vz-esports-pink);
}

.playerFacts strong,
.positionGrid strong,
.matchMeta,
.competitor small,
.positionFooter span,
.opportunityFooter span {
  font-family: var(--vz-font-numeric);
  font-variant-numeric: tabular-nums lining-nums;
}

.primaryLink,
.checkInActionLink,
.checkInControl > button,
.heroActions a:first-child {
  color: var(--vz-esports-void);
  border-color: var(--vz-esports-cyan);
  background: var(--vz-esports-cyan);
  box-shadow: none;
}

.primaryLink:hover,
.checkInActionLink:hover,
.checkInControl > button:hover,
.heroActions a:first-child:hover {
  color: var(--vz-esports-void);
  border-color: #62f2ff;
  background: #62f2ff;
  transform: translateY(-1px);
}

.secondaryLink,
.heroActions a:nth-child(2) {
  color: var(--vz-esports-violet);
  border-color: var(--vz-esports-violet);
  background: transparent;
  box-shadow: none;
}

.secondaryLink:hover,
.heroActions a:nth-child(2):hover {
  color: var(--vz-esports-text);
  background: rgb(127 90 240 / 12%);
}

.progressTrack span {
  background: linear-gradient(90deg, var(--vz-esports-cyan), var(--vz-esports-green));
  box-shadow: none;
}

.quickActionGrid a {
  --action-accent: var(--vz-esports-violet);
}

.quickActionGrid a:nth-child(4n + 1) {
  --action-accent: var(--vz-esports-cyan);
  color: var(--vz-esports-cyan);
  border-color: rgb(0 229 255 / 46%);
}

.quickActionGrid a:nth-child(4n + 2) {
  --action-accent: var(--vz-esports-violet);
  color: var(--vz-esports-violet);
  border-color: rgb(127 90 240 / 46%);
}

.quickActionGrid a:nth-child(4n + 3) {
  --action-accent: var(--vz-esports-gold);
  color: var(--vz-esports-gold);
  border-color: rgb(255 196 0 / 46%);
}

.quickActionGrid a:nth-child(4n + 4) {
  --action-accent: var(--vz-esports-green);
  color: var(--vz-esports-green);
  border-color: rgb(57 255 20 / 42%);
}

.quickActionGrid a:hover,
.opportunityCard:hover {
  box-shadow: none;
  transform: translateY(-2px);
}

.opportunityCard[data-tone="green"] {
  --card-accent: var(--vz-esports-cyan);
}

.opportunityCard[data-tone="cyan"] {
  --card-accent: var(--vz-esports-cyan);
}

.opportunityCard[data-tone="orange"] {
  --card-accent: var(--vz-esports-gold);
}

.opportunityCard[data-tone="purple"] {
  --card-accent: var(--vz-esports-violet);
}

.opportunityCard[data-featured="true"] {
  border-color: rgb(255 196 0 / 56%);
}

.opportunityMeta b {
  color: var(--vz-esports-gold);
}

.competitorMark {
  color: var(--vz-esports-cyan);
  border-color: var(--vz-esports-cyan);
  background: rgb(0 229 255 / 8%);
  box-shadow: none;
}

.competitorMarkOpponent {
  color: var(--vz-esports-pink);
  border-color: var(--vz-esports-pink);
  background: rgb(255 62 165 / 8%);
}

@media (max-width: 30rem) {
  .playRoot {
    padding-inline: 0.75rem;
  }

  .widgetHeader h2 {
    font-size: 1.08rem;
  }

  .heroCopy,
  .matchMeta,
  .opportunityBody small,
  .positionFooter,
  .quickActionGrid small {
    font-size: 0.875rem;
  }
}
${end}`;

const pattern = new RegExp(`${start.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${end.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);

if (pattern.test(source)) {
  source = source.replace(pattern, block);
} else {
  source = `${source.trim()}\n\n${block}\n`;
}

fs.writeFileSync(file, source, "utf8");
console.log("Installed premium Play CSS override block.");
NODE
}

install_design() {
  print_plan
  echo
  require_repo
  backup_files

  write_theme
  write_status_chip
  write_game_modes
  write_header_styles
  patch_layout_and_play
  patch_play_css

  echo
  echo "Formatting edited files..."
  npx prettier \
    "$ROOT_LAYOUT" \
    "$PLAY_COMPONENT" \
    "$PLAY_INDEX" \
    "$PLAY_CSS" \
    "$THEME_FILE" \
    "$HEADER_CSS" \
    "$STATUS_COMPONENT" \
    "$STATUS_CSS" \
    "$MODE_CARD" \
    "$MODE_GRID" \
    "$MODE_CSS" \
    --write

  echo
  echo "Checking patch integrity..."
  if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    git diff --check -- \
      "$ROOT_LAYOUT" \
      "$PLAY_COMPONENT" \
      "$PLAY_INDEX" \
      "$PLAY_CSS" \
      "$THEME_FILE" \
      "$HEADER_CSS" \
      "$STATUS_COMPONENT" \
      "$STATUS_CSS" \
      "$MODE_CARD" \
      "$MODE_GRID" \
      "$MODE_CSS"
  else
    echo "Git work tree not detected; diff check skipped."
  fi

  echo
  echo "Premium esports Play design installed."
  echo "Rollback backup:"
  echo "  $BACKUP_DIR"
}

verify_design() {
  require_repo

  for file in "$THEME_FILE" "$HEADER_CSS" "$STATUS_COMPONENT" "$STATUS_CSS" "$MODE_CARD" "$MODE_GRID" "$MODE_CSS"; do
    if [[ ! -f "$file" ]]; then
      echo "Error: expected installed file not found: $file"
      exit 1
    fi
  done

  node <<'NODE'
const fs = require("node:fs");

const checks = [
  ["src/styles/verzus-esports-design-system.css", "--vz-esports-void: #0a0a14;"],
  ["src/styles/verzus-esports-design-system.css", "--vz-esports-cyan: #00e5ff;"],
  ["src/styles/verzus-esports-design-system.css", "--vz-esports-pink: #ff3ea5;"],
  ["src/styles/verzus-esports-design-system.css", "--vz-esports-gold: #ffc400;"],
  ["src/styles/verzus-esports-design-system.css", "--vz-esports-green: #39ff14;"],
  ["src/features/play/ui/PlayCommandCenter.tsx", "<GameModeGrid />"],
  ["src/features/play/ui/PlayCommandCenter.tsx", "LIVE COMPETITIVE DASHBOARD"],
  ["src/features/play/ui/play-command-center.module.css", "VERZUS PREMIUM_ESPORTS_PLAY START"],
];

const missing = checks.filter(([file, marker]) => !fs.readFileSync(file, "utf8").includes(marker));

if (missing.length > 0) {
  throw new Error(`Missing installation markers: ${missing.map(([file, marker]) => `${file}: ${marker}`).join(", ")}`);
}

console.log("Premium esports design markers are installed.");
NODE

  echo
  echo "Running focused ESLint only..."
  npx eslint \
    "$ROOT_LAYOUT" \
    "$PLAY_COMPONENT" \
    "$PLAY_INDEX" \
    "$STATUS_COMPONENT" \
    "$MODE_CARD" \
    "$MODE_GRID" \
    --max-warnings=0

  echo
  echo "Running Play UI tests only..."
  npm run test:m5:ui

  echo
  echo "Running TypeScript verification..."
  npm run typecheck

  echo
  echo "Focused verification passed."
  echo "The full repository test suite was intentionally not run."
}

preview_design() {
  require_repo
  echo "Starting VERZUS Play preview on http://127.0.0.1:${PREVIEW_PORT}/play?scenario=normal"
  npm run m5:play
}

rollback_design() {
  require_repo

  local latest
  latest="$(find "$BACKUP_ROOT" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | sort | tail -n 1)"

  if [[ -z "$latest" ]]; then
    echo "Error: no premium esports Play backup was found."
    exit 1
  fi

  echo "Restoring from:"
  echo "  $latest"

  cp "$latest/src/app/layout.tsx" "$ROOT_LAYOUT"
  cp "$latest/src/features/play/ui/PlayCommandCenter.tsx" "$PLAY_COMPONENT"
  cp "$latest/src/features/play/ui/index.ts" "$PLAY_INDEX"
  cp "$latest/src/features/play/ui/play-command-center.module.css" "$PLAY_CSS"

  for file in "$THEME_FILE" "$HEADER_CSS" "$STATUS_COMPONENT" "$STATUS_CSS" "$MODE_CARD" "$MODE_GRID" "$MODE_CSS"; do
    if [[ -f "$latest/$file" ]]; then
      mkdir -p "$(dirname "$file")"
      cp "$latest/$file" "$file"
    else
      rm -f "$file"
    fi
  done

  npx prettier "$ROOT_LAYOUT" "$PLAY_COMPONENT" "$PLAY_INDEX" "$PLAY_CSS" --write

  echo "Premium esports Play design rolled back."
}

case "$MODE" in
  install)
    install_design
    ;;
  verify)
    verify_design
    ;;
  preview)
    preview_design
    ;;
  rollback)
    rollback_design
    ;;
  all)
    install_design
    verify_design
    ;;
  *)
    echo "Unknown mode: $MODE"
    echo
    echo "Valid modes:"
    echo "  install   Apply the visual system and Play screen presentation"
    echo "  verify    Run focused lint, Play UI tests and TypeScript"
    echo "  preview   Start the Play preview server"
    echo "  rollback  Restore the latest backup"
    echo "  all       Install and run focused verification"
    exit 1
    ;;
esac

echo
echo "Completed mode: ${MODE}"
