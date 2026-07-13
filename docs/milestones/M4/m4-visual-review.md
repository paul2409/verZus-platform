<!-- VERZUS M4 VISUAL REVIEW DASHBOARD -->

# M4 Visual Review Dashboard

## Purpose

Open one local dashboard for visually checking every expected M4
authentication and onboarding route.

The dashboard:

- starts the Next.js development server on port `3104`
- scans the repository for every required M4 route file
- probes each local route
- shows route availability or redirect behavior
- embeds existing screens in review frames
- supports 360, 390, 430, 768, 1024, and 1440 widths
- marks missing route files without inventing placeholder screens
- writes a route manifest to `reports/m4-visual-review/manifest.json`

## Run

```bash
npm run m4:visual-review
```

Keep the terminal open during review. Press `Ctrl+C` when finished.

## Important limitation

Protected onboarding routes can redirect to `/login` when the review browser
does not have the required authenticated mock-session cookie.

A redirect proves that route protection is active. It does not prove that the
underlying onboarding screen has been implemented.

The dashboard checks actual routes only. It does not replace the required
mobile-first reference approval process.
