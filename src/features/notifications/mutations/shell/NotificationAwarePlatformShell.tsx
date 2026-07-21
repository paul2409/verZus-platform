// VERZUS M12.4 FEATURE-OWNED SHELL BADGE BRIDGE

"use client";

import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { PlatformShell } from "@/components/layout/app-shell";

import { notificationUnreadCountQueryOptions } from "../api/notification-mutation.query";

export function NotificationAwarePlatformShell({ children }: { children: ReactNode }) {
  const unread = useQuery(notificationUnreadCountQueryOptions("normal"));

  return (
    <PlatformShell notificationCount={unread.data?.unreadCount ?? 0}>
      {children}
    </PlatformShell>
  );
}
