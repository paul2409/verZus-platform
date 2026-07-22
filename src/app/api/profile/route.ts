import type { NextRequest } from "next/server";

import { handleProfileEditGet, handleProfileEditPatch } from "@/features/profiles/edit/server";

export const dynamic = "force-dynamic";
export function GET(request: NextRequest) {
  return handleProfileEditGet(request);
}
export function PATCH(request: NextRequest) {
  return handleProfileEditPatch(request);
}
