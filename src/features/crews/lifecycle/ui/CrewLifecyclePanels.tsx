"use client";

// VERZUS M9.7 LIFECYCLE, ACTIVITY RELIABILITY AND DESTRUCTIVE OPERATION PANELS

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { Icon } from "@/components/primitives/icon";
import { Input } from "@/components/primitives/input";
import { Select } from "@/components/primitives/select";

import type { CrewFoundationActivity, CrewLifecycle } from "../../foundation";
import type { CrewResourceHealth } from "../../resources";
import { CrewLifecycleClientError, crewLifecycleCommands } from "../api/crew-lifecycle.client";
import { crewLifecycleQueryKeys } from "../api/crew-lifecycle.query";
import type {
  CrewActivityMode,
  CrewLifecycleSnapshot,
  CrewLifecycleTarget,
} from "../model/crew-lifecycle.types";
import styles from "./CrewLifecycle.module.css";

const stateCopy: Record<
  CrewLifecycle,
  {
    title: string;
    description: string;
    tone: "positive" | "warning" | "negative" | "neutral" | "information";
  }
> = {
  forming: {
    title: "Crew forming",
    description:
      "Recruiting and setup remain available while the Crew prepares for active competition.",
    tone: "information",
  },
  active: {
    title: "Crew active",
    description: "Membership, competition and live activity operations are enabled.",
    tone: "positive",
  },
  inactive: {
    title: "Crew inactive",
    description:
      "New membership operations are frozen, but members can leave and history remains visible.",
    tone: "warning",
  },
  suspended: {
    title: "Crew suspended",
    description: "Platform operations froze management actions. Historical data remains available.",
    tone: "negative",
  },
  archived: {
    title: "Crew archived",
    description: "The Crew is hidden from active discovery and shown as historical until restored.",
    tone: "neutral",
  },
  disbanded: {
    title: "Crew disbanded",
    description:
      "This terminal record is read-only. Results, audit history and ownership evidence are preserved.",
    tone: "negative",
  },
};

function lifecycleLabel(state: CrewLifecycle): string {
  return state.charAt(0).toUpperCase() + state.slice(1);
}

function targetLabel(target: CrewLifecycleTarget): string {
  if (target === "active") return "Activate Crew";
  if (target === "inactive") return "Mark inactive";
  return "Archive Crew";
}

function activityStateLabel(health: CrewResourceHealth): string {
  if (health.state === "offline") return "Cached while offline";
  if (health.state === "error") return "Cached after failure";
  if (health.state === "stale") return "Stale snapshot retained";
  if (health.state === "loading") return "Loading activity";
  return "Live verified activity";
}

function MutationMessage({ error, success }: { error: Error | null; success: boolean }) {
  if (error instanceof CrewLifecycleClientError) {
    return (
      <p className={styles.error} role="alert">
        {error.message} <small>Request {error.requestId}</small>
      </p>
    );
  }
  return success ? (
    <p className={styles.success} role="status">
      Crew lifecycle updated.
    </p>
  ) : null;
}

export function CrewLifecycleStateBanner({ snapshot }: { snapshot: CrewLifecycleSnapshot }) {
  const copy = stateCopy[snapshot.state];
  return (
    <section
      className={styles.stateBanner}
      data-crew-lifecycle={snapshot.state}
      data-m9-stage="9.7"
    >
      <div className={styles.stateIcon}>
        <Icon
          decorative
          name={snapshot.state === "active" ? "shield" : "alert-triangle"}
          size="md"
        />
      </div>
      <div>
        <strong>{copy.title}</strong>
        <span>{copy.description}</span>
      </div>
      <Badge tone={copy.tone} variant="outline">
        {snapshot.freshness === "stale" ? "Stale · " : ""}
        {lifecycleLabel(snapshot.state)}
      </Badge>
    </section>
  );
}

