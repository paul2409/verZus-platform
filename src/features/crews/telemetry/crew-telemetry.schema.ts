// VERZUS M9.8 CREW TELEMETRY SCHEMA

import { z } from "zod";

export const crewTelemetryEventNames = [
  "crew_surface_viewed",
  "crew_resource_failed",
  "crew_authority_failed",
  "crew_lifecycle_observed",
] as const;

export const crewTelemetrySchema = z.object({
  eventName: z.enum(crewTelemetryEventNames),
  surface: z.enum([
    "profile",
    "discovery",
    "no_crew",
    "creation",
    "resource",
    "membership",
    "governance",
    "lifecycle",
  ]),
  crewId: z
    .string()
    .regex(/^[a-z0-9][a-z0-9-]{1,95}$/i)
    .nullable()
    .default(null),
  resource: z
    .enum(["profile", "roster", "requests", "activity", "rankings", "achievements", "settings"])
    .nullable()
    .default(null),
  authority: z.enum(["membership", "governance", "lifecycle"]).nullable().default(null),
  state: z.string().max(64).nullable().default(null),
  requestId: z.string().max(120).nullable().default(null),
  route: z.string().startsWith("/crews").max(180),
  occurredAt: z.string().datetime(),
  releaseSha: z.string().max(120),
});

export type CrewTelemetryEvent = z.infer<typeof crewTelemetrySchema>;
