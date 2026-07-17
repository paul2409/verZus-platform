// VERZUS M8.9 CREW INTEL MOCK SERVICE

import type { CrewIntelViewModel } from "../crew-intel.types";
import type { CrewIntelResourceScenario } from "./crew-intel-resource.schema";

const knownCrews: Record<string, Partial<CrewIntelViewModel>> = {
  "crew-xenon": {
    name: "Xenon",
    tag: "XNN",
    rank: 1,
    trust: 97,
    reputationLabel: "98,450",
    membersLabel: "25 / 30",
    winRateLabel: "78%",
    warRecordLabel: "318 - 91",
  },
  "crew-nova": {
    name: "Nova",
    tag: "NVA",
    rank: 2,
    trust: 95,
    reputationLabel: "87,320",
    membersLabel: "24 / 30",
    winRateLabel: "73%",
    warRecordLabel: "296 - 108",
  },
  "crew-apex": {
    name: "Apex",
    tag: "APX",
    rank: 3,
    trust: 93,
    reputationLabel: "74,910",
    membersLabel: "22 / 30",
    winRateLabel: "69%",
    warRecordLabel: "268 - 121",
  },
};

function titleFromId(id: string): string {
  return id
    .replace(/^crew-/, "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function createCrewIntelModel(crewId: string): CrewIntelViewModel {
  const known = knownCrews[crewId] ?? {};
  const name = known.name ?? (titleFromId(crewId) || "VERZUS Crew");
  return {
    id: crewId,
    name,
    tag:
      known.tag ??
      name
        .replace(/[^A-Z0-9]/gi, "")
        .slice(0, 3)
        .toUpperCase(),
    tierLabel: "Championship tier",
    locationLabel: "Lagos, Nigeria",
    emblemSrc: "/intel-cards/lagos-lynx.svg",
    rank: known.rank ?? 18,
    trust: known.trust ?? 92,
    verified: true,
    reputationLabel: known.reputationLabel ?? "52,880",
    membersLabel: known.membersLabel ?? "18 / 30",
    winRateLabel: known.winRateLabel ?? "66%",
    warRecordLabel: known.warRecordLabel ?? "144 - 74",
    ownerName: "Prismo",
    captainNames: ["RivalKing", "Ghosty"],
    activeRosterCount: 18,
    recentResults: ["W", "W", "L", "W", "D"],
    crewHref: `/crews/${encodeURIComponent(crewId)}`,
    joinWarHref: null,
  };
}

export function serializeCrewIntelModel(model: CrewIntelViewModel) {
  return {
    id: model.id,
    name: model.name,
    tag: model.tag,
    tier_label: model.tierLabel,
    location_label: model.locationLabel,
    emblem_src: model.emblemSrc,
    rank: model.rank,
    trust: model.trust,
    verified: model.verified,
    reputation_label: model.reputationLabel,
    members_label: model.membersLabel,
    win_rate_label: model.winRateLabel,
    war_record_label: model.warRecordLabel,
    owner_name: model.ownerName ?? "Unavailable",
    captain_names: model.captainNames ?? [],
    active_roster_count: model.activeRosterCount ?? 0,
    recent_results: model.recentResults ?? [],
    crew_href: model.crewHref,
    join_war_href: model.joinWarHref,
  };
}

export function normalizeCrewIntelScenario(value: string | null): CrewIntelResourceScenario {
  switch (value) {
    case "stale":
    case "partial":
    case "error":
    case "not-found":
    case "malformed":
    case "slow":
      return value;
    default:
      return "normal";
  }
}
