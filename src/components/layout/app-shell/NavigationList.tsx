import Link from "next/link";

import { Icon } from "@/components/primitives/icon";

import styles from "./AppShell.module.css";
import { resolveShellNavigationItems } from "./navigation-state";
import type {
  ShellFeatureFlags,
  ShellNavigationItem,
  ShellNavigationRuntimeStates,
} from "./shell.types";

export type NavigationListProps = {
  items: readonly ShellNavigationItem[];
  currentPath: string;
  compact?: boolean;
  featureFlags?: ShellFeatureFlags | undefined;
  runtimeStates?: ShellNavigationRuntimeStates | undefined;
  offline?: boolean | undefined;
};

export function NavigationList({
  items,
  currentPath,
  compact = false,
  featureFlags,
  runtimeStates,
  offline = false,
}: NavigationListProps) {
  const resolvedItems = resolveShellNavigationItems(items, {
    currentPath,
    featureFlags,
    runtimeStates,
    offline,
  });

  return (
    <ul className={compact ? styles.navigationListCompact : styles.navigationList}>
      {resolvedItems.map(({ item, state, current, disabled, reason }) => {
        const count = item.notification?.count ?? item.badgeCount;
        const showCount = count !== undefined && count > 0;
        const showDot = item.notification?.dot === true;
        const stateDescription = reason ? <span className={styles.srOnly}>{reason}</span> : null;

        const content = (
          <>
            <span className={styles.navigationIcon}>
              <Icon decorative name={item.icon} size="md" />
              {state === "loading" ? (
                <span aria-hidden="true" className={styles.navigationSpinner} />
              ) : null}
            </span>
            <span className={styles.navigationLabel}>{item.label}</span>
            {showCount ? (
              <span
                aria-label={item.notification?.label ?? `${count} unread`}
                className={styles.navigationCount}
                role="status"
              >
                {count > 99 ? "99+" : count}
              </span>
            ) : null}
            {showDot ? (
              <span
                aria-label={item.notification?.label ?? `New ${item.label} activity`}
                className={styles.navigationDot}
                role="status"
              />
            ) : null}
            {state === "partial" ? (
              <span aria-hidden="true" className={styles.navigationPartial}>
                •
              </span>
            ) : null}
            {state === "error" ? (
              <span aria-hidden="true" className={styles.navigationError}>
                !
              </span>
            ) : null}
            {stateDescription}
          </>
        );

        return (
          <li key={item.id}>
            {disabled ? (
              <span
                aria-current={current ? "page" : undefined}
                aria-disabled="true"
                className={styles.navigationLink}
                data-navigation-current={current ? "true" : undefined}
                data-navigation-id={item.id}
                data-navigation-state={state}
                title={reason ?? undefined}
              >
                {content}
              </span>
            ) : (
              <Link
                aria-current={current ? "page" : undefined}
                className={styles.navigationLink}
                data-navigation-current={current ? "true" : undefined}
                data-navigation-id={item.id}
                data-navigation-state={state}
                href={item.href}
                title={reason ?? undefined}
              >
                {content}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
