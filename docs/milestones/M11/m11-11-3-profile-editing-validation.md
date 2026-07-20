# M11.3 — Profile Editing and Validation

<!-- VERZUS M11.3 -->

## Purpose

Provide a complete, mobile-first edit experience for player-controlled identity fields before M11.4 replaces the local development store with independent API resources.

## Editable fields

- Avatar preview
- Display name
- Player handle
- Player title
- Bio
- Location label
- Country code
- Availability state
- Availability label
- Availability detail
- Next availability window

## Server-owned fields

The editor never permits direct changes to:

- Verification status
- Crew role
- Competitive rank
- Match record
- Trust score
- Reward progress
- Achievement evidence

## Avatar controls

- JPEG, PNG and WebP only
- 2 MB maximum
- Minimum dimensions: 256 × 256
- Maximum dimensions: 4096 × 4096
- SVG and GIF files rejected
- No production upload is performed in M11.3

## Submission reliability

- One active submission at a time
- Request-key replay protection
- Same key plus different content is rejected
- Confirmed local development record is versioned
- Draft and confirmed state survive refresh
- Confirmed edits appear on `/profile`

## Deferred to M11.4

- HTTP profile resources
- Zod response schemas
- Domain adapters
- TanStack Query cache
- Production authorization and persistence
