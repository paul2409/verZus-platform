"use client";

import { useEffect, useState } from "react";

import { CompetitionLifecycleApiClientError } from "../api/competition-lifecycle-api.adapter";
import { useCompetitionLifecycle } from "../hooks/useCompetitionLifecycle";
import { competitionLifecycleScenarioSchema } from "../model/competition-lifecycle.schema";
import type { CompetitionLifecycleScenario } from "../model/competition-lifecycle.types";
import { CompetitionLifecycleState } from "./CompetitionLifecycleState";

export type CompetitionLifecycleControllerProps = {
  competitionId: string;
};

function resolveScenario(value: string | null): CompetitionLifecycleScenario {
  const parsed = competitionLifecycleScenarioSchema.safeParse(value ?? "normal");
  return parsed.success ? parsed.data : "normal";
}

function scenarioFromLocation(): CompetitionLifecycleScenario {
  if (typeof window === "undefined") return "normal";
  return resolveScenario(new URLSearchParams(window.location.search).get("scenario"));
}

export function CompetitionLifecycleController({
  competitionId,
}: CompetitionLifecycleControllerProps) {
  const [scenario, setScenario] = useState<CompetitionLifecycleScenario>("normal");

  useEffect(() => {
    const syncScenario = () => setScenario(scenarioFromLocation());
    syncScenario();
    window.addEventListener("popstate", syncScenario);
    return () => window.removeEventListener("popstate", syncScenario);
  }, []);

  const query = useCompetitionLifecycle(competitionId, scenario);
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

  if (scenario === "normal" && !query.error) return null;

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
      scenario={scenario}
    />
  );
}
