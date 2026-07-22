import Link from "next/link";
import type { ReactNode } from "react";

import styles from "./play-command-center.module.css";

type EmptyVariant =
  | "match"
  | "schedule"
  | "ranking"
  | "competition"
  | "activity"
  | "crew"
  | "challenge";

type EmptyAction = {
  href: string;
  label: string;
};

const variantMeta: Record<EmptyVariant, { glyph: string; eyebrow: string }> = {
  match: { glyph: "VS", eyebrow: "READY WHEN YOU ARE" },
  schedule: { glyph: "UP", eyebrow: "BUILD YOUR SCHEDULE" },
  ranking: { glyph: "#", eyebrow: "FIRST RESULT PENDING" },
  competition: { glyph: "+", eyebrow: "OPEN OPPORTUNITIES" },
  activity: { glyph: "LOG", eyebrow: "YOUR STORY STARTS HERE" },
  crew: { glyph: "C", eyebrow: "FIND YOUR UNIT" },
  challenge: { glyph: "XP", eyebrow: "PROGRESSION AWAITS" },
};

export function PlayEmptyState({
  variant,
  title,
  detail,
  primaryAction,
  secondaryAction,
  steps,
  compact = false,
  children,
}: {
  variant: EmptyVariant;
  title: string;
  detail: string;
  primaryAction?: EmptyAction;
  secondaryAction?: EmptyAction;
  steps?: readonly string[];
  compact?: boolean;
  children?: ReactNode;
}) {
  const meta = variantMeta[variant];

  return (
    <div
      className={styles.emptyExperience}
      data-compact={compact ? "true" : "false"}
      data-variant={variant}
    >
      <div className={styles.emptyVisual} aria-hidden="true">
        <i />
        <span>{meta.glyph}</span>
        <b />
      </div>

      <div className={styles.emptyContent}>
        <small>{meta.eyebrow}</small>
        <h3>{title}</h3>
        <p>{detail}</p>

        {steps && steps.length > 0 ? (
          <ol className={styles.emptySteps}>
            {steps.map((step, index) => (
              <li key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step}</strong>
              </li>
            ))}
          </ol>
        ) : null}

        {children}

        {primaryAction || secondaryAction ? (
          <div className={styles.emptyActions}>
            {primaryAction ? (
              <Link href={primaryAction.href}>{primaryAction.label}</Link>
            ) : null}
            {secondaryAction ? (
              <Link data-secondary="true" href={secondaryAction.href}>
                {secondaryAction.label}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
