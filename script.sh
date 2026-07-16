#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-install}"
PORT="${VERZUS_STAGE5_PORT:-3113}"

BACKUP_ROOT=".verzus-backups/stage-5-platform"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$BACKUP_ROOT/$STAMP"
ARCHIVE="$BACKUP_DIR/verzus-stage-5-before.tar.gz"
CREATED_MANIFEST="$BACKUP_DIR/created-files.txt"

TARGET_FILES=(
  "package.json"
  "src/app/global-error.tsx"
  "src/app/error.tsx"
  "src/app/loading.tsx"
  "src/app/not-found.tsx"
  "src/app/(platform)/profile/page.tsx"
  "src/app/(platform)/notifications/page.tsx"
  "src/app/(platform)/search/page.tsx"
  "src/app/(platform)/settings/page.tsx"
  "src/app/design-system/page.tsx"
  "src/app/design-system/page.module.css"
  "src/app/token-preview/page.tsx"
  "src/app/token-preview/page.module.css"
  "src/features/auth/ui/AuthScreens.module.css"
  "src/features/auth/forms/AuthForms.module.css"
  "src/features/onboarding/ui/onboarding-experience.module.css"
  "src/components/layout/route-boundary/RouteBoundary.module.css"
  "src/components/layout/widget-boundary/WidgetBoundary.module.css"
  "scripts/verify-retro-ui.mjs"
  "scripts/verify-reference-ui.mjs"
  "src/components/layout/operational-screen/OperationalScreen.tsx"
  "src/components/layout/operational-screen/OperationalScreen.module.css"
  "src/components/layout/operational-screen/index.ts"
  "src/components/layout/system-state/SystemStateScreen.tsx"
  "src/components/layout/system-state/SystemStateScreen.module.css"
  "src/components/layout/system-state/index.ts"
  "src/features/profiles/ui/ProfileScreen.tsx"
  "src/features/profiles/ui/ProfileScreen.module.css"
  "src/features/profiles/ui/ProfileScreen.test.tsx"
  "src/features/profiles/ui/index.ts"
  "src/features/notifications/ui/NotificationsScreen.tsx"
  "src/features/notifications/ui/NotificationsScreen.module.css"
  "src/features/notifications/ui/NotificationsScreen.test.tsx"
  "src/features/notifications/ui/index.ts"
  "src/features/search/ui/SearchScreen.tsx"
  "src/features/search/ui/SearchScreen.module.css"
  "src/features/search/ui/SearchScreen.test.tsx"
  "src/features/search/ui/index.ts"
  "src/features/settings/ui/SettingsScreen.tsx"
  "src/features/settings/ui/SettingsScreen.module.css"
  "src/features/settings/ui/SettingsScreen.test.tsx"
  "src/features/settings/ui/index.ts"
  "docs/design-system/stage-5-platform-contract.md"
  "docs/design-system/legacy-theme-retirement.md"
  "docs/runbooks/ui-rollback.md"
  "scripts/verify-stage-5-platform.mjs"
)

print_plan() {
  cat <<'EOF'
VERZUS - Stage 5 Platform Completion

KEEP
  - All routes, APIs, schemas, adapters, mocks, queries, and view models
  - Authentication and onboarding behavior
  - Play, Leaderboards, Crews, Matches, Compete, and Rewards from Stages 3 and 4
  - Stage 1 canonical tokens and Stage 2 shared component APIs
  - Existing route and widget failure isolation

REUSE
  - Rajdhani display typography and Inter body typography
  - AppShell, PageContainer, shared primitives, and route boundaries
  - Existing auth forms and onboarding state machine
  - Existing design-system gallery components

REPLACE
  - Remaining placeholder screens: Profile, Notifications, Search, and Settings
  - Root loading, error, not-found, and global-error presentation
  - Auth and onboarding visual overrides with canonical Stage 1 tokens
  - Token preview values and legacy verifier expectations
  - Obsolete visual verifier logic that expected retired theme imports

DELETE
  - No route
  - No domain logic
  - No API contract
  - No test from earlier milestones
  - No historical theme file

CREATE
  - Domain-owned UI for Profile, Notifications, Search, and Settings
  - Domain-neutral operational screen and system-state layouts
  - Stage 5 focused tests and verification script
  - Final design contract, legacy-theme retirement note, and rollback runbook
  - Timestamped rollback archive
EOF
}

require_repo() {
  local required=(
    "package.json"
    "src/app/layout.tsx"
    "src/styles/tokens.css"
    "src/styles/verzus-visual-system.css"
    "scripts/verify-visual-foundation.mjs"
    "scripts/verify-stage-2-shared-ui.mjs"
    "scripts/verify-stage-3-play.mjs"
    "scripts/verify-stage-4-competitive.mjs"
  )

  local missing=0
  for file in "${required[@]}"; do
    if [[ ! -f "$file" ]]; then
      echo "Missing prerequisite: $file"
      missing=1
    fi
  done

  if [[ "$missing" -ne 0 ]]; then
    echo
    echo "Stage 5 requires Stages 1, 2, 3, and 4 to be installed first."
    echo "Run this script from the VERZUS repository root."
    exit 1
  fi
}

create_backup() {
  mkdir -p "$BACKUP_DIR"
  : > "$CREATED_MANIFEST"

  local existing=()
  for file in "${TARGET_FILES[@]}"; do
    if [[ -e "$file" ]]; then
      existing+=("$file")
    else
      printf '%s\n' "$file" >> "$CREATED_MANIFEST"
    fi
  done

  if [[ "${#existing[@]}" -gt 0 ]]; then
    tar -czf "$ARCHIVE" "${existing[@]}"
  else
    tar -czf "$ARCHIVE" --files-from /dev/null
  fi

  cat > "$BACKUP_DIR/manifest.txt" <<EOF
VERZUS Stage 5 backup
Created: $(date -Iseconds)
Archive: $ARCHIVE
Mode: $MODE
EOF

  echo "Rollback archive created:"
  echo "  $ARCHIVE"
}

append_or_replace_block() {
  local file="$1"
  local begin="$2"
  local end="$3"
  local block_file="$4"

  node - "$file" "$begin" "$end" "$block_file" <<'NODE'
const fs = require("node:fs");

const [file, begin, end, blockFile] = process.argv.slice(2);
let source = fs.readFileSync(file, "utf8");
const block = fs.readFileSync(blockFile, "utf8").trimEnd();

const start = source.indexOf(begin);
const finish = source.indexOf(end);

if ((start === -1) !== (finish === -1)) {
  throw new Error(`Malformed marker block in ${file}.`);
}

if (start !== -1) {
  const after = finish + end.length;
  source =
    source.slice(0, start).trimEnd() +
    "\n\n" +
    block +
    "\n" +
    source.slice(after).trimStart();
} else {
  source = source.trimEnd() + "\n\n" + block + "\n";
}

fs.writeFileSync(file, source, "utf8");
NODE
}

write_operational_screen() {
  mkdir -p "src/components/layout/operational-screen"

  cat > "src/components/layout/operational-screen/OperationalScreen.tsx" <<'EOF'
import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";

import { PageContainer } from "@/components/layout/app-shell";

import styles from "./OperationalScreen.module.css";

export type OperationalTone =
  | "neutral"
  | "green"
  | "cyan"
  | "gold"
  | "magenta"
  | "red"
  | "violet";

type OperationalPageProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

type OperationalHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  status?: ReactNode;
  actions?: ReactNode;
};

type OperationalPanelProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  title: string;
  eyebrow?: string;
  description?: string;
  tone?: OperationalTone;
  action?: ReactNode;
};

type OperationalGridProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  columns?: 1 | 2 | 3;
};

type MetricCardProps = {
  label: string;
  value: string;
  detail?: string;
  tone?: OperationalTone;
};

type SignalItemProps = {
  title: string;
  description: string;
  meta?: string;
  tone?: OperationalTone;
  leading?: ReactNode;
  trailing?: ReactNode;
};

type ProgressMeterProps = {
  label: string;
  value: number;
  max: number;
  detail: string;
  tone?: OperationalTone;
};

type OperationalActionLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

function joinClassNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function OperationalPage({ children, className, ...props }: OperationalPageProps) {
  return (
    <PageContainer width="wide">
      <div {...props} className={joinClassNames(styles.page, className)}>
        {children}
      </div>
    </PageContainer>
  );
}

export function OperationalHeader({
  eyebrow,
  title,
  description,
  status,
  actions,
}: OperationalHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerCopy}>
        <div className={styles.headerSignalRow}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          {status ? <div className={styles.headerStatus}>{status}</div> : null}
        </div>
        <h1>{title}</h1>
        <p className={styles.description}>{description}</p>
      </div>
      {actions ? <div className={styles.headerActions}>{actions}</div> : null}
    </header>
  );
}

export function OperationalPanel({
  children,
  title,
  eyebrow,
  description,
  tone = "neutral",
  action,
  className,
  ...props
}: OperationalPanelProps) {
  return (
    <section
      {...props}
      className={joinClassNames(styles.panel, className)}
      data-tone={tone}
    >
      <header className={styles.panelHeader}>
        <div>
          {eyebrow ? <p className={styles.panelEyebrow}>{eyebrow}</p> : null}
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {action ? <div className={styles.panelAction}>{action}</div> : null}
      </header>
      <div className={styles.panelBody}>{children}</div>
    </section>
  );
}

export function OperationalGrid({
  children,
  columns = 2,
  className,
  ...props
}: OperationalGridProps) {
  return (
    <div
      {...props}
      className={joinClassNames(styles.grid, className)}
      data-columns={columns}
    >
      {children}
    </div>
  );
}

export function MetricGrid({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={joinClassNames(styles.metricGrid, className)}>
      {children}
    </div>
  );
}

export function MetricCard({ label, value, detail, tone = "neutral" }: MetricCardProps) {
  return (
    <article className={styles.metricCard} data-tone={tone}>
      <span>{label}</span>
      <strong data-numeric>{value}</strong>
      {detail ? <small>{detail}</small> : null}
    </article>
  );
}

export function SignalList({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLUListElement>) {
  return (
    <ul {...props} className={joinClassNames(styles.signalList, className)}>
      {children}
    </ul>
  );
}

export function SignalItem({
  title,
  description,
  meta,
  tone = "neutral",
  leading,
  trailing,
}: SignalItemProps) {
  return (
    <li className={styles.signalItem} data-tone={tone}>
      {leading ? <div className={styles.signalLeading}>{leading}</div> : null}
      <div className={styles.signalCopy}>
        <div className={styles.signalTitleRow}>
          <strong>{title}</strong>
          {meta ? <span>{meta}</span> : null}
        </div>
        <p>{description}</p>
      </div>
      {trailing ? <div className={styles.signalTrailing}>{trailing}</div> : null}
    </li>
  );
}

export function ProgressMeter({
  label,
  value,
  max,
  detail,
  tone = "green",
}: ProgressMeterProps) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className={styles.progressMeter} data-tone={tone}>
      <div className={styles.progressLabelRow}>
        <span>{label}</span>
        <strong data-numeric>{detail}</strong>
      </div>
      <div
        aria-label={`${label}: ${detail}`}
        aria-valuemax={max}
        aria-valuemin={0}
        aria-valuenow={value}
        className={styles.progressTrack}
        role="progressbar"
      >
        <span style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

export function OperationalActionLink({
  href,
  children,
  variant = "primary",
}: OperationalActionLinkProps) {
  return (
    <Link className={styles.actionLink} data-variant={variant} href={href}>
      {children}
    </Link>
  );
}
EOF

  cat > "src/components/layout/operational-screen/OperationalScreen.module.css" <<'EOF'
.page {
  display: grid;
  gap: var(--vz-space-5);
  padding-block: clamp(var(--vz-space-4), 4vw, var(--vz-space-10));
  padding-bottom: calc(var(--vz-mobile-nav-height) + var(--vz-space-8));
}

.header {
  position: relative;
  display: grid;
  gap: var(--vz-space-5);
  padding: clamp(var(--vz-space-5), 4vw, var(--vz-space-10));
  overflow: hidden;
  border: 1px solid var(--vz-color-border-subtle);
  border-radius: var(--vz-radius-lg);
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--vz-color-accent-cyan) 7%, transparent), transparent 38%),
    var(--vz-color-surface-base);
  box-shadow: var(--vz-shadow-panel);
}

