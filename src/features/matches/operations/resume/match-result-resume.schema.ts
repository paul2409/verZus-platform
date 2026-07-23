import { z } from "zod";

export const matchResultResumePayloadSchema = z
  .object({
    homeScore: z.number().int().min(0).max(99),
    awayScore: z.number().int().min(0).max(99),
    note: z.string().max(500),
  })
  .strict();

export const matchResultResumeRequestSchema = z
  .object({
    current_step: z.literal("score"),
    payload: matchResultResumePayloadSchema,
  })
  .strict();

export type MatchResultResumePayload = z.infer<typeof matchResultResumePayloadSchema>;
