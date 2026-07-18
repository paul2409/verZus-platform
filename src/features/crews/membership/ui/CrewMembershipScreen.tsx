"use client";

// VERZUS M9.5 MEMBERSHIP-AWARE CREW PROFILE

import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/primitives/badge";

import { CrewFoundationScreen, type CrewFoundationViewModel } from "../../foundation";
import { CrewMembershipClientError } from "../api/crew-membership.client";
import { crewMembershipQueryOptions } from "../api/crew-membership.query";
import styles from "./CrewMembership.module.css";
import { CrewMembershipRequestsPanel, CrewMembershipSettingsPanel } from "./CrewMembershipPanels";

export function CrewMembershipScreen({
  crewId,
  model,
}: {
  crewId: string;
  model: CrewFoundationViewModel;
}) {
  const membership = useQuery(crewMembershipQueryOptions(crewId));
  const error = membership.error instanceof CrewMembershipClientError ? membership.error : null;

  return (
    <div className={styles.membershipScreen} data-m9-stage="9.5">
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
        {error ? <small>Request {error.requestId}</small> : null}
      </div>
      <CrewFoundationScreen
        model={model}
        requestsPanel={
          membership.data ? <CrewMembershipRequestsPanel snapshot={membership.data} /> : undefined
        }
        settingsPanel={
          membership.data ? <CrewMembershipSettingsPanel snapshot={membership.data} /> : undefined
        }
      />
    </div>
  );
}
