// VERZUS M11.5 MATCH HISTORY ROUTE ERROR BOUNDARY
"use client";

import Link from "next/link";

export default function ProfileMatchesError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main style={{ display: "grid", gap: "1rem", padding: "1.5rem" }}>
      <h1>Match history is unavailable</h1>
      <p>The profile shell is still available. Retry this route or return to the player profile.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
        <button type="button" onClick={reset}>
          Retry
        </button>
        <Link href="/profile">Back to profile</Link>
      </div>
    </main>
  );
}