.header::after {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: "";
  background-image: repeating-linear-gradient(
    0deg,
    transparent 0,
    transparent 5px,
    rgb(255 255 255 / 1.2%) 6px
  );
}

.headerCopy,
.headerActions {
  position: relative;
  z-index: 1;
}

.headerCopy {
  display: grid;
  gap: var(--vz-space-3);
  min-width: 0;
}

.headerSignalRow,
.headerActions,
.panelHeader,
.signalTitleRow,
.progressLabelRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--vz-space-3);
}

.eyebrow,
.panelEyebrow {
  margin: 0;
  color: var(--vz-color-accent-cyan);
  font-family: var(--vz-font-interface);
  font-size: var(--vz-text-xs);
  font-weight: var(--vz-font-weight-bold);
  letter-spacing: var(--vz-tracking-label);
  text-transform: uppercase;
}

.header h1 {
  max-width: 14ch;
  margin: 0;
  font-size: clamp(2.35rem, 8vw, 5.5rem);
}

.description {
  max-width: 66ch;
  margin: 0;
  color: var(--vz-color-text-secondary);
  font-size: clamp(1rem, 2vw, 1.125rem);
}

.headerActions {
  flex-wrap: wrap;
  justify-content: flex-start;
}

.headerStatus {
  flex: 0 0 auto;
}

.grid {
  display: grid;
  gap: var(--vz-space-4);
  min-width: 0;
}

.grid[data-columns="2"],
.grid[data-columns="3"] {
  grid-template-columns: minmax(0, 1fr);
}

.panel {
  --panel-signal: var(--vz-color-border-default);

  position: relative;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--vz-color-border-subtle);
  border-radius: var(--vz-radius-panel);
  background: var(--vz-color-surface-base);
  box-shadow: var(--vz-shadow-panel);
}

.panel::before {
  position: absolute;
  inset-block: var(--vz-space-3);
  left: 0;
  width: 2px;
  content: "";
  background: var(--panel-signal);
}

.panel[data-tone="green"] {
  --panel-signal: var(--vz-color-accent-green);
}

.panel[data-tone="cyan"] {
  --panel-signal: var(--vz-color-accent-cyan);
}

.panel[data-tone="gold"] {
  --panel-signal: var(--vz-color-rank-gold);
}

.panel[data-tone="magenta"] {
  --panel-signal: var(--vz-color-status-magenta);
}

.panel[data-tone="red"] {
  --panel-signal: var(--vz-color-status-danger);
}

.panel[data-tone="violet"] {
  --panel-signal: var(--vz-color-special, var(--vz-color-accent-cyan));
}

.panelHeader {
  align-items: flex-start;
  padding: var(--vz-space-5);
  border-bottom: 1px solid var(--vz-color-border-subtle);
}

.panelHeader > div:first-child {
  display: grid;
  gap: var(--vz-space-2);
  min-width: 0;
}

.panelHeader h2 {
  margin: 0;
  font-size: clamp(1.25rem, 3vw, 1.75rem);
}

.panelHeader p:not(.panelEyebrow) {
  max-width: 58ch;
  margin: 0;
  color: var(--vz-color-text-secondary);
}

.panelAction {
  flex: 0 0 auto;
}

.panelBody {
  min-width: 0;
  padding: var(--vz-space-5);
}

.metricGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--vz-space-3);
}

.metricCard {
  --metric-signal: var(--vz-color-text-primary);

  display: grid;
  gap: var(--vz-space-1);
  min-width: 0;
  padding: var(--vz-space-4);
  border: 1px solid var(--vz-color-border-subtle);
  border-radius: var(--vz-radius-md);
  background: color-mix(in srgb, var(--vz-color-surface-elevated) 82%, transparent);
}

.metricCard[data-tone="green"] {
  --metric-signal: var(--vz-color-accent-green);
}

.metricCard[data-tone="cyan"] {
  --metric-signal: var(--vz-color-accent-cyan);
}

.metricCard[data-tone="gold"] {
  --metric-signal: var(--vz-color-rank-gold);
}

.metricCard[data-tone="magenta"] {
  --metric-signal: var(--vz-color-status-magenta);
}

.metricCard[data-tone="red"] {
  --metric-signal: var(--vz-color-status-danger);
}

.metricCard span,
.metricCard small {
  color: var(--vz-color-text-secondary);
}

.metricCard span {
  font-family: var(--vz-font-interface);
  font-size: var(--vz-text-xs);
  font-weight: var(--vz-font-weight-semibold);
  letter-spacing: var(--vz-tracking-ui);
  text-transform: uppercase;
}

.metricCard strong {
  min-width: 0;
  overflow-wrap: anywhere;
  color: var(--metric-signal);
  font-family: var(--vz-font-numeric);
  font-size: clamp(1.45rem, 5vw, 2.25rem);
  line-height: 1;
}

.metricCard small {
  font-size: var(--vz-text-xs);
}

.signalList {
  display: grid;
  gap: var(--vz-space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.signalItem {
  --signal: var(--vz-color-border-default);

  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: var(--vz-space-3);
  align-items: center;
  min-width: 0;
  padding: var(--vz-space-4);
  border: 1px solid var(--vz-color-border-subtle);
  border-left-color: var(--signal);
  border-radius: var(--vz-radius-md);
  background: color-mix(in srgb, var(--vz-color-surface-elevated) 70%, transparent);
}

.signalItem[data-tone="green"] {
  --signal: var(--vz-color-accent-green);
}

.signalItem[data-tone="cyan"] {
  --signal: var(--vz-color-accent-cyan);
}

.signalItem[data-tone="gold"] {
  --signal: var(--vz-color-rank-gold);
}

.signalItem[data-tone="magenta"] {
  --signal: var(--vz-color-status-magenta);
}

.signalItem[data-tone="red"] {
  --signal: var(--vz-color-status-danger);
}

.signalItem[data-tone="violet"] {
  --signal: var(--vz-color-special, var(--vz-color-accent-cyan));
}

.signalLeading,
.signalTrailing {
  color: var(--signal);
}

.signalCopy {
  display: grid;
  gap: var(--vz-space-1);
  min-width: 0;
}

.signalTitleRow {
  align-items: baseline;
}

.signalTitleRow strong {
  min-width: 0;
  overflow-wrap: anywhere;
  color: var(--vz-color-text-primary);
  font-family: var(--vz-font-interface);
  letter-spacing: var(--vz-tracking-ui);
  text-transform: uppercase;
}

.signalTitleRow span {
  flex: 0 0 auto;
  color: var(--signal);
  font-family: var(--vz-font-numeric);
  font-size: var(--vz-text-xs);
}

.signalCopy p {
  margin: 0;
  color: var(--vz-color-text-secondary);
  font-size: var(--vz-text-sm);
}

.progressMeter {
  --progress-signal: var(--vz-color-accent-green);

  display: grid;
  gap: var(--vz-space-2);
}

.progressMeter[data-tone="cyan"] {
  --progress-signal: var(--vz-color-accent-cyan);
}

.progressMeter[data-tone="gold"] {
  --progress-signal: var(--vz-color-rank-gold);
}

.progressMeter[data-tone="magenta"] {
  --progress-signal: var(--vz-color-status-magenta);
}

.progressLabelRow span {
  color: var(--vz-color-text-secondary);
  font-family: var(--vz-font-interface);
  font-size: var(--vz-text-xs);
  letter-spacing: var(--vz-tracking-ui);
  text-transform: uppercase;
}

.progressLabelRow strong {
  color: var(--progress-signal);
  font-family: var(--vz-font-numeric);
}

.progressTrack {
  height: 0.45rem;
  overflow: hidden;
  border: 1px solid var(--vz-color-border-subtle);
  background: var(--vz-color-bg-deep);
}

.progressTrack span {
  display: block;
  height: 100%;
  background: var(--progress-signal);
}

.actionLink {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  padding: var(--vz-space-3) var(--vz-space-4);
  border: 1px solid transparent;
  color: var(--vz-color-text-on-accent);
  font-family: var(--vz-font-interface);
  font-weight: var(--vz-font-weight-bold);
  letter-spacing: var(--vz-tracking-ui);
  text-decoration: none;
  text-transform: uppercase;
  clip-path: var(--vz-clip-button);
}

.actionLink[data-variant="primary"] {
  border-color: var(--vz-color-accent-green);
  background: var(--vz-color-accent-green);
}

.actionLink[data-variant="secondary"] {
  border-color: var(--vz-color-accent-cyan);
  background: transparent;
  color: var(--vz-color-accent-cyan);
}

.actionLink[data-variant="ghost"] {
  border-color: var(--vz-color-border-default);
  background: transparent;
  color: var(--vz-color-text-primary);
}

.actionLink:focus-visible {
  outline: 2px solid var(--vz-color-accent-cyan);
  outline-offset: 3px;
}

@media (min-width: 48rem) {
  .header {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: end;
  }

  .headerActions {
    justify-content: flex-end;
  }

  .grid[data-columns="2"] {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .grid[data-columns="3"] {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .metricGrid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 30rem) {
  .headerSignalRow,
  .panelHeader,
  .signalTitleRow {
    align-items: flex-start;
    flex-direction: column;
  }

  .signalItem {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .signalTrailing {
    grid-column: 2;
  }
}
EOF

  cat > "src/components/layout/operational-screen/index.ts" <<'EOF'
export * from "./OperationalScreen";
EOF
}

write_system_state() {
  mkdir -p "src/components/layout/system-state"

  cat > "src/components/layout/system-state/SystemStateScreen.tsx" <<'EOF'
import type { ReactNode } from "react";

import styles from "./SystemStateScreen.module.css";

type SystemStateTone = "loading" | "error" | "not-found" | "maintenance";

type SystemStateScreenProps = {
  eyebrow: string;
  title: string;
  description: string;
  tone: SystemStateTone;
  action?: ReactNode;
  reference?: string;
};

export function SystemStateScreen({
  eyebrow,
  title,
  description,
  tone,
  action,
  reference,
}: SystemStateScreenProps) {
  return (
    <main className={styles.page} data-tone={tone}>
      <section className={styles.card}>
        <div aria-hidden="true" className={styles.signal} />
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1>{title}</h1>
        <p className={styles.description}>{description}</p>
        {reference ? <p className={styles.reference}>Reference: {reference}</p> : null}
        {tone === "loading" ? (
          <div aria-hidden="true" className={styles.loadingBars}>
            <span />
            <span />
            <span />
          </div>
        ) : null}
        {action ? <div className={styles.action}>{action}</div> : null}
      </section>
    </main>
  );
}
EOF

  cat > "src/components/layout/system-state/SystemStateScreen.module.css" <<'EOF'
.page {
  --state-signal: var(--vz-color-accent-cyan);

  display: grid;
  min-height: 100svh;
  place-items: center;
  padding: var(--vz-space-5);
  background:
    radial-gradient(
      circle at 50% 0%,
      color-mix(in srgb, var(--state-signal) 8%, transparent),
      transparent 32rem
    ),
    var(--vz-color-bg-deep);
}

.page[data-tone="error"] {
  --state-signal: var(--vz-color-status-danger);
}

.page[data-tone="not-found"] {
  --state-signal: var(--vz-color-rank-gold);
}

.page[data-tone="maintenance"] {
  --state-signal: var(--vz-color-status-magenta);
}

.card {
  position: relative;
  display: grid;
  width: min(100%, 38rem);
  gap: var(--vz-space-4);
  padding: clamp(var(--vz-space-6), 7vw, var(--vz-space-12));
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--state-signal) 46%, transparent);
  border-radius: var(--vz-radius-lg);
  background: var(--vz-color-surface-base);
  box-shadow: var(--vz-shadow-panel);
}

.signal {
  position: absolute;
  inset-block: var(--vz-space-4);
  left: 0;
  width: 3px;
  background: var(--state-signal);
}

.eyebrow,
.reference {
  margin: 0;
  font-family: var(--vz-font-interface);
  font-size: var(--vz-text-xs);
  font-weight: var(--vz-font-weight-bold);
  letter-spacing: var(--vz-tracking-label);
  text-transform: uppercase;
}

.eyebrow {
  color: var(--state-signal);
}

.card h1 {
  margin: 0;
  font-size: clamp(2rem, 8vw, 4rem);
}

.description,
.reference {
  color: var(--vz-color-text-secondary);
}

.description {
  max-width: 54ch;
  margin: 0;
}

.action {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vz-space-3);
}

.action :is(button, a) {
  min-height: 2.75rem;
  padding: var(--vz-space-3) var(--vz-space-5);
  border: 1px solid var(--state-signal);
  background: var(--state-signal);
  color: var(--vz-color-text-on-accent);
  font-family: var(--vz-font-interface);
  font-weight: var(--vz-font-weight-bold);
  letter-spacing: var(--vz-tracking-ui);
  text-decoration: none;
  text-transform: uppercase;
  clip-path: var(--vz-clip-button);
}

.action :is(button, a):focus-visible {
  outline: 2px solid var(--vz-color-accent-cyan);
  outline-offset: 3px;
}

.loadingBars {
  display: grid;
  gap: var(--vz-space-2);
}

.loadingBars span {
  height: 0.6rem;
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in srgb, var(--state-signal) 48%, transparent),
    transparent
  );
  background-size: 200% 100%;
  animation: system-state-scan 1.25s linear infinite;
}

