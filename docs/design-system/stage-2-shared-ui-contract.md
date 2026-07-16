# VERZUS Stage 2 Shared UI Contract

Status: implementation candidate awaiting visual approval

## Scope

Stage 2 converts the application shell and shared primitives. It does not recompose Play, Leaderboards, Crews, Matches, Compete, Rewards, Auth, or Onboarding pages.

## Shell

The shared header contains:

- VERZUS wordmark
- `// V.01`
- leaderboards shortcut
- navigation menu
- search
- notifications
- profile control

The mobile dock is limited to:

1. Play
2. Crew
3. Watch
4. Rewards
5. Profile

The routes remain `/play`, `/crews`, `/matches`, `/rewards`, and `/profile`.

## Primitive language

- Primary action: neon green fill, dark text, notched corners
- Secondary action: transparent, cyan border
- Danger action: transparent, red border
- Panel: dark surface, 1px hairline border, no heavy shadow
- Active state: green
- Information and focus: cyan
- Reward and timer: gold
- Rivalry and War Week: magenta
- Error, loss, and destructive: red
- Paragraphs remain neutral and readable

## Accessibility

- Existing ARIA labels and semantic controls are preserved
- Focus uses a visible cyan ring
- Mobile actions retain touch-target sizing
- Reduced-motion behavior remains active
- Colour is not used as the only accessible label

## Stage boundary

Stage 3 owns the Play screen composition. Stage 2 must stop after shell and primitive approval.
