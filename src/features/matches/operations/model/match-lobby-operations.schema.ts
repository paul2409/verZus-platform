// VERZUS M7.5 LOBBY AND IN-PROGRESS DOMAIN SCHEMAS

import { z } from "zod";

import { matchClockSnapshotSchema } from "./match-resource.schema";
import { matchLobbyActions, matchLobbyIssueCategories } from "./match-lobby-operations.types";
import { matchOperationStates } from "./match-operations.types";

const participantSchema = z.object({
  participantId: z.string().min(1),
  checkedIn: z.boolean(),
  entered: z.boolean(),
  ready: z.boolean(),
});

const connectionSchema = z.object({
  lobbyCode: z.string().min(1),
  platform: z.string().min(1),
  serverRegion: z.string().min(1),
  joinMethod: z.string().min(1),
});

const issueSchema = z.object({
  issueId: z.string().min(1),
  category: z.enum(matchLobbyIssueCategories),
  summary: z.string().min(3).max(240),
  status: z.literal("open"),
  createdAt: z.string().datetime({ offset: true }),
});

export const matchLobbyOperationsSnapshotSchema = z.object({
  matchId: z.string().min(1),
  seedState: z.enum(matchOperationStates),
  state: z.enum(matchOperationStates),
  matchVersion: z.number().int().positive(),
  currentUser: participantSchema,
  opponent: participantSchema,
  connection: connectionSchema,
  actionEventCount: z.number().int().nonnegative(),
  issueCount: z.number().int().nonnegative(),
  lastIssue: issueSchema.nullable(),
  lastEventId: z.string().min(1).nullable(),
  lastUpdatedAt: z.string().datetime({ offset: true }),
  clock: matchClockSnapshotSchema,
});

export const matchLobbyResultSchema = z.object({
  outcome: z.enum([
    "lobby_entered",
    "ready_confirmed",
    "match_started",
    "issue_reported",
    "already_applied",
  ]),
  snapshot: matchLobbyOperationsSnapshotSchema,
  event: z.object({
    eventId: z.string().min(1).nullable(),
    action: z.enum(matchLobbyActions),
    createdAt: z.string().datetime({ offset: true }),
    replayed: z.boolean(),
  }),
});
