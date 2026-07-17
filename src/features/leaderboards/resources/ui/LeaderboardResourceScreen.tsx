"use client";

// VERZUS M8.3 RESOURCE-CONNECTED LEADERBOARD SCREEN
// VERZUS M8.4 MODE-NORMALIZED RESOURCE COMPOSITION
// VERZUS M8.5 REVISION-AWARE LIVE UPDATE COMPOSITION
// VERZUS M8.6 RELIABILITY AND EDGE-STATE COMPOSITION
// VERZUS M8.7 WIDGET FAILURE-INJECTION COMPOSITION
// VERZUS M8.8 INTEL QUERY COMPOSITION

import { useCallback, useMemo, useState } from "react";

import {
  parseLeaderboardIntelSelection,
  type LeaderboardIntelQueryInput,
} from "../../interactions";

import type { LeaderboardQueryInput } from "../../explorer";
import { useLeaderboardUrlState } from "../../explorer";
import { LeaderboardFoundationScreen } from "../../foundation";
import {
  mergeLeaderboardLiveSnapshot,
  parseLeaderboardLiveUpdateScenario,
  useLeaderboardLiveUpdates,
} from "../../live";
import {
  getLeaderboardModeComposition,
  normalizeLeaderboardQueryForMode,
} from "../../modes/model/leaderboard-mode.registry";
import { parseLeaderboardReliabilitySelection } from "../../reliability";
import { parseLeaderboardCrashTarget } from "../../quality";
import { useLeaderboardResources } from "../hooks/useLeaderboardResources";

export type LeaderboardResourceScreenProps = {
  initialSearchParams?: LeaderboardQueryInput & {
    reliability?: string | string[];
    resource?: string | string[];
    crash?: string | string[];
  } & LeaderboardIntelQueryInput;
};

export function LeaderboardResourceScreen({
  initialSearchParams = {},
}: LeaderboardResourceScreenProps) {
  const explorer = useLeaderboardUrlState(initialSearchParams);
  const composition = getLeaderboardModeComposition(explorer.state.mode);
  const resourceState = normalizeLeaderboardQueryForMode(explorer.state, composition);
  const selection = parseLeaderboardReliabilitySelection(initialSearchParams);
  const intelSelection = parseLeaderboardIntelSelection(initialSearchParams);
  const [crashTarget, setCrashTarget] = useState(() =>
    parseLeaderboardCrashTarget(initialSearchParams.crash),
  );
  const recoverWidget = useCallback(() => {
    setCrashTarget(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("crash");
    window.history.replaceState(window.history.state, "", url);
  }, []);
  const resources = useLeaderboardResources(resourceState, selection);
  const liveScenario = parseLeaderboardLiveUpdateScenario(initialSearchParams);
  const allowLiveUpdates = selection.intent === "normal" || selection.intent === "stale";
  const liveQuery = useLeaderboardLiveUpdates(resourceState, liveScenario, allowLiveUpdates);
  const snapshot = useMemo(
    () =>
      mergeLeaderboardLiveSnapshot(
        resources.snapshot,
        allowLiveUpdates ? liveQuery.data : undefined,
      ),
    [allowLiveUpdates, liveQuery.data, resources.snapshot],
  );
  const liveUpdate =
    allowLiveUpdates && liveQuery.data
      ? {
          scenario: liveScenario,
          revision: liveQuery.data.revision,
          hasChanges: liveQuery.data.hasChanges,
          changedEntryIds: liveQuery.data.changedEntryIds,
          currentPosition: liveQuery.data.currentPosition,
          nextPollAt: liveQuery.data.nextPollAt,
          isFetching: liveQuery.isFetching,
        }
      : undefined;

  return (
    <LeaderboardFoundationScreen
      controlledExplorer={explorer}
      crashTarget={crashTarget}
      initialSearchParams={initialSearchParams}
      intelSelection={intelSelection}
      onRecoverWidget={recoverWidget}
      onRetryResources={() => void resources.retryAll()}
      reliability={resources.reliability}
      resourceSnapshot={snapshot}
      {...(liveUpdate ? { liveUpdate } : {})}
    />
  );
}
