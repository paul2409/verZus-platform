"use client";

// VERZUS M10.1 APPROVED 390PX REWARDS FOUNDATION
// VERZUS M10.4 SERVER-AUTHORITATIVE CLAIM ACTIONS
// VERZUS M10.5 PROGRESSION TRACK AND SEASON PROGRESS
// VERZUS M10.6 ACHIEVEMENT DETAIL AND AUDITABLE HISTORY
// VERZUS M10.7 INDEPENDENT WIDGET FAILURE ISOLATION
// VERZUS M10.8 RELEASE-READY RESPONSIVE CONTAINMENT

import Image from "next/image";
import type { ReactNode } from "react";

import { Badge } from "@/components/primitives/badge";
import { Icon } from "@/components/primitives/icon";

import { RewardAchievementsPanel, type RewardAchievementSummary } from "../../achievements";
import { RewardClaimAction, RewardClaimFeedback } from "../../claims";
import { RewardHistoryAuditPanel } from "../../history";
import {
  rewardInventoryMock,
  RewardInventoryPanel,
  type RewardInventoryItem,
} from "../../inventory";
import {
  rewardSeasonProgressMock,
  RewardProgressionPanel,
  type RewardSeasonProgress,
} from "../../progression";
import {
  RewardWidgetBoundary,
  RewardWidgetFault,
  type RewardWidgetName,
  type RewardWidgetScenario,
} from "../../reliability";
import { rewardsFoundationMock } from "../mocks/reward-foundation.mock";
import type {
  RewardHistoryItem,
  RewardProgress,
  RewardSummary,
} from "../model/reward-foundation.types";
import styles from "./RewardsFoundationScreen.module.css";

const numberFormatter = new Intl.NumberFormat("en-US");

function IsolatedRewardWidget({
  children,
  selectedWidget,
  scenario,
  widget,
}: {
  children: ReactNode;
  selectedWidget?: RewardWidgetName | undefined;
  scenario: RewardWidgetScenario;
  widget: RewardWidgetName;
}) {
  return (
    <RewardWidgetBoundary widget={widget}>
      <RewardWidgetFault selectedWidget={selectedWidget} scenario={scenario} widget={widget}>
        {children}
      </RewardWidgetFault>
    </RewardWidgetBoundary>
  );
}

function ProgressCard({ progress }: { progress: RewardProgress }) {
  const progressValue = Math.round((progress.currentXp / progress.targetXp) * 100);

  return (
    <section aria-labelledby="progress-title" className={styles.progressCard}>
      <Image
        alt={`Level ${progress.currentLevel} shield`}
        className={styles.levelShield}
        height={112}
        priority
        src="/rewards/level-shield.svg"
        width={112}
      />
      <div className={styles.progressContent}>
        <div className={styles.sectionLabelRow}>
          <h2 id="progress-title">Your progress</h2>
          <strong>Lv. {progress.nextLevel}</strong>
        </div>
        <p className={styles.xpValue}>
          <strong>{numberFormatter.format(progress.currentXp)}</strong>
          <span> / {numberFormatter.format(progress.targetXp)} XP</span>
        </p>
        <progress
          aria-label={`Level ${progress.currentLevel} progress`}
          className={styles.progressBar}
          max={progress.targetXp}
          value={progress.currentXp}
        />
        <p className={styles.progressCaption}>
          {numberFormatter.format(progress.remainingXp)} XP to next level · {progressValue}%
        </p>
      </div>
    </section>
  );
}

function ClaimableRewardPanel({ reward }: { reward?: RewardSummary | undefined }) {
  return (
    <section aria-labelledby="claimable-title" className={styles.panel}>
      <div className={styles.panelHeading}>
        <h2 id="claimable-title">Claimable rewards</h2>
        <a href="#reward-inventory">View all</a>
      </div>

      {reward ? (
        <article className={styles.claimableCard} data-reward-state={reward.state}>
          <Image
            alt={reward.artworkAlt}
            className={styles.claimableArtwork}
            height={104}
            src={reward.artworkSrc}
            width={104}
          />
          <div className={styles.claimableCopy}>
            <h3>{reward.title}</h3>
            <p>{reward.description}</p>
            <Badge tone="positive" variant="soft">
              <Icon decorative name="check" size="xs" />
              Claimable
            </Badge>
          </div>
          <RewardClaimAction rewardId={reward.id} state={reward.state} />
        </article>
      ) : (
        <div className={styles.noClaimable} role="status">
          <Icon decorative name="check" size="lg" />
          <div>
            <strong>All available rewards are claimed</strong>
            <p>New rewards appear after verified matches, progression and season milestones.</p>
          </div>
        </div>
      )}
    </section>
  );
}

