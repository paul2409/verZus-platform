"use client";

import { CompetitionLifecycleApiClientError } from "../api/competition-lifecycle-api.adapter";
import { useCompetitionLifecycle } from "../hooks/useCompetitionLifecycle";
import { CompetitionLifecycleState } from "./CompetitionLifecycleState";

export type CompetitionLifecycleControllerProps = {
  competitionId: string;
};

export function CompetitionLifecycleController({
  competitionId,
}: CompetitionLifecycleControllerProps) {
  const query = useCompetitionLifecycle(competitionId, "normal");
  const error =
    query.error instanceof CompetitionLifecycleApiClientError
      ? {
          code: query.error.code,
          message: query.error.message,
          requestId: query.error.requestId,
          retryable: query.error.retryable,
        }
      : query.error instanceof Error
        ? {
            code: "invalid_response",
            message: "Competition status could not be verified.",
            requestId: null,
            retryable: true,
          }
        : undefined;

  return (
    <CompetitionLifecycleState
      competitionId={competitionId}
      error={error}
      isLoading={query.isPending}
      isRetrying={query.isFetching && !query.isPending}
      onRetry={() => {
        void query.refetch();
      }}
      resource={query.data}
      scenario="normal"
    />
  );
}
