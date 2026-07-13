// VERZUS M3 STEP 3.4

import { RouteState, type RouteStateKind } from "./RouteState";
import styles from "./RouteBoundary.module.css";

type AccessStateKind = "offline" | "maintenance" | "unauthorized" | "forbidden";

export interface RouteAccessStateProps {
  kind: AccessStateKind;
  title?: string;
  description?: string;
}

const content: Record<AccessStateKind, { eyebrow: string; title: string; description: string }> = {
  offline: {
    eyebrow: "Offline mode",
    title: "This route needs a connection",
    description:
      "Offline-safe navigation remains available. Reconnect before retrying this destination.",
  },
  maintenance: {
    eyebrow: "Scheduled maintenance",
    title: "This route is being serviced",
    description: "The shell remains online while this route is temporarily unavailable.",
  },
  unauthorized: {
    eyebrow: "Authentication required",
    title: "Sign in to continue",
    description:
      "Your session may have expired. Sign in again without losing access to public routes.",
  },
  forbidden: {
    eyebrow: "Permission required",
    title: "You cannot access this route",
    description:
      "Your account is active, but this destination requires a different role or permission.",
  },
};

export function RouteAccessState({ kind, title, description }: RouteAccessStateProps) {
  const selected = content[kind];

  return (
    <RouteState
      kind={kind as RouteStateKind}
      eyebrow={selected.eyebrow}
      title={title ?? selected.title}
      description={description ?? selected.description}
      actions={
        <>
          {kind === "unauthorized" ? (
            <a className={styles.action} href="/login">
              Sign in
            </a>
          ) : null}
          <a className={styles.secondaryAction} href="/play">
            Return to Play
          </a>
        </>
      }
    />
  );
}