.loadingBars span:nth-child(2) {
  width: 78%;
}

.loadingBars span:nth-child(3) {
  width: 56%;
}

@keyframes system-state-scan {
  from {
    background-position: 200% 0;
  }

  to {
    background-position: -200% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .loadingBars span {
    animation: none;
    background: color-mix(in srgb, var(--state-signal) 30%, transparent);
  }
}
EOF

  cat > "src/components/layout/system-state/index.ts" <<'EOF'
export * from "./SystemStateScreen";
EOF
}

write_profile_screen() {
  mkdir -p "src/features/profiles/ui"

  cat > "src/features/profiles/ui/ProfileScreen.tsx" <<'EOF'
import { Badge } from "@/components/primitives/badge";
import { Avatar } from "@/components/primitives/avatar";
import {
  MetricCard,
  MetricGrid,
  OperationalActionLink,
  OperationalGrid,
  OperationalHeader,
  OperationalPage,
  OperationalPanel,
  ProgressMeter,
  SignalItem,
  SignalList,
} from "@/components/layout/operational-screen";

import styles from "./ProfileScreen.module.css";

const games = [
  ["EA FC", "Division 2", "18-5", "green"],
  ["COD Mobile", "Master III", "12-8", "cyan"],
  ["Clash Royale", "7,240 trophies", "21-11", "gold"],
  ["League", "Gold I", "9-7", "violet"],
] as const;

export function ProfileScreen() {
  return (
    <OperationalPage>
      <OperationalHeader
        actions={
          <>
            <OperationalActionLink href="/settings">Edit profile</OperationalActionLink>
            <OperationalActionLink href="/leaderboards/weekly" variant="secondary">
              View rankings
            </OperationalActionLink>
          </>
        }
        description="Competitive identity, game form, Crew membership, trust, and account readiness."
        eyebrow="08.1 // PLAYER IDENTITY"
        status={<Badge tone="positive">Verified</Badge>}
        title="JAYFLEX"
      />

      <section className={styles.identityCard}>
        <Avatar name="Jay Flex" presence="online" size="xl" tone="cyan" verified />
        <div className={styles.identityCopy}>
          <div className={styles.badges}>
            <Badge tone="positive">Elite</Badge>
            <Badge tone="information" variant="outline">
              Lagos
            </Badge>
            <Badge tone="special">Mainland Titans</Badge>
          </div>
          <h2>JAY FLEX</h2>
          <p>@jayflex / Captain-ready flex player / War Day available</p>
        </div>
        <div className={styles.rankBlock}>
          <span>Season rank</span>
          <strong data-rank>#04</strong>
          <small>Up 3 this week</small>
        </div>
      </section>

      <MetricGrid>
        <MetricCard detail="competitive score" label="VS Points" tone="green" value="2,310" />
        <MetricCard detail="verified account" label="Trust" tone="cyan" value="96" />
        <MetricCard detail="all games" label="Record" tone="gold" value="60-31" />
        <MetricCard detail="current season" label="Win rate" tone="magenta" value="65.9%" />
      </MetricGrid>

      <OperationalGrid columns={2}>
        <OperationalPanel
          description="Current competitive form across the four supported lanes."
          eyebrow="Primary games"
          title="Game card"
          tone="green"
        >
          <SignalList>
            {games.map(([title, description, meta, tone]) => (
              <SignalItem
                description={description}
                key={title}
                meta={meta}
                title={title}
                tone={tone}
              />
            ))}
          </SignalList>
        </OperationalPanel>

        <OperationalPanel
          description="Account and competition eligibility signals."
          eyebrow="Readiness"
          title="Player license"
          tone="cyan"
        >
          <div className={styles.progressStack}>
            <ProgressMeter detail="96 / 100" label="Trust score" max={100} value={96} />
            <ProgressMeter detail="4 / 4" label="Game lanes" max={4} tone="cyan" value={4} />
            <ProgressMeter detail="5 / 6" label="Profile readiness" max={6} tone="gold" value={5} />
          </div>
          <SignalList>
            <SignalItem
              description="Email, phone, and player identity confirmed."
              meta="READY"
              title="Identity verification"
              tone="green"
            />
            <SignalItem
              description="Saturday 18:00-23:00 WAT is marked available."
              meta="WAR DAY"
              title="Availability"
              tone="magenta"
            />
          </SignalList>
        </OperationalPanel>
      </OperationalGrid>

      <OperationalGrid columns={2}>
        <OperationalPanel
          action={
            <OperationalActionLink href="/crews" variant="secondary">
              Crew HQ
            </OperationalActionLink>
          }
          description="Current club identity and weekly contribution."
          eyebrow="Crew"
          title="Mainland Titans"
          tone="magenta"
        >
          <SignalList>
            <SignalItem
              description="Crew championship position"
              meta="#02"
              title="Season standing"
              tone="gold"
            />
            <SignalItem
              description="Points contributed across three game lanes"
              meta="420 PTS"
              title="Weekly contribution"
              tone="green"
            />
            <SignalItem
              description="EA FC lane check-in opens Friday at 20:00 WAT"
              meta="SCHEDULED"
              title="Next Crew duty"
              tone="cyan"
            />
          </SignalList>
        </OperationalPanel>

        <OperationalPanel
          description="Latest verified results."
          eyebrow="Recent form"
          title="Match record"
          tone="gold"
        >
          <div className={styles.formRow} aria-label="Recent form: win, win, loss, win, win">
            <span data-result="win">W</span>
            <span data-result="win">W</span>
            <span data-result="loss">L</span>
            <span data-result="win">W</span>
            <span data-result="win">W</span>
          </div>
          <SignalList>
            <SignalItem
              description="EA FC / 3-1 / Verified"
              meta="2H"
              title="vs Island Elites"
              tone="green"
            />
            <SignalItem
              description="COD Mobile / 1-3 / Verified"
              meta="1D"
              title="vs Shadow Unit"
              tone="red"
            />
          </SignalList>
        </OperationalPanel>
      </OperationalGrid>
    </OperationalPage>
  );
}
EOF

  cat > "src/features/profiles/ui/ProfileScreen.module.css" <<'EOF'
.identityCard {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--vz-space-4);
  align-items: center;
  padding: clamp(var(--vz-space-5), 4vw, var(--vz-space-8));
  border: 1px solid var(--vz-color-border-subtle);
  border-left-color: var(--vz-color-accent-cyan);
  border-radius: var(--vz-radius-panel);
  background:
    linear-gradient(120deg, color-mix(in srgb, var(--vz-color-accent-cyan) 8%, transparent), transparent 45%),
    var(--vz-color-surface-base);
}

.identityCopy {
  display: grid;
  gap: var(--vz-space-2);
  min-width: 0;
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vz-space-2);
}

.identityCopy h2,
.identityCopy p,
.rankBlock span,
.rankBlock small {
  margin: 0;
}

.identityCopy h2 {
  font-size: clamp(1.75rem, 5vw, 3.25rem);
}

.identityCopy p,
.rankBlock span,
.rankBlock small {
  color: var(--vz-color-text-secondary);
}

.rankBlock {
  display: grid;
  grid-column: 1 / -1;
  gap: var(--vz-space-1);
  padding: var(--vz-space-4);
  border: 1px solid color-mix(in srgb, var(--vz-color-rank-gold) 38%, transparent);
  border-radius: var(--vz-radius-md);
  background: color-mix(in srgb, var(--vz-color-rank-gold) 5%, transparent);
}

.rankBlock strong {
  color: var(--vz-color-rank-gold);
  font-family: var(--vz-font-numeric);
  font-size: clamp(2rem, 7vw, 3.5rem);
  line-height: 1;
}

.progressStack {
  display: grid;
  gap: var(--vz-space-4);
  margin-bottom: var(--vz-space-5);
}

.formRow {
  display: flex;
  gap: var(--vz-space-2);
  margin-bottom: var(--vz-space-5);
}

.formRow span {
  display: grid;
  width: 2.4rem;
  aspect-ratio: 1;
  place-items: center;
  border: 1px solid var(--vz-color-border-subtle);
  border-radius: var(--vz-radius-sm);
  font-family: var(--vz-font-numeric);
  font-weight: var(--vz-font-weight-bold);
}

.formRow span[data-result="win"] {
  color: var(--vz-color-accent-green);
  border-color: color-mix(in srgb, var(--vz-color-accent-green) 48%, transparent);
  background: color-mix(in srgb, var(--vz-color-accent-green) 7%, transparent);
}

.formRow span[data-result="loss"] {
  color: var(--vz-color-status-danger);
  border-color: color-mix(in srgb, var(--vz-color-status-danger) 48%, transparent);
  background: color-mix(in srgb, var(--vz-color-status-danger) 7%, transparent);
}

