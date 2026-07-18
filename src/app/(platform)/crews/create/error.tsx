"use client";

// VERZUS M9.3 CREW CREATION ERROR BOUNDARY

export default function CrewCreationError({ reset }: { reset: () => void }) {
  return (
    <main style={{ display: "grid", gap: "1rem", padding: "2rem" }}>
      <h1>Crew creation is temporarily unavailable</h1>
      <p>Your saved draft remains in this browser. Retry without losing the form.</p>
      <button onClick={reset} type="button">
        Retry Crew creation
      </button>
    </main>
  );
}
