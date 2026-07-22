// VERZUS M12.9 PRODUCTION NOTIFICATION DRAWER
"use client";

import type { ReactNode } from "react";

import { EmptyState } from "@/components/primitives/feedback";
import { Drawer } from "@/components/primitives/overlay";

import { WidgetBoundary, WidgetErrorFallback } from "../widget-boundary";
import styles from "./ShellOverlays.module.css";

export interface ShellNotificationsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notificationCount: number;
  children?: ReactNode;
}

function DefaultNotificationContent({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  return (
    <EmptyState
      compact
      title="No unread notifications"
      description="Match, competition, Crew, and reward updates will appear here when production events occur."
      action={
        <a
          className={styles.notificationLink}
          href="/notifications"
          onClick={() => onOpenChange(false)}
        >
          Open notification centre
        </a>
      }
    />
  );
}

export function ShellNotificationsDrawer({
  open,
  onOpenChange,
  notificationCount,
  children,
}: ShellNotificationsDrawerProps) {
  return (
    <Drawer
      description={`${notificationCount} unread notification${notificationCount === 1 ? "" : "s"}`}
      onOpenChange={onOpenChange}
      open={open}
      side="right"
      size="sm"
      title="Notifications"
    >
      <WidgetBoundary
        fallback={({ errorId, reset }) => (
          <WidgetErrorFallback
            compact
            description="Notification content failed independently. Global navigation and page content remain available."
            errorId={errorId}
            name="Notification content"
            onRetry={reset}
          />
        )}
        name="Notification content"
      >
        {children ?? <DefaultNotificationContent onOpenChange={onOpenChange} />}
      </WidgetBoundary>
    </Drawer>
  );
}
