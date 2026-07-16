import { CompetitionDetailApiClientError } from "../api";
import type {
  CompetitionDetailResource,
  CompetitionDetailResourceData,
  CompetitionDetailResourceState,
} from "../model/competition-detail.types";

export type CompetitionDetailQuerySnapshot<TData> = {
  isPending: boolean;
  isError: boolean;
  isFetching: boolean;
  data: TData | null | undefined;
  error: Error | null;
};

function stateFromError(error: Error | null): CompetitionDetailResourceState {
  if (!(error instanceof CompetitionDetailApiClientError)) return "error";
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

export function competitionDetailResourceFromQuery<TValue>(
  query: CompetitionDetailQuerySnapshot<CompetitionDetailResourceData<TValue>>,
): CompetitionDetailResource<CompetitionDetailResourceData<TValue>> {
  if (query.isPending && !query.data) {
    return { state: "loading", data: null, errorCode: null, requestId: null, canRetry: false };
  }
  if (query.isError && !query.data) {
    const error = query.error;
    return {
      state: stateFromError(error),
      data: null,
      errorCode: error instanceof CompetitionDetailApiClientError ? error.code : "unknown_error",
      requestId: error instanceof CompetitionDetailApiClientError ? error.requestId : null,
      canRetry: error instanceof CompetitionDetailApiClientError ? error.retryable : true,
    };
  }
  const data = query.data ?? null;
  if (!data)
    return { state: "empty", data: null, errorCode: null, requestId: null, canRetry: true };
  if (query.isError) {
    return {
      state: "stale",
      data,
      errorCode: "refresh_failed",
      requestId: data.meta.requestId,
      canRetry: true,
    };
  }
  if (query.isFetching || data.meta.freshness === "stale") {
    return {
      state: query.isFetching ? "retrying" : "stale",
      data,
      errorCode: null,
      requestId: data.meta.requestId,
      canRetry: true,
    };
  }
  return {
    state: "success",
    data,
    errorCode: null,
    requestId: data.meta.requestId,
    canRetry: true,
  };
}
