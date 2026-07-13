// VERZUS M4 STEP 4.5
"use client";

import { submitEmailVerification } from "../api/auth-form.submitters";
import { emailVerificationFormSchema, type EmailVerificationFormInput } from "../contracts";
import { AuthErrorSummary } from "./AuthErrorSummary";
import styles from "./AuthForms.module.css";
import { VerificationCodeField } from "./VerificationCodeField";
import type { AuthSubmitter } from "./auth-form.submitter";
import { useAuthForm } from "./auth-form.controller";

export interface EmailVerificationFormProps {
  submitter?: AuthSubmitter<EmailVerificationFormInput>;
}

export function EmailVerificationForm({
  submitter = submitEmailVerification,
}: EmailVerificationFormProps) {
  const form = useAuthForm({
    schema: emailVerificationFormSchema,
    initialValues: {
      verificationCode: "",
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

      <VerificationCodeField
        disabled={form.busy}
        error={form.fieldErrors.verificationCode?.[0]}
        onChange={(value) => form.setField("verificationCode", value)}
        value={form.values.verificationCode}
      />

      <button
        aria-busy={form.busy}
        className={styles.submitButton}
        disabled={form.busy}
        type="submit"
      >
        Verify
      </button>

      <div className={styles.statusRegion} aria-live="polite">
        {form.status === "submitting" ? (
          <p className={styles.statusMessage}>Verifying secure code…</p>
        ) : null}
        {form.successMessage ? (
          <p className={styles.successMessage}>{form.successMessage}</p>
        ) : null}
      </div>
    </form>
  );
}
