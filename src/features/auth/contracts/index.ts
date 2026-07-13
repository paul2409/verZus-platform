// VERZUS M4 STEP 4.2

export {
  authIdentifierSchema,
  emailSchema,
  emailVerificationFormSchema,
  forgotPasswordFormSchema,
  gamerTagSchema,
  loginFormSchema,
  passwordSchema,
  phoneSchema,
  registerFormSchema,
  resetPasswordFormSchema,
} from "./auth-form.schema";
export type {
  EmailVerificationFormInput,
  ForgotPasswordFormInput,
  LoginFormInput,
  RegisterFormInput,
  ResetPasswordFormInput,
} from "./auth-form.schema";

export {
  authFieldNames,
  authFormStatuses,
  authScreenIds,
  authSubmissionErrorCodes,
  canRetryAuthSubmission,
  createIdleAuthFormState,
  isAuthFormBusy,
} from "./auth-form.types";
export type {
  AuthFieldErrors,
  AuthFieldName,
  AuthFormStatus,
  AuthFormViewState,
  AuthScreenId,
  AuthSubmissionError,
  AuthSubmissionErrorCode,
} from "./auth-form.types";

export { authScreenContracts, getAuthScreenContract } from "./auth-screen.contract";
export type {
  AuthScreenActionContract,
  AuthScreenContract,
  AuthScreenFieldContract,
} from "./auth-screen.contract";
