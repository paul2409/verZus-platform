// VERZUS M4 STEP 4.4
"use client";

import { useRef, type ChangeEvent, type ClipboardEvent, type KeyboardEvent } from "react";

import styles from "./AuthForms.module.css";

export interface VerificationCodeFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
  disabled?: boolean;
}

function normalizeCode(value: string): string {
  return value.replace(/\D/g, "").slice(0, 6);
}

export function VerificationCodeField({
  value,
  onChange,
  error,
  disabled = false,
}: VerificationCodeFieldProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const updateDigit = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const digit = normalizeCode(event.currentTarget.value).slice(-1);
    const next = value.padEnd(6, " ").split("");
    next[index] = digit || " ";
    onChange(next.join("").trimEnd());

    if (digit && index < 5) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !value[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const code = normalizeCode(event.clipboardData.getData("text"));

    if (code.length === 0) {
      return;
    }

    event.preventDefault();
    onChange(code);
    refs.current[Math.min(code.length, 6) - 1]?.focus();
  };

  return (
    <fieldset className={styles.codeFieldset}>
      <legend className={styles.label}>Enter 6-digit code</legend>
      <div className={styles.codeGroup}>
        {Array.from({ length: 6 }, (_, index) => (
          <input
            aria-label={`Verification digit ${index + 1}`}
            autoComplete={index === 0 ? "one-time-code" : "off"}
            className={styles.codeInput}
            data-invalid={error ? "true" : "false"}
            disabled={disabled}
            inputMode="numeric"
            key={index}
            maxLength={1}
            onChange={(event) => updateDigit(index, event)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={index === 0 ? handlePaste : undefined}
            pattern="[0-9]*"
            ref={(element) => {
              refs.current[index] = element;
            }}
            type="text"
            value={value[index] ?? ""}
          />
        ))}
      </div>
      {error ? <p className={styles.errorText}>{error}</p> : null}
    </fieldset>
  );
}
