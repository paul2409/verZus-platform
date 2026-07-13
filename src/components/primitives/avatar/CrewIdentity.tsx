import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { Avatar, type AvatarTone } from "./Avatar";
import { type IdentityLayout, type IdentitySize } from "./PlayerIdentity";
import styles from "./Identity.module.css";
import { joinClassNames } from "./utils";

export type CrewIdentityProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  name: string;
  tag?: string;
  emblemSrc?: string;
  emblemInitials?: string;
  emblem?: ReactNode;
  verified?: boolean;
  suspended?: boolean;
  subtitle?: ReactNode;
  memberCount?: number;
  metadata?: ReactNode;
  badge?: ReactNode;
  trailing?: ReactNode;
  size?: IdentitySize;
  layout?: IdentityLayout;
  emblemTone?: AvatarTone;
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

export const CrewIdentity = forwardRef<HTMLDivElement, CrewIdentityProps>(function CrewIdentity(
  {
    name,
    tag,
    emblemSrc,
    emblemInitials,
    emblem,
    verified = false,
    suspended = false,
    subtitle,
    memberCount,
    metadata,
    badge,
    trailing,
    size = "md",
    layout = "inline",
    emblemTone = "violet",
    compact = false,
    className,
    ...divProps
  },
  ref,
) {
  const memberText =
    memberCount === undefined ? null : `${memberCount} ${memberCount === 1 ? "member" : "members"}`;

  return (
    <div
      {...divProps}
      ref={ref}
      className={joinClassNames(
        styles.identity,
        styles.crewIdentity,
        sizeClasses[size],
        layoutClasses[layout],
        compact && styles.compact,
        suspended && styles.identitySuspended,
        className,
      )}
      data-identity-compact={compact ? "true" : "false"}
      data-identity-layout={layout}
      data-identity-size={size}
      data-identity-type="crew"
    >
      <Avatar
        decorative
        initials={emblemInitials}
        name={name}
        shape="hex"
        size={avatarSizeMap[size]}
        src={emblemSrc}
        suspended={suspended}
        tone={emblemTone}
        verified={verified}
        visual={emblem}
      />

      <div className={styles.content}>
        <div className={styles.primaryLine}>
          <span className={styles.name}>{name}</span>
          {tag ? <span className={styles.crewTag}>[{tag}]</span> : null}
          {badge ? <span className={styles.badgeSlot}>{badge}</span> : null}
        </div>

        {!compact && subtitle ? <div className={styles.subtitle}>{subtitle}</div> : null}

        {!compact && (memberText || metadata) ? (
          <div className={styles.metadata}>
            {memberText ? <span>{memberText}</span> : null}
            {memberText && metadata ? <span aria-hidden="true">/</span> : null}
            {metadata ? <span>{metadata}</span> : null}
          </div>
        ) : null}
      </div>

      {trailing ? <div className={styles.trailing}>{trailing}</div> : null}
    </div>
  );
});

CrewIdentity.displayName = "CrewIdentity";
