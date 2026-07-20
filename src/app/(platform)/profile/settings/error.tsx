// VERZUS M11.7 PROFILE SETTINGS ROUTE ERROR

"use client";

export default function ProfileSettingsError({ reset }: { reset: () => void }) {
  return (
    <main style={{ display: "grid", gap: "0.75rem", padding: "1rem" }}>
      <h1>Profile settings could not open</h1>
      <p>The rest of VERZUS remains available.</p>
      <button onClick={reset} type="button">
        Retry settings
      </button>
    </main>
  );
}
