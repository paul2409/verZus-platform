// VERZUS M3 STEP 3.4
"use client";

import { useEffect } from "react";

import { RouteState } from "./RouteState";
import styles from "./RouteBoundary.module.css";

export interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  routeName?: string;
}

export function RouteError({ error, reset, routeName = "this route" }: RouteErrorProps) {
  const errorId = error.digest ?? "ROUTE-UNAVAILABLE";

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("verzus:route-error", {
        detail: {
          routeName,
          errorId,
          message: error.message,
        },
      }),
    );
  }, [error, errorId, routeName]);

  return (
    <RouteState
      kind="error"
      eyebrow="Isolated route failure"
      title={`${routeName} is temporarily unavailable`}
      description="The application shell is still operational. Retry only this route or return to Play."
      errorId={errorId}
      actions={
        <>
          <button className={styles.action} type="button" onClick={reset}>
            Retry route
          </button>
          <a className={styles.secondaryAction} href="/play">
            Return to Play
          </a>
        </>
      }
    />
  );
}
