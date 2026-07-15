// VERZUS M5 STEPS 5.5-5.8

import Link from "next/link";

import { playScreenVariants, type PlayScreenVariant } from "../contracts";
import styles from "./play-command-center.module.css";

export function ScenarioToolbar({ active }: { active: PlayScreenVariant }) {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <nav className={styles.scenarioToolbar} aria-label="Development Play scenarios">
      <span>DEV SCENARIOS</span>
      <div>
        {playScreenVariants.map((scenario) => (
          <Link
            key={scenario}
            href={`/play?scenario=${scenario}`}
            aria-current={scenario === active ? "page" : undefined}
          >
            {scenario.replaceAll("_", " ")}
          </Link>
        ))}
      </div>
    </nav>
  );
}
