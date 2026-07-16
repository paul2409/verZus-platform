# VERZUS Visual Contract

Status: Stage 1 foundation lock

## Source of truth

1. Approved VERZUS reference screenshots
2. This contract
3. `src/styles/tokens.css`
4. Shared primitives
5. Feature CSS Modules

## Signal palette

| Purpose                | Token                       |     Value |
| ---------------------- | --------------------------- | --------: |
| Canvas                 | `--vz-color-neutral-950`    | `#080A0C` |
| Surface                | `--vz-color-neutral-900`    | `#111519` |
| Elevated surface       | `--vz-color-neutral-850`    | `#1A2026` |
| Primary/action/success | `--vz-color-green-500`      | `#00FF87` |
| Information/focus      | `--vz-color-cyan-500`       | `#00E5FF` |
| Live/danger/loss       | `--vz-color-red-500`        | `#FF3830` |
| War/rivalry            | `--vz-color-pink-500`       | `#FF2D87` |
| Reward/rank/timer      | `--vz-color-warning-400`    | `#FFC400` |
| Primary text           | `--vz-color-text-primary`   | `#F1F0FF` |
| Secondary text         | `--vz-color-text-secondary` | `#8A87B8` |

Neon colours are signals, not decoration. One accent dominates each screen.

## Typography

- Rajdhani: headings, labels, navigation, scores, ranks, and timers.
- Inter: paragraphs, descriptions, forms, rules, and long readable content.
- Numeric values use tabular figures.
- Mobile body text must remain at least 14px.
- Important mobile information must remain at least 16px.

## Surfaces and controls

- Near-black canvas, never pure black.
- Dark elevated panels with 1px hairline borders.
- Cards use 12-16px radii where the reference uses rounding.
- Primary actions and rank chips may use notched corners.
- No heavy drop shadows.
- Glow is reserved for active, focused, live, or successful states.

## Accessibility

- Cyan is the global keyboard-focus signal.
- Body text must meet 4.5:1 contrast.
- Status meaning must not depend on colour alone.
- Reduced-motion preferences must be respected.

## Stage 1 boundary

Stage 1 changes tokens, font ownership, global signals, and active theme imports only. It does not recompose Play, Leaderboards, Crews, or any other feature page.
