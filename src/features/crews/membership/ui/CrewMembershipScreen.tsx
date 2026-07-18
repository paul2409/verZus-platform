"use client";

// VERZUS M9.5 MEMBERSHIP-AWARE CREW PROFILE
// VERZUS M9.6 GOVERNANCE-AWARE CREW PROFILE
// VERZUS M9.7 LIFECYCLE-AWARE CREW PROFILE
// VERZUS M9.8 AUTHORITY AND LIFECYCLE TELEMETRY

import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";

import { CrewFoundationScreen, type CrewFoundationViewModel } from "../../foundation";
import {
  CrewGovernanceClientError,
  CrewGovernanceRosterPanel,
  CrewOwnershipTransferPanel,
  crewGovernanceQueryOptions,
} from "../../governance";
import {
  CrewActivityReliabilityPanel,
  CrewLifecycleAuditPanel,
  CrewLifecycleClientError,
  CrewLifecycleControlsPanel,
  CrewLifecycleStateBanner,
  crewLifecycleQueryOptions,
  type CrewLifecycleScenario,
} from "../../lifecycle";
import type { CrewResourceHealth } from "../../resources";
import { CrewAuthorityTelemetry, CrewLifecycleTelemetry } from "../../telemetry";
import { CrewMembershipClientError } from "../api/crew-membership.client";
import { crewMembershipQueryOptions } from "../api/crew-membership.query";
import styles from "./CrewMembership.module.css";
import { CrewMembershipRequestsPanel, CrewMembershipSettingsPanel } from "./CrewMembershipPanels";

function GovernanceUnavailable({ error, onRetry }: { error: Error | null; onRetry: () => void }) {
  const governanceError = error instanceof CrewGovernanceClientError ? error : null;
  return (
    <section className={styles.operationsPanel} data-crew-panel="roster" data-m9-stage="9.7">
      <header className={styles.panelHeader}>
        <div>
          <h2>Member management unavailable</h2>
          <p>The Crew profile and membership controls remain available.</p>
        </div>
        <Badge tone="negative" variant="outline">
          Isolated failure
        </Badge>
      </header>
      <p role="alert">
        {governanceError?.message ?? "Crew governance could not be loaded."}
        {governanceError ? ` Request ${governanceError.requestId}` : ""}
      </p>
      <Button onClick={onRetry} size="sm" variant="secondary">
        Retry member management
      </Button>
    </section>
  );
}

function LifecycleUnavailable({ error, onRetry }: { error: Error | null; onRetry: () => void }) {
  const lifecycleError = error instanceof CrewLifecycleClientError ? error : null;
  return (
    <section className={styles.operationsPanel} data-crew-panel="lifecycle" data-m9-stage="9.7">
      <header className={styles.panelHeader}>
        <div>
          <h2>Lifecycle controls unavailable</h2>
          <p>Profile, roster and activity remain available. Destructive actions are disabled.</p>
        </div>
        <Badge tone="negative" variant="outline">
          Fail closed
        </Badge>
      </header>
      <p role="alert">
        {lifecycleError?.message ?? "Crew lifecycle could not be loaded."}
        {lifecycleError ? ` Request ${lifecycleError.requestId}` : ""}
      </p>
      <Button onClick={onRetry} size="sm" variant="secondary">
        Retry lifecycle
      </Button>
    </section>
  );
}

