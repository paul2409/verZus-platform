"use client";

// VERZUS M10.6 ACHIEVEMENT SUMMARY AND DETAIL UI

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";

import { Badge } from "@/components/primitives/badge";

import { RewardAchievementDetailError } from "../adapter/reward-achievement-detail.adapter";
import { rewardAchievementDetailQueryOptions } from "../api/reward-achievement-detail.query";
import type { RewardAchievementSummary } from "../model/reward-achievement.types";
import styles from "./RewardAchievementsPanel.module.css";

function progressPercent(item: RewardAchievementSummary): number {
  return Math.min(100, Math.round((item.progressCurrent / item.progressTarget) * 100));
}

function stateLabel(state: RewardAchievementSummary["state"]): string {
  if (state === "in_progress") return "In progress";
  return state.charAt(0).toUpperCase() + state.slice(1);
}

export function RewardAchievementsPanel({
  achievements,
  selectedAchievementId,
}: {
  achievements: RewardAchievementSummary[];
  selectedAchievementId?: string | undefined;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedId = selectedAchievementId ?? "";
  const detail = useQuery(rewardAchievementDetailQueryOptions(selectedId));

  const hrefFor = (achievementId?: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (achievementId) next.set("achievement", achievementId);
    else next.delete("achievement");
    const query = next.toString();
    return `${pathname}${query ? `?${query}` : ""}#achievement-detail`;
  };

  return (
    <section aria-labelledby="achievement-title" className={styles.panel} id="achievements">
      <div className={styles.heading}>
        <div>
          <p>Progress proof</p>
          <h2 id="achievement-title">Achievements</h2>
        </div>
        <span>{achievements.filter((item) => item.state === "unlocked").length} unlocked</span>
      </div>

      {achievements.length > 0 ? (
        <ul className={styles.grid}>
          {achievements.map((achievement) => (
            <li data-state={achievement.state} key={achievement.id}>
              <Image
                alt={achievement.artworkAlt}
                height={64}
                src={achievement.artworkSrc}
                width={64}
              />
              <div className={styles.summaryCopy}>
                <div>
                  <strong>{achievement.title}</strong>
                  <Badge
                    tone={achievement.state === "unlocked" ? "positive" : "neutral"}
                    variant="soft"
                  >
                    {stateLabel(achievement.state)}
                  </Badge>
                </div>
                <p>{achievement.description}</p>
                <progress
                  aria-label={`${achievement.title} progress`}
                  max={achievement.progressTarget}
                  value={achievement.progressCurrent}
                />
                <span>
                  {achievement.progressCurrent}/{achievement.progressTarget} ·{" "}
                  {progressPercent(achievement)}%
                </span>
              </div>
              <a aria-label={`View ${achievement.title} details`} href={hrefFor(achievement.id)}>
                View details
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.empty} role="status">
          No confirmed achievements are available yet.
        </div>
      )}

      {selectedId ? (
        <aside aria-live="polite" className={styles.detail} id="achievement-detail">
          <div className={styles.detailHeading}>
            <h3>Achievement detail</h3>
            <a href={hrefFor()}>Close</a>
          </div>

          {detail.isPending ? <p>Loading confirmed achievement detail…</p> : null}

          {detail.isError ? (
            <div className={styles.error} role="alert">
              <strong>Achievement detail unavailable</strong>
              <p>{detail.error.message}</p>
              {detail.error instanceof RewardAchievementDetailError ? (
                <small>Request {detail.error.requestId}</small>
              ) : null}
              <button onClick={() => void detail.refetch()} type="button">
                Retry detail
              </button>
            </div>
          ) : null}

          {detail.data ? (
            <div className={styles.detailBody}>
              <Image
                alt={detail.data.data.artworkAlt}
                height={88}
                src={detail.data.data.artworkSrc}
                width={88}
              />
              <div className={styles.detailCopy}>
                <div className={styles.detailTitleRow}>
                  <div>
                    <p>{detail.data.data.categoryLabel}</p>
                    <h4>{detail.data.data.title}</h4>
                  </div>
                  <Badge tone="special" variant="outline">
                    {detail.data.data.rarity}
                  </Badge>
                </div>
                <p>{detail.data.data.requirementLabel}</p>
                <dl>
                  <div>
                    <dt>Status</dt>
                    <dd>{stateLabel(detail.data.data.state)}</dd>
                  </div>
                  <div>
                    <dt>Progress</dt>
                    <dd>
                      {detail.data.data.progressCurrent}/{detail.data.data.progressTarget}
                    </dd>
                  </div>
                  <div>
                    <dt>Unlocked</dt>
                    <dd>{detail.data.data.unlockedAtLabel ?? "Not unlocked"}</dd>
                  </div>
                  <div>
                    <dt>Linked reward</dt>
                    <dd>{detail.data.data.linkedReward?.amountLabel ?? "No linked reward"}</dd>
                  </div>
                </dl>
                <div className={styles.provenance}>
                  <strong>Verified provenance</strong>
                  {detail.data.data.provenance.map((entry) => (
                    <div key={`${entry.sourceType}-${entry.sourceId}`}>
                      <span>{entry.sourceLabel}</span>
                      <small>{entry.verifiedAtLabel}</small>
                    </div>
                  ))}
                </div>
                <small>Request {detail.data.meta.requestId}</small>
              </div>
            </div>
          ) : null}
        </aside>
      ) : null}
    </section>
  );
}
