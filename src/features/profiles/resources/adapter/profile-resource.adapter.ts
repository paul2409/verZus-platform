// VERZUS M11.4 PROFILE RESOURCE ADAPTERS

import { ZodError } from "zod";

import type { ProfileResourceMeta, ProfileResourceSnapshot } from "../model/profile-resource.types";
import {
  profileAvailabilityResponseSchema,
  profileCompetitiveSummaryResponseSchema,
  profileCrewResponseSchema,
  profileIdentityResponseSchema,
  profileResourceErrorEnvelopeSchema,
} from "../schema/profile-resource.schema";

export class ProfileResourceError extends Error {
  readonly code: string;
  readonly requestId: string;
  readonly retryable: boolean;
  readonly status: number | null;

  constructor(input: {
    code: string;
    message: string;
    requestId: string;
    retryable: boolean;
    status?: number | null;
  }) {
    super(input.message);
    this.name = "ProfileResourceError";
    this.code = input.code;
    this.requestId = input.requestId;
    this.retryable = input.retryable;
    this.status = input.status ?? null;
  }
}

function meta(raw: {
  request_id: string;
  fetched_at: string;
  freshness: "fresh" | "stale";
  source: string;
  version: number;
}): ProfileResourceMeta {
  return {
    requestId: raw.request_id,
    fetchedAt: raw.fetched_at,
    freshness: raw.freshness,
    source: raw.source,
    version: raw.version,
  };
}

function schemaError(resource: string, error: ZodError): ProfileResourceError {
  return new ProfileResourceError({
    code: "PROFILE_RESOURCE_SCHEMA_INVALID",
    message: `${resource} returned data that failed schema validation (${error.issues.length} issue${error.issues.length === 1 ? "" : "s"}).`,
    requestId: `profile-${resource}-schema-invalid`,
    retryable: true,
  });
}

export function adaptProfileIdentityPayload(payload: unknown): ProfileResourceSnapshot<"identity"> {
  try {
    const parsed = profileIdentityResponseSchema.parse(payload);
    return {
      name: "identity",
      data: {
        id: parsed.data.id,
        displayName: parsed.data.display_name,
        handle: parsed.data.handle,
        title: parsed.data.title,
        bio: parsed.data.bio,
        locationLabel: parsed.data.location_label,
        countryCode: parsed.data.country_code,
        avatarSrc: parsed.data.avatar_src,
        avatarAlt: parsed.data.avatar_alt,
        bannerSrc: parsed.data.banner_src,
        verified: parsed.data.verified,
        profileVisibility: parsed.data.profile_visibility,
        joinedLabel: parsed.data.joined_label,
      },
      meta: meta(parsed.meta),
    };
  } catch (error) {
    if (error instanceof ZodError) throw schemaError("identity", error);
    throw error;
  }
}

export function adaptProfileCompetitiveSummaryPayload(
  payload: unknown,
): ProfileResourceSnapshot<"competitive-summary"> {
  try {
    const parsed = profileCompetitiveSummaryResponseSchema.parse(payload);
    return {
      name: "competitive-summary",
      data: {
        matches: parsed.data.matches,
        wins: parsed.data.wins,
        losses: parsed.data.losses,
        draws: parsed.data.draws,
        winRateLabel: parsed.data.win_rate_label,
        rating: parsed.data.rating,
        weeklyRank: parsed.data.weekly_rank,
        points: parsed.data.points,
        trustScore: parsed.data.trust_score,
        currentStreakLabel: parsed.data.current_streak_label,
      },
      meta: meta(parsed.meta),
    };
  } catch (error) {
    if (error instanceof ZodError) throw schemaError("competitive-summary", error);
    throw error;
  }
}

export function adaptProfileCrewPayload(payload: unknown): ProfileResourceSnapshot<"crew"> {
  try {
    const parsed = profileCrewResponseSchema.parse(payload);
    return {
      name: "crew",
      data: parsed.data.crew
        ? {
            id: parsed.data.crew.id,
            name: parsed.data.crew.name,
            tag: parsed.data.crew.tag,
            roleLabel: parsed.data.crew.role_label,
            href: parsed.data.crew.href,
          }
        : null,
      meta: meta(parsed.meta),
    };
  } catch (error) {
    if (error instanceof ZodError) throw schemaError("crew", error);
    throw error;
  }
}

export function adaptProfileAvailabilityPayload(
  payload: unknown,
): ProfileResourceSnapshot<"availability"> {
  try {
    const parsed = profileAvailabilityResponseSchema.parse(payload);
    return {
      name: "availability",
      data: {
        state: parsed.data.state,
        label: parsed.data.label,
        detail: parsed.data.detail,
        nextWindowLabel: parsed.data.next_window_label,
      },
      meta: meta(parsed.meta),
    };
  } catch (error) {
    if (error instanceof ZodError) throw schemaError("availability", error);
    throw error;
  }
}

export function adaptProfileResourceError(payload: unknown, status: number): ProfileResourceError {
  const parsed = profileResourceErrorEnvelopeSchema.safeParse(payload);
  if (!parsed.success) {
    return new ProfileResourceError({
      code: "PROFILE_RESOURCE_HTTP_ERROR",
      message: "The profile resource could not be loaded.",
      requestId: `profile-http-${status}`,
      retryable: status >= 500,
      status,
    });
  }

  return new ProfileResourceError({
    code: parsed.data.error.code,
    message: parsed.data.error.message,
    requestId: parsed.data.error.request_id,
    retryable: parsed.data.error.retryable,
    status,
  });
}
