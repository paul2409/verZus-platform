# VERZUS Retro Theme Ownership

Status: active Stage 1 visual foundation

## Active source of truth

`src/styles/verzus-retro-system.css` is the only active global visual theme.

`src/styles/tokens.css` remains the base compatibility token layer. Feature and component styles consume semantic `var(--vz-...)` values. They must not duplicate the global palette.

## Final import order

The root layout imports Fontsource packages first. It then imports:

1. `src/styles/globals.css`
2. `src/styles/verzus-retro-system.css`

`globals.css` imports the foundational styles in this order:

1. `tokens.css`
2. `fonts.css`
3. `reset.css`
4. `typography.css`

The retro theme therefore loads after all foundational token, font, reset, typography, and neutral global rules.

## Inactive legacy stylesheets

These files remain in the repository for history and controlled rollback, but must not be imported globally:

- `src/styles/verzus-esports-design-system.css`
- `src/styles/verzus-reference-lock.css`
- `src/styles/verzus-font-reference.css`
- `src/styles/verzus-visual-system.css` when present

## Signal meanings

- Neon green: primary action, success, active navigation, positive performance
- Cyan: information, links, tabs, secondary actions
- Purple: structure, inactive borders, rare competitive states
- Gold and orange: rewards, timers, progression, championship points
- Red: live urgency, danger, destructive actions, losses
- Pink: rivalry and War Week signals
- White and muted grey: readable text and neutral data

Neon colours are signals rather than paragraph text or decoration.

## Typography ownership

- Rajdhani: display headings, navigation, labels, controls, scores, ranks, and statistics
- Inter: body copy, descriptions, forms, help text, and rules
- Numeric UI uses tabular lining figures

No additional global font may be introduced without design-system approval.

## Shape and atmosphere

- All active retro radius tokens resolve to zero
- Notched surfaces use `--vz-retro-cut-sm`, `--vz-retro-cut-md`, or `--vz-retro-cut-lg`
- `verzus-retro-system.css` exclusively owns the global background, grid, scanlines, focus ring, retro radii, glows, and colour aliases
- Grid and scanline layers must not be duplicated inside pages or components

## Component rule

Components and feature screens consume semantic variables. Do not hardcode theme hex values in TSX or component CSS Modules. Shared primitives are migrated during Stage 2; feature screens are migrated during later stages.
