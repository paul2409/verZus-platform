// VERZUS M9.4 CREW RESOURCE MOCK SERVICE

import { getCrewFoundationMock } from "../../foundation";
import type { CrewResourceName, CrewResourceScenario } from "../model/crew-resource.types";

export function normalizeCrewResourceScenario(value: string | null): CrewResourceScenario {
  switch (value) {
    case "stale":
    case "empty":
    case "error":
    case "malformed":
    case "slow":
    case "offline":
      return value;
    default:
      return "normal";
  }
}

export function serializeCrewResource(
  crewId: string,
  resource: CrewResourceName,
  scenario: CrewResourceScenario,
): unknown {
  const model = getCrewFoundationMock(crewId);
  const empty = scenario === "empty";

  switch (resource) {
    case "profile":
      return {
        identity: {
          id: model.identity.id,
          name: model.identity.name,
          tag: model.identity.tag,
          tagline: model.identity.tagline,
          description: model.identity.description,
          crest_src: model.identity.crestSrc,
          banner_src: model.identity.bannerSrc,
          verified: model.identity.verified,
          tier: model.identity.tier,
          games: model.identity.games,
          member_count: empty ? 0 : model.identity.memberCount,
          region: model.identity.region,
          visibility: model.identity.visibility,
          founded_at_label: model.identity.foundedAtLabel,
          lifecycle: model.identity.lifecycle,
        },
      };
    case "roster":
      return { members: empty ? [] : model.members };
    case "requests":
      return {
        requests: empty
          ? []
          : model.requests.map((item) => ({
              id: item.id,
              player_name: item.playerName,
              handle: item.handle,
              game: item.game,
              trust: item.trust,
              status: item.status,
            })),
      };
    case "activity":
      return {
        activity: empty
          ? []
          : model.activity.map((item) => ({
              id: item.id,
              title: item.title,
              game: item.game,
              occurred_at_label: item.occurredAtLabel,
              score_label: item.scoreLabel,
              tone: item.tone,
            })),
      };
    case "rankings":
      return {
        stats: {
          rank: model.stats.rank,
          movement: model.stats.movement,
          points: empty ? 0 : model.stats.points,
          wins: empty ? 0 : model.stats.wins,
          losses: empty ? 0 : model.stats.losses,
          win_rate: empty ? 0 : model.stats.winRate,
          streak: empty ? 0 : model.stats.streak,
          trust: model.stats.trust,
          active_members: empty ? 0 : model.stats.activeMembers,
        },
      };
    case "achievements":
      return { achievements: empty ? [] : model.achievements };
    case "settings":
      return {
        settings: {
          recruiting: model.settings.recruiting,
          primary_game: model.settings.primaryGame,
          language: model.settings.language,
          minimum_rank: model.settings.minimumRank,
          community_link_label: model.settings.communityLinkLabel,
        },
      };
  }
}
