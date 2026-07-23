import Link from "next/link";

import type { SmartAction } from "@/lib/actions";

import { WidgetFrame } from "./WidgetFrame";
import styles from "./play-command-center.module.css";

export function QuickActions({ actions }: { actions: readonly SmartAction[] }) {
  return (
    <WidgetFrame
      className={styles.quickActionsWidget}
      eyebrow="BASED ON YOUR LIVE STATE"
      title="NEXT BEST ACTIONS"
    >
      <div className={styles.quickActionList}>
        {actions.map((action) => (
          <Link
            aria-label={`${action.label}. ${action.detail}. ${action.reason}.`}
            data-priority={action.priority >= 75 ? "high" : "normal"}
            data-tone={action.tone}
            href={action.href}
            key={action.id}
          >
            <span className={styles.quickActionIcon} aria-hidden="true">
              {action.glyph}
            </span>
            <span>
              <strong>{action.label}</strong>
              <small>{action.detail}</small>
              <em>{action.reason}</em>
            </span>
          </Link>
        ))}
      </div>
    </WidgetFrame>
  );
}
