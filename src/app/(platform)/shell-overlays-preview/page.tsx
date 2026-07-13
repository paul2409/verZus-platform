// VERZUS M3 STEP 3.6

import { ShellOverlaysPreviewClient } from "./ShellOverlaysPreviewClient";
import styles from "./page.module.css";

export default function ShellOverlaysPreviewPage() {
  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <p>M3 Step 3.6</p>
        <h1>Global Drawers and Status Behaviour</h1>
        <p>
          Shell-wide overlays remain independent of page APIs. Search, notifications, profile
          controls, service banners and route progress remain accessible across every production
          route.
        </p>
      </header>

      <ShellOverlaysPreviewClient />
    </div>
  );
}
