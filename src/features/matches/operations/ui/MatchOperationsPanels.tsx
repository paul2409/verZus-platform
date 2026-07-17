// VERZUS M7.1 MATCH OPERATIONS FOUNDATION

import Link from "next/link";

import type {
  MatchOperationAction,
  MatchOperationsViewModel,
  MatchOperationTone,
} from "../model/match-operations.types";
import styles from "./MatchOperationsScreen.module.css";
import { ServerCountdown } from "./ServerCountdown";

const toneClasses: Record<MatchOperationTone, string> = {
  neutral: styles.toneNeutral!,
  info: styles.toneInfo!,
  success: styles.toneSuccess!,
  warning: styles.toneWarning!,
  danger: styles.toneDanger!,
};

const actionClasses: Record<MatchOperationAction["tone"], string> = {
  primary: styles.actionPrimary!,
  secondary: styles.actionSecondary!,
  danger: styles.actionDanger!,
};

function OperationButton({ action }: { action: MatchOperationAction }) {
  return (
    <button
      className={`${styles.actionButton} ${actionClasses[action.tone]}`}
      disabled={action.disabled}
      title={action.disabled ? "Interaction is wired in a later controlled M7 stage." : undefined}
      type="button"
    >
      {action.label}
    </button>
  );
}

export function MatchHeader({ match }: { match: MatchOperationsViewModel }) {
  return (
    <header className={styles.matchHeader}>
      <div className={styles.breadcrumbRow}>
        <Link href="/matches">Matches</Link>
        <span aria-hidden="true">/</span>
        <span>{match.roundLabel}</span>
      </div>
      <div className={styles.headerTitleRow}>
        <div>
          <p className={styles.eyebrow}>07.1 // MATCH CONTROL</p>
          <h1>Match details</h1>
        </div>
        <span className={`${styles.statusBadge} ${toneClasses[match.stateTone]}`}>
          {match.stateLabel}
        </span>
      </div>
      <div className={styles.matchMetadata}>
        <span>{match.competitionName}</span>
        <span>{match.gameLabel}</span>
        <span>{match.formatLabel}</span>
        <span>Version {match.matchVersion}</span>
      </div>
    </header>
  );
}

function ParticipantIdentity({ participant }: { participant: MatchOperationsViewModel["home"] }) {
  return (
    <article className={styles.participant}>
      <span
        aria-hidden="true"
        className={`${styles.teamEmblem} ${
          participant.emblem === "rebels" ? styles.rebelsEmblem : styles.apexEmblem
        }`}
      />
      <div>
        <strong>{participant.name}</strong>
        <span>{participant.rankLabel}</span>
      </div>
      <div className={styles.participantStates}>
        <span data-active={participant.checkedIn ? "true" : undefined}>CHECKED IN</span>
        <span data-active={participant.ready ? "true" : undefined}>READY</span>
      </div>
    </article>
  );
}

export function ParticipantPanel({ match }: { match: MatchOperationsViewModel }) {
  return (
    <section aria-label="Match participants" className={styles.participantPanel}>
      <ParticipantIdentity participant={match.home} />
      <div className={styles.versusBlock}>
        {match.score ? (
          <strong>
            {match.score.home} <span>-</span> {match.score.away}
          </strong>
        ) : (
          <strong>VS</strong>
        )}
        <span>{match.scheduledAtLabel}</span>
      </div>
      <ParticipantIdentity participant={match.away} />
    </section>
  );
}

export function MatchTimeline({ match }: { match: MatchOperationsViewModel }) {
  return (
    <aside aria-labelledby="match-timeline-title" className={styles.timelinePanel}>
      <div className={styles.panelHeading}>
        <p>SERVER TIMELINE</p>
        <h2 id="match-timeline-title">Match flow</h2>
      </div>
      <ol className={styles.timelineList}>
        {match.timeline.map((item) => (
          <li className={styles.timelineItem} data-state={item.state} key={item.id}>
            <span className={styles.timelineMarker} />
            <div>
              <strong>{item.label}</strong>
              <span>{item.timeLabel}</span>
            </div>
          </li>
        ))}
      </ol>
      <p className={styles.serverTime}>
        {match.serverTimeLabel} · drift corrected from server anchor
      </p>
    </aside>
  );
}

export function CheckInPanel({ match }: { match: MatchOperationsViewModel }) {
  const isCheckInPhase = [
    "scheduled",
    "check-in-unavailable",
    "check-in-open",
    "checked-in",
    "opponent-not-checked-in",
    "both-ready",
  ].includes(match.state);

  if (!isCheckInPhase) return null;

  return (
    <section className={`${styles.commandPanel} ${toneClasses[match.stateTone]}`}>
      <p className={styles.commandKicker}>CHECK-IN CONTROL</p>
      <h2>{match.title}</h2>
      <p>{match.description}</p>
      <ServerCountdown
        caption={match.timerCaption}
        clock={match.clock}
        fallbackLabel={match.timerLabel}
      />
      <div className={styles.actions}>
        {match.primaryAction ? <OperationButton action={match.primaryAction} /> : null}
        {match.secondaryAction ? <OperationButton action={match.secondaryAction} /> : null}
      </div>
    </section>
  );
}

