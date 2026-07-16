import type { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const MOCK_COMPETITION_ENTRY_COOKIE = "verzus_mock_competition_entries";

export const storedCompetitionEntrySchema = z.object({
  entryId: z.string().min(1),
  competitionId: z.string().min(1),
  competitionName: z.string().min(1),
  entrantLabel: z.string().min(1),
  teamLabel: z.string().min(1),
  registeredAt: z.string().datetime({ offset: true }),
  registrationCode: z.string().min(1),
  idempotencyKey: z.string().uuid(),
  stateVersion: z.string().min(1),
  entryFeeLabel: z.string().min(1),
  checkInLabel: z.string().min(1),
});

const storedCompetitionEntriesSchema = z.array(storedCompetitionEntrySchema).max(12);

export type StoredCompetitionEntry = z.infer<typeof storedCompetitionEntrySchema>;

function decode(value: string): StoredCompetitionEntry[] {
  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(value));
    const result = storedCompetitionEntriesSchema.safeParse(parsed);
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

export function readStoredCompetitionEntries(request: NextRequest): StoredCompetitionEntry[] {
  const value = request.cookies.get(MOCK_COMPETITION_ENTRY_COOKIE)?.value;
  return value ? decode(value) : [];
}

export function writeStoredCompetitionEntries(
  response: NextResponse,
  entries: StoredCompetitionEntry[],
): void {
  response.cookies.set(
    MOCK_COMPETITION_ENTRY_COOKIE,
    encodeURIComponent(JSON.stringify(entries.slice(-12))),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    },
  );
}
