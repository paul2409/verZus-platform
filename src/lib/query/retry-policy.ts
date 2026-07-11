import { ApiError } from "@/lib/errors/api-error";

const MAX_QUERY_RETRIES = 2;

export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_QUERY_RETRIES) return false;
  if (error instanceof ApiError) return error.retryable;
  return true;
}

export function retryDelay(attemptIndex: number): number {
  return Math.min(1_000 * 2 ** attemptIndex, 8_000);
}
