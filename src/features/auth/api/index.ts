// VERZUS M4 STEP 4.5

export {
  forgotPassword,
  getCurrentSession,
  login,
  logout,
  refreshSession,
  register,
  resendVerification,
  resetPassword,
  verifyEmail,
} from "./auth-api.client";

export {
  adaptAuthApiError,
  adaptAuthApiPayload,
  createNetworkAuthFailure,
} from "./auth-api.adapter";

export {
  authApiErrorSchema,
  authApiFailureResponseSchema,
  authApiResponseSchema,
  authApiSuccessResponseSchema,
  authSessionEnvelopeSchema,
  forgotPasswordRequestSchema,
  loginRequestSchema,
  registerRequestSchema,
  resendVerificationRequestSchema,
  resetPasswordRequestSchema,
  verifyEmailRequestSchema,
} from "./auth-api.schema";

export type {
  AuthApiError,
  AuthApiFailureResponse,
  AuthApiResponse,
  AuthApiSuccessResponse,
  AuthSessionEnvelope,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResendVerificationRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from "./auth-api.schema";

export {
  submitEmailVerification,
  submitForgotPassword,
  submitLogin,
  submitRegistration,
  submitResetPassword,
} from "./auth-form.submitters";

// VERZUS M4 STEP 4.6 EXPORTS START
export { redirectAfterAuthSuccess, resolveBrowserAuthDestination } from "./auth-redirect";
// VERZUS M4 STEP 4.6 EXPORTS END

// VERZUS M4 STEP 4.10 EXPORTS START
export { refreshSessionSafely } from "./auth-session-refresh.client";
export type { RefreshSessionOptions, SessionRefreshResult } from "./auth-session-refresh.client";
// VERZUS M4 STEP 4.10 EXPORTS END
