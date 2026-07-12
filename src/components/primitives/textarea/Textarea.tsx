"use client";

import { forwardRef, useId, type TextareaHTMLAttributes } from "react";

import { useOptionalFormFieldContext } from "../form-field";
import styles from "./Textarea.module.css";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  resize?: "none" | "vertical" | "both";
};

function joinClassNames(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

function mergeIds(...ids: Array<string | undefined>): string | undefined {
  return ids.filter(Boolean).join(" ") || undefined;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    resize = "vertical",
    className,
    id,
    disabled,
    required,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    ...textareaProps
  },
  ref,
) {
  const reactId = useId();
  const field = useOptionalFormFieldContext();

  const resolvedId = id ?? field?.controlId ?? `vz-textarea-${reactId.replace(/:/g, "")}`;

  const resolvedDisabled = Boolean(disabled || field?.disabled);

  const resolvedRequired = Boolean(required || field?.required);

  const resolvedInvalid = ariaInvalid ?? field?.invalid ?? false;

  return (
    <textarea
      {...textareaProps}
      ref={ref}
      aria-describedby={mergeIds(field?.describedBy, ariaDescribedBy)}
      aria-invalid={resolvedInvalid || undefined}
      className={joinClassNames(
        styles.textarea,
        styles[resize],
        Boolean(resolvedInvalid) && styles.invalid,
        className,
      )}
      disabled={resolvedDisabled}
      id={resolvedId}
      required={resolvedRequired}
    />
  );
});

Textarea.displayName = "Textarea";
