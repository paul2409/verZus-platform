import { forwardRef, type HTMLAttributes } from "react";

import { badgeSizeClasses, type BadgeSize } from "./Badge";
import styles from "./Badge.module.css";
import { joinClassNames } from "./utils";

export type RankTier = "standard" | "bronze" | "silver" | "gold" | "elite";

export type RankBadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  rank: string | number;
  tier?: RankTier;
  size?: BadgeSize;
  label?: string;
};

const rankTierClasses = {
  standard: styles.rankStandard,
  bronze: styles.rankBronze,
  silver: styles.rankSilver,
  gold: styles.rankGold,
  elite: styles.rankElite,
};

export const RankBadge = forwardRef<HTMLSpanElement, RankBadgeProps>(function RankBadge(
  { rank, tier = "standard", size = "md", label, className, ...spanProps },
  ref,
) {
  const accessibleLabel = label ?? `Rank ${rank}`;

  return (
    <span
      {...spanProps}
      ref={ref}
      aria-label={spanProps["aria-label"] ?? accessibleLabel}
      className={joinClassNames(
        styles.rankBadge,
        rankTierClasses[tier],
        badgeSizeClasses[size],
        className,
      )}
      data-rank-size={size}
      data-rank-tier={tier}
    >
      <span aria-hidden="true" className={styles.rankInner}>
        {rank}
      </span>
    </span>
  );
});

RankBadge.displayName = "RankBadge";
