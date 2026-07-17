// VERZUS M8.9 MATCH INTEL RESOURCE ADAPTER

import type { MatchIntelViewModel } from "../match-intel.types";
import {
  matchIntelEnvelopeSchema,
  matchIntelErrorEnvelopeSchema,
} from "./match-intel-resource.schema";

export type MatchIntelResource = {
  model: MatchIntelViewModel;
  requestId: string;
  fetchedAt: string;
  freshness: "fresh" | "stale" | "partial";
};

export class MatchIntelResourceError extends Error {
  readonly code: string;
  readonly requestId: string;
  readonly retryable: boolean;

  constructor(input: { code: string; message: string; requestId: string; retryable: boolean }) {
    super(input.message);
    this.name = "MatchIntelResourceError";
    this.code = input.code;
    this.requestId = input.requestId;
    this.retryable = input.retryable;
  }
}

export function adaptMatchIntelPayload(payload: unknown): MatchIntelResource {
  const success = matchIntelEnvelopeSchema.safeParse(payload);
  if (success.success) {
    const { data, meta } = success.data;
    return {
      model: {
        id: data.id,
        weekLabel: data.week_label,
        statusLabel: data.status_label,
        countdownLabel: data.countdown_label,
        startsAtLabel: data.starts_at_label,
        gameLabel: data.game_label,
        formatLabel: data.format_label,
        home: {
          name: data.home.name,
          tag: data.home.tag,
          sideLabel: data.home.side_label,
          emblemSrc: data.home.emblem_src,
        },
        away: {
          name: data.away.name,
          tag: data.away.tag,
          sideLabel: data.away.side_label,
          emblemSrc: data.away.emblem_src,
        },
        prizePoolLabel: data.prize_pool_label,
        stakesLabel: data.stakes_label,
        checkInClosesLabel: data.check_in_closes_label,
        scoreLabel: data.score_label,
        competitionLabel: data.competition_label,
        roundLabel: data.round_label,
        resultConfirmationLabel: data.result_confirmation_label,
        disputeLabel: data.dispute_label,
        matchHref: data.match_href,
        checkInHref: data.check_in_href,
      },
      requestId: meta.request_id,
      fetchedAt: meta.fetched_at,
      freshness: meta.freshness,
    };
  }

  const failure = matchIntelErrorEnvelopeSchema.safeParse(payload);
  if (failure.success) {
    throw new MatchIntelResourceError({
      code: failure.data.error.code,
      message: failure.data.error.message,
      requestId: failure.data.error.request_id,
      retryable: failure.data.error.retryable,
    });
  }

  throw new MatchIntelResourceError({
    code: "MATCH_INTEL_SCHEMA_INVALID",
    message: "Match intel failed schema validation.",
    requestId: "match-intel-schema-invalid",
    retryable: true,
  });
}
