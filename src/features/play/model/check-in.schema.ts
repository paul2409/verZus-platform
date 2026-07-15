// VERZUS M5 STEPS 5.9-5.13

import { z } from "zod";

export const playCheckInCommandSchema = z.object({
  matchId: z.string().min(1),
  mutationKey: z.string().min(1),
  idempotencyKey: z.string().uuid(),
});

export type PlayCheckInCommand = z.infer<typeof playCheckInCommandSchema>;

export const playCheckInResultSchema = z.object({
  matchId: z.string().min(1),
  state: z.literal("checked_in"),
  checkedInAt: z.string().datetime({ offset: true }),
  idempotencyKey: z.string().uuid(),
  duplicate: z.boolean(),
  requestId: z.string().min(1),
});

export type PlayCheckInResult = z.infer<typeof playCheckInResultSchema>;
