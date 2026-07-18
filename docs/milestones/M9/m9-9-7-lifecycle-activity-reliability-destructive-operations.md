# M9.7 — Lifecycle, activity reliability and destructive operations

## Intent

Add a server-authoritative Crew lifecycle resource without merging it into the profile, membership, governance or activity dependencies. The Crew page must remain readable when lifecycle or activity data fails, while high-risk mutations fail closed.

## Lifecycle contract

Supported states:

- `forming`
- `active`
- `inactive`
- `suspended`
- `archived`
- `disbanded`

Owner transitions:

- `forming -> active | archived`
- `active -> inactive | archived`
- `inactive -> active | archived`
- `archived -> active`

`disbanded` is terminal. `suspended` is controlled by platform operations and cannot be changed by a Crew owner. These transition rules are a clearly labelled M9 implementation assumption pending a production backend policy decision.

## Independent endpoints

- `GET /api/crews/[crewId]/lifecycle`
- `POST /api/crews/[crewId]/lifecycle/transition`
- `POST /api/crews/[crewId]/disband`

Every mutation requires:

- server-computed owner permission;
- expected version;
- idempotency key;
- audit reason;
- a dedicated confirmation phrase for disbanding.

## Destructive-operation controls

Disbanding is blocked while active matches or open disputes exist. The command preserves historical identity, results, ownership and audit data. It disables recruiting, membership mutations and live activity operations.

## Membership integration

Membership commands read the lifecycle source of truth before accepting applications, invites, decisions or leave operations. Joining and management are allowed only while the Crew is `forming` or `active`. Leaving remains available in non-terminal states so members are not trapped. The sole owner still has to transfer ownership before leaving.

## Activity reliability

The activity panel receives its own resource health and retry control. Stale, offline or failed activity keeps the last usable snapshot visible. The failure does not disable navigation, roster, membership, governance or lifecycle controls.

## Scenario routes

- `?lifecycleScenario=inactive`
- `?lifecycleScenario=suspended`
- `?lifecycleScenario=archived`
- `?lifecycleScenario=disbanded`
- `?lifecycleScenario=blocked`
- `?lifecycleScenario=stale`
- `?lifecycleScenario=error`
- `?lifecycleScenario=offline`
- `?resource=activity&scenario=offline`

Scenario state is read-only and does not mutate the server store.

## Rollback

Run:

```bash
bash ./VERZUS_M9_9_7_Lifecycle_Activity_Reliability_Destructive_Operations_NO_TESTS.sh rollback
```

## Stage verification policy

The M9.7 installer intentionally uses a lean gate:

- structural and contract marker verification;
- focused ESLint;
- focused TypeScript validation.

Vitest is not executed by `verify:m9:9.7`. The complete Crew test, build, browser, accessibility and visual-regression suite remains the M9.8 release gate.
