<!-- VERZUS M9.2 CREW DISCOVERY CONTRACT -->

# M9.2 - No-Crew state, discovery, search and filters

## Intent

Give players without a Crew a clear next action and let every player inspect suitable Crews without enabling unsafe membership mutations early.

## Routes and URL state

- `/crews` keeps the authenticated player's current Crew profile.
- `/crews?membership=none` renders the no-Crew state.
- `/crews?view=discover` renders Crew discovery.
- Search, filters, sorting, pagination and join intent are URL-backed.

Supported query keys:

- `q`
- `game`
- `region`
- `visibility`
- `recruiting`
- `sort`
- `page`
- `join`
- `membership`

## State ownership

M9.2 owns local typed discovery records and deterministic filtering. M9.4 replaces the local records with schema-validated API resources without changing the UI contract.

## Join intent

`join=<crewId>` opens a shareable join-fit review. It never creates an application. Server-authoritative eligibility and idempotent membership mutations arrive in M9.5.

## Responsive composition

- 390px: one-column cards and stacked filters.
- 768px: two-column cards.
- 1024px and 1440px: two or three-column cards with compact filter controls.

## Verification

```bash
npm run verify:m9:9.2
```

## Rollback

```bash
bash ./VERZUS_M9_9_2_Crew_Discovery_Search_Filters.sh rollback
```
