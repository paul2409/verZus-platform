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
  IntelTag,
} from "@/components/primitives/intel-card";

import styles from "./PlayerIntelCard.module.css";
import type { PlayerFormResult, PlayerIntelViewModel } from "./player-intel.types";

export type PlayerIntelCardProps = {
  model: PlayerIntelViewModel;
  state?: IntelCardState;
};

const formTone: Record<PlayerFormResult, "positive" | "warning" | "danger"> = {
  W: "positive",
  D: "warning",
  L: "danger",
};

export function PlayerIntelCard({ model, state = "default" }: PlayerIntelCardProps) {
  return (
    <IntelCardShell
      ariaLabel={`Player intel for ${model.displayName}`}
      eyebrow="Player intel"
      fallbackAction={<IntelCardAction href={model.profileHref}>Open profile</IntelCardAction>}
      partialMessage="Recent-form telemetry is delayed. Verified rank and points remain available."
      state={state}
      statusLabel={model.verified ? "Verified" : "Unverified"}
      statusTone={model.verified ? "positive" : "warning"}
      title={`Rank #${model.rank}`}
      variant="player"
    >
      <div className={styles.hero!}>
        <Image
          alt={`${model.displayName} player portrait`}
          className={styles.avatar!}
          height={120}
          sizes="(min-width: 768px) 112px, 72px"
          src={model.avatarSrc}
          unoptimized
          width={120}
        />

        <div className={styles.identity!}>
          <div className={styles.nameRow!}>
            <div>
              <h3>{model.displayName}</h3>
              <p className={styles.handle!}>{model.handle}</p>
            </div>
            <IntelStatusPill tone="special">#{model.rank}</IntelStatusPill>
          </div>
          <p className={styles.subtitle!}>{model.subtitle}</p>
          <p className={styles.location!}>{model.locationLabel}</p>
          <div className={styles.tags!}>
            <IntelTag tone="special">{model.crewName}</IntelTag>
            <IntelTag tone="positive">{model.gameLabel}</IntelTag>
          </div>
        </div>

        <div aria-label={`Trust score ${model.trust}`} className={styles.trust!}>
          <span>Trust</span>
          <strong>{model.trust}</strong>
        </div>
      </div>

      <IntelCardSection code="P.1" title="Performance snapshot">
        <IntelMetricGrid>
          <IntelMetric label="Wins" tone="positive" value={model.wins} />
          <IntelMetric label="Win rate" tone="positive" value={model.winRateLabel} />
          <IntelMetric label="Points" value={model.pointsLabel} />
          <IntelMetric label="Streak" tone="positive" value={model.streakLabel} />
        </IntelMetricGrid>
      </IntelCardSection>

      <IntelCardSection code="P.2" title="Recent form">
        <div aria-label="Recent form" className={styles.form!}>
          {model.recentForm.map((result, index) => (
            <IntelStatusPill key={`${result}-${index}`} tone={formTone[result]}>
              {result}
            </IntelStatusPill>
          ))}
        </div>
      </IntelCardSection>

      {model.recentMatches?.length ? (
        <IntelCardSection code="P.3" title="Recent verified matches">
          <IntelMetricGrid>
            {model.recentMatches.slice(0, 3).map((match) => (
              <IntelMetric
                detail={match.scoreLabel}
                key={match.id}
                label={match.result}
                tone={formTone[match.result]}
                value={<a href={match.href}>{match.opponentLabel}</a>}
              />
            ))}
          </IntelMetricGrid>
        </IntelCardSection>
      ) : null}

      {model.achievementPreview?.length ? (
        <IntelCardSection code="P.4" title="Achievement preview">
          <div className={styles.form!}>
            {model.achievementPreview.map((achievement) => (
              <IntelTag key={achievement} tone="special">
                {achievement}
              </IntelTag>
            ))}
          </div>
        </IntelCardSection>
      ) : null}

      <IntelCardActions>
        <IntelCardAction href={model.profileHref} tone="primary">
          View full profile
        </IntelCardAction>
        {model.challengeHref ? (
          <IntelCardAction href={model.challengeHref}>Challenge</IntelCardAction>
        ) : (
          <IntelCardAction disabled>Challenge unavailable</IntelCardAction>
        )}
      </IntelCardActions>
    </IntelCardShell>
  );
}
