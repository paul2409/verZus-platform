# VERZUS Domain Model

## Conventions
- IDs are opaque UUIDs or equivalent globally unique identifiers.
- Timestamps are stored in UTC.
- Destructive business records are archived or voided, not hard-deleted, unless privacy law requires removal.
- Every high-risk mutation records actor, reason, timestamp, request ID, and before/after state.
- Public view models do not expose internal database shapes directly.

## Aggregate boundaries

### Identity aggregate
User, PlayerProfile, GameAccount, TrustScore, Penalty.

### Competition aggregate
Competition, Season, Week, Pool, Registration, Match, MatchParticipant, CheckIn, Result, Evidence, Dispute.

### Crew aggregate
Crew, CrewMember, CrewLaneAssignment, CrewInvite, CrewApplication.

### Ranking aggregate
Leaderboard, LeaderboardEntry, RankMovement, RankingRuleset.

### Reward aggregate
RewardDefinition, RewardGrant, RewardClaim, Achievement.

### Communication aggregate
Notification, ActivityEvent.

### Operations aggregate
Report, AuditEvent, FeatureFlag.

## Entities

### User
**Purpose:** Authentication and account-level security identity.

**Primary key:** `userId`

**Owner:** Identity domain.

**States:** `pending_verification`, `active`, `suspended`, `banned`, `deactivated`.

**Relationships:** One PlayerProfile; many sessions; many audit events.

**Source of truth:** Identity service and primary relational database.

**Create:** Registration command.

**Update:** Verified account settings commands.

**Delete/archive:** Deactivate first. Privacy deletion handled by a dedicated erasure workflow while preserving legally required audit references.

### PlayerProfile
**Purpose:** Public competitive identity.

**Primary key:** `playerId`

**Owner:** Profiles domain.

**States:** `incomplete`, `active`, `restricted`, `archived`.

**Relationships:** One User; many GameAccounts; zero or one active Crew membership; many matches, leaderboard entries, achievements.

**Key fields:** handle, display name, avatar, city, country, bio, availability, onboarding status.

**Permissions:** Owner edits allowed fields. Moderators may restrict. Public reads respect privacy settings.

### Game
**Purpose:** Supported game title configuration.

**Primary key:** `gameId`

**Owner:** Platform operations.

**States:** `planned`, `active`, `maintenance`, `retired`.

**Key fields:** slug, name, platform support, roster model, verification adapter, ruleset version.

### GameLane
**Purpose:** Competitive lane for a specific game within player and Crew structures.

**Primary key:** `gameLaneId`

**Owner:** Competitions and Crews.

**Relationships:** Game, CrewLaneAssignment, GameAccount, leaderboard.

### GameAccount
**Purpose:** Link a player to their external game identity.

**Primary key:** `gameAccountId`

**Owner:** Identity domain.

**States:** `unverified`, `pending`, `verified`, `rejected`, `revoked`.

**Verification:** Adapter-specific. External APIs where available; profile-code or evidence verification otherwise.

### Crew
**Purpose:** Persistent team-like organisation spanning one or more game lanes.

**Primary key:** `crewId`

**Owner:** Crew domain.

**States:** `forming`, `active`, `inactive`, `suspended`, `disbanded`, `archived`.

**Relationships:** Many CrewMembers; lane assignments; competitions; leaderboard entries; activity events.

**Rules:** Must have exactly one owner while active. Ownership transfer is transactional.

**Deletion:** Disband then archive. Historical results retain Crew reference.

### CrewMember
**Purpose:** Membership and role inside a Crew.

**Primary key:** `crewMemberId`

**States:** `invited`, `trial`, `active`, `inactive`, `removed`, `left`.

**Roles:** `owner`, `captain`, `member`, `trial`.

**Constraints:** One active Crew membership per player in V1 unless explicitly changed by future policy.

### CrewLaneAssignment
**Purpose:** Assign eligible members to a Crew's game lane and roster role.

**Primary key:** `assignmentId`

**States:** `active`, `benched`, `inactive`.

**Fields:** gameLaneId, playerId, roster role, starter/substitute designation.

### Competition
**Purpose:** Organised competitive event.

**Primary key:** `competitionId`

**Owner:** Competition domain.

**States:** `draft`, `scheduled`, `registration_open`, `registration_closed`, `check_in_open`, `in_progress`, `completed`, `cancelled`, `archived`.

**Relationships:** Game, season, registrations, pools, matches, rewards, ruleset.

**Deletion:** Never hard-delete after publication. Cancel or archive.

### Tournament
**Purpose:** Optional competition format containing bracket or staged progression.

**Primary key:** `tournamentId`

**States:** `draft`, `seeded`, `active`, `completed`, `cancelled`.

### Season
**Purpose:** Time-bounded competitive cycle.

**Primary key:** `seasonId`

**States:** `planned`, `active`, `locked`, `completed`, `archived`.

**Relationships:** Weeks, competitions, leaderboards, rewards.

### Week
**Purpose:** Scoring and scheduling period inside a season.

**Primary key:** `weekId`

**States:** `scheduled`, `active`, `scoring`, `finalized`, `archived`.

**Rule:** Once finalized, ranking inputs require an explicit correction workflow.

### Pool
**Purpose:** Competitive grouping for fixtures or qualification.

**Primary key:** `poolId`

**States:** `forming`, `active`, `completed`, `archived`.

### Registration
**Purpose:** Player or Crew entry into a competition.

**Primary key:** `registrationId`

**States:** `pending`, `confirmed`, `waitlisted`, `withdrawn`, `rejected`, `cancelled`.

**Rules:** Idempotent create. Eligibility checked server-side.

### Match
**Purpose:** Scheduled contest between participants.

**Primary key:** `matchId`

