import { NextResponse } from "next/server";

import { getServerRuntimeSession } from "@/lib/session/runtime-session.server";

import type { SmartDefaultsSnapshot, SmartPreferencePatch } from "../model";
import { smartPreferencePatchSchema, type SmartPreferencePatchRequest } from "../schema";
import { readSmartDefaultsSources, writeSmartPreferences } from "./smart-defaults.repository";
import { buildSmartDefaultsSnapshot } from "./smart-defaults.service";

function requestId(): string {
  return `smart-defaults-${crypto.randomUUID()}`;
}

function unauthorized(id: string): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: "SMART_DEFAULTS_UNAUTHORIZED",
        message: "Sign in again to load your saved defaults.",
        request_id: id,
        retryable: false,
      },
    },
    { status: 401, headers: { "cache-control": "no-store", "x-request-id": id } },
  );
}

function serialize(snapshot: SmartDefaultsSnapshot, id: string): NextResponse {
  return NextResponse.json(
    {
      data: {
        version: snapshot.version,
        identity: snapshot.identity
          ? {
              game_id: snapshot.identity.gameId,
              game_name: snapshot.identity.gameName,
              game_filter: snapshot.identity.gameFilter,
              platform: snapshot.identity.platform,
              platform_handle: snapshot.identity.platformHandle,
            }
          : null,
        location: snapshot.location
          ? {
              country_code: snapshot.location.countryCode,
              region: snapshot.location.region,
              city: snapshot.location.city,
              timezone: snapshot.location.timezone,
            }
          : null,
        availability: snapshot.availability.map((slot) => ({
          day: slot.day,
          start_time: slot.startTime,
          end_time: slot.endTime,
          timezone: slot.timezone,
        })),
        competition: snapshot.competition,
        leaderboard: snapshot.leaderboard,
        search: snapshot.search,
        crew_creation: snapshot.crewCreation
          ? {
              primary_game: snapshot.crewCreation.primaryGame,
              region: snapshot.crewCreation.region,
            }
          : null,
        sources: {
          competition_game: snapshot.sources.competitionGame,
          competition_sort: snapshot.sources.competitionSort,
          leaderboard_mode: snapshot.sources.leaderboardMode,
          leaderboard_game: snapshot.sources.leaderboardGame,
          search_domain: snapshot.sources.searchDomain,
          crew_creation: snapshot.sources.crewCreation,
        },
        generated_at: snapshot.generatedAt,
      },
      meta: { request_id: id, fetched_at: snapshot.generatedAt },
    },
    { headers: { "cache-control": "private, no-store", "x-request-id": id } },
  );
}

function patchFromRequest(value: SmartPreferencePatchRequest): SmartPreferencePatch {
  return {
    competitionGame: value.competition_game,
    competitionSort: value.competition_sort,
    leaderboardMode: value.leaderboard_mode,
    leaderboardGame: value.leaderboard_game,
    searchDomain: value.search_domain,
  };
}

export async function handleSmartDefaultsGet(): Promise<NextResponse> {
  const id = requestId();
  const session = await getServerRuntimeSession();
  if (session.state !== "authenticated" || !session.user) return unauthorized(id);

  try {
    return serialize(
      buildSmartDefaultsSnapshot(await readSmartDefaultsSources(session.user.id)),
      id,
    );
  } catch (error) {
    console.error("Smart defaults read failed", error);
    return NextResponse.json(
      {
        error: {
          code: "SMART_DEFAULTS_UNAVAILABLE",
          message: "Your saved defaults are temporarily unavailable.",
          request_id: id,
          retryable: true,
        },
      },
      { status: 503, headers: { "cache-control": "no-store", "x-request-id": id } },
    );
  }
}

export async function handleSmartDefaultsPatch(request: Request): Promise<NextResponse> {
  const id = requestId();
  const session = await getServerRuntimeSession();
  if (session.state !== "authenticated" || !session.user) return unauthorized(id);

  try {
    const parsed = smartPreferencePatchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "SMART_DEFAULTS_INVALID",
            message: "One or more saved defaults are invalid.",
            request_id: id,
            retryable: false,
            field_errors: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400, headers: { "cache-control": "no-store", "x-request-id": id } },
      );
    }

    await writeSmartPreferences(session.user.id, patchFromRequest(parsed.data));
    return serialize(
      buildSmartDefaultsSnapshot(await readSmartDefaultsSources(session.user.id)),
      id,
    );
  } catch (error) {
    console.error("Smart defaults update failed", error);
    return NextResponse.json(
      {
        error: {
          code: "SMART_DEFAULTS_UPDATE_FAILED",
          message: "Your default could not be saved. Your current screen remains usable.",
          request_id: id,
          retryable: true,
        },
      },
      { status: 503, headers: { "cache-control": "no-store", "x-request-id": id } },
    );
  }
}
