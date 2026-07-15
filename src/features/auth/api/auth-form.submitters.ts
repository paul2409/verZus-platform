// VERZUS M4 STEP 4.5

import type {
  EmailVerificationFormInput,
  ForgotPasswordFormInput,
  LoginFormInput,
  RegisterFormInput,
  ResetPasswordFormInput,
} from "../contracts";
import type { AuthSubmitter } from "../forms/auth-form.submitter";
import { forgotPassword, login, register, resetPassword, verifyEmail } from "./auth-api.client";

export const submitLogin: AuthSubmitter<LoginFormInput> = login;

export const submitRegistration: AuthSubmitter<RegisterFormInput> = register;

export const submitEmailVerification: AuthSubmitter<EmailVerificationFormInput> = verifyEmail;

export const submitForgotPassword: AuthSubmitter<ForgotPasswordFormInput> = forgotPassword;

export const submitResetPassword: AuthSubmitter<ResetPasswordFormInput> = resetPassword;
