// VERZUS M12.9 PRODUCTION CACHED MATCH SNAPSHOT

import type { MatchOperationsViewModel } from "../model/match-operations.types";
import {
  CheckInPanel,
  DisputePanel,
  EvidenceUploader,
  LobbyPanel,
  MatchHeader,
  MatchSupportPanel,
  MatchTimeline,
  ParticipantPanel,
  ResultSubmissionPanel,
} from "./MatchOperationsPanels";
import styles from "./MatchOperationsScreen.module.css";

export type MatchOperationsScreenProps = {
  match: MatchOperationsViewModel;
};

export function MatchOperationsScreen({ match }: MatchOperationsScreenProps) {
  return (
    <main className={styles.page} data-match-operation-state={match.state}>
      <MatchHeader match={match} />
      <ParticipantPanel match={match} />

      <div className={styles.operationsGrid}>
        <MatchTimeline match={match} />

        <div className={styles.primaryColumn}>
          <CheckInPanel match={match} />
          <LobbyPanel match={match} />
          <ResultSubmissionPanel match={match} />
          <DisputePanel match={match} />
          <EvidenceUploader match={match} />
        </div>

        <MatchSupportPanel match={match} />
      </div>
    </main>
  );
}
