// VERZUS M5 STEPS 5.9-5.13

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getPlatformRouteById } from "@/components/layout/app-shell";
import { isPlayCommandCenterEnabled } from "@/features/play/config/play-feature-flags";
import { playScenarioSchema, type PlayScenario } from "@/features/play/model";
import { PlayCommandCenter, PlayDisabledState } from "@/features/play/ui";
import {
  authStateFromMockSession,
  isMockSessionEnabled,
  MOCK_SESSION_COOKIE,
} from "@/shared/session/mock-session";

const route = getPlatformRouteById("play");

export const metadata: Metadata = {
  title: route.title,
  description: route.description,
};

type PlayPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstSearchValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PlayPage({ searchParams }: PlayPageProps) {
  if (!isPlayCommandCenterEnabled()) {
    return <PlayDisabledState />;
  }

  const params = await searchParams;
  const rawScenario = firstSearchValue(params.scenario);
  const parsed = playScenarioSchema.safeParse(rawScenario);
  const scenario: PlayScenario = parsed.success ? parsed.data : "normal";

  if (
    rawScenario !== undefined &&
    isMockSessionEnabled() &&
    process.env.NODE_ENV !== "production"
  ) {
    const cookieStore = await cookies();
    const authState = authStateFromMockSession(cookieStore.get(MOCK_SESSION_COOKIE)?.value ?? null);

    if (authState !== "authenticated") {
      redirect(`/api/dev/m5-session?scenario=${encodeURIComponent(scenario)}`);
    }
  }

  return <PlayCommandCenter scenario={scenario} />;
}
