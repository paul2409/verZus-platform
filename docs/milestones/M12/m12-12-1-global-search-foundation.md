# M12.1 — Global Search Foundation

<!-- VERZUS M12.1 -->

## Purpose

Give a player one fast, mobile-first entry point for locating public competitive records across players,
Crews, competitions and matches.

## Primary action

Enter a query, select a domain when useful, then open the correct entity route.

## Implemented states

- Discovery state
- Recent searches
- Trending searches
- Query results
- Domain-filtered results
- No-results state
- Long player name
- Missing artwork fallback
- Suspense loading skeleton

## Boundaries

M12.1 uses deterministic typed fixtures to establish composition and navigation. It does not claim to
provide live indexing. M12.2 introduces independent validated domain APIs, 300 ms debounce, stale request
cancellation and partial-domain failure isolation.

## Responsive intent

- **390px:** primary approved composition; stacked discovery and compact result rows
- **768px:** two-column discovery with mobile result anatomy retained
- **1024px and 1440px:** intentional multi-column composition, not stretched mobile cards
