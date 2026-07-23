"use client";

import { WidgetBoundary } from "@/components/layout/widget-boundary";

import { usePlayCheckIn } from "../actions/use-play-check-in";
import { recordPlayTelemetry } from "../telemetry/play-telemetry";
import { usePlayCommandCenterTelemetry } from "../telemetry/use-play-telemetry";
import { buildPlaySmartActions } from "../decisioning";
import { CrewPulseWidget } from "./CrewPulseWidget";
import { CurrentPositionWidget } from "./CurrentPositionWidget";
import { ActionCentrePanel } from "./ActionCentrePanel";
import { OpportunityRail } from "./OpportunityRail";
import { PlayModesPanel } from "./PlayModesPanel";
import { PlayOverviewStrip } from "./PlayOverviewStrip";
import { PlaySectionHeader } from "./PlaySectionHeader";
import { PlayStatusFooter } from "./PlayStatusFooter";
import { PrimaryActionPanel } from "./PrimaryActionPanel";
import { QuickActions } from "./QuickActions";
import { RecentActivityWidget } from "./RecentActivityWidget";
import { UpNextPanel } from "./UpNextPanel";
import { usePlayCommandCenter } from "./usePlayCommandCenter";
import styles from "./play-command-center.module.css";

export function PlayCommandCenter() {
  const controller = usePlayCommandCenter();
  const checkInAction = usePlayCheckIn();
  const { viewModel, retry } = controller;
  const smartActions = buildPlaySmartActions(viewModel);

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
      scenario: "normal",
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
      <header className={styles.playHeader}>
        <div className={styles.playTitleBlock}>
          <span>PLAY COMMAND CENTRE</span>
          <h1>PLAY</h1>
          <p>Your arena. Your rules. Your legacy.</p>
        </div>

        <WidgetBoundary
          name="play-player-overview"
          resetKeys={[
            viewModel.playerStatus.state,
            viewModel.playerStatus.requestId,
            viewModel.currentPosition.state,
            viewModel.currentPosition.requestId,
          ]}
        >
          <PlayOverviewStrip
            playerStatus={viewModel.playerStatus}
            currentPosition={viewModel.currentPosition}
            onRetryPlayer={() => retryWidget("player-status", retry.playerStatus)}
            onRetryPosition={() => retryWidget("current-position", retry.currentPosition)}
          />
        </WidgetBoundary>
      </header>

      {!viewModel.online ? (
        <div className={styles.globalBanner} role="status">
          <div>
            <strong>OFFLINE MODE</strong>
            <span>Saved information remains visible. Network actions are paused.</span>
          </div>
          <button type="button" onClick={() => retryWidget("all", retry.all)}>
            RETRY CONNECTION
          </button>
        </div>
      ) : viewModel.partialFailureCount > 0 ? (
        <div className={styles.globalBanner} data-tone="warning" role="status">
          <div>
            <strong>PARTIAL SERVICE DEGRADATION</strong>
            <span>
              {viewModel.partialFailureCount} isolated module
              {viewModel.partialFailureCount === 1 ? "" : "s"} unavailable.
            </span>
          </div>
          <button type="button" onClick={() => retryWidget("all", retry.all)}>
            RETRY ALL
          </button>
        </div>
      ) : null}

      <main className={styles.dashboardGrid}>
        <PlaySectionHeader
          className={styles.primarySectionHeader}
          index="01"
          eyebrow="CURRENT PRIORITY"
          title="MATCH OPERATIONS"
          detail="Your next fixture, immediate actions, and schedule intelligence."
          tone="cyan"
        />

        <div className={styles.matchArea}>
          <WidgetBoundary
            name="play-primary-action"
            resetKeys={[viewModel.nextMatch.state, viewModel.currentCheckIn.state]}
          >
            <PrimaryActionPanel
              nextMatch={viewModel.nextMatch}
              currentCheckIn={viewModel.currentCheckIn}
              checkInAction={checkInAction}
              retryNextMatch={() => retryWidget("next-match", retry.nextMatch)}
              retryCheckIn={() => retryWidget("current-check-in", retry.currentCheckIn)}
            />
          </WidgetBoundary>
        </div>

        <div className={styles.quickArea}>
          <WidgetBoundary name="play-quick-actions">
            <QuickActions actions={smartActions} />
          </WidgetBoundary>
        </div>

        <div className={styles.upNextArea}>
          <WidgetBoundary
            name="play-up-next"
            resetKeys={[viewModel.nextMatch.state, viewModel.recommendedCompetitions.state]}
          >
            <UpNextPanel
              nextMatch={viewModel.nextMatch}
              competitions={viewModel.recommendedCompetitions}
              onRetry={() => retryWidget("up-next", retry.all)}
            />
          </WidgetBoundary>
        </div>

        <PlaySectionHeader
          className={styles.progressionSectionHeader}
          index="02"
          eyebrow="PERFORMANCE SYSTEMS"
          title="COMPETITIVE PROGRESSION"
          detail="Modes, ranking movement, and objectives that shape your season."
          tone="violet"
        />

        <div className={styles.modesArea}>
          <WidgetBoundary name="play-modes">
            <PlayModesPanel />
          </WidgetBoundary>
        </div>

        <div className={styles.statsArea}>
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

        <div className={styles.challengesArea}>
          <WidgetBoundary name="play-action-centre">
            <ActionCentrePanel />
          </WidgetBoundary>
        </div>

        <PlaySectionHeader
          className={styles.intelSectionHeader}
          index="03"
          eyebrow="PLATFORM SIGNALS"
          title="LIVE VERZUS INTEL"
          detail="Competitions, activity, and Crew information from live platform data."
          tone="green"
        />

        <div className={styles.opportunitiesArea}>
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
      </main>

      <PlayStatusFooter online={viewModel.online} degraded={viewModel.partialFailureCount > 0} />
    </div>
  );
}
