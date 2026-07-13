#!/usr/bin/env bash
set -euo pipefail

printf '%s\n' 'VERZUS M2 Step 19 - Player, Match, Crew and War Match Intel Cards'
printf 'Branch: %s\n' "$(git branch --show-current)"
printf '%s\n' 'No branch will be created or changed.'

if [[ ! -f package.json ]]; then
  printf '%s\n' 'Run this script from the VERZUS repository root.'
  exit 1
fi

if [[ -n "$(git status --short)" ]]; then
  printf '%s\n' 'Notice: the working tree has uncommitted changes. Git remains the rollback mechanism.'
fi

required_files=(
  src/styles/tokens.css
  src/components/primitives/badge/index.ts
  src/components/primitives/button/index.ts
  src/components/primitives/card/index.ts
  src/components/primitives/feedback/index.ts
  src/features/matches/index.ts
  src/app/design-system/page.tsx
  .storybook/main.ts
  tests/visual/storybook.visual.spec.ts
)

for required_file in "${required_files[@]}"; do
  if [[ ! -f "$required_file" ]]; then
    printf 'Missing prerequisite: %s\n' "$required_file"
    printf '%s\n' 'Complete Steps 1-18 before running Step 19.'
    exit 1
  fi
done

printf '%s\n' 'Running the prerequisite TypeScript gate...'
npm run typecheck

sed -i \
  '/\/\* M2 STEP 19 START \*\//,/\/\* M2 STEP 19 END \*\//d' \
  src/styles/tokens.css

cat >> src/styles/tokens.css <<'TOKENS_EOF'

/* M2 STEP 19 START */
/* ==================================================================
   INTEL CARDS
   Player, Match, Crew and War Match command-centre summaries.
   ================================================================== */

