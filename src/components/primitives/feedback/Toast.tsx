"use client";

import { forwardRef, type AriaRole, type HTMLAttributes, type ReactNode } from "react";

import { Icon, type IconName } from "../icon";
import styles from "./Feedback.module.css";
import { joinClassNames } from "./utils";

export type ToastTone = "neutral" | "information" | "success" | "warning" | "error";
export type ToastPlacement = "top-right" | "top-center" | "bottom-right" | "bottom-center";

export type ToastViewportProps = Omit<HTMLAttributes<HTMLOListElement>, "children"> & {
  children: ReactNode;
  label?: string;
  placement?: ToastPlacement;
};

export type ToastProps = Omit<HTMLAttributes<HTMLLIElement>, "children" | "title"> & {
  title: ReactNode;
  description?: ReactNode;
  tone?: ToastTone;
  icon?: IconName;
  action?: ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
  announce?: boolean;
};

const toneClasses: Record<ToastTone, string> = {
  neutral: styles.toastNeutral!,
  information: styles.toastInformation!,
  success: styles.toastSuccess!,
  warning: styles.toastWarning!,
  error: styles.toastError!,
};

const placementClasses: Record<ToastPlacement, string> = {
  "top-right": styles.viewportTopRight!,
  "top-center": styles.viewportTopCenter!,
  "bottom-right": styles.viewportBottomRight!,
  "bottom-center": styles.viewportBottomCenter!,
};

const defaultIcons: Record<ToastTone, IconName> = {
  neutral: "info",
  information: "info",
  success: "check",
  warning: "alert-triangle",
  error: "x",
};

function getToastRole(tone: ToastTone, announce: boolean): AriaRole | undefined {
  if (!announce) {
    return undefined;
  }

  return tone === "error" || tone === "warning" ? "alert" : "status";
}

export const ToastViewport = forwardRef<HTMLOListElement, ToastViewportProps>(
  function ToastViewport(
    { children, label = "Notifications", placement = "bottom-right", className, ...listProps },
    ref,
  ) {
    return (
      <ol
        {...listProps}
        ref={ref}
        aria-label={label}
        className={joinClassNames(styles.toastViewport, placementClasses[placement], className)}
        data-toast-placement={placement}
      >
        {children}
      </ol>
    );
  },
);

ToastViewport.displayName = "ToastViewport";

export const Toast = forwardRef<HTMLLIElement, ToastProps>(function Toast(
  {
    title,
    description,
    tone = "neutral",
    icon,
    action,
    onDismiss,
    dismissLabel = "Dismiss notification",
    announce = true,
    className,
    ...listItemProps
  },
  ref,
) {
  const role = listItemProps.role ?? getToastRole(tone, announce);

  return (
    <li
      {...listItemProps}
      ref={ref}
      className={joinClassNames(styles.toast, toneClasses[tone], className)}
      data-toast-tone={tone}
      role={role}
    >
      <span aria-hidden="true" className={styles.toastRail} />

      <div className={styles.toastIcon}>
        <Icon decorative name={icon ?? defaultIcons[tone]} size="md" />
      </div>

      <div className={styles.toastCopy}>
        <p className={styles.toastTitle}>{title}</p>
        {description ? <p className={styles.toastDescription}>{description}</p> : null}
      </div>

      {action ? <div className={styles.toastAction}>{action}</div> : null}

      {onDismiss ? (
        <button
          aria-label={dismissLabel}
          className={styles.toastDismiss}
          onClick={onDismiss}
          type="button"
        >
          <Icon decorative name="x" size="sm" />
        </button>
      ) : null}
    </li>
  );
});

Toast.displayName = "Toast";
