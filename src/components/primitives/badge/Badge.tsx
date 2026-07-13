import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import styles from "./Badge.module.css";
import { joinClassNames } from "./utils";

export type BadgeTone =
  "neutral" | "information" | "positive" | "warning" | "negative" | "special" | "live";

export type BadgeVariant = "soft" | "solid" | "outline";

export type BadgeSize = "sm" | "md" | "lg";

export type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  children: ReactNode;
  tone?: BadgeTone;
  variant?: BadgeVariant;
  size?: BadgeSize;
  leadingVisual?: ReactNode;
  trailingVisual?: ReactNode;
  disabled?: boolean;
};

export const badgeToneClasses = {
  neutral: styles.toneNeutral,
  information: styles.toneInformation,
  positive: styles.tonePositive,
  warning: styles.toneWarning,
  negative: styles.toneNegative,
  special: styles.toneSpecial,
  live: styles.toneLive,
};

export const badgeVariantClasses = {
  soft: styles.variantSoft,
  solid: styles.variantSolid,
  outline: styles.variantOutline,
};

export const badgeSizeClasses = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    children,
    tone = "neutral",
    variant = "soft",
    size = "md",
    leadingVisual,
    trailingVisual,
    disabled = false,
    className,
    ...spanProps
  },
  ref,
) {
  return (
    <span
      {...spanProps}
      ref={ref}
      aria-disabled={disabled || undefined}
      className={joinClassNames(
        styles.badge,
        badgeToneClasses[tone],
        badgeVariantClasses[variant],
        badgeSizeClasses[size],
        disabled && styles.disabled,
        className,
      )}
      data-badge-disabled={disabled ? "true" : undefined}
      data-badge-size={size}
      data-badge-tone={tone}
      data-badge-variant={variant}
    >
      {leadingVisual ? (
        <span aria-hidden="true" className={styles.visual}>
          {leadingVisual}
        </span>
      ) : null}

      <span className={styles.label}>{children}</span>

      {trailingVisual ? (
        <span aria-hidden="true" className={styles.visual}>
          {trailingVisual}
        </span>
      ) : null}
    </span>
  );
});

Badge.displayName = "Badge";
