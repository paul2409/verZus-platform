# M6.2 — Search, Filters, Sorting and URL State

## Purpose

M6.2 extends the approved M6.1 Competition Discovery reference without changing its hero, journey, card anatomy or right-side rail.

The screen now supports persistent discovery controls suitable for real data integration in M6.3.

## URL contract

| Query parameter | Meaning                                          | Default     |
| --------------- | ------------------------------------------------ | ----------- |
| `q`             | Debounced competition search                     | empty       |
| `tab`           | all, live, upcoming, entered or popular          | all         |
| `game`          | game lane                                        | all         |
| `team`          | 1V1, 4V4 or 5V5                                  | all         |
| `fee`           | free or paid                                     | all         |
| `sort`          | starts-soon, popular, prize-high or availability | starts-soon |
| `page`          | one-based result page                            | 1           |

Default values are omitted from the URL. Invalid values safely resolve to defaults.

## Search behavior

- Input updates immediately.
- Filtering waits 300 ms after the latest keystroke.
- Existing results remain visible during the delay.
- `UPDATING…` identifies the stale-result interval.
- Search matches name, game, format, status and explicit search terms.

## Deterministic sorting

Every sort ends with stable tie breakers. Repeated renders therefore preserve row order.

## Responsive behavior

- Desktop keeps the M6 reference side rail and compact top selectors.
- Mobile uses a collapsible Quick Filters panel.
- Pagination uses accessible previous and next controls.
- No desktop table is compressed into the mobile layout.

## Stage boundary

M6.2 remains mock-backed. Zod schemas, adapters, independent API resources and TanStack Query are introduced in M6.3.
