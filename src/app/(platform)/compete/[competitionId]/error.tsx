"use client";

export default function CompetitionDetailError({ reset }: { reset: () => void }) {
  return (
    <main>
      <h1>Competition detail unavailable</h1>
      <p>The route failed independently from Compete.</p>
      <button onClick={reset} type="button">
        Retry
      </button>
    </main>
  );
}
