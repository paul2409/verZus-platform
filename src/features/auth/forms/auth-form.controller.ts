// VERZUS M4 STEP 4.4
"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import type { ZodType } from "zod";

import type {
  AuthFieldErrors,
  AuthFieldName,
  AuthFormStatus,
  AuthSubmissionError,
} from "../contracts";
import type { AuthSubmitResult, AuthSubmitter } from "./auth-form.submitter";

type AuthFormValues = Record<string, unknown>;

export interface UseAuthFormOptions<TInput extends AuthFormValues> {
  schema: ZodType<TInput>;
  initialValues: TInput;
  submitter: AuthSubmitter<TInput>;
}

export interface AuthFormController<TInput extends AuthFormValues> {
  values: TInput;
  status: AuthFormStatus;
  fieldErrors: AuthFieldErrors;
  submissionError: AuthSubmissionError | null;
  successMessage: string | null;
  retryAfterSeconds: number;
  busy: boolean;
  setField: <TKey extends keyof TInput>(field: TKey, value: TInput[TKey]) => void;
  submit: (event: FormEvent<HTMLFormElement>) => void;
  retry: () => void;
}

function mapValidationErrors(
  issues: readonly {
    path: readonly PropertyKey[];
    message: string;
  }[],
): AuthFieldErrors {
  const output: Partial<Record<AuthFieldName, string[]>> = {};

  for (const issue of issues) {
    const field = issue.path[0];

    if (typeof field !== "string") {
      continue;
    }

    const key = field as AuthFieldName;
    const existing = output[key] ?? [];
    output[key] = [...existing, issue.message];
  }

  return output;
}

export function useAuthForm<TInput extends AuthFormValues>({
  schema,
  initialValues,
  submitter,
}: UseAuthFormOptions<TInput>): AuthFormController<TInput> {
  const [values, setValues] = useState<TInput>(initialValues);
  const [status, setStatus] = useState<AuthFormStatus>("idle");
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [submissionError, setSubmissionError] = useState<AuthSubmissionError | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [retryAfterSeconds, setRetryAfterSeconds] = useState(0);
  const inFlightRef = useRef(false);
  const lastValidInputRef = useRef<TInput | null>(null);

  useEffect(() => {
    if (retryAfterSeconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setRetryAfterSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [retryAfterSeconds]);

  const setField = useCallback(
    <TKey extends keyof TInput>(field: TKey, value: TInput[TKey]): void => {
      setValues((current) => ({
        ...current,
        [field]: value,
      }));

      setFieldErrors((current) => {
        if (!(field in current)) {
          return current;
        }

        const next = { ...current };
        delete next[field as AuthFieldName];
        return next;
      });

      if (status === "field_error" || status === "submission_error") {
        setStatus("idle");
      }

      setSubmissionError(null);
      setSuccessMessage(null);
    },
    [status],
  );

  const submitValidated = useCallback(
    async (input: TInput): Promise<void> => {
      if (inFlightRef.current) {
        return;
      }

      inFlightRef.current = true;
      setStatus("submitting");
      setSubmissionError(null);
      setSuccessMessage(null);

      let result: AuthSubmitResult;

      try {
        result = await submitter(input);
      } catch {
        result = {
          ok: false,
          error: {
            code: "unknown",
            message: "Authentication could not be completed.",
            requestId: null,
            retryable: true,
            fieldErrors: {},
            retryAfterSeconds: null,
          },
        };
      } finally {
        inFlightRef.current = false;
      }

      if (result.ok) {
        setStatus("success");
        setSuccessMessage(result.message);
        setRetryAfterSeconds(0);
        return;
      }

      setSubmissionError(result.error);
      setFieldErrors(result.error.fieldErrors);

      if (result.error.code === "rate_limited") {
        setStatus("rate_limited");
        setRetryAfterSeconds(result.error.retryAfterSeconds ?? 0);
      } else {
        setStatus("submission_error");
      }
    },
    [submitter],
  );

  const submit = useCallback(
    (event: FormEvent<HTMLFormElement>): void => {
      event.preventDefault();

      if (inFlightRef.current) {
        return;
      }

      setStatus("validating");
      setFieldErrors({});
      setSubmissionError(null);
      setSuccessMessage(null);

      const result = schema.safeParse(values);

      if (!result.success) {
        setFieldErrors(mapValidationErrors(result.error.issues));
        setStatus("field_error");
        return;
      }

      lastValidInputRef.current = result.data;
      void submitValidated(result.data);
    },
    [schema, submitValidated, values],
  );

  const retry = useCallback((): void => {
    if (inFlightRef.current || retryAfterSeconds > 0 || lastValidInputRef.current === null) {
      return;
    }

    void submitValidated(lastValidInputRef.current);
  }, [retryAfterSeconds, submitValidated]);

  return {
    values,
    status,
    fieldErrors,
    submissionError,
    successMessage,
    retryAfterSeconds,
    busy: status === "validating" || status === "submitting",
    setField,
    submit,
    retry,
  };
}
