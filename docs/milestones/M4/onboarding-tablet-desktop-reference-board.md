<!-- VERZUS M4 ONBOARDING RESPONSIVE REFERENCES -->

# M4 Tablet and Desktop Onboarding Reference Board

## Purpose

Provide all required 768px tablet and 1440px desktop onboarding references in
one approval-only localhost board.

These references do not implement the final onboarding routes.

## Route

```text
/m4-onboarding-responsive-references
```

## Included references

Tablet:

```text
Onboarding welcome
Choose games
Select location
Create player identity
Set availability
Join or skip Crew
Onboarding complete
```

Desktop:

```text
Onboarding welcome
Choose games
Select location
Create player identity
Set availability
Join or skip Crew
Onboarding complete
```

## Responsive decisions

Tablet is not a compressed desktop layout.

Tablet uses:

```text
focused content canvas
touch-sized controls
two-column forms when appropriate
no persistent desktop step rail
fixed action area
```

Desktop uses:

```text
persistent onboarding step rail
broad content canvas
isolated context and failure panel
fixed action footer
expanded grids for dense choices and scheduling
```

## Approval state

The installer marks generated tablet and desktop references as
`generated_unapproved` in the M4 approval manifest when the corresponding
status is still blocked, missing, undecided, or pending review.

It does not change existing approved statuses.

## Run

```bash
npm run m4:onboarding-responsive-references
```

Open:

```text
http://localhost:3107/m4-onboarding-responsive-references
```

## Approval checklist

Verify every reference for:

```text
screen purpose
visual hierarchy
loading and failure-state compatibility
keyboard and touch target feasibility
no horizontal overflow
independent widget failure
persistent navigation and recovery actions
premium retro VERZUS texture
tablet-specific presentation
desktop-specific presentation
```

## M4 completion warning

Generating references does not finish M4.

After approval:

1. update the approval manifest to `approved`
2. implement the seven final onboarding routes
3. run component, integration, E2E, accessibility, responsive, and visual tests
4. run the final M4 verification gate
