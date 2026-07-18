// VERZUS M10.5 PROGRESSION TRACK AND SEASON PROGRESS UI

import Image from "next/image";

import { Badge } from "@/components/primitives/badge";
import { Icon } from "@/components/primitives/icon";

import type { RewardProgress, RewardState, RewardTrackItem } from "../../foundation";
import type {
  RewardSeasonMilestoneState,
  RewardSeasonProgress,
} from "../model/reward-progression.types";
import styles from "./RewardProgressionPanel.module.css";

const numberFormatter = new Intl.NumberFormat("en-US");

function clampPercent(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((current / target) * 100)));
}

function rewardTone(state: RewardState) {
  if (state === "claimable" || state === "claimed") return "positive" as const;
  if (state === "eligible" || state === "claiming") return "information" as const;
  if (state === "expired" || state === "revoked") return "negative" as const;
  return "neutral" as const;
}

function milestoneTone(state: RewardSeasonMilestoneState) {
  if (state === "completed") return "positive" as const;
  if (state === "current") return "special" as const;
  if (state === "upcoming") return "information" as const;
  return "neutral" as const;
}

function label(value: string): string {
  return value.replaceAll("_", " ");
}

export function RewardProgressionPanel({
  levelProgress,
  season,
  track,
}: {
  levelProgress: RewardProgress;
  season: RewardSeasonProgress | null;
  track: RewardTrackItem[];
}) {
  if (!season) {
    return (
      <section aria-labelledby="season-progress-title" className={styles.panel}>
        <div className={styles.emptyState} role="status">
          <Icon decorative name="trophy" size="lg" />
          <div>
            <h2 id="season-progress-title">Season progress</h2>
            <p>No active season is available. Confirmed level progress remains intact.</p>
          </div>
        </div>
      </section>
    );
  }

  const seasonPercent = clampPercent(season.currentSeasonXp, season.targetSeasonXp);
  const weeklyPercent = clampPercent(season.weeklyXpEarned, season.weeklyXpCap);

  return (
    <section aria-labelledby="season-progress-title" className={styles.panel} id="season-progress">
      <header className={styles.heading}>
        <div>
          <p>{season.chapterLabel}</p>
          <h2 id="season-progress-title">Season progress</h2>
        </div>
        <Badge tone={season.state === "active" ? "positive" : "neutral"} variant="soft">
          {season.state === "active" ? `${season.daysRemaining} days left` : label(season.state)}
        </Badge>
      </header>

      <div className={styles.seasonSummary}>
        <div className={styles.tierBadge} aria-label={`Current season tier ${season.currentTier}`}>
          <span>Tier</span>
          <strong>{season.currentTier}</strong>
          <small>of {season.totalTiers}</small>
        </div>

        <div className={styles.seasonMeter}>
          <div>
            <span>{season.label}</span>
            <strong>{seasonPercent}%</strong>
          </div>
          <progress
            aria-label={`${season.label} completion`}
            max={season.targetSeasonXp}
            value={season.currentSeasonXp}
          />
          <p>
            <strong>{numberFormatter.format(season.currentSeasonXp)}</strong>
            <span> / {numberFormatter.format(season.targetSeasonXp)} season XP</span>
          </p>
        </div>
      </div>

      <dl className={styles.seasonStats}>
        <div>
          <dt>Current level</dt>
          <dd>{levelProgress.currentLevel}</dd>
        </div>
        <div>
          <dt>Weekly XP</dt>
          <dd>{numberFormatter.format(season.weeklyXpEarned)}</dd>
        </div>
        <div>
          <dt>Active boost</dt>
          <dd>{season.boostMultiplier.toFixed(2)}×</dd>
        </div>
      </dl>

      <div className={styles.weeklyCap}>
        <div>
          <strong>Weekly XP capacity</strong>
          <span>{weeklyPercent}% used</span>
        </div>
        <progress max={season.weeklyXpCap} value={season.weeklyXpEarned} />
        <p>
          {numberFormatter.format(season.weeklyXpEarned)} of{" "}
          {numberFormatter.format(season.weeklyXpCap)} XP
        </p>
      </div>

      <div className={styles.sectionHeading}>
        <h3>Weekly objectives</h3>
        <span>{season.objectives.filter((objective) => objective.completed).length} completed</span>
      </div>

      <ul className={styles.objectiveList}>
        {season.objectives.map((objective) => {
          const objectivePercent = clampPercent(
            objective.progressCurrent,
            objective.progressTarget,
          );
          return (
            <li data-complete={objective.completed ? "true" : "false"} key={objective.id}>
              <div className={styles.objectiveIcon}>
                <Icon decorative name={objective.completed ? "check" : "target"} size="sm" />
              </div>
              <div className={styles.objectiveCopy}>
                <div>
                  <strong>{objective.title}</strong>
                  <span>+{numberFormatter.format(objective.xpReward)} XP</span>
                </div>
                <p>{objective.description}</p>
                <progress max={objective.progressTarget} value={objective.progressCurrent} />
                <small>
                  {numberFormatter.format(objective.progressCurrent)} /{" "}
                  {numberFormatter.format(objective.progressTarget)} · {objectivePercent}%
                </small>
              </div>
            </li>
          );
        })}
      </ul>

      <div className={styles.sectionHeading}>
        <h3>Season milestones</h3>
        <span>Confirmed checkpoints</span>
      </div>

      <ol aria-label={`${season.label} milestones`} className={styles.milestoneList}>
        {season.milestones.map((milestone) => (
          <li data-state={milestone.state} key={milestone.id}>
            <span>Tier {milestone.tier}</span>
            <strong>{milestone.title}</strong>
            <p>{milestone.requirementLabel}</p>
            <Badge tone={milestoneTone(milestone.state)} variant="soft">
              {label(milestone.state)}
            </Badge>
          </li>
        ))}
      </ol>

      <div className={styles.sectionHeading}>
        <h3>Level reward path</h3>
        <span>{levelProgress.seasonLabel}</span>
      </div>

      <ol aria-label={`${levelProgress.seasonLabel} reward track`} className={styles.trackList}>
        {track.map((reward) => (
          <li data-reward-state={reward.state} key={`${reward.id}-${reward.level}`}>
            <span>Level {reward.level}</span>
            <Image alt={reward.artworkAlt} height={88} src={reward.artworkSrc} width={88} />
            <strong>{reward.title}</strong>
            <Badge tone={rewardTone(reward.state)} variant="soft">
              {reward.state === "locked" ? <Icon decorative name="lock" size="xs" /> : null}
              {label(reward.state)}
            </Badge>
          </li>
        ))}
      </ol>
    </section>
  );
}
