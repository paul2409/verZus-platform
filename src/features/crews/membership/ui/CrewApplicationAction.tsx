"use client";

// VERZUS M9.5 DISCOVERY APPLICATION ACTION

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/primitives/button";

import { CrewMembershipClientError, crewMembershipCommands } from "../api/crew-membership.client";
import { crewMembershipQueryKeys, crewMembershipQueryOptions } from "../api/crew-membership.query";
import styles from "./CrewMembership.module.css";

export function CrewApplicationAction({
  crewId,
  disabled = false,
}: {
  crewId: string;
  disabled?: boolean;
}) {
  const queryClient = useQueryClient();
  const membership = useQuery(crewMembershipQueryOptions(crewId));
  const [message, setMessage] = useState("I am available for verified Crew matches.");
  const mutation = useMutation({
    mutationFn: () =>
      crewMembershipCommands.submitApplication(crewId, {
        expectedVersion: membership.data?.version ?? 0,
        game: "EA FC",
        message,
      }),
    onSuccess: (result) => {
      queryClient.setQueryData(crewMembershipQueryKeys.detail(crewId), result.snapshot);
    },
  });

  const pending = membership.data?.applications.find(
    (item) => item.playerId === membership.data.viewer.playerId && item.status === "pending",
  );
  const error = mutation.error instanceof CrewMembershipClientError ? mutation.error : null;

  return (
    <div className={styles.applicationAction} data-m9-membership-action="application">
      <label>
        <span>Application note</span>
        <textarea
          disabled={disabled || Boolean(pending) || mutation.isPending}
          maxLength={300}
          onChange={(event) => setMessage(event.target.value)}
          value={message}
        />
      </label>
      <Button
        disabled={disabled || membership.isPending || Boolean(pending) || mutation.isPending}
        loading={mutation.isPending}
        onClick={() => mutation.mutate()}
        variant="primary"
      >
        {pending ? "Application pending" : "Send join request"}
      </Button>
      {membership.isError ? (
        <p role="alert">Membership status is unavailable. Retry the dialog.</p>
      ) : null}
      {mutation.isSuccess ? <p role="status">Application submitted and saved.</p> : null}
      {error ? (
        <p role="alert">
          {error.message} <small>Request {error.requestId}</small>
        </p>
      ) : null}
    </div>
  );
}
