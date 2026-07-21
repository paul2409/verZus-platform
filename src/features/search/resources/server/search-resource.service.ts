// VERZUS M12.6 RELIABILITY EDGE STATES
// VERZUS M12.2 SERVER SEARCH READ MODELS

import { searchFoundationItems } from "../../foundation";
import type { SearchEntityDomain, SearchFoundationItem } from "../../foundation";
import type { SearchResourceScenario } from "../model/search-resource.types";

const allowedScenarios: readonly SearchResourceScenario[] = [
  "normal",
  "stale",
  "empty",
  "error",
  "offline",
  "slow",
  "malformed",
  "unauthorized",
  "forbidden",
  "not-found",
  "maintenance",
];

export function normalizeSearchResourceScenario(value: string | null): SearchResourceScenario {
  return allowedScenarios.includes(value as SearchResourceScenario)
    ? (value as SearchResourceScenario)
    : "normal";
}

export function normalizeSearchQuery(value: string | null): string {
  return (value ?? "").trim().slice(0, 80);
}

function includesQuery(item: SearchFoundationItem, query: string): boolean {
  const normalized = query.toLocaleLowerCase();
  const haystack = [
    item.title,
    item.subtitle,
    item.supportingText,
    item.meta,
    item.badge,
    ...item.searchTerms,
  ]
    .join(" ")
    .toLocaleLowerCase();
  return haystack.includes(normalized);
}

export function searchDomainItems(
  domain: SearchEntityDomain,
  query: string,
  limit: number,
  scenario: SearchResourceScenario,
): SearchFoundationItem[] {
  if (scenario === "empty" || query.length < 2) return [];

  return searchFoundationItems
    .filter((item) => item.domain === domain && includesQuery(item, query))
    .sort((left, right) => left.title.localeCompare(right.title) || left.id.localeCompare(right.id))
    .slice(0, limit);
}

export function serializeSearchItem(item: SearchFoundationItem) {
  return {
    id: item.id,
    domain: item.domain,
    title: item.title,
    subtitle: item.subtitle,
    supporting_text: item.supportingText,
    meta: item.meta,
    badge: item.badge,
    href: item.href,
    image_src: item.imageSrc,
    image_alt: item.imageAlt,
    initials: item.initials,
    tone: item.tone,
    search_terms: [...item.searchTerms],
  };
}
