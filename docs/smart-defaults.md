# VERZUS Smart Defaults

## Purpose

Smart Defaults remove repeated setup without transferring authority to the client. The server composes safe defaults from the player's primary game identity, profile location, availability, recent search history, and low-risk explicit display preferences.

## Authority order

1. explicit player preference;
2. authoritative profile or game identity;
3. recent confirmed usage history;
4. neutral product fallback.

An explicit `all` selection remains explicit and is not replaced by a profile inference.

## Current integrations

- Crew creation receives primary game and region only when no local or server resume draft exists.
- Competition discovery receives game and sort only when the URL does not already declare them.
- Leaderboards receive mode and game only when the URL does not already declare them.

User edits remain authoritative. Smart defaults never overwrite a URL parameter, a resumed workflow, or an edited form.

## Data flow

`PostgreSQL -> smart-default repository -> deterministic service -> API schema -> adapter -> query cache -> feature state`

## Failure behavior

Failure to load or save a default never blocks Crew creation, competition discovery, leaderboards, navigation, or domain mutations. Each feature keeps its neutral fallback.