function RecentRewardHistory({ history }: { history: RewardHistoryItem[] }) {
  return (
    <section aria-labelledby="history-title" className={styles.panel} id="reward-history">
      <div className={styles.panelHeading}>
        <h2 id="history-title">Recently claimed</h2>
        <a href="#reward-audit-history">View history</a>
      </div>

      <ul className={styles.historyList} id="reward-history-list">
        {history.map((reward) => (
          <li key={reward.id}>
            <Image
              alt={reward.artworkAlt}
              className={styles.historyArtwork}
              height={56}
              src={reward.artworkSrc}
              width={56}
            />
            <div>
              <strong>{reward.title}</strong>
              <span>{reward.sourceLabel}</span>
            </div>
            <p>
              <strong>Claimed</strong>
              <span>{reward.claimedAtLabel}</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function RewardsFoundationScreen({
  model = rewardsFoundationMock,
  inventoryItems = rewardInventoryMock,
  season = rewardSeasonProgressMock,
  achievements = [],
  selectedAchievementId,
  historyPage = 1,
  selectedWidget,
  widgetScenario = "normal",
}: {
  model?: typeof rewardsFoundationMock;
  inventoryItems?: RewardInventoryItem[];
  season?: RewardSeasonProgress | null;
  achievements?: RewardAchievementSummary[];
  selectedAchievementId?: string | undefined;
  historyPage?: number;
  selectedWidget?: RewardWidgetName | undefined;
  widgetScenario?: RewardWidgetScenario;
} = {}) {
  const primaryReward = model.claimableRewards[0];

  return (
    <main className={styles.page} data-m10-stage="10.8" data-reference-viewport="390">
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>{model.progress.seasonLabel}</p>
          <h1>Rewards</h1>
        </div>
        <Badge tone="special" variant="outline">
          {model.claimableRewards.length} claimable
        </Badge>
      </header>

      <RewardClaimFeedback />

      <IsolatedRewardWidget
        scenario={widgetScenario}
        selectedWidget={selectedWidget}
        widget="progress"
      >
        <ProgressCard progress={model.progress} />
      </IsolatedRewardWidget>

      <IsolatedRewardWidget
        scenario={widgetScenario}
        selectedWidget={selectedWidget}
        widget="claimable"
      >
        <ClaimableRewardPanel reward={primaryReward} />
      </IsolatedRewardWidget>

      <IsolatedRewardWidget
        scenario={widgetScenario}
        selectedWidget={selectedWidget}
        widget="inventory"
      >
        <RewardInventoryPanel items={inventoryItems} />
      </IsolatedRewardWidget>

      <IsolatedRewardWidget
        scenario={widgetScenario}
        selectedWidget={selectedWidget}
        widget="season"
      >
        <RewardProgressionPanel
          levelProgress={model.progress}
          season={season}
          track={model.track}
        />
      </IsolatedRewardWidget>

      <IsolatedRewardWidget
        scenario={widgetScenario}
        selectedWidget={selectedWidget}
        widget="achievements"
      >
        <RewardAchievementsPanel
          achievements={achievements}
          selectedAchievementId={selectedAchievementId}
        />
      </IsolatedRewardWidget>

      <IsolatedRewardWidget
        scenario={widgetScenario}
        selectedWidget={selectedWidget}
        widget="recent-history"
      >
        <RecentRewardHistory history={model.history} />
      </IsolatedRewardWidget>

      <IsolatedRewardWidget
        scenario={widgetScenario}
        selectedWidget={selectedWidget}
        widget="audit-history"
      >
        <RewardHistoryAuditPanel page={historyPage} />
      </IsolatedRewardWidget>

      <p className={styles.foundationNote}>
        M10.7 isolates reward widgets, retains confirmed data during resource failures and records
        privacy-safe operational telemetry without weakening server-authoritative claiming.
      </p>
    </main>
  );
}
