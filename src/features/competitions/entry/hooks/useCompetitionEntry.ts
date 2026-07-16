"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";

import { competitionDiscoveryQueryKeys } from "../../discovery/api";
import { competitionDetailQueryKeys } from "../../details/api";
import {
  CompetitionEntryApiClientError,
  competitionEntryControlQueryOptions,
  competitionEntryQueryKeys,
  submitCompetitionEntry,
} from "../api";
import type {
  CompetitionEntryControlResourceData,
  CompetitionEntryControlViewModel,
  CompetitionEntryMutationResult,
  CompetitionEntryScenario,
} from "../model/competition-entry.types";
import { competitionEntryResourceFromQuery } from "../ui/competition-entry-resource";

export type CompetitionEntryAction = {
  resource: ReturnType<typeof competitionEntryResourceFromQuery>;
  mutationState: "idle" | "pending" | "success" | "error";
  result: CompetitionEntryMutationResult | null;
  errorCode: string | null;
  requestId: string | null;
  confirmEntry: (control: CompetitionEntryControlViewModel) => void;
  retryResource: () => void;
  resetMutation: () => void;
};

export function useCompetitionEntry(
  competitionId: string,
  scenario: CompetitionEntryScenario,
): CompetitionEntryAction {
  const queryClient = useQueryClient();
  const immediateLock = useRef(false);
  const idempotencyKey = useRef<string | null>(null);
  const query = useQuery(competitionEntryControlQueryOptions(competitionId, scenario));

  const mutation = useMutation({
    mutationKey: ["competitions", "entry", "confirm", competitionId, scenario],
    mutationFn: submitCompetitionEntry,
    onSuccess: (result) => {
      queryClient.setQueryData(
        competitionEntryQueryKeys.control(competitionId, scenario),
        (current: CompetitionEntryControlResourceData | undefined) =>
          current
            ? {
                ...current,
                value: {
                  ...current.value,
                  canEnter: false,
                  existingEntry: result.entry,
                },
              }
            : current,
      );
      void queryClient.invalidateQueries({ queryKey: competitionDiscoveryQueryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: competitionDetailQueryKeys.resource(competitionId, "participants", scenario),
      });
    },
    onSettled: () => {
      immediateLock.current = false;
    },
  });

  return {
    resource: competitionEntryResourceFromQuery(query),
    mutationState: mutation.isPending
      ? "pending"
      : mutation.isSuccess
        ? "success"
        : mutation.isError
          ? "error"
          : "idle",
    result: mutation.data ?? null,
    errorCode:
      mutation.error instanceof CompetitionEntryApiClientError
        ? mutation.error.code
        : mutation.isError
          ? "unknown_error"
          : null,
    requestId:
      mutation.error instanceof CompetitionEntryApiClientError
        ? mutation.error.requestId
        : (mutation.data?.requestId ?? null),
    confirmEntry: (control) => {
      if (immediateLock.current || mutation.isPending || !control.canEnter) return;
      immediateLock.current = true;
      idempotencyKey.current ??= globalThis.crypto.randomUUID();
      mutation.mutate({
        scenario,
        command: {
          competitionId,
          expectedStateVersion: control.stateVersion,
          idempotencyKey: idempotencyKey.current,
          acceptedTerms: true,
        },
      });
    },
    retryResource: () => void query.refetch(),
    resetMutation: () => {
      mutation.reset();
      idempotencyKey.current = null;
      immediateLock.current = false;
    },
  };
}
