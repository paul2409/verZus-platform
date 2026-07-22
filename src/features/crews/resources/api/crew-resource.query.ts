import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { CrewResourceError } from "../adapter/crew-resource.adapter";
import type { CrewResourceName } from "../model/crew-resource.types";
import {
  getCrewAchievementsResource,
  getCrewActivityResource,
  getCrewProfileResource,
  getCrewRankingsResource,
  getCrewRequestsResource,
  getCrewRosterResource,
  getCrewSettingsResource,
} from "./crew-resource.client";

export const crewResourceQueryKeys = {
  all: ["crew-resources"] as const,
  resource: (crewId: string, resource: CrewResourceName) =>
    ["crew-resources", crewId, resource] as const,
};

function retryResource(failureCount: number, error: Error): boolean {
  if (failureCount >= 2) return false;
  return error instanceof CrewResourceError ? error.retryable : true;
}

const shared = {
  staleTime: 60_000,
  gcTime: 15 * 60_000,
  placeholderData: keepPreviousData,
  retry: retryResource,
};

export const crewProfileQueryOptions = (crewId: string) =>
  queryOptions({
    queryKey: crewResourceQueryKeys.resource(crewId, "profile"),
    queryFn: ({ signal }) => getCrewProfileResource(crewId, { signal }),
    ...shared,
  });

export const crewRosterQueryOptions = (crewId: string) =>
  queryOptions({
    queryKey: crewResourceQueryKeys.resource(crewId, "roster"),
    queryFn: ({ signal }) => getCrewRosterResource(crewId, { signal }),
    ...shared,
  });

export const crewRequestsQueryOptions = (crewId: string) =>
  queryOptions({
    queryKey: crewResourceQueryKeys.resource(crewId, "requests"),
    queryFn: ({ signal }) => getCrewRequestsResource(crewId, { signal }),
    ...shared,
  });

export const crewActivityQueryOptions = (crewId: string) =>
  queryOptions({
    queryKey: crewResourceQueryKeys.resource(crewId, "activity"),
    queryFn: ({ signal }) => getCrewActivityResource(crewId, { signal }),
    ...shared,
  });

export const crewRankingsQueryOptions = (crewId: string) =>
  queryOptions({
    queryKey: crewResourceQueryKeys.resource(crewId, "rankings"),
    queryFn: ({ signal }) => getCrewRankingsResource(crewId, { signal }),
    ...shared,
  });

export const crewAchievementsQueryOptions = (crewId: string) =>
  queryOptions({
    queryKey: crewResourceQueryKeys.resource(crewId, "achievements"),
    queryFn: ({ signal }) => getCrewAchievementsResource(crewId, { signal }),
    ...shared,
  });

export const crewSettingsQueryOptions = (crewId: string) =>
  queryOptions({
    queryKey: crewResourceQueryKeys.resource(crewId, "settings"),
    queryFn: ({ signal }) => getCrewSettingsResource(crewId, { signal }),
    ...shared,
  });
