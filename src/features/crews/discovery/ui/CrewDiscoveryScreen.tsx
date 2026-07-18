"use client";

// VERZUS M9.2 CREW DISCOVERY SCREEN
// VERZUS M9.3 CREW CREATION LINKS
// VERZUS M9.5 APPLICATION MUTATION

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { Icon } from "@/components/primitives/icon";
import { Input } from "@/components/primitives/input";
import { Select } from "@/components/primitives/select";

import { CrewApplicationAction } from "../../membership";

import {
  applyCrewDiscoveryQuery,
  buildCrewDiscoverySearchParams,
  hasActiveCrewDiscoveryFilters,
} from "../model/crew-discovery.query";
import {
  crewDiscoveryGames,
  crewDiscoveryRecruiting,
  crewDiscoveryRegions,
  crewDiscoverySorts,
  crewDiscoveryVisibility,
  defaultCrewDiscoveryQuery,
  type CrewDiscoveryQuery,
  type CrewDiscoveryRecord,
  type CrewMembershipState,
} from "../model/crew-discovery.types";
import styles from "./CrewDiscoveryScreen.module.css";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function label(value: string): string {
  if (value === "all") return "All";
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function CrewCard({
  crew,
  onJoinIntent,
}: {
  crew: CrewDiscoveryRecord;
  onJoinIntent: (crewId: string) => void;
}) {
  const openSlots = Math.max(0, crew.capacity - crew.memberCount);

  return (
    <article className={styles.crewCard} data-accent={crew.accent}>
      <header className={styles.cardHeader}>
        <span className={styles.crewMark}>{crew.initials}</span>
        <div>
          <div className={styles.cardTitleRow}>
            <h2>{crew.name}</h2>
            <span>{crew.tag}</span>
          </div>
          <div className={styles.badgeRow}>
            {crew.verified ? (
              <Badge size="sm" tone="positive" variant="outline">
                Verified
              </Badge>
            ) : null}
            <Badge size="sm" tone={crew.recruiting === "open" ? "information" : "neutral"}>
              Recruiting {crew.recruiting}
            </Badge>
            <Badge size="sm" tone="special" variant="outline">
              {crew.lifecycle}
            </Badge>
          </div>
        </div>
      </header>

      <p>{crew.description}</p>

      <div className={styles.gameRow} aria-label={`${crew.name} supported games`}>
        {crew.games.map((game) => (
          <span key={game}>{game}</span>
        ))}
      </div>

      <dl className={styles.cardStats}>
        <div>
          <dt>Rank</dt>
          <dd>#{crew.rank}</dd>
        </div>
        <div>
          <dt>Points</dt>
          <dd>{formatNumber(crew.points)}</dd>
        </div>
        <div>
          <dt>Win rate</dt>
          <dd>{crew.winRate}%</dd>
        </div>
        <div>
          <dt>Trust</dt>
          <dd>{crew.trust}</dd>
        </div>
      </dl>

      <div className={styles.cardMeta}>
        <span>
          <Icon decorative name="users" size="sm" /> {crew.memberCount}/{crew.capacity}
        </span>
        <span>
          <Icon decorative name="target" size="sm" /> {crew.region}
        </span>
        <span>
          <Icon decorative name="arrow-up" size="sm" /> {openSlots} open slots
        </span>
        <span>
          <Icon decorative name="shield" size="sm" /> Min. {crew.minimumRank}
        </span>
      </div>

      <footer className={styles.cardActions}>
        <Link href={`/crews/${encodeURIComponent(crew.id)}`}>View profile</Link>
        <Button
          disabled={crew.recruiting === "closed"}
          onClick={() => onJoinIntent(crew.id)}
          size="sm"
          variant="secondary"
        >
          {crew.recruiting === "open" ? "Review join fit" : "Applications closed"}
        </Button>
      </footer>
    </article>
  );
}

function NoCrewState() {
  return (
    <section className={styles.noCrew} data-crew-state="none">
      <div className={styles.noCrewIcon}>
        <Icon decorative name="users" size="xxl" />
      </div>
      <div>
        <span className={styles.eyebrow}>Your competitive home</span>
        <h1>Find a Crew that matches how you play</h1>
        <p>
          Join players who share your games, schedule, region and competitive goals. Crew
          applications remain server-controlled and arrive in M9.5.
        </p>
      </div>
      <div className={styles.noCrewActions}>
        <Link className={styles.primaryLink} href="/crews?view=discover&membership=none">
          Discover Crews
        </Link>
        <Link className={styles.secondaryLink} href="/crews/create?membership=none">
          Create a Crew
        </Link>
      </div>
      <div className={styles.noCrewBenefits}>
        <span>
          <Icon decorative name="trophy" size="sm" /> Compete as a unit
        </span>
        <span>
          <Icon decorative name="users" size="sm" /> Build trusted teammates
        </span>
        <span>
          <Icon decorative name="target" size="sm" /> Track Crew rankings
        </span>
      </div>
    </section>
  );
}

function JoinIntentDialog({
  crew,
  membership,
  onClose,
}: {
  crew: CrewDiscoveryRecord;
  membership: CrewMembershipState;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openSlots = Math.max(0, crew.capacity - crew.memberCount);
  const eligible = crew.recruiting === "open" && openSlots > 0 && crew.lifecycle === "active";

  useEffect(() => {
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className={styles.dialogBackdrop} onMouseDown={onClose}>
      <section
        aria-labelledby="crew-join-intent-title"
        aria-modal="true"
        className={styles.joinDialog}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header>
          <div>
            <span className={styles.crewMark} data-accent={crew.accent}>
              {crew.initials}
            </span>
            <div>
              <span className={styles.eyebrow}>Join-fit review</span>
              <h2 id="crew-join-intent-title">{crew.name}</h2>
            </div>
          </div>
          <button
            aria-label="Close join-fit review"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <Icon decorative name="x" size="md" />
          </button>
        </header>

        <div className={styles.eligibilityStatus} data-eligible={eligible ? "true" : "false"}>
          <Icon decorative name={eligible ? "check" : "lock"} size="md" />
          <div>
            <strong>
              {eligible ? "Eligible to review an application" : "Application unavailable"}
            </strong>
            <span>Eligibility, capacity and duplicate membership are validated by the server.</span>
          </div>
        </div>

        <dl className={styles.joinRequirements}>
          <div>
            <dt>Recruiting</dt>
            <dd>{crew.recruiting}</dd>
          </div>
          <div>
            <dt>Open slots</dt>
            <dd>{openSlots}</dd>
          </div>
          <div>
            <dt>Region</dt>
            <dd>{crew.region}</dd>
          </div>
          <div>
            <dt>Minimum rank</dt>
            <dd>{crew.minimumRank}</dd>
          </div>
          <div>
            <dt>Trust</dt>
            <dd>{crew.trust}</dd>
          </div>
          <div>
            <dt>Visibility</dt>
            <dd>{crew.visibility}</dd>
          </div>
        </dl>

        <footer>
          <Link href={`/crews/${encodeURIComponent(crew.id)}`}>Open full Crew profile</Link>
          <CrewApplicationAction crewId={crew.id} disabled={!eligible || membership !== "none"} />
        </footer>
      </section>
    </div>
  );
}

export type CrewDiscoveryScreenProps = {
  crews: readonly CrewDiscoveryRecord[];
  initialQuery: CrewDiscoveryQuery;
  membership: CrewMembershipState;
  showNoCrewLanding?: boolean;
};

export function CrewDiscoveryScreen({
  crews,
  initialQuery,
  membership,
  showNoCrewLanding = false,
}: CrewDiscoveryScreenProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const [searchDraft, setSearchDraft] = useState(initialQuery.q);

  const navigate = useCallback(
    (nextQuery: CrewDiscoveryQuery, replace = true) => {
      const params = buildCrewDiscoverySearchParams(nextQuery, {
        membership: membership === "none" ? "none" : null,
      });
      const href = `${pathname}?${params.toString()}`;
      if (replace) router.replace(href, { scroll: false });
      else router.push(href, { scroll: false });
    },
    [membership, pathname, router],
  );

  const updateQuery = useCallback(
    (patch: Partial<CrewDiscoveryQuery>, replace = true) => {
      const nextQuery = { ...query, ...patch };
      setQuery(nextQuery);
      navigate(nextQuery, replace);
    },
    [navigate, query],
  );

  useEffect(() => {
    if (searchDraft === query.q) return;
    const timeout = window.setTimeout(() => {
      updateQuery({ q: searchDraft.trim(), page: 1 });
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [query.q, searchDraft, updateQuery]);

  const result = useMemo(() => applyCrewDiscoveryQuery(crews, query), [crews, query]);
  const selectedCrew = useMemo(
    () => crews.find((crew) => crew.id === query.joinCrewId) ?? null,
    [crews, query.joinCrewId],
  );

  if (showNoCrewLanding) return <NoCrewState />;

  const clearFilters = () => {
    setSearchDraft("");
    updateQuery(defaultCrewDiscoveryQuery, false);
  };

  return (
    <main className={styles.page} data-m9-stage="9.5">
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>M9.2 Crew discovery</span>
          <h1>Find your next competitive Crew</h1>
          <p>
            Search by game, region and recruiting status. Profile inspection is live; applications
            remain disabled until M9.5.
          </p>
        </div>
        <nav aria-label="Crew views" className={styles.viewNav}>
          {membership === "current" ? <Link href="/crews">My Crew</Link> : null}
          <Link
            aria-current="page"
            href={`/crews?view=discover${membership === "none" ? "&membership=none" : ""}`}
          >
            Discover
          </Link>
          {membership === "none" ? (
            <Link href="/crews/create?membership=none">Create Crew</Link>
          ) : (
            <Button
              disabled
              size="sm"
              title="Leave your current Crew before creating another"
              variant="secondary"
            >
              Create Crew
            </Button>
          )}
        </nav>
      </header>

      {membership === "none" ? (
        <aside className={styles.membershipBanner}>
          <Icon decorative name="info" size="md" />
          <div>
            <strong>You are not in a Crew yet</strong>
            <span>Review Crew fit now. Applications and invites are now live.</span>
          </div>
        </aside>
      ) : null}

      <section aria-label="Crew discovery filters" className={styles.filters}>
        <label className={styles.searchField}>
          <span>Search Crews</span>
          <Input
            aria-label="Search Crews"
            leadingIcon="search"
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder="Name, tag, game, region..."
            value={searchDraft}
          />
        </label>

        <label>
          <span>Game</span>
          <Select
            aria-label="Filter by game"
            onChange={(event) =>
              updateQuery({ game: event.target.value as CrewDiscoveryQuery["game"], page: 1 })
            }
            value={query.game}
          >
            {crewDiscoveryGames.map((value) => (
              <option key={value} value={value}>
                {label(value)}
              </option>
            ))}
          </Select>
        </label>

        <label>
          <span>Region</span>
          <Select
            aria-label="Filter by region"
            onChange={(event) =>
              updateQuery({ region: event.target.value as CrewDiscoveryQuery["region"], page: 1 })
            }
            value={query.region}
          >
            {crewDiscoveryRegions.map((value) => (
              <option key={value} value={value}>
                {label(value)}
              </option>
            ))}
          </Select>
        </label>

        <label>
          <span>Visibility</span>
          <Select
            aria-label="Filter by visibility"
            onChange={(event) =>
              updateQuery({
                visibility: event.target.value as CrewDiscoveryQuery["visibility"],
                page: 1,
              })
            }
            value={query.visibility}
          >
            {crewDiscoveryVisibility.map((value) => (
              <option key={value} value={value}>
                {label(value)}
              </option>
            ))}
          </Select>
        </label>

        <label>
          <span>Recruiting</span>
          <Select
            aria-label="Filter by recruiting status"
            onChange={(event) =>
              updateQuery({
                recruiting: event.target.value as CrewDiscoveryQuery["recruiting"],
                page: 1,
              })
            }
            value={query.recruiting}
          >
            {crewDiscoveryRecruiting.map((value) => (
              <option key={value} value={value}>
                {label(value)}
              </option>
            ))}
          </Select>
        </label>

        <label>
          <span>Sort</span>
          <Select
            aria-label="Sort Crews"
            onChange={(event) =>
              updateQuery({ sort: event.target.value as CrewDiscoveryQuery["sort"], page: 1 })
            }
            value={query.sort}
          >
            {crewDiscoverySorts.map((value) => (
              <option key={value} value={value}>
                {label(value)}
              </option>
            ))}
          </Select>
        </label>
      </section>

      <section className={styles.resultHeader}>
        <div>
          <strong>{result.total} Crews found</strong>
          <span>
            Page {result.page} of {result.pageCount}
          </span>
        </div>
        {hasActiveCrewDiscoveryFilters(query) ? (
          <button onClick={clearFilters} type="button">
            <Icon decorative name="refresh-cw" size="sm" /> Clear filters
          </button>
        ) : null}
      </section>

      {result.items.length > 0 ? (
        <section aria-label="Crew discovery results" className={styles.grid}>
          {result.items.map((crew) => (
            <CrewCard
              crew={crew}
              key={crew.id}
              onJoinIntent={(crewId) => updateQuery({ joinCrewId: crewId }, false)}
            />
          ))}
        </section>
      ) : (
        <section className={styles.emptyState}>
          <Icon decorative name="search" size="xxl" />
          <h2>No Crews match these filters</h2>
          <p>Clear one or more filters to widen the search without losing the Crew route.</p>
          <Button onClick={clearFilters} variant="secondary">
            Reset discovery
          </Button>
        </section>
      )}

      {result.pageCount > 1 ? (
        <nav aria-label="Crew discovery pages" className={styles.pagination}>
          <Button
            disabled={!result.hasPreviousPage}
            onClick={() => updateQuery({ page: result.page - 1 }, false)}
            size="sm"
            variant="ghost"
          >
            Previous
          </Button>
          <span>
            {result.page} / {result.pageCount}
          </span>
          <Button
            disabled={!result.hasNextPage}
            onClick={() => updateQuery({ page: result.page + 1 }, false)}
            size="sm"
            variant="ghost"
          >
            Next
          </Button>
        </nav>
      ) : null}

      <footer className={styles.foundationNote}>
        <strong>M9.2 DISCOVERY CONTRACT</strong>
        <span>
          Search, filters, sorting, pagination and join intent are local and URL-persistent. Crew
          creation arrives in M9.3; API resources and server eligibility arrive in M9.4-M9.5.
        </span>
      </footer>

      {selectedCrew ? (
        <JoinIntentDialog
          crew={selectedCrew}
          membership={membership}
          onClose={() => updateQuery({ joinCrewId: null }, false)}
        />
      ) : null}
    </main>
  );
}
