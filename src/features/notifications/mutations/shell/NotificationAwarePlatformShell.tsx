// VERZUS M12.9 PRODUCTION PLATFORM SHELL

"use client";

import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";

import {
  PlatformShell,
  useBrowserConnectivity,
  type GlobalShellStatus,
  type ShellProfile,
} from "@/components/layout/app-shell";
import { PublicQuerySanitizer } from "@/features/platform-runtime/ui";

import { notificationUnreadCountQueryOptions } from "../api/notification-mutation.query";

function resolveStatus(online: boolean, notificationFailed: boolean): GlobalShellStatus {
  if (!online) {
    return {
      kind: "offline",
      label: "Offline",
      detail: "Navigation and cached information remain available. Network actions are paused.",
    };
  }

  if (notificationFailed) {
    return {
      kind: "degraded",
      label: "Partially available",
      detail: "Notifications are unavailable. Other product areas remain operational.",
    };
  }

  return {
    kind: "operational",
    label: "Connected",
    detail: "Production data is current.",
  };
}

export function NotificationAwarePlatformShell({
  children,
  profile,
}: {
  children: ReactNode;
  profile: ShellProfile;
}) {
  const online = useBrowserConnectivity();
  const unread = useQuery(notificationUnreadCountQueryOptions());
  const status = resolveStatus(online, unread.isError);

  return (
    <PlatformShell
      notificationCount={unread.data?.unreadCount ?? 0}
      offline={!online}
      profile={profile}
      status={status}
    >
      <PublicQuerySanitizer />
      {children}
    </PlatformShell>
  );
}
