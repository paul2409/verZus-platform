# VERZUS Product Vision

## Status
Approved baseline for Milestone 0. Changes require an explicit product decision and an update to the relevant Architecture Decision Record.

## Product statement
VERZUS is a competitive gaming platform that turns everyday players into members of structured esports-style competition. It gives players a clear place to play, check in, compete, rank up, join Crews, earn recognition, and build a credible competitive identity across supported games.

VERZUS is not only a tournament listing site. It is the operational system for a player's competitive life: identity, scheduling, check-in, match execution, evidence, results, rankings, Crew participation, rewards, trust, disputes, and progression.

## Primary problem
Competitive gaming communities often operate through fragmented WhatsApp groups, Discord servers, spreadsheets, social posts, manual screenshots, and informal organisers. Players struggle to answer basic questions:

- What should I do next?
- Who am I playing?
- When must I check in?
- Is this competition legitimate?
- Will my result be recorded?
- Where do I rank?
- Can I trust the organiser and opponent?
- How do I join a serious team-like group?
- What evidence is required if there is a dispute?

VERZUS centralises these flows into one reliable system.

## Target users
### Primary
- Competitive players who want regular, structured competition.
- Players who want a credible rank, history, and trust profile.
- Players who want to belong to a Crew with roles, identity, goals, and shared competition.

### Secondary
- Crew owners and captains managing rosters and participation.
- Competition operators running official VERZUS competitions.
- Moderators and support staff resolving disputes and maintaining platform integrity.
- Creators, partners, and sponsors who may support competitions later.

## Launch market assumption
Season Zero is designed for an initial community with strong mobile and console gaming participation, especially players using EA FC, Clash Royale, COD Mobile, and League of Legends. This is a product assumption and may be revised through user research and launch metrics.

## Core value proposition
VERZUS gives a player:

1. A live command centre showing what needs attention now.
2. Structured competition with visible rules and state transitions.
3. Rankings that update from verified results.
4. A Crew system that feels like belonging to an esports organisation.
5. A persistent competitive identity across seasons.
6. Trust and evidence systems that reduce fraud and ambiguity.
7. Clear progression, rewards, and recognition.

## Product promise
Every important player action should be clear, stateful, traceable, and recoverable.

A player should never need to guess:

- whether they are registered;
- whether check-in is open;
- whether a result was accepted;
- whether a reward was claimed;
- whether a dispute is active;
- whether a leaderboard is fresh;
- whether a feature is unavailable or simply empty.

## Product experience
VERZUS should feel:

- competitive;
- alive;
- premium;
- fast;
- credible;
- team-oriented;
- transparent;
- rewarding.

The interface may use a premium retro-futurist esports visual language, but clarity and operability take priority over decoration.

## What makes VERZUS different
VERZUS combines:

- multi-game competitive identity;
- Crew-based competition across game lanes;
- independent player and Crew rankings;
- explicit check-in and match-state workflows;
- game-specific result verification adapters;
- evidence and dispute handling;
- trust and auditability;
- isolated feature architecture so one failing widget does not disable the application.

## Success criteria
VERZUS succeeds when:

- players return weekly because they have a clear next action;
- matches complete with low dispute rates;
- check-in and result flows are reliable;
- players understand their rank and progression;
- Crews actively recruit and organise members;
- operators can resolve failures without editing the database directly;
- the same immutable build can move from preview to staging to production;
- a single feature outage does not take down unrelated functionality.

## Non-goals for V1
VERZUS V1 is not:

- a streaming platform;
- a general social network;
- a gambling product;
- a marketplace for every gaming service;
- a native mobile application;
- a fully automated anti-cheat system;
- an all-games platform at launch;
- a replacement for Discord voice chat.

## Product guardrails
- Do not show fake live data in production.
- Do not hide important states behind visual decoration.
- Do not make money, rewards, or ranking changes without audit records.
- Do not allow a single page-wide endpoint to become the only dependency for a critical screen.
- Do not rely on the client for authorization or deadline enforcement.
- Do not merge unfinished features into the primary journey without a feature flag.

## Vision summary
VERZUS is the operating system for structured competitive gaming communities: a place where players know what to do next, where results become reputation, and where Crews compete with the identity and discipline of esports teams.
