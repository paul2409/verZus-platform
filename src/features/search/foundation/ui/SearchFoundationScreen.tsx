// VERZUS M12.6 RELIABILITY EDGE STATES
// VERZUS M12.2 DEBOUNCED GLOBAL SEARCH AND INDEPENDENT DOMAIN RESOURCES
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";

import { ResourceStatePanel } from "@/components/feedback/resource-state";
import { Badge } from "@/components/primitives/badge";

import { searchDomainDefinitions } from "../config/search-foundation.config";
import type {
  SearchDomain,
  SearchEntityDomain,
  SearchFoundationItem,
} from "../model/search-foundation.types";
import {
  type SearchResourceResult,
  type SearchResourceScenario,
  useSearchResources,
} from "../../resources";
import { describeSearchResourceHealth } from "../../reliability/search-reliability";
import styles from "./SearchFoundationScreen.module.css";

const validDomains = new Set<SearchDomain>([
  "all",
  "players",
  "crews",
  "competitions",
  "matches",
]);
const entityDomains: readonly SearchEntityDomain[] = [
  "players",
  "crews",
  "competitions",
  "matches",
];
const domainLabels: Record<SearchEntityDomain, string> = {
  players: "Players",
  crews: "Crews",
  competitions: "Competitions",
  matches: "Matches",
};

function readDomain(value: string | null): SearchDomain {
  return value && validDomains.has(value as SearchDomain) ? (value as SearchDomain) : "all";
}

function createSearchHref(query: string, domain: SearchDomain): string {
  const params = new URLSearchParams();
  const normalizedQuery = query.trim();
  if (normalizedQuery) params.set("q", normalizedQuery);
  if (domain !== "all") params.set("domain", domain);
  const serialized = params.toString();
  return serialized ? `/search?${serialized}` : "/search";
}

function useDebouncedValue(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [delay, value]);

  return debounced;
}

function ResultArtwork({ item }: { item: SearchFoundationItem }) {
  if (!item.imageSrc) {
    return (
      <span aria-hidden="true" className={styles.artworkFallback} data-tone={item.tone}>
        {item.initials}
      </span>
    );
  }
  return (
    <span className={styles.artwork} data-tone={item.tone}>
      <Image alt={item.imageAlt} height={52} src={item.imageSrc} width={52} />
    </span>
  );
}

function SearchResultCard({ item, compact = false }: { item: SearchFoundationItem; compact?: boolean }) {
  return (
    <Link
      className={compact ? styles.suggestionCard : styles.resultCard}
      data-tone={item.tone}
      href={item.href}
    >
      <ResultArtwork item={item} />
      <span className={styles.resultIdentity}>
        <span className={styles.resultTitleRow}>
          <strong>{item.title}</strong>
          <Badge size="sm" tone={item.tone === "gold" ? "warning" : "information"}>
            {item.badge}
          </Badge>
        </span>
        <span className={styles.resultSubtitle}>{item.subtitle}</span>
        {!compact ? <span className={styles.resultSupporting}>{item.supportingText}</span> : null}
      </span>
      <span className={styles.resultMeta}>
        <span>{item.meta}</span>
        <span aria-hidden="true">›</span>
      </span>
    </Link>
  );
}

function SearchEmptyState({ query, partial }: { query: string; partial: boolean }) {
  return (
    <section aria-labelledby="search-empty-title" className={styles.emptyState}>
      <span aria-hidden="true" className={styles.emptyIcon}>?</span>
      <p className={styles.sectionEyebrow}>No competitive records</p>
      <h2 id="search-empty-title">Nothing matched “{query}”</h2>
      <p>
        {partial
          ? "Available search domains returned no matches. One or more other domains could not be checked."
          : "Check the spelling, remove a domain filter, or search using a player handle, Crew tag, competition name or match reference."}
      </p>
      <Link className={styles.secondaryAction} href="/search">Clear search</Link>
    </section>
  );
}

function SearchControls({
  activeDomain,
  queryInput,
  onQueryInput,
}: {
  activeDomain: SearchDomain;
  queryInput: string;
  onQueryInput: (value: string) => void;
}) {
  const router = useRouter();
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(createSearchHref(queryInput, activeDomain));
  };

  return (
    <form className={styles.searchForm} onSubmit={submitSearch} role="search">
      <label className={styles.srOnly} htmlFor="m12-global-search">
        Search the competitive network
      </label>
      <div className={styles.searchControl}>
        <span aria-hidden="true" className={styles.searchGlyph}>⌕</span>
        <input
          autoComplete="off"
          id="m12-global-search"
          name="q"
          onChange={(event) => onQueryInput(event.currentTarget.value)}
          placeholder="Player, Crew, competition or match"
          type="search"
          value={queryInput}
        />
        {queryInput ? (
          <button
            aria-label="Clear search query"
            className={styles.clearButton}
            onClick={() => onQueryInput("")}
            type="button"
          >×</button>
        ) : null}
      </div>
      <button className={styles.searchButton} disabled={!queryInput.trim()} type="submit">
        Search
      </button>
    </form>
  );
}

