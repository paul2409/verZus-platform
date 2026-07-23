import "server-only";

import { withDatabaseTransaction } from "@/lib/db";
import { serverEnv } from "@/lib/config/env.server";

import type { ProactiveRunSummary, ProactiveTriggerSource } from "../model";
import { buildProactiveReminders } from "./proactive-operations.policy";
import {
  acquireProactiveRunLock,
  beginProactiveRun,
  failProactiveRun,
  finishProactiveRun,
  readProactiveSignals,
  resolveCompletedProactiveReminders,
  upsertProactiveReminders,
} from "./proactive-operations.repository";

function safeErrorCode(error: unknown): string {
  if (error instanceof Error && /^[A-Z0-9_:-]{3,80}$/.test(error.message)) return error.message;
  return "PROACTIVE_OPERATIONS_FAILED";
}

export async function runProactiveOperations(input: {
  requestId: string;
  trigger: ProactiveTriggerSource;
  now?: Date;
}): Promise<ProactiveRunSummary> {
  const startedAt = input.now ?? new Date();
  const run = await beginProactiveRun({
    requestId: input.requestId,
    trigger: input.trigger,
    releaseSha: process.env.NEXT_PUBLIC_RELEASE_SHA || "local",
  });

  if (!serverEnv.proactiveOperationsEnabled) {
    const completedAt = new Date();
    await finishProactiveRun({
      runId: run.id,
      status: "disabled",
      candidateCount: 0,
      reminderCount: 0,
      createdCount: 0,
      updatedCount: 0,
      resolvedCount: 0,
      completedAt,
    });
    return {
      runId: run.id,
      requestId: input.requestId,
      status: "disabled",
      trigger: input.trigger,
      candidateCount: 0,
      reminderCount: 0,
      createdCount: 0,
      updatedCount: 0,
      resolvedCount: 0,
      startedAt: run.startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
    };
  }

  try {
    const result = await withDatabaseTransaction(async (client) => {
      const acquired = await acquireProactiveRunLock(client);
      if (!acquired) {
        return {
          status: "skipped" as const,
          candidateCount: 0,
          reminderCount: 0,
          createdCount: 0,
          updatedCount: 0,
          resolvedCount: 0,
        };
      }

      const signals = await readProactiveSignals(
        client,
        startedAt,
        serverEnv.proactiveOperationsBatchSize,
      );
      const reminders = buildProactiveReminders(signals, startedAt);
      const upsert = await upsertProactiveReminders(client, reminders, startedAt);
      const resolvedCount = await resolveCompletedProactiveReminders(client, startedAt);

      return {
        status: "completed" as const,
        candidateCount: signals.length,
        reminderCount: reminders.length,
        createdCount: upsert.createdCount,
        updatedCount: upsert.updatedCount,
        resolvedCount,
      };
    });

    const completedAt = new Date();
    await finishProactiveRun({
      runId: run.id,
      status: result.status,
      candidateCount: result.candidateCount,
      reminderCount: result.reminderCount,
      createdCount: result.createdCount,
      updatedCount: result.updatedCount,
      resolvedCount: result.resolvedCount,
      completedAt,
    });

    return {
      runId: run.id,
      requestId: input.requestId,
      status: result.status,
      trigger: input.trigger,
      candidateCount: result.candidateCount,
      reminderCount: result.reminderCount,
      createdCount: result.createdCount,
      updatedCount: result.updatedCount,
      resolvedCount: result.resolvedCount,
      startedAt: run.startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
    };
  } catch (error) {
    try {
      await failProactiveRun({
        runId: run.id,
        errorCode: safeErrorCode(error),
        completedAt: new Date(),
      });
    } catch (auditError) {
      console.error("Failed to persist proactive-operations failure state", auditError);
    }
    throw error;
  }
}
