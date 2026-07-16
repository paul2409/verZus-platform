"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/primitives/button";
import { Checkbox } from "@/components/primitives/checkbox";
import { Icon } from "@/components/primitives/icon";
import { Modal } from "@/components/primitives/overlay";

import { useCompetitionEntry } from "../hooks";
import type {
  CompetitionEntryControlViewModel,
  CompetitionEntryRecordViewModel,
  CompetitionEntryScenario,
} from "../model/competition-entry.types";
import styles from "./CompetitionEntry.module.css";

function EntryState({
  state,
  requestId,
  onRetry,
}: {
  state: string;
  requestId: string | null;
  onRetry: () => void;
}) {
  const copy =
    state === "loading"
      ? ["LOADING ENTRY CONTROL", "Checking eligibility and existing entry status."]
      : state === "offline"
        ? ["ENTRY SERVICE OFFLINE", "Reconnect before confirming competition entry."]
        : state === "unauthorized"
          ? ["SIGN IN REQUIRED", "Authenticate before entering a competition."]
          : state === "forbidden"
            ? ["ENTRY RESTRICTED", "This account cannot enter this competition."]
            : state === "maintenance"
              ? ["ENTRY MAINTENANCE", "Registration controls are temporarily unavailable."]
              : state === "not_found"
                ? ["COMPETITION NOT FOUND", "This competition entry control is unavailable."]
                : ["ENTRY CONTROL UNAVAILABLE", "Retry without leaving the competition page."];

  return (
    <section className={styles.entryState} aria-live="polite" data-state={state}>
      <Icon decorative name={state === "loading" ? "hourglass" : "alert-triangle"} size="sm" />
      <div>
        <strong>{copy[0]}</strong>
        <p>{copy[1]}</p>
        {requestId ? <small>REFERENCE: {requestId}</small> : null}
      </div>
      {state !== "loading" && state !== "unauthorized" && state !== "forbidden" ? (
        <Button onClick={onRetry} size="sm" variant="secondary">
          RETRY
        </Button>
      ) : null}
    </section>
  );
}

