// VERZUS M12.6 SEARCH RELIABILITY MAPPING

import type { ResourceFailureDescriptor } from "@/lib/reliability/resource-reliability";
import { classifyResourceFailure } from "@/lib/reliability/resource-reliability";

import type { SearchResourceHealth } from "../resources/model/search-resource.types";

export function describeSearchResourceHealth(
  label: string,
  health: SearchResourceHealth,
): ResourceFailureDescriptor {
  return classifyResourceFailure({
    resourceLabel: `${label} Search`,
    code: health.code,
    message: health.message,
    requestId: health.requestId,
    retryable: health.retryable,
    status:
      health.state === "unauthorized" ? 401
        : health.state === "forbidden" ? 403
          : health.state === "not-found" ? 404
            : undefined,
  });
}