export function LobbyPanel({ match }: { match: MatchOperationsViewModel }) {
  if (match.state !== "lobby-open" && match.state !== "in-progress") return null;

  return (
    <section className={`${styles.commandPanel} ${toneClasses[match.stateTone]}`}>
      <p className={styles.commandKicker}>LOBBY OPERATIONS</p>
      <h2>{match.title}</h2>
      <p>{match.description}</p>
      <div className={styles.lobbyCode}>
        <span>Lobby code</span>
        <strong>{match.lobbyCode}</strong>
      </div>
      <ServerCountdown
        caption={match.timerCaption}
        clock={match.clock}
        fallbackLabel={match.timerLabel}
      />
      <div className={styles.actions}>
        {match.primaryAction ? <OperationButton action={match.primaryAction} /> : null}
        {match.secondaryAction ? <OperationButton action={match.secondaryAction} /> : null}
      </div>
    </section>
  );
}

export function ResultSubmissionPanel({ match }: { match: MatchOperationsViewModel }) {
  const isResultPhase = [
    "submit-result",
    "awaiting-opponent-confirmation",
    "result-confirmed",
    "forfeit",
    "cancelled",
    "completed",
  ].includes(match.state);

  if (!isResultPhase) return null;

  return (
    <section className={`${styles.commandPanel} ${toneClasses[match.stateTone]}`}>
      <p className={styles.commandKicker}>RESULT CONTROL</p>
      <h2>{match.title}</h2>
      <p>{match.description}</p>
      {match.score ? (
        <div className={styles.scoreEditor} aria-label="Score preview">
          <strong>{match.score.home}</strong>
          <span>-</span>
          <strong>{match.score.away}</strong>
        </div>
      ) : null}
      {match.resultNote ? <p className={styles.resultNote}>{match.resultNote}</p> : null}
      {match.xpEarned ? <strong className={styles.xpEarned}>+{match.xpEarned} XP</strong> : null}
      <div className={styles.actions}>
        {match.primaryAction ? <OperationButton action={match.primaryAction} /> : null}
        {match.secondaryAction ? <OperationButton action={match.secondaryAction} /> : null}
      </div>
    </section>
  );
}

export function EvidenceUploader({ match }: { match: MatchOperationsViewModel }) {
  if (!["submit-result", "awaiting-opponent-confirmation", "disputed"].includes(match.state)) {
    return null;
  }

  return (
    <section className={styles.secondaryPanel}>
      <div className={styles.panelHeading}>
        <p>INDEPENDENT RESOURCE</p>
        <h2>Evidence</h2>
      </div>
      <p>Images and clips upload independently so a failed upload never discards a result draft.</p>
      <button disabled type="button">
        Attach evidence
      </button>
    </section>
  );
}

export function DisputePanel({ match }: { match: MatchOperationsViewModel }) {
  if (match.state !== "disputed") return null;

  return (
    <section className={`${styles.commandPanel} ${styles.toneWarning}`}>
      <p className={styles.commandKicker}>AUDITABLE DISPUTE</p>
      <h2>{match.title}</h2>
      <p>{match.resultNote}</p>
      <dl className={styles.disputeMeta}>
        <div>
          <dt>Status</dt>
          <dd>Under review</dd>
        </div>
        <div>
          <dt>Dispute ID</dt>
          <dd>{match.disputeId}</dd>
        </div>
      </dl>
      {match.secondaryAction ? <OperationButton action={match.secondaryAction} /> : null}
    </section>
  );
}

export function MatchSupportPanel({ match }: { match: MatchOperationsViewModel }) {
  return (
    <aside className={styles.supportPanel}>
      <div className={styles.panelHeading}>
        <p>MATCH INTEL</p>
        <h2>Operations support</h2>
      </div>
      <dl className={styles.matchFacts}>
        <div>
          <dt>Match ID</dt>
          <dd>{match.id}</dd>
        </div>
        <div>
          <dt>Game</dt>
          <dd>{match.gameLabel}</dd>
        </div>
        <div>
          <dt>Format</dt>
          <dd>{match.formatLabel}</dd>
        </div>
        <div>
          <dt>Lobby code</dt>
          <dd>{match.lobbyCode}</dd>
        </div>
      </dl>
      <div className={styles.supportActions}>
        <button disabled type="button">
          Match chat
        </button>
        <button disabled type="button">
          Get support
        </button>
      </div>
      <p className={styles.supportNote}>
        Navigation and support remain available when an unrelated match panel fails.
      </p>
    </aside>
  );
}