function ResourceFailure({ resource }: { resource: SearchResourceResult }) {
  const descriptor = describeSearchResourceHealth(domainLabels[resource.domain], resource.health);
  return (
    <ResourceStatePanel
      descriptor={descriptor}
      onRetry={() => void resource.retry()}
      retryLabel={`Retry ${domainLabels[resource.domain]} Search`}
      secondaryHref="/search"
      secondaryLabel="Clear Search"
    />
  );
}

function SearchResourceGroup({ resource }: { resource: SearchResourceResult }) {
  if (resource.health.state === "idle" || resource.health.state === "empty") return null;
  if (["error", "offline", "unauthorized", "forbidden", "not-found", "maintenance", "schema-invalid", "partial-failure"].includes(resource.health.state)) {
    return (
      <section className={styles.resultGroup} data-resource-state={resource.health.state}>
        <div className={styles.groupHeader}>
          <h3>{domainLabels[resource.domain]}</h3>
          <span>Unavailable</span>
        </div>
        <ResourceFailure resource={resource} />
      </section>
    );
  }
  if (resource.health.state === "loading") {
    return (
      <section aria-busy="true" className={styles.resultGroup}>
        <div className={styles.groupHeader}>
          <h3>{domainLabels[resource.domain]}</h3>
          <span>Loading</span>
        </div>
        <div className={styles.resourceSkeleton}><div /><div /></div>
      </section>
    );
  }

  return (
    <section aria-labelledby={`m12-${resource.domain}-title`} className={styles.resultGroup}>
      <div className={styles.groupHeader}>
        <h3 id={`m12-${resource.domain}-title`}>{domainLabels[resource.domain]}</h3>
        <span>{resource.items.length}</span>
      </div>
      {resource.health.state === "stale" || resource.health.state === "retrying" ? (
        <div className={styles.resourceNotice} data-state={resource.health.state}>
          {resource.health.state === "stale"
            ? "Showing stale confirmed results."
            : "Refreshing; confirmed results remain visible."}
        </div>
      ) : null}
      <div className={styles.resultList}>
        {resource.items.map((item) => <SearchResultCard item={item} key={item.id} />)}
      </div>
    </section>
  );
}

