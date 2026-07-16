// VERZUS RETRO GAMING PLAY OVERHAUL

"use client";

import { WidgetBoundary } from "@/components/layout/widget-boundary";

import { usePlayCheckIn } from "../actions/use-play-check-in";
import type { PlayScenario } from "../model";
import { recordPlayTelemetry } from "../telemetry/play-telemetry";
import { usePlayCommandCenterTelemetry } from "../telemetry/use-play-telemetry";
import { CrewPulseWidget } from "./CrewPulseWidget";
import { CurrentPositionWidget } from "./CurrentPositionWidget";
import { OpportunityRail } from "./OpportunityRail";
import { PlayHero } from "./PlayHero";
import { PlayerStatusStrip } from "./PlayerStatusStrip";
import { PrimaryActionPanel } from "./PrimaryActionPanel";
import { QuickActions } from "./QuickActions";
import { RecentActivityWidget } from "./RecentActivityWidget";
import { ScenarioToolbar } from "./ScenarioToolbar";
import { usePlayCommandCenter } from "./usePlayCommandCenter";
import styles from "./play-command-center.module.css";

export function PlayCommandCenter({ scenario }: { scenario: PlayScenario }) {
  const controller = usePlayCommandCenter(scenario);
  const checkInAction = usePlayCheckIn(scenario);
  const { viewModel, retry } = controller;

  usePlayCommandCenterTelemetry(viewModel);

  const stableWidgetViews = [
    viewModel.playerStatus,
    viewModel.nextMatch,
    viewModel.currentCheckIn,
    viewModel.currentPosition,
    viewModel.crewSummary,
    viewModel.recommendedCompetitions,
    viewModel.recentActivity,
  ] as const;

  const playReady = stableWidgetViews.every(
    (widget) =>
      widget.state !== "loading" && widget.state !== "retrying" && widget.state !== "stale",
  );

  const retryWidget = (widget: string, retryAction: () => void) => {
    recordPlayTelemetry("play.widget.retry", {
      route: "/play",
      scenario,
      widget,
    });
    retryAction();
  };

  return (
    <div
      className={styles.playRoot}
      data-play-command-center="true"
      data-play-ready={playReady ? "true" : "false"}
      data-play-variant={viewModel.variant}
    >
      <ScenarioToolbar active={viewModel.variant} />

      <WidgetBoundary
        name="play-player-status"
        resetKeys={[viewModel.playerStatus.state, viewModel.playerStatus.requestId]}
      >
        <PlayerStatusStrip
          view={viewModel.playerStatus}
          onRetry={() => retryWidget("player-status", retry.playerStatus)}
        />
      </WidgetBoundary>

      <div className={styles.liveRibbon} data-online={viewModel.online}>
        <span className={styles.statusDot} data-online={viewModel.online} />
        <strong>{viewModel.online ? "PLAY NETWORK ONLINE" : "OFFLINE MODE"}</strong>
        <span>
          {controller.refreshing
            ? "Synchronising live modules"
            : viewModel.partialFailureCount > 0
              ? `${viewModel.partialFailureCount} isolated module${viewModel.partialFailureCount === 1 ? "" : "s"} unavailable`
              : "All essential actions available"}
        </span>
        {viewModel.partialFailureCount > 0 || !viewModel.online ? (
          <button type="button" onClick={() => retryWidget("all", retry.all)}>
            RETRY ALL
          </button>
        ) : null}
      </div>

      {!viewModel.online ? (
        <div className={styles.globalBanner}>
          <strong>OFFLINE MODE</strong>
          <span>
            Network actions are disabled. Navigation and cached information remain available.
          </span>
        </div>
      ) : viewModel.partialFailureCount > 0 ? (
        <div className={`${styles.globalBanner} ${styles.degradedBanner}`}>
          <strong>PARTIAL SERVICE DEGRADATION</strong>
          <span>
            Failed modules remain isolated. Match, check-in, navigation, and other healthy widgets
            continue working.
          </span>
        </div>
      ) : null}

      <main className={styles.lobbyGrid}>
        <div className={styles.heroArea}>
          <PlayHero
            competitions={viewModel.recommendedCompetitions}
            nextMatch={viewModel.nextMatch}
            online={viewModel.online}
          />
        </div>

        <div className={styles.matchArea}>
          <PrimaryActionPanel
            nextMatch={viewModel.nextMatch}
            currentCheckIn={viewModel.currentCheckIn}
            checkInAction={checkInAction}
            retryNextMatch={() => retryWidget("next-match", retry.nextMatch)}
            retryCheckIn={() => retryWidget("current-check-in", retry.currentCheckIn)}
          />
        </div>

        <div className={styles.quickArea}>
          <WidgetBoundary name="play-quick-actions">
            <QuickActions />
          </WidgetBoundary>
        </div>

        <div className={styles.positionArea}>
          <WidgetBoundary
            name="play-current-position"
            resetKeys={[viewModel.currentPosition.state, viewModel.currentPosition.requestId]}
          >
            <CurrentPositionWidget
              view={viewModel.currentPosition}
              onRetry={() => retryWidget("current-position", retry.currentPosition)}
            />
          </WidgetBoundary>
        </div>

        <div className={styles.competitionArea}>
          <WidgetBoundary
            name="play-opportunities"
            resetKeys={[
              viewModel.recommendedCompetitions.state,
              viewModel.recommendedCompetitions.requestId,
            ]}
          >
            <OpportunityRail
              view={viewModel.recommendedCompetitions}
              onRetry={() => retryWidget("recommended-competitions", retry.recommendedCompetitions)}
            />
          </WidgetBoundary>
        </div>

        <div className={styles.crewArea}>
          <WidgetBoundary
            name="play-crew-pulse"
            resetKeys={[viewModel.crewSummary.state, viewModel.crewSummary.requestId]}
          >
            <CrewPulseWidget
              view={viewModel.crewSummary}
              onRetry={() => retryWidget("crew-summary", retry.crewSummary)}
            />
          </WidgetBoundary>
        </div>

        <div className={styles.activityArea}>
          <WidgetBoundary
            name="play-recent-activity"
            resetKeys={[viewModel.recentActivity.state, viewModel.recentActivity.requestId]}
          >
            <RecentActivityWidget
              view={viewModel.recentActivity}
              onRetry={() => retryWidget("recent-activity", retry.recentActivity)}
            />
          </WidgetBoundary>
        </div>
      </main>
    </div>
  );
}
