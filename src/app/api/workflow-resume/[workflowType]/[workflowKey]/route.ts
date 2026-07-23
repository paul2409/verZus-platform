import type { NextRequest } from "next/server";

import {
  handleWorkflowResumeDelete,
  handleWorkflowResumeGet,
  handleWorkflowResumePut,
} from "@/shared/composition/workflow-resume/server";

export const dynamic = "force-dynamic";

export function GET(
  request: NextRequest,
  context: { params: Promise<{ workflowType: string; workflowKey: string }> },
) {
  return handleWorkflowResumeGet(request, context);
}

export function PUT(
  request: NextRequest,
  context: { params: Promise<{ workflowType: string; workflowKey: string }> },
) {
  return handleWorkflowResumePut(request, context);
}

export function DELETE(
  request: NextRequest,
  context: { params: Promise<{ workflowType: string; workflowKey: string }> },
) {
  return handleWorkflowResumeDelete(request, context);
}
