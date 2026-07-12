"use client";

import { forwardRef, useState, type ComponentPropsWithoutRef } from "react";

import { useOptionalFormFieldContext } from "../form-field";
import { Icon } from "../icon";
import { Input } from "./Input";
import styles from "./Input.module.css";

export type PasswordInputProps = Omit<
  ComponentPropsWithoutRef<typeof Input>,
  "endAdornment" | "leadingIcon" | "type"
> & {
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
};

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    {
      showPasswordLabel = "Show password",
      hidePasswordLabel = "Hide password",
      disabled,
      ...inputProps
    },
    ref,
  ) {
    const [visible, setVisible] = useState(false);
    const field = useOptionalFormFieldContext();

    const resolvedDisabled = Boolean(disabled || field?.disabled);

    return (
      <Input
        {...inputProps}
        ref={ref}
        disabled={resolvedDisabled}
        leadingIcon="lock"
        type={visible ? "text" : "password"}
        endAdornment={
          <button
            aria-label={visible ? hidePasswordLabel : showPasswordLabel}
            aria-pressed={visible}
            className={styles.adornmentButton}
            disabled={resolvedDisabled}
            onClick={() => {
              setVisible((current) => !current);
            }}
            type="button"
          >
            <Icon decorative name={visible ? "x" : "eye"} size="sm" />
          </button>
        }
      />
    );
  },
);

PasswordInput.displayName = "PasswordInput";
