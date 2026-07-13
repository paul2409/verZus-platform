// VERZUS M3 STEP 3.5
"use client";

import { useState } from "react";

import {
  WidgetBoundary,
  WidgetLoadingFallback,
  WidgetUnavailableState,
} from "@/components/layout/widget-boundary";

import styles from "./page.module.css";

function StableWidget({ title, description }: { title: string; description: string }) {
  return (
    <article className={styles.widget}>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}

function CrewPulseWidget({ shouldCrash }: { shouldCrash: boolean }) {
  if (shouldCrash) {
    throw Object.assign(new Error("Crew activity service is unavailable"), {
      digest: "CREW-PULSE-503",
    });
  }

  return (
    <StableWidget
      title="Crew Pulse"
      description="Mainland Titans moved to second place. Two members are currently online."
    />
  );
}

export function WidgetBoundaryPreviewClient() {
  const [crewCrash, setCrewCrash] = useState(false);

  return (
    <div className={styles.demo}>
      <header className={styles.demoHeader}>
        <div>
          <h2>Independent widget failure</h2>
          <p>
            Trigger a Crew failure. The next-match and ranking widgets must remain visible and
            operational.
          </p>
        </div>

        <button
          className={styles.trigger}
          type="button"
          onClick={() => setCrewCrash((current) => !current)}
        >
          {crewCrash ? "Restore Crew widget" : "Trigger Crew failure"}
        </button>
      </header>

      <div className={styles.grid}>
        <WidgetBoundary name="Next match">
          <StableWidget
            title="Next Match"
            description="Jayflex vs Lagos Lynx. Check-in opens in 42 minutes."
          />
        </WidgetBoundary>

        <WidgetBoundary name="Crew pulse" resetKeys={[crewCrash]}>
          <CrewPulseWidget shouldCrash={crewCrash} />
        </WidgetBoundary>

        <WidgetBoundary name="Current position">
          <StableWidget
            title="Current Position"
            description="Weekly rank 17. Movement increased by three places."
          />
        </WidgetBoundary>
      </div>

      <header className={styles.demoHeader}>
        <div>
          <h2>Controlled fallback states</h2>
          <p>Loading and unavailable states preserve layout without crashing the page.</p>
        </div>
      </header>

      <div className={styles.states}>
        <WidgetLoadingFallback name="Recommended competitions" />
        <WidgetUnavailableState name="Recent activity" variant="offline" />
        <WidgetUnavailableState name="Weekly rank" variant="partial" />
        <WidgetUnavailableState name="Rewards" variant="maintenance" />
        <WidgetUnavailableState name="Crew applications" variant="empty" />
        <WidgetUnavailableState name="Trust score" />
      </div>
    </div>
  );
}
