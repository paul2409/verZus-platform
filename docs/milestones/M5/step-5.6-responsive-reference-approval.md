<!-- VERZUS M5 STEPS 5.5-5.8 -->

# Step 5.6 — Tablet and Desktop Reference Approval

## Action

After explicit 390px approval, unlock the 768px tablet and 1440px desktop
reference sets.

## Responsive rule

Tablet is not a compressed desktop screen.

```text
390px
  one dominant action
  vertical widget order
  bottom-navigation safe area

768px
  single main canvas
  two-column secondary widgets
  touch-sized controls

1440px
  two-column command-centre grid
  primary action receives the largest area
  secondary widgets remain independently replaceable
```

## Approval command

After reviewing tablet and desktop references:

```bash
VERZUS_M5_RESPONSIVE_APPROVAL=APPROVED \
  bash ./VERZUS_M5_Steps_5_5_to_5_8_Play_References_UI.sh implement
```

The approval command is the explicit authorization to replace the production
`/play` placeholder.
