"use client";

// VERZUS M8.8 LEADERBOARD ENTITY INTEL LINK
// VERZUS M8.10.2 NULL-SAFE ROUTER COMPATIBILITY
// VERZUS M8.10 KEYBOARD AND TELEMETRY RELIABILITY

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { KeyboardEvent, ReactNode } from "react";

import { recordLeaderboardIntelTelemetry } from "../../telemetry";
import {
  buildLeaderboardIntelHref,
  type LeaderboardEntityDescriptor,
} from "../model/leaderboard-interaction.types";
import styles from "./LeaderboardInteractions.module.css";

export function LeaderboardEntityLink({
  children,
  descriptor,
  variant = "identity",
}: {
  children: ReactNode;
  descriptor: LeaderboardEntityDescriptor;
  variant?: "identity" | "affiliation" | "match";
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const href = buildLeaderboardIntelHref(
    pathname ?? "/leaderboards/weekly",
    searchParams?.toString() ?? "",
    {
      kind: descriptor.kind,
      entityId: descriptor.entityId,
    },
  );
  const entityIntelEnabled = process.env.NEXT_PUBLIC_ENABLE_M8_ENTITY_INTEL !== "false";

  if (!entityIntelEnabled) {
    return (
      <span className={styles.entityLink} data-intel-disabled="true" data-variant={variant}>
        {children}
      </span>
    );
  }

  const recordOpen = () => {
    recordLeaderboardIntelTelemetry("intel_opened", descriptor.kind, descriptor.entityId);
  };

  const activateWithSpace = (event: KeyboardEvent<HTMLAnchorElement>) => {
    if (event.key !== " ") return;
    event.preventDefault();
    event.currentTarget.click();
  };

  return (
    <Link
      aria-label={`Open ${descriptor.label} ${descriptor.kind} intel card`}
      className={styles.entityLink}
      data-intel-entity={descriptor.kind}
      data-intel-id={descriptor.entityId}
      data-variant={variant}
      href={href}
      id={`intel-trigger-${descriptor.kind}-${descriptor.entityId}`}
      onClick={recordOpen}
      onKeyDown={activateWithSpace}
      scroll={false}
    >
      {children}
    </Link>
  );
}
