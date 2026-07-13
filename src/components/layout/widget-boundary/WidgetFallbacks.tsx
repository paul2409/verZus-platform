// VERZUS M3 STEP 3.5
"use client";

import { useId } from "react";

import styles from "./WidgetBoundary.module.css";

export type WidgetUnavailableVariant =
  "unavailable" | "offline" | "maintenance" | "partial" | "empty";

export interface WidgetErrorFallbackProps {
  name: string;
  errorId?: string;
  title?: string;
  description?: string;
  compact?: boolean;
  onRetry?: () => void;
}

export interface WidgetLoadingFallbackProps {
  name: string;
  compact?: boolean;
  lines?: number;
}

export interface WidgetUnavailableStateProps {
  name: string;
  variant?: WidgetUnavailableVariant;
  title?: string;
  description?: string;
  compact?: boolean;
  onRetry?: () => void;
}

function joinClassNames(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export function WidgetErrorFallback({
  name,
  errorId,
  title,
  description,
  compact = false,
  onRetry,
}: WidgetErrorFallbackProps) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <section
      className={joinClassNames(styles.fallback, compact && styles.compact)}
      data-variant="error"
      data-widget-name={name}
      role="alert"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className={styles.header}>
        <span className={styles.marker} aria-hidden="true">
          ERR
        </span>
        <div className={styles.headingGroup}>
          <p className={styles.eyebrow}>Widget isolated</p>
          <h2 className={styles.title} id={titleId}>
            {title ?? `${name} is unavailable`}
          </h2>
        </div>
      </div>

      <p className={styles.description} id={descriptionId}>
        {description ??
          "This section failed independently. Other widgets and navigation remain operational."}
      </p>

      {errorId ? <p className={styles.reference}>Reference: {errorId}</p> : null}

      {onRetry ? (
        <div className={styles.actions}>
          <button className={styles.action} type="button" onClick={onRetry}>
            Retry {name}
          </button>
        </div>
      ) : null}
    </section>
  );
}

export function WidgetLoadingFallback({
  name,
  compact = false,
  lines = 3,
}: WidgetLoadingFallbackProps) {
  const safeLines = Math.max(1, Math.min(lines, 5));
  const titleId = useId();

  return (
    <section
      className={joinClassNames(styles.fallback, compact && styles.compact)}
      data-variant="loading"
      data-widget-name={name}
      role="status"
      aria-labelledby={titleId}
      aria-busy="true"
    >
      <div className={styles.header}>
        <span className={styles.marker} aria-hidden="true">
          SYNC
        </span>
        <div className={styles.headingGroup}>
          <p className={styles.eyebrow}>Synchronizing widget</p>
          <h2 className={styles.title} id={titleId}>
            Loading {name}
          </h2>
        </div>
      </div>

      <div className={styles.skeleton} aria-hidden="true">
        {Array.from({ length: safeLines }, (_, index) => (
          <span className={styles.skeletonLine} key={index} />
        ))}
      </div>
    </section>
  );
}

function getUnavailableContent(variant: WidgetUnavailableVariant): {
  marker: string;
  eyebrow: string;
  title: string;
  description: string;
} {
  switch (variant) {
    case "offline":
      return {
        marker: "OFF",
        eyebrow: "Offline widget",
        title: "Connection required",
        description:
          "Reconnect to refresh this section. Offline-safe controls elsewhere remain available.",
      };
    case "maintenance":
      return {
        marker: "MNT",
        eyebrow: "Widget maintenance",
        title: "Temporarily under maintenance",
        description: "This section is being serviced without interrupting the rest of the page.",
      };
    case "partial":
      return {
        marker: "PART",
        eyebrow: "Partial data",
        title: "Some information is unavailable",
        description:
          "Available data remains visible while the missing portion can be retried independently.",
      };
    case "empty":
      return {
        marker: "NONE",
        eyebrow: "No data",
        title: "Nothing to show yet",
        description: "This section is working, but there is no information to display right now.",
      };
    case "unavailable":
    default:
      return {
        marker: "N/A",
        eyebrow: "Widget unavailable",
        title: "This section is unavailable",
        description: "The section cannot load right now. Other page functions remain available.",
      };
  }
}

export function WidgetUnavailableState({
  name,
  variant = "unavailable",
  title,
  description,
  compact = false,
  onRetry,
}: WidgetUnavailableStateProps) {
  const content = getUnavailableContent(variant);
  const titleId = useId();
  const descriptionId = useId();

  return (
    <section
      className={joinClassNames(styles.fallback, compact && styles.compact)}
      data-variant={variant}
      data-widget-name={name}
      role="region"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className={styles.header}>
        <span className={styles.marker} aria-hidden="true">
          {content.marker}
        </span>
        <div className={styles.headingGroup}>
          <p className={styles.eyebrow}>{content.eyebrow}</p>
          <h2 className={styles.title} id={titleId}>
            {title ?? content.title}
          </h2>
        </div>
      </div>

      <p className={styles.description} id={descriptionId}>
        {description ?? content.description}
      </p>

      {onRetry ? (
        <div className={styles.actions}>
          <button className={styles.secondaryAction} type="button" onClick={onRetry}>
            Retry {name}
          </button>
        </div>
      ) : null}
    </section>
  );
}
