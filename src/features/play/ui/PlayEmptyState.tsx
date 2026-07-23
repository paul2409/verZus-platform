import Link from "next/link";
import type { ReactNode } from "react";

import styles from "./play-command-center.module.css";

type EmptyVariant =
  "match" | "schedule" | "ranking" | "competition" | "activity" | "crew" | "challenge";

type EmptyActionEmphasis = "primary" | "ghost" | "text";

type EmptyAction = {
  href: string;
  label: string;
  emphasis?: EmptyActionEmphasis;
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

function EmptyActionLink({
  action,
  fallbackEmphasis,
}: {
  action: EmptyAction;
  fallbackEmphasis: EmptyActionEmphasis;
}) {
  return (
    <Link data-emphasis={action.emphasis ?? fallbackEmphasis} href={action.href}>
      {action.label}
    </Link>
  );
}

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
  const primaryFallback: EmptyActionEmphasis = variant === "match" ? "primary" : "ghost";

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
              <EmptyActionLink action={primaryAction} fallbackEmphasis={primaryFallback} />
            ) : null}
            {secondaryAction ? (
              <EmptyActionLink action={secondaryAction} fallbackEmphasis="text" />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