@media (min-width: 48rem) {
  .identityCard {
    grid-template-columns: auto minmax(0, 1fr) auto;
  }

  .rankBlock {
    grid-column: auto;
    min-width: 11rem;
  }
}
EOF

  cat > "src/features/profiles/ui/ProfileScreen.test.tsx" <<'EOF'
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProfileScreen } from "./ProfileScreen";

describe("ProfileScreen", () => {
  it("renders player identity and competitive score", () => {
    render(<ProfileScreen />);

    expect(screen.getByRole("heading", { level: 1, name: "JAYFLEX" })).toBeInTheDocument();
    expect(screen.getByText("2,310")).toBeInTheDocument();
    expect(screen.getAllByText("Mainland Titans")).toHaveLength(2);
  });
});
EOF

  cat > "src/features/profiles/ui/index.ts" <<'EOF'
export * from "./ProfileScreen";
EOF
}

write_notifications_screen() {
  mkdir -p "src/features/notifications/ui"

  cat > "src/features/notifications/ui/NotificationsScreen.tsx" <<'EOF'
import { Badge } from "@/components/primitives/badge";
import {
  MetricCard,
  MetricGrid,
  OperationalActionLink,
  OperationalGrid,
  OperationalHeader,
  OperationalPage,
  OperationalPanel,
  SignalItem,
  SignalList,
} from "@/components/layout/operational-screen";

import styles from "./NotificationsScreen.module.css";

const notifications = [
  {
    title: "Check-in opens in 30 minutes",
    description: "Mainland Titans vs Island Elites / EA FC / Round 3 of 5.",
    meta: "2M",
    tone: "red",
  },
  {
    title: "Crew War roster confirmed",
    description: "Your EA FC lane is locked for Saturday War Day.",
    meta: "18M",
    tone: "magenta",
  },
  {
    title: "Reward pool funded",
    description: "The Weekly VS Pool now contains 250,000 VS Credits.",
    meta: "1H",
    tone: "gold",
  },
  {
    title: "Rank increased",
    description: "You moved from #7 to #4 on the Lagos EA FC weekly table.",
    meta: "4H",
    tone: "green",
  },
  {
    title: "Scouting report available",
    description: "Island Elites updated their expected War Day lineup.",
    meta: "1D",
    tone: "cyan",
  },
] as const;

export function NotificationsScreen() {
  return (
    <OperationalPage>
      <OperationalHeader
        actions={
          <OperationalActionLink href="/settings" variant="secondary">
            Notification settings
          </OperationalActionLink>
        }
        description="Match, Crew, ranking, reward, and security signals in one operational feed."
        eyebrow="09.2 // SIGNAL FEED"
        status={<Badge tone="live">3 unread</Badge>}
        title="NOTIFICATIONS"
      />

      <MetricGrid>
        <MetricCard detail="action required" label="Unread" tone="red" value="3" />
        <MetricCard detail="this week" label="Match alerts" tone="cyan" value="8" />
        <MetricCard detail="Crew activity" label="War signals" tone="magenta" value="5" />
        <MetricCard detail="credited" label="Rewards" tone="gold" value="2" />
      </MetricGrid>

      <OperationalGrid columns={3}>
        <OperationalPanel title="All signals" tone="green">
          <p className={styles.filterCopy}>Everything from matches, Crews, rewards, and security.</p>
        </OperationalPanel>
        <OperationalPanel title="Competition" tone="cyan">
          <p className={styles.filterCopy}>Check-in, result, rank, and dispute notifications.</p>
        </OperationalPanel>
        <OperationalPanel title="Crew and rewards" tone="magenta">
          <p className={styles.filterCopy}>War Week, roster, scouting, and funded-pool updates.</p>
        </OperationalPanel>
      </OperationalGrid>

      <OperationalGrid columns={2}>
        <OperationalPanel
          description="Newest operational signals appear first."
          eyebrow="Live feed"
          title="Priority notifications"
          tone="cyan"
        >
          <SignalList>
            {notifications.map((item) => (
              <SignalItem
                description={item.description}
                key={item.title}
                meta={item.meta}
                title={item.title}
                tone={item.tone}
              />
            ))}
          </SignalList>
        </OperationalPanel>

        <OperationalPanel
          description="Only high-value signals interrupt active play."
          eyebrow="Delivery"
          title="Signal policy"
          tone="gold"
        >
          <SignalList>
            <SignalItem
              description="Check-in and match-start alerts remain enabled."
              meta="ON"
              title="Competitive alerts"
              tone="green"
            />
            <SignalItem
              description="War Week roster and Crew challenge signals."
              meta="ON"
              title="Crew alerts"
              tone="magenta"
            />
            <SignalItem
              description="Cash and Bonus Credit movements require confirmation."
              meta="SECURE"
              title="Reward alerts"
              tone="gold"
            />
            <SignalItem
              description="New device and account-security events."
              meta="ON"
              title="Security alerts"
              tone="cyan"
            />
          </SignalList>
        </OperationalPanel>
      </OperationalGrid>
    </OperationalPage>
  );
}
EOF

  cat > "src/features/notifications/ui/NotificationsScreen.module.css" <<'EOF'
.filterCopy {
  margin: 0;
  color: var(--vz-color-text-secondary);
}
EOF

  cat > "src/features/notifications/ui/NotificationsScreen.test.tsx" <<'EOF'
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NotificationsScreen } from "./NotificationsScreen";

describe("NotificationsScreen", () => {
  it("renders the competitive signal feed", () => {
    render(<NotificationsScreen />);

    expect(screen.getByRole("heading", { level: 1, name: "NOTIFICATIONS" })).toBeInTheDocument();
    expect(screen.getByText("Check-in opens in 30 minutes")).toBeInTheDocument();
    expect(screen.getByText("Reward pool funded")).toBeInTheDocument();
  });
});
EOF

  cat > "src/features/notifications/ui/index.ts" <<'EOF'
export * from "./NotificationsScreen";
EOF
}

write_search_screen() {
  mkdir -p "src/features/search/ui"

  cat > "src/features/search/ui/SearchScreen.tsx" <<'EOF'
import { Badge } from "@/components/primitives/badge";
import { Input } from "@/components/primitives/input";
import {
  OperationalActionLink,
  OperationalGrid,
  OperationalHeader,
  OperationalPage,
  OperationalPanel,
  SignalItem,
  SignalList,
} from "@/components/layout/operational-screen";

import styles from "./SearchScreen.module.css";

export function SearchScreen() {
  return (
    <OperationalPage>
      <OperationalHeader
        description="Find players, Crews, competitions, matches, and public competitive records."
        eyebrow="10.1 // NETWORK SEARCH"
        status={<Badge tone="information">Global index online</Badge>}
        title="SEARCH VERZUS"
      />

      <form action="/search" className={styles.searchForm} method="get" role="search">
        <label htmlFor="verzus-search">Search the competitive network</label>
        <div className={styles.searchRow}>
          <Input
            controlSize="lg"
            id="verzus-search"
            leadingIcon="search"
            name="q"
            placeholder="Player, Crew, competition, or match ID"
            type="search"
          />
          <button type="submit">Search</button>
        </div>
        <p>Search results are public competitive records. Private Crew data remains permissioned.</p>
      </form>

      <OperationalGrid columns={3}>
        <OperationalPanel title="Players" tone="cyan">
          <p className={styles.categoryCopy}>Handles, game lanes, trust, and public form.</p>
        </OperationalPanel>
        <OperationalPanel title="Crews" tone="magenta">
          <p className={styles.categoryCopy}>Club identity, standings, roster readiness, and War Week status.</p>
        </OperationalPanel>
        <OperationalPanel title="Competitions" tone="gold">
          <p className={styles.categoryCopy}>Open registration, formats, eligibility, and funded rewards.</p>
        </OperationalPanel>
      </OperationalGrid>

      <OperationalGrid columns={2}>
        <OperationalPanel
          action={
            <OperationalActionLink href="/leaderboards/weekly" variant="secondary">
              View rankings
            </OperationalActionLink>
          }
          description="High-signal player and Crew records."
          eyebrow="Suggested"
          title="Competitive network"
          tone="green"
        >
          <SignalList>
            <SignalItem
              description="Elite / Mainland Titans / EA FC and COD Mobile"
              meta="#04"
              title="JAYFLEX"
              tone="green"
            />
            <SignalItem
              description="Founding Crew / Lagos / Four game lanes"
              meta="#02"
              title="Mainland Titans"
              tone="magenta"
            />
            <SignalItem
              description="Verified Crew / War Week opponent"
              meta="#05"
              title="Island Elites"
              tone="cyan"
            />
          </SignalList>
        </OperationalPanel>

        <OperationalPanel
          action={
            <OperationalActionLink href="/compete">Browse all</OperationalActionLink>
          }
          description="Open and scheduled competitive opportunities."
          eyebrow="Discover"
          title="Competitions"
          tone="gold"
        >
          <SignalList>
            <SignalItem
              description="EA FC / Lagos / Saturday 18:00 WAT"
              meta="OPEN"
              title="Rookie Cup"
              tone="green"
            />
            <SignalItem
              description="League / 5v5 / Eligibility verified"
              meta="12 SPOTS"
              title="Ranked Open"
              tone="cyan"
            />
            <SignalItem
              description="COD Mobile / Crew squads / Weekly VS Pool"
              meta="SAT"
              title="Squad Battles"
              tone="gold"
            />
          </SignalList>
        </OperationalPanel>
      </OperationalGrid>
    </OperationalPage>
  );
}
EOF

  cat > "src/features/search/ui/SearchScreen.module.css" <<'EOF'
.searchForm {
  display: grid;
  gap: var(--vz-space-3);
  padding: clamp(var(--vz-space-5), 4vw, var(--vz-space-8));
  border: 1px solid var(--vz-color-border-subtle);
  border-left-color: var(--vz-color-accent-cyan);
  border-radius: var(--vz-radius-panel);
  background: var(--vz-color-surface-base);
}

.searchForm label {
  color: var(--vz-color-text-primary);
  font-family: var(--vz-font-interface);
  font-weight: var(--vz-font-weight-bold);
  letter-spacing: var(--vz-tracking-ui);
  text-transform: uppercase;
}

.searchForm p,
.categoryCopy {
  margin: 0;
  color: var(--vz-color-text-secondary);
}

.searchRow {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--vz-space-3);
}

.searchRow button {
  min-height: 3rem;
  padding: var(--vz-space-3) var(--vz-space-6);
  border: 1px solid var(--vz-color-accent-green);
  background: var(--vz-color-accent-green);
  color: var(--vz-color-text-on-accent);
  font-family: var(--vz-font-interface);
  font-weight: var(--vz-font-weight-bold);
  letter-spacing: var(--vz-tracking-ui);
  text-transform: uppercase;
  clip-path: var(--vz-clip-button);
}

.searchRow button:focus-visible {
  outline: 2px solid var(--vz-color-accent-cyan);
  outline-offset: 3px;
}

@media (min-width: 40rem) {
  .searchRow {
    grid-template-columns: minmax(0, 1fr) auto;
  }
}
EOF

  cat > "src/features/search/ui/SearchScreen.test.tsx" <<'EOF'
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SearchScreen } from "./SearchScreen";