**States:** `scheduled`, `check_in_open`, `ready`, `in_progress`, `result_pending`, `completed`, `disputed`, `cancelled`, `forfeited`.

**Relationships:** Competition, participants, check-ins, evidence, result, dispute.

**Source of truth:** Match service.

**Rules:** State transitions are command-controlled and version-checked.

### MatchParticipant
**Purpose:** Player or Crew side assigned to a Match.

**Primary key:** `matchParticipantId`

**States:** `scheduled`, `checked_in`, `ready`, `forfeited`, `completed`.

### CheckIn
**Purpose:** Time-bound proof that a participant is present and ready.

**Primary key:** `checkInId`

**States:** `not_open`, `open`, `checked_in`, `missed`, `waived`, `revoked`.

**Rules:** Server clock is authoritative. Command is idempotent.

### Result
**Purpose:** Official outcome of a Match.

**Primary key:** `resultId`

**States:** `submitted`, `awaiting_confirmation`, `confirmed`, `rejected`, `superseded`, `voided`.

**Fields:** winner, score, source, verifier, ruleset version.

### Evidence
**Purpose:** File or external reference supporting a result or dispute.

**Primary key:** `evidenceId`

**States:** `pending_upload`, `uploaded`, `scanning`, `accepted`, `rejected`, `expired`.

**Security:** Restricted MIME types, size limits, malware scanning, signed URLs, retention policy.

### Dispute
**Purpose:** Controlled review of a contested result or match operation.

**Primary key:** `disputeId`

**States:** `opened`, `awaiting_evidence`, `under_review`, `resolved`, `rejected`, `closed`.

**Rules:** Resolution requires authorized actor, reason, and audit event.

### Leaderboard
**Purpose:** Named ranking view for a scope and ruleset.

**Primary key:** `leaderboardId`

**Types:** weekly player, weekly pool, game lane, Crew championship, combine.

**States:** `building`, `live`, `stale`, `finalized`, `archived`.

### LeaderboardEntry
**Purpose:** Ranked projection for one player, pool, or Crew.

**Primary key:** `leaderboardEntryId`

**Fields:** rank, score, wins, losses, win rate, streak, trust snapshot, subject reference, calculatedAt, rulesetVersion.

**Rule:** Derived, reproducible, and not manually edited except through correction commands.

### RankMovement
**Purpose:** Explain change between ranking snapshots.

**Primary key:** `rankMovementId`

**Fields:** previousRank, currentRank, delta, snapshot IDs.

### RankingRuleset
**Purpose:** Versioned deterministic scoring rules.

**Primary key:** `rankingRulesetId`

**States:** `draft`, `active`, `retired`.

### TrustScore
**Purpose:** Platform trust indicator derived from verified behaviour.

**Primary key:** `trustScoreId`

**States:** `provisional`, `active`, `restricted`, `frozen`.

**Inputs:** completed matches, confirmations, disputes, no-shows, penalties, verified identity signals.

**Rule:** Versioned and explainable. It must not be a hidden irreversible black box.

### Penalty
**Purpose:** Record a rule violation and its consequence.

**Primary key:** `penaltyId`

**States:** `proposed`, `active`, `appealed`, `overturned`, `expired`.

### RewardDefinition
**Purpose:** Defines what can be earned and the eligibility rules.

**Primary key:** `rewardDefinitionId`

**States:** `draft`, `active`, `paused`, `retired`.

### RewardGrant
**Purpose:** Server-authoritative entitlement for a player or Crew.

**Primary key:** `rewardGrantId`

**States:** `locked`, `eligible`, `claimable`, `claimed`, `expired`, `revoked`.

### RewardClaim
**Purpose:** Idempotent record of a reward claim command.

**Primary key:** `rewardClaimId`

**States:** `pending`, `succeeded`, `failed`, `reversed`.

### Achievement
**Purpose:** Persistent recognition of a competitive milestone.

**Primary key:** `achievementId`

**States:** `locked`, `earned`, `revoked`.

### Notification
**Purpose:** User-facing event requiring awareness or action.

**Primary key:** `notificationId`

**States:** `unread`, `read`, `actioned`, `dismissed`, `expired`.

### ActivityEvent
**Purpose:** User-visible activity feed event.

**Primary key:** `activityEventId`

**Rule:** Derived from domain events; not a source of truth.

### Invite
**Purpose:** Invitation to a Crew, competition, or restricted action.

**Primary key:** `inviteId`

**States:** `pending`, `accepted`, `declined`, `expired`, `revoked`.

### Application
**Purpose:** Player request to join a Crew or programme.

**Primary key:** `applicationId`

**States:** `submitted`, `under_review`, `accepted`, `rejected`, `withdrawn`, `expired`.

### Report
**Purpose:** User-submitted moderation report.

**Primary key:** `reportId`

**States:** `submitted`, `triaged`, `investigating`, `resolved`, `dismissed`.

### AuditEvent
**Purpose:** Immutable record of sensitive operations.

**Primary key:** `auditEventId`

**Fields:** actor, action, target, reason, requestId, timestamp, before, after, metadata.

**Rule:** Append-only.

### FeatureFlag
**Purpose:** Decouple feature release from deployment.

**Primary key:** `featureFlagId`

**States:** `disabled`, `internal`, `percentage`, `enabled`.

## Domain invariants
- An active Crew always has one owner.
- A completed Match has one current official Result.
- A Result used for ranking must be confirmed or system-verified.
- A RewardClaim cannot create duplicate entitlement.
- A finalized Week cannot change without a correction event.
- A leaderboard entry is derived from versioned inputs and rules.
- A user cannot perform an action solely because the client displays it.
- Direct writes to financial or reward ledgers are prohibited outside approved commands.