export function CrewMembershipScreen({
  crewId,
  model,
  activityHealth,
  onRetryActivity,
  lifecycleScenario = "normal",
}: {
  crewId: string;
  model: CrewFoundationViewModel;
  activityHealth: CrewResourceHealth;
  onRetryActivity: () => void;
  lifecycleScenario?: CrewLifecycleScenario;
}) {
  const membership = useQuery(crewMembershipQueryOptions(crewId));
  const governance = useQuery(crewGovernanceQueryOptions(crewId));
  const lifecycle = useQuery(crewLifecycleQueryOptions(crewId, lifecycleScenario));
  const membershipError =
    membership.error instanceof CrewMembershipClientError ? membership.error : null;

  const effectiveModel = lifecycle.data
    ? {
        ...model,
        identity: { ...model.identity, lifecycle: lifecycle.data.state },
        settings: { ...model.settings, recruiting: lifecycle.data.operations.recruiting },
      }
    : model;

  const lifecycleLocksManagement =
    !lifecycle.data || !lifecycle.data.operations.membershipMutationsAllowed;
  const rosterPanel = governance.data ? (
    <CrewGovernanceRosterPanel snapshot={governance.data} />
  ) : governance.isError ? (
    <GovernanceUnavailable error={governance.error} onRetry={() => void governance.refetch()} />
  ) : undefined;

  const activityPanel = lifecycle.data ? (
    <CrewActivityReliabilityPanel
      activity={effectiveModel.activity}
      activityMode={lifecycle.data.operations.activityMode}
      health={activityHealth}
      onRetry={onRetryActivity}
    />
  ) : undefined;

  return (
    <div className={styles.membershipScreen} data-m9-stage="9.8">
      <CrewAuthorityTelemetry
        authority="membership"
        crewId={crewId}
        requestId={membershipError?.requestId ?? null}
        status={membership.isPending ? "loading" : membership.isError ? "error" : "success"}
      />
      <CrewAuthorityTelemetry
        authority="governance"
        crewId={crewId}
        requestId={
          governance.error instanceof CrewGovernanceClientError ? governance.error.requestId : null
        }
        status={governance.isPending ? "loading" : governance.isError ? "error" : "success"}
      />
      <CrewAuthorityTelemetry
        authority="lifecycle"
        crewId={crewId}
        requestId={
          lifecycle.error instanceof CrewLifecycleClientError ? lifecycle.error.requestId : null
        }
        status={lifecycle.isPending ? "loading" : lifecycle.isError ? "error" : "success"}
      />
      <CrewLifecycleTelemetry crewId={crewId} state={lifecycle.data?.state ?? null} />
      <div className={styles.statusBar} data-state={membership.status}>
        <span>
          Membership{" "}
          {membership.isPending ? "loading" : membership.isError ? "unavailable" : "live"}
        </span>
        {membership.data ? (
          <Badge tone="information" variant="outline">
            v{membership.data.version}
          </Badge>
        ) : null}
        {membershipError ? <small>Request {membershipError.requestId}</small> : null}
      </div>

      <div className={styles.statusBar} data-state={governance.status}>
        <span>
          Governance{" "}
          {governance.isPending ? "loading" : governance.isError ? "isolated error" : "live"}
        </span>
        {governance.data ? (
          <Badge tone="special" variant="outline">
            {governance.data.viewer.role} · v{governance.data.version}
          </Badge>
        ) : null}
        {governance.error instanceof CrewGovernanceClientError ? (
          <small>Request {governance.error.requestId}</small>
        ) : null}
      </div>

      <div className={styles.statusBar} data-state={lifecycle.status}>
        <span>
          Lifecycle{" "}
          {lifecycle.isPending
            ? "loading"
            : lifecycle.isError
              ? "isolated error"
              : lifecycle.data?.state}
        </span>
        {lifecycle.data ? (
          <Badge tone="warning" variant="outline">
            v{lifecycle.data.version}
          </Badge>
        ) : null}
        {lifecycle.error instanceof CrewLifecycleClientError ? (
          <small>Request {lifecycle.error.requestId}</small>
        ) : null}
      </div>

      {lifecycle.data ? <CrewLifecycleStateBanner snapshot={lifecycle.data} /> : null}

      <CrewFoundationScreen
        activityPanel={activityPanel}
        managementEnabled={Boolean(
          governance.data?.viewer.canManageMembers &&
          lifecycle.data?.operations.membershipMutationsAllowed,
        )}
        model={effectiveModel}
        requestsPanel={
          membership.data ? (
            <CrewMembershipRequestsPanel
              blockedReason={
                lifecycle.data
                  ? `Membership operations are frozen while the Crew is ${lifecycle.data.state}.`
                  : "Lifecycle authority is unavailable. Membership mutations fail closed."
              }
              operationsAllowed={!lifecycleLocksManagement}
              snapshot={membership.data}
            />
          ) : undefined
        }
        rosterPanel={rosterPanel}
        settingsPanel={
          membership.data ? (
            <div className={styles.settingsStack}>
              {lifecycle.data ? (
                <>
                  <CrewLifecycleControlsPanel snapshot={lifecycle.data} />
                  <CrewLifecycleAuditPanel snapshot={lifecycle.data} />
                </>
              ) : (
                <LifecycleUnavailable
                  error={lifecycle.error}
                  onRetry={() => void lifecycle.refetch()}
                />
              )}
              {governance.data ? <CrewOwnershipTransferPanel snapshot={governance.data} /> : null}
              <CrewMembershipSettingsPanel
                leaveAllowed={lifecycle.data?.operations.leaveAllowed ?? false}
                lifecycleLabel={lifecycle.data?.state}
                snapshot={membership.data}
              />
            </div>
          ) : undefined
        }
      />
    </div>
  );
}
