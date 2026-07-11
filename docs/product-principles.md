# VERZUS Product Principles

## 1. Competitive first

Every primary screen should reinforce competition, progression, identity, or participation. Decorative content must not displace the player's next action.

## 2. The next action is obvious

The opening viewport should answer what the player needs to do now. Primary actions must remain visible and understandable across mobile and desktop.

## 3. State is never ambiguous

Every asynchronous or competitive operation must expose its state. Examples: registration open, registered, check-in open, checked in, result pending, disputed, completed.

## 4. Trust before spectacle

Visual energy is important, but verification, auditability, ownership, and transparent rules are more important.

## 5. Everything important is traceable

Competition entries, check-ins, results, disputes, rank changes, reward claims, penalties, and administrative actions require timestamps, actors, and audit records.

## 6. Features fail independently

One failed widget, query, adapter, or third-party integration must not disable navigation or unrelated features.

## 7. No giant page dependency

A page may use aggregation for performance, but critical widgets must have independent contracts, fallbacks, and retry behaviour.

## 8. Server authority wins

The server controls authorization, deadlines, match state, eligibility, rewards, ranking inputs, and sensitive mutations. Client state is never the final authority.

## 9. Mobile is a first-class product

Mobile layouts are designed intentionally. Dense desktop tables become mobile ranking cards or summaries rather than compressed tables.

## 10. Real states, not demo states

Every screen is designed for loading, success, empty, stale, error, offline, unauthorized, forbidden, not found, maintenance, retrying, and partial failure where applicable.

## 11. Reversible where possible

Actions should support cancellation, rollback, or correction where the domain allows it. Irreversible actions require explicit confirmation and audit logging.

## 12. Same artifact, multiple environments

Development, preview, staging, and production use the same versioned artifact with environment-specific configuration.

## 13. Mocks and APIs share contracts

Mock responses must pass the same schemas and adapters as real API responses.

## 14. Ownership is explicit

Every feature, entity, table, API route, event, and operational workflow has one clear owner.

## 15. Accessibility is part of quality

Keyboard operation, focus visibility, readable contrast, touch target sizing, semantic structure, and reduced-motion behaviour are required.

## 16. Prefer narrow, high-leverage changes

Avoid drive-by refactors. Change the smallest coherent boundary and verify it before continuing.

## 17. No silent failure

Failures must produce a user-safe fallback and an operator-visible signal with a request or correlation identifier.

## 18. Rankings are deterministic

Given the same verified inputs and ruleset version, ranking output must be reproducible.

## 19. Money and rewards are command-controlled

Wallet, reward, prize, and credit mutations occur only through controlled domain commands. Feature modules never write directly to ledgers.

## 20. Delete what is no longer authoritative

Old implementations, duplicate contracts, dead routes, obsolete mocks, and superseded styles are removed once replacement verification is complete.
