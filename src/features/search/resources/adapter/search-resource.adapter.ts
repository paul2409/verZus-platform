// VERZUS M12.2 SEARCH RESOURCE ADAPTERS

import type { SearchResourceSnapshot } from "../model/search-resource.types";
import {
  searchResourceErrorEnvelopeSchema,
  searchResourceResponseSchema,
} from "../schema/search-resource.schema";

export class SearchResourceError extends Error {
  readonly code: string;
  readonly requestId: string;
  readonly retryable: boolean;
  readonly status: number | undefined;

  constructor(input: {
    code: string;
    message: string;
    requestId: string;
    retryable: boolean;
    status?: number;
  }) {
    super(input.message);
    this.name = "SearchResourceError";
    this.code = input.code;
    this.requestId = input.requestId;
    this.retryable = input.retryable;
    this.status = input.status;
  }
}

export function adaptSearchResourcePayload(payload: unknown): SearchResourceSnapshot {
  const parsed = searchResourceResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new SearchResourceError({
      code: "SEARCH_RESOURCE_SCHEMA_INVALID",
      message: "Search returned a malformed response.",
      requestId: "search-schema-invalid",
      retryable: true,
    });
  }

  return {
    items: parsed.data.data.items.map((item) => ({
      id: item.id,
      domain: item.domain,
      title: item.title,
      subtitle: item.subtitle,
      supportingText: item.supporting_text,
      meta: item.meta,
      badge: item.badge,
      href: item.href,
      imageSrc: item.image_src,
      imageAlt: item.image_alt,
      initials: item.initials,
      tone: item.tone,
      searchTerms: item.search_terms,
    })),
    meta: {
      requestId: parsed.data.meta.request_id,
      fetchedAt: parsed.data.meta.fetched_at,
      freshness: parsed.data.meta.freshness,
      source: parsed.data.meta.source,
      domain: parsed.data.meta.domain,
      query: parsed.data.meta.query,
      total: parsed.data.meta.total,
    },
  };
}

export function adaptSearchResourceError(payload: unknown, status: number): SearchResourceError {
  const parsed = searchResourceErrorEnvelopeSchema.safeParse(payload);
  if (parsed.success) {
    return new SearchResourceError({
      code: parsed.data.error.code,
      message: parsed.data.error.message,
      requestId: parsed.data.error.request_id,
      retryable: parsed.data.error.retryable,
      status,
    });
  }

  return new SearchResourceError({
    code: "SEARCH_RESOURCE_UNKNOWN",
    message: "Search is temporarily unavailable.",
    requestId: `search-unknown-${status}`,
    retryable: status >= 500,
    status,
  });
}
