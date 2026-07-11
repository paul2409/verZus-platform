# VERZUS Responsive Strategy

## Supported widths
- 360px.
- 390px primary mobile reference.
- 430px large mobile.
- 768px tablet.
- 1024px small desktop/tablet landscape.
- 1440px primary desktop reference.
- 1920px wide desktop validation.

320px may receive a basic overflow and usability check but is not the primary target unless launch analytics require it.

## Design order
1. Generate and approve the 390px mobile reference.
2. Implement and verify mobile anatomy.
3. Generate tablet only where the composition materially changes.
4. Generate and approve 1440px desktop.
5. Verify intermediate widths.

## Core rules
- Mobile is not a compressed desktop.
- Dense tables use separate mobile presentation.
- Primary actions remain visible without horizontal scrolling.
- Text and controls wrap intentionally.
- No page-level horizontal overflow.
- Touch targets are at least 44 by 44 CSS pixels where practical.
- Bottom navigation respects safe-area insets.
- Desktop uses available space without creating excessively long line lengths.

## Leaderboard rule
Shared data model, distinct presentation:

- Desktop: semantic table or CSS grid with complete columns.
- Mobile: ranking cards or two-band rows showing the most important values first.

## Content priority
Mobile order:

1. immediate state;
2. primary action;
3. next match or competition;
4. rank and Crew context;
5. secondary history and explanation.

## Breakpoint behaviour
Breakpoints respond to content pressure rather than device names. Components may switch presentation earlier than the page shell.

## Verification
At each relevant width check:

- no overflow;
- no clipped text;
- no unreachable control;
- no overlapping fixed navigation;
- logical focus order;
- correct modal/drawer behaviour;
- readable data density;
- skeleton dimensions match loaded content.
