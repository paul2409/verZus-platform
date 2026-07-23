import { Fragment } from "react";
import Link from "next/link";

import { Icon } from "@/components/primitives/icon";

import styles from "./AppShell.module.css";
import { resolveShellNavigationItems } from "./navigation-state";
import type {
  ShellFeatureFlags,
  ShellNavigationItem,
  ShellNavigationRuntimeStates,
  ShellNavigationSection,
} from "./shell.types";

export type NavigationListProps = {
  items: readonly ShellNavigationItem[];
  currentPath: string;
  compact?: boolean;
  featureFlags?: ShellFeatureFlags | undefined;
  runtimeStates?: ShellNavigationRuntimeStates | undefined;
  offline?: boolean | undefined;
};

const sectionLabels: Record<ShellNavigationSection, string> = {
  main: "MAIN",
  community: "COMMUNITY",
  account: "ACCOUNT",
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
      {resolvedItems.map(({ item, state, current, disabled, reason }, index) => {
        const count = item.notification?.count ?? item.badgeCount;
        const showCount = count !== undefined && count > 0;
        const showDot = item.notification?.dot === true;
        const previousSection = resolvedItems[index - 1]?.item.section;
        const showSection = !compact && item.section && item.section !== previousSection;
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
          <Fragment key={item.id}>
            {showSection ? (
              <li aria-hidden="true" className={styles.navigationSectionLabel}>
                <span>{sectionLabels[item.section!]}</span>
              </li>
            ) : null}
            <li>
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
          </Fragment>
        );
      })}
    </ul>
  );
}
