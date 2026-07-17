// VERZUS M7.8 MATCH OPERATIONS VISUAL REVIEW HUB

import Link from "next/link";

import { matchOperationStateLabels, matchOperationStates } from "@/features/matches";
import { getMatchOperationsReleaseMetadata } from "@/features/matches/operations/release";

import styles from "./review.module.css";

const edgeReferences = [
  ["Unauthorized", "/matches/m7-preview?access=unauthorized"],
  ["Forbidden", "/matches/m7-preview?access=forbidden"],
  ["Not found", "/matches/m7-preview?access=not_found"],
  ["Maintenance", "/matches/m7-preview?access=maintenance"],
  ["Offline cached snapshot", "/matches/m7-preview?state=in-progress&availability=offline"],
  ["Stale cached snapshot", "/matches/m7-preview?state=in-progress&availability=stale"],
  [
    "Timeline partial failure",
    "/matches/m7-preview?state=in-progress&resource=timeline&scenario=partial_failure",
  ],
  ["Timeline widget crash", "/matches/m7-preview?state=in-progress&crash=timeline"],
] as const;

export default function M7MatchReviewPage() {
  const release = getMatchOperationsReleaseMetadata();

  return (
    <main className={styles.page} data-m7-review="7.8">
      <header className={styles.hero}>
        <span>M7.8 · RELEASE REVIEW</span>
        <h1>MATCH OPERATIONS</h1>
        <p>
          Review every lifecycle state at 390px, 768px and 1440px before recording final approval.
        </p>
        <dl>
          <div>
            <dt>Environment</dt>
            <dd>{release.environment}</dd>
          </div>
          <div>
            <dt>Release</dt>
            <dd>{release.release}</dd>
          </div>
          <div>
            <dt>Feature</dt>
            <dd>{release.enabled ? "enabled" : "disabled"}</dd>
          </div>
        </dl>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <span>01</span>
          <h2>Lifecycle references</h2>
          <strong>15 states × 3 widths</strong>
        </div>
        <div className={styles.grid}>
          {matchOperationStates.map((state, index) => (
            <Link href={`/matches/m7-preview?state=${state}`} key={state}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{matchOperationStateLabels[state]}</strong>
              <small>{state}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <span>02</span>
          <h2>Failure and access references</h2>
          <strong>Isolation review</strong>
        </div>
        <div className={styles.grid}>
          {edgeReferences.map(([label, href], index) => (
            <Link href={href} key={label}>
              <span>E{String(index + 1).padStart(2, "0")}</span>
              <strong>{label}</strong>
              <small>Open reference</small>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.commands}>
        <h2>Release commands</h2>
        <code>npm run m7:visual:update</code>
        <code>
          VERZUS_M7_VISUAL_APPROVAL=APPROVED VERZUS_M7_APPROVED_BY=&quot;Prismo&quot; npm run
          m7:approve
        </code>
        <code>npm run verify:m7:7.8</code>
        <code>npm run m7:release</code>
      </section>
    </main>
  );
}
