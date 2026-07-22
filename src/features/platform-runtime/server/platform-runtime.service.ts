import "server-only";

import type { ShellProfile } from "@/components/layout/app-shell";

import { findPlatformShellProfile } from "./platform-runtime.repository";

function initialsFor(value: string): string {
  const initials = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "P";
}

export async function getProductionPlatformShellProfile(userId: string): Promise<ShellProfile> {
  const record = await findPlatformShellProfile(userId);

  if (!record) {
    return {
      name: "Player",
      initials: "P",
      presence: "online",
      points: 0,
    };
  }

  return {
    name: record.name,
    ...(record.handle ? { handle: record.handle } : {}),
    ...(record.title ? { title: record.title } : {}),
    ...(record.avatarSrc ? { avatarSrc: record.avatarSrc } : {}),
    initials: initialsFor(record.name),
    presence: "online",
    points: record.points,
    ...(record.crewName ? { crewName: record.crewName } : {}),
  };
}
