import Image from "next/image";
import type { IntelCardState } from "@/components/primitives/intel-card";
import {
  IntelCardAction,
  IntelCardActions,
  IntelCardSection,
  IntelCardShell,
  IntelMetric,
  IntelMetricGrid,
  IntelTag,
} from "@/components/primitives/intel-card";

import styles from "./MatchIntelCard.module.css";
import type { MatchIntelViewModel } from "./match-intel.types";

export type MatchIntelCardProps = {
  model: MatchIntelViewModel;
  state?: IntelCardState;
};

export function MatchIntelCard({ model, state = "default" }: MatchIntelCardProps) {
  return (
    <IntelCardShell
      ariaLabel={`Match intel for ${model.home.name} versus ${model.away.name}`}
      eyebrow="Match intel"
      fallbackAction={<IntelCardAction href={model.matchHref}>Open match</IntelCardAction>}
      partialMessage="Hype and audience telemetry are delayed. Check-in and match timing remain authoritative."
      state={state}
      statusLabel={model.statusLabel}
      statusTone="positive"
      title={model.weekLabel}
      variant="match"
    >
      <div className={styles.matchup!}>
        <div className={styles.side!}>
          <Image
            alt={`${model.home.name} emblem`}
            height={72}
            sizes="72px"
            src={model.home.emblemSrc}
            unoptimized
            width={72}
          />
          <strong>{model.home.name}</strong>
          <span>{model.home.sideLabel}</span>
        </div>

        <div className={styles.countdown!}>
          <span>{model.startsAtLabel}</span>
          <strong>{model.countdownLabel}</strong>
          <IntelTag tone="warning">{model.gameLabel}</IntelTag>
        </div>

        <div className={styles.side!}>
          <Image
            alt={`${model.away.name} emblem`}
            height={72}
            sizes="72px"
            src={model.away.emblemSrc}
            unoptimized
            width={72}
          />
          <strong>{model.away.name}</strong>
          <span>{model.away.sideLabel}</span>
        </div>
      </div>

      <p className={styles.format!}>{model.formatLabel}</p>

      <IntelCardSection code="M.1" title="Match operations">
        <IntelMetricGrid>
          <IntelMetric label="Prize pool" tone="positive" value={model.prizePoolLabel} />
          <IntelMetric label="Stakes" tone="warning" value={model.stakesLabel} />
          <IntelMetric label="Check-in closes" value={model.checkInClosesLabel} />
          <IntelMetric
            label="Match ID"
            tone="information"
            value={model.id.replace("match-", "").toUpperCase()}
          />
        </IntelMetricGrid>
      </IntelCardSection>

      <IntelCardActions>
        <IntelCardAction href={model.matchHref}>View details</IntelCardAction>
        {model.checkInHref ? (
          <IntelCardAction href={model.checkInHref} tone="primary">
            Check in
          </IntelCardAction>
        ) : (
          <IntelCardAction disabled>Check-in unavailable</IntelCardAction>
        )}
      </IntelCardActions>
    </IntelCardShell>
  );
}
