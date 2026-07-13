// VERZUS M3 STEP 3.7
"use client";

import { RouteError } from "@/components/layout/route-boundary";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError error={error} reset={reset} routeName="Shell audit route" />;
}
