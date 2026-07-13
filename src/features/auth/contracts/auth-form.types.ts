// VERZUS M4 STEP 4.2

export const authScreenIds = [
  "login",
  "register",
  "email-verification",
  "forgot-password",
  "reset-password",
  "session-expired",
] as const;

export type AuthScreenId = (typeof authScreenIds)[number];

export const authFormStatuses = [
  "idle",
  "validating",
  "submitting",
  "success",
  "field_error",
  "submission_error",
  "rate_limited",
  "offline",
] as const;

export type AuthFormStatus = (typeof authFormStatuses)[number];

export const authFieldNames = [
  "identifier",
  "gamerTag",
  "email",
  "phone",
  "password",
  "confirmPassword",
  "verificationCode",
  "resetToken",
  "acceptedTerms",
] as const;

export type AuthFieldName = (typeof authFieldNames)[number];

export type AuthFieldErrors = Partial<Record<AuthFieldName, readonly string[]>>;

export const authSubmissionErrorCodes = [
  "invalid_credentials",
  "duplicate_account",
  "email_already_verified",
  "invalid_verification_code",
  "expired_verification_code",
  "invalid_reset_token",
  "expired_reset_token",
  "weak_password",
  "rate_limited",
  "offline",
  "service_unavailable",
  "validation_failed",
  "unknown",
] as const;

export type AuthSubmissionErrorCode = (typeof authSubmissionErrorCodes)[number];

export interface AuthSubmissionError {
  code: AuthSubmissionErrorCode;
  message: string;
  requestId: string | null;
  retryable: boolean;
  fieldErrors: AuthFieldErrors;
  retryAfterSeconds: number | null;
}

export interface AuthFormViewState {
  status: AuthFormStatus;
  submitDisabled: boolean;
  error: AuthSubmissionError | null;
}

export function createIdleAuthFormState(): AuthFormViewState {
  return {
    status: "idle",
    submitDisabled: false,
    error: null,
  };
}

export function isAuthFormBusy(status: AuthFormStatus): boolean {
  return status === "validating" || status === "submitting";
}

export function canRetryAuthSubmission(error: AuthSubmissionError | null): boolean {
  return error?.retryable ?? false;
}
