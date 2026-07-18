// VERZUS M9.1 CREW PROFILE ERROR BOUNDARY
"use client";

import { RouteError } from "@/components/layout/route-boundary";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError error={error} reset={reset} routeName="Crew Profile" />;
}
