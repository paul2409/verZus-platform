import type { SmartAction } from "@/lib/actions";

import type { PlayCommandCenterViewModel } from "../view-model";

const MAX_ACTIONS = 4;

function pushUnique(actions: SmartAction[], action: SmartAction): void {
  if (actions.some((candidate) => candidate.id === action.id || candidate.href === action.href)) {
    return;
  }
  actions.push(action);
}

export function buildPlaySmartActions(viewModel: PlayCommandCenterViewModel): SmartAction[] {
  const actions: SmartAction[] = [];
  const player = viewModel.playerStatus.data;
  const match = viewModel.nextMatch.data;
  const position = viewModel.currentPosition.data;
  const crew = viewModel.crewSummary.data;
  const competitions = viewModel.recommendedCompetitions.data ?? [];
  const activity = viewModel.recentActivity.data ?? [];

  if ((player?.unreadNotifications ?? 0) > 0) {
    const count = player?.unreadNotifications ?? 0;
    pushUnique(actions, {
      id: "notifications",
      href: "/notifications",
      label: count === 1 ? "Review 1 alert" : `Review ${count} alerts`,
      detail: "Clear time-sensitive competitive updates",
      reason: "Unread signal",
      glyph: "!",
      tone: "magenta",
      priority: 100,
    });
  }

  if (!match && competitions.length > 0) {
    const bestFit = competitions[0]!;
    pushUnique(actions, {
      id: "best-competition",
      href: `/compete/${bestFit.competitionId}`,
      label: "Best fit competition",
      detail: `${bestFit.title} · ${bestFit.eligibilityLabel}`,
      reason: "Eligible now",
      glyph: "◎",
      tone: "green",
      priority: 90,
    });
  }

  if (crew) {
    pushUnique(actions, {
      id: "crew-hq",
      href: `/crews/${crew.crewId}`,
      label: `${crew.tag} Crew HQ`,
      detail:
        crew.liveActivityCount > 0
          ? `${crew.liveActivityCount} active Crew update${crew.liveActivityCount === 1 ? "" : "s"}`
          : "Open roster, fixtures and Crew operations",
      reason: "Your team",
      glyph: "C",
      tone: "violet",
      priority: crew.liveActivityCount > 0 ? 80 : 55,
    });
  } else {
    pushUnique(actions, {
      id: "find-crew",
      href: "/crews",
      label: "Find a Crew",
      detail: "Join a competitive unit and unlock Crew play",
      reason: "Missing team",
      glyph: "C",
      tone: "violet",
      priority: 60,
    });
  }

  if (position && position.rank > 0) {
    pushUnique(actions, {
      id: "weekly-rank",
      href: "/leaderboards/weekly",
      label: `Defend rank #${position.rank}`,
      detail: `${position.points} points · ${position.streak}`,
      reason: position.movement === "down" ? "Rank at risk" : "Current standing",
      glyph: "#",
      tone: position.movement === "down" ? "gold" : "cyan",
      priority: position.movement === "down" ? 75 : 45,
    });
  } else {
    pushUnique(actions, {
      id: "build-rank",
      href: "/leaderboards/weekly",
      label: "Build your rank",
      detail: "Complete a confirmed match to enter the table",
      reason: "Unranked",
      glyph: "#",
      tone: "cyan",
      priority: 50,
    });
  }

  if (match) {
    pushUnique(actions, {
      id: "match-schedule",
      href: "/matches",
      label: "Open full schedule",
      detail: `Next: ${match.competitionName}`,
      reason: "Fixture active",
      glyph: "▣",
      tone: "cyan",
      priority: 65,
    });
  }

  if (activity.length > 0) {
    const latest = activity[0]!;
    pushUnique(actions, {
      id: "latest-activity",
      href: latest.href ?? "/activity",
      label: "Review latest update",
      detail: latest.title,
      reason: "Recent change",
      glyph: "↗",
      tone: latest.pointsDelta && latest.pointsDelta > 0 ? "green" : "cyan",
      priority: 40,
    });
  } else {
    pushUnique(actions, {
      id: "profile",
      href: "/profile",
      label: "Review player profile",
      detail: "Check identity, game handles and availability",
      reason: "Keep profile ready",
      glyph: "P",
      tone: "cyan",
      priority: 20,
    });
  }

  return actions.sort((left, right) => right.priority - left.priority).slice(0, MAX_ACTIONS);
}
