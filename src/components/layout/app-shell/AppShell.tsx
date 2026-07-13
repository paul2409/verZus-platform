// VERZUS M3 STEP 3.7
"use client";

import { useEffect, useState, type MouseEvent, type ReactNode } from "react";

import { Drawer } from "@/components/primitives/overlay";

import styles from "./AppShell.module.css";
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileShellNavigation } from "./MobileShellNavigation";
import { NavigationList } from "./NavigationList";
import { RouteProgress } from "./RouteProgress";
import { ShellNotificationsDrawer } from "./ShellNotificationsDrawer";
import { ShellSearchModal } from "./ShellSearchModal";
import { ShellStatusRegion } from "./ShellStatusRegion";
import { TopBar } from "./TopBar";
import { mobileShellNavigationItems, shellNavigationItems } from "./shell-navigation";
import type {
  GlobalShellStatus,
  ShellFeatureFlags,
  ShellNavigationItem,
  ShellNavigationRuntimeStates,
  ShellProfile,
} from "./shell.types";

export type AppShellProps = {
  children: ReactNode;
  currentPath: string;
  profile: ShellProfile;
  status: GlobalShellStatus;
  navigationItems?: readonly ShellNavigationItem[] | undefined;
  mobileNavigationItems?: readonly ShellNavigationItem[] | undefined;
  notificationCount?: number | undefined;
  notificationsContent?: ReactNode;
  routeLoading?: boolean | undefined;
  featureFlags?: ShellFeatureFlags | undefined;
  navigationRuntimeStates?: ShellNavigationRuntimeStates | undefined;
  offline?: boolean | undefined;
  profileControl?: ReactNode;
  sidebarSupplement?: ReactNode;
};

function shouldStartRouteProgress(event: MouseEvent<HTMLDivElement>, currentPath: string): boolean {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return false;
  }

  const target = event.target;

  if (!(target instanceof Element)) {
    return false;
  }

  const anchor = target.closest<HTMLAnchorElement>("a[href]");

  if (!anchor || anchor.hasAttribute("download") || anchor.target === "_blank") {
    return false;
  }

  const destination = new URL(anchor.href, window.location.href);

  if (destination.origin !== window.location.origin) {
    return false;
  }

  return destination.pathname !== currentPath;
}

export function AppShell({
  children,
  currentPath,
  profile,
  status,
  navigationItems = shellNavigationItems,
  mobileNavigationItems = mobileShellNavigationItems,
  notificationCount = 0,
  notificationsContent,
  routeLoading = false,
  featureFlags,
  navigationRuntimeStates,
  offline,
  profileControl,
  sidebarSupplement,
}: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [routePending, setRoutePending] = useState(false);

  const navigationOffline = offline ?? status.kind === "offline";
  const effectiveRouteLoading = routeLoading || routePending;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMenuOpen(false);
      setNotificationsOpen(false);
      setSearchOpen(false);
      setRoutePending(false);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [currentPath]);

  return (
    <div
      className={styles.shell}
      data-route-loading={effectiveRouteLoading ? "true" : "false"}
      onClickCapture={(event) => {
        if (shouldStartRouteProgress(event, currentPath)) {
          setRoutePending(true);
        }
      }}
    >
      <RouteProgress active={effectiveRouteLoading} />

      <TopBar
        currentPath={currentPath}
        featureFlags={featureFlags}
        navigationItems={navigationItems}
        notificationCount={notificationCount}
        offline={navigationOffline}
        onMenuOpen={() => setMenuOpen(true)}
        onNotificationsOpen={() => setNotificationsOpen(true)}
        onSearchOpen={() => setSearchOpen(true)}
        profile={profile}
        profileControl={profileControl}
        runtimeStates={navigationRuntimeStates}
      />

      <DesktopSidebar
        currentPath={currentPath}
        featureFlags={featureFlags}
        items={navigationItems}
        offline={navigationOffline}
        profile={profile}
        runtimeStates={navigationRuntimeStates}
        status={status}
        supplement={sidebarSupplement}
      />

      <div className={styles.mainColumn}>
        <ShellStatusRegion routeLoading={effectiveRouteLoading} status={status} />
        <main aria-busy={effectiveRouteLoading ? "true" : undefined} className={styles.main}>
          {children}
        </main>
      </div>

      <div className={styles.mobileNavigationOnly}>
        <MobileShellNavigation
          currentPath={currentPath}
          featureFlags={featureFlags}
          items={mobileNavigationItems}
          offline={navigationOffline}
          runtimeStates={navigationRuntimeStates}
        />
      </div>

      <Drawer
        description="Primary destinations and account options"
        onOpenChange={setMenuOpen}
        open={menuOpen}
        side="left"
        size="sm"
        title="Navigation"
      >
        <div className={styles.drawerProfile}>
          <strong>{profile.name}</strong>
          <span>{profile.title ?? "Competitor"}</span>
        </div>
        <nav aria-label="Primary overlay navigation">
          <NavigationList
            currentPath={currentPath}
            featureFlags={featureFlags}
            items={navigationItems}
            offline={navigationOffline}
            runtimeStates={navigationRuntimeStates}
          />
        </nav>
      </Drawer>

      <ShellNotificationsDrawer
        notificationCount={notificationCount}
        onOpenChange={setNotificationsOpen}
        open={notificationsOpen}
      >
        {notificationsContent}
      </ShellNotificationsDrawer>

      <ShellSearchModal onOpenChange={setSearchOpen} open={searchOpen} />
    </div>
  );
}
