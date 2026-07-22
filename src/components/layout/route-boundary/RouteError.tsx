// VERZUS M12.9 PUBLIC ROUTE FAILURE NORMALIZATION
"use client";

import { useEffect } from "react";

import { useBrowserConnectivity } from "@/components/layout/app-shell";

import { RouteState } from "./RouteState";
import styles from "./RouteBoundary.module.css";

export interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  routeName?: string;
}

export function RouteError({ error, reset, routeName = "this route" }: RouteErrorProps) {
  const online = useBrowserConnectivity();
  const errorId = error.digest ?? "ROUTE-UNAVAILABLE";

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("verzus:route-error", {
        detail: {
          routeName,
          errorId,
          message: error.message,
          online,
        },
      }),
    );
  }, [error, errorId, online, routeName]);

  if (!online) {
    return (
      <RouteState
        kind="offline"
        eyebrow="Connection unavailable"
        title={`${routeName} cannot refresh while offline`}
        description="Navigation and already loaded information remain available. Reconnect, then retry only this route."
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
