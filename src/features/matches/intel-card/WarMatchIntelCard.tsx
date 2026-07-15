import Image from "next/image";
import type { IntelCardState } from "@/components/primitives/intel-card";
import {
  IntelCardAction,
  IntelCardActions,
  IntelCardSection,
  IntelCardShell,
  IntelMetric,
  IntelMetricGrid,
  IntelStatusPill,
} from "@/components/primitives/intel-card";

import styles from "./MatchIntelCard.module.css";
import type { WarLaneResult, WarMatchIntelViewModel } from "./match-intel.types";

export type WarMatchIntelCardProps = {
  model: WarMatchIntelViewModel;
  state?: IntelCardState;
};

const laneTone: Record<WarLaneResult["result"], "positive" | "danger" | "neutral"> = {
  W: "positive",
  L: "danger",
  P: "neutral",
};

export function WarMatchIntelCard({ model, state = "default" }: WarMatchIntelCardProps) {
  return (
    <IntelCardShell
      ariaLabel={`War match intel for ${model.home.name} versus ${model.away.name}`}
      eyebrow="War match intel"
      fallbackAction={<IntelCardAction href={model.warHref}>Open war room</IntelCardAction>}
      partialMessage="One lane feed is delayed. The verified aggregate score remains visible."
      state={state}
      statusLabel={model.live ? "Live" : model.statusLabel}
      statusTone={model.live ? "danger" : "warning"}
      title={model.formatLabel}
      variant="war"
    >
      <div className={styles.warScore!}>
        <div className={styles.warSide!}>
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
        <div className={styles.score!}>
          {model.live ? <span className={styles.live!}>Live</span> : null}
          <strong>{model.scoreLabel}</strong>
          <span>{model.formatLabel}</span>
        </div>
        <div className={styles.warSide!}>
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

      <IntelCardSection code="W.1" title="Lane status">
        <div className={styles.lanes!}>
          {model.lanes.map((lane) => (
            <div className={styles.lane!} key={lane.laneLabel}>
              <span>{lane.laneLabel}</span>
              <IntelStatusPill tone={laneTone[lane.result]}>{lane.result}</IntelStatusPill>
            </div>
          ))}
        </div>
      </IntelCardSection>

      <IntelCardSection code="W.2" title="Live operations">
        <IntelMetricGrid>
          <IntelMetric label="Round" tone="warning" value={model.roundLabel} />
          <IntelMetric label="Map" value={model.mapLabel} />
          <IntelMetric label="Started" tone="information" value={model.startedAtLabel} />
          <IntelMetric
            label="War ID"
            tone="special"
            value={model.id.replace("war-", "").toUpperCase()}
          />
        </IntelMetricGrid>
      </IntelCardSection>

      <IntelCardActions>
        <IntelCardAction href={model.warHref} tone="primary">
          View war room
        </IntelCardAction>
        {model.followHref ? (
          <IntelCardAction href={model.followHref}>Follow live</IntelCardAction>
        ) : (
          <IntelCardAction disabled>Live feed unavailable</IntelCardAction>
        )}
      </IntelCardActions>
    </IntelCardShell>
  );
}