describe("SearchScreen", () => {
  it("renders the global competitive search form", () => {
    render(<SearchScreen />);

    expect(screen.getByRole("heading", { level: 1, name: "SEARCH VERZUS" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Search the competitive network" })).toBeInTheDocument();
    expect(screen.getByText("Island Elites")).toBeInTheDocument();
  });
});
EOF

  cat > "src/features/search/ui/index.ts" <<'EOF'
export * from "./SearchScreen";
EOF
}

write_settings_screen() {
  mkdir -p "src/features/settings/ui"

  cat > "src/features/settings/ui/SettingsScreen.tsx" <<'EOF'
import { Badge } from "@/components/primitives/badge";
import { Switch } from "@/components/primitives/switch";
import {
  OperationalActionLink,
  OperationalGrid,
  OperationalHeader,
  OperationalPage,
  OperationalPanel,
  SignalItem,
  SignalList,
} from "@/components/layout/operational-screen";

import styles from "./SettingsScreen.module.css";

export function SettingsScreen() {
  return (
    <OperationalPage>
      <OperationalHeader
        actions={
          <OperationalActionLink href="/profile" variant="secondary">
            Back to profile
          </OperationalActionLink>
        }
        description="Account security, communication, privacy, and competitive preferences."
        eyebrow="10.4 // CONTROL PANEL"
        status={<Badge tone="positive">Account secure</Badge>}
        title="SETTINGS"
      />

      <OperationalGrid columns={2}>
        <OperationalPanel
          description="High-risk account actions remain server-authorized."
          eyebrow="Account"
          title="Security and identity"
          tone="cyan"
        >
          <SignalList>
            <SignalItem
              description="Primary email and mobile number are verified."
              meta="VERIFIED"
              title="Player identity"
              tone="green"
            />
            <SignalItem
              description="Authenticator challenge required for reward withdrawals."
              meta="ENABLED"
              title="Two-factor authentication"
              tone="cyan"
            />
            <SignalItem
              description="Last active device: Windows desktop / Lagos."
              meta="NOW"
              title="Active session"
              tone="gold"
            />
          </SignalList>
          <div className={styles.actionRow}>
            <OperationalActionLink href="/session-expired" variant="ghost">
              Review sessions
            </OperationalActionLink>
          </div>
        </OperationalPanel>

        <OperationalPanel
          description="Control which operational signals can interrupt active play."
          eyebrow="Notifications"
          title="Signal preferences"
          tone="magenta"
        >
          <div className={styles.switchStack}>
            <Switch
              defaultChecked
              description="Check-in, match-start, result, and dispute alerts."
              label="Competitive alerts"
            />
            <Switch
              defaultChecked
              description="War Week, roster, challenge, and scouting signals."
              label="Crew alerts"
            />
            <Switch
              defaultChecked
              description="Cash Credit, Bonus Credit, and funded-pool activity."
              label="Reward alerts"
            />
            <Switch description="Optional product and event announcements." label="Platform updates" />
          </div>
        </OperationalPanel>
      </OperationalGrid>

      <OperationalGrid columns={2}>
        <OperationalPanel
          description="Public records support fair competition while private data remains restricted."
          eyebrow="Privacy"
          title="Competitive visibility"
          tone="green"
        >
          <div className={styles.switchStack}>
            <Switch
              defaultChecked
              description="Show verified game record, rank, and VS Points."
              label="Public competitive card"
            />
            <Switch
              defaultChecked
              description="Allow verified Crews to view your primary game lanes."
              label="Crew scouting visibility"
            />
            <Switch description="Allow direct challenge requests from players outside your Crew." label="Open challenges" />
          </div>
        </OperationalPanel>

        <OperationalPanel
          description="These settings affect matchmaking presentation, not competitive integrity."
          eyebrow="Competition"
          title="Play preferences"
          tone="gold"
        >
          <div className={styles.switchStack}>
            <Switch
              defaultChecked
              description="Prefer competition results with verified Crew affiliation."
              label="Crew-first discovery"
            />
            <Switch
              defaultChecked
              description="Show local Lagos competitions before national events."
              label="Local competition priority"
            />
            <Switch
              defaultChecked
              description="Warn when a match overlaps your saved War Day availability."
              label="Schedule conflict warnings"
            />
          </div>
        </OperationalPanel>
      </OperationalGrid>

      <OperationalPanel
        description="VS Points are competitive score. VS Credits are rewards. They remain separate in all account views."
        eyebrow="Data semantics"
        title="Points and credits"
        tone="cyan"
      >
        <div className={styles.creditGrid}>
          <article>
            <span>VS Points</span>
            <strong>Ranking score</strong>
            <p>Used for standings, seeding, and championship position.</p>
          </article>
          <article>
            <span>Cash Credits</span>
            <strong>Withdrawable reward</strong>
            <p>Paid from funded reward pools after server-side verification.</p>
          </article>
          <article>
            <span>Bonus Credits</span>
            <strong>Platform reward</strong>
            <p>Used inside VERZUS and never presented as withdrawable cash.</p>
          </article>
        </div>
      </OperationalPanel>
    </OperationalPage>
  );
}
EOF

  cat > "src/features/settings/ui/SettingsScreen.module.css" <<'EOF'
.switchStack {
  display: grid;
  gap: var(--vz-space-4);
}

.actionRow {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vz-space-3);
  margin-top: var(--vz-space-5);
}

.creditGrid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--vz-space-3);
}

.creditGrid article {
  display: grid;
  gap: var(--vz-space-2);
  padding: var(--vz-space-4);
  border: 1px solid var(--vz-color-border-subtle);
  border-radius: var(--vz-radius-md);
  background: color-mix(in srgb, var(--vz-color-surface-elevated) 72%, transparent);
}

.creditGrid span {
  color: var(--vz-color-accent-cyan);
  font-family: var(--vz-font-interface);
  font-size: var(--vz-text-xs);
  font-weight: var(--vz-font-weight-bold);
  letter-spacing: var(--vz-tracking-label);
  text-transform: uppercase;
}

.creditGrid strong {
  color: var(--vz-color-text-primary);
  font-family: var(--vz-font-interface);
  text-transform: uppercase;
}

.creditGrid p {
  margin: 0;
  color: var(--vz-color-text-secondary);
}

@media (min-width: 48rem) {
  .creditGrid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
EOF

  cat > "src/features/settings/ui/SettingsScreen.test.tsx" <<'EOF'
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SettingsScreen } from "./SettingsScreen";

describe("SettingsScreen", () => {
  it("renders account, signal, privacy, and competition settings", () => {
    render(<SettingsScreen />);

    expect(screen.getByRole("heading", { level: 1, name: "SETTINGS" })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Competitive alerts" })).toBeChecked();
    expect(screen.getByText("VS Points")).toBeInTheDocument();
  });
});
EOF

  cat > "src/features/settings/ui/index.ts" <<'EOF'
export * from "./SettingsScreen";
EOF
}

write_route_pages() {
  cat > "src/app/(platform)/profile/page.tsx" <<'EOF'
import type { Metadata } from "next";

import { getPlatformRouteById } from "@/components/layout/app-shell";
import { ProfileScreen } from "@/features/profiles/ui";

const route = getPlatformRouteById("profile");

export const metadata: Metadata = {
  title: route.title,
  description: route.description,
};

export default function ProfilePage() {
  return <ProfileScreen />;
}
EOF

  cat > "src/app/(platform)/notifications/page.tsx" <<'EOF'
import type { Metadata } from "next";

import { getPlatformRouteById } from "@/components/layout/app-shell";
import { NotificationsScreen } from "@/features/notifications/ui";

const route = getPlatformRouteById("notifications");

export const metadata: Metadata = {
  title: route.title,
  description: route.description,
};

export default function NotificationsPage() {
  return <NotificationsScreen />;
}
EOF

  cat > "src/app/(platform)/search/page.tsx" <<'EOF'
import type { Metadata } from "next";

import { getPlatformRouteById } from "@/components/layout/app-shell";
import { SearchScreen } from "@/features/search/ui";

const route = getPlatformRouteById("search");

export const metadata: Metadata = {
  title: route.title,
  description: route.description,
};

export default function SearchPage() {
  return <SearchScreen />;
}
EOF

  cat > "src/app/(platform)/settings/page.tsx" <<'EOF'
import type { Metadata } from "next";

import { getPlatformRouteById } from "@/components/layout/app-shell";
import { SettingsScreen } from "@/features/settings/ui";

const route = getPlatformRouteById("settings");

export const metadata: Metadata = {
  title: route.title,
  description: route.description,
};

export default function SettingsPage() {
  return <SettingsScreen />;
}
EOF
}

write_root_states() {
  cat > "src/app/global-error.tsx" <<'EOF'
"use client";

import { SystemStateScreen } from "@/components/layout/system-state";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en" data-theme="retro-competitive">
      <body>
        <SystemStateScreen
          action={
            <button onClick={reset} type="button">
              Reload VERZUS
            </button>
          }
          description="The application shell could not start. Your account and competition data were not changed."
          eyebrow="SYSTEM STARTUP FAILURE"
          reference={error.digest ?? "GLOBAL-UNAVAILABLE"}
          title="VERZUS COULD NOT START"
          tone="error"
        />
      </body>
    </html>
  );
}
EOF

  cat > "src/app/error.tsx" <<'EOF'
"use client";

import { useEffect } from "react";

import { SystemStateScreen } from "@/components/layout/system-state";

type RootErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function RootError({ error, reset }: RootErrorProps) {
  useEffect(() => {
    console.error("Route error", { digest: error.digest, message: error.message });
  }, [error]);

  return (
    <SystemStateScreen
      action={
        <button onClick={reset} type="button">
          Retry section
        </button>
      }
      description="This route failed independently. Other VERZUS areas remain available."
      eyebrow="ROUTE FAILURE"
      reference={error.digest ?? "ROUTE-UNAVAILABLE"}
      title="SECTION TEMPORARILY UNAVAILABLE"
      tone="error"
    />
  );
}
EOF

  cat > "src/app/not-found.tsx" <<'EOF'
import Link from "next/link";

import { SystemStateScreen } from "@/components/layout/system-state";

export default function NotFound() {
  return (
    <SystemStateScreen
      action={<Link href="/play">Return to Play</Link>}
      description="The requested VERZUS route does not exist or is no longer available."
      eyebrow="ROUTE NOT FOUND"
      title="NO COMPETITIVE RECORD HERE"
      tone="not-found"
    />
  );
}
EOF

  cat > "src/app/loading.tsx" <<'EOF'
import { SystemStateScreen } from "@/components/layout/system-state";

export default function RootLoading() {
  return (
    <SystemStateScreen
      description="Loading the application shell and your competitive context."
      eyebrow="VERZUS NETWORK"
      title="SYNCHRONIZING"
      tone="loading"
    />
  );
}
EOF
}

