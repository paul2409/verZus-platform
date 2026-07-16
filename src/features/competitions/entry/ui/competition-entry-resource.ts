import { CompetitionEntryApiClientError } from "../api";
import type {
  CompetitionEntryControlResourceData,
  CompetitionEntryResource,
} from "../model/competition-entry.types";

export type CompetitionEntryQuerySnapshot = {
  isPending: boolean;
  isError: boolean;
  isFetching: boolean;
  data: CompetitionEntryControlResourceData | null | undefined;
  error: Error | null;
};

function stateFromError(error: Error | null): CompetitionEntryResource["state"] {
  if (!(error instanceof CompetitionEntryApiClientError)) return "error";
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

export function competitionEntryResourceFromQuery(
  query: CompetitionEntryQuerySnapshot,
): CompetitionEntryResource {
  if (query.isPending && !query.data) {
    return { state: "loading", data: null, errorCode: null, requestId: null, canRetry: false };
  }
  if (query.isError && !query.data) {
    return {
      state: stateFromError(query.error),
      data: null,
      errorCode:
        query.error instanceof CompetitionEntryApiClientError ? query.error.code : "unknown_error",
      requestId:
        query.error instanceof CompetitionEntryApiClientError ? query.error.requestId : null,
      canRetry:
        query.error instanceof CompetitionEntryApiClientError ? query.error.retryable : true,
    };
  }

  const data = query.data ?? null;
  if (!data) {
    return { state: "empty", data: null, errorCode: null, requestId: null, canRetry: true };
  }
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
