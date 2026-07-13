import { forwardRef, type HTMLAttributes } from "react";

import { Avatar, type AvatarProps, type AvatarSize } from "./Avatar";
import styles from "./Avatar.module.css";
import { joinClassNames } from "./utils";

export type AvatarGroupItem = Omit<AvatarProps, "size" | "decorative"> & {
  id: string;
};

export type AvatarGroupProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  items: AvatarGroupItem[];
  max?: number;
  size?: AvatarSize;
  label?: string;
};

const groupSizeClasses = {
  xs: styles.groupSizeXs!,
  sm: styles.groupSizeSm!,
  md: styles.groupSizeMd!,
  lg: styles.groupSizeLg!,
  xl: styles.groupSizeXl!,
};

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroup(
  { items, max = 4, size = "md", label, className, ...divProps },
  ref,
) {
  const safeMax = Math.max(1, Math.floor(max));
  const visibleItems = items.slice(0, safeMax);
  const hiddenCount = Math.max(0, items.length - visibleItems.length);
  const accessibleLabel = label ?? `${items.length} members`;

  return (
    <div
      {...divProps}
      ref={ref}
      aria-label={accessibleLabel}
      className={joinClassNames(styles.avatarGroup, groupSizeClasses[size], className)}
      data-avatar-group-count={items.length}
      data-avatar-group-size={size}
      role="group"
    >
      <span className={styles.srOnly}>{items.map((item) => item.name).join(", ")}</span>

      <span aria-hidden="true" className={styles.avatarGroupVisuals}>
        {visibleItems.map((item, index) => (
          <span className={styles.avatarGroupItem} key={item.id} style={{ zIndex: index + 1 }}>
            <Avatar {...item} decorative size={size} />
          </span>
        ))}

        {hiddenCount > 0 ? (
          <span className={styles.avatarOverflow} style={{ zIndex: visibleItems.length + 1 }}>
            +{hiddenCount}
          </span>
        ) : null}
      </span>
    </div>
  );
});

AvatarGroup.displayName = "AvatarGroup";
