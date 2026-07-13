// VERZUS M3 STEP 3.4

import { RouteState } from "./RouteState";
import styles from "./RouteBoundary.module.css";

export interface RouteLoadingProps {
  routeName?: string;
}

export function RouteLoading({ routeName = "this route" }: RouteLoadingProps) {
  return (
    <RouteState
      kind="loading"
      eyebrow="Synchronizing"
      title={`Loading ${routeName}`}
      description="VERZUS is preparing this area. Navigation and other shell controls remain available."
    >
      <div className={styles.skeleton} aria-hidden="true">
        <span className={styles.skeletonLine} />
        <span className={styles.skeletonLine} />
        <span className={styles.skeletonLine} />
      </div>
    </RouteState>
  );
}
