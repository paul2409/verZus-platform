"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { AppShell } from "./AppShell";
import {
  defaultPlatformFeatureFlags,
  defaultPlatformProfile,
  defaultPlatformStatus,
} from "./platform-shell.config";
import type {
  GlobalShellStatus,
  ShellFeatureFlags,
  ShellNavigationRuntimeStates,
  ShellProfile,
} from "./shell.types";

export type PlatformShellProps = {
  children: ReactNode;
  profile?: ShellProfile | undefined;
  status?: GlobalShellStatus | undefined;
  featureFlags?: ShellFeatureFlags | undefined;
  navigationRuntimeStates?: ShellNavigationRuntimeStates | undefined;
  notificationCount?: number | undefined;
  notificationsContent?: ReactNode;
  routeLoading?: boolean | undefined;
  offline?: boolean | undefined;
};

export function PlatformShell({
  children,
  profile = defaultPlatformProfile,
  status = defaultPlatformStatus,
  featureFlags = defaultPlatformFeatureFlags,
  navigationRuntimeStates,
  notificationCount = 4,
  notificationsContent,
  routeLoading = false,
  offline,
}: PlatformShellProps) {
  const pathname = usePathname() || "/play";

  return (
    <AppShell
      currentPath={pathname}
      featureFlags={featureFlags}
      navigationRuntimeStates={navigationRuntimeStates}
      notificationCount={notificationCount}
      notificationsContent={notificationsContent}
      offline={offline}
      profile={profile}
      routeLoading={routeLoading}
      status={status}
    >
      {children}
    </AppShell>
  );
}
