"use client";

// VERZUS M11.2 PUBLIC PROFILE ROUTE ERROR

export default function PublicPlayerError({ reset }: { reset: () => void }) {
  return (
    <main data-m11-stage="11.2">
      <div className="vz-route-boundary vz-route-boundary--error">
        <h1>Player profile unavailable</h1>
        <p>The public profile could not be loaded. Other VERZUS features remain available.</p>
        <button onClick={reset} type="button">
          Retry profile
        </button>
      </div>
    </main>
  );
}
