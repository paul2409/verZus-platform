// VERZUS M4 STEP 4.4
"use client";

import { useEffect, useRef } from "react";

import type { AuthFieldErrors, AuthSubmissionError } from "../contracts";
import styles from "./AuthForms.module.css";

export interface AuthErrorSummaryProps {
  fieldErrors: AuthFieldErrors;
  submissionError: AuthSubmissionError | null;
  retryAfterSeconds: number;
  onRetry: () => void;
}

export function AuthErrorSummary({
  fieldErrors,
  submissionError,
  retryAfterSeconds,
  onRetry,
}: AuthErrorSummaryProps) {
  const ref = useRef<HTMLDivElement>(null);
  const messages = Object.values(fieldErrors).flat();
  const visible = messages.length > 0 || submissionError !== null;

  useEffect(() => {
    if (visible) {
      ref.current?.focus();
    }
  }, [visible, submissionError]);

  if (!visible) {
    return null;
  }

  return (
    <div
      aria-labelledby="auth-error-title"
      className={styles.errorSummary}
      ref={ref}
      role="alert"
      tabIndex={-1}
    >
      <h3 className={styles.errorTitle} id="auth-error-title">
        Check the form
      </h3>

      {submissionError ? <p className={styles.errorMessage}>{submissionError.message}</p> : null}

      {messages.length > 0 ? (
        <ul className={styles.errorList}>
          {messages.map((message, index) => (
            <li key={`${message}-${index}`}>{message}</li>
          ))}
        </ul>
      ) : null}

      {submissionError?.requestId ? (
        <span className={styles.errorMeta}>Reference: {submissionError.requestId}</span>
      ) : null}

      {submissionError?.retryable ? (
        <button
          className={styles.retryButton}
          disabled={retryAfterSeconds > 0}
          onClick={onRetry}
          type="button"
        >
          {retryAfterSeconds > 0 ? `Retry in ${retryAfterSeconds}s` : "Retry submission"}
        </button>
      ) : null}
    </div>
  );
}
