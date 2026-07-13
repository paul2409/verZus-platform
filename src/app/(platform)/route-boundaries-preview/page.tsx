// VERZUS M3 STEP 3.4

import {
  RouteAccessState,
  RouteLoading,
  RouteNotFound,
  RouteState,
} from "@/components/layout/route-boundary";

import styles from "./page.module.css";

export default function RouteBoundariesPreviewPage() {
  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <p>M3 Step 3.4</p>
        <h1>Route-Level Boundaries</h1>
        <p>
          These states render inside the persistent platform shell. A failed, loading, missing,
          offline, or restricted route does not remove global navigation.
        </p>
      </header>

      <div className={styles.grid}>
        <RouteLoading routeName="Play" />
        <RouteState
          kind="error"
          eyebrow="Isolated route failure"
          title="Matches are temporarily unavailable"
          description="The route failed independently. Navigation and other platform routes remain operational."
          errorId="MATCHES-ROUTE-001"
        />
        <RouteNotFound routeName="Competition" />
        <RouteAccessState kind="offline" />
        <RouteAccessState kind="maintenance" />
        <RouteAccessState kind="unauthorized" />
        <RouteAccessState kind="forbidden" />
      </div>
    </div>
  );
}
