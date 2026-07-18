<!-- VERZUS M9.6 ROLES, PERMISSIONS AND MEMBER MANAGEMENT -->

# M9.6 — Roles, permissions and member management

## Purpose

Enable audited Crew governance without allowing the browser to decide who may change roles, remove members or transfer ownership.

## Permission matrix

| Viewer role | May manage      | May assign                      | May remove      | May transfer ownership |
| ----------- | --------------- | ------------------------------- | --------------- | ---------------------- |
| Owner       | Every non-owner | Captain, manager, member, trial | Every non-owner | Yes                    |
| Captain     | Member, trial   | Member, trial                   | Member, trial   | No                     |
| Manager     | Trial           | Member, trial                   | Trial           | No                     |
| Member      | None            | None                            | None            | No                     |
| Trial       | None            | None                            | None            | No                     |

## Server invariants

- A Crew always has exactly one owner.
- Generic role changes cannot assign or remove the owner role.
- Ownership transfer is one atomic mutation: the current owner becomes captain and the target becomes owner.
- Self-removal and self-role changes are blocked in member management.
- Every role change, removal and transfer requires a reason and produces an audit event.
- Every mutation requires an idempotency key and expected version.
- Governance failure is isolated from the Crew profile and membership resources.

## Endpoints

```text
GET  /api/crews/[crewId]/governance
POST /api/crews/[crewId]/members/[memberId]/role
POST /api/crews/[crewId]/members/[memberId]/remove
POST /api/crews/[crewId]/ownership/transfer
```

## Verification

```bash
npm run verify:m9:9.6
```

## Local installer verification policy

The default M9.6 installer and `verify:m9:9.6` command intentionally skip Vitest worker execution. They run marker verification, ESLint, and focused TypeScript validation only. The existing component and service tests remain available through `npm run test:m9:9.6` or `npm run verify:m9:9.6:full` when the local Vitest worker pool is stable.
