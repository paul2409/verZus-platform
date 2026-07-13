"use client";

import { forwardRef, type AriaRole, type HTMLAttributes, type ReactNode } from "react";

import { Button, type ButtonSize } from "../button";
import { Icon, type IconName } from "../icon";
import styles from "./Feedback.module.css";
import { joinClassNames } from "./utils";

export type SystemStateKind =
  | "loading"
  | "retrying"
  | "empty"
  | "error"
  | "offline"
  | "maintenance"
  | "unauthorized"
  | "forbidden"
  | "not-found"
  | "partial-failure"
  | "success";

export type SystemStateAlign = "start" | "center";
export type SystemStateSize = "sm" | "md" | "lg";

export type SystemStateProps = Omit<HTMLAttributes<HTMLElement>, "children" | "title"> & {
  kind: SystemStateKind;
  title: ReactNode;
  description?: ReactNode;
  icon?: IconName;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  children?: ReactNode;
  align?: SystemStateAlign;
  size?: SystemStateSize;
  compact?: boolean;
  announce?: boolean;
};

export type RetryActionProps = {
  onRetry: () => void;
  label?: string;
  loading?: boolean;
  loadingLabel?: string;
  size?: ButtonSize;
  className?: string;
};

export type FixedSystemStateProps = Omit<SystemStateProps, "kind">;

const kindClasses: Record<SystemStateKind, string> = {
  loading: styles.stateLoading!,
  retrying: styles.stateRetrying!,
  empty: styles.stateEmpty!,
  error: styles.stateError!,
  offline: styles.stateOffline!,
  maintenance: styles.stateMaintenance!,
  unauthorized: styles.stateUnauthorized!,
  forbidden: styles.stateForbidden!,
  "not-found": styles.stateNotFound!,
  "partial-failure": styles.statePartialFailure!,
  success: styles.stateSuccess!,
};

const alignClasses: Record<SystemStateAlign, string> = {
  start: styles.alignStart!,
  center: styles.alignCenter!,
};

const sizeClasses: Record<SystemStateSize, string> = {
  sm: styles.sizeSm!,
  md: styles.sizeMd!,
  lg: styles.sizeLg!,
};

const defaultIcons: Record<SystemStateKind, IconName> = {
  loading: "hourglass",
  retrying: "refresh-cw",
  empty: "search",
  error: "alert-triangle",
  offline: "link",
  maintenance: "settings",
  unauthorized: "lock",
  forbidden: "shield",
  "not-found": "help-circle",
  "partial-failure": "alert-triangle",
  success: "check",
};

function getAnnouncementRole(kind: SystemStateKind, announce: boolean): AriaRole | undefined {
  if (!announce) {
    return undefined;
  }

  if (
    kind === "error" ||
    kind === "offline" ||
    kind === "forbidden" ||
    kind === "unauthorized" ||
    kind === "partial-failure"
  ) {
    return "alert";
  }

  return "status";
}

export const SystemState = forwardRef<HTMLElement, SystemStateProps>(function SystemState(
  {
    kind,
    title,
    description,
    icon,
    action,
    secondaryAction,
    children,
    align = "center",
    size = "md",
    compact = false,
    announce = false,
    className,
    ...sectionProps
  },
  ref,
) {
  const role = sectionProps.role ?? getAnnouncementRole(kind, announce);
  const isBusy = kind === "loading" || kind === "retrying";

  return (
    <section
      {...sectionProps}
      ref={ref}
      aria-busy={isBusy ? true : undefined}
      className={joinClassNames(
        styles.systemState,
        kindClasses[kind],
        alignClasses[align],
        sizeClasses[size],
        compact && styles.compact,
        className,
      )}
      data-system-state={kind}
      data-system-state-align={align}
      data-system-state-compact={compact ? "true" : "false"}
      data-system-state-size={size}
      role={role}
    >
      <span aria-hidden="true" className={styles.stateRail} />

      <div className={styles.stateIcon}>
        <Icon decorative name={icon ?? defaultIcons[kind]} size="xl" />
      </div>

      <div className={styles.stateCopy}>
        <h3 className={styles.stateTitle}>{title}</h3>

        {description ? <p className={styles.stateDescription}>{description}</p> : null}

        {children ? <div className={styles.stateContent}>{children}</div> : null}
      </div>

      {action || secondaryAction ? (
        <div className={styles.stateActions}>
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </section>
  );
});

SystemState.displayName = "SystemState";

export function RetryAction({
  onRetry,
  label = "Retry",
  loading = false,
  loadingLabel = "Retrying",
  size = "md",
  className,
}: RetryActionProps) {
  return (
    <Button
      className={className}
      leadingIcon="refresh-cw"
      loading={loading}
      loadingLabel={loadingLabel}
      onClick={onRetry}
      size={size}
      variant="secondary"
    >
      {label}
    </Button>
  );
}

export function LoadingState(props: FixedSystemStateProps) {
  return <SystemState {...props} kind="loading" />;
}

export function RetryingState(props: FixedSystemStateProps) {
  return <SystemState {...props} kind="retrying" />;
}

export function EmptyState(props: FixedSystemStateProps) {
  return <SystemState {...props} kind="empty" />;
}

export function ErrorState(props: FixedSystemStateProps) {
  return <SystemState {...props} kind="error" />;
}

export function OfflineState(props: FixedSystemStateProps) {
  return <SystemState {...props} kind="offline" />;
}

export function MaintenanceState(props: FixedSystemStateProps) {
  return <SystemState {...props} kind="maintenance" />;
}

export function UnauthorizedState(props: FixedSystemStateProps) {
  return <SystemState {...props} kind="unauthorized" />;
}

export function ForbiddenState(props: FixedSystemStateProps) {
  return <SystemState {...props} kind="forbidden" />;
}

export function NotFoundState(props: FixedSystemStateProps) {
  return <SystemState {...props} kind="not-found" />;
}

export function PartialFailureState(props: FixedSystemStateProps) {
  return <SystemState {...props} kind="partial-failure" />;
}

export function SuccessState(props: FixedSystemStateProps) {
  return <SystemState {...props} kind="success" />;
}
