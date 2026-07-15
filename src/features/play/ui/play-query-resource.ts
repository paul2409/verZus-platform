// VERZUS M5 STEPS 5.5-5.8

import type { PlayWidgetState } from "../contracts";
import { PlayApiClientError } from "../api";
import { createPlayResource, type PlayResource } from "../view-model";

export interface PlayQuerySnapshot<T> {
  isPending: boolean;
  isError: boolean;
  isFetching: boolean;
  data: T | null | undefined;
  error: Error | null;
}

function stateFromError(error: Error | null): PlayWidgetState {
  if (!(error instanceof PlayApiClientError)) {
    return "error";
  }

  switch (error.code) {
    case "offline":
      return "offline";
    case "unauthorized":
      return "unauthorized";
    case "forbidden":
      return "forbidden";
    case "not_found":
      return "not_found";
    case "maintenance":
    case "service_unavailable":
      return "maintenance";
    case "upstream_unavailable":
      return "partial_failure";
    default:
      return "error";
  }
}

export function playResourceFromQuery<T>(
  query: PlayQuerySnapshot<T>,
  isEmpty: (data: T) => boolean = () => false,
): PlayResource<T> {
  if (query.isPending) {
    return createPlayResource<T>("loading", null);
  }

  if (query.isError) {
    const error = query.error;
    const errorCode = error instanceof PlayApiClientError ? error.code : "unknown_error";
    const requestId = error instanceof PlayApiClientError ? error.requestId : null;

    return createPlayResource<T>(stateFromError(error), null, errorCode, requestId);
  }

  const data = query.data ?? null;

  if (data === null) {
    return createPlayResource<T>("empty", null);
  }

  if (isEmpty(data)) {
    return createPlayResource("empty", data);
  }

  if (query.isFetching) {
    return createPlayResource("stale", data);
  }

  return createPlayResource("success", data);
}
