// VERZUS M5 STEPS 5.5-5.8
"use client";

import { WidgetBoundary } from "@/components/layout/widget-boundary";

import type { PlayScenario } from "../model";
import { CrewPulseWidget } from "./CrewPulseWidget";
import { CurrentPositionWidget } from "./CurrentPositionWidget";
import { OpportunityRail } from "./OpportunityRail";
import { PlayerStatusStrip } from "./PlayerStatusStrip";
import { PrimaryActionPanel } from "./PrimaryActionPanel";
import { QuickActions } from "./QuickActions";
import { RecentActivityWidget } from "./RecentActivityWidget";
import { ScenarioToolbar } from "./ScenarioToolbar";
import { usePlayCommandCenter } from "./usePlayCommandCenter";
import styles from "./play-command-center.module.css";

export function PlayCommandCenter({ scenario }: { scenario: PlayScenario }) {
  const controller = usePlayCommandCenter(scenario);
  const { viewModel, retry } = controller;

  return (
    <div className={styles.playRoot} data-play-variant={viewModel.variant}>
      <ScenarioToolbar active={viewModel.variant} />

      <header className={styles.pageHeader}>
        <div>
          <span>PLAYER COMMAND</span>
          <h1>Your next battle is ready.</h1>
          <p>
            See the action that matters now, protect your check-in window, and keep your weekly
            momentum moving.
          </p>
        </div>

        <div className={styles.pageStatus}>
          <span className={styles.statusDot} data-online={viewModel.online} />
          <div>
            <strong>{viewModel.online ? "PLAY ONLINE" : "OFFLINE MODE"}</strong>
            <small>
              {controller.refreshing
                ? "Refreshing live modules"
                : `${viewModel.partialFailureCount} degraded modules`}
            </small>
          </div>
          {viewModel.partialFailureCount > 0 ? (
            <button type="button" onClick={retry.all}>
              RETRY ALL
            </button>
          ) : null}
        </div>
      </header>

      {!viewModel.online ? (
        <div className={styles.globalBanner}>
          <strong>OFFLINE MODE</strong>
          <span>
            Network actions are disabled. Static navigation and cached information remain available.
          </span>
          <button type="button" onClick={retry.all}>
            RETRY CONNECTION
          </button>
        </div>
      ) : viewModel.partialFailureCount > 0 ? (
        <div className={`${styles.globalBanner} ${styles.degradedBanner}`}>
          <strong>PARTIAL SERVICE DEGRADATION</strong>
          <span>
            {viewModel.partialFailureCount} Play module
            {viewModel.partialFailureCount === 1 ? "" : "s"} failed independently. Essential actions
            remain available when their services are healthy.
          </span>
        </div>
      ) : null}

      <WidgetBoundary
        name="play-player-status"
        resetKeys={[viewModel.playerStatus.state, viewModel.playerStatus.requestId]}
      >
        <PlayerStatusStrip view={viewModel.playerStatus} onRetry={retry.playerStatus} />
      </WidgetBoundary>

      <main className={styles.dashboardGrid}>
        <div className={styles.primaryColumn}>
          <PrimaryActionPanel
            nextMatch={viewModel.nextMatch}
            currentCheckIn={viewModel.currentCheckIn}
            retryNextMatch={retry.nextMatch}
            retryCheckIn={retry.currentCheckIn}
          />

          <WidgetBoundary
            name="play-current-position"
            resetKeys={[viewModel.currentPosition.state, viewModel.currentPosition.requestId]}
          >
            <CurrentPositionWidget
              view={viewModel.currentPosition}
              onRetry={retry.currentPosition}
            />
          </WidgetBoundary>

          <WidgetBoundary
            name="play-opportunities"
            resetKeys={[
              viewModel.recommendedCompetitions.state,
              viewModel.recommendedCompetitions.requestId,
            ]}
          >
            <OpportunityRail
              view={viewModel.recommendedCompetitions}
              onRetry={retry.recommendedCompetitions}
            />
          </WidgetBoundary>
        </div>

        <div className={styles.secondaryColumn}>
          <WidgetBoundary
            name="play-crew-pulse"
            resetKeys={[viewModel.crewSummary.state, viewModel.crewSummary.requestId]}
          >
            <CrewPulseWidget view={viewModel.crewSummary} onRetry={retry.crewSummary} />
          </WidgetBoundary>

          <WidgetBoundary
            name="play-recent-activity"
            resetKeys={[viewModel.recentActivity.state, viewModel.recentActivity.requestId]}
          >
            <RecentActivityWidget view={viewModel.recentActivity} onRetry={retry.recentActivity} />
          </WidgetBoundary>

          <WidgetBoundary name="play-quick-actions">
            <QuickActions />
          </WidgetBoundary>
        </div>
      </main>
    </div>
  );
}
