// VERZUS M3 STEP 3.5

import { WidgetBoundaryPreviewClient } from "./WidgetBoundaryPreviewClient";
import styles from "./page.module.css";

export default function WidgetBoundariesPreviewPage() {
  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <p>M3 Step 3.5</p>
        <h1>Widget Boundary System</h1>
        <p>
          Major sections fail independently. A Crew, leaderboard, activity, or recommendation
          failure cannot remove navigation or unrelated widgets.
        </p>
      </header>

      <WidgetBoundaryPreviewClient />
    </div>
  );
}
