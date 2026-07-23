import { z } from "zod";

export const crewCreationResumeStepSchema = z.enum(["basics", "identity", "settings", "review"]);

export const crewCreationResumePayloadSchema = z
  .object({
    version: z.literal(1),
    submissionId: z.string().min(16).max(128),
    name: z.string().max(30),
    tag: z.string().max(5),
    description: z.string().max(240),
    primaryGame: z.enum(["EA FC", "COD Mobile", "Clash Royale", "League of Legends"]),
    region: z.enum(["Nigeria", "West Africa", "Global"]),
    crestPreset: z.enum(["neon-v", "orbit", "strike"]),
    bannerPreset: z.enum(["neon-grid", "cosmic", "stadium"]),
    visibility: z.enum(["public", "private"]),
    recruiting: z.boolean(),
    language: z.enum(["English", "French", "Portuguese"]),
    minimumRank: z.enum(["Open", "Gold", "Platinum", "Diamond", "Elite"]),
  })
  .strict();

export const crewCreationResumeRequestSchema = z
  .object({
    current_step: crewCreationResumeStepSchema,
    payload: crewCreationResumePayloadSchema,
  })
  .strict();

export type CrewCreationResumePayload = z.infer<typeof crewCreationResumePayloadSchema>;
