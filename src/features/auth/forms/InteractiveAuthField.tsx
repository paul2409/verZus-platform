// VERZUS M4 STEP 4.4
"use client";

import type { ChangeEvent, HTMLInputAutoCompleteAttribute, HTMLInputTypeAttribute } from "react";

import styles from "./AuthForms.module.css";

export interface InteractiveAuthFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  placeholder: string;
  icon: string;
  autoComplete: HTMLInputAutoCompleteAttribute;
  onChange: (value: string) => void;
  error?: string | undefined;
  helpText?: string | undefined;
  type?: HTMLInputTypeAttribute;
  inputMode?: "email" | "numeric" | "tel" | "text";
  disabled?: boolean;
  required?: boolean;
  accessory?: React.ReactNode | undefined;
}

export function InteractiveAuthField({
  id,
  name,
  label,
  value,
  placeholder,
  icon,
  autoComplete,
  onChange,
  error,
  helpText,
  type = "text",
  inputMode = "text",
  disabled = false,
  required = true,
  accessory,
}: InteractiveAuthFieldProps) {
  const descriptionIds = [helpText ? `${id}-help` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.currentTarget.value);
  };

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <div className={styles.inputShell} data-invalid={error ? "true" : "false"}>
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
        <input
          aria-describedby={descriptionIds || undefined}
          aria-invalid={error ? "true" : "false"}
          autoComplete={autoComplete}
          className={styles.input}
          disabled={disabled}
          id={id}
          inputMode={inputMode}
          name={name}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          type={type}
          value={value}
        />
        {accessory}
      </div>
      {helpText ? (
        <p className={styles.help} id={`${id}-help`}>
          {helpText}
        </p>
      ) : null}
      {error ? (
        <p className={styles.errorText} id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
