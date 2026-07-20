// VERZUS M11.8 PROFILE DOMAIN RELEASE HEALTH ENDPOINT

import { NextResponse } from "next/server";

import { getProfileReleaseConfig } from "@/features/profiles/release";

export async function GET() {
  const config = getProfileReleaseConfig();

  return NextResponse.json(
    {
      status: config.profilesEnabled ? "ready" : "disabled",
      feature: "profiles",
      stage: "11.8",
      release: config.releaseSha,
      environment: config.appEnvironment,
      capabilities: {
        ownProfile: "ready",
        publicProjection: "ready",
        profileEditing: "ready",
        matchHistory: "ready",
        achievements: "ready",
        gameIdentities: "ready",
        trustHistory: "ready",
        privacyControls: "ready",
        accountStates: "ready",
        featureIsolation: "ready",
        telemetry: "ready",
        immutablePackaging: "ready",
      },
    },
    {
      status: 200,
      headers: {
        "cache-control": "no-store",
        "x-verzus-feature": "profiles",
        "x-verzus-stage": "11.8",
      },
    },
  );
}
