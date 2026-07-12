"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { Icon, type IconName, type IconSize } from "../icon";
import styles from "./Button.module.css";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost"
  /**
   * Temporary compatibility alias.
   *
   * The old orange accent button is removed from the approved system.
   * This variant currently renders as the secondary cyan treatment.
   */
  | "accent";

export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  fullWidth?: boolean;
  loading?: boolean;
  loadingLabel?: string;
};

function joinClassNames(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

function getIconSize(size: ButtonSize): IconSize {
  if (size === "sm") {
    return "sm";
  }

  if (size === "lg") {
    return "lg";
  }

  return "md";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    variant = "primary",
    size = "md",
    leadingIcon,
    trailingIcon,
    fullWidth = false,
    loading = false,
    loadingLabel,
    disabled = false,
    className,
    type = "button",
    ...buttonProps
  },
  ref,
) {
  const isDisabled = disabled || loading;
  const visibleLabel = loading && loadingLabel ? loadingLabel : children;

  return (
    <button
      {...buttonProps}
      ref={ref}
      aria-busy={loading || undefined}
      className={joinClassNames(
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        loading && styles.loading,
        className,
      )}
      data-button-size={size}
      data-button-variant={variant}
      data-loading={loading ? "true" : undefined}
      disabled={isDisabled}
      type={type}
    >
      <span className={styles.content}>
        {loading ? (
          <span aria-hidden="true" className={styles.spinner} />
        ) : leadingIcon ? (
          <Icon decorative name={leadingIcon} size={getIconSize(size)} />
        ) : null}

        <span className={styles.label}>{visibleLabel}</span>

        {!loading && trailingIcon ? (
          <Icon decorative name={trailingIcon} size={getIconSize(size)} />
        ) : null}
      </span>
    </button>
  );
});

Button.displayName = "Button";
