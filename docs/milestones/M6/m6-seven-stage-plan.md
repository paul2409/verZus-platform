# M6 — Competition Discovery and Entry: Seven-Stage Plan

## 6.1 Discovery foundation and approved shell

Build the approved responsive competition-discovery composition using feature-owned view models and mocks. Establish the featured hero, discovery journey, competition cards, filters rail, entry preview, guide panel and mobile/desktop anatomy.

## 6.2 Search, filters, sorting and URL state

Add debounced search, query-string synchronization, cached filter options, deterministic sorting, empty results, stale results and independent filter failure handling.

## 6.3 Competition collection contracts and data reliability

Add Zod schemas, adapters, API clients, TanStack Query resources, mock handlers, pagination, invalid-row isolation and independent featured/list/entry resources.

## 6.4 Competition details

Create `/compete/[competitionId]` with summary, eligibility, schedule, reward, rules, participants and bracket preview. Keep major panels independently recoverable.

## 6.5 Entry confirmation and success

Implement server-authoritative eligibility, confirmation, idempotent entry mutation, duplicate-click prevention, refresh-safe success and Manage Entry behavior.

## 6.6 Lifecycle and edge states

Implement registration closed, waitlist, not eligible, full capacity, cancelled, offline, maintenance, unauthorized, forbidden, not found and partial failure references and code.

## 6.7 M6 release gate

Complete unit, component, integration, E2E, accessibility, failure-injection and visual-regression checks at 390px, 768px and 1440px. Add telemetry, feature flag, immutable preview and rollback documentation.
