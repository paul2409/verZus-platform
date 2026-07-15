// VERZUS M5 STEPS 5.9-5.13

import type { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const MOCK_PLAY_CHECK_IN_COOKIE = "verzus_mock_play_check_in";

export const storedMockCheckInSchema = z.object({
  matchId: z.string().min(1),
  checkedInAt: z.string().datetime({ offset: true }),
  idempotencyKey: z.string().uuid(),
});

export type StoredMockCheckIn = z.infer<typeof storedMockCheckInSchema>;

function decode(value: string): StoredMockCheckIn | null {
  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(value));
    const result = storedMockCheckInSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function readStoredMockCheckIn(request: NextRequest): StoredMockCheckIn | null {
  const value = request.cookies.get(MOCK_PLAY_CHECK_IN_COOKIE)?.value;
  return value ? decode(value) : null;
}

export function writeStoredMockCheckIn(response: NextResponse, record: StoredMockCheckIn): void {
  response.cookies.set(MOCK_PLAY_CHECK_IN_COOKIE, encodeURIComponent(JSON.stringify(record)), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 2 * 60 * 60,
  });
}
