<!-- VERZUS M4 STEP 4.8 -->

# M4 Step 4.8 — Onboarding Screen Contracts

## Scope

This document defines screen purpose, route, component ownership, data
dependencies, supported states, failure isolation, and responsive intent.

It does not authorize final screen implementation.

## Route sequence

```text
/onboarding
→ /onboarding/games
→ /onboarding/location
→ /onboarding/identity
→ /onboarding/availability
→ /onboarding/crew
→ /onboarding/complete
→ /play
```

## Screen purposes

| Screen          | Purpose                                               |
| --------------- | ----------------------------------------------------- |
| Welcome         | Explain onboarding and begin or resume safely         |
| Choose games    | Select supported games used by platform discovery     |
| Location        | Capture eligibility, region, and timezone information |
| Player identity | Create the public gamer identity                      |
| Availability    | Record realistic weekly play windows                  |
| Crew choice     | Join a Crew or explicitly skip                        |
| Complete        | Review validated setup and enter VERZUS               |

## Supported states

The contracts support applicable combinations of:

```text
loading
success
empty
stale
error
offline
retrying
unauthorized
forbidden
not found
maintenance
partial failure
```

## Failure isolation

Examples:

- game catalog failure does not remove back navigation
- timezone resolution failure falls back to manual selection
- identity preview failure does not block identity submission
- Crew discovery failure never removes the skip path
- summary widget failure does not invalidate otherwise valid onboarding data

## Data flow

```text
HTTP response
→ schema validation
→ onboarding domain model
→ query cache
→ screen view model
→ isolated UI widgets
```

The query cache and screen view models are implemented after reference
approval, not in this step.

## Responsive intent

### 390px mobile

Each screen is designed as a mobile-first task, not a compressed desktop
layout. Controls remain touch-safe, errors remain visible, and no screen
requires horizontal scrolling.

### 768px tablet

Tablet composition is generated only when the approved mobile design benefits
from a distinct presentation.

### 1440px desktop

Desktop uses broader composition and independent supporting panels rather than
stretching the mobile card across the viewport.

## Implementation gate

Final onboarding screen code remains blocked until the required visual
references are generated and approved.
