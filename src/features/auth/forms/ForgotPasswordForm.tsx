// VERZUS M4 STEP 4.5
"use client";

import { submitForgotPassword } from "../api/auth-form.submitters";
import { forgotPasswordFormSchema, type ForgotPasswordFormInput } from "../contracts";
import { AuthErrorSummary } from "./AuthErrorSummary";
import styles from "./AuthForms.module.css";
import { InteractiveAuthField } from "./InteractiveAuthField";
import type { AuthSubmitter } from "./auth-form.submitter";
import { useAuthForm } from "./auth-form.controller";

export interface ForgotPasswordFormProps {
  submitter?: AuthSubmitter<ForgotPasswordFormInput>;
}

export function ForgotPasswordForm({ submitter = submitForgotPassword }: ForgotPasswordFormProps) {
  const form = useAuthForm({
    schema: forgotPasswordFormSchema,
    initialValues: {
      identifier: "",
    },
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

      <InteractiveAuthField
        autoComplete="username"
        disabled={form.busy}
        error={form.fieldErrors.identifier?.[0]}
        icon="@"
        id="forgot-identifier"
        inputMode="email"
        label="Email or phone"
        name="identifier"
        onChange={(value) => form.setField("identifier", value)}
        placeholder="Enter email or phone number"
        value={form.values.identifier}
      />

      <button
        aria-busy={form.busy}
        className={styles.submitButton}
        disabled={form.busy}
        type="submit"
      >
        Send reset link
      </button>

      <div className={styles.statusRegion} aria-live="polite">
        {form.status === "submitting" ? (
          <p className={styles.statusMessage}>Preparing secure recovery response…</p>
        ) : null}
        {form.successMessage ? (
          <p className={styles.successMessage}>{form.successMessage}</p>
        ) : null}
      </div>
    </form>
  );
}
