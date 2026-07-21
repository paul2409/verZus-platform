// VERZUS M12.6 RELIABILITY EDGE STATES
// VERZUS M12.4 NOTIFICATION MUTATION HTTP HANDLERS

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  applyNotificationMutation,
  getNotificationUnreadCount,
  NotificationMutationServiceError,
  serializeNotification,
} from "../../center/server/notification-center.service";
import type { NotificationMutationScenario } from "../model/notification-mutation.types";
import {
  notificationMutationScenarioSchema,
  readAllNotificationsMutationRequestSchema,
  singleNotificationMutationRequestSchema,
} from "../schema/notification-mutation.schema";

function requestId(scope: string): string {
  return `notifications-${scope}-${crypto.randomUUID()}`;
}

function errorResponse(input: {
  status: number;
  code: string;
  message: string;
  retryable: boolean;
  requestId: string;
}) {
  return NextResponse.json(
    {
      error: {
        code: input.code,
        message: input.message,
        request_id: input.requestId,
        retryable: input.retryable,
      },
    },
    {
      status: input.status,
      headers: { "cache-control": "no-store", "x-request-id": input.requestId },
    },
  );
}

async function parseJson(request: NextRequest, id: string): Promise<unknown | NextResponse> {
  try {
    return await request.json();
  } catch {
    return errorResponse({
      status: 400,
      code: "NOTIFICATION_MUTATION_INVALID_JSON",
      message: "The notification update body must be valid JSON.",
      retryable: false,
      requestId: id,
    });
  }
}

async function scenarioFailure(
  scenario: NotificationMutationScenario,
  id: string,
): Promise<NextResponse | null> {
  if (scenario === "slow") {
    await new Promise((resolve) => setTimeout(resolve, 900));
    return null;
  }

  const failures = {
    error: [503, "NOTIFICATION_MUTATION_UNAVAILABLE", "Notification updates are temporarily unavailable.", true],
    offline: [503, "NOTIFICATION_MUTATION_OFFLINE", "Notification updates are unavailable while offline.", true],
    unauthorized: [401, "NOTIFICATION_MUTATION_UNAUTHORIZED", "Sign in again before updating notifications.", false],
    forbidden: [403, "NOTIFICATION_MUTATION_FORBIDDEN", "You do not have permission to update this notification.", false],
    maintenance: [503, "NOTIFICATION_MUTATION_MAINTENANCE", "Notification updates are undergoing scheduled maintenance.", true],
    conflict: [409, "NOTIFICATION_STATE_CONFLICT", "The notification changed before this update could be applied.", true],
    "not-found": [404, "NOTIFICATION_MUTATION_NOT_FOUND", "The notification no longer exists.", false],
  } as const;

  if (!(scenario in failures)) return null;
  const [status, code, message, retryable] = failures[scenario as keyof typeof failures];
  return errorResponse({ status, code, message, retryable, requestId: id });
}

function verifyIdempotencyHeader(
  request: NextRequest,
  bodyKey: string,
  id: string,
): NextResponse | null {
  const headerKey = request.headers.get("idempotency-key");
  if (!headerKey || headerKey !== bodyKey) {
    return errorResponse({
      status: 400,
      code: "IDEMPOTENCY_KEY_REQUIRED",
      message: "A matching Idempotency-Key header is required.",
      retryable: false,
      requestId: id,
    });
  }
  return null;
}

function successResponse(
  result: ReturnType<typeof applyNotificationMutation>,
  id: string,
  malformed: boolean,
) {
  if (malformed) {
    return NextResponse.json(
      { data: { invalid: true }, meta: { request_id: id } },
      { headers: { "cache-control": "no-store", "x-request-id": id } },
    );
  }

  return NextResponse.json(
    {
      data: {
        item: result.item ? serializeNotification(result.item) : null,
        operation: result.operation,
        updated_count: result.updatedCount,
        unread_count: result.unreadCount,
        replayed: result.replayed,
      },
      meta: {
        request_id: id,
        idempotency_key: result.idempotencyKey,
      },
    },
    { headers: { "cache-control": "no-store", "x-request-id": id } },
  );
}

function serviceError(error: unknown, id: string): NextResponse {
  if (error instanceof NotificationMutationServiceError) {
    return errorResponse({
      status: error.status,
      code: error.code,
      message: error.message,
      retryable: error.retryable,
      requestId: id,
    });
  }

  return errorResponse({
    status: 500,
    code: "NOTIFICATION_MUTATION_UNKNOWN",
    message: "The notification update failed unexpectedly.",
    retryable: true,
    requestId: id,
  });
}

export async function handleSingleNotificationMutation(
  request: NextRequest,
  notificationId: string,
): Promise<NextResponse> {
  const id = requestId("mutation");
  const payload = await parseJson(request, id);
  if (payload instanceof NextResponse) return payload;

  const parsed = singleNotificationMutationRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return errorResponse({
      status: 422,
      code: "NOTIFICATION_MUTATION_INVALID",
      message: "The notification update did not match the required contract.",
      retryable: false,
      requestId: id,
    });
  }

  const headerFailure = verifyIdempotencyHeader(request, parsed.data.idempotency_key, id);
  if (headerFailure) return headerFailure;

  const injectedFailure = await scenarioFailure(parsed.data.scenario, id);
  if (injectedFailure) return injectedFailure;

  try {
    const result = applyNotificationMutation({
      kind: "single",
      notificationId,
      operation: parsed.data.operation,
      expectedState: parsed.data.expected_state,
      idempotencyKey: parsed.data.idempotency_key,
    });
    return successResponse(result, id, parsed.data.scenario === "malformed");
  } catch (error) {
    return serviceError(error, id);
  }
}

export async function handleReadAllNotificationsMutation(
  request: NextRequest,
): Promise<NextResponse> {
  const id = requestId("read-all");
  const payload = await parseJson(request, id);
  if (payload instanceof NextResponse) return payload;

  const parsed = readAllNotificationsMutationRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return errorResponse({
      status: 422,
      code: "NOTIFICATION_READ_ALL_INVALID",
      message: "The mark-all-read request did not match the required contract.",
      retryable: false,
      requestId: id,
    });
  }

  const headerFailure = verifyIdempotencyHeader(request, parsed.data.idempotency_key, id);
  if (headerFailure) return headerFailure;

  const injectedFailure = await scenarioFailure(parsed.data.scenario, id);
  if (injectedFailure) return injectedFailure;

  try {
    const result = applyNotificationMutation({
      kind: "read-all",
      category: parsed.data.category,
      idempotencyKey: parsed.data.idempotency_key,
    });
    return successResponse(result, id, parsed.data.scenario === "malformed");
  } catch (error) {
    return serviceError(error, id);
  }
}

export async function handleNotificationUnreadCountGet(
  request: NextRequest,
): Promise<NextResponse> {
  const id = requestId("unread-count");
  const parsedScenario = notificationMutationScenarioSchema.safeParse(
    request.nextUrl.searchParams.get("scenario") ?? "normal",
  );
  const scenario = parsedScenario.success ? parsedScenario.data : "normal";
  const injectedFailure = await scenarioFailure(scenario, id);
  if (injectedFailure) return injectedFailure;

  if (scenario === "malformed") {
    return NextResponse.json(
      { data: { unread_count: "invalid" }, meta: { request_id: id } },
      { headers: { "cache-control": "no-store", "x-request-id": id } },
    );
  }

  return NextResponse.json(
    {
      data: { unread_count: getNotificationUnreadCount() },
      meta: { request_id: id, fetched_at: new Date().toISOString() },
    },
    { headers: { "cache-control": "no-store", "x-request-id": id } },
  );
}