export function CrewActivityReliabilityPanel({
  activity,
  health,
  activityMode,
  onRetry,
}: {
  activity: readonly CrewFoundationActivity[];
  health: CrewResourceHealth;
  activityMode: CrewActivityMode;
  onRetry: () => void;
}) {
  const cached = health.state === "error" || health.state === "offline" || health.state === "stale";
  return (
    <section className={styles.panel} data-crew-panel="activity" data-m9-stage="9.7">
      <header className={styles.panelHeader}>
        <div>
          <h2>Crew activity</h2>
          <p>
            {activityStateLabel(health)} · {activityMode.replace("_", " ")}
          </p>
        </div>
        <Badge
          tone={
            health.state === "success"
              ? "positive"
              : health.state === "error"
                ? "negative"
                : "warning"
          }
          variant="outline"
        >
          {cached ? "Retained snapshot" : health.state}
        </Badge>
      </header>

      {cached ? (
        <div className={styles.reliabilityNotice} role="status">
          <Icon decorative name="clock" size="sm" />
          <span>
            Activity failed independently. The last usable snapshot stays visible while other Crew
            operations continue.
          </span>
          {health.retryable ? (
            <Button onClick={onRetry} size="sm" variant="ghost">
              Retry activity
            </Button>
          ) : null}
        </div>
      ) : null}

      {activity.length > 0 ? (
        <ol className={styles.activityList}>
          {activity.map((item) => (
            <li data-tone={item.tone} key={item.id}>
              <span className={styles.activityMark}>
                <Icon decorative name="clock" size="sm" />
              </span>
              <div>
                <strong>{item.title}</strong>
                <span>
                  {item.game} · {item.occurredAtLabel}
                </span>
              </div>
              {item.scoreLabel ? <b>{item.scoreLabel}</b> : null}
            </li>
          ))}
        </ol>
      ) : (
        <p className={styles.empty}>No Crew activity has been recorded yet.</p>
      )}
    </section>
  );
}

