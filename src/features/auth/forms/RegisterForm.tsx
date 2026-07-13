// VERZUS M4 STEP 4.5
"use client";

import { submitRegistration } from "../api/auth-form.submitters";
import { registerFormSchema, type RegisterFormInput } from "../contracts";
import { AuthErrorSummary } from "./AuthErrorSummary";
import styles from "./AuthForms.module.css";
import { InteractiveAuthField } from "./InteractiveAuthField";
import { PasswordField } from "./PasswordField";
import type { AuthSubmitter } from "./auth-form.submitter";
import { useAuthForm } from "./auth-form.controller";

export interface RegisterFormProps {
  submitter?: AuthSubmitter<RegisterFormInput>;
}

export function RegisterForm({ submitter = submitRegistration }: RegisterFormProps) {
  const form = useAuthForm({
    schema: registerFormSchema,
    initialValues: {
      gamerTag: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      acceptedTerms: false,
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
        autoComplete="nickname"
        disabled={form.busy}
        error={form.fieldErrors.gamerTag?.[0]}
        icon="ID"
        id="register-gamer-tag"
        label="Gamer tag"
        name="gamerTag"
        onChange={(value) => form.setField("gamerTag", value)}
        placeholder="Choose your gamer tag"
        value={form.values.gamerTag}
      />

      <InteractiveAuthField
        autoComplete="email"
        disabled={form.busy}
        error={form.fieldErrors.email?.[0]}
        icon="@"
        id="register-email"
        inputMode="email"
        label="Email"
        name="email"
        onChange={(value) => form.setField("email", value)}
        placeholder="Enter your email address"
        type="email"
        value={form.values.email}
      />

      <InteractiveAuthField
        autoComplete="tel"
        disabled={form.busy}
        error={form.fieldErrors.phone?.[0]}
        icon="+"
        id="register-phone"
        inputMode="tel"
        label="Phone number (optional)"
        name="phone"
        onChange={(value) => form.setField("phone", value)}
        placeholder="Enter your phone number"
        required={false}
        type="tel"
        value={form.values.phone}
      />

      <PasswordField
        autoComplete="new-password"
        disabled={form.busy}
        error={form.fieldErrors.password?.[0]}
        helpText="Use 8–128 characters with upper, lower, number, and symbol."
        id="register-password"
        label="Password"
        name="password"
        onChange={(value) => form.setField("password", value)}
        placeholder="Create a strong password"
        value={form.values.password}
      />

      <PasswordField
        autoComplete="new-password"
        disabled={form.busy}
        error={form.fieldErrors.confirmPassword?.[0]}
        id="register-confirm-password"
        label="Confirm password"
        name="confirmPassword"
        onChange={(value) => form.setField("confirmPassword", value)}
        placeholder="Confirm your password"
        value={form.values.confirmPassword}
      />

      <label className={styles.checkboxRow}>
        <input
          checked={form.values.acceptedTerms}
          className={styles.checkbox}
          disabled={form.busy}
          onChange={(event) => form.setField("acceptedTerms", event.currentTarget.checked)}
          type="checkbox"
        />
        <span>
          I agree to the <a href="/terms">Terms</a> and{" "}
          <a href="/community-rules">Community Rules</a>.
          {form.fieldErrors.acceptedTerms?.[0] ? (
            <span className={styles.errorText}> {form.fieldErrors.acceptedTerms[0]}</span>
          ) : null}
        </span>
      </label>

      <button
        aria-busy={form.busy}
        className={styles.submitButton}
        disabled={form.busy}
        type="submit"
      >
        Create account
      </button>

      <div className={styles.statusRegion} aria-live="polite">
        {form.status === "submitting" ? (
          <p className={styles.statusMessage}>Creating secure account…</p>
        ) : null}
        {form.successMessage ? (
          <p className={styles.successMessage}>{form.successMessage}</p>
        ) : null}
      </div>
    </form>
  );
}
