import { Button } from "@/components/primitives/button";

import styles from "./page.module.css";

function ArrowRightIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4v1a4 4 0 0 0 4 4" />
      <path d="M17 6h3v1a4 4 0 0 1-4 4" />
    </svg>
  );
}

export default function ButtonPreviewPage() {
  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <header className={styles.header}>
          <p className="vz-eyebrow">M2 // Button System</p>
          <h1 className="vz-heading-lg">VERZUS Actions</h1>
          <p className="vz-body-md">
            Shared actions for matches, competitions, leaderboards, crews, rewards, and platform
            operations.
          </p>
        </header>

        <section className={styles.section}>
          <h2 className="vz-heading-sm">Variants</h2>

          <div className={styles.buttonGrid}>
            <Button trailingIcon={<ArrowRightIcon />}>Play now</Button>

            <Button variant="secondary" trailingIcon={<ArrowRightIcon />}>
              View leaderboard
            </Button>

            <Button variant="accent" trailingIcon={<ArrowRightIcon />}>
              Join competition
            </Button>

            <Button variant="ghost">Learn more</Button>

            <Button variant="danger">Forfeit match</Button>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className="vz-heading-sm">Sizes</h2>

          <div className={styles.row}>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className="vz-heading-sm">States</h2>

          <div className={styles.buttonGrid}>
            <Button>Default</Button>
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
            <Button
              variant="secondary"
              leadingIcon={<TrophyIcon />}
              trailingIcon={<ArrowRightIcon />}
            >
              With icons
            </Button>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className="vz-heading-sm">Full-width action</h2>

          <Button fullWidth size="lg" trailingIcon={<ArrowRightIcon />}>
            Continue to check-in
          </Button>
        </section>
      </section>
    </main>
  );
}
