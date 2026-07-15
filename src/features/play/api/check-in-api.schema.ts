// VERZUS M5 STEPS 5.9-5.13

import { z } from "zod";

import { playApiFailureSchema } from "./play-api.schema";

export const playCheckInCommandRawSchema = z.object({
  match_id: z.string().min(1),
  mutation_key: z.string().min(1),
  idempotency_key: z.string().uuid(),
});

export const playCheckInResultRawSchema = z.object({
  match_id: z.string().min(1),
  state: z.literal("checked_in"),
  checked_in_at: z.string().datetime({ offset: true }),
  idempotency_key: z.string().uuid(),
  duplicate: z.boolean(),
});

const playCheckInSuccessSchema = z.object({
  ok: z.literal(true),
  data: playCheckInResultRawSchema,
  request_id: z.string().min(1),
});

export const playCheckInResponseSchema = z.discriminatedUnion("ok", [
  playCheckInSuccessSchema,
  playApiFailureSchema,
]);
