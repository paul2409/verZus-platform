// VERZUS M7.7 TERMINAL OPERATIONS API ADAPTER

import type {
  MatchTerminalAuditEvent,
  MatchTerminalMutationResult,
  MatchTerminalSnapshot,
} from "../model/match-terminal-operations.types";
import {
  matchTerminalMutationEnvelopeRawSchema,
  matchTerminalReadEnvelopeRawSchema,
  matchTerminalSnapshotRawSchema,
} from "./match-terminal-api.schema";

export function adaptMatchTerminalSnapshot(payload: unknown): MatchTerminalSnapshot {
  const parsed = matchTerminalSnapshotRawSchema.parse(payload);
  return {
    matchId: parsed.match_id,
    seedState: parsed.seed_state,
    state: parsed.state,
    matchVersion: parsed.match_version,
    terminalReason: parsed.terminal_reason,
    terminalAt: parsed.terminal_at,
    actorRole: parsed.actor_role,
    auditEventId: parsed.audit_event_id,
    terminalEventCount: parsed.terminal_event_count,
    lastUpdatedAt: parsed.last_updated_at,
    clock: parsed.clock,
  };
}

export function adaptMatchTerminalRead(payload: unknown): MatchTerminalSnapshot {
  const parsed = matchTerminalReadEnvelopeRawSchema.parse(payload);
  return adaptMatchTerminalSnapshot(parsed.data);
}

export function adaptMatchTerminalMutation(payload: unknown): MatchTerminalMutationResult {
  const parsed = matchTerminalMutationEnvelopeRawSchema.parse(payload);
  const event: MatchTerminalAuditEvent = {
    auditEventId: parsed.data.event.audit_event_id,
    action: parsed.data.event.action,
    actorRole: parsed.data.event.actor_role,
    reason: parsed.data.event.reason,
    previousState: parsed.data.event.previous_state,
    nextState: parsed.data.event.next_state,
    previousVersion: parsed.data.event.previous_version,
    nextVersion: parsed.data.event.next_version,
    createdAt: parsed.data.event.created_at,
    replayed: parsed.data.event.replayed,
  };
  return {
    outcome: parsed.data.outcome,
    snapshot: adaptMatchTerminalSnapshot(parsed.data.snapshot),
    event,
  };
}
