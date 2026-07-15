"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";

import styles from "./Switch.module.css";

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "children" | "type"> & {
  label: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
};

function mergeIds(...ids: Array<string | undefined>): string | undefined {
  return ids.filter(Boolean).join(" ") || undefined;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    label,
    description,
    error,
    id,
    disabled,
    className,
    "aria-describedby": ariaDescribedBy,
    ...inputProps
  },
  ref,
) {
  const reactId = useId();

  const resolvedId = id ?? `vz-switch-${reactId.replace(/:/g, "")}`;

  const labelId = `${resolvedId}-label`;

  const descriptionId = description ? `${resolvedId}-description` : undefined;

  const errorId = error ? `${resolvedId}-error` : undefined;

  return (
    <div
      className={styles.root}
      data-disabled={disabled ? "true" : undefined}
      data-invalid={error ? "true" : undefined}
    >
      <label className={`${styles.control} ${className ?? ""}`} htmlFor={resolvedId}>
        <input
          {...inputProps}
          ref={ref}
          aria-describedby={mergeIds(descriptionId, errorId, ariaDescribedBy)}
          aria-labelledby={labelId}
          aria-invalid={Boolean(error) || undefined}
          className={styles.input}
          disabled={disabled}
          id={resolvedId}
          role="switch"
          type="checkbox"
        />

        <span aria-hidden="true" className={styles.track}>
          <span className={styles.thumb} />
        </span>

        <span className={styles.content}>
          <span className={styles.label} id={labelId}>
            {label}
          </span>

          {description ? (
            <span className={styles.description} id={descriptionId}>
              {description}
            </span>
          ) : null}
        </span>
      </label>

      {error ? (
        <p className={styles.error} id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
});

Switch.displayName = "Switch";
