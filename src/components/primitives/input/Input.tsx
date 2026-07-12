"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";

import { useOptionalFormFieldContext } from "../form-field";
import { Icon, type IconName } from "../icon";
import styles from "./Input.module.css";

export type InputControlSize = "sm" | "md" | "lg";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  controlSize?: InputControlSize;
  leadingIcon?: IconName;
  endAdornment?: ReactNode;
  wrapperClassName?: string;
};

function joinClassNames(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

function createStableId(prefix: string, reactId: string) {
  return `${prefix}-${reactId.replace(/:/g, "")}`;
}

function mergeIds(...ids: Array<string | undefined>): string | undefined {
  return ids.filter(Boolean).join(" ") || undefined;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    controlSize = "md",
    leadingIcon,
    endAdornment,
    wrapperClassName,
    className,
    id,
    disabled,
    required,
    readOnly,
    type = "text",
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    ...inputProps
  },
  ref,
) {
  const reactId = useId();
  const field = useOptionalFormFieldContext();

  const resolvedId = id ?? field?.controlId ?? createStableId("vz-input", reactId);

  const resolvedDisabled = Boolean(disabled || field?.disabled);

  const resolvedRequired = Boolean(required || field?.required);

  const resolvedInvalid = ariaInvalid ?? field?.invalid ?? false;

  const describedBy = mergeIds(field?.describedBy, ariaDescribedBy);

  return (
    <div
      className={joinClassNames(
        styles.root,
        styles[controlSize],
        Boolean(resolvedInvalid) && styles.invalid,
        resolvedDisabled && styles.disabled,
        readOnly && styles.readOnly,
        wrapperClassName,
      )}
      data-control-size={controlSize}
      data-disabled={resolvedDisabled ? "true" : undefined}
      data-invalid={resolvedInvalid ? "true" : undefined}
    >
      {leadingIcon ? (
        <Icon className={styles.leadingIcon} decorative name={leadingIcon} size="md" />
      ) : null}

      <input
        {...inputProps}
        ref={ref}
        aria-describedby={describedBy}
        aria-invalid={resolvedInvalid || undefined}
        className={joinClassNames(styles.input, className)}
        disabled={resolvedDisabled}
        id={resolvedId}
        readOnly={readOnly}
        required={resolvedRequired}
        type={type}
      />

      {endAdornment ? <span className={styles.endAdornment}>{endAdornment}</span> : null}
    </div>
  );
});

Input.displayName = "Input";
