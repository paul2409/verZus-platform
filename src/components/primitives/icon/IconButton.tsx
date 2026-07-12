"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

import { Icon, type IconName, type IconSize } from "./Icon";
import styles from "./IconButton.module.css";

export type IconButtonVariant = "neutral" | "primary" | "secondary" | "danger";

export type IconButtonSize = "sm" | "md" | "lg";

export type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "aria-label"
> & {
  label: string;
  icon: IconName;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  loading?: boolean;
};

function joinClassNames(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

function getIconSize(size: IconButtonSize): IconSize {
  if (size === "sm") {
    return "sm";
  }

  if (size === "lg") {
    return "lg";
  }

  return "md";
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    label,
    icon,
    variant = "neutral",
    size = "md",
    loading = false,
    disabled,
    className,
    type = "button",
    ...buttonProps
  },
  ref,
) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...buttonProps}
      ref={ref}
      aria-busy={loading || undefined}
      aria-label={label}
      className={joinClassNames(
        styles.button,
        styles[variant],
        styles[size],
        loading && styles.loading,
        className,
      )}
      data-icon-button={icon}
      disabled={isDisabled}
      type={type}
    >
      {loading ? (
        <span aria-hidden="true" className={styles.spinner} />
      ) : (
        <Icon decorative name={icon} size={getIconSize(size)} />
      )}
    </button>
  );
});

IconButton.displayName = "IconButton";
