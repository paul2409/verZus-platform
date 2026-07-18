// VERZUS M9.4 CREW RESOURCE ADAPTERS

import {
  crewAchievementsEnvelopeSchema,
  crewActivityEnvelopeSchema,
  crewProfileEnvelopeSchema,
  crewRankingsEnvelopeSchema,
  crewRequestsEnvelopeSchema,
  crewResourceErrorEnvelopeSchema,
  crewRosterEnvelopeSchema,
  crewSettingsEnvelopeSchema,
} from "../schema/crew-resource.schema";
import type {
  CrewAchievementsResource,
  CrewActivityResource,
  CrewProfileResource,
  CrewRankingsResource,
  CrewRequestsResource,
  CrewResourceMeta,
  CrewResourceSnapshot,
  CrewRosterResource,
  CrewSettingsResource,
} from "../model/crew-resource.types";

export class CrewResourceError extends Error {
  readonly code: string;
  readonly requestId: string;
  readonly retryable: boolean;

  constructor(input: { code: string; message: string; requestId: string; retryable: boolean }) {
    super(input.message);
    this.name = "CrewResourceError";
    this.code = input.code;
    this.requestId = input.requestId;
    this.retryable = input.retryable;
  }
}

function adaptMeta(meta: {
  request_id: string;
  fetched_at: string;
  freshness: "fresh" | "stale";
  source: "mock-crew-resource";
}): CrewResourceMeta {
  return {
    requestId: meta.request_id,
    fetchedAt: meta.fetched_at,
    freshness: meta.freshness,
    source: meta.source,
  };
}

function throwStructuredOrSchemaError(payload: unknown, resource: string): never {
  const failure = crewResourceErrorEnvelopeSchema.safeParse(payload);
  if (failure.success) {
    throw new CrewResourceError({
      code: failure.data.error.code,
      message: failure.data.error.message,
      requestId: failure.data.error.request_id,
      retryable: failure.data.error.retryable,
    });
  }

  throw new CrewResourceError({
    code: `CREW_${resource.toUpperCase()}_SCHEMA_INVALID`,
    message: `${resource} failed schema validation.`,
    requestId: `crew-${resource}-schema-invalid`,
    retryable: true,
  });
}

export function adaptCrewProfilePayload(payload: unknown): CrewResourceSnapshot<"profile"> {
  const result = crewProfileEnvelopeSchema.safeParse(payload);
  if (!result.success) return throwStructuredOrSchemaError(payload, "profile");
  const { identity } = result.data.data;
  const data: CrewProfileResource = {
    identity: {
      id: identity.id,
      name: identity.name,
      tag: identity.tag,
      tagline: identity.tagline,
      description: identity.description,
      crestSrc: identity.crest_src,
      bannerSrc: identity.banner_src,
      verified: identity.verified,
      tier: identity.tier,
      games: identity.games,
      memberCount: identity.member_count,
      region: identity.region,
      visibility: identity.visibility,
      foundedAtLabel: identity.founded_at_label,
      lifecycle: identity.lifecycle,
    },
  };
  return { data, meta: adaptMeta(result.data.meta) };
}

export function adaptCrewRosterPayload(payload: unknown): CrewResourceSnapshot<"roster"> {
  const result = crewRosterEnvelopeSchema.safeParse(payload);
  if (!result.success) return throwStructuredOrSchemaError(payload, "roster");
  const data: CrewRosterResource = { members: result.data.data.members };
  return { data, meta: adaptMeta(result.data.meta) };
}

export function adaptCrewRequestsPayload(payload: unknown): CrewResourceSnapshot<"requests"> {
  const result = crewRequestsEnvelopeSchema.safeParse(payload);
  if (!result.success) return throwStructuredOrSchemaError(payload, "requests");
  const data: CrewRequestsResource = {
    requests: result.data.data.requests.map((item) => ({
      id: item.id,
      playerName: item.player_name,
      handle: item.handle,
      game: item.game,
      trust: item.trust,
      status: item.status,
    })),
  };
  return { data, meta: adaptMeta(result.data.meta) };
}

export function adaptCrewActivityPayload(payload: unknown): CrewResourceSnapshot<"activity"> {
  const result = crewActivityEnvelopeSchema.safeParse(payload);
  if (!result.success) return throwStructuredOrSchemaError(payload, "activity");
  const data: CrewActivityResource = {
    activity: result.data.data.activity.map((item) => ({
      id: item.id,
      title: item.title,
      game: item.game,
      occurredAtLabel: item.occurred_at_label,
      scoreLabel: item.score_label,
      tone: item.tone,
    })),
  };
  return { data, meta: adaptMeta(result.data.meta) };
}

export function adaptCrewRankingsPayload(payload: unknown): CrewResourceSnapshot<"rankings"> {
  const result = crewRankingsEnvelopeSchema.safeParse(payload);
  if (!result.success) return throwStructuredOrSchemaError(payload, "rankings");
  const stats = result.data.data.stats;
  const data: CrewRankingsResource = {
    stats: {
      rank: stats.rank,
      movement: stats.movement,
      points: stats.points,
      wins: stats.wins,
      losses: stats.losses,
      winRate: stats.win_rate,
      streak: stats.streak,
      trust: stats.trust,
      activeMembers: stats.active_members,
    },
  };
  return { data, meta: adaptMeta(result.data.meta) };
}

export function adaptCrewAchievementsPayload(
  payload: unknown,
): CrewResourceSnapshot<"achievements"> {
  const result = crewAchievementsEnvelopeSchema.safeParse(payload);
  if (!result.success) return throwStructuredOrSchemaError(payload, "achievements");
  const data: CrewAchievementsResource = { achievements: result.data.data.achievements };
  return { data, meta: adaptMeta(result.data.meta) };
}

export function adaptCrewSettingsPayload(payload: unknown): CrewResourceSnapshot<"settings"> {
  const result = crewSettingsEnvelopeSchema.safeParse(payload);
  if (!result.success) return throwStructuredOrSchemaError(payload, "settings");
  const settings = result.data.data.settings;
  const data: CrewSettingsResource = {
    settings: {
      recruiting: settings.recruiting,
      primaryGame: settings.primary_game,
      language: settings.language,
      minimumRank: settings.minimum_rank,
      communityLinkLabel: settings.community_link_label,
    },
  };
  return { data, meta: adaptMeta(result.data.meta) };
}
