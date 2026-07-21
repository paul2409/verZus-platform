// VERZUS M12.6 DOMAIN-NEUTRAL RESOURCE RELIABILITY CONTRACT

export type ResourceReliabilityState =
  | "idle"
  | "loading"
  | "success"
  | "empty"
  | "stale"
  | "retrying"
  | "error"
  | "offline"
  | "unauthorized"
  | "forbidden"
  | "not-found"
  | "maintenance"
  | "schema-invalid"
  | "partial-failure";

export type ResourceFailureDescriptor = {
  state: ResourceReliabilityState;
  eyebrow: string;
  title: string;
  message: string;
  requestId: string | null;
  retryable: boolean;
};

function codeIncludes(code: string, fragment: string): boolean {
  return code.toLocaleUpperCase().includes(fragment);
}

export function classifyResourceFailure(input: {
  resourceLabel: string;
  code?: string | null | undefined;
  message?: string | null | undefined;
  requestId?: string | null | undefined;
  retryable?: boolean | undefined;
  status?: number | undefined;
}): ResourceFailureDescriptor {
  const code = input.code ?? "";
  const status = input.status;
  const retryable = input.retryable ?? (status === undefined || status >= 500);

  if (status === 401 || codeIncludes(code, "UNAUTHORIZED")) {
    return {
      state: "unauthorized",
      eyebrow: "Session expired",
      title: `Sign in again to load ${input.resourceLabel}`,
      message: input.message ?? "Your authenticated session is no longer valid.",
      requestId: input.requestId ?? null,
      retryable: false,
    };
  }

  if (status === 403 || codeIncludes(code, "FORBIDDEN")) {
    return {
      state: "forbidden",
      eyebrow: "Permission denied",
      title: `${input.resourceLabel} is restricted`,
      message: input.message ?? "Your account does not have permission to access this resource.",
      requestId: input.requestId ?? null,
      retryable: false,
    };
  }

  if (status === 404 || codeIncludes(code, "NOT_FOUND")) {
    return {
      state: "not-found",
      eyebrow: "Record not found",
      title: `${input.resourceLabel} could not be located`,
      message: input.message ?? "The requested record may have moved, expired or been removed.",
      requestId: input.requestId ?? null,
      retryable: false,
    };
  }

  if (codeIncludes(code, "MAINTENANCE")) {
    return {
      state: "maintenance",
      eyebrow: "Scheduled maintenance",
      title: `${input.resourceLabel} is temporarily paused`,
      message: input.message ?? "This resource will recover without affecting the rest of VERZUS.",
      requestId: input.requestId ?? null,
      retryable: true,
    };
  }

  if (codeIncludes(code, "OFFLINE")) {
    return {
      state: "offline",
      eyebrow: "Connection unavailable",
      title: `${input.resourceLabel} cannot refresh`,
      message: input.message ?? "Reconnect and retry this resource. Confirmed data remains available where possible.",
      requestId: input.requestId ?? null,
      retryable: true,
    };
  }

  if (codeIncludes(code, "SCHEMA") || codeIncludes(code, "MALFORMED") || codeIncludes(code, "INVALID_JSON")) {
    return {
      state: "schema-invalid",
      eyebrow: "Response rejected",
      title: `${input.resourceLabel} returned invalid data`,
      message: input.message ?? "The response did not match the verified client contract.",
      requestId: input.requestId ?? null,
      retryable: true,
    };
  }

  return {
    state: "error",
    eyebrow: "Resource interrupted",
    title: `${input.resourceLabel} is temporarily unavailable`,
    message: input.message ?? "Retry this resource without leaving the current route.",
    requestId: input.requestId ?? null,
    retryable,
  };
}
