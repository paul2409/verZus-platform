// VERZUS M3 STEP 3.4

import { RouteState } from "./RouteState";
import styles from "./RouteBoundary.module.css";

export interface RouteNotFoundProps {
  routeName?: string;
}

export function RouteNotFound({ routeName = "Requested destination" }: RouteNotFoundProps) {
  return (
    <RouteState
      kind="not-found"
      eyebrow="Route not found"
      title={`${routeName} could not be located`}
      description="The destination may have moved, expired, or never existed. Core navigation remains available."
      actions={
        <>
          <a className={styles.action} href="/play">
            Go to Play
          </a>
          <a className={styles.secondaryAction} href="/search">
            Search VERZUS
          </a>
        </>
      }
    />
  );
}
