"use client";

// VERZUS M9.4 CREW RESOURCE HEALTH STRIP

import { Button } from "@/components/primitives/button";

import {
  crewResourceNames,
  type CrewResourceHealth,
  type CrewResourceName,
} from "../model/crew-resource.types";
import styles from "./CrewResourceScreen.module.css";

const labels: Record<CrewResourceName, string> = {
  profile: "Profile",
  roster: "Roster",
  requests: "Requests",
  activity: "Activity",
  rankings: "Rankings",
  achievements: "Achievements",
  settings: "Settings",
};

export function CrewResourceStatusStrip({
  health,
  onRetry,
}: {
  health: Record<CrewResourceName, CrewResourceHealth>;
  onRetry: (resource: CrewResourceName) => void;
}) {
  return (
    <section aria-label="Crew resource status" className={styles.statusStrip}>
      <div className={styles.statusHeading}>
        <strong>Independent Crew resources</strong>
        <span>One unavailable panel does not remove the profile.</span>
      </div>
      <ul>
        {crewResourceNames.map((resource) => {
          const item = health[resource];
          return (
            <li data-state={item.state} key={resource}>
              <span aria-hidden="true" className={styles.statusDot} />
              <span>{labels[resource]}</span>
              <small>{item.state}</small>
              {item.state === "error" && item.retryable ? (
                <Button onClick={() => onRetry(resource)} size="sm" variant="ghost">
                  Retry
                </Button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