:root {
  --vz-intel-background:
    radial-gradient(circle at 72% 18%, rgb(0 255 135 / 10%), transparent 34%),
    linear-gradient(150deg, rgb(18 25 29 / 99%), rgb(4 7 9 / 100%));
  --vz-intel-background-raised:
    linear-gradient(145deg, rgb(24 32 37 / 99%), rgb(7 10 12 / 100%));
  --vz-intel-border: rgb(177 190 196 / 25%);
  --vz-intel-border-strong: rgb(177 190 196 / 43%);
  --vz-intel-text: #f5f7f8;
  --vz-intel-muted: #9aa6ac;
  --vz-intel-subtle: #66727a;
  --vz-intel-player: #00ff87;
  --vz-intel-match: #00e5ff;
  --vz-intel-crew: #a44fff;
  --vz-intel-war: #ff4f9a;
  --vz-intel-warning: #ffce5c;
  --vz-intel-danger: #ff4e55;
  --vz-intel-offline: #8b969d;
  --vz-intel-cut: 1.05rem;
  --vz-intel-radius: 0.25rem;
  --vz-intel-padding: clamp(0.875rem, 2vw, 1.25rem);
  --vz-intel-gap: clamp(0.75rem, 1.7vw, 1rem);
  --vz-intel-shadow:
    0 1.5rem 3.75rem rgb(0 0 0 / 42%),
    inset 0 1px 0 rgb(255 255 255 / 5%);
  --vz-intel-glow:
    0 0 0 1px color-mix(in srgb, var(--intel-accent, #00ff87) 35%, transparent),
    0 0 2rem color-mix(in srgb, var(--intel-accent, #00ff87) 12%, transparent);
  --vz-intel-action-height: 2.75rem;
  --vz-intel-transition:
    border-color 150ms ease,
    box-shadow 150ms ease,
    transform 150ms ease,
    background-color 150ms ease;
}

/* M2 STEP 19 END */
TOKENS_EOF

mkdir -p \
  public/intel-cards \
  src/components/primitives/intel-card \
  src/features/profiles/intel-card \
  src/features/crews/intel-card \
  src/features/matches/intel-card \
  src/app/intel-cards-preview \
  src/stories \
  docs/milestones/M2

cat > public/intel-cards/jayflex.svg <<'SVG_EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-labelledby="title desc">
  <title id="title">Jayflex abstract player portrait</title>
  <desc id="desc">Original geometric esports portrait in green and cyan.</desc>
  <defs>
    <radialGradient id="bg" cx="50%" cy="38%" r="70%">
      <stop offset="0" stop-color="#113d2b"/>
      <stop offset="1" stop-color="#030706"/>
    </radialGradient>
    <linearGradient id="hair" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#00ff87"/>
      <stop offset="1" stop-color="#00a85d"/>
    </linearGradient>
  </defs>
  <circle cx="128" cy="128" r="123" fill="url(#bg)" stroke="#00ff87" stroke-width="6"/>
  <path d="M64 213c13-38 38-58 64-58s51 20 64 58" fill="#0a1712" stroke="#00e5ff" stroke-width="5"/>
  <path d="M82 87c5-36 28-57 48-57 28 0 48 25 48 60v34c0 38-20 65-50 65-28 0-47-25-47-62Z" fill="#7b4a32" stroke="#f4c5a5" stroke-width="4"/>
  <path d="M72 96 87 48l21 25 10-42 20 40 23-31 19 51-17-13-9 27-20-24-20 28-12-28-18 23Z" fill="url(#hair)" stroke="#07140e" stroke-width="7" stroke-linejoin="round"/>
  <path d="M96 119h20M140 119h20" stroke="#0a0f0d" stroke-width="7" stroke-linecap="round"/>
  <path d="M111 151c11 8 24 8 35 0" fill="none" stroke="#0a0f0d" stroke-width="6" stroke-linecap="round"/>
  <path d="M53 211h150" stroke="#00ff87" stroke-width="6" stroke-linecap="round"/>
</svg>
SVG_EOF

cat > public/intel-cards/mainland-titans.svg <<'SVG_EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-labelledby="title desc">
  <title id="title">Mainland Titans emblem</title>
  <desc id="desc">Original purple shield and strength cross emblem.</desc>
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#c777ff"/>
      <stop offset="1" stop-color="#6424d8"/>
    </linearGradient>
  </defs>
  <path d="M128 14 224 58v74c0 55-36 91-96 112-60-21-96-57-96-112V58Z" fill="#10091c" stroke="url(#g)" stroke-width="12"/>
  <path d="M91 74h74v38h31v34h-31v38H91v-38H60v-34h31Z" fill="url(#g)"/>
  <path d="M128 42v164" stroke="#dfb7ff" stroke-width="7" opacity=".55"/>
</svg>
SVG_EOF

cat > public/intel-cards/lagos-lynx.svg <<'SVG_EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-labelledby="title desc">
  <title id="title">Lagos Lynx emblem</title>
  <desc id="desc">Original red angular lynx head emblem.</desc>
  <path d="m44 40 49 23 35-26 35 26 49-23-16 62 14 33-39 64-43 20-43-20-39-64 14-33Z" fill="#190606" stroke="#ff4e55" stroke-width="12" stroke-linejoin="round"/>
  <path d="m80 103 37 15-27 26-27-21Zm96 0-37 15 27 26 27-21Z" fill="#ff4e55"/>
  <path d="m110 165 18-13 18 13-18 19Z" fill="#ffad54"/>
  <path d="M93 188c22 14 48 14 70 0" fill="none" stroke="#ff4e55" stroke-width="9" stroke-linecap="round"/>
</svg>
SVG_EOF

cat > src/components/primitives/intel-card/IntelCard.tsx <<'INTEL_TSX_EOF'
import type {
  AnchorHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";

import styles from "./IntelCard.module.css";

export type IntelCardVariant = "player" | "match" | "crew" | "war";
export type IntelCardState =
  | "default"
  | "loading"
  | "partial"
  | "error"
  | "offline"
  | "stale";
export type IntelTone =
  | "neutral"
  | "positive"
  | "information"
  | "warning"
  | "danger"
  | "special";
export type IntelActionTone = "primary" | "secondary" | "danger" | "ghost";

export type IntelCardShellProps = Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "title"
> & {
  variant: IntelCardVariant;
  state?: IntelCardState;
  ariaLabel: string;
  eyebrow: ReactNode;
  title?: ReactNode;
  statusLabel?: ReactNode;
  statusTone?: IntelTone;
  partialMessage?: ReactNode;
  fallbackAction?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

export type IntelStatusPillProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: IntelTone;
  children: ReactNode;
};

export type IntelCardActionProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "children"
> & {
  tone?: IntelActionTone;
  children: ReactNode;
  disabled?: boolean;
};

export type IntelCardSectionProps = HTMLAttributes<HTMLElement> & {
  code?: string;
  title: ReactNode;
  children: ReactNode;
};

export type IntelMetricProps = HTMLAttributes<HTMLDivElement> & {
  label: ReactNode;
  value: ReactNode;
  detail?: ReactNode;
  tone?: IntelTone;
};

function joinClassNames(
  ...classNames: Array<string | false | null | undefined>
): string {
  return classNames.filter(Boolean).join(" ");
}

const variantClasses: Record<IntelCardVariant, string> = {
  player: styles.variantPlayer!,
  match: styles.variantMatch!,
  crew: styles.variantCrew!,
  war: styles.variantWar!,
};

const stateClasses: Record<IntelCardState, string> = {
  default: styles.stateDefault!,
  loading: styles.stateLoading!,
  partial: styles.statePartial!,
  error: styles.stateError!,
  offline: styles.stateOffline!,
  stale: styles.stateStale!,
};

const toneClasses: Record<IntelTone, string> = {
  neutral: styles.toneNeutral!,
  positive: styles.tonePositive!,
  information: styles.toneInformation!,
  warning: styles.toneWarning!,
  danger: styles.toneDanger!,
  special: styles.toneSpecial!,
};

const actionToneClasses: Record<IntelActionTone, string> = {
  primary: styles.actionPrimary!,
  secondary: styles.actionSecondary!,
  danger: styles.actionDanger!,
  ghost: styles.actionGhost!,
};

const stateLabels: Record<IntelCardState, string> = {
  default: "READY",
  loading: "LOADING",
  partial: "PARTIAL",
  error: "ERROR",
  offline: "OFFLINE",
  stale: "STALE",
};

const stateTones: Record<IntelCardState, IntelTone> = {
  default: "positive",
  loading: "information",
  partial: "warning",
  error: "danger",
  offline: "neutral",
  stale: "warning",
};

function LoadingBody() {
  return (
    <div aria-label="Loading intel card" className={styles.loadingBody!} role="status">
      <span className={styles.skeletonHero!} />
      <span className={styles.skeletonLine!} />
      <span className={styles.skeletonLineShort!} />
      <div className={styles.skeletonGrid!}>
        <span />
        <span />
        <span />
        <span />
      </div>
      <span className={styles.skeletonAction!} />
    </div>
  );
}

function BlockingState({
  state,
  fallbackAction,
}: {
  state: "error" | "offline";
  fallbackAction?: ReactNode;
}) {
  const isOffline = state === "offline";

  return (
    <div
      aria-live="polite"
      className={styles.blockingState!}
      role={isOffline ? "status" : "alert"}
    >
      <span aria-hidden="true" className={styles.blockingGlyph!}>
        {isOffline ? "OFF" : "!"}
      </span>
      <div>
        <strong>{isOffline ? "Intel unavailable offline" : "Intel module failed"}</strong>
        <p>
          {isOffline
            ? "Cached navigation and safe actions remain available. Reconnect to refresh this card."
            : "This card failed independently. Other command-centre modules remain operational."}
        </p>
      </div>
      {fallbackAction ? <div className={styles.fallbackAction!}>{fallbackAction}</div> : null}
    </div>
  );
}

export function IntelStatusPill({
  tone = "neutral",
  className,
  children,
  ...props
}: IntelStatusPillProps) {
  return (
    <span
      className={joinClassNames(styles.statusPill!, toneClasses[tone], className)}
      {...props}
    >
      {children}
    </span>
  );
}

export function IntelTag({
  tone = "neutral",
  className,
  children,
  ...props
}: IntelStatusPillProps) {
  return (
    <span
      className={joinClassNames(styles.tag!, toneClasses[tone], className)}
      {...props}
    >
      {children}
    </span>
  );
}

export function IntelCardShell({
  variant,
  state = "default",
  ariaLabel,
  eyebrow,
  title,
  statusLabel,
  statusTone = "positive",
  partialMessage,
  fallbackAction,
  children,
  footer,
  className,
  ...props
}: IntelCardShellProps) {
  const resolvedStatusLabel = state === "default" ? statusLabel : stateLabels[state];
  const resolvedStatusTone = state === "default" ? statusTone : stateTones[state];
  const isBlocking = state === "error" || state === "offline";

  return (
    <article
      aria-label={ariaLabel}
      className={joinClassNames(
        styles.card!,
        variantClasses[variant],
        stateClasses[state],
        className,
      )}
      data-intel-state={state}
      data-intel-variant={variant}
      {...props}
    >
      <header className={styles.header!}>
        <div className={styles.headerCopy!}>
          <span className={styles.eyebrow!}>{eyebrow}</span>
          {title ? <span className={styles.headerTitle!}>{title}</span> : null}
        </div>
        {resolvedStatusLabel ? (
          <IntelStatusPill tone={resolvedStatusTone}>
            {resolvedStatusLabel}
          </IntelStatusPill>
        ) : null}
      </header>

      {state === "loading" ? <LoadingBody /> : null}

      {isBlocking ? (
        <BlockingState fallbackAction={fallbackAction} state={state} />
      ) : null}

      {state !== "loading" && !isBlocking ? (
        <>
          {state === "partial" && partialMessage ? (
            <div className={styles.partialNotice!} role="status">
              <strong>Partial intel</strong>
              <span>{partialMessage}</span>
            </div>
          ) : null}
          {state === "stale" ? (
            <div className={styles.staleNotice!} role="status">
              Showing the last validated snapshot while fresh intel is requested.
            </div>
          ) : null}
          <div className={styles.body!}>{children}</div>
          {footer ? <footer className={styles.footer!}>{footer}</footer> : null}
        </>
      ) : null}
    </article>
  );
}

export function IntelCardSection({
  code,
  title,
  children,
  className,
  ...props
}: IntelCardSectionProps) {
  return (
    <section
      className={joinClassNames(styles.section!, className)}
      {...props}
    >
      <header className={styles.sectionHeader!}>
        {code ? <span className={styles.sectionCode!}>{code}</span> : null}
        <h4>{title}</h4>
        <span aria-hidden="true" className={styles.sectionRule!} />
      </header>
      <div className={styles.sectionBody!}>{children}</div>
    </section>
  );
}

export function IntelMetricGrid({
  className,
  ...props
}: HTMLAttributes<HTMLDListElement>) {
  return (
    <dl
      className={joinClassNames(styles.metricGrid!, className)}
      {...props}
    />
  );
}

export function IntelMetric({
  label,
  value,
  detail,
  tone = "neutral",
  className,
  ...props
}: IntelMetricProps) {
  return (
    <div
      className={joinClassNames(styles.metric!, toneClasses[tone], className)}
      {...props}
    >
      <dt>{label}</dt>
      <dd>{value}</dd>
      {detail ? <span>{detail}</span> : null}
    </div>
  );
}

export function IntelCardActions({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={joinClassNames(styles.actions!, className)}
      {...props}
    />
  );
}

export function IntelCardAction({
  tone = "secondary",
  disabled = false,
  className,
  children,
  href,
  ...props
}: IntelCardActionProps) {
  const classes = joinClassNames(
    styles.action!,
    actionToneClasses[tone],
    disabled && styles.actionDisabled!,
    className,
  );

  if (disabled || !href) {
    return (
      <span aria-disabled="true" className={classes}>
        {children}
      </span>
    );
  }

  return (
    <a className={classes} href={href} {...props}>
      {children}
    </a>
  );
}
INTEL_TSX_EOF

cat > src/components/primitives/intel-card/IntelCard.module.css <<'INTEL_CSS_EOF'
.card {
  --intel-accent: var(--vz-intel-player);
  position: relative;
  isolation: isolate;
  container-name: intel-card;
  container-type: inline-size;
  min-width: 0;
  overflow: hidden;
  color: var(--vz-intel-text);
  background: var(--vz-intel-background);
  border: 1px solid var(--vz-intel-border);
  box-shadow: var(--vz-intel-shadow), var(--vz-intel-glow);
  clip-path: polygon(
    var(--vz-intel-cut) 0,
    calc(100% - 0.45rem) 0,
    100% 0.45rem,
    100% calc(100% - var(--vz-intel-cut)),
    calc(100% - var(--vz-intel-cut)) 100%,
    0.45rem 100%,
    0 calc(100% - 0.45rem),
    0 var(--vz-intel-cut)
  );
}

.card::before,
.card::after {
  position: absolute;
  z-index: -1;
  content: "";
  pointer-events: none;
}

.card::before {
  inset: 0;
  background:
    linear-gradient(90deg, var(--intel-accent), transparent 24%) top left / 100% 1px no-repeat,
    linear-gradient(180deg, var(--intel-accent), transparent 30%) top left / 1px 100% no-repeat,
    repeating-linear-gradient(90deg, transparent 0 15px, rgb(255 255 255 / 2%) 15px 16px);
  opacity: 0.72;
}

.card::after {
  right: -5rem;
  bottom: -6rem;
  width: 15rem;
  height: 15rem;
  background: radial-gradient(circle, color-mix(in srgb, var(--intel-accent) 18%, transparent), transparent 68%);
  filter: blur(0.25rem);
}

.variantPlayer {
  --intel-accent: var(--vz-intel-player);
}

.variantMatch {
  --intel-accent: var(--vz-intel-match);
}

.variantCrew {
  --intel-accent: var(--vz-intel-crew);
}

.variantWar {
  --intel-accent: var(--vz-intel-war);
}

.statePartial {
  border-color: color-mix(in srgb, var(--vz-intel-warning) 60%, transparent);
}

.stateError {
  --intel-accent: var(--vz-intel-danger);
}

.stateOffline {
  --intel-accent: var(--vz-intel-offline);
}

.stateStale {
  border-color: color-mix(in srgb, var(--vz-intel-warning) 44%, transparent);
}

.stateDefault,
.stateLoading {
  min-width: 0;
}

.header {
  display: flex;
  min-height: 3.25rem;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem var(--vz-intel-padding);
  background: linear-gradient(180deg, rgb(13 18 21 / 96%), rgb(5 8 10 / 94%));
  border-bottom: 1px solid color-mix(in srgb, var(--intel-accent) 28%, var(--vz-intel-border));
}

.headerCopy {
  display: flex;
  min-width: 0;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.45rem 0.7rem;
}

.eyebrow,
.headerTitle,
.statusPill,
.tag,
.sectionCode,
.action,
.metric dt {
  font-family: var(--font-rajdhani, "Arial Narrow", sans-serif);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.eyebrow {
  color: var(--intel-accent);
  font-size: 0.75rem;
}

.headerTitle {
  overflow: hidden;
  color: var(--vz-intel-muted);
  font-size: 0.68rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.statusPill,
.tag {
  display: inline-flex;
  width: max-content;
  max-width: 100%;
  align-items: center;
  justify-content: center;
  border: 1px solid currentColor;
  background: rgb(4 8 9 / 72%);
  box-shadow: inset 0 0 0.65rem color-mix(in srgb, currentColor 12%, transparent);
  clip-path: polygon(0.35rem 0, 100% 0, 100% calc(100% - 0.35rem), calc(100% - 0.35rem) 100%, 0 100%, 0 0.35rem);
}

.statusPill {
  flex: 0 0 auto;
  min-height: 1.65rem;
  padding: 0.25rem 0.55rem;
  font-size: 0.66rem;
}

.tag {
  min-height: 1.75rem;
  padding: 0.25rem 0.55rem;
  font-size: 0.68rem;
}

.toneNeutral {
  color: var(--vz-intel-muted);
}

.tonePositive {
  color: var(--vz-intel-player);
}

.toneInformation {
  color: var(--vz-intel-match);
}

.toneWarning {
  color: var(--vz-intel-warning);
}

.toneDanger {
  color: var(--vz-intel-danger);
}

.toneSpecial {
  color: var(--vz-intel-crew);
}

.body {
  display: grid;
  min-width: 0;
  gap: var(--vz-intel-gap);
  padding: var(--vz-intel-padding);
}

.footer {
  padding: 0 var(--vz-intel-padding) var(--vz-intel-padding);
}

.partialNotice,
.staleNotice {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin: 0.75rem var(--vz-intel-padding) 0;
  padding: 0.65rem 0.75rem;
  color: var(--vz-intel-warning);
  background: rgb(255 206 92 / 8%);
  border: 1px solid rgb(255 206 92 / 28%);
  font-size: 0.78rem;
}

.partialNotice {
  flex-direction: column;
}

.partialNotice strong {
  font-family: var(--font-rajdhani, "Arial Narrow", sans-serif);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.staleNotice {
  color: var(--vz-intel-muted);
}

.loadingBody {
  display: grid;
  gap: 0.75rem;
  min-height: 18rem;
  padding: var(--vz-intel-padding);
}

.loadingBody > span,
.skeletonGrid span {
  display: block;
  overflow: hidden;
  background:
    linear-gradient(90deg, transparent, rgb(255 255 255 / 8%), transparent),
    rgb(255 255 255 / 5%);
  background-size: 180% 100%;
  animation: intelShimmer 1.4s linear infinite;
}

.skeletonHero {
  height: 6rem;
}

.skeletonLine {
  width: 76%;
  height: 0.9rem;
}

.skeletonLineShort {
  width: 48%;
  height: 0.75rem;
}

.skeletonGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

.skeletonGrid span {
  height: 4rem;
}

.skeletonAction {
  height: var(--vz-intel-action-height);
  margin-top: auto;
}

.blockingState {
  display: grid;
  min-height: 16rem;
  place-content: center;
  gap: 1rem;
  padding: 1.5rem;
  text-align: center;
}

.blockingGlyph {
  display: grid;
  width: 3.5rem;
  height: 3.5rem;
  place-items: center;
  margin: 0 auto;
  color: var(--intel-accent);
  border: 1px solid currentColor;
  font-family: var(--font-rajdhani, "Arial Narrow", sans-serif);
  font-size: 1.2rem;
  font-weight: 800;
  clip-path: polygon(20% 0, 80% 0, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0 80%, 0 20%);
}

.blockingState strong {
  display: block;
  margin-bottom: 0.35rem;
  font-family: var(--font-rajdhani, "Arial Narrow", sans-serif);
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.blockingState p {
  max-width: 34rem;
  margin: 0;
  color: var(--vz-intel-muted);
  font-size: 0.85rem;
  line-height: 1.55;
}

.fallbackAction {
  width: min(100%, 19rem);
  margin-inline: auto;
}

.section {
  min-width: 0;
}

.sectionHeader {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.55rem;
}

.sectionHeader h4 {
  flex: 0 0 auto;
  margin: 0;
  color: var(--vz-intel-text);
  font-family: var(--font-rajdhani, "Arial Narrow", sans-serif);
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.sectionCode {
  flex: 0 0 auto;
  color: var(--intel-accent);
  font-size: 0.68rem;
}

.sectionRule {
  min-width: 1rem;
  height: 1px;
  flex: 1;
  background: linear-gradient(90deg, var(--intel-accent), transparent);
}

.sectionBody {
  min-width: 0;
}

.metricGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
  margin: 0;
}

.metric {
  min-width: 0;
  padding: 0.65rem;
  background: var(--vz-intel-background-raised);
  border: 1px solid var(--vz-intel-border);
}

.metric dt,
.metric dd {
  margin: 0;
}

.metric dt {
  color: var(--vz-intel-muted);
  font-size: 0.62rem;
}

.metric dd {
  overflow-wrap: anywhere;
  color: currentColor;
  font-family: var(--font-rajdhani, "Arial Narrow", sans-serif);
  font-size: clamp(1rem, 4cqi, 1.35rem);
  font-weight: 800;
  line-height: 1.05;
}

.metric span {
  display: block;
  margin-top: 0.2rem;
  color: var(--vz-intel-muted);
  font-size: 0.68rem;
  line-height: 1.3;
}

.actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
}

.action {
  display: inline-flex;
  min-width: 0;
  min-height: var(--vz-intel-action-height);
  align-items: center;
  justify-content: center;
  padding: 0.65rem 0.85rem;
  color: var(--vz-intel-text);
  text-align: center;
  text-decoration: none;
  border: 1px solid var(--vz-intel-border-strong);
  transition: var(--vz-intel-transition);
  clip-path: polygon(0.55rem 0, 100% 0, 100% calc(100% - 0.55rem), calc(100% - 0.55rem) 100%, 0 100%, 0 0.55rem);
}

.action:hover {
  border-color: currentColor;
  transform: translateY(-1px);
}

.action:focus-visible {
  outline: 2px solid var(--intel-accent);
  outline-offset: 2px;
}

.actionPrimary {
  color: #03110a;
  background: linear-gradient(135deg, #72ff87, var(--vz-intel-player));
  border-color: var(--vz-intel-player);
}

.actionSecondary {
  color: var(--intel-accent);
  background: color-mix(in srgb, var(--intel-accent) 7%, rgb(4 8 10 / 88%));
  border-color: color-mix(in srgb, var(--intel-accent) 48%, transparent);
}

.actionDanger {
  color: var(--vz-intel-danger);
  background: rgb(255 78 85 / 7%);
  border-color: rgb(255 78 85 / 48%);
}

.actionGhost {
  color: var(--vz-intel-muted);
  background: rgb(255 255 255 / 2%);
}

.actionDisabled {
  cursor: not-allowed;
  opacity: 0.42;
}

@container intel-card (min-width: 31rem) {
  .metricGrid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .partialNotice {
    flex-direction: row;
  }
}

@media (prefers-reduced-motion: reduce) {
  .action,
  .loadingBody > span,
  .skeletonGrid span {
    transition: none;
    animation: none;
  }
}

@media (forced-colors: active) {
  .card,
  .metric,
  .statusPill,
  .tag,
  .action,
  .partialNotice,
  .staleNotice {
    border: 1px solid CanvasText;
  }

  .actionPrimary {
    color: ButtonText;
    background: ButtonFace;
  }
}

@keyframes intelShimmer {
  to {
    background-position: -180% 0;
  }
}
INTEL_CSS_EOF

cat > src/components/primitives/intel-card/index.ts <<'INTEL_INDEX_EOF'
export {
  IntelCardAction,
  IntelCardActions,
  IntelCardSection,
  IntelCardShell,
  IntelMetric,
  IntelMetricGrid,
  IntelStatusPill,
  IntelTag,
} from "./IntelCard";
export type {
  IntelActionTone,
  IntelCardActionProps,
  IntelCardSectionProps,
  IntelCardShellProps,
  IntelCardState,
  IntelCardVariant,
  IntelMetricProps,
  IntelStatusPillProps,
  IntelTone,
} from "./IntelCard";
INTEL_INDEX_EOF

cat > src/components/primitives/intel-card/IntelCard.test.tsx <<'INTEL_TEST_EOF'
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  IntelCardAction,
  IntelCardActions,
  IntelCardShell,
  IntelMetric,
  IntelMetricGrid,
} from "./IntelCard";

describe("IntelCardShell", () => {
  it("renders domain-neutral intel content and actions", () => {
    render(
      <IntelCardShell
        ariaLabel="Test player intel"
        eyebrow="Player intel"
        statusLabel="Verified"
        variant="player"
      >
        <IntelMetricGrid>
          <IntelMetric label="Rank" value="#24" />
        </IntelMetricGrid>
        <IntelCardActions>
          <IntelCardAction href="/players/test" tone="primary">
            View player
          </IntelCardAction>
        </IntelCardActions>
      </IntelCardShell>,
    );

    expect(
      screen.getByRole("article", { name: "Test player intel" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View player" })).toHaveAttribute(
      "href",
      "/players/test",
    );
  });

  it("contains loading without rendering feature content", () => {
    render(
      <IntelCardShell
        ariaLabel="Loading test intel"
        eyebrow="Match intel"
        state="loading"
        variant="match"
      >
        <span>Private content</span>
      </IntelCardShell>,
    );

    expect(screen.getByRole("status", { name: "Loading intel card" })).toBeVisible();
    expect(screen.queryByText("Private content")).not.toBeInTheDocument();
  });

  it("isolates an error and preserves its fallback action", () => {
    render(
      <IntelCardShell
        ariaLabel="Failed intel"
        eyebrow="Crew intel"
        fallbackAction={
          <IntelCardAction href="/crews">Browse crews</IntelCardAction>
        }
        state="error"
        variant="crew"
      >
        <span>Unavailable content</span>
      </IntelCardShell>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Intel module failed");
    expect(screen.getByRole("link", { name: "Browse crews" })).toBeVisible();
    expect(screen.queryByText("Unavailable content")).not.toBeInTheDocument();
  });
});
INTEL_TEST_EOF

cat > src/features/profiles/intel-card/player-intel.types.ts <<'PLAYER_TYPES_EOF'
export type PlayerFormResult = "W" | "D" | "L";

export type PlayerIntelViewModel = {
  id: string;
  displayName: string;
  handle: string;
  subtitle: string;
  locationLabel: string;
  gameLabel: string;
  crewName: string;
  avatarSrc: string;
  rank: number;
  trust: number;
  verified: boolean;
  wins: number;
  winRateLabel: string;
  pointsLabel: string;
  streakLabel: string;
  recentForm: readonly PlayerFormResult[];
  profileHref: string;
  challengeHref: string | null;
};
PLAYER_TYPES_EOF

cat > src/features/profiles/intel-card/player-intel.mock.ts <<'PLAYER_MOCK_EOF'
import type { PlayerIntelViewModel } from "./player-intel.types";

export const playerIntelMock: PlayerIntelViewModel = {
  id: "player-jayflex",
  displayName: "JAYFLEX",
  handle: "@jayflex",
  subtitle: "Elite Competitor",
  locationLabel: "Lagos, Nigeria",
  gameLabel: "EA FC",
  crewName: "Mainland Titans",
  avatarSrc: "/intel-cards/jayflex.svg",
  rank: 24,
  trust: 96,
  verified: true,
  wins: 24,
  winRateLabel: "77.4%",
  pointsLabel: "2,310",
  streakLabel: "W7",
  recentForm: ["W", "W", "W", "D", "L", "W"],
  profileHref: "/players/player-jayflex",
  challengeHref: "/matches/challenge/player-jayflex",
};
PLAYER_MOCK_EOF

cat > src/features/profiles/intel-card/PlayerIntelCard.tsx <<'PLAYER_TSX_EOF'
import type { IntelCardState } from "@/components/primitives/intel-card";
import {
  IntelCardAction,
  IntelCardActions,
  IntelCardSection,
  IntelCardShell,
  IntelMetric,
  IntelMetricGrid,
  IntelStatusPill,
  IntelTag,
} from "@/components/primitives/intel-card";

import styles from "./PlayerIntelCard.module.css";
import type {
  PlayerFormResult,
  PlayerIntelViewModel,
} from "./player-intel.types";

export type PlayerIntelCardProps = {
  model: PlayerIntelViewModel;
  state?: IntelCardState;
};

const formTone: Record<PlayerFormResult, "positive" | "warning" | "danger"> = {
  W: "positive",
  D: "warning",
  L: "danger",
};

export function PlayerIntelCard({
  model,
  state = "default",
}: PlayerIntelCardProps) {
  return (
    <IntelCardShell
      ariaLabel={`Player intel for ${model.displayName}`}
      eyebrow="Player intel"
      fallbackAction={
        <IntelCardAction href={model.profileHref}>Open profile</IntelCardAction>
      }
      partialMessage="Recent-form telemetry is delayed. Verified rank and points remain available."
      state={state}
      statusLabel={model.verified ? "Verified" : "Unverified"}
      statusTone={model.verified ? "positive" : "warning"}
      title={`Rank #${model.rank}`}
      variant="player"
    >
      <div className={styles.hero!}>
        <img
          alt={`${model.displayName} player portrait`}
          className={styles.avatar!}
          height="120"
          src={model.avatarSrc}
          width="120"
        />

        <div className={styles.identity!}>
          <div className={styles.nameRow!}>
            <div>
              <h3>{model.displayName}</h3>
              <p className={styles.handle!}>{model.handle}</p>
            </div>
            <IntelStatusPill tone="special">#{model.rank}</IntelStatusPill>
          </div>
          <p className={styles.subtitle!}>{model.subtitle}</p>
          <p className={styles.location!}>{model.locationLabel}</p>
          <div className={styles.tags!}>
            <IntelTag tone="special">{model.crewName}</IntelTag>
            <IntelTag tone="positive">{model.gameLabel}</IntelTag>
          </div>
        </div>

        <div aria-label={`Trust score ${model.trust}`} className={styles.trust!}>
          <span>Trust</span>
          <strong>{model.trust}</strong>
        </div>
      </div>

      <IntelCardSection code="P.1" title="Performance snapshot">
        <IntelMetricGrid>
          <IntelMetric label="Wins" tone="positive" value={model.wins} />
          <IntelMetric label="Win rate" tone="positive" value={model.winRateLabel} />
          <IntelMetric label="Points" value={model.pointsLabel} />
          <IntelMetric label="Streak" tone="positive" value={model.streakLabel} />
        </IntelMetricGrid>
      </IntelCardSection>

      <IntelCardSection code="P.2" title="Recent form">
        <div aria-label="Recent form" className={styles.form!}>
          {model.recentForm.map((result, index) => (
            <IntelStatusPill key={`${result}-${index}`} tone={formTone[result]}>
              {result}
            </IntelStatusPill>
          ))}
        </div>
      </IntelCardSection>

      <IntelCardActions>
        <IntelCardAction href={model.profileHref} tone="primary">
          View full profile
        </IntelCardAction>
        {model.challengeHref ? (
          <IntelCardAction href={model.challengeHref}>Challenge</IntelCardAction>
        ) : (
          <IntelCardAction disabled>Challenge unavailable</IntelCardAction>
        )}
      </IntelCardActions>
    </IntelCardShell>
  );
}
PLAYER_TSX_EOF

cat > src/features/profiles/intel-card/PlayerIntelCard.module.css <<'PLAYER_CSS_EOF'
.hero {
  display: grid;
  min-width: 0;
  grid-template-columns: 4.5rem minmax(0, 1fr);
  gap: 0.85rem;
  align-items: center;
}

.avatar {
  width: 4.5rem;
  height: 4.5rem;
  object-fit: cover;
  background: #05100b;
  border: 1px solid var(--vz-intel-player);
  border-radius: 50%;
  box-shadow: 0 0 1.2rem rgb(0 255 135 / 20%);
}

.identity {
  min-width: 0;
}

.nameRow {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.nameRow h3,
.handle,
.subtitle,
.location {
  margin: 0;
}

.nameRow h3 {
  overflow: hidden;
  color: var(--vz-intel-text);
  font-family: var(--font-rajdhani, "Arial Narrow", sans-serif);
  font-size: clamp(1.25rem, 7cqi, 1.85rem);
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.handle,
.location {
  color: var(--vz-intel-muted);
  font-size: 0.72rem;
}

.subtitle {
  color: var(--vz-intel-player);
  font-family: var(--font-rajdhani, "Arial Narrow", sans-serif);
  font-size: 0.85rem;
  font-weight: 700;
}

.tags,
.form {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.55rem;
}

.trust {
  display: none;
  min-width: 4.5rem;
  padding: 0.55rem;
  text-align: center;
  border: 1px solid rgb(164 79 255 / 48%);
}

.trust span,
.trust strong {
  display: block;
  font-family: var(--font-rajdhani, "Arial Narrow", sans-serif);
  text-transform: uppercase;
}

.trust span {
  color: var(--vz-intel-muted);
  font-size: 0.62rem;
}

.trust strong {
  color: var(--vz-intel-crew);
  font-size: 1.35rem;
}

@container intel-card (min-width: 32rem) {
  .hero {
    grid-template-columns: 5.75rem minmax(0, 1fr) auto;
  }

  .avatar {
    width: 5.75rem;
    height: 5.75rem;
  }

  .trust {
    display: block;
  }
}

@container intel-card (min-width: 48rem) {
  .hero {
    grid-template-columns: 7rem minmax(0, 1fr) 5.5rem;
  }

  .avatar {
    width: 7rem;
    height: 7rem;
  }
}
PLAYER_CSS_EOF

cat > src/features/profiles/intel-card/PlayerIntelCard.test.tsx <<'PLAYER_TEST_EOF'
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PlayerIntelCard } from "./PlayerIntelCard";
import { playerIntelMock } from "./player-intel.mock";

describe("PlayerIntelCard", () => {
  it("renders the approved player snapshot hierarchy", () => {
    render(<PlayerIntelCard model={playerIntelMock} />);

    expect(
      screen.getByRole("article", { name: "Player intel for JAYFLEX" }),
    ).toBeInTheDocument();
    expect(screen.getByText("77.4%")).toBeVisible();
    expect(screen.getByText("2,310")).toBeVisible();
    expect(screen.getByRole("link", { name: "View full profile" })).toHaveAttribute(
      "href",
      playerIntelMock.profileHref,
    );
  });

  it("discloses partial data without removing validated metrics", () => {
    render(<PlayerIntelCard model={playerIntelMock} state="partial" />);

    expect(screen.getByText("Partial intel")).toBeVisible();
    expect(screen.getByText("2,310")).toBeVisible();
  });
});
PLAYER_TEST_EOF

cat > src/features/profiles/intel-card/index.ts <<'PLAYER_INDEX_EOF'
export { PlayerIntelCard } from "./PlayerIntelCard";
export type { PlayerIntelCardProps } from "./PlayerIntelCard";
export { playerIntelMock } from "./player-intel.mock";
export type {
  PlayerFormResult,
  PlayerIntelViewModel,
} from "./player-intel.types";
PLAYER_INDEX_EOF

cat > src/features/crews/intel-card/crew-intel.types.ts <<'CREW_TYPES_EOF'
export type CrewIntelViewModel = {
  id: string;
  name: string;
  tag: string;
  tierLabel: string;
  locationLabel: string;
  emblemSrc: string;
  rank: number;
  trust: number;
  verified: boolean;
  reputationLabel: string;
  membersLabel: string;
  winRateLabel: string;
  warRecordLabel: string;
  crewHref: string;
  joinWarHref: string | null;
};
CREW_TYPES_EOF

cat > src/features/crews/intel-card/crew-intel.mock.ts <<'CREW_MOCK_EOF'
import type { CrewIntelViewModel } from "./crew-intel.types";

export const crewIntelMock: CrewIntelViewModel = {
  id: "crew-mainland-titans",
  name: "MAINLAND TITANS",
  tag: "MT",
  tierLabel: "Tier 1 Crew",
  locationLabel: "Lagos, Nigeria",
  emblemSrc: "/intel-cards/mainland-titans.svg",
  rank: 2,
  trust: 91,
  verified: true,
  reputationLabel: "8,450",
  membersLabel: "6 / 8",
  winRateLabel: "68.5%",
  warRecordLabel: "12 - 3",
  crewHref: "/crews/crew-mainland-titans",
  joinWarHref: "/crews/crew-mainland-titans/wars",
};
CREW_MOCK_EOF

cat > src/features/crews/intel-card/CrewIntelCard.tsx <<'CREW_TSX_EOF'
import type { IntelCardState } from "@/components/primitives/intel-card";
import {
  IntelCardAction,
  IntelCardActions,
  IntelCardSection,
  IntelCardShell,
  IntelMetric,
  IntelMetricGrid,
  IntelStatusPill,
  IntelTag,
} from "@/components/primitives/intel-card";

import styles from "./CrewIntelCard.module.css";
import type { CrewIntelViewModel } from "./crew-intel.types";

export type CrewIntelCardProps = {
  model: CrewIntelViewModel;
  state?: IntelCardState;
};

export function CrewIntelCard({
  model,
  state = "default",
}: CrewIntelCardProps) {
  return (
    <IntelCardShell
      ariaLabel={`Crew intel for ${model.name}`}
      eyebrow="Crew intel"
      fallbackAction={
        <IntelCardAction href={model.crewHref}>Open crew profile</IntelCardAction>
      }
      partialMessage="Roster availability is delayed. Verified rank and war record remain visible."
      state={state}
      statusLabel={model.verified ? "Verified" : "Pending trust"}
      statusTone={model.verified ? "positive" : "warning"}
      title={`Rank #${model.rank}`}
      variant="crew"
    >
      <div className={styles.hero!}>
        <img
          alt={`${model.name} crew emblem`}
          className={styles.emblem!}
          height="128"
          src={model.emblemSrc}
          width="128"
        />
        <div className={styles.identity!}>
          <div className={styles.nameRow!}>
            <div>
              <h3>{model.name}</h3>
              <p>{model.locationLabel}</p>
            </div>
            <IntelStatusPill tone="special">{model.tag}</IntelStatusPill>
          </div>
          <div className={styles.tags!}>
            <IntelTag tone="special">{model.tierLabel}</IntelTag>
            <IntelTag tone="warning">Rank #{model.rank}</IntelTag>
          </div>
        </div>
        <div aria-label={`Trust score ${model.trust}`} className={styles.trust!}>
          <span>Trust</span>
          <strong>{model.trust}</strong>
        </div>
      </div>

      <IntelCardSection code="C.1" title="Crew performance">
        <IntelMetricGrid>
          <IntelMetric label="Reputation" tone="special" value={model.reputationLabel} />
          <IntelMetric label="Members" value={model.membersLabel} />
          <IntelMetric label="Win rate" tone="positive" value={model.winRateLabel} />
          <IntelMetric label="War record" tone="warning" value={model.warRecordLabel} />
        </IntelMetricGrid>
      </IntelCardSection>

      <IntelCardActions>
        <IntelCardAction href={model.crewHref} tone="primary">
          View crew HQ
        </IntelCardAction>
        {model.joinWarHref ? (
          <IntelCardAction href={model.joinWarHref}>Join war</IntelCardAction>
        ) : (
          <IntelCardAction disabled>War unavailable</IntelCardAction>
        )}
      </IntelCardActions>
    </IntelCardShell>
  );
}
CREW_TSX_EOF

cat > src/features/crews/intel-card/CrewIntelCard.module.css <<'CREW_CSS_EOF'
.hero {
  display: grid;
  min-width: 0;
  grid-template-columns: 4.75rem minmax(0, 1fr);
  gap: 0.85rem;
  align-items: center;
}

.emblem {
  width: 4.75rem;
  height: 4.75rem;
  object-fit: contain;
  filter: drop-shadow(0 0 0.85rem rgb(164 79 255 / 28%));
}

.identity {
  min-width: 0;
}

.nameRow {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.nameRow h3,
.nameRow p {
  margin: 0;
}

.nameRow h3 {
  overflow: hidden;
  font-family: var(--font-rajdhani, "Arial Narrow", sans-serif);
  font-size: clamp(1.15rem, 6cqi, 1.8rem);
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nameRow p {
  margin-top: 0.3rem;
  color: var(--vz-intel-muted);
  font-size: 0.72rem;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.65rem;
}

.trust {
  display: none;
  min-width: 4.5rem;
  padding: 0.55rem;
  text-align: center;
  border: 1px solid rgb(164 79 255 / 48%);
}

.trust span,
.trust strong {
  display: block;
  font-family: var(--font-rajdhani, "Arial Narrow", sans-serif);
  text-transform: uppercase;
}

.trust span {
  color: var(--vz-intel-muted);
  font-size: 0.62rem;
}

.trust strong {
  color: var(--vz-intel-crew);
  font-size: 1.35rem;
}

@container intel-card (min-width: 32rem) {
  .hero {
    grid-template-columns: 6rem minmax(0, 1fr) auto;
  }

  .emblem {
    width: 6rem;
    height: 6rem;
  }

  .trust {
    display: block;
  }
}

@container intel-card (min-width: 48rem) {
  .hero {
    grid-template-columns: 7rem minmax(0, 1fr) 5.5rem;
  }

  .emblem {
    width: 7rem;
    height: 7rem;
  }
}
CREW_CSS_EOF

cat > src/features/crews/intel-card/CrewIntelCard.test.tsx <<'CREW_TEST_EOF'
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CrewIntelCard } from "./CrewIntelCard";
import { crewIntelMock } from "./crew-intel.mock";

describe("CrewIntelCard", () => {
  it("renders Crew identity, trust and competitive metrics", () => {
    render(<CrewIntelCard model={crewIntelMock} />);

    expect(
      screen.getByRole("article", { name: "Crew intel for MAINLAND TITANS" }),
    ).toBeInTheDocument();
    expect(screen.getByText("8,450")).toBeVisible();
    expect(screen.getByText("12 - 3")).toBeVisible();
    expect(screen.getByRole("link", { name: "View crew HQ" })).toHaveAttribute(
      "href",
      crewIntelMock.crewHref,
    );
  });

  it("contains an offline failure inside the Crew card", () => {
    render(<CrewIntelCard model={crewIntelMock} state="offline" />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Intel unavailable offline",
    );
    expect(screen.getByRole("link", { name: "Open crew profile" })).toBeVisible();
  });
});
CREW_TEST_EOF

cat > src/features/crews/intel-card/index.ts <<'CREW_INDEX_EOF'
export { CrewIntelCard } from "./CrewIntelCard";
export type { CrewIntelCardProps } from "./CrewIntelCard";
export { crewIntelMock } from "./crew-intel.mock";
export type { CrewIntelViewModel } from "./crew-intel.types";
CREW_INDEX_EOF

cat > src/features/matches/intel-card/match-intel.types.ts <<'MATCH_TYPES_EOF'
export type MatchSideViewModel = {
  name: string;
  tag: string;
  sideLabel: string;
  emblemSrc: string;
};

export type MatchIntelViewModel = {
  id: string;
  weekLabel: string;
  statusLabel: string;
  countdownLabel: string;
  startsAtLabel: string;
  gameLabel: string;
  formatLabel: string;
  home: MatchSideViewModel;
  away: MatchSideViewModel;
  prizePoolLabel: string;
  stakesLabel: string;
  checkInClosesLabel: string;
  matchHref: string;
  checkInHref: string | null;
};

export type WarLaneResult = {
  laneLabel: string;
  result: "W" | "L" | "P";
};

export type WarMatchIntelViewModel = {
  id: string;
  statusLabel: string;
  live: boolean;
  scoreLabel: string;
  formatLabel: string;
  home: MatchSideViewModel;
  away: MatchSideViewModel;
  lanes: readonly WarLaneResult[];
  roundLabel: string;
  mapLabel: string;
  startedAtLabel: string;
  warHref: string;
  followHref: string | null;
};
MATCH_TYPES_EOF

cat > src/features/matches/intel-card/match-intel.mock.ts <<'MATCH_MOCK_EOF'
import type {
  MatchIntelViewModel,
  WarMatchIntelViewModel,
} from "./match-intel.types";

const mainlandTitans = {
  name: "MAINLAND TITANS",
  tag: "MT",
  sideLabel: "Home",
  emblemSrc: "/intel-cards/mainland-titans.svg",
} as const;

const lagosLynx = {
  name: "LAGOS LYNX",
  tag: "LLX",
  sideLabel: "Away",
  emblemSrc: "/intel-cards/lagos-lynx.svg",
} as const;

export const matchIntelMock: MatchIntelViewModel = {
  id: "match-m-1487",
  weekLabel: "Week 14",
  statusLabel: "Check-in open",
  countdownLabel: "18:30",
  startsAtLabel: "Starts in",
  gameLabel: "EA FC",
  formatLabel: "BO3 - War Day - Ranked 1v1 - 4 lanes",
  home: mainlandTitans,
  away: lagosLynx,
  prizePoolLabel: "520",
  stakesLabel: "60",
  checkInClosesLabel: "17:50",
  matchHref: "/matches/match-m-1487",
  checkInHref: "/matches/match-m-1487/check-in",
};

export const warMatchIntelMock: WarMatchIntelViewModel = {
  id: "war-w-125",
  statusLabel: "War match",
  live: true,
  scoreLabel: "2 - 1",
  formatLabel: "BO5 - 4 lanes",
  home: mainlandTitans,
  away: lagosLynx,
  lanes: [
    { laneLabel: "Lane 1", result: "W" },
    { laneLabel: "Lane 2", result: "W" },
    { laneLabel: "Lane 3", result: "L" },
    { laneLabel: "Lane 4", result: "P" },
  ],
  roundLabel: "4 / 5",
  mapLabel: "N/A",
  startedAtLabel: "19:40",
  warHref: "/matches/war-w-125",
  followHref: "/matches/war-w-125/live",
};
MATCH_MOCK_EOF

cat > src/features/matches/intel-card/MatchIntelCard.tsx <<'MATCH_TSX_EOF'
import type { IntelCardState } from "@/components/primitives/intel-card";
import {
  IntelCardAction,
  IntelCardActions,
  IntelCardSection,
  IntelCardShell,
  IntelMetric,
  IntelMetricGrid,
  IntelStatusPill,
  IntelTag,
} from "@/components/primitives/intel-card";

import styles from "./MatchIntelCard.module.css";
import type { MatchIntelViewModel } from "./match-intel.types";

export type MatchIntelCardProps = {
  model: MatchIntelViewModel;
  state?: IntelCardState;
};

export function MatchIntelCard({
  model,
  state = "default",
}: MatchIntelCardProps) {
  return (
    <IntelCardShell
      ariaLabel={`Match intel for ${model.home.name} versus ${model.away.name}`}
      eyebrow="Match intel"
      fallbackAction={
        <IntelCardAction href={model.matchHref}>Open match</IntelCardAction>
      }
      partialMessage="Hype and audience telemetry are delayed. Check-in and match timing remain authoritative."
      state={state}
      statusLabel={model.statusLabel}
      statusTone="positive"
      title={model.weekLabel}
      variant="match"
    >
      <div className={styles.matchup!}>
        <div className={styles.side!}>
          <img alt={`${model.home.name} emblem`} src={model.home.emblemSrc} />
          <strong>{model.home.name}</strong>
          <span>{model.home.sideLabel}</span>
        </div>

        <div className={styles.countdown!}>
          <span>{model.startsAtLabel}</span>
          <strong>{model.countdownLabel}</strong>
          <IntelTag tone="warning">{model.gameLabel}</IntelTag>
        </div>

        <div className={styles.side!}>
          <img alt={`${model.away.name} emblem`} src={model.away.emblemSrc} />
          <strong>{model.away.name}</strong>
          <span>{model.away.sideLabel}</span>
        </div>
      </div>

      <p className={styles.format!}>{model.formatLabel}</p>

      <IntelCardSection code="M.1" title="Match operations">
        <IntelMetricGrid>
          <IntelMetric label="Prize pool" tone="positive" value={model.prizePoolLabel} />
          <IntelMetric label="Stakes" tone="warning" value={model.stakesLabel} />
          <IntelMetric label="Check-in closes" value={model.checkInClosesLabel} />
          <IntelMetric label="Match ID" tone="information" value={model.id.replace("match-", "").toUpperCase()} />
        </IntelMetricGrid>
      </IntelCardSection>

      <IntelCardActions>
        <IntelCardAction href={model.matchHref}>View details</IntelCardAction>
        {model.checkInHref ? (
          <IntelCardAction href={model.checkInHref} tone="primary">
            Check in
          </IntelCardAction>
        ) : (
          <IntelCardAction disabled>Check-in unavailable</IntelCardAction>
        )}
      </IntelCardActions>
    </IntelCardShell>
  );
}
MATCH_TSX_EOF

cat > src/features/matches/intel-card/WarMatchIntelCard.tsx <<'WAR_TSX_EOF'
import type { IntelCardState } from "@/components/primitives/intel-card";
import {
  IntelCardAction,
  IntelCardActions,
  IntelCardSection,
  IntelCardShell,
  IntelMetric,
  IntelMetricGrid,
  IntelStatusPill,
} from "@/components/primitives/intel-card";

import styles from "./MatchIntelCard.module.css";
import type {
  WarLaneResult,
  WarMatchIntelViewModel,
} from "./match-intel.types";

export type WarMatchIntelCardProps = {
  model: WarMatchIntelViewModel;
  state?: IntelCardState;
};

const laneTone: Record<
  WarLaneResult["result"],
  "positive" | "danger" | "neutral"
> = {
  W: "positive",
  L: "danger",
  P: "neutral",
};

export function WarMatchIntelCard({
  model,
  state = "default",
}: WarMatchIntelCardProps) {
  return (
    <IntelCardShell
      ariaLabel={`War match intel for ${model.home.name} versus ${model.away.name}`}
      eyebrow="War match intel"
      fallbackAction={
        <IntelCardAction href={model.warHref}>Open war room</IntelCardAction>
      }
      partialMessage="One lane feed is delayed. The verified aggregate score remains visible."
      state={state}
      statusLabel={model.live ? "Live" : model.statusLabel}
      statusTone={model.live ? "danger" : "warning"}
      title={model.formatLabel}
      variant="war"
    >
      <div className={styles.warScore!}>
        <div className={styles.warSide!}>
          <img alt={`${model.home.name} emblem`} src={model.home.emblemSrc} />
          <strong>{model.home.name}</strong>
          <span>{model.home.sideLabel}</span>
        </div>
        <div className={styles.score!}>
          {model.live ? <span className={styles.live!}>Live</span> : null}
          <strong>{model.scoreLabel}</strong>
          <span>{model.formatLabel}</span>
        </div>
        <div className={styles.warSide!}>
          <img alt={`${model.away.name} emblem`} src={model.away.emblemSrc} />
          <strong>{model.away.name}</strong>
          <span>{model.away.sideLabel}</span>
        </div>
      </div>

      <IntelCardSection code="W.1" title="Lane status">
        <div className={styles.lanes!}>
          {model.lanes.map((lane) => (
            <div className={styles.lane!} key={lane.laneLabel}>
              <span>{lane.laneLabel}</span>
              <IntelStatusPill tone={laneTone[lane.result]}>
                {lane.result}
              </IntelStatusPill>
            </div>
          ))}
        </div>
      </IntelCardSection>

      <IntelCardSection code="W.2" title="Live operations">
        <IntelMetricGrid>
          <IntelMetric label="Round" tone="warning" value={model.roundLabel} />
          <IntelMetric label="Map" value={model.mapLabel} />
          <IntelMetric label="Started" tone="information" value={model.startedAtLabel} />
          <IntelMetric label="War ID" tone="special" value={model.id.replace("war-", "").toUpperCase()} />
        </IntelMetricGrid>
      </IntelCardSection>

      <IntelCardActions>
        <IntelCardAction href={model.warHref} tone="primary">
          View war room
        </IntelCardAction>
        {model.followHref ? (
          <IntelCardAction href={model.followHref}>Follow live</IntelCardAction>
        ) : (
          <IntelCardAction disabled>Live feed unavailable</IntelCardAction>
        )}
      </IntelCardActions>
    </IntelCardShell>
  );
}
WAR_TSX_EOF

cat > src/features/matches/intel-card/MatchIntelCard.module.css <<'MATCH_CSS_EOF'
.matchup,
.warScore {
  display: grid;
  min-width: 0;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.9rem;
  align-items: center;
  padding: 0.85rem;
  background: rgb(255 255 255 / 2%);
  border: 1px solid var(--vz-intel-border);
}

.side,
.warSide {
  display: grid;
  min-width: 0;
  grid-template-columns: 3.4rem minmax(0, 1fr);
  gap: 0.65rem;
  align-items: center;
}

.side img,
.warSide img {
  width: 3.4rem;
  height: 3.4rem;
  object-fit: contain;
  grid-row: span 2;
}

.side strong,
.side span,
.warSide strong,
.warSide span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.side strong,
.warSide strong {
  font-family: var(--font-rajdhani, "Arial Narrow", sans-serif);
  font-size: 0.9rem;
  text-transform: uppercase;
}

.side span,
.warSide span {
  color: var(--vz-intel-muted);
  font-size: 0.68rem;
  text-transform: uppercase;
}

.countdown,
.score {
  display: grid;
  place-items: center;
  gap: 0.25rem;
  text-align: center;
}

.countdown > span,
.score > span {
  color: var(--vz-intel-muted);
  font-family: var(--font-rajdhani, "Arial Narrow", sans-serif);
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.countdown > strong,
.score > strong {
  color: var(--vz-intel-match);
  font-family: var(--font-rajdhani, "Arial Narrow", sans-serif);
  font-size: clamp(2rem, 12cqi, 3.5rem);
  line-height: 0.95;
}

.score > strong {
  color: var(--vz-intel-text);
}

.format {
  margin: -0.2rem 0 0;
  color: var(--vz-intel-muted);
  font-family: var(--font-rajdhani, "Arial Narrow", sans-serif);
  font-size: 0.76rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.live {
  color: var(--vz-intel-danger) !important;
}

.live::before {
  display: inline-block;
  width: 0.45rem;
  height: 0.45rem;
  margin-right: 0.35rem;
  content: "";
  background: currentColor;
  border-radius: 50%;
  box-shadow: 0 0 0.75rem currentColor;
}

.lanes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

.lane {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.6rem;
  background: rgb(255 255 255 / 2%);
  border: 1px solid var(--vz-intel-border);
}

.lane > span {
  overflow: hidden;
  color: var(--vz-intel-muted);
  font-size: 0.72rem;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

@container intel-card (min-width: 32rem) {
  .matchup,
  .warScore {
    grid-template-columns: minmax(0, 1fr) minmax(7rem, 0.75fr) minmax(0, 1fr);
  }

  .side:last-child,
  .warSide:last-child {
    grid-template-columns: minmax(0, 1fr) 3.4rem;
    text-align: right;
  }

  .side:last-child img,
  .warSide:last-child img {
    grid-column: 2;
  }

  .lanes {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@container intel-card (min-width: 48rem) {
  .side,
  .warSide {
    grid-template-columns: 4.5rem minmax(0, 1fr);
  }

  .side img,
  .warSide img {
    width: 4.5rem;
    height: 4.5rem;
  }

  .side:last-child,
  .warSide:last-child {
    grid-template-columns: minmax(0, 1fr) 4.5rem;
  }
}
MATCH_CSS_EOF

cat > src/features/matches/intel-card/MatchIntelCard.test.tsx <<'MATCH_TEST_EOF'
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MatchIntelCard } from "./MatchIntelCard";
import { WarMatchIntelCard } from "./WarMatchIntelCard";
import {
  matchIntelMock,
  warMatchIntelMock,
} from "./match-intel.mock";

describe("Match intel cards", () => {
  it("keeps check-in visible on the Match card", () => {
    render(<MatchIntelCard model={matchIntelMock} />);

    expect(
      screen.getByRole("article", {
        name: "Match intel for MAINLAND TITANS versus LAGOS LYNX",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("18:30")).toBeVisible();
    expect(screen.getByRole("link", { name: "Check in" })).toHaveAttribute(
      "href",
      matchIntelMock.checkInHref,
    );
  });

  it("renders a live War match with independent lane states", () => {
    render(<WarMatchIntelCard model={warMatchIntelMock} />);

    expect(
      screen.getByRole("article", {
        name: "War match intel for MAINLAND TITANS versus LAGOS LYNX",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("2 - 1")).toBeVisible();
    expect(screen.getByText("Lane 4")).toBeVisible();
    expect(screen.getByRole("link", { name: "View war room" })).toHaveAttribute(
      "href",
      warMatchIntelMock.warHref,
    );
  });

  it("isolates a Match card error", () => {
    render(<MatchIntelCard model={matchIntelMock} state="error" />);

    expect(screen.getByRole("alert")).toHaveTextContent("Intel module failed");
    expect(screen.queryByText("18:30")).not.toBeInTheDocument();
  });
});
MATCH_TEST_EOF

cat > src/features/matches/intel-card/index.ts <<'MATCH_INDEX_EOF'
export { MatchIntelCard } from "./MatchIntelCard";
export type { MatchIntelCardProps } from "./MatchIntelCard";
export { WarMatchIntelCard } from "./WarMatchIntelCard";
export type { WarMatchIntelCardProps } from "./WarMatchIntelCard";
export {
  matchIntelMock,
  warMatchIntelMock,
} from "./match-intel.mock";
export type {
  MatchIntelViewModel,
  MatchSideViewModel,
  WarLaneResult,
  WarMatchIntelViewModel,
} from "./match-intel.types";
MATCH_INDEX_EOF

cat > src/app/intel-cards-preview/page.tsx <<'PREVIEW_PAGE_EOF'
import { CrewIntelCard, crewIntelMock } from "@/features/crews/intel-card";
import {
  MatchIntelCard,
  WarMatchIntelCard,
  matchIntelMock,
  warMatchIntelMock,
} from "@/features/matches/intel-card";
import {
  PlayerIntelCard,
  playerIntelMock,
} from "@/features/profiles/intel-card";

import styles from "./page.module.css";

export default function IntelCardsPreviewPage() {
  return (
    <main className={styles.page!} data-visual-ready="true">
      <header className={styles.hero!}>
        <p>VERZUS / M2 / STEP 19</p>
        <h1>Intel Cards</h1>
        <span>
          Compact, actionable command-centre summaries for players, matches,
          Crews and live Crew wars.
        </span>
      </header>

      <section aria-labelledby="approved-cards" className={styles.section!}>
        <div className={styles.sectionHeading!}>
          <div>
            <p>Approved set</p>
            <h2 id="approved-cards">Four production card families</h2>
          </div>
          <span>390 / 768 / 1440 responsive behaviour</span>
        </div>

        <div className={styles.cardGrid!}>
          <PlayerIntelCard model={playerIntelMock} />
          <MatchIntelCard model={matchIntelMock} />
          <CrewIntelCard model={crewIntelMock} />
          <WarMatchIntelCard model={warMatchIntelMock} />
        </div>
      </section>

      <section aria-labelledby="resilience-states" className={styles.section!}>
        <div className={styles.sectionHeading!}>
          <div>
            <p>Failure isolation</p>
            <h2 id="resilience-states">Supported card states</h2>
          </div>
          <span>Each card fails independently</span>
        </div>

        <div className={styles.stateGrid!}>
          <PlayerIntelCard model={playerIntelMock} state="loading" />
          <MatchIntelCard model={matchIntelMock} state="partial" />
          <CrewIntelCard model={crewIntelMock} state="offline" />
          <WarMatchIntelCard model={warMatchIntelMock} state="error" />
        </div>
      </section>
    </main>
  );
}
PREVIEW_PAGE_EOF

cat > src/app/intel-cards-preview/page.module.css <<'PREVIEW_CSS_EOF'
.page {
  min-height: 100vh;
  overflow-x: hidden;
  padding: clamp(1rem, 3vw, 2.5rem);
  color: var(--vz-intel-text);
  background:
    radial-gradient(circle at 50% 0, rgb(0 255 135 / 9%), transparent 34rem),
    repeating-linear-gradient(0deg, transparent 0 31px, rgb(255 255 255 / 2%) 31px 32px),
    #030607;
}

.hero,
.section {
  width: min(100%, 90rem);
  margin-inline: auto;
}

.hero {
  padding: clamp(1rem, 4vw, 2.25rem);
  background: linear-gradient(145deg, rgb(13 19 22 / 98%), rgb(4 7 8 / 100%));
  border: 1px solid rgb(0 255 135 / 24%);
}

.hero p,
.hero h1,
.hero span,
.sectionHeading p,
.sectionHeading h2 {
  margin: 0;
}

.hero p,
.sectionHeading p {
  color: var(--vz-intel-player);
  font-family: var(--font-rajdhani, "Arial Narrow", sans-serif);
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.hero h1 {
  margin-top: 0.25rem;
  font-family: var(--font-rajdhani, "Arial Narrow", sans-serif);
  font-size: clamp(2.25rem, 9vw, 5rem);
  line-height: 0.95;
  text-transform: uppercase;
}

.hero span {
  display: block;
  max-width: 52rem;
  margin-top: 0.75rem;
  color: var(--vz-intel-muted);
  line-height: 1.55;
}

.section {
  margin-top: clamp(1.25rem, 3vw, 2.25rem);
}

.sectionHeading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.9rem;
}

.sectionHeading h2 {
  font-family: var(--font-rajdhani, "Arial Narrow", sans-serif);
  font-size: clamp(1.35rem, 4vw, 2rem);
  text-transform: uppercase;
}

.sectionHeading > span {
  display: none;
  color: var(--vz-intel-muted);
  font-size: 0.75rem;
}

.cardGrid,
.stateGrid {
  display: grid;
  min-width: 0;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
}

.stateGrid {
  opacity: 0.96;
}

@media (min-width: 768px) {
  .sectionHeading > span {
    display: block;
  }

  .cardGrid,
  .stateGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1180px) {
  .cardGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .stateGrid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
PREVIEW_CSS_EOF

cat > src/app/intel-cards-preview/page.test.tsx <<'PREVIEW_TEST_EOF'
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import IntelCardsPreviewPage from "./page";

describe("IntelCardsPreviewPage", () => {
  it("renders all four approved Intel card families", () => {
    render(<IntelCardsPreviewPage />);

    expect(screen.getByRole("heading", { name: "Intel Cards", level: 1 })).toBeVisible();
    expect(screen.getAllByRole("article")).toHaveLength(8);
    expect(screen.getByText("Four production card families")).toBeVisible();
    expect(screen.getByText("Supported card states")).toBeVisible();
  });
});
PREVIEW_TEST_EOF

cat > src/stories/IntelCards.stories.tsx <<'STORY_EOF'
import type { Meta, StoryObj } from "@storybook/react";

import { CrewIntelCard, crewIntelMock } from "@/features/crews/intel-card";
import {
  MatchIntelCard,
  WarMatchIntelCard,
  matchIntelMock,
  warMatchIntelMock,
} from "@/features/matches/intel-card";
import {
  PlayerIntelCard,
  playerIntelMock,
} from "@/features/profiles/intel-card";

import styles from "./IntelCards.module.css";

const meta = {
  title: "Design System/Intel Cards",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const IntelCardsBaseline: Story = {
  render: () => (
    <main className={styles.frame!} data-visual-ready="true">
      <header className={styles.header!}>
        <p>M2 / Step 19</p>
        <h1>Intel Cards</h1>
      </header>
      <div className={styles.grid!}>
        <PlayerIntelCard model={playerIntelMock} />
        <MatchIntelCard model={matchIntelMock} />
        <CrewIntelCard model={crewIntelMock} />
        <WarMatchIntelCard model={warMatchIntelMock} />
      </div>
    </main>
  ),
};
STORY_EOF

cat > src/stories/IntelCards.module.css <<'STORY_CSS_EOF'
.frame {
  min-height: 100vh;
  padding: clamp(1rem, 3vw, 2rem);
  color: var(--vz-intel-text);
  background:
    radial-gradient(circle at 50% 0, rgb(0 255 135 / 9%), transparent 32rem),
    #030607;
}

.header {
  width: min(100%, 86rem);
  margin: 0 auto 1rem;
}

.header p,
.header h1 {
  margin: 0;
  font-family: var(--font-rajdhani, "Arial Narrow", sans-serif);
  text-transform: uppercase;
}

.header p {
  color: var(--vz-intel-player);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
}

.header h1 {
  font-size: clamp(2rem, 7vw, 4rem);
}

.grid {
  display: grid;
  width: min(100%, 86rem);
  margin-inline: auto;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
STORY_CSS_EOF

cat > docs/milestones/M2/step-19-intel-cards.md <<'DOC_EOF'
# M2 Step 19 - Intel Cards

## Purpose

Step 19 adds four compact command-centre read-model cards:

- Player Intel Card
- Match Intel Card
- Crew Intel Card
- War Match Intel Card

The cards are not API owners. Each feature domain receives a validated view model after the normal flow:

```text
HTTP response
-> schema validation
-> domain adapter
-> query cache
-> view model
-> Intel card
```

## Ownership

- Profiles owns Player Intel.
- Matches owns Match Intel and War Match Intel.
- Crews owns Crew Intel.
- `components/primitives/intel-card` owns only domain-neutral framing, metrics, status treatment and action layout.

## Supported states

- default
- loading
- partial
- error
- offline
- stale

A failed card remains locally contained and must not remove navigation or sibling cards.

## Responsive contract

- 360-430 px: stacked information, one-column actions, primary action visible.
- 768 px: expanded identity and metrics, two-column actions.
- 1024-1440 px: full card information without page-level horizontal scrolling.

## Approval routes

- Application preview: `/intel-cards-preview`
- Storybook story: `Design System / Intel Cards / Intel Cards Baseline`

## Completion gate

```bash
npm run verify
npm run build-storybook
npm run visual:update -- --grep intel-cards
npm run visual:test -- --grep intel-cards
npm run verify:m2
```
DOC_EOF

node <<'NODE_PATCH'
const fs = require("node:fs");

const galleryPath = "src/app/design-system/gallery-data.ts";
if (fs.existsSync(galleryPath)) {
  let source = fs.readFileSync(galleryPath, "utf8");
  const marker = "M2 STEP 19 GALLERY";

  if (!source.includes(marker)) {
    const anchor = "] as const;";
    const anchorIndex = source.indexOf(anchor);

    if (anchorIndex === -1) {
      throw new Error("Could not locate galleryGroups closing anchor.");
    }

    const block = `  // ${marker}\n  {\n    id: "intel-cards",\n    eyebrow: "Step 19",\n    title: "Command-centre Intel Cards",\n    description:\n      "Player, Match, Crew and War Match summaries with independent loading and failure states.",\n    previews: [\n      {\n        step: 19,\n        title: "Intel cards",\n        href: "/intel-cards-preview",\n        description:\n          "Responsive command-centre cards for identity, check-in, Crew performance and live Crew wars.",\n        capabilities: [\n          "Four domain-owned cards",\n          "Container-responsive layouts",\n          "Independent failure states",\n        ],\n      },\n    ],\n  },\n`;

    source = source.slice(0, anchorIndex) + block + source.slice(anchorIndex);
    fs.writeFileSync(galleryPath, source);
  }
}

const galleryTestPath = "src/app/design-system/page.test.tsx";
if (fs.existsSync(galleryTestPath)) {
  let source = fs.readFileSync(galleryTestPath, "utf8");
  source = source.replace("expect(previews).toHaveLength(15);", "expect(previews).toHaveLength(16);");
  fs.writeFileSync(galleryTestPath, source);
}

const galleryPagePath = "src/app/design-system/page.tsx";
if (fs.existsSync(galleryPagePath)) {
  let source = fs.readFileSync(galleryPagePath, "utf8");
  source = source.replace("Steps 1-16.", "Steps 1-19.");
  source = source.replace(">16</strong>", ">19</strong>");
  fs.writeFileSync(galleryPagePath, source);
}

const visualPath = "tests/visual/storybook.visual.spec.ts";
if (fs.existsSync(visualPath)) {
  let source = fs.readFileSync(visualPath, "utf8");
  const storyId = "design-system-intel-cards--intel-cards-baseline";

  if (!source.includes(storyId)) {
    const anchor = "] as const;";
    const anchorIndex = source.indexOf(anchor);

    if (anchorIndex === -1) {
      throw new Error("Could not locate Storybook visual story list.");
    }

    const entry = `  { id: "${storyId}", name: "intel-cards" },\n`;
    source = source.slice(0, anchorIndex) + entry + source.slice(anchorIndex);
    fs.writeFileSync(visualPath, source);
  }
}
NODE_PATCH

printf '%s\n' 'Formatting Step 19 files...'
npx prettier \
  src/styles/tokens.css \
  src/components/primitives/intel-card \
  src/features/profiles/intel-card \
  src/features/crews/intel-card \
  src/features/matches/intel-card \
  src/app/intel-cards-preview \
  src/stories/IntelCards.stories.tsx \
  src/stories/IntelCards.module.css \
  src/app/design-system/gallery-data.ts \
  src/app/design-system/page.tsx \
  src/app/design-system/page.test.tsx \
  tests/visual/storybook.visual.spec.ts \
  docs/milestones/M2/step-19-intel-cards.md \
  --write

printf '%s\n' 'Running focused Step 19 tests...'
npm run test -- \
  src/components/primitives/intel-card/IntelCard.test.tsx \
  src/features/profiles/intel-card/PlayerIntelCard.test.tsx \
  src/features/crews/intel-card/CrewIntelCard.test.tsx \
  src/features/matches/intel-card/MatchIntelCard.test.tsx \
  src/app/intel-cards-preview/page.test.tsx \
  src/app/design-system/page.test.tsx

printf '%s\n' 'Running static and production verification...'
npm run lint
npm run typecheck
npm run check:boundaries
npm run build
npm run build-storybook

printf '\n%s\n' 'Step 19 implementation checks passed.'
printf '%s\n' 'Preview: http://localhost:3000/intel-cards-preview'
printf '%s\n' 'Storybook: Design System / Intel Cards / Intel Cards Baseline'
printf '%s\n' 'After visual approval, create and verify the new baseline:'
printf '%s\n' '  npm run visual:update -- --grep intel-cards'
printf '%s\n' '  npm run visual:test -- --grep intel-cards'
printf '%s\n' '  npm run verify:m2'