function EntrySummary({ control }: { control: CompetitionEntryControlViewModel }) {
  const items = [
    ["ENTRANT", control.entrantLabel],
    ["ENTRY", control.teamLabel],
    ["GAME", control.gameLabel],
    ["FORMAT", control.formatLabel],
    ["ENTRY FEE", control.entryFeeLabel],
    ["CHECK-IN", control.checkInLabel.replace("CHECK-IN: ", "")],
  ];

  return (
    <dl className={styles.summaryGrid}>
      {items.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function EntryRecord({ entry }: { entry: CompetitionEntryRecordViewModel }) {
  return (
    <div className={styles.confirmedRecord}>
      <span className={styles.confirmedIcon} aria-hidden="true">
        <Icon decorative name="check" size="md" />
      </span>
      <div>
        <span>ENTRY CONFIRMED</span>
        <strong>{entry.registrationCode}</strong>
        <small>{entry.registeredAtLabel}</small>
      </div>
    </div>
  );
}

function ConfirmationDialog({
  control,
  open,
  onOpenChange,
  onConfirm,
  pending,
  errorCode,
  requestId,
}: {
  control: CompetitionEntryControlViewModel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  pending: boolean;
  errorCode: string | null;
  requestId: string | null;
}) {
  const [accepted, setAccepted] = useState(false);

  return (
    <Modal
      description="Review the server-authoritative entry requirements before confirming."
      footer={
        <div className={styles.dialogActions}>
          <Button disabled={pending} onClick={() => onOpenChange(false)} variant="secondary">
            CANCEL
          </Button>
          <Button disabled={!accepted || pending} loading={pending} onClick={onConfirm}>
            {pending ? "CONFIRMING ENTRY" : "CONFIRM ENTRY"}
          </Button>
        </div>
      }
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) setAccepted(false);
      }}
      open={open}
      size="md"
      title="CONFIRM COMPETITION ENTRY"
    >
      <div className={styles.dialogBody}>
        <header>
          <span>REGISTRATION CONTROL</span>
          <h3>{control.competitionName}</h3>
          <p>{control.eligibilitySummary}</p>
        </header>
        <EntrySummary control={control} />
        <div className={styles.requirementList}>
          <p>
            <Icon decorative name="shield" size="xs" />
            Eligibility is checked again by the server when entry is submitted.
          </p>
          <p>
            <Icon decorative name="clock" size="xs" />
            {control.rosterLockLabel}
          </p>
          <p>
            <Icon decorative name="refresh-cw" size="xs" />
            Repeated confirmation requests reuse one idempotency key.
          </p>
        </div>
        <Checkbox
          checked={accepted}
          description="I understand the roster lock, schedule and competition rules."
          label="CONFIRM ENTRY TERMS"
          onChange={(event) => setAccepted(event.currentTarget.checked)}
        />
        {errorCode ? (
          <div className={styles.mutationError} role="alert">
            <strong>ENTRY NOT CONFIRMED</strong>
            <span>{errorCode.replaceAll("_", " ").toUpperCase()}</span>
            {requestId ? <small>REFERENCE: {requestId}</small> : null}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

function ManageDialog({
  entry,
  open,
  onOpenChange,
}: {
  entry: CompetitionEntryRecordViewModel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Modal
      description="Your registration is stored and remains available after refresh."
      footer={
        <div className={styles.dialogActions}>
          <Button onClick={() => onOpenChange(false)} variant="secondary">
            CLOSE
          </Button>
          <Link
            className={styles.primaryLink}
            href={`/compete/${entry.competitionId}#participants`}
          >
            VIEW PARTICIPANTS
          </Link>
        </div>
      }
      onOpenChange={onOpenChange}
      open={open}
      size="md"
      title="MANAGE COMPETITION ENTRY"
    >
      <div className={styles.dialogBody}>
        <EntryRecord entry={entry} />
        <dl className={styles.manageGrid}>
          <div>
            <dt>COMPETITION</dt>
            <dd>{entry.competitionName}</dd>
          </div>
          <div>
            <dt>ENTRANT</dt>
            <dd>{entry.entrantLabel}</dd>
          </div>
          <div>
            <dt>ENTRY TYPE</dt>
            <dd>{entry.teamLabel}</dd>
          </div>
          <div>
            <dt>ENTRY FEE</dt>
            <dd>{entry.entryFeeLabel}</dd>
          </div>
          <div>
            <dt>NEXT OPERATION</dt>
            <dd>{entry.checkInLabel}</dd>
          </div>
          <div>
            <dt>STATUS</dt>
            <dd>{entry.stateLabel}</dd>
          </div>
        </dl>
        <p className={styles.manageNote}>
          Withdrawal and waitlist operations remain outside M6.5 and are not presented as fake
          actions.
        </p>
      </div>
    </Modal>
  );
}

export function CompetitionEntryControl({
  competitionId,
  scenario,
}: {
  competitionId: string;
  scenario: CompetitionEntryScenario;
}) {
  const entry = useCompetitionEntry(competitionId, scenario);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const control = entry.resource.data?.value ?? null;
  const confirmed = entry.result?.entry ?? control?.existingEntry ?? null;

  if (!control) {
    return (
      <section className={styles.entryPanel} aria-labelledby="entry-title">
        <span>ENTRY CONTROL</span>
        <h2 id="entry-title">READY TO COMPETE?</h2>
        <EntryState
          onRetry={entry.retryResource}
          requestId={entry.resource.requestId}
          state={entry.resource.state}
        />
      </section>
    );
  }

  if (confirmed) {
    return (
      <section className={styles.entryPanel} aria-labelledby="entry-title" data-entry="confirmed">
        <span>ENTRY CONTROL</span>
        <h2 id="entry-title">YOU ARE ENTERED</h2>
        <EntryRecord entry={confirmed} />
        <p>Your registration is confirmed and persists across refreshes.</p>
        <Button fullWidth onClick={() => setManageOpen(true)}>
          MANAGE ENTRY
        </Button>
        <ManageDialog entry={confirmed} onOpenChange={setManageOpen} open={manageOpen} />
      </section>
    );
  }

  return (
    <section className={styles.entryPanel} aria-labelledby="entry-title" data-entry="available">
      <span>ENTRY CONTROL</span>
      <div className={styles.entryHeading}>
        <h2 id="entry-title">READY TO COMPETE?</h2>
        <b>{control.eligibilityLabel}</b>
      </div>
      <p>{control.eligibilitySummary}</p>
      <EntrySummary control={control} />
      <Button
        disabled={!control.canEnter}
        fullWidth
        onClick={() => {
          entry.resetMutation();
          setConfirmOpen(true);
        }}
      >
        {control.canEnter ? "ENTER COMPETITION" : "ENTRY UNAVAILABLE"}
      </Button>
      <a className={styles.rulesLink} href="#rules">
        REVIEW COMPETITION RULES
      </a>
      <ConfirmationDialog
        control={control}
        errorCode={entry.errorCode}
        onConfirm={() => entry.confirmEntry(control)}
        onOpenChange={setConfirmOpen}
        open={confirmOpen}
        pending={entry.mutationState === "pending"}
        requestId={entry.requestId}
      />
    </section>
  );
}
