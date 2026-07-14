<!-- VERZUS M4 ONBOARDING MOBILE REFERENCES -->

# M4 Onboarding Mobile Reference Board

## Purpose

Provide all seven required 390px onboarding visual references in one
approval-only localhost board.

This route is not a production onboarding implementation.

## Route

```text
/m4-onboarding-references
```

## Included references

```text
Onboarding welcome
Choose games
Select location
Create player identity
Set availability
Join or skip Crew
Onboarding complete
```

## Mobile-first gate

Only the 390px references are included.

Tablet and desktop references must not be produced until the mobile references
are reviewed and approved.

## Reference intent

### Welcome

Purpose:

- explain the value of onboarding
- show progress
- confirm automatic progress saving
- provide one primary start action

### Games

Purpose:

- select up to five supported games
- show platform compatibility
- distinguish recommended and selected games
- preserve empty and partial-failure behavior in implementation

### Location

Purpose:

- collect country, region, city, and timezone
- explain why location is needed
- communicate privacy
- avoid exposing precise public location

### Identity

Purpose:

- create the public gamer tag
- select a primary platform
- enter a platform identity
- preview the player card

### Availability

Purpose:

- select recurring days
- create local-time match windows
- provide quick scheduling choices
- support empty, stale, and partial-failure states

### Crew

Purpose:

- show compatible Crew suggestions
- explain fit reasons
- keep the skip action visible
- allow Crew discovery to fail independently

### Complete

Purpose:

- confirm server-authoritative completion
- summarize the player profile
- present the first mission
- direct the player to Play

## Approval checklist

For each reference verify:

```text
390px layout
clear purpose
one dominant action
legible typography
no horizontal overflow
premium retro VERZUS texture
navigation survives unrelated failures
required empty/error/retry behavior is documented
```

## Run

```bash
npm run m4:onboarding-references
```

Open:

```text
http://localhost:3106/m4-onboarding-references
```

## Implementation rule

Do not create the final seven onboarding routes until these mobile references
are approved.

After approval:

1. update the reference approval manifest
2. decide whether tablet references are required
3. generate desktop references
4. obtain approval
5. implement final routes and states
