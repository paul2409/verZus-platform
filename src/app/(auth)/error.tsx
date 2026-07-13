// VERZUS M4 STEP 4.3
"use client";

import { AuthRouteError } from "@/features/auth";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <AuthRouteError error={error} reset={reset} />;
}
