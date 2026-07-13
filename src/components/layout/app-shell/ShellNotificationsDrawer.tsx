// VERZUS M3 STEP 3.7
"use client";

import type { ReactNode } from "react";

import { Drawer } from "@/components/primitives/overlay";

import { WidgetBoundary, WidgetErrorFallback } from "../widget-boundary";
import styles from "./ShellOverlays.module.css";

export interface ShellNotificationsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notificationCount: number;
  children?: ReactNode;
}

const defaultNotifications = [
  {
    id: "match-check-in",
    category: "Match",
    title: "Check-in opens soon",
    description: "Your match against Lagos Lynx opens for check-in in 42 minutes.",
    time: "Now",
    unread: true,
  },
  {
    id: "crew-rank",
    category: "Crew",
    title: "Mainland Titans moved up",
    description: "Your Crew reached second place in the weekly championship.",
    time: "18m",
    unread: true,
  },
  {
    id: "reward",
    category: "Reward",
    title: "Weekly reward available",
    description: "A new reward is ready to inspect in your progression summary.",
    time: "2h",
    unread: false,
  },
] as const;

function DefaultNotificationContent({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  return (
    <>
      <ol className={styles.notificationList}>
        {defaultNotifications.map((notification) => (
          <li
            className={styles.notificationItem}
            data-unread={notification.unread ? "true" : "false"}
            key={notification.id}
          >
            <div className={styles.notificationMeta}>
              <span>{notification.category}</span>
              <time>{notification.time}</time>
            </div>
            <h3>{notification.title}</h3>
            <p>{notification.description}</p>
          </li>
        ))}
      </ol>

      <div className={styles.notificationFooter}>
        <a
          className={styles.notificationLink}
          href="/notifications"
          onClick={() => onOpenChange(false)}
        >
          Open notification centre
        </a>
      </div>
    </>
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
      description={`${notificationCount} unread notifications`}
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
