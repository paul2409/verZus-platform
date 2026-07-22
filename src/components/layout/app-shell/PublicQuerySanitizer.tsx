"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const INTERNAL_QUERY_PARAMETERS = new Set([
  "scenario",
  "resource",
  "widget",
  "widgetScenario",
  "accountScenario",
  "intelScenario",
  "viewer",
  "crash",
  "delay",
  "mock",
  "fixture",
  "failureMode",
]);

export function PublicQuerySanitizer() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const next = new URLSearchParams(searchParams.toString());
    let changed = false;

    for (const key of INTERNAL_QUERY_PARAMETERS) {
      if (!next.has(key)) continue;
      next.delete(key);
      changed = true;
    }

    if (!changed) return;

    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  return null;
}
