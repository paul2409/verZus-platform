import { PlayEmptyState } from "./PlayEmptyState";
import { WidgetFrame } from "./WidgetFrame";
import styles from "./play-command-center.module.css";

export function DailyChallengesPanel() {
  return (
    <WidgetFrame title="DAILY CHALLENGES" status="NO ACTIVE SET" className={styles.challengesWidget}>
      <PlayEmptyState
        compact
        variant="challenge"
        title="CHALLENGES UNLOCK THROUGH PLAY"
        detail="Confirmed results and published seasons will activate your daily objective board."
        primaryAction={{ href: "/rewards", label: "VIEW PROGRESSION" }}
      >
        <div className={styles.emptyChallengePreview} aria-hidden="true">
          <span><b>MATCH</b><i /></span>
          <span><b>PERFORMANCE</b><i /></span>
          <span><b>CREW</b><i /></span>
        </div>
      </PlayEmptyState>
    </WidgetFrame>
  );
}
