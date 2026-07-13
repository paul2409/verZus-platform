import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import {
  badgeSizeClasses,
  badgeToneClasses,
  badgeVariantClasses,
  type BadgeSize,
  type BadgeTone,
} from "./Badge";
import styles from "./Badge.module.css";
import { joinClassNames } from "./utils";

export type StatusBadgeStatus = "online" | "offline" | "away" | "busy" | "live" | "loading";

export type StatusBadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  children: ReactNode;
  status?: StatusBadgeStatus;
  size?: BadgeSize;
  pulse?: boolean;
  announce?: boolean;
};

const statusClasses = {
  online: styles.statusOnline,
  offline: styles.statusOffline,
  away: styles.statusAway,
  busy: styles.statusBusy,
  live: styles.statusLive,
  loading: styles.statusLoading,
};

const statusToneMap: Record<StatusBadgeStatus, BadgeTone> = {
  online: "positive",
  offline: "neutral",
  away: "warning",
  busy: "negative",
  live: "live",
  loading: "information",
};

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(function StatusBadge(
  {
    children,
    status = "online",
    size = "md",
    pulse,
    announce = false,
    className,
    role,
    ...spanProps
  },
  ref,
) {
  const defaultPulse = status === "live" || status === "loading";
  const shouldPulse = pulse ?? defaultPulse;
  const tone = statusToneMap[status];

  return (
    <span
      {...spanProps}
      ref={ref}
      aria-live={announce ? "polite" : undefined}
      className={joinClassNames(
        styles.badge,
        styles.statusBadge,
        badgeToneClasses[tone],
        badgeVariantClasses.soft,
        badgeSizeClasses[size],
        statusClasses[status],
        shouldPulse && styles.pulse,
        className,
      )}
      data-status={status}
      data-status-pulse={shouldPulse ? "true" : "false"}
      role={role ?? (announce ? "status" : undefined)}
    >
      <span aria-hidden="true" className={styles.statusIndicator} />
      <span className={styles.label}>{children}</span>
    </span>
  );
});

StatusBadge.displayName = "StatusBadge";
