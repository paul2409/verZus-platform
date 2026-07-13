import type { IntelCardState } from "@/components/primitives/intel-card";
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

import styles from "./CrewIntelCard.module.css";
import type { CrewIntelViewModel } from "./crew-intel.types";

export type CrewIntelCardProps = {
  model: CrewIntelViewModel;
  state?: IntelCardState;
};

export function CrewIntelCard({ model, state = "default" }: CrewIntelCardProps) {
  return (
    <IntelCardShell
      ariaLabel={`Crew intel for ${model.name}`}
      eyebrow="Crew intel"
      fallbackAction={<IntelCardAction href={model.crewHref}>Open crew profile</IntelCardAction>}
      partialMessage="Roster availability is delayed. Verified rank and war record remain visible."
      state={state}
      statusLabel={model.verified ? "Verified" : "Pending trust"}
      statusTone={model.verified ? "positive" : "warning"}
      title={`Rank #${model.rank}`}
      variant="crew"
    >
      <div className={styles.hero!}>
        <img
          alt={`${model.name} crew emblem`}
          className={styles.emblem!}
          height="128"
          src={model.emblemSrc}
          width="128"
        />
        <div className={styles.identity!}>
          <div className={styles.nameRow!}>
            <div>
              <h3>{model.name}</h3>
              <p>{model.locationLabel}</p>
            </div>
            <IntelStatusPill tone="special">{model.tag}</IntelStatusPill>
          </div>
          <div className={styles.tags!}>
            <IntelTag tone="special">{model.tierLabel}</IntelTag>
            <IntelTag tone="warning">Rank #{model.rank}</IntelTag>
          </div>
        </div>
        <div aria-label={`Trust score ${model.trust}`} className={styles.trust!}>
          <span>Trust</span>
          <strong>{model.trust}</strong>
        </div>
      </div>

      <IntelCardSection code="C.1" title="Crew performance">
        <IntelMetricGrid>
          <IntelMetric label="Reputation" tone="special" value={model.reputationLabel} />
          <IntelMetric label="Members" value={model.membersLabel} />
          <IntelMetric label="Win rate" tone="positive" value={model.winRateLabel} />
          <IntelMetric label="War record" tone="warning" value={model.warRecordLabel} />
        </IntelMetricGrid>
      </IntelCardSection>

      <IntelCardActions>
        <IntelCardAction href={model.crewHref} tone="primary">
          View crew HQ
        </IntelCardAction>
        {model.joinWarHref ? (
          <IntelCardAction href={model.joinWarHref}>Join war</IntelCardAction>
        ) : (
          <IntelCardAction disabled>War unavailable</IntelCardAction>
        )}
      </IntelCardActions>
    </IntelCardShell>
  );
}
