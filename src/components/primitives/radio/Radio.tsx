"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";

import { useOptionalRadioGroupContext } from "./radioGroupContext";
import styles from "./Radio.module.css";

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "children" | "type"> & {
  label: ReactNode;
  description?: ReactNode;
};

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, description, id, name, disabled, required, className, ...inputProps },
  ref,
) {
  const reactId = useId();
  const group = useOptionalRadioGroupContext();

  const resolvedId = id ?? `vz-radio-option-${reactId.replace(/:/g, "")}`;

  const resolvedDisabled = Boolean(disabled || group?.disabled);

  const resolvedRequired = Boolean(required || group?.required);

  const descriptionId = description ? `${resolvedId}-description` : undefined;

  return (
    <label
      className={`${styles.option} ${className ?? ""}`}
      data-disabled={resolvedDisabled ? "true" : undefined}
      htmlFor={resolvedId}
    >
      <input
        {...inputProps}
        ref={ref}
        aria-describedby={descriptionId}
        className={styles.input}
        disabled={resolvedDisabled}
        id={resolvedId}
        name={name ?? group?.name}
        required={resolvedRequired}
        type="radio"
      />

      <span aria-hidden="true" className={styles.indicator} />

      <span className={styles.content}>
        <span className={styles.label}>{label}</span>

        {description ? (
          <span className={styles.description} id={descriptionId}>
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
});

Radio.displayName = "Radio";
