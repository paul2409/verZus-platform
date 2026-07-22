import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getServerAuthSession } from "@/features/auth/server/auth-session.server";

import { serializeRewardAchievementDetail } from "./reward-achievement-detail.service";

export async function handleRewardAchievementDetailGet(
  _request: NextRequest,
  context: { params: Promise<{ achievementId: string }> },
): Promise<NextResponse> {
  const requestId = `reward-achievement-detail-${crypto.randomUUID()}`;
  const session = await getServerAuthSession();
  if (session.state !== "authenticated" || !session.user) {
    return NextResponse.json(
      {
        error: {
          code: "REWARD_ACHIEVEMENT_UNAUTHORIZED",
          message: "Authentication is required to view achievements.",
          request_id: requestId,
          retryable: false,
        },
      },
      { status: 401, headers: { "cache-control": "no-store", "x-request-id": requestId } },
    );
  }

  const { achievementId } = await context.params;
  const data = await serializeRewardAchievementDetail(session.user.id, achievementId);
  if (!data) {
    return NextResponse.json(
      {
        error: {
          code: "REWARD_ACHIEVEMENT_NOT_FOUND",
          message: "The requested achievement was not found.",
          request_id: requestId,
          retryable: false,
        },
      },
      { status: 404, headers: { "cache-control": "no-store", "x-request-id": requestId } },
    );
  }

  return NextResponse.json(
    { data, meta: { request_id: requestId, fetched_at: new Date().toISOString() } },
    { headers: { "cache-control": "no-store", "x-request-id": requestId } },
  );
}
