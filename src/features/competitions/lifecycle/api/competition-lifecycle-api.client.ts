import type {
  CompetitionLifecycleResource,
  CompetitionLifecycleScenario,
} from "../model/competition-lifecycle.types";
import {
  adaptCompetitionLifecyclePayload,
  CompetitionLifecycleApiClientError,
} from "./competition-lifecycle-api.adapter";

export { CompetitionLifecycleApiClientError };

export async function getCompetitionLifecycle(
  competitionId: string,
  scenario: CompetitionLifecycleScenario,
  signal?: AbortSignal,
): Promise<CompetitionLifecycleResource> {
  const search = new URLSearchParams();
  if (scenario !== "normal") search.set("scenario", scenario);

  const suffix = search.size > 0 ? `?${search.toString()}` : "";
  const response = await fetch(
    `/api/competitions/${encodeURIComponent(competitionId)}/lifecycle${suffix}`,
    {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      ...(signal ? { signal } : {}),
    },
  );

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new CompetitionLifecycleApiClientError({
      code: "invalid_response",
      message: "The competition lifecycle response was not valid JSON.",
      requestId: response.headers.get("x-request-id"),
      retryable: response.status >= 500,
    });
  }

  return adaptCompetitionLifecyclePayload(payload);
}
