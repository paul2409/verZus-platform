// VERZUS STAGE 2 SHARED UI

import Link from "next/link";
import type { ReactNode } from "react";

import { Icon, IconButton } from "@/components/primitives/icon";

import { WidgetBoundary } from "../widget-boundary";
import styles from "./AppShell.module.css";
import { BrandMark } from "./BrandMark";
import { NavigationList } from "./NavigationList";
import overlayStyles from "./ShellOverlays.module.css";
import { ShellProfileMenu } from "./ShellProfileMenu";
import type {
  ShellFeatureFlags,
  ShellNavigationItem,
  ShellNavigationRuntimeStates,
  ShellProfile,
} from "./shell.types";

export type TopBarProps = {
  currentPath: string;
  navigationItems: readonly ShellNavigationItem[];
  notificationCount: number;
  profile: ShellProfile;
  onMenuOpen: () => void;
  onNotificationsOpen: () => void;
  onSearchOpen?: (() => void) | undefined;
  featureFlags?: ShellFeatureFlags | undefined;
  runtimeStates?: ShellNavigationRuntimeStates | undefined;
  offline?: boolean | undefined;
  profileControl?: ReactNode;
};

export function TopBar({
  currentPath,
  navigationItems,
  notificationCount,
  profile,
  onMenuOpen,
  onNotificationsOpen,
  onSearchOpen,
  featureFlags,
  runtimeStates,
  offline = false,
  profileControl,
}: TopBarProps) {
  return (
    <header className={styles.topBar}>
      <div className={styles.topBarStart}>
        <BrandMark />
      </div>

      <nav aria-label="Primary tablet navigation" className={styles.tabletNavigation}>
        <NavigationList
          compact
          currentPath={currentPath}
          featureFlags={featureFlags}
          items={navigationItems.slice(0, 6)}
          offline={offline}
          runtimeStates={runtimeStates}
        />
      </nav>

      <div className={styles.topBarActions}>
        <Link
          aria-label="Open leaderboards"
          className={styles.topBarActionLink}
          href="/leaderboards/weekly"
        >
          <Icon decorative name="trophy" size="md" />
        </Link>

        <IconButton
          className={styles.mobileMenuButton}
          icon="more-horizontal"
          label="Open navigation menu"
          onClick={onMenuOpen}
          size="md"
        />
        <IconButton icon="search" label="Search" onClick={onSearchOpen} size="md" />

        <span className={styles.notificationButtonWrap}>
          <IconButton
            icon="bell"
            label={`Open notifications, ${notificationCount} unread`}
            onClick={onNotificationsOpen}
            size="md"
          />
          {notificationCount > 0 ? (
            <span aria-hidden="true" className={styles.topBarBadge}>
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          ) : null}
        </span>

        <WidgetBoundary
          fallback={() => (
            <a className={overlayStyles.profileFailureLink} href="/profile">
              Open profile
            </a>
          )}
          name="Profile control"
        >
          {profileControl ?? <ShellProfileMenu profile={profile} routeKey={currentPath} />}
        </WidgetBoundary>
      </div>
    </header>
  );
}
