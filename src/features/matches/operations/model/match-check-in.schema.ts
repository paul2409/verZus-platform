// VERZUS M7.4 CHECK-IN DOMAIN SCHEMAS

import { z } from "zod";

import { matchClockSnapshotSchema } from "./match-resource.schema";
import { matchOperationStates } from "./match-operations.types";

export const matchCheckInParticipantStatusSchema = z.object({
  participantId: z.string().min(1),
  checkedIn: z.boolean(),
  ready: z.boolean(),
});

export const matchCheckInSnapshotSchema = z.object({
  matchId: z.string().min(1),
  seedState: z.enum(matchOperationStates),
  state: z.enum(matchOperationStates),
  matchVersion: z.number().int().positive(),
  currentUser: matchCheckInParticipantStatusSchema,
  opponent: matchCheckInParticipantStatusSchema,
  checkInEventCount: z.number().int().nonnegative(),
  lastEventId: z.string().min(1).nullable(),
  lastUpdatedAt: z.string().datetime({ offset: true }),
  clock: matchClockSnapshotSchema,
});

export const matchCheckInResultSchema = z.object({
  outcome: z.enum(["checked_in", "both_ready", "already_checked_in"]),
  snapshot: matchCheckInSnapshotSchema,
  event: z.object({
    eventId: z.string().min(1).nullable(),
    createdAt: z.string().datetime({ offset: true }),
    replayed: z.boolean(),
  }),
});
