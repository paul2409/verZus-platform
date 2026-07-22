"use client";

import { useState } from "react";

import { resendVerification } from "../api/auth-api.client";
import styles from "./AuthForms.module.css";

export function ResendVerificationButton({ email }: { email: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const resend = async () => {
    setBusy(true);
    const response = await resendVerification({ email });
    setMessage(response.ok ? response.message : response.error.message);
    setBusy(false);
  };

  return (
    <div className={styles.statusRegion} aria-live="polite">
      <button className={styles.secondaryButton} disabled={busy} onClick={resend} type="button">
        {busy ? "Sending code…" : "Resend code"}
      </button>
      {message ? <p className={styles.statusMessage}>{message}</p> : null}
    </div>
  );
}
