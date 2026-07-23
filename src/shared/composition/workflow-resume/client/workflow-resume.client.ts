import { z } from "zod";

import type {
  SaveWorkflowResumeInput,
  WorkflowResumeCheckpoint,
  WorkflowResumeType,
} from "@/lib/workflow-resume";

const checkpointSchema = z.object({
  workflowType: z.enum(["crew_creation", "competition_entry", "match_result"]),
  workflowKey: z.string().min(1),
  currentStep: z.string().min(1),
  resumePath: z.string().startsWith("/"),
  title: z.string().min(1),
  summary: z.string().min(1),
  payload: z.unknown(),
  version: z.number().int().positive(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
});

const checkpointResponseSchema = z.object({
  data: checkpointSchema.nullable(),
  meta: z.object({ request_id: z.string().min(1) }),
});

const deleteResponseSchema = z.object({
  data: z.object({ deleted: z.boolean() }),
  meta: z.object({ request_id: z.string().min(1) }),
});

export class WorkflowResumeClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly retryable: boolean,
    readonly requestId: string | null,
  ) {
    super(message);
    this.name = "WorkflowResumeClientError";
  }
}

function endpoint(type: WorkflowResumeType, key: string): string {
  return `/api/workflow-resume/${encodeURIComponent(type)}/${encodeURIComponent(key)}`;
}

async function decodeError(response: Response): Promise<WorkflowResumeClientError> {
  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    // Preserve the stable fallback below.
  }
  const error =
    typeof payload === "object" && payload && "error" in payload
      ? (
          payload as {
            error?: { message?: unknown; retryable?: unknown; request_id?: unknown };
          }
        ).error
      : undefined;
  return new WorkflowResumeClientError(
    typeof error?.message === "string" ? error.message : "The saved workflow is unavailable.",
    response.status,
    typeof error?.retryable === "boolean" ? error.retryable : response.status >= 500,
    typeof error?.request_id === "string" ? error.request_id : null,
  );
}

export async function readWorkflowResume<TPayload>(
  type: WorkflowResumeType,
  key: string,
  payloadSchema: z.ZodType<TPayload>,
): Promise<WorkflowResumeCheckpoint<TPayload> | null> {
  const response = await fetch(endpoint(type, key), {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
    headers: { accept: "application/json" },
  });
  if (!response.ok) throw await decodeError(response);
  const parsed = checkpointResponseSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new WorkflowResumeClientError("The saved workflow response is invalid.", 502, true, null);
  }
  if (!parsed.data.data) return null;
  const payload = payloadSchema.safeParse(parsed.data.data.payload);
  if (!payload.success) {
    throw new WorkflowResumeClientError("The saved workflow payload is invalid.", 502, true, null);
  }
  return { ...parsed.data.data, payload: payload.data };
}

export async function saveWorkflowResume<TPayload>(
  type: WorkflowResumeType,
  key: string,
  input: SaveWorkflowResumeInput<TPayload>,
  payloadSchema: z.ZodType<TPayload>,
): Promise<WorkflowResumeCheckpoint<TPayload>> {
  const payload = payloadSchema.parse(input.payload);
  const response = await fetch(endpoint(type, key), {
    method: "PUT",
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-request-id": `resume-${globalThis.crypto.randomUUID()}`,
    },
    body: JSON.stringify({ current_step: input.currentStep, payload }),
  });
  if (!response.ok) throw await decodeError(response);
  const parsed = checkpointResponseSchema.safeParse(await response.json());
  if (!parsed.success || !parsed.data.data) {
    throw new WorkflowResumeClientError("The saved workflow response is invalid.", 502, true, null);
  }
  const adaptedPayload = payloadSchema.safeParse(parsed.data.data.payload);
  if (!adaptedPayload.success) {
    throw new WorkflowResumeClientError("The saved workflow payload is invalid.", 502, true, null);
  }
  return { ...parsed.data.data, payload: adaptedPayload.data };
}

export async function clearWorkflowResume(type: WorkflowResumeType, key: string): Promise<boolean> {
  const response = await fetch(endpoint(type, key), {
    method: "DELETE",
    credentials: "same-origin",
    cache: "no-store",
    headers: { accept: "application/json" },
  });
  if (!response.ok) throw await decodeError(response);
  const parsed = deleteResponseSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new WorkflowResumeClientError("The workflow clear response is invalid.", 502, true, null);
  }
  return parsed.data.data.deleted;
}
