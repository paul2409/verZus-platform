"use client";

import { submitResetPassword } from "../api/auth-form.submitters";
import { resetPasswordFormSchema, type ResetPasswordFormInput } from "../contracts";
import { AuthErrorSummary } from "./AuthErrorSummary";
import styles from "./AuthForms.module.css";
import { PasswordField } from "./PasswordField";
import type { AuthSubmitter } from "./auth-form.submitter";
import { useAuthForm } from "./auth-form.controller";

export interface ResetPasswordFormProps {
  resetToken: string;
  submitter?: AuthSubmitter<ResetPasswordFormInput>;
}

export function ResetPasswordForm({
  resetToken,
  submitter = submitResetPassword,
}: ResetPasswordFormProps) {
  const form = useAuthForm({
    schema: resetPasswordFormSchema,
    initialValues: { resetToken, password: "", confirmPassword: "" },
    submitter,
  });

  return (
    <form className={styles.form} noValidate onSubmit={form.submit}>
      <AuthErrorSummary
        fieldErrors={form.fieldErrors}
        onRetry={form.retry}
        retryAfterSeconds={form.retryAfterSeconds}
        submissionError={form.submissionError}
      />
      <PasswordField
        autoComplete="new-password"
        disabled={form.busy}
        error={form.fieldErrors.password?.[0]}
        id="reset-password"
        label="New password"
        name="password"
        onChange={(value) => form.setField("password", value)}
        placeholder="Enter new password"
        value={form.values.password}
      />
      <PasswordField
        autoComplete="new-password"
        disabled={form.busy}
        error={form.fieldErrors.confirmPassword?.[0]}
        id="reset-confirm-password"
        label="Confirm new password"
        name="confirmPassword"
        onChange={(value) => form.setField("confirmPassword", value)}
        placeholder="Confirm new password"
        value={form.values.confirmPassword}
      />
      <button
        aria-busy={form.busy}
        className={styles.submitButton}
        disabled={form.busy || resetToken.length < 16}
        type="submit"
      >
        Update password
      </button>
      <div className={styles.statusRegion} aria-live="polite">
        {form.status === "submitting" ? (
          <p className={styles.statusMessage}>Updating secure password…</p>
        ) : null}
        {form.successMessage ? (
          <p className={styles.successMessage}>{form.successMessage}</p>
        ) : null}
      </div>
    </form>
  );
}
