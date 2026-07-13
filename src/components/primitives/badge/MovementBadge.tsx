import { forwardRef, type HTMLAttributes } from "react";

import { badgeSizeClasses, type BadgeSize } from "./Badge";
import styles from "./Badge.module.css";
import { joinClassNames } from "./utils";

export type MovementDirection = "increased" | "decreased" | "unchanged" | "new" | "unranked";

export type MovementBadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  movement: MovementDirection;
  value?: string | number;
  size?: BadgeSize;
  label?: string;
};

const movementClasses = {
  increased: styles.movementIncreased,
  decreased: styles.movementDecreased,
  unchanged: styles.movementUnchanged,
  new: styles.movementNew,
  unranked: styles.movementUnranked,
};

const movementSymbols: Record<MovementDirection, string> = {
  increased: "↑",
  decreased: "↓",
  unchanged: "—",
  new: "+",
  unranked: "·",
};

function getMovementLabel(movement: MovementDirection, value?: string | number): string {
  if (movement === "new") {
    return value === undefined ? "New ranking entry" : `New ranking entry ${value}`;
  }

  if (movement === "unranked") {
    return "Unranked";
  }

  if (movement === "unchanged") {
    return "Ranking unchanged";
  }

  const amount = value === undefined ? "" : ` ${value}`;
  return movement === "increased" ? `Ranking increased${amount}` : `Ranking decreased${amount}`;
}

export const MovementBadge = forwardRef<HTMLSpanElement, MovementBadgeProps>(function MovementBadge(
  { movement, value, size = "md", label, className, ...spanProps },
  ref,
) {
  const accessibleLabel = label ?? getMovementLabel(movement, value);
  const visibleValue = movement === "new" && value === undefined ? "NEW" : value;

  return (
    <span
      {...spanProps}
      ref={ref}
      aria-label={spanProps["aria-label"] ?? accessibleLabel}
      className={joinClassNames(
        styles.movementBadge,
        movementClasses[movement],
        badgeSizeClasses[size],
        className,
      )}
      data-movement={movement}
      data-movement-size={size}
    >
      <span aria-hidden="true" className={styles.movementSymbol}>
        {movementSymbols[movement]}
      </span>

      {visibleValue !== undefined ? (
        <span aria-hidden="true" className={styles.movementValue}>
          {visibleValue}
        </span>
      ) : null}
    </span>
  );
});

MovementBadge.displayName = "MovementBadge";
