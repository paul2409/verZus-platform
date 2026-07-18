"use client";

// VERZUS M9.5 CREW MEMBERSHIP OPERATION PANELS

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { Select } from "@/components/primitives/select";

import { CrewMembershipClientError, crewMembershipCommands } from "../api/crew-membership.client";
import { crewMembershipQueryKeys } from "../api/crew-membership.query";
import type { CrewMembershipSnapshot } from "../model/crew-membership.types";
import styles from "./CrewMembership.module.css";

function formatExpiry(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(value));
}

function MutationMessage({ error, success }: { error: Error | null; success: boolean }) {
  if (error instanceof CrewMembershipClientError) {
    return (
      <p className={styles.error} role="alert">
        {error.message} <small>Request {error.requestId}</small>
      </p>
    );
  }
  return success ? (
    <p className={styles.success} role="status">
      Membership updated.
    </p>
  ) : null;
}

export function CrewMembershipRequestsPanel({
  snapshot,
  operationsAllowed = true,
  blockedReason,
}: {
  snapshot: CrewMembershipSnapshot;
  operationsAllowed?: boolean;
  blockedReason?: string | null;
}) {
  const queryClient = useQueryClient();
  const [handle, setHandle] = useState("@orbit");
  const [role, setRole] = useState<"captain" | "manager" | "member" | "trial">("trial");

  const updateSnapshot = (next: CrewMembershipSnapshot) => {
    queryClient.setQueryData(crewMembershipQueryKeys.detail(snapshot.crewId), next);
  };

  const decision = useMutation({
    mutationFn: (input: { applicationId: string; decision: "accept" | "decline" }) =>
      crewMembershipCommands.decideApplication(snapshot.crewId, input.applicationId, {
        expectedVersion: snapshot.version,
        decision: input.decision,
      }),
    onSuccess: (result) => updateSnapshot(result.snapshot),
  });
  const invite = useMutation({
    mutationFn: () =>
      crewMembershipCommands.createInvite(snapshot.crewId, {
        expectedVersion: snapshot.version,
        playerHandle: handle,
        role,
      }),
    onSuccess: (result) => updateSnapshot(result.snapshot),
  });
  const expire = useMutation({
    mutationFn: () => crewMembershipCommands.expire(snapshot.crewId, snapshot.version),
    onSuccess: (result) => updateSnapshot(result.snapshot),
  });

  const pendingApplications = snapshot.applications.filter((item) => item.status === "pending");
  const pendingInvites = snapshot.invites.filter((item) => item.status === "pending");

  return (
    <section className={styles.operationsPanel} data-crew-panel="requests" data-m9-stage="9.7">
      <header className={styles.panelHeader}>
        <div>
          <h2>Applications and invites</h2>
          <p>Server-authoritative decisions · version {snapshot.version}</p>
        </div>
        <Badge tone="warning" variant="solid">
          {pendingApplications.length + pendingInvites.length} pending
        </Badge>
      </header>

      {!operationsAllowed ? (
        <p className={styles.empty} role="status">
          {blockedReason ?? "Membership operations are frozen by the Crew lifecycle state."}
        </p>
      ) : null}

      <div className={styles.membershipGrid}>
        <article>
          <h3>Join applications</h3>
          {pendingApplications.length === 0 ? (
            <p className={styles.empty}>No pending applications.</p>
          ) : (
            <ol className={styles.membershipList}>
              {pendingApplications.map((application) => (
                <li key={application.id}>
                  <div>
                    <strong>{application.playerName}</strong>
                    <span>
                      {application.handle} · {application.game} · Trust {application.trust}
                    </span>
                    <small>Expires {formatExpiry(application.expiresAt)} UTC</small>
                  </div>
                  <div className={styles.rowActions}>
                    <Button
                      disabled={!operationsAllowed || decision.isPending}
                      onClick={() =>
                        decision.mutate({ applicationId: application.id, decision: "decline" })
                      }
                      size="sm"
                      variant="ghost"
                    >
                      Decline
                    </Button>
                    <Button
                      disabled={!operationsAllowed || decision.isPending}
                      onClick={() =>
                        decision.mutate({ applicationId: application.id, decision: "accept" })
                      }
                      size="sm"
                      variant="primary"
                    >
                      Accept
                    </Button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </article>

        <article>
          <h3>Invite a player</h3>
          <div className={styles.inviteForm}>
            <Input
              aria-label="Player handle"
              onChange={(event) => setHandle(event.target.value)}
              placeholder="@player"
              value={handle}
            />
            <Select
              aria-label="Invite role"
              onChange={(event) => setRole(event.target.value as typeof role)}
              value={role}
            >
              <option value="captain">Captain</option>
              <option value="manager">Manager</option>
              <option value="member">Member</option>
              <option value="trial">Trial</option>
            </Select>
            <Button
              disabled={!operationsAllowed || invite.isPending}
              onClick={() => invite.mutate()}
              variant="secondary"
            >
              Send invite
            </Button>
          </div>
          {pendingInvites.length > 0 ? (
            <ol className={styles.inviteList}>
              {pendingInvites.map((item) => (
                <li key={item.id}>
                  <span>{item.handle}</span>
                  <Badge size="sm" tone="information" variant="outline">
                    {item.role}
                  </Badge>
                  <small>Expires {formatExpiry(item.expiresAt)} UTC</small>
                </li>
              ))}
            </ol>
          ) : null}
          <Button
            disabled={!operationsAllowed || expire.isPending}
            onClick={() => expire.mutate()}
            size="sm"
            variant="ghost"
          >
            Expire due items
          </Button>
        </article>
      </div>

      <MutationMessage
        error={decision.error ?? invite.error ?? expire.error}
        success={decision.isSuccess || invite.isSuccess || expire.isSuccess}
      />
    </section>
  );
}

export function CrewMembershipSettingsPanel({
  snapshot,
  leaveAllowed = true,
  lifecycleLabel,
}: {
  snapshot: CrewMembershipSnapshot;
  leaveAllowed?: boolean;
  lifecycleLabel?: string | undefined;
}) {
  const queryClient = useQueryClient();
  const leave = useMutation({
    mutationFn: () => crewMembershipCommands.leave(snapshot.crewId, snapshot.version),
    onSuccess: (result) => {
      queryClient.setQueryData(crewMembershipQueryKeys.detail(snapshot.crewId), result.snapshot);
    },
  });
  const ownerBlocked = snapshot.viewer.role === "owner";
  const lifecycleBlocked = !leaveAllowed;

  return (
    <section className={styles.operationsPanel} data-crew-panel="settings" data-m9-stage="9.7">
      <header className={styles.panelHeader}>
        <div>
          <h2>Membership controls</h2>
          <p>Current role: {snapshot.viewer.role ?? "not a member"}</p>
        </div>
        <Badge
          tone={ownerBlocked || lifecycleBlocked ? "warning" : "information"}
          variant="outline"
        >
          {ownerBlocked
            ? "Transfer required"
            : lifecycleBlocked
              ? "Leave closed"
              : "Leave available"}
        </Badge>
      </header>
      <div className={styles.leaveCard}>
        <div>
          <strong>Leave Crew</strong>
          <span>
            {ownerBlocked
              ? "Owners must transfer ownership before leaving."
              : lifecycleBlocked
                ? `Leaving is unavailable while the Crew is ${lifecycleLabel ?? "in this state"}.`
                : "Leaving removes your membership but preserves the Crew and its history."}
          </span>
        </div>
        <Button
          disabled={ownerBlocked || lifecycleBlocked || !snapshot.viewer.role || leave.isPending}
          onClick={() => leave.mutate()}
          variant="danger"
        >
          Leave Crew
        </Button>
      </div>
      <MutationMessage error={leave.error} success={leave.isSuccess} />
    </section>
  );
}