write_auth_overrides() {
  local temp
  temp="$(mktemp)"

  cat > "$temp" <<'EOF'
/* VERZUS STAGE 5 AUTH:BEGIN */

.shell {
  --auth-accent: var(--vz-color-accent-green);
  --auth-accent-soft: color-mix(in srgb, var(--auth-accent) 12%, transparent);
  --auth-border: color-mix(in srgb, var(--auth-accent) 42%, transparent);
  --auth-panel: var(--vz-color-surface-base);
  --auth-muted: var(--vz-color-text-secondary);

  background:
    linear-gradient(color-mix(in srgb, var(--vz-color-bg-deep) 84%, transparent), var(--vz-color-bg-deep)),
    linear-gradient(var(--vz-color-border-subtle) 1px, transparent 1px),
    linear-gradient(90deg, var(--vz-color-border-subtle) 1px, transparent 1px),
    radial-gradient(circle at 50% 0%, var(--auth-accent-soft), transparent 36rem),
    var(--vz-color-bg-deep);
  background-size:
    auto,
    4rem 4rem,
    4rem 4rem,
    auto,
    auto;
  color: var(--vz-color-text-primary);
}

.shell[data-accent="info"] {
  --auth-accent: var(--vz-color-accent-cyan);
}

.shell[data-accent="warning"] {
  --auth-accent: var(--vz-color-rank-gold);
}

.shell[data-accent="danger"] {
  --auth-accent: var(--vz-color-status-danger);
}

.brandName,
.title,
.cardTitle,
.securityTitle,
.noticeTitle,
.stateItemTitle {
  color: var(--vz-color-text-primary);
}

.description,
.cardDescription,
.helpText,
.securityCopy,
.noticeCopy,
.stateItemCopy {
  color: var(--vz-color-text-secondary);
  font-family: var(--vz-font-body);
}

.card,
.securityPanel,
.statePanel,
.loadingPanel {
  border-color: var(--auth-border);
  border-radius: var(--vz-radius-panel);
  background:
    linear-gradient(145deg, color-mix(in srgb, var(--auth-accent) 4%, transparent), transparent 45%),
    var(--vz-color-surface-base);
  box-shadow: var(--vz-shadow-panel);
  clip-path: none;
}

.statusStrip,
.primaryAction,
.secondaryButton {
  clip-path: var(--vz-clip-button);
}

.primaryAction {
  border-color: var(--auth-accent);
  background: var(--auth-accent);
  color: var(--vz-color-text-on-accent);
  box-shadow: none;
}

.secondaryButton {
  border-color: var(--vz-color-accent-cyan);
  color: var(--vz-color-accent-cyan);
  background: transparent;
}

/* VERZUS STAGE 5 AUTH:END */
EOF

  append_or_replace_block \
    "src/features/auth/ui/AuthScreens.module.css" \
    "/* VERZUS STAGE 5 AUTH:BEGIN */" \
    "/* VERZUS STAGE 5 AUTH:END */" \
    "$temp"

  rm -f "$temp"

  temp="$(mktemp)"
  cat > "$temp" <<'EOF'
/* VERZUS STAGE 5 AUTH FORMS:BEGIN */

.inputShell,
.codeInput,
.passwordRules,
.errorSummary {
  border-radius: var(--vz-radius-control);
  background: color-mix(in srgb, var(--vz-color-surface-elevated) 72%, transparent);
  clip-path: none;
}

.input,
.help,
.errorMessage,
.checkboxRow,
.passwordRule {
  font-family: var(--vz-font-body);
}

.input {
  color: var(--vz-color-text-primary);
}

.submitButton {
  border-color: var(--auth-accent);
  background: var(--auth-accent);
  color: var(--vz-color-text-on-accent);
  box-shadow: none;
  clip-path: var(--vz-clip-button);
}

.retryButton {
  border-color: var(--vz-color-status-danger);
  color: var(--vz-color-status-danger);
}

.input:focus-visible,
.visibilityButton:focus-visible,
.retryButton:focus-visible,
.submitButton:focus-visible,
.codeInput:focus-visible {
  outline-color: var(--vz-color-accent-cyan);
}

/* VERZUS STAGE 5 AUTH FORMS:END */
EOF

  append_or_replace_block \
    "src/features/auth/forms/AuthForms.module.css" \
    "/* VERZUS STAGE 5 AUTH FORMS:BEGIN */" \
    "/* VERZUS STAGE 5 AUTH FORMS:END */" \
    "$temp"

  rm -f "$temp"
}

write_onboarding_overrides() {
  local temp
  temp="$(mktemp)"

  cat > "$temp" <<'EOF'
/* VERZUS STAGE 5 ONBOARDING:BEGIN */

.page,
.loadingPage {
  color: var(--vz-color-text-primary);
  background:
    radial-gradient(
      circle at 88% 8%,
      color-mix(in srgb, var(--vz-color-accent-cyan) 8%, transparent),
      transparent 32rem
    ),
    radial-gradient(
      circle at 8% 82%,
      color-mix(in srgb, var(--vz-color-accent-green) 5%, transparent),
      transparent 30rem
    ),
    var(--vz-color-bg-deep);
}

.brandMark {
  background: linear-gradient(
    135deg,
    var(--vz-color-accent-cyan),
    var(--vz-color-accent-green)
  );
  color: var(--vz-color-text-on-accent);
}

.brandCopy small,
.railStep,
.saveNotice p,
.desktopHeader > div:first-child span,
.connectionStatus span,
.contextPanel p,
.contextPanel div p {
  color: var(--vz-color-text-secondary);
}

.stepRail,
.desktopHeader,
.mobileHeader,
.contextPanel {
  border-color: var(--vz-color-border-subtle);
  background: color-mix(in srgb, var(--vz-color-surface-base) 94%, transparent);
}

.railStep:hover {
  color: var(--vz-color-text-primary);
  border-color: var(--vz-color-border-default);
}

.railStepActive {
  color: var(--vz-color-text-primary);
  border-color: var(--vz-color-accent-green);
  background: color-mix(in srgb, var(--vz-color-accent-green) 6%, transparent);
}

.railStepActive .railNumber {
  color: var(--vz-color-text-on-accent);
  border-color: var(--vz-color-accent-green);
  background: var(--vz-color-accent-green);
}

.railStepComplete .railNumber {
  color: var(--vz-color-accent-cyan);
  border-color: var(--vz-color-accent-cyan);
}

.saveNotice {
  border-left-color: var(--vz-color-accent-green);
  background: color-mix(in srgb, var(--vz-color-accent-green) 5%, transparent);
}

.saveNotice span,
.desktopHeader > div:first-child span,
.contextPanel > span,
.contextPanel div strong {
  color: var(--vz-color-accent-cyan);
}

.connectionStatus[data-online="true"] b {
  color: var(--vz-color-accent-green);
}

.connectionStatus b {
  color: var(--vz-color-status-danger);
}

.contextPanel {
  border-radius: var(--vz-radius-panel);
  box-shadow: var(--vz-shadow-panel);
}

/* VERZUS STAGE 5 ONBOARDING:END */
EOF

  append_or_replace_block \
    "src/features/onboarding/ui/onboarding-experience.module.css" \
    "/* VERZUS STAGE 5 ONBOARDING:BEGIN */" \
    "/* VERZUS STAGE 5 ONBOARDING:END */" \
    "$temp"

  rm -f "$temp"
}

write_boundary_overrides() {
  local temp
  temp="$(mktemp)"

  cat > "$temp" <<'EOF'
/* VERZUS STAGE 5 ROUTE BOUNDARY:BEGIN */

.root,
.page,
.state,
.panel,
.card {
  color: var(--vz-color-text-primary);
  border-color: var(--vz-color-border-subtle);
  border-radius: var(--vz-radius-panel);
  background: var(--vz-color-surface-base);
  box-shadow: var(--vz-shadow-panel);
}

:is(.root, .page, .state, .panel, .card) :is(p, small) {
  color: var(--vz-color-text-secondary);
}

:is(.root, .page, .state, .panel, .card) :is(button, a):focus-visible {
  outline: 2px solid var(--vz-color-accent-cyan);
  outline-offset: 3px;
}

/* VERZUS STAGE 5 ROUTE BOUNDARY:END */
EOF

  append_or_replace_block \
    "src/components/layout/route-boundary/RouteBoundary.module.css" \
    "/* VERZUS STAGE 5 ROUTE BOUNDARY:BEGIN */" \
    "/* VERZUS STAGE 5 ROUTE BOUNDARY:END */" \
    "$temp"

  rm -f "$temp"

  temp="$(mktemp)"
  cat > "$temp" <<'EOF'
/* VERZUS STAGE 5 WIDGET BOUNDARY:BEGIN */

.boundary,
.root,
.fallback,
.card,
.panel {
  color: var(--vz-color-text-primary);
  border-color: var(--vz-color-border-subtle);
  border-radius: var(--vz-radius-panel);
  background: var(--vz-color-surface-base);
  box-shadow: var(--vz-shadow-panel);
}

:is(.boundary, .root, .fallback, .card, .panel) :is(p, small) {
  color: var(--vz-color-text-secondary);
}

:is(.boundary, .root, .fallback, .card, .panel) :is(button, a):focus-visible {
  outline: 2px solid var(--vz-color-accent-cyan);
  outline-offset: 3px;
}

/* VERZUS STAGE 5 WIDGET BOUNDARY:END */
EOF

  append_or_replace_block \
    "src/components/layout/widget-boundary/WidgetBoundary.module.css" \
    "/* VERZUS STAGE 5 WIDGET BOUNDARY:BEGIN */" \
    "/* VERZUS STAGE 5 WIDGET BOUNDARY:END */" \
    "$temp"

  rm -f "$temp"
}

write_design_system_updates() {
  node <<'NODE'
const fs = require("node:fs");
const file = "src/app/design-system/page.tsx";
let source = fs.readFileSync(file, "utf8");

source = source
  .replace(
    "VERZUS Design System / M2 / Step 17",
    "11.0 // PLATFORM VISUAL CONTRACT",
  )
  .replace(
    "Unified Design-System Gallery",
    "VERZUS Competitive UI System",
  )
  .replace(
    "One visual audit route for the approved foundation, reusable primitives, responsive presentations, competitive modules and failure states built in Steps 1-19.",
    "The canonical production gallery for the five-stage VERZUS visual rebuild: tokens, shell, primitives, Play, competitive screens, operational states, and responsive behavior.",
  );

fs.writeFileSync(file, source, "utf8");
NODE

  local temp
  temp="$(mktemp)"
  cat > "$temp" <<'EOF'
/* VERZUS STAGE 5 DESIGN GALLERY:BEGIN */

.page {
  color: var(--vz-color-text-primary);
}

.hero {
  border-color: color-mix(in srgb, var(--vz-color-accent-green) 36%, transparent);
  border-radius: var(--vz-radius-lg);
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--vz-color-accent-green) 7%, transparent),
      transparent 36%
    ),
    var(--vz-color-surface-base);
  box-shadow: var(--vz-shadow-panel);
  clip-path: none;
}

.kicker,
.sampleEyebrow {
  color: var(--vz-color-accent-green);
}

.description,
.summaryCard span,
.swatchItem small,
.bodySample,
.controlCopy,
.catalogCard p,
.stateCard p,
.approvalGrid p {
  color: var(--vz-color-text-secondary);
}

.summaryCard,
.sampleBlock,
.sectionNav {
  border-color: var(--vz-color-border-subtle);
  border-radius: var(--vz-radius-md);
  background: color-mix(in srgb, var(--vz-color-surface-elevated) 72%, transparent);
  box-shadow: none;
}

.sectionNav a:focus-visible,
.previewLink:focus-visible {
  outline-color: var(--vz-color-accent-cyan);
}

/* VERZUS STAGE 5 DESIGN GALLERY:END */
EOF

  append_or_replace_block \
    "src/app/design-system/page.module.css" \
    "/* VERZUS STAGE 5 DESIGN GALLERY:BEGIN */" \
    "/* VERZUS STAGE 5 DESIGN GALLERY:END */" \
    "$temp"

  rm -f "$temp"

  cat > "src/app/token-preview/page.tsx" <<'EOF'
import styles from "./page.module.css";

