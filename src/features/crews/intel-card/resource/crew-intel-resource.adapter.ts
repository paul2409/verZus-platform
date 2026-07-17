// VERZUS M8.9 CREW INTEL RESOURCE ADAPTER

import type { CrewIntelViewModel } from "../crew-intel.types";
import {
  crewIntelEnvelopeSchema,
  crewIntelErrorEnvelopeSchema,
} from "./crew-intel-resource.schema";

export type CrewIntelResource = {
  model: CrewIntelViewModel;
  requestId: string;
  fetchedAt: string;
  freshness: "fresh" | "stale" | "partial";
};

export class CrewIntelResourceError extends Error {
  readonly code: string;
  readonly requestId: string;
  readonly retryable: boolean;

  constructor(input: { code: string; message: string; requestId: string; retryable: boolean }) {
    super(input.message);
    this.name = "CrewIntelResourceError";
    this.code = input.code;
    this.requestId = input.requestId;
    this.retryable = input.retryable;
  }
}

export function adaptCrewIntelPayload(payload: unknown): CrewIntelResource {
  const success = crewIntelEnvelopeSchema.safeParse(payload);
  if (success.success) {
    const { data, meta } = success.data;
    return {
      model: {
        id: data.id,
        name: data.name,
        tag: data.tag,
        tierLabel: data.tier_label,
        locationLabel: data.location_label,
        emblemSrc: data.emblem_src,
        rank: data.rank,
        trust: data.trust,
        verified: data.verified,
        reputationLabel: data.reputation_label,
        membersLabel: data.members_label,
        winRateLabel: data.win_rate_label,
        warRecordLabel: data.war_record_label,
        ownerName: data.owner_name,
        captainNames: data.captain_names,
        activeRosterCount: data.active_roster_count,
        recentResults: data.recent_results,
        crewHref: data.crew_href,
        joinWarHref: data.join_war_href,
      },
      requestId: meta.request_id,
      fetchedAt: meta.fetched_at,
      freshness: meta.freshness,
    };
  }

  const failure = crewIntelErrorEnvelopeSchema.safeParse(payload);
  if (failure.success) {
    throw new CrewIntelResourceError({
      code: failure.data.error.code,
      message: failure.data.error.message,
      requestId: failure.data.error.request_id,
      retryable: failure.data.error.retryable,
    });
  }

  throw new CrewIntelResourceError({
    code: "CREW_INTEL_SCHEMA_INVALID",
    message: "Crew intel failed schema validation.",
    requestId: "crew-intel-schema-invalid",
    retryable: true,
  });
}
