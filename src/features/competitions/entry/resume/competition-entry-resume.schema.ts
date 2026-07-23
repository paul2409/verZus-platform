import { z } from "zod";

export const competitionEntryResumePayloadSchema = z
  .object({
    accepted: z.boolean(),
  })
  .strict();

export const competitionEntryResumeRequestSchema = z
  .object({
    current_step: z.literal("confirm"),
    payload: competitionEntryResumePayloadSchema,
  })
  .strict();

export type CompetitionEntryResumePayload = z.infer<typeof competitionEntryResumePayloadSchema>;
