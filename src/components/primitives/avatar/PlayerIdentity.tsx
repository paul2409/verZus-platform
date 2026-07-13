import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { Avatar, type AvatarPresence, type AvatarTone } from "./Avatar";
import styles from "./Identity.module.css";
import { joinClassNames } from "./utils";

export type IdentitySize = "sm" | "md" | "lg";
export type IdentityLayout = "inline" | "stacked";

export type PlayerIdentityProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  name: string;
  handle?: string;
  avatarSrc?: string;
  avatarInitials?: string;
  avatarVisual?: ReactNode;
  presence?: AvatarPresence;
  verified?: boolean;
  suspended?: boolean;
  subtitle?: ReactNode;
  metadata?: ReactNode;
  badge?: ReactNode;
  trailing?: ReactNode;
  size?: IdentitySize;
  layout?: IdentityLayout;
  avatarTone?: AvatarTone;
  compact?: boolean;
};

const sizeClasses = {
  sm: styles.sizeSm!,
  md: styles.sizeMd!,
  lg: styles.sizeLg!,
};

const layoutClasses = {
  inline: styles.layoutInline!,
  stacked: styles.layoutStacked!,
};

const avatarSizeMap = {
  sm: "sm",
  md: "md",
  lg: "lg",
} as const;

export const PlayerIdentity = forwardRef<HTMLDivElement, PlayerIdentityProps>(
  function PlayerIdentity(
    {
      name,
      handle,
      avatarSrc,
      avatarInitials,
      avatarVisual,
      presence = "none",
      verified = false,
      suspended = false,
      subtitle,
      metadata,
      badge,
      trailing,
      size = "md",
      layout = "inline",
      avatarTone = "green",
      compact = false,
      className,
      ...divProps
    },
    ref,
  ) {
    return (
      <div
        {...divProps}
        ref={ref}
        className={joinClassNames(
          styles.identity,
          styles.playerIdentity,
          sizeClasses[size],
          layoutClasses[layout],
          compact && styles.compact,
          suspended && styles.identitySuspended,
          className,
        )}
        data-identity-compact={compact ? "true" : "false"}
        data-identity-layout={layout}
        data-identity-size={size}
        data-identity-type="player"
      >
        <Avatar
          decorative
          initials={avatarInitials}
          name={name}
          presence={presence}
          shape="circle"
          size={avatarSizeMap[size]}
          src={avatarSrc}
          suspended={suspended}
          tone={avatarTone}
          verified={verified}
          visual={avatarVisual}
        />

        <div className={styles.content}>
          <div className={styles.primaryLine}>
            <span className={styles.name}>{name}</span>
            {handle ? <span className={styles.handle}>{handle}</span> : null}
            {badge ? <span className={styles.badgeSlot}>{badge}</span> : null}
          </div>

          {!compact && subtitle ? <div className={styles.subtitle}>{subtitle}</div> : null}
          {!compact && metadata ? <div className={styles.metadata}>{metadata}</div> : null}
        </div>

        {trailing ? <div className={styles.trailing}>{trailing}</div> : null}
      </div>
    );
  },
);

PlayerIdentity.displayName = "PlayerIdentity";
