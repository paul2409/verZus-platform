export const workflowResumeTypes = ["crew_creation", "competition_entry", "match_result"] as const;

export type WorkflowResumeType = (typeof workflowResumeTypes)[number];

export interface WorkflowResumeCheckpoint<TPayload = unknown> {
  workflowType: WorkflowResumeType;
  workflowKey: string;
  currentStep: string;
  resumePath: string;
  title: string;
  summary: string;
  payload: TPayload;
  version: number;
  updatedAt: string;
  expiresAt: string;
}

export interface SaveWorkflowResumeInput<TPayload> {
  currentStep: string;
  payload: TPayload;
}
