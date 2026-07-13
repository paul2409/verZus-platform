// VERZUS M3 STEP 3.7

import type { ReactNode } from "react";

import { Avatar } from "@/components/primitives/avatar";

import { WidgetBoundary } from "../widget-boundary";
import styles from "./AppShell.module.css";
import { NavigationList } from "./NavigationList";
import type {
  GlobalShellStatus,
  ShellFeatureFlags,
  ShellNavigationItem,
  ShellNavigationRuntimeStates,
  ShellProfile,
} from "./shell.types";

export type DesktopSidebarProps = {
  currentPath: string;
  items: readonly ShellNavigationItem[];
  profile: ShellProfile;
  status: GlobalShellStatus;
  featureFlags?: ShellFeatureFlags | undefined;
  runtimeStates?: ShellNavigationRuntimeStates | undefined;
  offline?: boolean | undefined;
  supplement?: ReactNode;
};

export function DesktopSidebar({
  currentPath,
  items,
  profile,
  status,
  featureFlags,
  runtimeStates,
  offline = false,
  supplement,
}: DesktopSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarProfile}>
        <Avatar
          decorative
          initials={profile.initials}
          name={profile.name}
          presence={profile.presence ?? "none"}
          size="lg"
          src={profile.avatarSrc}
          tone="green"
          verified
        />
        <div>
          <strong>{profile.name}</strong>
          <span>{profile.title ?? "Competitor"}</span>
        </div>
      </div>

      <nav aria-label="Primary desktop navigation" className={styles.sidebarNavigation}>
        <NavigationList
          currentPath={currentPath}
          featureFlags={featureFlags}
          items={items}
          offline={offline}
          runtimeStates={runtimeStates}
        />
      </nav>

      <div className={styles.sidebarMeta}>
        {profile.points !== undefined ? (
          <div className={styles.sidebarMetric}>
            <span>Points</span>
            <strong>{profile.points.toLocaleString()}</strong>
          </div>
        ) : null}
        {profile.crewName ? (
          <div className={styles.sidebarMetric}>
            <span>Crew</span>
            <strong>{profile.crewName}</strong>
          </div>
        ) : null}
      </div>

      {supplement ? (
        <div className={styles.sidebarSupplement}>
          <WidgetBoundary name="Sidebar intelligence">{supplement}</WidgetBoundary>
        </div>
      ) : null}

      <div className={styles.sidebarStatus} data-shell-status={status.kind}>
        <span aria-hidden="true" className={styles.statusDot} />
        <div>
          <strong>{status.label}</strong>
          {status.detail ? <span>{status.detail}</span> : null}
        </div>
      </div>
    </aside>
  );
}
