import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from "react";

import styles from "./IntelCard.module.css";

export type IntelCardVariant = "player" | "match" | "crew" | "war";
export type IntelCardState = "default" | "loading" | "partial" | "error" | "offline" | "stale";
export type IntelTone = "neutral" | "positive" | "information" | "warning" | "danger" | "special";
export type IntelActionTone = "primary" | "secondary" | "danger" | "ghost";

export type IntelCardShellProps = Omit<HTMLAttributes<HTMLElement>, "children" | "title"> & {
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

export type IntelCardActionProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & {
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

function joinClassNames(...classNames: Array<string | false | null | undefined>): string {
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
    <div aria-live="polite" className={styles.blockingState!} role={isOffline ? "status" : "alert"}>
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
    <span className={joinClassNames(styles.statusPill!, toneClasses[tone], className)} {...props}>
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
    <span className={joinClassNames(styles.tag!, toneClasses[tone], className)} {...props}>
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
          <IntelStatusPill tone={resolvedStatusTone}>{resolvedStatusLabel}</IntelStatusPill>
        ) : null}
      </header>

      {state === "loading" ? <LoadingBody /> : null}

      {isBlocking ? <BlockingState fallbackAction={fallbackAction} state={state} /> : null}

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
    <section className={joinClassNames(styles.section!, className)} {...props}>
      <header className={styles.sectionHeader!}>
        {code ? <span className={styles.sectionCode!}>{code}</span> : null}
        <h4>{title}</h4>
        <span aria-hidden="true" className={styles.sectionRule!} />
      </header>
      <div className={styles.sectionBody!}>{children}</div>
    </section>
  );
}

export function IntelMetricGrid({ className, ...props }: HTMLAttributes<HTMLDListElement>) {
  return <dl className={joinClassNames(styles.metricGrid!, className)} {...props} />;
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
    <div className={joinClassNames(styles.metric!, toneClasses[tone], className)} {...props}>
      <dt>{label}</dt>
      <dd>{value}</dd>
      {detail ? <span>{detail}</span> : null}
    </div>
  );
}

export function IntelCardActions({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={joinClassNames(styles.actions!, className)} {...props} />;
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
