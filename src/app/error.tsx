"use client";

import { useEffect } from "react";

type RootErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function RootError({ error, reset }: RootErrorProps) {
  useEffect(() => {
    console.error("Route error", { digest: error.digest, message: error.message });
  }, [error]);

  return (
    <main>
      <h1>This section is temporarily unavailable</h1>
      <p>Other VERZUS areas remain available. Retry this section when ready.</p>
      <button type="button" onClick={reset}>
        Retry
      </button>
    </main>
  );
}
