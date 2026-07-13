// VERZUS M3 STEP 3.4

import { useId, type ReactNode } from "react";

import styles from "./RouteBoundary.module.css";

export type RouteStateKind =
  "loading" | "error" | "not-found" | "offline" | "maintenance" | "unauthorized" | "forbidden";

export interface RouteStateProps {
  kind: RouteStateKind;
  eyebrow?: string;
  title: string;
  description: string;
  marker?: string;
  errorId?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

const defaultMarkers: Record<RouteStateKind, string> = {
  loading: "SYNC",
  error: "ERR",
  "not-found": "404",
  offline: "OFF",
  maintenance: "MNT",
  unauthorized: "401",
  forbidden: "403",
};

export function RouteState({
  kind,
  eyebrow = "Route status",
  title,
  description,
  marker,
  errorId,
  actions,
  children,
}: RouteStateProps) {
  const titleId = useId();
  const descriptionId = useId();
  const role = kind === "error" || kind === "forbidden" ? "alert" : "region";
  const liveProps =
    kind === "loading"
      ? ({
          "aria-live": "polite",
          "aria-busy": true,
        } as const)
      : {};

  return (
    <section
      className={styles.root}
      data-kind={kind}
      role={role}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      {...liveProps}
    >
      <div className={styles.content}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <span className={styles.marker} aria-hidden="true">
          {marker ?? defaultMarkers[kind]}
        </span>
        <h1 className={styles.title} id={titleId}>
          {title}
        </h1>
        <p className={styles.description} id={descriptionId}>
          {description}
        </p>
        {errorId ? <p className={styles.errorId}>Reference: {errorId}</p> : null}
        {children}
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
    </section>
  );
}
