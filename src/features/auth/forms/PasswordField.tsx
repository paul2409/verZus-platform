// VERZUS M4 STEP 4.4
"use client";

import { useState } from "react";

import { InteractiveAuthField } from "./InteractiveAuthField";
import styles from "./AuthForms.module.css";

export interface PasswordFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  placeholder: string;
  autoComplete: "current-password" | "new-password";
  onChange: (value: string) => void;
  error?: string | undefined;
  helpText?: string | undefined;
  disabled?: boolean;
}

export function PasswordField({
  id,
  name,
  label,
  value,
  placeholder,
  autoComplete,
  onChange,
  error,
  helpText,
  disabled = false,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <InteractiveAuthField
      accessory={
        <button
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-pressed={visible}
          className={styles.visibilityButton}
          disabled={disabled}
          onClick={() => setVisible((current) => !current)}
          type="button"
        >
          {visible ? "Hide" : "Show"}
        </button>
      }
      autoComplete={autoComplete}
      disabled={disabled}
      error={error}
      helpText={helpText}
      icon="●"
      id={id}
      label={label}
      name={name}
      onChange={onChange}
      placeholder={placeholder}
      type={visible ? "text" : "password"}
      value={value}
    />
  );
}
