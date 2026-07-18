// VERZUS M9.4 INDEPENDENT CREW QUERY RESOURCES

import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { CrewResourceError } from "../adapter/crew-resource.adapter";
import type { CrewResourceName, CrewResourceScenario } from "../model/crew-resource.types";
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
  resource: (crewId: string, resource: CrewResourceName, scenario: CrewResourceScenario) =>
    ["crew-resources", crewId, resource, scenario] as const,
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

export const crewProfileQueryOptions = (crewId: string, scenario: CrewResourceScenario) =>
  queryOptions({
    queryKey: crewResourceQueryKeys.resource(crewId, "profile", scenario),
    queryFn: ({ signal }) => getCrewProfileResource(crewId, { scenario, signal }),
    ...shared,
  });

export const crewRosterQueryOptions = (crewId: string, scenario: CrewResourceScenario) =>
  queryOptions({
    queryKey: crewResourceQueryKeys.resource(crewId, "roster", scenario),
    queryFn: ({ signal }) => getCrewRosterResource(crewId, { scenario, signal }),
    ...shared,
  });

export const crewRequestsQueryOptions = (crewId: string, scenario: CrewResourceScenario) =>
  queryOptions({
    queryKey: crewResourceQueryKeys.resource(crewId, "requests", scenario),
    queryFn: ({ signal }) => getCrewRequestsResource(crewId, { scenario, signal }),
    ...shared,
  });

export const crewActivityQueryOptions = (crewId: string, scenario: CrewResourceScenario) =>
  queryOptions({
    queryKey: crewResourceQueryKeys.resource(crewId, "activity", scenario),
    queryFn: ({ signal }) => getCrewActivityResource(crewId, { scenario, signal }),
    ...shared,
  });

export const crewRankingsQueryOptions = (crewId: string, scenario: CrewResourceScenario) =>
  queryOptions({
    queryKey: crewResourceQueryKeys.resource(crewId, "rankings", scenario),
    queryFn: ({ signal }) => getCrewRankingsResource(crewId, { scenario, signal }),
    ...shared,
  });

export const crewAchievementsQueryOptions = (crewId: string, scenario: CrewResourceScenario) =>
  queryOptions({
    queryKey: crewResourceQueryKeys.resource(crewId, "achievements", scenario),
    queryFn: ({ signal }) => getCrewAchievementsResource(crewId, { scenario, signal }),
    ...shared,
  });

export const crewSettingsQueryOptions = (crewId: string, scenario: CrewResourceScenario) =>
  queryOptions({
    queryKey: crewResourceQueryKeys.resource(crewId, "settings", scenario),
    queryFn: ({ signal }) => getCrewSettingsResource(crewId, { scenario, signal }),
    ...shared,
  });