const coreTokens = [
  ["Void canvas", "--vz-color-bg-deep", "#080A0C", "backgroundDeep"],
  ["Surface base", "--vz-color-surface-base", "#111519", "surfaceBase"],
  ["Surface elevated", "--vz-color-surface-elevated", "#1A2026", "surfaceElevated"],
  ["Primary green", "--vz-color-accent-green", "#00FF87", "green"],
  ["Secondary cyan", "--vz-color-accent-cyan", "#00E5FF", "cyan"],
  ["Live and danger", "--vz-color-status-danger", "#FF3830", "red"],
  ["War and rivalry", "--vz-color-status-magenta", "#FF2D87", "magenta"],
  ["Rank and reward", "--vz-color-rank-gold", "#FFC400", "gold"],
  ["Primary text", "--vz-color-text-primary", "#F1F0FF", "textPrimary"],
  ["Secondary text", "--vz-color-text-secondary", "#8A87B8", "textSecondary"],
] as const;

export default function TokenPreviewPage() {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>11.1 // CANONICAL TOKEN SYSTEM</p>
          <h1 className={styles.title}>VERZUS VISUAL FOUNDATION</h1>
          <p className={styles.description}>
            Neon colours are operational signals. Green owns positive action, cyan owns information
            and focus, red owns live danger, magenta owns rivalry, and gold owns rank and rewards.
          </p>
        </header>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Production colour contract</h2>
          <div className={styles.swatchGrid}>
            {coreTokens.map(([name, token, value, className]) => (
              <article className={styles.swatchCard} key={token}>
                <div
                  aria-hidden="true"
                  className={`${styles.swatch} ${styles[className]}`}
                />
                <div>
                  <h3 className={styles.swatchName}>{name}</h3>
                  <p className={styles.tokenName}>{token}</p>
                  <p className={styles.tokenValue}>{value}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Typography contract</h2>
          <div className={styles.typeGrid}>
            <article>
              <span>Rajdhani / Display</span>
              <strong>PLAY. RANK. RISE.</strong>
              <p>Uppercase headings, navigation, labels, ranks, scores, and timers.</p>
            </article>
            <article>
              <span>Inter / Body</span>
              <strong>Readable operational copy</strong>
              <p>Forms, rules, descriptions, help text, and long interface content.</p>
            </article>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Signal semantics</h2>
          <div className={styles.semanticGrid}>
            <article className={styles.primaryAction}>
              <span>Primary action</span>
              <strong>CHECK IN NOW</strong>
            </article>
            <article className={styles.secondaryAction}>
              <span>Information</span>
              <strong>VIEW MATCH</strong>
            </article>
            <article className={styles.liveAction}>
              <span>Live danger</span>
              <strong>ROUND 3 / 5</strong>
            </article>
            <article className={styles.warAction}>
              <span>Rivalry</span>
              <strong>WAR WEEK ACTIVE</strong>
            </article>
            <article className={styles.rewardAction}>
              <span>Rank and reward</span>
              <strong>2,310 VS POINTS</strong>
            </article>
          </div>
        </section>
      </section>
    </main>
  );
}
EOF

  cat > "src/app/token-preview/page.module.css" <<'EOF'
.page {
  min-height: 100svh;
  padding: clamp(var(--vz-space-4), 4vw, var(--vz-space-10));
  color: var(--vz-color-text-primary);
  background: var(--vz-color-bg-deep);
}

.shell {
  width: min(100%, var(--vz-content-max));
  margin-inline: auto;
  overflow: hidden;
  border: 1px solid var(--vz-color-border-subtle);
  border-radius: var(--vz-radius-lg);
  background: var(--vz-color-surface-base);
}

.header,
.section {
  display: grid;
  gap: var(--vz-space-4);
  padding: clamp(var(--vz-space-5), 4vw, var(--vz-space-10));
}

.header {
  border-bottom: 1px solid var(--vz-color-border-subtle);
  background:
    linear-gradient(
      120deg,
      color-mix(in srgb, var(--vz-color-accent-green) 7%, transparent),
      transparent 34%
    ),
    var(--vz-color-bg-deep);
}

.section + .section {
  border-top: 1px solid var(--vz-color-border-subtle);
}

.eyebrow,
.sectionTitle,
.typeGrid span,
.semanticGrid span {
  margin: 0;
  color: var(--vz-color-accent-cyan);
  font-family: var(--vz-font-interface);
  font-size: var(--vz-text-xs);
  font-weight: var(--vz-font-weight-bold);
  letter-spacing: var(--vz-tracking-label);
  text-transform: uppercase;
}

.title,
.description,
.swatchName,
.tokenName,
.tokenValue,
.typeGrid p {
  margin: 0;
}

.title {
  font-size: clamp(2.2rem, 8vw, 5rem);
}

.description,
.typeGrid p {
  max-width: 68ch;
  color: var(--vz-color-text-secondary);
}

.sectionTitle {
  font-size: var(--vz-text-lg);
}

.swatchGrid,
.typeGrid,
.semanticGrid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--vz-space-3);
}

.swatchCard,
.typeGrid article,
.semanticGrid article {
  min-width: 0;
  border: 1px solid var(--vz-color-border-subtle);
  border-radius: var(--vz-radius-md);
  background: var(--vz-color-surface-elevated);
}

.swatchCard {
  display: grid;
  grid-template-columns: 4rem minmax(0, 1fr);
  gap: var(--vz-space-4);
  align-items: center;
  padding: var(--vz-space-3);
}

.swatch {
  width: 4rem;
  aspect-ratio: 1;
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: var(--vz-radius-control);
}

.backgroundDeep {
  background: var(--vz-color-bg-deep);
}

.surfaceBase {
  background: var(--vz-color-surface-base);
}

.surfaceElevated {
  background: var(--vz-color-surface-elevated);
}

.green {
  background: var(--vz-color-accent-green);
}

.cyan {
  background: var(--vz-color-accent-cyan);
}

.red {
  background: var(--vz-color-status-danger);
}

.magenta {
  background: var(--vz-color-status-magenta);
}

.gold {
  background: var(--vz-color-rank-gold);
}

.textPrimary {
  background: var(--vz-color-text-primary);
}

.textSecondary {
  background: var(--vz-color-text-secondary);
}

.swatchName {
  color: var(--vz-color-text-primary);
  font-family: var(--vz-font-interface);
  text-transform: uppercase;
}

.tokenName,
.tokenValue {
  overflow-wrap: anywhere;
  color: var(--vz-color-text-secondary);
  font-family: var(--vz-font-numeric);
  font-size: var(--vz-text-xs);
}

.typeGrid article,
.semanticGrid article {
  display: grid;
  gap: var(--vz-space-3);
  padding: var(--vz-space-5);
}

.typeGrid strong {
  color: var(--vz-color-text-primary);
  font-family: var(--vz-font-display);
  font-size: clamp(1.35rem, 4vw, 2.5rem);
  letter-spacing: var(--vz-tracking-display);
  text-transform: uppercase;
}

.semanticGrid article {
  --semantic: var(--vz-color-accent-cyan);

  border-left-color: var(--semantic);
}

.semanticGrid strong {
  color: var(--semantic);
  font-family: var(--vz-font-numeric);
  font-size: clamp(1.15rem, 3vw, 1.8rem);
}

.primaryAction {
  --semantic: var(--vz-color-accent-green) !important;
}

.secondaryAction {
  --semantic: var(--vz-color-accent-cyan) !important;
}

.liveAction {
  --semantic: var(--vz-color-status-danger) !important;
}

.warAction {
  --semantic: var(--vz-color-status-magenta) !important;
}

.rewardAction {
  --semantic: var(--vz-color-rank-gold) !important;
}

@media (min-width: 40rem) {
  .swatchGrid,
  .semanticGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 64rem) {
  .swatchGrid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .typeGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .semanticGrid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}
EOF
}

write_compatibility_verifiers() {
  cat > "scripts/verify-retro-ui.mjs" <<'EOF'
import fs from "node:fs";

const checks = [
  ["src/app/layout.tsx", 'import "@/styles/verzus-visual-system.css";'],
  ["src/styles/tokens.css", "--vz-color-accent-green: #00ff87"],
  ["src/styles/tokens.css", "--vz-color-accent-cyan: #00e5ff"],
  ["src/components/layout/app-shell/AppShell.module.css", "VERZUS STAGE 2 SHELL:BEGIN"],
  ["src/features/play/ui/play-command-center.module.css", "VERZUS STAGE 3 PLAY:BEGIN"],
  ["scripts/verify-stage-4-competitive.mjs", "Stage 4"],
  ["scripts/verify-stage-5-platform.mjs", "Stage 5"],
];

const failures = [];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) {
    failures.push(`${file}: missing`);
    continue;
  }

  const source = fs.readFileSync(file, "utf8");
  if (!source.includes(fragment)) {
    failures.push(`${file}: missing ${fragment}`);
  }
}

if (failures.length > 0) {
  console.error("Canonical VERZUS UI verification failed:\n" + failures.join("\n"));
  process.exit(1);
}

console.log("Canonical VERZUS competitive UI markers: PASS");
EOF

  cat > "scripts/verify-reference-ui.mjs" <<'EOF'
import fs from "node:fs";

const layout = fs.readFileSync("src/app/layout.tsx", "utf8");
const obsoleteImports = [
  "verzus-retro-system.css",
  "verzus-reference-lock.css",
  "verzus-esports-design-system.css",
  "verzus-font-reference.css",
];

const failures = obsoleteImports
  .filter((name) => layout.includes(name))
  .map((name) => `Obsolete theme import remains active: ${name}`);

const checks = [
  ["src/styles/verzus-visual-system.css", "--vz-clip-button:"],
  ["src/components/layout/app-shell/BrandMark.tsx", "brandVersion"],
  ["src/components/primitives/button/Button.module.css", "VERZUS STAGE 2 BUTTON:BEGIN"],
  ["src/features/onboarding/ui/onboarding-experience.module.css", "VERZUS STAGE 5 ONBOARDING:BEGIN"],
  ["src/features/play/ui/play-command-center.module.css", "VERZUS STAGE 3 PLAY:BEGIN"],
  ["docs/design-system/stage-5-platform-contract.md", "# VERZUS Stage 5 Platform Contract"],
];

for (const [file, expected] of checks) {
  if (!fs.existsSync(file)) {
    failures.push(`${file}: missing`);
    continue;
  }

  const source = fs.readFileSync(file, "utf8");
  if (!source.includes(expected)) {
    failures.push(`${file}: missing ${expected}`);
  }
}

if (failures.length > 0) {
  console.error(
    "Reference-aligned VERZUS UI verification failed:\n" +
      failures.map((item) => `- ${item}`).join("\n"),
  );
  process.exit(1);
}

console.log("Reference-aligned canonical VERZUS UI markers: PASS");
EOF
}

