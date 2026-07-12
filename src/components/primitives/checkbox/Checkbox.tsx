"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  type InputHTMLAttributes,
  type MutableRefObject,
  type ReactNode,
} from "react";

import styles from "./Checkbox.module.css";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "children" | "type"> & {
  label: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  indeterminate?: boolean;
};

function mergeIds(...ids: Array<string | undefined>): string | undefined {
  return ids.filter(Boolean).join(" ") || undefined;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    label,
    description,
    error,
    indeterminate = false,
    id,
    disabled,
    className,
    "aria-describedby": ariaDescribedBy,
    ...inputProps
  },
  forwardedRef,
) {
  const reactId = useId();
  const internalRef = useRef<HTMLInputElement | null>(null);

  const resolvedId = id ?? `vz-checkbox-${reactId.replace(/:/g, "")}`;

  const descriptionId = description ? `${resolvedId}-description` : undefined;

  const errorId = error ? `${resolvedId}-error` : undefined;

  useEffect(() => {
    if (internalRef.current) {
      internalRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  function assignRef(node: HTMLInputElement | null) {
    internalRef.current = node;

    if (typeof forwardedRef === "function") {
      forwardedRef(node);
      return;
    }

    if (forwardedRef) {
      (forwardedRef as MutableRefObject<HTMLInputElement | null>).current = node;
    }
  }

  return (
    <div
      className={styles.root}
      data-disabled={disabled ? "true" : undefined}
      data-indeterminate={indeterminate ? "true" : undefined}
      data-invalid={error ? "true" : undefined}
    >
      <label className={`${styles.control} ${className ?? ""}`} htmlFor={resolvedId}>
        <input
          {...inputProps}
          ref={assignRef}
          aria-checked={indeterminate ? "mixed" : undefined}
          aria-describedby={mergeIds(descriptionId, errorId, ariaDescribedBy)}
          aria-invalid={Boolean(error) || undefined}
          className={styles.input}
          disabled={disabled}
          id={resolvedId}
          type="checkbox"
        />

        <span aria-hidden="true" className={styles.box} />

        <span className={styles.content}>
          <span className={styles.label}>{label}</span>

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

Checkbox.displayName = "Checkbox";
