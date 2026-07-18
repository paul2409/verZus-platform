// VERZUS M9.4 CREW RESOURCE VIEW-MODEL COMPOSITION

import type { CrewFoundationViewModel } from "../../foundation";
import type { CrewResourceSnapshotMap } from "./crew-resource.types";

export function mergeCrewResourceSnapshot(
  fallback: CrewFoundationViewModel,
  resources: CrewResourceSnapshotMap,
): CrewFoundationViewModel {
  return {
    identity: resources.profile?.data.identity ?? fallback.identity,
    members: resources.roster?.data.members ?? fallback.members,
    requests: resources.requests?.data.requests ?? fallback.requests,
    activity: resources.activity?.data.activity ?? fallback.activity,
    stats: resources.rankings?.data.stats ?? fallback.stats,
    achievements: resources.achievements?.data.achievements ?? fallback.achievements,
    settings: resources.settings?.data.settings ?? fallback.settings,
  };
}
