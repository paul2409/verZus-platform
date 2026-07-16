# Legacy Theme Retirement

The following files remain in the repository as historical references but are not imported by `src/app/layout.tsx`:

- `src/styles/verzus-retro-system.css`
- `src/styles/verzus-reference-lock.css`
- `src/styles/verzus-esports-design-system.css`
- `src/styles/verzus-font-reference.css`

The active visual stack is:

1. `src/styles/globals.css`
2. `src/styles/verzus-visual-system.css`
3. CSS Modules owned by shared components and feature domains

Do not re-import a retired theme file. Move any still-useful rule into canonical tokens, the canonical visual system, a shared primitive, or the owning feature CSS Module.
