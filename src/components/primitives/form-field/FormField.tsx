"use client";

import { useId, useMemo, type HTMLAttributes, type ReactNode } from "react";

import { FormFieldProvider, type FormFieldContextValue } from "./formFieldContext";
import styles from "./FormField.module.css";

export type FormFieldProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children: ReactNode;
  label: ReactNode;
  controlId?: string;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  hideLabel?: boolean;
  optionalLabel?: ReactNode;
};

function joinClassNames(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

function createStableId(prefix: string, reactId: string) {
  return `${prefix}-${reactId.replace(/:/g, "")}`;
}

export function FormField({
  children,
  label,
  controlId,
  hint,
  error,
  required = false,
  disabled = false,
  hideLabel = false,
  optionalLabel,
  className,
  ...containerProps
}: FormFieldProps) {
  const reactId = useId();

  const resolvedControlId = controlId ?? createStableId("vz-field", reactId);

  const hintId = hint ? `${resolvedControlId}-hint` : undefined;

  const errorId = error ? `${resolvedControlId}-error` : undefined;

  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const invalid = Boolean(error);

  const contextValue = useMemo<FormFieldContextValue>(
    () => ({
      controlId: resolvedControlId,
      describedBy,
      disabled,
      invalid,
      required,
    }),
    [describedBy, disabled, invalid, required, resolvedControlId],
  );

  return (
    <FormFieldProvider value={contextValue}>
      <div
        {...containerProps}
        className={joinClassNames(
          styles.field,
          disabled && styles.disabled,
          invalid && styles.invalid,
          className,
        )}
        data-disabled={disabled ? "true" : undefined}
        data-invalid={invalid ? "true" : undefined}
      >
        <div className={styles.labelRow}>
          <label
            className={hideLabel ? styles.visuallyHidden : styles.label}
            htmlFor={resolvedControlId}
          >
            {label}

            {required ? (
              <span aria-hidden="true" className={styles.required}>
                *
              </span>
            ) : null}
          </label>

          {!required && optionalLabel ? (
            <span className={styles.optional}>{optionalLabel}</span>
          ) : null}
        </div>

        {children}

        {hint ? (
          <p className={styles.hint} id={hintId}>
            {hint}
          </p>
        ) : null}

        {error ? (
          <p aria-live="polite" className={styles.error} id={errorId} role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </FormFieldProvider>
  );
}
