"use client";

import { useId, useMemo, type FieldsetHTMLAttributes, type ReactNode } from "react";

import { RadioGroupProvider, type RadioGroupContextValue } from "./radioGroupContext";
import styles from "./Radio.module.css";

export type RadioGroupOrientation = "horizontal" | "vertical";

export type RadioGroupProps = Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "children"> & {
  children: ReactNode;
  label: ReactNode;
  name?: string;
  hint?: ReactNode;
  error?: ReactNode;
  orientation?: RadioGroupOrientation;
  required?: boolean;
};

export function RadioGroup({
  children,
  label,
  name,
  hint,
  error,
  orientation = "vertical",
  required = false,
  disabled = false,
  className,
  ...fieldsetProps
}: RadioGroupProps) {
  const reactId = useId();

  const resolvedName = name ?? `vz-radio-${reactId.replace(/:/g, "")}`;

  const hintId = hint ? `${resolvedName}-hint` : undefined;

  const errorId = error ? `${resolvedName}-error` : undefined;

  const contextValue = useMemo<RadioGroupContextValue>(
    () => ({
      name: resolvedName,
      disabled,
      required,
    }),
    [disabled, required, resolvedName],
  );

  return (
    <RadioGroupProvider value={contextValue}>
      <fieldset
        {...fieldsetProps}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        aria-invalid={Boolean(error) || undefined}
        className={`${styles.group} ${className ?? ""}`}
        data-invalid={error ? "true" : undefined}
        disabled={disabled}
      >
        <legend className={styles.legend}>
          {label}

          {required ? (
            <span aria-hidden="true" className={styles.required}>
              *
            </span>
          ) : null}
        </legend>

        {hint ? (
          <p className={styles.groupHint} id={hintId}>
            {hint}
          </p>
        ) : null}

        <div className={`${styles.options} ${styles[orientation]}`}>{children}</div>

        {error ? (
          <p className={styles.groupError} id={errorId} role="alert">
            {error}
          </p>
        ) : null}
      </fieldset>
    </RadioGroupProvider>
  );
}
