# VERZUS Permission Model

## Principles
- Deny by default.
- Enforce on the server.
- Client checks are presentation only.
- High-risk actions require reason and audit logging.
- Ownership and role checks use current server state.

## Roles
- Guest.
- Player.
- Crew Trial.
- Crew Member.
- Crew Captain.
- Crew Owner.
- Competition Operator.
- Support Agent.
- Moderator.
- Platform Admin.
- Super Admin.

## Permission matrix

| Capability | Guest | Player | Captain | Owner | Operator | Support | Moderator | Admin | Super Admin |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| View public profile | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Edit own profile | No | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Enter competition | No | Eligible | Eligible | Eligible | No | No | No | No | No |
| Check in to own match | No | Yes | Yes | Yes | No | No | No | No | No |
| Submit own result | No | Yes | Yes | Yes | No | No | No | No | No |
| Open own dispute | No | Yes | Yes | Yes | No | No | No | No | No |
| Create Crew | No | Yes | Yes | No active Crew owner conflict | No | No | No | No | No |
| Invite Crew members | No | No | Yes | Yes | No | No | No | No | No |
| Remove Crew member | No | No | Limited | Yes | No | No | Moderation only | Yes | Yes |
| Assign Crew lanes | No | No | Yes | Yes | No | No | No | No | No |
| Transfer Crew ownership | No | No | No | Yes | No | No | No | Emergency only | Yes |
| Disband Crew | No | No | No | Yes | No | No | Suspend only | Emergency only | Yes |
| Create competition | No | No | No | No | Yes | No | No | Yes | Yes |
| Cancel competition | No | No | No | No | Owned scope | No | No | Yes | Yes |
| Resolve dispute | No | No | No | No | Scoped | No | Yes | Yes | Yes |
| Suspend player | No | No | No | No | No | No | Yes | Yes | Yes |
| Correct result | No | No | No | No | Scoped | No | Yes | Yes | Yes |
| Issue reward | No | No | No | No | Scoped grant | No | No | Yes | Yes |
| Revoke reward | No | No | No | No | No | No | No | Yes | Yes |
| View audit logs | No | No | No | No | Scoped | Limited | Yes | Yes | Yes |
| Manage feature flags | No | No | No | No | No | No | No | Limited | Yes |

## Resource-level checks
Every mutation checks:

1. authenticated actor;
2. account state;
3. role permission;
4. resource ownership or scope;
5. current resource lifecycle state;
6. version or concurrency token;
7. idempotency key where required;
8. rate limit;
9. audit requirement.

## High-risk actions
The following require confirmation, reason, and audit event:

- account suspension or ban;
- result correction;
- dispute resolution;
- Crew ownership transfer;
- Crew disband;
- competition cancellation;
- reward revocation;
- penalty issuance;
- feature flag enablement for all users.

## Emergency access
Break-glass access is restricted to Super Admin, time-bounded where possible, separately logged, and reviewed after use.
