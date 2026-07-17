// VERZUS M7.1 MATCH OPERATIONS ROUTE

"use client";

export default function MatchOperationsError({ reset }: { reset: () => void }) {
  return (
    <main>
      <h1>Match operations unavailable</h1>
      <p>
        The match route failed independently. The platform shell and navigation remain available.
      </p>
      <button onClick={reset} type="button">
        Retry match route
      </button>
    </main>
  );
}
