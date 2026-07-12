"use client";

import { forwardRef, useId, type SelectHTMLAttributes } from "react";

import { useOptionalFormFieldContext } from "../form-field";
import { Icon } from "../icon";
import styles from "./Select.module.css";

export type SelectControlSize = "sm" | "md" | "lg";

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  controlSize?: SelectControlSize;
};

function joinClassNames(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

function mergeIds(...ids: Array<string | undefined>): string | undefined {
  return ids.filter(Boolean).join(" ") || undefined;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    controlSize = "md",
    className,
    id,
    disabled,
    required,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    children,
    ...selectProps
  },
  ref,
) {
  const reactId = useId();
  const field = useOptionalFormFieldContext();

  const resolvedId = id ?? field?.controlId ?? `vz-select-${reactId.replace(/:/g, "")}`;

  const resolvedDisabled = Boolean(disabled || field?.disabled);

  const resolvedRequired = Boolean(required || field?.required);

  const resolvedInvalid = ariaInvalid ?? field?.invalid ?? false;

  return (
    <div
      className={joinClassNames(
        styles.root,
        styles[controlSize],
        Boolean(resolvedInvalid) && styles.invalid,
        resolvedDisabled && styles.disabled,
      )}
      data-control-size={controlSize}
    >
      <select
        {...selectProps}
        ref={ref}
        aria-describedby={mergeIds(field?.describedBy, ariaDescribedBy)}
        aria-invalid={resolvedInvalid || undefined}
        className={joinClassNames(styles.select, className)}
        disabled={resolvedDisabled}
        id={resolvedId}
        required={resolvedRequired}
      >
        {children}
      </select>

      <Icon className={styles.icon} decorative name="chevron-down" size="sm" />
    </div>
  );
});

Select.displayName = "Select";
