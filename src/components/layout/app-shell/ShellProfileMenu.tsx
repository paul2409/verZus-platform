// VERZUS M3 STEP 3.6
"use client";

import { useEffect, useState } from "react";

import { Avatar } from "@/components/primitives/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/primitives/overlay";

import shellStyles from "./AppShell.module.css";
import styles from "./ShellOverlays.module.css";
import type { ShellProfile } from "./shell.types";

export interface ShellProfileMenuProps {
  profile: ShellProfile;
  routeKey: string;
}

export function ShellProfileMenu({ profile, routeKey }: ShellProfileMenuProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setOpen(false);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [routeKey]);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger aria-label="Open profile menu" className={shellStyles.profileControl}>
        <Avatar
          decorative
          initials={profile.initials}
          name={profile.name}
          presence={profile.presence ?? "none"}
          size="sm"
          src={profile.avatarSrc}
          tone="green"
        />
        <span className={shellStyles.profileCopy}>
          <strong>{profile.name}</strong>
          {profile.title ? <small>{profile.title}</small> : null}
        </span>
        <span aria-hidden="true" className={shellStyles.profileChevron}>
          ▾
        </span>
      </PopoverTrigger>

      <PopoverContent align="end" aria-label="Profile menu" className={styles.profileContent}>
        <div className={styles.profileSummary}>
          <strong>{profile.name}</strong>
          <span>
            {profile.handle
              ? `@${profile.handle.replace(/^@/, "")}`
              : (profile.title ?? "Competitor")}
          </span>
        </div>

        <div className={styles.profileMetrics}>
          <div className={styles.profileMetric}>
            <span>Points</span>
            <strong>{profile.points?.toLocaleString() ?? "—"}</strong>
          </div>
          <div className={styles.profileMetric}>
            <span>Crew</span>
            <strong>{profile.crewName ?? "No Crew"}</strong>
          </div>
        </div>

        <nav aria-label="Profile destinations" className={styles.profileLinks}>
          <a className={styles.profileLink} href="/profile" onClick={() => setOpen(false)}>
            View profile
          </a>
          <a className={styles.profileLink} href="/settings" onClick={() => setOpen(false)}>
            Account settings
          </a>
        </nav>
      </PopoverContent>
    </Popover>
  );
}
