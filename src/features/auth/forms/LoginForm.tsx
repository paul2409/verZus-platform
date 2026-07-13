// VERZUS M4 STEP 4.5
"use client";

import { submitLogin } from "../api/auth-form.submitters";
import { loginFormSchema, type LoginFormInput } from "../contracts";
import { AuthErrorSummary } from "./AuthErrorSummary";
import styles from "./AuthForms.module.css";
import { InteractiveAuthField } from "./InteractiveAuthField";
import { PasswordField } from "./PasswordField";
import type { AuthSubmitter } from "./auth-form.submitter";
import { useAuthForm } from "./auth-form.controller";

export interface LoginFormProps {
  submitter?: AuthSubmitter<LoginFormInput>;
}

export function LoginForm({ submitter = submitLogin }: LoginFormProps) {
  const form = useAuthForm({
    schema: loginFormSchema,
    initialValues: {
      identifier: "",
      password: "",
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
        id="login-identifier"
        inputMode="email"
        label="Email or phone"
        name="identifier"
        onChange={(value) => form.setField("identifier", value)}
        placeholder="Enter email or phone number"
        value={form.values.identifier}
      />

      <PasswordField
        autoComplete="current-password"
        disabled={form.busy}
        error={form.fieldErrors.password?.[0]}
        id="login-password"
        label="Password"
        name="password"
        onChange={(value) => form.setField("password", value)}
        placeholder="Enter your password"
        value={form.values.password}
      />

      <button
        aria-busy={form.busy}
        className={styles.submitButton}
        disabled={form.busy}
        type="submit"
      >
        Sign in
      </button>

      <div className={styles.statusRegion} aria-live="polite">
        {form.status === "submitting" ? (
          <p className={styles.statusMessage}>Signing in securely…</p>
        ) : null}
        {form.status === "rate_limited" ? (
          <p className={styles.rateLimitMessage}>
            Too many attempts. Retry in {form.retryAfterSeconds} seconds.
          </p>
        ) : null}
        {form.successMessage ? (
          <p className={styles.successMessage}>{form.successMessage}</p>
        ) : null}
      </div>
    </form>
  );
}
