// VERZUS M12.1 GLOBAL SEARCH FOUNDATION TYPES

export type SearchDomain = "all" | "players" | "crews" | "competitions" | "matches";
export type SearchEntityDomain = Exclude<SearchDomain, "all">;
export type SearchResultTone = "cyan" | "green" | "magenta" | "gold";

export type SearchFoundationItem = {
  id: string;
  domain: SearchEntityDomain;
  title: string;
  subtitle: string;
  supportingText: string;
  meta: string;
  badge: string;
  href: string;
  imageSrc: string | null;
  imageAlt: string;
  initials: string;
  tone: SearchResultTone;
  searchTerms: readonly string[];
};

export type SearchRecentItem = {
  id: string;
  label: string;
  query: string;
  domain: SearchDomain;
  context: string;
};

export type SearchTrendItem = {
  id: string;
  label: string;
  query: string;
  domain: SearchDomain;
  context: string;
  movement: string;
};

export type SearchDomainDefinition = {
  id: SearchDomain;
  label: string;
  shortLabel: string;
  description: string;
};
