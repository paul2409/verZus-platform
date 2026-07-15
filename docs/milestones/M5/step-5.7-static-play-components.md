<!-- VERZUS M5 STEPS 5.5-5.8 -->

# Step 5.7 — Static Play Component Structure

## Component map

```text
PlayCommandCenter
├── PlayerStatusStrip
├── PrimaryActionPanel
│   ├── NextMatchCard
│   └── CheckInControl
├── CurrentPositionWidget
├── CrewPulseWidget
├── OpportunityRail
├── RecentActivityWidget
└── QuickActions
```

## Rules

- Shared components stay domain-neutral.
- Every major Play widget is wrapped by `WidgetBoundary`.
- Quick actions do not depend on Play API responses.
- Check-in remains display-only in this step. The mutation belongs to Step 5.10.
- Mobile, tablet, and desktop use intentional layouts.