write_docs() {
  mkdir -p "docs/design-system" "docs/runbooks" "reports/visual-review" "reports/accessibility" "reports/responsive"

  cat > "docs/design-system/stage-5-platform-contract.md" <<'EOF'
# VERZUS Stage 5 Platform Contract

Status: Platform visual completion

## Completed scope

- Profile
- Notifications
- Search
- Settings
- Authentication visual alignment
- Onboarding visual alignment
- Root loading, error, not-found, and global-error states
- Design-system gallery alignment
- Canonical token preview
- Legacy visual verifier retirement

## Preserved scope

Stage 5 does not change feature APIs, schemas, adapters, mocks, query behavior, authentication logic, onboarding state transitions, check-in behavior, authorization, or telemetry.

## Canonical visual rules

- Canvas: `#080A0C`
- Base surface: `#111519`
- Elevated surface: `#1A2026`
- Primary positive action: `#00FF87`
- Information and focus: `#00E5FF`
- Live and danger: `#FF3830`
- War and rivalry: `#FF2D87`
- Rank and reward: `#FFC400`
- Primary text: `#F1F0FF`
- Secondary text: `#8A87B8`

Rajdhani owns display and operational data. Inter owns readable body copy and forms.

## Responsive gate

Review at 360, 390, 430, 768, 1024, and 1440 pixels.

Reject the release for horizontal overflow, clipped labels, duplicate fixed navigation, unreadable neon body text, trapped modal scrolling, or desktop tables compressed into mobile.
EOF

  cat > "docs/design-system/legacy-theme-retirement.md" <<'EOF'
# Legacy Theme Retirement

The following files remain in the repository as historical references but are not imported by `src/app/layout.tsx`:

- `src/styles/verzus-retro-system.css`
- `src/styles/verzus-reference-lock.css`
- `src/styles/verzus-esports-design-system.css`
- `src/styles/verzus-font-reference.css`

The active visual stack is:

1. `src/styles/globals.css`
2. `src/styles/verzus-visual-system.css`
3. CSS Modules owned by shared components and feature domains

Do not re-import a retired theme file. Move any still-useful rule into canonical tokens, the canonical visual system, a shared primitive, or the owning feature CSS Module.
EOF

  cat > "docs/runbooks/ui-rollback.md" <<'EOF'
# VERZUS UI Rollback

Each visual stage creates an independent backup:

- `.verzus-backups/stage-1-foundation/`
- `.verzus-backups/stage-2-primitives/`
- `.verzus-backups/stage-3-play/`
- `.verzus-backups/stage-4-competitive/`
- `.verzus-backups/stage-5-platform/`

To roll back Stage 5, run:

```bash
bash ./VERZUS_Stage_5_Platform_Completion.sh rollback
```

After rollback, run:

```bash
npm run typecheck
npm run dev
```

Review `/play`, `/profile`, `/notifications`, `/search`, `/settings`, `/login`, and `/onboarding` before continuing.
EOF
}

write_stage5_verifier() {
  cat > "scripts/verify-stage-5-platform.mjs" <<'EOF'
import fs from "node:fs";

const requiredFiles = [
  "src/components/layout/operational-screen/OperationalScreen.tsx",
  "src/components/layout/system-state/SystemStateScreen.tsx",
  "src/features/profiles/ui/ProfileScreen.tsx",
  "src/features/notifications/ui/NotificationsScreen.tsx",
  "src/features/search/ui/SearchScreen.tsx",
  "src/features/settings/ui/SettingsScreen.tsx",
  "docs/design-system/stage-5-platform-contract.md",
  "docs/design-system/legacy-theme-retirement.md",
  "docs/runbooks/ui-rollback.md",
];

const checks = [
  ["src/app/(platform)/profile/page.tsx", "<ProfileScreen"],
  ["src/app/(platform)/notifications/page.tsx", "<NotificationsScreen"],
  ["src/app/(platform)/search/page.tsx", "<SearchScreen"],
  ["src/app/(platform)/settings/page.tsx", "<SettingsScreen"],
  ["src/features/auth/ui/AuthScreens.module.css", "VERZUS STAGE 5 AUTH:BEGIN"],
  ["src/features/auth/forms/AuthForms.module.css", "VERZUS STAGE 5 AUTH FORMS:BEGIN"],
  ["src/features/onboarding/ui/onboarding-experience.module.css", "VERZUS STAGE 5 ONBOARDING:BEGIN"],
  ["src/components/layout/route-boundary/RouteBoundary.module.css", "VERZUS STAGE 5 ROUTE BOUNDARY:BEGIN"],
  ["src/components/layout/widget-boundary/WidgetBoundary.module.css", "VERZUS STAGE 5 WIDGET BOUNDARY:BEGIN"],
  ["src/app/global-error.tsx", "<SystemStateScreen"],
  ["src/app/token-preview/page.tsx", "CANONICAL TOKEN SYSTEM"],
  ["scripts/verify-retro-ui.mjs", "Canonical VERZUS"],
  ["scripts/verify-reference-ui.mjs", "Reference-aligned"],
];

const failures = [];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    failures.push(`${file}: missing`);
  }
}

for (const [file, marker] of checks) {
  if (!fs.existsSync(file)) {
    failures.push(`${file}: missing`);
    continue;
  }

  const source = fs.readFileSync(file, "utf8");
  if (!source.includes(marker)) {
    failures.push(`${file}: missing ${marker}`);
  }
}

const layout = fs.readFileSync("src/app/layout.tsx", "utf8");
for (const obsolete of [
  "verzus-retro-system.css",
  "verzus-reference-lock.css",
  "verzus-esports-design-system.css",
  "verzus-font-reference.css",
]) {
  if (layout.includes(obsolete)) {
    failures.push(`src/app/layout.tsx: obsolete import ${obsolete}`);
  }
}

for (const page of [
  "src/app/(platform)/profile/page.tsx",
  "src/app/(platform)/notifications/page.tsx",
  "src/app/(platform)/search/page.tsx",
  "src/app/(platform)/settings/page.tsx",
]) {
  if (fs.readFileSync(page, "utf8").includes("PlatformRoutePlaceholder")) {
    failures.push(`${page}: still renders PlatformRoutePlaceholder`);
  }
}

if (failures.length > 0) {
  console.error("Stage 5 platform verification failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Stage 5 platform completion markers are installed.");
EOF
}

patch_package_json() {
  node <<'NODE'
const fs = require("node:fs");
const file = "package.json";
const pkg = JSON.parse(fs.readFileSync(file, "utf8"));
pkg.scripts ??= {};
pkg.scripts["verify:stage5"] = "node scripts/verify-stage-5-platform.mjs";
pkg.scripts["stage5:preview"] = "next dev --hostname 127.0.0.1 --port 3113";
fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + "\n", "utf8");
NODE
}

format_files() {
  echo
  echo "Formatting Stage 5 files..."
  npx prettier \
    "package.json" \
    "src/app/global-error.tsx" \
    "src/app/error.tsx" \
    "src/app/loading.tsx" \
    "src/app/not-found.tsx" \
    "src/app/(platform)/profile/page.tsx" \
    "src/app/(platform)/notifications/page.tsx" \
    "src/app/(platform)/search/page.tsx" \
    "src/app/(platform)/settings/page.tsx" \
    "src/app/design-system/page.tsx" \
    "src/app/design-system/page.module.css" \
    "src/app/token-preview/page.tsx" \
    "src/app/token-preview/page.module.css" \
    "src/features/auth/ui/AuthScreens.module.css" \
    "src/features/auth/forms/AuthForms.module.css" \
    "src/features/onboarding/ui/onboarding-experience.module.css" \
    "src/components/layout/route-boundary/RouteBoundary.module.css" \
    "src/components/layout/widget-boundary/WidgetBoundary.module.css" \
    "src/components/layout/operational-screen" \
    "src/components/layout/system-state" \
    "src/features/profiles/ui" \
    "src/features/notifications/ui" \
    "src/features/search/ui" \
    "src/features/settings/ui" \
    "docs/design-system/stage-5-platform-contract.md" \
    "docs/design-system/legacy-theme-retirement.md" \
    "docs/runbooks/ui-rollback.md" \
    "scripts/verify-stage-5-platform.mjs" \
    "scripts/verify-retro-ui.mjs" \
    "scripts/verify-reference-ui.mjs" \
    --write
}

install_stage5() {
  print_plan
  echo
  require_repo
  create_backup

  write_operational_screen
  write_system_state
  write_profile_screen
  write_notifications_screen
  write_search_screen
  write_settings_screen
  write_route_pages
  write_root_states
  write_auth_overrides
  write_onboarding_overrides
  write_boundary_overrides
  write_design_system_updates
  write_compatibility_verifiers
  write_docs
  write_stage5_verifier
  patch_package_json
  format_files

  echo
  echo "Running narrow Stage 5 marker verification..."
  node scripts/verify-stage-5-platform.mjs

  echo
  echo "Stage 5 platform completion installed."
  echo "No API, schema, adapter, query, auth behavior, or Play contract was changed."
  echo "Rollback archive: $ARCHIVE"
}

verify_stage5() {
  require_repo

  echo "Running Stage 5 marker verification..."
  node scripts/verify-stage-5-platform.mjs

  echo
  echo "Running focused ESLint..."
  npx eslint \
    "src/app/global-error.tsx" \
    "src/app/error.tsx" \
    "src/app/loading.tsx" \
    "src/app/not-found.tsx" \
    "src/app/(platform)/profile/page.tsx" \
    "src/app/(platform)/notifications/page.tsx" \
    "src/app/(platform)/search/page.tsx" \
    "src/app/(platform)/settings/page.tsx" \
    "src/app/token-preview/page.tsx" \
    "src/components/layout/operational-screen" \
    "src/components/layout/system-state" \
    "src/features/profiles/ui" \
    "src/features/notifications/ui" \
    "src/features/search/ui" \
    "src/features/settings/ui" \
    --max-warnings=0

  echo
  echo "Running focused Stage 5 component tests..."
  npx vitest run \
    src/features/profiles/ui/ProfileScreen.test.tsx \
    src/features/notifications/ui/NotificationsScreen.test.tsx \
    src/features/search/ui/SearchScreen.test.tsx \
    src/features/settings/ui/SettingsScreen.test.tsx

  echo
  echo "Running TypeScript verification..."
  npm run typecheck

  echo
  echo "Stage 5 focused verification passed."
}

release_gate() {
  require_repo
  verify_stage5

  echo
  echo "Running final repository release gate..."
  npm run format:check
  npm run lint
  npm run typecheck
  npm run test
  npm run check:boundaries
  npm run build

  echo
  echo "Running canonical visual marker checks..."
  node scripts/verify-retro-ui.mjs
  node scripts/verify-reference-ui.mjs
  node scripts/m4-visual-review.mjs --scan-only

  echo
  echo "Stage 5 release gate passed."
}

preview_stage5() {
  require_repo
  echo "Starting Stage 5 preview at http://127.0.0.1:$PORT"
  exec npx next dev --hostname 127.0.0.1 --port "$PORT"
}

rollback_stage5() {
  require_repo

  local latest
  latest="$(find "$BACKUP_ROOT" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | sort | tail -n 1)"

  if [[ -z "$latest" ]]; then
    echo "No Stage 5 backup found."
    exit 1
  fi

  local archive="$latest/verzus-stage-5-before.tar.gz"
  local created="$latest/created-files.txt"

  if [[ ! -f "$archive" ]]; then
    echo "Backup archive not found: $archive"
    exit 1
  fi

  echo "Restoring Stage 5 backup:"
  echo "  $archive"

  if [[ -f "$created" ]]; then
    while IFS= read -r file; do
      [[ -n "$file" ]] && rm -rf "$file"
    done < "$created"
  fi

  tar -xzf "$archive"
  echo "Stage 5 rollback completed."
}

case "$MODE" in
  install)
    install_stage5
    ;;
  verify)
    verify_stage5
    ;;
  release)
    release_gate
    ;;
  preview)
    preview_stage5
    ;;
  all)
    install_stage5
    verify_stage5
    ;;
  rollback)
    rollback_stage5
    ;;
  *)
    echo "Unknown mode: $MODE"
    echo
    echo "Valid modes:"
    echo "  install   Apply Stage 5 and run marker verification"
    echo "  verify    Run focused lint, tests, and TypeScript"
    echo "  preview   Start Next.js on port $PORT"
    echo "  release   Run the full final release gate"
    echo "  all       Install and run focused verification"
    echo "  rollback  Restore the latest Stage 5 backup"
    exit 1
    ;;
esac

echo
echo "Completed mode: $MODE"
