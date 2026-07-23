import "server-only";

import type { QueryResultRow } from "pg";

import { queryDatabase } from "@/lib/db";
import type { WorkflowResumeCheckpoint, WorkflowResumeType } from "@/lib/workflow-resume";

export type WorkflowResumeRow = QueryResultRow & {
  workflow_type: WorkflowResumeType;
  workflow_key: string;
  current_step: string;
  resume_path: string;
  title: string;
  summary: string;
  draft_payload: Record<string, unknown>;
  version: number;
  updated_at: Date;
  expires_at: Date;
};

function adapt(row: WorkflowResumeRow): WorkflowResumeCheckpoint<Record<string, unknown>> {
  return {
    workflowType: row.workflow_type,
    workflowKey: row.workflow_key,
    currentStep: row.current_step,
    resumePath: row.resume_path,
    title: row.title,
    summary: row.summary,
    payload: row.draft_payload,
    version: row.version,
    updatedAt: row.updated_at.toISOString(),
    expiresAt: row.expires_at.toISOString(),
  };
}

export async function readWorkflowResumeCheckpoint(input: {
  userId: string;
  workflowType: WorkflowResumeType;
  workflowKey: string;
}): Promise<WorkflowResumeCheckpoint<Record<string, unknown>> | null> {
  const result = await queryDatabase<WorkflowResumeRow>(
    `SELECT workflow_type, workflow_key, current_step, resume_path, title, summary,
            draft_payload, version, updated_at, expires_at
       FROM workflow_resume_checkpoints
      WHERE user_id = $1::uuid
        AND workflow_type = $2
        AND workflow_key = $3
        AND expires_at > now()
      LIMIT 1`,
    [input.userId, input.workflowType, input.workflowKey],
  );
  return result.rows[0] ? adapt(result.rows[0]) : null;
}

export async function saveWorkflowResumeCheckpoint(input: {
  userId: string;
  workflowType: WorkflowResumeType;
  workflowKey: string;
  currentStep: string;
  resumePath: string;
  title: string;
  summary: string;
  payload: Record<string, unknown>;
  expiresAt: Date;
}): Promise<WorkflowResumeCheckpoint<Record<string, unknown>>> {
  const result = await queryDatabase<WorkflowResumeRow>(
    `INSERT INTO workflow_resume_checkpoints (
       user_id, workflow_type, workflow_key, current_step, resume_path,
       title, summary, draft_payload, expires_at
     ) VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)
     ON CONFLICT (user_id, workflow_type, workflow_key)
     DO UPDATE SET
       current_step = EXCLUDED.current_step,
       resume_path = EXCLUDED.resume_path,
       title = EXCLUDED.title,
       summary = EXCLUDED.summary,
       draft_payload = EXCLUDED.draft_payload,
       expires_at = EXCLUDED.expires_at,
       version = CASE
         WHEN workflow_resume_checkpoints.current_step IS DISTINCT FROM EXCLUDED.current_step
           OR workflow_resume_checkpoints.draft_payload IS DISTINCT FROM EXCLUDED.draft_payload
         THEN workflow_resume_checkpoints.version + 1
         ELSE workflow_resume_checkpoints.version
       END,
       updated_at = CASE
         WHEN workflow_resume_checkpoints.current_step IS DISTINCT FROM EXCLUDED.current_step
           OR workflow_resume_checkpoints.draft_payload IS DISTINCT FROM EXCLUDED.draft_payload
         THEN now()
         ELSE workflow_resume_checkpoints.updated_at
       END
     RETURNING workflow_type, workflow_key, current_step, resume_path, title, summary,
               draft_payload, version, updated_at, expires_at`,
    [
      input.userId,
      input.workflowType,
      input.workflowKey,
      input.currentStep,
      input.resumePath,
      input.title,
      input.summary,
      JSON.stringify(input.payload),
      input.expiresAt,
    ],
  );
  return adapt(result.rows[0]!);
}

export async function deleteWorkflowResumeCheckpoint(input: {
  userId: string;
  workflowType: WorkflowResumeType;
  workflowKey: string;
}): Promise<boolean> {
  const result = await queryDatabase(
    `DELETE FROM workflow_resume_checkpoints
      WHERE user_id = $1::uuid AND workflow_type = $2 AND workflow_key = $3`,
    [input.userId, input.workflowType, input.workflowKey],
  );
  return (result.rowCount ?? 0) > 0;
}
