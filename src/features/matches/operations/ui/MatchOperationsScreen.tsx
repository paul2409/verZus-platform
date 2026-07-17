// VERZUS M7.1 MATCH OPERATIONS FOUNDATION
// Compatibility marker: data-m7-stage="7.1"
// VERZUS M7.2 STATE MACHINE, TIMELINE AND SERVER TIME

import Link from "next/link";

import { getMatchOperationsMock } from "../mocks/match-operations.mock";
import { matchOperationStateLabels } from "../model/match-operations.state";
import type { MatchClockSnapshot, MatchOperationState } from "../model/match-operations.types";
import { matchOperationStates } from "../model/match-operations.types";
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
  matchId: string;
  state: MatchOperationState;
  clock: MatchClockSnapshot;
};

export function MatchOperationsScreen({ matchId, state, clock }: MatchOperationsScreenProps) {
  const match = getMatchOperationsMock(matchId, state, clock);

  return (
    <main className={styles.page} data-m7-stage="7.2" data-match-operation-state={match.state}>
      <MatchHeader match={match} />

      <nav aria-label="Match state references" className={styles.stateRail}>
        {matchOperationStates.map((item, index) => (
          <Link
            aria-current={item === match.state ? "page" : undefined}
            className={styles.stateLink}
            href={`/matches/${encodeURIComponent(matchId)}?state=${item}`}
            key={item}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            {matchOperationStateLabels[item]}
          </Link>
        ))}
      </nav>

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

      <footer className={styles.foundationNote}>
        <strong>M7.2 SERVER-AUTHORITATIVE FLOW</strong>
        <span>
          Legal transitions, expected-state/version guards, UTC deadlines and drift-corrected
          display clocks are active. Check-in mutations are added in M7.4.
        </span>
      </footer>
    </main>
  );
}
