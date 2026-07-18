"use client";

// VERZUS M9.8 CREW RELEASE TELEMETRY

import { useEffect, useRef } from "react";

import type { CrewResourceHealth, CrewResourceName } from "../resources";
import { recordCrewTelemetry } from "./crew-telemetry.client";

export function CrewSurfaceTelemetry({
  crewId,
  surface,
}: {
  crewId?: string | null;
  surface: "profile" | "discovery" | "no_crew" | "creation";
}) {
  const recorded = useRef(false);

  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;
    recordCrewTelemetry({
      eventName: "crew_surface_viewed",
      surface,
      crewId: crewId ?? null,
      resource: null,
      authority: null,
      state: null,
      requestId: null,
    });
  }, [crewId, surface]);

  return null;
}

export function CrewResourceFailureTelemetry({
  crewId,
  health,
}: {
  crewId: string;
  health: Record<CrewResourceName, CrewResourceHealth>;
}) {
  const emitted = useRef(new Set<string>());

  useEffect(() => {
    for (const item of Object.values(health)) {
      if (item.state !== "error" && item.state !== "offline") continue;
      const key = `${item.name}:${item.state}:${item.requestId ?? "none"}`;
      if (emitted.current.has(key)) continue;
      emitted.current.add(key);
      recordCrewTelemetry({
        eventName: "crew_resource_failed",
        surface: "resource",
        crewId,
        resource: item.name,
        authority: null,
        state: item.state,
        requestId: item.requestId,
      });
    }
  }, [crewId, health]);

  return null;
}

export function CrewAuthorityTelemetry({
  crewId,
  authority,
  status,
  requestId = null,
}: {
  crewId: string;
  authority: "membership" | "governance" | "lifecycle";
  status: "loading" | "success" | "error";
  requestId?: string | null;
}) {
  const lastKey = useRef<string | null>(null);

  useEffect(() => {
    const key = `${authority}:${status}:${requestId ?? "none"}`;
    if (lastKey.current === key) return;
    lastKey.current = key;

    if (status === "error") {
      recordCrewTelemetry({
        eventName: "crew_authority_failed",
        surface: authority,
        crewId,
        resource: null,
        authority,
        state: status,
        requestId,
      });
    }
  }, [authority, crewId, requestId, status]);

  return null;
}

export function CrewLifecycleTelemetry({
  crewId,
  state,
}: {
  crewId: string;
  state: string | null;
}) {
  const lastState = useRef<string | null>(null);

  useEffect(() => {
    if (!state || lastState.current === state) return;
    lastState.current = state;
    recordCrewTelemetry({
      eventName: "crew_lifecycle_observed",
      surface: "lifecycle",
      crewId,
      resource: null,
      authority: "lifecycle",
      state,
      requestId: null,
    });
  }, [crewId, state]);

  return null;
}
