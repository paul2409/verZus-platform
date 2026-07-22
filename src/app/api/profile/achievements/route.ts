import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getServerAuthSession } from "@/features/auth/server/auth-session.server";
import { listAchievementSummaries } from "@/features/rewards/server";

const categories = new Set(["competitive", "crew", "trust", "season"]);
const states = new Set(["unlocked", "in-progress", "locked"]);

function pageNumber(value: string | null): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function formatDate(value: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export async function GET(request: NextRequest) {
  const requestId = `profile-achievements-${crypto.randomUUID()}`;
  const session = await getServerAuthSession();
  if (session.state !== "authenticated" || !session.user) {
    return NextResponse.json(
      {
        error: {
          code: "PROFILE_ACHIEVEMENTS_UNAUTHORIZED",
          message: "Authentication is required to view achievements.",
          request_id: requestId,
          retryable: false,
        },
      },
      { status: 401, headers: { "cache-control": "no-store", "x-request-id": requestId } },
    );
  }

  const categoryParam = request.nextUrl.searchParams.get("category") ?? "all";
  const stateParam = request.nextUrl.searchParams.get("state") ?? "all";
  const category = categories.has(categoryParam) ? categoryParam : "all";
  const state = states.has(stateParam) ? stateParam : "all";
  const requestedPage = pageNumber(request.nextUrl.searchParams.get("page"));
  const pageSize = 6;

  const all = await listAchievementSummaries(session.user.id);
  const counted = all.map((item) => ({
    ...item,
    profileState: item.unlocked_at
      ? "unlocked"
      : item.progress_current > 0
        ? "in-progress"
        : "locked",
  }));
  const filtered = counted.filter(
    (item) =>
      (category === "all" || item.category_label === category) &&
      (state === "all" || item.profileState === state),
  );
  const totalPages = filtered.length === 0 ? 0 : Math.ceil(filtered.length / pageSize);
  const page = totalPages === 0 ? 1 : Math.min(requestedPage, totalPages);
  const start = (page - 1) * pageSize;

  const payload = {
    data: {
      entries: filtered.slice(start, start + pageSize).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category_label,
        rarity: item.rarity,
        state: item.profileState,
        progress_current: item.progress_current,
        progress_target: item.progress_target,
        progress_label: `${item.progress_current} / ${item.progress_target}`,
        unlocked_at_label: item.unlocked_at ? formatDate(item.unlocked_at) : null,
        reward_label: item.reward_id,
        evidence_label: item.requirement_label,
      })),
      page,
      page_size: pageSize,
      total_entries: filtered.length,
      total_pages: totalPages,
      unlocked_count: counted.filter((item) => item.profileState === "unlocked").length,
      in_progress_count: counted.filter((item) => item.profileState === "in-progress").length,
      locked_count: counted.filter((item) => item.profileState === "locked").length,
      freshness: "fresh",
    },
    meta: { request_id: requestId, generated_at: new Date().toISOString() },
  };

  return NextResponse.json(payload, {
    headers: { "x-request-id": requestId, "cache-control": "no-store" },
  });
}
