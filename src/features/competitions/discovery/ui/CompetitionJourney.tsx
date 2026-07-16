import type { CompetitionJourneyStep } from "../model/competition-discovery.types";
import styles from "./CompetitionDiscovery.module.css";

export type CompetitionJourneyProps = {
  steps: CompetitionJourneyStep[];
};

export function CompetitionJourney({ steps }: CompetitionJourneyProps) {
  return (
    <ol aria-label="Competition journey" className={styles.journey}>
      {steps.map((step) => (
        <li key={step.id}>
          <span>{step.number}</span>
          <div>
            <strong>{step.label}</strong>
            <small>{step.description}</small>
          </div>
        </li>
      ))}
    </ol>
  );
}
