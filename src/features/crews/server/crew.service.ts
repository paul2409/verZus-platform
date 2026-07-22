import "server-only";

import { z } from "zod";

import { crewCreationAssetPaths } from "../creation/model/crew-creation.types";
import type { CrewCreationRecord } from "../creation/model/crew-creation.types";
import type { CrewDiscoveryRecord } from "../discovery/model/crew-discovery.types";
import type { CrewResourceName } from "../resources/model/crew-resource.types";
import {
  CrewRepositoryConflict,
  createCrew,
  findCrewById,
  findCurrentCrewForUser,
  getViewerCrewRole,
  listCrewAchievements,
  listCrewApplications,
  listCrewEvents,
  listCrewMembers,
  listDiscoverableCrews,
} from "./crew.repository";

const createCrewSchema = z.object({
  submissionId: z.string().min(8).max(128),
  name: z.string().trim().min(3).max(30),
  tag: z.string().trim().min(2).max(5).regex(/^[A-Z0-9]+$/),
  description: z.string().trim().min(20).max(280),
  primaryGame: z.enum(["EA FC", "COD Mobile", "Clash Royale", "League of Legends"]),
  region: z.enum(["Nigeria", "West Africa", "Global"]),
  crestPreset: z.enum(["neon-v", "orbit", "strike"]),
  bannerPreset: z.enum(["neon-grid", "cosmic", "stadium"]),
  visibility: z.enum(["public", "private"]),
  recruiting: z.boolean(),
  language: z.enum(["English", "French", "Portuguese"]),
  minimumRank: z.enum(["Open", "Gold", "Platinum", "Diamond", "Elite"]),
});

export class CrewServiceError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
    readonly retryable: boolean,
    readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "CrewServiceError";
  }
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function accent(index: number): CrewDiscoveryRecord["accent"] {
  return (["purple", "cyan", "gold", "green", "red", "blue"] as const)[index % 6] ?? "purple";
}

function winRate(wins: number, losses: number): number {
  const total = wins + losses;
  return total === 0 ? 0 : Math.round((wins / total) * 100);
}

function dateLabel(value: Date): string {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(value);
}

