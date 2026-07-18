// VERZUS M9.8 CREW REVIEW HUB

import Link from "next/link";

import { getCrewReleaseConfig } from "@/features/crews/release";

import styles from "./review.module.css";

const reviewCases = [
  {
    label: "Crew profile",
    description: "Identity, rankings, roster, activity and operational controls.",
    href: "/crews/crew-xenon-esports",
  },
  {
    label: "No Crew",
    description: "Intentional landing state with discovery and creation actions.",
    href: "/crews?membership=none",
  },
  {
    label: "Crew discovery",
    description: "Search, filters, recruiting fit and shareable URL state.",
    href: "/crews?view=discover&membership=none",
  },
  {
    label: "Crew creation",
    description: "Five-step identity and settings workflow with automatic owner assignment.",
    href: "/crews/create?membership=none&step=basics",
  },
  {
    label: "Activity failure",
    description: "Activity failure remains local while profile, roster and settings survive.",
    href: "/crews/crew-xenon-esports?resource=activity&scenario=error",
  },
  {
    label: "Suspended Crew",
    description: "Platform-controlled suspension and fail-closed membership operations.",
    href: "/crews/crew-xenon-esports?lifecycleScenario=suspended",
  },
  {
    label: "Disband blocked",
    description: "Active matches or disputes prevent destructive disbanding.",
    href: "/crews/crew-xenon-esports?lifecycleScenario=blocked",
  },
  {
    label: "Archived Crew",
    description: "Historical read-only presentation with restoration control.",
    href: "/crews/crew-xenon-esports?lifecycleScenario=archived",
  },
] as const;

export default function M9CrewReviewPage() {
  const config = getCrewReleaseConfig();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <span>M9.8 CREW RELEASE REVIEW</span>
        <h1>Crew system approval</h1>
        <p>
          Review discovery, creation, membership, governance, lifecycle, failure isolation and
          destructive-operation guardrails before packaging the immutable Crew artifact.
        </p>
      </header>

      <section className={styles.meta} aria-label="Release metadata">
        <p>Environment: {config.appEnvironment}</p>
        <p>Release: {config.releaseSha}</p>
        <p>Crews: {config.crewsEnabled ? "enabled" : "disabled"}</p>
        <p>Stage: 9.8</p>
      </section>

      <section className={styles.grid} aria-label="M9 review cases">
        {reviewCases.map((item) => (
          <article className={styles.card} key={item.href}>
            <h2>{item.label}</h2>
            <p>{item.description}</p>
            <Link href={item.href}>Open review case</Link>
          </article>
        ))}
      </section>

      <section className={styles.checklist}>
        <h2>Release checklist</h2>
        <ul>
          <li>A Crew always has exactly one owner.</li>
          <li>Ownership transfer is separate from normal role changes.</li>
          <li>Member removal, lifecycle changes and disbanding require reasons or confirmation.</li>
          <li>One failed Crew resource does not remove the remaining profile.</li>
          <li>Suspended, archived and disbanded states are unmistakable and fail closed.</li>
          <li>390px, 768px and 1440px layouts contain no horizontal overflow.</li>
          <li>Keyboard focus, labels and destructive confirmations remain usable.</li>
        </ul>
      </section>
    </main>
  );
}
