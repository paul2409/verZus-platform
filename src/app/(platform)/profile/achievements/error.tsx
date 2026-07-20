// VERZUS M11.6 PROFILE INSIGHT ROUTE ERROR BOUNDARY

"use client";

export default function ProfileAchievementsError({ reset }: { reset: () => void }) {
  return (
    <main style={{ display: "grid", gap: "0.75rem", padding: "1rem" }}>
      <h1>Player progression unavailable</h1>
      <p>The profile shell remains available. Retry only this route.</p>
      <button onClick={reset} type="button">
        Retry progression
      </button>
    </main>
  );
}