export function CrewLifecycleControlsPanel({ snapshot }: { snapshot: CrewLifecycleSnapshot }) {
  const queryClient = useQueryClient();
  const [targetState, setTargetState] = useState<CrewLifecycleTarget>(
    snapshot.controls.allowedTransitions[0] ?? "active",
  );
  const [reason, setReason] = useState("");
  const [disbandReason, setDisbandReason] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const updateLifecycle = (next: CrewLifecycleSnapshot) => {
    queryClient.setQueriesData({ queryKey: crewLifecycleQueryKeys.all }, next);
  };

  const transition = useMutation({
    mutationFn: () =>
      crewLifecycleCommands.transition(snapshot.crewId, {
        expectedVersion: snapshot.version,
        targetState,
        reason,
      }),
    onSuccess: (result) => {
      updateLifecycle(result.snapshot);
      setReason("");
    },
  });

  const disband = useMutation({
    mutationFn: () =>
      crewLifecycleCommands.disband(snapshot.crewId, {
        expectedVersion: snapshot.version,
        reason: disbandReason,
        confirmation,
      }),
    onSuccess: (result) => {
      updateLifecycle(result.snapshot);
      setDisbandReason("");
      setConfirmation("");
    },
  });

  const activeBlockers = useMemo(
    () => snapshot.blockers.filter((blocker) => blocker.active),
    [snapshot.blockers],
  );
  const transitionReady =
    snapshot.viewer.canManageLifecycle &&
    snapshot.controls.allowedTransitions.includes(targetState) &&
    reason.trim().length >= 8;
  const disbandReady =
    snapshot.viewer.canDisband &&
    activeBlockers.length === 0 &&
    disbandReason.trim().length >= 12 &&
    confirmation === snapshot.controls.disbandConfirmation;

  return (
    <section className={styles.panel} data-crew-panel="lifecycle" data-m9-stage="9.7">
      <header className={styles.panelHeader}>
        <div>
          <h2>Crew lifecycle</h2>
          <p>
            Server state {lifecycleLabel(snapshot.state)} · version {snapshot.version}
          </p>
        </div>
        <Badge tone={snapshot.viewer.canManageLifecycle ? "positive" : "warning"} variant="outline">
          {snapshot.viewer.canManageLifecycle ? "Owner control" : "Read only"}
        </Badge>
      </header>

      <div className={styles.lifecycleGrid}>
        <article className={styles.transitionCard}>
          <h3>Change operational state</h3>
          {snapshot.controls.allowedTransitions.length > 0 ? (
            <>
              <label>
                <span>Next state</span>
                <Select
                  aria-label="Next Crew lifecycle state"
                  onChange={(event) => setTargetState(event.target.value as CrewLifecycleTarget)}
                  value={targetState}
                >
                  {snapshot.controls.allowedTransitions.map((target) => (
                    <option key={target} value={target}>
                      {targetLabel(target)}
                    </option>
                  ))}
                </Select>
              </label>
              <label>
                <span>Audit reason</span>
                <Input
                  aria-label="Crew lifecycle reason"
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Explain why this state is changing"
                  value={reason}
                />
              </label>
              <Button
                disabled={!transitionReady || transition.isPending}
                loading={transition.isPending}
                onClick={() => transition.mutate()}
                variant="secondary"
              >
                Apply lifecycle change
              </Button>
            </>
          ) : (
            <p className={styles.blockReason}>
              {snapshot.controls.blockedReason ??
                "No owner transition is available from this state."}
            </p>
          )}
        </article>

        <article className={styles.dangerCard}>
          <div className={styles.dangerHeading}>
            <div>
              <h3>Disband Crew</h3>
              <p>Permanent, audited and not reversible.</p>
            </div>
            <Badge tone="negative" variant="solid">
              Destructive
            </Badge>
          </div>

          <ul className={styles.blockerList}>
            {snapshot.blockers.map((blocker) => (
              <li data-active={blocker.active ? "true" : "false"} key={blocker.code}>
                <span>{blocker.label}</span>
                <b>{blocker.count}</b>
              </li>
            ))}
          </ul>

          <label>
            <span>Disband reason</span>
            <Input
              aria-label="Crew disband reason"
              onChange={(event) => setDisbandReason(event.target.value)}
              placeholder="Give a permanent audit reason"
              value={disbandReason}
            />
          </label>
          <label>
            <span>Type {snapshot.controls.disbandConfirmation}</span>
            <Input
              aria-label="Crew disband confirmation"
              onChange={(event) => setConfirmation(event.target.value)}
              value={confirmation}
            />
          </label>
          <Button
            disabled={!disbandReady || disband.isPending}
            loading={disband.isPending}
            onClick={() => disband.mutate()}
            variant="danger"
          >
            Permanently disband Crew
          </Button>
          {!snapshot.viewer.canDisband && snapshot.controls.blockedReason ? (
            <p className={styles.blockReason}>{snapshot.controls.blockedReason}</p>
          ) : null}
        </article>
      </div>

      <MutationMessage
        error={transition.error ?? disband.error}
        success={transition.isSuccess || disband.isSuccess}
      />
    </section>
  );
}

export function CrewLifecycleAuditPanel({ snapshot }: { snapshot: CrewLifecycleSnapshot }) {
  return (
    <section className={styles.panel} data-crew-panel="lifecycle-audit" data-m9-stage="9.7">
      <header className={styles.panelHeader}>
        <div>
          <h2>Lifecycle audit</h2>
          <p>Immutable operator-facing state history.</p>
        </div>
        <Badge tone="information" variant="outline">
          {snapshot.auditEvents.length} events
        </Badge>
      </header>
      {snapshot.auditEvents.length > 0 ? (
        <ol className={styles.auditList}>
          {snapshot.auditEvents.map((event) => (
            <li key={event.id}>
              <span className={styles.auditIcon}>
                <Icon decorative name="shield" size="sm" />
              </span>
              <div>
                <strong>{event.action.replaceAll("_", " ")}</strong>
                <span>
                  {lifecycleLabel(event.previousState)} → {lifecycleLabel(event.nextState)}
                </span>
                <small>{event.reason}</small>
              </div>
              <time dateTime={event.createdAt}>
                {new Date(event.createdAt).toLocaleString("en-GB", { timeZone: "UTC" })} UTC
              </time>
            </li>
          ))}
        </ol>
      ) : (
        <p className={styles.empty}>No lifecycle mutations have been recorded.</p>
      )}
    </section>
  );
}
