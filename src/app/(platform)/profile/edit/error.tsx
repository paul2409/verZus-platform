// VERZUS M11.3 PROFILE EDIT ROUTE ERROR STATE

"use client";

export default function ProfileEditError({ reset }: { reset: () => void }) {
  return (
    <main
      style={{
        display: "grid",
        gap: "1rem",
        maxWidth: "42rem",
        margin: "3rem auto",
        padding: "1rem",
      }}
    >
      <p style={{ color: "#c7a7ff", margin: 0, textTransform: "uppercase" }}>
        Profile editor unavailable
      </p>
      <h1 style={{ margin: 0 }}>Your confirmed profile is still safe.</h1>
      <p style={{ margin: 0, color: "#aeb6c5" }}>
        The editor failed independently. Return to the profile or retry this route.
      </p>
      <button
        onClick={reset}
        style={{ minHeight: "2.75rem", width: "fit-content", padding: "0.6rem 1rem" }}
        type="button"
      >
        Retry editor
      </button>
    </main>
  );
}
