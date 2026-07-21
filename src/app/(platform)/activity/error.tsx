// VERZUS M12.5 ACTIVITY ROUTE ERROR BOUNDARY

"use client";

export default function ActivityError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main data-m12-stage="12.5" style={{ padding: "1rem" }}>
      <p>Activity route unavailable</p>
      <h1>The platform shell remains available</h1>
      <button onClick={reset} type="button">Retry activity route</button>
    </main>
  );
}
