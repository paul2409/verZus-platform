import "server-only";

import { timingSafeEqual } from "node:crypto";

import { serverEnv } from "@/lib/config/env.server";

function constantTimeEqual(actual: string, expected: string): boolean {
  const actualBytes = Buffer.from(actual);
  const expectedBytes = Buffer.from(expected);
  if (actualBytes.length !== expectedBytes.length) return false;
  return timingSafeEqual(actualBytes, expectedBytes);
}

export function authorizeProactiveOperations(authorizationHeader: string | null): boolean {
  const expected = serverEnv.proactiveOperationsToken;
  if (!expected) return false;
  if (!authorizationHeader?.startsWith("Bearer ")) return false;
  return constantTimeEqual(authorizationHeader.slice("Bearer ".length), expected);
}
