"use client";

import {
  forwardRef,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
} from "react";

import styles from "./BottomNavigation.module.css";

export type BottomNavigationVariant = "standard" | "elevated" | "floating";
export type BottomNavigationPosition = "static" | "fixed";
export type BottomNavigationItemCount = 3 | 4 | 5;
export type BottomNavigationItemState = "available" | "partial" | "disabled";
export type NavigationBadgeTone = "neutral" | "primary" | "warning" | "danger";

export type BottomNavigationProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  children: ReactNode;
  label?: string;
  variant?: BottomNavigationVariant;
  position?: BottomNavigationPosition;
  items?: BottomNavigationItemCount;
  safeArea?: boolean;
};

export type BottomNavigationItemProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "children" | "href"
> & {
  href: string;
  icon: ReactNode;
  label: string;
  badge?: ReactNode;
  current?: boolean;
  prominent?: boolean;
  state?: BottomNavigationItemState;
  offlineSafe?: boolean;
};

type CountNavigationBadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  count: number;
  dot?: false;
  label?: string;
  max?: number;
  tone?: NavigationBadgeTone;
};

type DotNavigationBadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  dot: true;
  count?: never;
  label: string;
  max?: never;
  tone?: NavigationBadgeTone;
};

export type NavigationBadgeProps = CountNavigationBadgeProps | DotNavigationBadgeProps;

const variantClasses: Record<BottomNavigationVariant, string> = {
  standard: styles.variantStandard!,
  elevated: styles.variantElevated!,
  floating: styles.variantFloating!,
};

const positionClasses: Record<BottomNavigationPosition, string> = {
  static: styles.positionStatic!,
  fixed: styles.positionFixed!,
};

const itemCountClasses: Record<BottomNavigationItemCount, string> = {
  3: styles.itemsThree!,
  4: styles.itemsFour!,
  5: styles.itemsFive!,
};

const stateClasses: Record<BottomNavigationItemState, string> = {
  available: styles.stateAvailable!,
  partial: styles.statePartial!,
  disabled: styles.stateDisabled!,
};

const badgeToneClasses: Record<NavigationBadgeTone, string> = {
  neutral: styles.badgeNeutral!,
  primary: styles.badgePrimary!,
  warning: styles.badgeWarning!,
  danger: styles.badgeDanger!,
};

function joinClassNames(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

function getStateDescription(
  state: BottomNavigationItemState,
  offlineSafe: boolean,
): string | null {
  if (state === "partial") {
    return "Partially available.";
  }

  if (state === "disabled") {
    return "Unavailable.";
  }

  if (!offlineSafe) {
    return "Requires a network connection.";
  }

  return null;
}

export const BottomNavigation = forwardRef<HTMLElement, BottomNavigationProps>(
  function BottomNavigation(
    {
      children,
      label = "Primary",
      variant = "standard",
      position = "fixed",
      items = 5,
      safeArea = true,
      className,
      ...navProps
    },
    ref,
  ) {
    return (
      <nav
        {...navProps}
        ref={ref}
        aria-label={label}
        className={joinClassNames(
          styles.navigation,
          variantClasses[variant],
          positionClasses[position],
          itemCountClasses[items],
          safeArea && styles.safeArea,
          className,
        )}
        data-bottom-navigation-items={String(items)}
        data-bottom-navigation-position={position}
        data-bottom-navigation-safe-area={safeArea ? "true" : "false"}
        data-bottom-navigation-variant={variant}
      >
        <span aria-hidden="true" className={styles.frame} />
        <div className={styles.surface}>
          <ul className={styles.list}>{children}</ul>
        </div>
      </nav>
    );
  },
);

BottomNavigation.displayName = "BottomNavigation";

export const BottomNavigationItem = forwardRef<HTMLAnchorElement, BottomNavigationItemProps>(
  function BottomNavigationItem(
    {
      href,
      icon,
      label,
      badge,
      current = false,
      prominent = false,
      state = "available",
      offlineSafe = true,
      className,
      onClick,
      tabIndex,
      ...anchorProps
    },
    ref,
  ) {
    const disabled = state === "disabled";
    const stateDescription = getStateDescription(state, offlineSafe);

    const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
      if (disabled) {
        event.preventDefault();
        return;
      }

      onClick?.(event);
    };

    return (
      <li
        className={joinClassNames(
          styles.item,
          stateClasses[state],
          prominent && styles.prominent,
          current && styles.current,
        )}
        data-navigation-current={current ? "true" : undefined}
        data-navigation-offline-safe={offlineSafe ? "true" : "false"}
        data-navigation-prominent={prominent ? "true" : undefined}
        data-navigation-state={state}
      >
        <a
          {...anchorProps}
          ref={ref}
          aria-current={current ? "page" : undefined}
          aria-disabled={disabled ? true : undefined}
          className={joinClassNames(styles.action, className)}
          href={href}
          onClick={handleClick}
          tabIndex={disabled ? -1 : tabIndex}
          title={anchorProps.title ?? label}
        >
          <span aria-hidden="true" className={styles.activeRail} />
          <span className={styles.iconWrap}>
            <span className={styles.icon}>{icon}</span>
            {badge ? <span className={styles.badgeSlot}>{badge}</span> : null}
            {state === "partial" ? (
              <span aria-hidden="true" className={styles.partialMarker} />
            ) : null}
          </span>
          <span className={styles.label}>{label}</span>
          {stateDescription ? <span className={styles.srOnly}>{stateDescription}</span> : null}
        </a>
      </li>
    );
  },
);

BottomNavigationItem.displayName = "BottomNavigationItem";

export function NavigationBadge(props: NavigationBadgeProps) {
  if ("dot" in props && props.dot === true) {
    const { label, tone = "danger", className, dot: ignoredDot, ...spanProps } = props;
    void ignoredDot;

    return (
      <span
        {...spanProps}
        aria-label={label}
        className={joinClassNames(
          styles.navigationBadge,
          styles.navigationBadgeDot,
          badgeToneClasses[tone],
          className,
        )}
        data-navigation-badge-kind="dot"
        data-navigation-badge-tone={tone}
        role="status"
      />
    );
  }

  const {
    count,
    max = 99,
    label,
    tone = "danger",
    className,
    dot: ignoredDot,
    ...spanProps
  } = props;
  void ignoredDot;

  if (count <= 0) {
    return null;
  }

  const visibleCount = count > max ? `${max}+` : String(count);
  const accessibleLabel = label ?? `${count} unread notifications`;

  return (
    <span
      {...spanProps}
      aria-label={accessibleLabel}
      className={joinClassNames(
        styles.navigationBadge,
        styles.navigationBadgeCount,
        badgeToneClasses[tone],
        className,
      )}
      data-navigation-badge-kind="count"
      data-navigation-badge-tone={tone}
      role="status"
    >
      <span aria-hidden="true">{visibleCount}</span>
    </span>
  );
}
