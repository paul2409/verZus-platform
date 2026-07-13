// VERZUS M3 STEP 3.6

import { GlobalStatusBar } from "./GlobalStatusBar";
import styles from "./ShellOverlays.module.css";
import type { GlobalShellStatus } from "./shell.types";

export interface ShellStatusRegionProps {
  status: GlobalShellStatus;
  routeLoading: boolean;
}

export function ShellStatusRegion({ status, routeLoading }: ShellStatusRegionProps) {
  const announcement = routeLoading
    ? "Loading the selected route."
    : status.kind === "operational"
      ? "All platform systems are operational."
      : `${status.label}. ${status.detail ?? ""}`.trim();

  return (
    <div className={styles.statusRegion}>
      <GlobalStatusBar detail={status.detail} kind={status.kind} label={status.label} />

      {routeLoading ? (
        <div className={styles.loadingNotice} role="status">
          <span aria-hidden="true" className={styles.loadingDot} />
          Loading route
        </div>
      ) : null}

      <p aria-live="polite" className={styles.visuallyHidden}>
        {announcement}
      </p>
    </div>
  );
}