function SuggestionsPanel({
  query,
  pendingDebounce,
  resources,
  hasFailure,
  loading,
}: {
  query: string;
  pendingDebounce: boolean;
  resources: ReturnType<typeof useSearchResources>;
  hasFailure: boolean;
  loading: boolean;
}) {
  if (query.trim().length < 2) return null;
  const items = resources.items.slice(0, 8);

  return (
    <section aria-label="Search suggestions" className={styles.suggestionsPanel}>
      <div className={styles.suggestionsHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Live suggestions</p>
          <strong>{pendingDebounce ? "Waiting for input…" : `Matches for “${query.trim()}”`}</strong>
        </div>
        <span className={styles.debounceBadge}>300 ms</span>
      </div>
      {pendingDebounce || loading ? (
        <div className={styles.suggestionLoading} role="status">Searching independent indexes…</div>
      ) : items.length ? (
        <div className={styles.suggestionList}>
          {items.map((item) => <SearchResultCard compact item={item} key={item.id} />)}
        </div>
      ) : (
        <p className={styles.suggestionEmpty}>
          {hasFailure ? "No suggestions from the available indexes." : "No suggestions yet."}
        </p>
      )}
      {hasFailure ? (
        <p className={styles.partialHint}>Some domains are unavailable; available suggestions remain usable.</p>
      ) : null}
    </section>
  );
}

export function SearchFoundationSkeleton() {
  return (
    <main aria-busy="true" className={styles.page} data-m12-stage="12.1">
      <div className={styles.skeletonHero} />
      <div className={styles.skeletonGrid}><div /><div /><div /></div>
      <span className={styles.srOnly}>Loading VERZUS Search</span>
    </main>
  );
}

function SearchResourceExperience({
  activeQuery,
  activeDomain,
  scenarios,
}: {
  activeQuery: string;
  activeDomain: SearchDomain;
  scenarios: Record<SearchEntityDomain, SearchResourceScenario>;
}) {
  const [queryInput, setQueryInput] = useState(activeQuery);
  const debouncedQuery = useDebouncedValue(queryInput.trim(), 300);
  const pendingDebounce = queryInput.trim().length >= 2 && debouncedQuery !== queryInput.trim();
  const showSuggestions = queryInput.trim().length >= 2 && queryInput.trim() !== activeQuery;

  const suggestionResources = useSearchResources({
    query: showSuggestions ? debouncedQuery : "",
    activeDomain,
    scenarios,
    limit: 2,
  });
  const resultResources = useSearchResources({
    query: activeQuery,
    activeDomain,
    scenarios,
    limit: 12,
  });

  const resultCount = resultResources.items.length;
  const visibleResultGroups = resultResources.enabledDomains.map(
    (domain) => resultResources.results[domain],
  );

  return (
    <main className={styles.page} data-m12-reliability="12.6" data-m12-stage="12.2">
      <header className={styles.hero}>
        <div className={styles.heroTopline}>
          <div>
            <p className={styles.eyebrow}>COMPETITIVE NETWORK</p>
            <h1>SEARCH VERZUS</h1>
          </div>
          <Badge size="sm" tone="live" variant="outline">Live domain search</Badge>
        </div>
        <p className={styles.heroCopy}>
          Find players, Crews, competitions and matches without exposing private competitive data.
        </p>
        <SearchControls
          activeDomain={activeDomain}
          onQueryInput={setQueryInput}
          queryInput={queryInput}
        />
        {showSuggestions ? (
          <SuggestionsPanel
            hasFailure={suggestionResources.hasFailure}
            loading={suggestionResources.isLoading}
            pendingDebounce={pendingDebounce}
            query={queryInput}
            resources={suggestionResources}
          />
        ) : null}
        <nav aria-label="Search domains" className={styles.domainTabs}>
          {searchDomainDefinitions.map((domain) => (
            <Link
              aria-current={activeDomain === domain.id ? "page" : undefined}
              className={styles.domainTab}
              data-active={activeDomain === domain.id ? "true" : "false"}
              href={createSearchHref(activeQuery, domain.id)}
              key={domain.id}
            >{domain.shortLabel}</Link>
          ))}
        </nav>
      </header>

      {activeQuery ? (
        <section aria-live="polite" className={styles.resultsSection}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Search results</p>
              <h2>{resultResources.isLoading ? "Searching…" : `${resultCount} records found`}</h2>
            </div>
            <span className={styles.queryLabel}>“{activeQuery}”</span>
          </div>

          {resultResources.hasFailure ? (
            <div className={styles.partialBanner} role="status">
              Partial results: one or more search domains are unavailable. Working domains remain interactive.
            </div>
          ) : null}

          <div className={styles.resultGroups}>
            {visibleResultGroups.map((resource) => (
              <SearchResourceGroup key={resource.domain} resource={resource} />
            ))}
          </div>

          {resultResources.isSettled && resultCount === 0 ? (
            <SearchEmptyState partial={resultResources.hasFailure} query={activeQuery} />
          ) : null}
        </section>
      ) : (
        <div className={styles.discoveryLayout}>
          <section aria-labelledby="search-start-title" className={styles.panel}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionEyebrow}>Production search</p>
                <h2 id="search-start-title">Find a competitive record</h2>
              </div>
              <Badge size="sm" tone="live" variant="outline">Live data</Badge>
            </div>
            <p className={styles.heroCopy}>
              Search by player handle, Crew name or tag, competition title, or one of your match references.
              Results are read directly from production domain records and respect profile visibility.
            </p>
          </section>

          <section aria-labelledby="search-domains-title" className={styles.domainPanel}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionEyebrow}>Search by domain</p>
                <h2 id="search-domains-title">Explore the network</h2>
              </div>
            </div>
            <div className={styles.domainGrid}>
              {searchDomainDefinitions.filter((domain) => domain.id !== "all").map((domain) => (
                <Link
                  className={styles.domainCard}
                  data-domain={domain.id}
                  href={createSearchHref("", domain.id)}
                  key={domain.id}
                >
                  <strong>{domain.label}</strong>
                  <span>{domain.description}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export function SearchFoundationScreen() {
  const searchParams = useSearchParams();
  const activeQuery = (searchParams.get("q") ?? "").trim();
  const activeDomain = readDomain(searchParams.get("domain"));
  const scenarios = useMemo(() => {
    const result = {} as Record<SearchEntityDomain, SearchResourceScenario>;
    for (const domain of entityDomains) result[domain] = "normal";
    return result;
  }, []);

  return (
    <SearchResourceExperience
      activeDomain={activeDomain}
      activeQuery={activeQuery}
      key={`${activeDomain}:${activeQuery}`}
      scenarios={scenarios}
    />
  );
}
