// VERZUS M12.2 RAW SEARCH API SCHEMAS

import { z } from "zod";

const searchItemSchema = z.object({
  id: z.string().min(1),
  domain: z.enum(["players", "crews", "competitions", "matches"]),
  title: z.string().min(1),
  subtitle: z.string(),
  supporting_text: z.string(),
  meta: z.string(),
  badge: z.string(),
  href: z.string().min(1),
  image_src: z.string().nullable(),
  image_alt: z.string(),
  initials: z.string().min(1).max(4),
  tone: z.enum(["cyan", "green", "magenta", "gold"]),
  search_terms: z.array(z.string()),
});

const searchMetaSchema = z.object({
  request_id: z.string().min(1),
  fetched_at: z.string().datetime(),
  freshness: z.enum(["fresh", "stale"]),
  source: z.string().min(1),
  domain: z.enum(["players", "crews", "competitions", "matches"]),
  query: z.string(),
  total: z.number().int().nonnegative(),
});

export const searchResourceResponseSchema = z.object({
  data: z.object({
    items: z.array(searchItemSchema),
  }),
  meta: searchMetaSchema,
});

export const searchResourceErrorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    request_id: z.string().min(1),
    retryable: z.boolean(),
  }),
});

export type RawSearchResourceResponse = z.infer<typeof searchResourceResponseSchema>;
