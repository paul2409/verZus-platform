import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";

import { PageContainer } from "@/components/layout/app-shell";

import styles from "./OperationalScreen.module.css";

export type OperationalTone = "neutral" | "green" | "cyan" | "gold" | "magenta" | "red" | "violet";

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
    <section {...props} className={joinClassNames(styles.panel, className)} data-tone={tone}>
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
    <div {...props} className={joinClassNames(styles.grid, className)} data-columns={columns}>
      {children}
    </div>
  );
}

export function MetricGrid({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
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

export function SignalList({ children, className, ...props }: HTMLAttributes<HTMLUListElement>) {
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

export function ProgressMeter({ label, value, max, detail, tone = "green" }: ProgressMeterProps) {
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
