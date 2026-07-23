import "server-only";

import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getServerRuntimeSession } from "@/lib/session/runtime-session.server";
import { workflowResumeTypes, type WorkflowResumeType } from "@/lib/workflow-resume";

import {
  resolveWorkflowResumePolicy,
  WorkflowResumeValidationError,
} from "./workflow-resume.policy";
import {
  deleteWorkflowResumeCheckpoint,
  readWorkflowResumeCheckpoint,
  saveWorkflowResumeCheckpoint,
} from "./workflow-resume.repository";

const headers = (requestId: string) => ({
  "cache-control": "private, no-store",
  "x-request-id": requestId,
});

async function authenticatedUserId(): Promise<string> {
  const session = await getServerRuntimeSession();
  if (session.state !== "authenticated" || !session.user) {
    throw Object.assign(new Error("Sign in again to continue this workflow."), {
      status: 401,
      code: "WORKFLOW_RESUME_UNAUTHORIZED",
      retryable: false,
    });
  }
  return session.user.id;
}

function parseType(value: string): WorkflowResumeType {
  if (!workflowResumeTypes.includes(value as WorkflowResumeType)) {
    throw Object.assign(new Error("This workflow cannot be resumed."), {
      status: 404,
      code: "WORKFLOW_RESUME_NOT_FOUND",
      retryable: false,
    });
  }
  return value as WorkflowResumeType;
}

async function readJson(request: NextRequest): Promise<unknown> {
  try {
    const value: unknown = await request.json();
    if (JSON.stringify(value).length > 16_384) {
      throw new WorkflowResumeValidationError("The workflow checkpoint is too large.", {
        request: ["Maximum checkpoint size is 16 KB."],
      });
    }
    return value;
  } catch (error) {
    if (error instanceof WorkflowResumeValidationError) throw error;
    throw new WorkflowResumeValidationError("The workflow checkpoint is not valid JSON.", {
      request: ["Send a valid JSON request body."],
    });
  }
}

function failure(requestId: string, error: unknown): NextResponse {
  const status =
    error instanceof WorkflowResumeValidationError
      ? 400
      : typeof error === "object" && error && "status" in error
        ? Number((error as { status: unknown }).status)
        : 503;
  const code =
    error instanceof WorkflowResumeValidationError
      ? "WORKFLOW_RESUME_VALIDATION_FAILED"
      : typeof error === "object" && error && "code" in error
        ? String((error as { code: unknown }).code)
        : "WORKFLOW_RESUME_UNAVAILABLE";
  const retryable =
    typeof error === "object" && error && "retryable" in error
      ? Boolean((error as { retryable: unknown }).retryable)
      : status >= 500;
  const message =
    error instanceof Error ? error.message : "The workflow checkpoint is unavailable.";
  return NextResponse.json(
    {
      error: {
        code,
        message,
        request_id: requestId,
        retryable,
        ...(error instanceof WorkflowResumeValidationError
          ? { field_errors: error.fieldErrors }
          : {}),
      },
    },
    { status, headers: headers(requestId) },
  );
}

export async function handleWorkflowResumeGet(
  _request: NextRequest,
  context: { params: Promise<{ workflowType: string; workflowKey: string }> },
): Promise<NextResponse> {
  const requestId = `resume-${randomUUID()}`;
  try {
    const [{ workflowType, workflowKey }, userId] = await Promise.all([
      context.params,
      authenticatedUserId(),
    ]);
    const checkpoint = await readWorkflowResumeCheckpoint({
      userId,
      workflowType: parseType(workflowType),
      workflowKey,
    });
    return NextResponse.json(
      { data: checkpoint, meta: { request_id: requestId } },
      { headers: headers(requestId) },
    );
  } catch (error) {
    return failure(requestId, error);
  }
}

export async function handleWorkflowResumePut(
  request: NextRequest,
  context: { params: Promise<{ workflowType: string; workflowKey: string }> },
): Promise<NextResponse> {
  const requestId = request.headers.get("x-request-id") ?? `resume-${randomUUID()}`;
  try {
    const length = Number(request.headers.get("content-length") ?? "0");
    if (Number.isFinite(length) && length > 16_384) {
      throw new WorkflowResumeValidationError("The workflow checkpoint is too large.", {
        request: ["Maximum checkpoint size is 16 KB."],
      });
    }
    const [{ workflowType, workflowKey }, userId, raw] = await Promise.all([
      context.params,
      authenticatedUserId(),
      readJson(request),
    ]);
    const type = parseType(workflowType);
    const policy = resolveWorkflowResumePolicy(type, workflowKey, raw);
    const checkpoint = await saveWorkflowResumeCheckpoint({
      userId,
      workflowType: type,
      workflowKey,
      ...policy,
    });
    return NextResponse.json(
      { data: checkpoint, meta: { request_id: requestId } },
      { headers: headers(requestId) },
    );
  } catch (error) {
    return failure(requestId, error);
  }
}

export async function handleWorkflowResumeDelete(
  _request: NextRequest,
  context: { params: Promise<{ workflowType: string; workflowKey: string }> },
): Promise<NextResponse> {
  const requestId = `resume-${randomUUID()}`;
  try {
    const [{ workflowType, workflowKey }, userId] = await Promise.all([
      context.params,
      authenticatedUserId(),
    ]);
    const deleted = await deleteWorkflowResumeCheckpoint({
      userId,
      workflowType: parseType(workflowType),
      workflowKey,
    });
    return NextResponse.json(
      { data: { deleted }, meta: { request_id: requestId } },
      { headers: headers(requestId) },
    );
  } catch (error) {
    return failure(requestId, error);
  }
}
