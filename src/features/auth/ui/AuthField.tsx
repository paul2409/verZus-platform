// VERZUS M4 STEP 4.3

import type { HTMLInputTypeAttribute } from "react";

import styles from "./AuthScreens.module.css";

export interface AuthFieldProps {
  id: string;
  label: string;
  placeholder: string;
  autoComplete: string;
  icon: string;
  type?: HTMLInputTypeAttribute;
  inputMode?: "email" | "numeric" | "tel" | "text";
  accessory?: string;
  helpText?: string;
  defaultValue?: string;
}

export function AuthField({
  id,
  label,
  placeholder,
  autoComplete,
  icon,
  type = "text",
  inputMode = "text",
  accessory,
  helpText,
  defaultValue,
}: AuthFieldProps) {
  const helpTextId = helpText ? `${id}-help` : undefined;

  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel} htmlFor={id}>
        {label}
      </label>
      <div className={styles.inputShell}>
        <span className={styles.inputIcon} aria-hidden="true">
          {icon}
        </span>
        <input
          aria-describedby={helpTextId}
          autoComplete={autoComplete}
          className={styles.input}
          defaultValue={defaultValue}
          id={id}
          inputMode={inputMode}
          placeholder={placeholder}
          type={type}
        />
        {accessory ? (
          <span className={styles.fieldAccessory} aria-hidden="true">
            {accessory}
          </span>
        ) : null}
      </div>
      {helpText ? (
        <p className={styles.helpText} id={helpTextId}>
          {helpText}
        </p>
      ) : null}
    </div>
  );
}