function relativeLabel(value: Date): string {
  const deltaMinutes = Math.max(0, Math.floor((Date.now() - value.getTime()) / 60_000));
  if (deltaMinutes < 1) return "Just now";
  if (deltaMinutes < 60) return `${deltaMinutes}m ago`;
  const hours = Math.floor(deltaMinutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return dateLabel(value);
}

export async function getCrewRootState(userId: string): Promise<{
  currentCrewId: string | null;
  crews: CrewDiscoveryRecord[];
}> {
  const [current, crews] = await Promise.all([
    findCurrentCrewForUser(userId),
    listDiscoverableCrews(userId),
  ]);

  return {
    currentCrewId: current?.id ?? null,
    crews: crews.map((crew, index) => ({
      id: crew.id,
      name: crew.name,
      tag: crew.tag,
      initials: initials(crew.name) || crew.tag.slice(0, 2),
      accent: accent(index),
      description: crew.description,
      verified: crew.verified,
      lifecycle: crew.lifecycle,
      games: [crew.primaryGame] as CrewDiscoveryRecord["games"],
      region: crew.region as CrewDiscoveryRecord["region"],
      visibility: crew.visibility,
      recruiting: crew.recruiting ? "open" : "closed",
      memberCount: crew.memberCount,
      capacity: crew.capacity,
      rank: crew.rank,
      points: crew.points,
      winRate: winRate(crew.wins, crew.losses),
      trust: crew.trust,
      minimumRank: crew.minimumRank,
      recommendationScore: 0,
    })),
  };
}

export async function getCurrentCrewId(userId: string): Promise<string | null> {
  return (await findCurrentCrewForUser(userId))?.id ?? null;
}

export async function createCrewForUser(input: {
  userId: string;
  body: unknown;
  idempotencyKey: string | null;
  requestId: string;
}): Promise<CrewCreationRecord> {
  const parsed = createCrewSchema.safeParse(input.body);
  if (!parsed.success) {
    throw new CrewServiceError(
      "CREW_CREATE_VALIDATION_ERROR",
      "Review the Crew details and try again.",
      400,
      false,
      parsed.error.flatten().fieldErrors as Record<string, string[]>,
    );
  }

  const key = input.idempotencyKey?.trim() || parsed.data.submissionId;
  if (key.length < 8 || key.length > 128) {
    throw new CrewServiceError(
      "CREW_CREATE_INVALID_IDEMPOTENCY_KEY",
      "A valid creation submission identifier is required.",
      400,
      false,
    );
  }

  try {
    const crew = await createCrew({
      userId: input.userId,
      idempotencyKey: key,
      name: parsed.data.name,
      tag: parsed.data.tag,
      description: parsed.data.description,
      primaryGame: parsed.data.primaryGame,
      region: parsed.data.region,
      crestSrc: crewCreationAssetPaths.crest[parsed.data.crestPreset],
      bannerSrc: crewCreationAssetPaths.banner[parsed.data.bannerPreset],
      visibility: parsed.data.visibility,
      recruiting: parsed.data.recruiting,
      language: parsed.data.language,
      minimumRank: parsed.data.minimumRank,
      requestId: input.requestId,
    });

    return {
      id: crew.id,
      createdAt: crew.createdAt.toISOString(),
      lifecycle: "forming",
      memberCount: 1,
      owner: { id: input.userId, name: "You", role: "owner" },
      identity: {
        name: crew.name,
        tag: crew.tag,
        description: crew.description,
        primaryGame: parsed.data.primaryGame,
        region: parsed.data.region,
        crestSrc: crew.crestSrc,
        bannerSrc: crew.bannerSrc,
        visibility: crew.visibility,
      },
      settings: {
        recruiting: crew.recruiting,
        language: parsed.data.language,
        minimumRank: parsed.data.minimumRank,
      },
      submissionId: parsed.data.submissionId,
    };
  } catch (error) {
    if (error instanceof CrewRepositoryConflict) {
      if (error.field === "membership") {
        throw new CrewServiceError(
          "CREW_MEMBERSHIP_EXISTS",
          "You already belong to a Crew.",
          409,
          false,
        );
      }
      throw new CrewServiceError(
        "CREW_IDENTITY_CONFLICT",
        `That Crew ${error.field} is already in use.`,
        409,
        false,
        { [error.field]: [`That Crew ${error.field} is already in use.`] },
      );
    }
    throw error;
  }
}

export async function serializeCrewResource(
  viewerUserId: string,
  crewId: string,
  resource: CrewResourceName,
): Promise<unknown | null> {
  const crew = await findCrewById(crewId);
  if (!crew) return null;

  switch (resource) {
    case "profile":
      return {
        identity: {
          id: crew.id,
          name: crew.name,
          tag: crew.tag,
          tagline: crew.tagline,
          description: crew.description,
          crest_src: crew.crestSrc,
          banner_src: crew.bannerSrc,
          verified: crew.verified,
          tier: crew.tier,
          games: [crew.primaryGame],
          member_count: crew.memberCount,
          region: crew.region,
          visibility: crew.visibility,
          founded_at_label: `Founded ${dateLabel(crew.createdAt)}`,
          lifecycle: crew.lifecycle,
        },
      };
    case "roster": {
      const members = await listCrewMembers(crewId);
      return {
        members: members.map((member) => ({
          id: member.userId,
          name: member.displayName,
          handle: member.handle,
          initials: initials(member.displayName) || "P",
          role: member.role,
          contribution: member.contribution,
          status: "offline" as const,
        })),
      };
    }
    case "requests": {
      const applications = await listCrewApplications(crewId, viewerUserId);
      return {
        requests: applications.map((application) => ({
          id: application.id,
          player_name: application.playerName,
          handle: application.handle,
          game: application.game,
          trust: application.trust,
          status: application.status,
        })),
      };
    }
    case "activity": {
      const events = await listCrewEvents(crewId);
      return {
        activity: events.map((event) => ({
          id: event.id,
          title: event.title,
          game: event.game,
          occurred_at_label: relativeLabel(event.createdAt),
          score_label: event.scoreLabel,
          tone: event.tone,
        })),
      };
    }
    case "rankings":
      return {
        stats: {
          rank: crew.rank,
          movement:
            crew.rank > 0 && crew.previousRank > 0 ? crew.previousRank - crew.rank : 0,
          points: crew.points,
          wins: crew.wins,
          losses: crew.losses,
          win_rate: winRate(crew.wins, crew.losses),
          streak: crew.streak,
          trust: crew.trust,
          active_members: 0,
        },
      };
    case "achievements":
      return { achievements: await listCrewAchievements(crewId) };
    case "settings":
      return {
        settings: {
          recruiting: crew.recruiting,
          primary_game: crew.primaryGame,
          language: crew.language,
          minimum_rank: crew.minimumRank,
          community_link_label: crew.communityLinkLabel,
        },
      };
  }
}

export async function readCurrentCrewForProfile(userId: string): Promise<{
  id: string;
  name: string;
  tag: string;
  roleLabel: string;
} | null> {
  const crew = await findCurrentCrewForUser(userId);
  if (!crew) return null;
  const role = await getViewerCrewRole(crew.id, userId);
  return {
    id: crew.id,
    name: crew.name,
    tag: crew.tag,
    roleLabel: role ? role.charAt(0).toUpperCase() + role.slice(1) : "Member",
  };
}

export async function readCrewSummaryForPlay(userId: string): Promise<unknown | null> {
  const crew = await findCurrentCrewForUser(userId);
  if (!crew) return null;
  return {
    crew_id: crew.id,
    name: crew.name,
    tag: crew.tag,
    emblem_url: null,
    rank: crew.rank,
    points: crew.points,
    online_members: 0,
    total_members: crew.memberCount,
    live_activity_count: 0,
    next_fixture_label: null,
    next_fixture_at: null,
    last_updated_at: crew.updatedAt.toISOString(),
  };
}
