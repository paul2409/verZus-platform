"use client";

import { useEffect } from "react";

import { SystemStateScreen } from "@/components/layout/system-state";

type RootErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function RootError({ error, reset }: RootErrorProps) {
  useEffect(() => {
    console.error("Route error", { digest: error.digest, message: error.message });
  }, [error]);

  return (
    <SystemStateScreen
      action={
        <button onClick={reset} type="button">
          Retry section
        </button>
      }
      description="This route failed independently. Other VERZUS areas remain available."
      eyebrow="ROUTE FAILURE"
      reference={error.digest ?? "ROUTE-UNAVAILABLE"}
      title="SECTION TEMPORARILY UNAVAILABLE"
      tone="error"
    />
  );
}
