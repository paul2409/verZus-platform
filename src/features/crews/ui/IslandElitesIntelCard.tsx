import {
  IntelCardAction,
  IntelCardActions,
  IntelCardSection,
  IntelCardShell,
  IntelMetric,
  IntelMetricGrid,
  IntelStatusPill,
  IntelTag,
} from "@/components/primitives/intel-card";

import styles from "./CrewsScreen.module.css";

const licenseRows = [
  { label: "EA FC lane", value: "COMPLETE" },
  { label: "COD lane", value: "2/2 READY" },
  { label: "Clash lane", value: "8/8" },
  { label: "League lane", value: "118/120" },
  { label: "Verified matches", value: "12/12" },
  { label: "Crew trust", value: "VERIFIED" },
] as const;

export function IslandElitesIntelCard() {
  return (
    <IntelCardShell
      ariaLabel="Crew intel for Island Elites"
      eyebrow="Crew intel"
      statusLabel="Verified"
      statusTone="positive"
      title="Island Elites"
      variant="crew"
    >
      <div className={styles.intelIdentity}>
        <div aria-hidden="true" className={styles.intelEmblem}>
          IE
        </div>
        <div>
          <p className={styles.intelKicker}>Table · Crew Championship</p>
          <h3>Island Elites</h3>
          <div className={styles.intelTags}>
            <IntelTag tone="warning">IE holds #1</IntelTag>
            <IntelTag tone="positive">Verified</IntelTag>
          </div>
        </div>
      </div>

      <IntelCardSection code="C.4" title="License tracker">
        <ul className={styles.licenseGrid}>
          {licenseRows.map((row) => (
            <li key={row.label}>
              <div>
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </div>
              <IntelStatusPill tone="positive">✓</IntelStatusPill>
            </li>
          ))}
        </ul>
      </IntelCardSection>

      <IntelCardSection code="C.8" title="Crew readiness">
        <IntelMetricGrid>
          <IntelMetric label="War rank" tone="warning" value="#1" />
          <IntelMetric label="Roster" tone="positive" value="8 / 8" />
          <IntelMetric label="Coverage" tone="information" value="4 / 4" />
          <IntelMetric label="Trust" tone="positive" value="98" />
        </IntelMetricGrid>
      </IntelCardSection>

      <IntelCardActions>
        <IntelCardAction href="/crews" tone="primary">
          View crew HQ
        </IntelCardAction>
        <IntelCardAction href="/crews" tone="secondary">
          Follow crew
        </IntelCardAction>
        <IntelCardAction href="/compete" tone="danger">
          Challenge crew
        </IntelCardAction>
        <IntelCardAction href="/crews" tone="ghost">
          View roster
        </IntelCardAction>
        <IntelCardAction href="/search" tone="ghost">
          Scout missing lane
        </IntelCardAction>
      </IntelCardActions>
    </IntelCardShell>
  );
}
