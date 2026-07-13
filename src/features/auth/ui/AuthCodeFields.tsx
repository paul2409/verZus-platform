// VERZUS M4 STEP 4.3

import styles from "./AuthScreens.module.css";

export function AuthCodeFields() {
  return (
    <fieldset className={styles.field}>
      <legend className={styles.fieldLabel}>Enter 6-digit code</legend>
      <div className={styles.codeGroup}>
        {Array.from({ length: 6 }, (_, index) => (
          <input
            aria-label={`Verification digit ${index + 1}`}
            autoComplete={index === 0 ? "one-time-code" : "off"}
            className={styles.codeInput}
            inputMode="numeric"
            key={index}
            maxLength={1}
            pattern="[0-9]*"
            type="text"
          />
        ))}
      </div>
    </fieldset>
  );
}
