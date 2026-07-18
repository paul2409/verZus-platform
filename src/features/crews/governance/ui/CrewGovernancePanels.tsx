"use client";

// VERZUS M9.6 ROLE, PERMISSION AND MEMBER MANAGEMENT PANELS

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { Select } from "@/components/primitives/select";

import { crewMembershipQueryKeys } from "../../membership";
import { CrewGovernanceClientError, crewGovernanceCommands } from "../api/crew-governance.client";
import { crewGovernanceQueryKeys } from "../api/crew-governance.query";
import type {
  CrewAssignableRole,
  CrewGovernanceMember,
  CrewGovernanceSnapshot,
} from "../model/crew-governance.types";
import styles from "./CrewGovernance.module.css";

function roleLabel(role: CrewGovernanceMember["role"]): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
}

function MutationMessage({ error, success }: { error: Error | null; success: boolean }) {
  if (error instanceof CrewGovernanceClientError) {
    return (
      <p className={styles.error} role="alert">
        {error.message} <small>Request {error.requestId}</small>
      </p>
    );
  }
  return success ? (
    <p className={styles.success} role="status">
      Crew governance updated and audited.
    </p>
  ) : null;
}

function MemberManagementCard({
  member,
  snapshot,
}: {
  member: CrewGovernanceMember;
  snapshot: CrewGovernanceSnapshot;
}) {
  const queryClient = useQueryClient();
  const initialRole = member.role === "owner" ? "captain" : member.role;
  const [role, setRole] = useState<CrewAssignableRole>(initialRole);
  const [reason, setReason] = useState("");

  const updateCaches = async (next: CrewGovernanceSnapshot) => {
    queryClient.setQueryData(crewGovernanceQueryKeys.detail(snapshot.crewId), next);
    await queryClient.invalidateQueries({
      queryKey: crewMembershipQueryKeys.detail(snapshot.crewId),
    });
  };

  const roleMutation = useMutation({
    mutationFn: () =>
      crewGovernanceCommands.changeRole(snapshot.crewId, member.id, {
        expectedVersion: snapshot.version,
        role,
        reason,
      }),
    onSuccess: async (result) => {
      await updateCaches(result.snapshot);
      setReason("");
    },
  });

  const removeMutation = useMutation({
    mutationFn: () =>
      crewGovernanceCommands.removeMember(snapshot.crewId, member.id, {
        expectedVersion: snapshot.version,
        reason,
      }),
    onSuccess: async (result) => {
      await updateCaches(result.snapshot);
      setReason("");
    },
  });

  const actionAllowed = member.management.allowedRoles.length > 0 || member.management.canRemove;
  const reasonValid = reason.trim().length >= 8;

  return (
    <article className={styles.managementCard} data-member-role={member.role}>
      <header>
        <div className={styles.identity}>
          <span className={styles.avatar} data-status={member.status}>
            {member.initials}
          </span>
          <div>
            <strong>{member.name}</strong>
            <span>{member.handle}</span>
          </div>
        </div>
        <Badge tone={member.role === "owner" ? "special" : "information"} variant="outline">
          {roleLabel(member.role)}
        </Badge>
      </header>

      <dl className={styles.memberMeta}>
        <div>
          <dt>Contribution</dt>
          <dd>{member.contribution.toLocaleString("en-US")}</dd>
        </div>
        <div>
          <dt>Joined</dt>
          <dd>{formatDate(member.joinedAt)}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{member.status}</dd>
        </div>
      </dl>

      {actionAllowed ? (
        <div className={styles.controls}>
          {member.management.allowedRoles.length > 0 ? (
            <label>
              <span>Assign role</span>
              <Select
                aria-label={`Role for ${member.name}`}
                onChange={(event) => setRole(event.target.value as CrewAssignableRole)}
                value={role}
              >
                {member.management.allowedRoles.map((allowedRole) => (
                  <option key={allowedRole} value={allowedRole}>
                    {roleLabel(allowedRole)}
                  </option>
                ))}
              </Select>
            </label>
          ) : null}
          <label>
            <span>Audit reason</span>
            <Input
              aria-label={`Reason for managing ${member.name}`}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Minimum 8 characters"
              value={reason}
            />
          </label>
          <div className={styles.actions}>
            {member.management.allowedRoles.length > 0 ? (
              <Button
                disabled={!reasonValid || role === member.role || roleMutation.isPending}
                loading={roleMutation.isPending}
                onClick={() => roleMutation.mutate()}
                size="sm"
                variant="secondary"
              >
                Save role
              </Button>
            ) : null}
            {member.management.canRemove ? (
              <Button
                disabled={!reasonValid || removeMutation.isPending}
                loading={removeMutation.isPending}
                onClick={() => removeMutation.mutate()}
                size="sm"
                variant="danger"
              >
                Remove member
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        <p className={styles.blockReason}>
          {member.management.blockReason ?? "No management action is available."}
        </p>
      )}

      <MutationMessage
        error={roleMutation.error ?? removeMutation.error}
        success={roleMutation.isSuccess || removeMutation.isSuccess}
      />
    </article>
  );
}

export function CrewGovernanceRosterPanel({ snapshot }: { snapshot: CrewGovernanceSnapshot }) {
  const [query, setQuery] = useState("");
  const filteredMembers = useMemo(() => {
    const token = query.trim().toLowerCase();
    if (!token) return snapshot.members;
    return snapshot.members.filter((member) =>
      [member.name, member.handle, member.role].some((value) =>
        value.toLowerCase().includes(token),
      ),
    );
  }, [query, snapshot.members]);

  return (
    <section className={styles.panel} data-crew-panel="roster" data-m9-stage="9.6">
      <header className={styles.panelHeader}>
        <div>
          <h2>Roles and member management</h2>
          <p>
            Server permissions · version {snapshot.version} · viewer{" "}
            {roleLabel(snapshot.viewer.role)}
          </p>
        </div>
        <Badge tone={snapshot.viewer.canManageMembers ? "positive" : "neutral"} variant="outline">
          {snapshot.viewer.canManageMembers ? "Management enabled" : "Read only"}
        </Badge>
      </header>

      <div className={styles.permissionStrip}>
        <span>Owner: all non-owner roles, removals and ownership transfer</span>
        <span>Captain: member and trial management</span>
        <span>Manager: trial management</span>
      </div>

      <Input
        aria-label="Search Crew roster"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search name, handle or role"
        value={query}
      />

      <div className={styles.rosterGrid}>
        {filteredMembers.map((member) => (
          <MemberManagementCard key={member.id} member={member} snapshot={snapshot} />
        ))}
      </div>

      {filteredMembers.length === 0 ? (
        <p className={styles.empty}>No Crew member matches this search.</p>
      ) : null}
    </section>
  );
}

export function CrewOwnershipTransferPanel({ snapshot }: { snapshot: CrewGovernanceSnapshot }) {
  const queryClient = useQueryClient();
  const eligibleTargets = snapshot.members.filter(
    (member) => member.management.canTransferOwnership,
  );
  const [targetId, setTargetId] = useState(eligibleTargets[0]?.id ?? "");
  const [reason, setReason] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const transfer = useMutation({
    mutationFn: () =>
      crewGovernanceCommands.transferOwnership(snapshot.crewId, {
        expectedVersion: snapshot.version,
        targetMemberId: targetId,
        reason,
      }),
    onSuccess: async (result) => {
      queryClient.setQueryData(crewGovernanceQueryKeys.detail(snapshot.crewId), result.snapshot);
      await queryClient.invalidateQueries({
        queryKey: crewMembershipQueryKeys.detail(snapshot.crewId),
      });
      setReason("");
      setConfirmation("");
    },
  });

  const ready =
    snapshot.viewer.canTransferOwnership &&
    targetId.length > 0 &&
    reason.trim().length >= 8 &&
    confirmation === "TRANSFER OWNERSHIP";

  return (
    <section className={styles.panel} data-crew-panel="ownership" data-m9-stage="9.6">
      <header className={styles.panelHeader}>
        <div>
          <h2>Transfer ownership</h2>
          <p>One atomic command demotes the current owner and promotes the selected member.</p>
        </div>
        <Badge tone="warning" variant="solid">
          High risk
        </Badge>
      </header>

      {snapshot.viewer.canTransferOwnership ? (
        <div className={styles.transferGrid}>
          <label>
            <span>New owner</span>
            <Select
              aria-label="New Crew owner"
              onChange={(event) => setTargetId(event.target.value)}
              value={targetId}
            >
              {eligibleTargets.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} · {roleLabel(member.role)}
                </option>
              ))}
            </Select>
          </label>
          <label>
            <span>Audit reason</span>
            <Input
              aria-label="Ownership transfer reason"
              onChange={(event) => setReason(event.target.value)}
              placeholder="Explain the ownership change"
              value={reason}
            />
          </label>
          <label>
            <span>Type TRANSFER OWNERSHIP</span>
            <Input
              aria-label="Ownership transfer confirmation"
              onChange={(event) => setConfirmation(event.target.value)}
              value={confirmation}
            />
          </label>
          <Button
            disabled={!ready || transfer.isPending}
            loading={transfer.isPending}
            onClick={() => transfer.mutate()}
            variant="danger"
          >
            Transfer ownership
          </Button>
        </div>
      ) : (
        <p className={styles.blockReason}>Only the current Crew owner can transfer ownership.</p>
      )}

      <MutationMessage error={transfer.error} success={transfer.isSuccess} />
    </section>
  );
}
