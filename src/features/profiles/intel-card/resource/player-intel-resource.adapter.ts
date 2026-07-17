// VERZUS M8.9 PLAYER INTEL RESOURCE ADAPTER

import type { PlayerIntelViewModel } from "../player-intel.types";
import {
  playerIntelEnvelopeSchema,
  playerIntelErrorEnvelopeSchema,
  type PlayerIntelEnvelopeRaw,
} from "./player-intel-resource.schema";

export type PlayerIntelResource = {
  model: PlayerIntelViewModel;
  requestId: string;
  fetchedAt: string;
  freshness: "fresh" | "stale" | "partial";
};

export class PlayerIntelResourceError extends Error {
  readonly code: string;
  readonly requestId: string;
  readonly retryable: boolean;

  constructor(input: { code: string; message: string; requestId: string; retryable: boolean }) {
    super(input.message);
    this.name = "PlayerIntelResourceError";
    this.code = input.code;
    this.requestId = input.requestId;
    this.retryable = input.retryable;
  }
}

function mapEnvelope(envelope: PlayerIntelEnvelopeRaw): PlayerIntelResource {
  return {
    model: {
      id: envelope.data.id,
      displayName: envelope.data.display_name,
      handle: envelope.data.handle,
      subtitle: envelope.data.subtitle,
      locationLabel: envelope.data.location_label,
      gameLabel: envelope.data.game_label,
      crewName: envelope.data.crew_name,
      avatarSrc: envelope.data.avatar_src,
      rank: envelope.data.rank,
      trust: envelope.data.trust,
      verified: envelope.data.verified,
      wins: envelope.data.wins,
      winRateLabel: envelope.data.win_rate_label,
      pointsLabel: envelope.data.points_label,
      streakLabel: envelope.data.streak_label,
      recentForm: envelope.data.recent_form,
      recentMatches: envelope.data.recent_matches.map((item) => ({
        id: item.id,
        opponentLabel: item.opponent_label,
        result: item.result,
        scoreLabel: item.score_label,
        href: item.href,
      })),
      achievementPreview: envelope.data.achievement_preview,
      profileHref: envelope.data.profile_href,
      challengeHref: envelope.data.challenge_href,
    },
    requestId: envelope.meta.request_id,
    fetchedAt: envelope.meta.fetched_at,
    freshness: envelope.meta.freshness,
  };
}

export function adaptPlayerIntelPayload(payload: unknown): PlayerIntelResource {
  const success = playerIntelEnvelopeSchema.safeParse(payload);
  if (success.success) return mapEnvelope(success.data);

  const failure = playerIntelErrorEnvelopeSchema.safeParse(payload);
  if (failure.success) {
    throw new PlayerIntelResourceError({
      code: failure.data.error.code,
      message: failure.data.error.message,
      requestId: failure.data.error.request_id,
      retryable: failure.data.error.retryable,
    });
  }

  throw new PlayerIntelResourceError({
    code: "PLAYER_INTEL_SCHEMA_INVALID",
    message: "Player intel failed schema validation.",
    requestId: "player-intel-schema-invalid",
    retryable: true,
  });
}
