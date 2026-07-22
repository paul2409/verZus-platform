import type { SearchEntityDomain, SearchFoundationItem } from "../../foundation";
import { searchProductionDomain } from "./search-resource.repository";

export function normalizeSearchQuery(value: string | null): string {
  return (value ?? "").trim().replace(/\s+/g, " ").slice(0, 80);
}

export async function searchDomainItems(input: {
  domain: SearchEntityDomain;
  query: string;
  limit: number;
  viewerUserId: string;
}): Promise<SearchFoundationItem[]> {
  return searchProductionDomain(input);
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
