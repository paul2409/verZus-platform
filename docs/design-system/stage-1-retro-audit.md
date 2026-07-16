# Stage 1 Retro Audit

Generated: 2026-07-16T12:12:10.154Z

This report identifies later-stage CSS migration work. Stage 1 does not automatically alter these component or feature files.

## Scope exclusions

- `src/styles/tokens.css`
- `src/styles/verzus-retro-system.css`
- documentation
- generated output and dependency directories

## Shared shell

### Hardcoded hex colours: 2 file(s)

- `src/components/layout/app-shell/AppShell.module.css`
- `src/components/layout/app-shell/ShellOverlays.module.css`

### Nonzero border radii: 3 file(s)

- `src/components/layout/app-shell/AppShell.module.css`
- `src/components/layout/app-shell/PlatformRoute.module.css`
- `src/components/layout/app-shell/ShellOverlays.module.css`

### Raw box shadows: 3 file(s)

- `src/components/layout/app-shell/AppShell.module.css`
- `src/components/layout/app-shell/PlatformRoute.module.css`
- `src/components/layout/app-shell/ShellOverlays.module.css`

### Hardcoded backgrounds: 3 file(s)

- `src/components/layout/app-shell/AppShell.module.css`
- `src/components/layout/app-shell/PlatformRoute.module.css`
- `src/components/layout/app-shell/ShellOverlays.module.css`

### Body atmosphere pseudo-elements: 0 file(s)

- None detected.

### Raw font-family declarations: 3 file(s)

- `src/components/layout/app-shell/AppShell.module.css`
- `src/components/layout/app-shell/PlatformRoute.module.css`
- `src/components/layout/app-shell/ShellOverlays.module.css`

### Hardcoded transition or animation durations: 1 file(s)

- `src/components/layout/app-shell/AppShell.module.css`

### !important usage: 0 file(s)

- None detected.

## Shared primitives

### Hardcoded hex colours: 16 file(s)

- `src/components/primitives/avatar/Avatar.module.css`
- `src/components/primitives/avatar/Identity.module.css`
- `src/components/primitives/badge/Badge.module.css`
- `src/components/primitives/bottom-navigation/BottomNavigation.module.css`
- `src/components/primitives/button/Button.module.css`
- `src/components/primitives/card/Card.module.css`
- `src/components/primitives/checkbox/Checkbox.module.css`
- `src/components/primitives/feedback/Feedback.module.css`
- `src/components/primitives/form-field/FormField.module.css`
- `src/components/primitives/intel-card/IntelCard.module.css`
- `src/components/primitives/overlay/Overlay.module.css`
- `src/components/primitives/panel/Panel.module.css`
- `src/components/primitives/radio/Radio.module.css`
- `src/components/primitives/segmented-control/SegmentedControl.module.css`
- `src/components/primitives/switch/Switch.module.css`
- `src/components/primitives/tabs/Tabs.module.css`

### Nonzero border radii: 18 file(s)

- `src/components/primitives/avatar/Avatar.module.css`
- `src/components/primitives/badge/Badge.module.css`
- `src/components/primitives/bottom-navigation/BottomNavigation.module.css`
- `src/components/primitives/button/Button.module.css`
- `src/components/primitives/card/Card.module.css`
- `src/components/primitives/checkbox/Checkbox.module.css`
- `src/components/primitives/feedback/Feedback.module.css`
- `src/components/primitives/icon/IconButton.module.css`
- `src/components/primitives/input/Input.module.css`
- `src/components/primitives/intel-card/IntelCard.module.css`
- `src/components/primitives/overlay/Overlay.module.css`
- `src/components/primitives/panel/Panel.module.css`
- `src/components/primitives/radio/Radio.module.css`
- `src/components/primitives/segmented-control/SegmentedControl.module.css`
- `src/components/primitives/select/Select.module.css`
- `src/components/primitives/switch/Switch.module.css`
- `src/components/primitives/tabs/Tabs.module.css`
- `src/components/primitives/textarea/Textarea.module.css`

### Raw box shadows: 18 file(s)

- `src/components/primitives/avatar/Avatar.module.css`
- `src/components/primitives/badge/Badge.module.css`
- `src/components/primitives/bottom-navigation/BottomNavigation.module.css`
- `src/components/primitives/button/Button.module.css`
- `src/components/primitives/card/Card.module.css`
- `src/components/primitives/checkbox/Checkbox.module.css`
- `src/components/primitives/feedback/Feedback.module.css`
- `src/components/primitives/icon/IconButton.module.css`
- `src/components/primitives/input/Input.module.css`
- `src/components/primitives/intel-card/IntelCard.module.css`
- `src/components/primitives/overlay/Overlay.module.css`
- `src/components/primitives/panel/Panel.module.css`
- `src/components/primitives/radio/Radio.module.css`
- `src/components/primitives/segmented-control/SegmentedControl.module.css`
- `src/components/primitives/select/Select.module.css`
- `src/components/primitives/switch/Switch.module.css`
- `src/components/primitives/tabs/Tabs.module.css`
- `src/components/primitives/textarea/Textarea.module.css`

### Hardcoded backgrounds: 18 file(s)

- `src/components/primitives/avatar/Avatar.module.css`
- `src/components/primitives/badge/Badge.module.css`
- `src/components/primitives/bottom-navigation/BottomNavigation.module.css`
- `src/components/primitives/button/Button.module.css`
- `src/components/primitives/card/Card.module.css`
- `src/components/primitives/checkbox/Checkbox.module.css`
- `src/components/primitives/feedback/Feedback.module.css`
- `src/components/primitives/icon/IconButton.module.css`
- `src/components/primitives/input/Input.module.css`
- `src/components/primitives/intel-card/IntelCard.module.css`
- `src/components/primitives/overlay/Overlay.module.css`
- `src/components/primitives/panel/Panel.module.css`
- `src/components/primitives/radio/Radio.module.css`
- `src/components/primitives/segmented-control/SegmentedControl.module.css`
- `src/components/primitives/select/Select.module.css`
- `src/components/primitives/switch/Switch.module.css`
- `src/components/primitives/tabs/Tabs.module.css`
- `src/components/primitives/textarea/Textarea.module.css`

### Body atmosphere pseudo-elements: 0 file(s)

- None detected.

### Raw font-family declarations: 19 file(s)

- `src/components/primitives/avatar/Avatar.module.css`
- `src/components/primitives/avatar/Identity.module.css`
- `src/components/primitives/badge/Badge.module.css`
- `src/components/primitives/bottom-navigation/BottomNavigation.module.css`
- `src/components/primitives/button/Button.module.css`
- `src/components/primitives/card/Card.module.css`
- `src/components/primitives/checkbox/Checkbox.module.css`
- `src/components/primitives/feedback/Feedback.module.css`
- `src/components/primitives/form-field/FormField.module.css`
- `src/components/primitives/input/Input.module.css`
- `src/components/primitives/intel-card/IntelCard.module.css`
- `src/components/primitives/overlay/Overlay.module.css`
- `src/components/primitives/panel/Panel.module.css`
- `src/components/primitives/radio/Radio.module.css`
- `src/components/primitives/segmented-control/SegmentedControl.module.css`
- `src/components/primitives/select/Select.module.css`
- `src/components/primitives/switch/Switch.module.css`
- `src/components/primitives/tabs/Tabs.module.css`
- `src/components/primitives/textarea/Textarea.module.css`

### Hardcoded transition or animation durations: 2 file(s)

- `src/components/primitives/button/Button.module.css`
- `src/components/primitives/icon/IconButton.module.css`

### !important usage: 0 file(s)

- None detected.

## Auth

### Hardcoded hex colours: 3 file(s)

- `src/app/(auth)/auth-preview/page.module.css`
- `src/features/auth/forms/AuthForms.module.css`
- `src/features/auth/ui/AuthScreens.module.css`

### Nonzero border radii: 2 file(s)

- `src/features/auth/forms/AuthForms.module.css`
- `src/features/auth/ui/AuthScreens.module.css`

### Raw box shadows: 2 file(s)

- `src/features/auth/forms/AuthForms.module.css`
- `src/features/auth/ui/AuthScreens.module.css`

### Hardcoded backgrounds: 3 file(s)

- `src/app/(auth)/auth-preview/page.module.css`
- `src/features/auth/forms/AuthForms.module.css`
- `src/features/auth/ui/AuthScreens.module.css`

### Body atmosphere pseudo-elements: 0 file(s)

- None detected.

### Raw font-family declarations: 2 file(s)

- `src/features/auth/forms/AuthForms.module.css`
- `src/features/auth/ui/AuthScreens.module.css`

### Hardcoded transition or animation durations: 0 file(s)

- None detected.

### !important usage: 0 file(s)

- None detected.

## Onboarding

### Hardcoded hex colours: 1 file(s)

- `src/features/onboarding/ui/onboarding-experience.module.css`

### Nonzero border radii: 1 file(s)

- `src/features/onboarding/ui/onboarding-experience.module.css`

### Raw box shadows: 1 file(s)

- `src/features/onboarding/ui/onboarding-experience.module.css`

### Hardcoded backgrounds: 1 file(s)

- `src/features/onboarding/ui/onboarding-experience.module.css`

### Body atmosphere pseudo-elements: 0 file(s)

- None detected.

### Raw font-family declarations: 1 file(s)

- `src/features/onboarding/ui/onboarding-experience.module.css`

### Hardcoded transition or animation durations: 0 file(s)

- None detected.

### !important usage: 0 file(s)

- None detected.

## Play

### Hardcoded hex colours: 1 file(s)

- `src/features/play/reference/play-reference-board.module.css`

### Nonzero border radii: 4 file(s)

- `src/features/play/reference/play-reference-board.module.css`
- `src/features/play/ui/play-command-center.module.css`
- `src/features/play/ui/play-premium.module.css`
- `src/features/play/ui/status-chip.module.css`

### Raw box shadows: 3 file(s)

- `src/features/play/reference/play-reference-board.module.css`
- `src/features/play/ui/game-mode-grid.module.css`
- `src/features/play/ui/play-command-center.module.css`

### Hardcoded backgrounds: 2 file(s)

- `src/features/play/reference/play-reference-board.module.css`
- `src/features/play/ui/play-premium.module.css`

### Body atmosphere pseudo-elements: 0 file(s)

- None detected.

### Raw font-family declarations: 5 file(s)

- `src/features/play/reference/play-reference-board.module.css`
- `src/features/play/ui/game-mode-grid.module.css`
- `src/features/play/ui/play-command-center.module.css`
- `src/features/play/ui/play-premium.module.css`
- `src/features/play/ui/status-chip.module.css`

### Hardcoded transition or animation durations: 0 file(s)

- None detected.

### !important usage: 1 file(s)

- `src/features/play/ui/play-command-center.module.css`

## Leaderboards

### Hardcoded hex colours: 2 file(s)

- `src/app/leaderboard-preview/page.module.css`
- `src/features/leaderboards/components/Leaderboard.module.css`

### Nonzero border radii: 1 file(s)

- `src/features/leaderboards/ui/LeaderboardScreen.module.css`

### Raw box shadows: 2 file(s)

- `src/features/leaderboards/components/Leaderboard.module.css`
- `src/features/leaderboards/ui/LeaderboardScreen.module.css`

### Hardcoded backgrounds: 2 file(s)

- `src/app/leaderboard-preview/page.module.css`
- `src/features/leaderboards/components/Leaderboard.module.css`

### Body atmosphere pseudo-elements: 0 file(s)

- None detected.

### Raw font-family declarations: 3 file(s)

- `src/app/leaderboard-preview/page.module.css`
- `src/features/leaderboards/components/Leaderboard.module.css`
- `src/features/leaderboards/ui/LeaderboardScreen.module.css`

### Hardcoded transition or animation durations: 0 file(s)

- None detected.

### !important usage: 1 file(s)

- `src/features/leaderboards/components/Leaderboard.module.css`

## Crews

### Hardcoded hex colours: 0 file(s)

- None detected.

### Nonzero border radii: 2 file(s)

- `src/features/crews/intel-card/CrewIntelCard.module.css`
- `src/features/crews/ui/CrewsScreen.module.css`

### Raw box shadows: 1 file(s)

- `src/features/crews/intel-card/CrewIntelCard.module.css`

### Hardcoded backgrounds: 1 file(s)

- `src/features/crews/intel-card/CrewIntelCard.module.css`

### Body atmosphere pseudo-elements: 0 file(s)

- None detected.

### Raw font-family declarations: 2 file(s)

- `src/features/crews/intel-card/CrewIntelCard.module.css`
- `src/features/crews/ui/CrewsScreen.module.css`

### Hardcoded transition or animation durations: 0 file(s)

- None detected.

### !important usage: 0 file(s)

- None detected.

## Matches

### Hardcoded hex colours: 2 file(s)

- `src/app/match-competition-preview/page.module.css`
- `src/features/matches/components/MatchPrimitives.module.css`

### Nonzero border radii: 3 file(s)

- `src/features/matches/components/MatchPrimitives.module.css`
- `src/features/matches/intel-card/MatchIntelCard.module.css`
- `src/features/matches/ui/MatchesScreen.module.css`

### Raw box shadows: 2 file(s)

- `src/features/matches/components/MatchPrimitives.module.css`
- `src/features/matches/intel-card/MatchIntelCard.module.css`

### Hardcoded backgrounds: 3 file(s)

- `src/app/match-competition-preview/page.module.css`
- `src/features/matches/components/MatchPrimitives.module.css`
- `src/features/matches/intel-card/MatchIntelCard.module.css`

### Body atmosphere pseudo-elements: 0 file(s)

- None detected.

### Raw font-family declarations: 4 file(s)

- `src/app/match-competition-preview/page.module.css`
- `src/features/matches/components/MatchPrimitives.module.css`
- `src/features/matches/intel-card/MatchIntelCard.module.css`
- `src/features/matches/ui/MatchesScreen.module.css`

### Hardcoded transition or animation durations: 0 file(s)

- None detected.

### !important usage: 1 file(s)

- `src/features/matches/intel-card/MatchIntelCard.module.css`

## Compete

### Hardcoded hex colours: 1 file(s)

- `src/features/competitions/components/CompetitionPrimitives.module.css`

### Nonzero border radii: 2 file(s)

- `src/features/competitions/components/CompetitionPrimitives.module.css`
- `src/features/competitions/ui/CompetitionDiscoveryScreen.module.css`

### Raw box shadows: 1 file(s)

- `src/features/competitions/components/CompetitionPrimitives.module.css`

### Hardcoded backgrounds: 1 file(s)

- `src/features/competitions/components/CompetitionPrimitives.module.css`

### Body atmosphere pseudo-elements: 0 file(s)

- None detected.

### Raw font-family declarations: 2 file(s)

- `src/features/competitions/components/CompetitionPrimitives.module.css`
- `src/features/competitions/ui/CompetitionDiscoveryScreen.module.css`

### Hardcoded transition or animation durations: 0 file(s)

- None detected.

### !important usage: 0 file(s)

- None detected.

## Rewards

### Hardcoded hex colours: 0 file(s)

- None detected.

### Nonzero border radii: 1 file(s)

- `src/features/rewards/ui/RewardsScreen.module.css`

### Raw box shadows: 0 file(s)

- None detected.

### Hardcoded backgrounds: 0 file(s)

- None detected.

### Body atmosphere pseudo-elements: 0 file(s)

- None detected.

### Raw font-family declarations: 1 file(s)

- `src/features/rewards/ui/RewardsScreen.module.css`

### Hardcoded transition or animation durations: 0 file(s)

- None detected.

### !important usage: 0 file(s)

- None detected.

## Remaining platform

### Hardcoded hex colours: 6 file(s)

- `src/app/m3-shell-audit/page.module.css`
- `src/components/layout/route-boundary/RouteBoundary.module.css`
- `src/components/layout/widget-boundary/WidgetBoundary.module.css`
- `src/features/profiles/intel-card/PlayerIntelCard.module.css`
- `src/styles/verzus-font-reference.css`
- `src/styles/verzus-reference-lock.css`

### Nonzero border radii: 12 file(s)

- `src/app/page.module.css`
- `src/components/layout/operational-screen/OperationalScreen.module.css`
- `src/components/layout/route-boundary/RouteBoundary.module.css`
- `src/components/layout/system-state/SystemStateScreen.module.css`
- `src/components/layout/widget-boundary/WidgetBoundary.module.css`
- `src/features/profiles/intel-card/PlayerIntelCard.module.css`
- `src/features/profiles/ui/ProfileScreen.module.css`
- `src/features/search/ui/SearchScreen.module.css`
- `src/features/settings/ui/SettingsScreen.module.css`
- `src/styles/globals.css`
- `src/styles/typography.css`
- `src/styles/verzus-visual-system.css`

### Raw box shadows: 8 file(s)

- `src/app/page.module.css`
- `src/components/layout/operational-screen/OperationalScreen.module.css`
- `src/components/layout/route-boundary/RouteBoundary.module.css`
- `src/components/layout/system-state/SystemStateScreen.module.css`
- `src/components/layout/widget-boundary/WidgetBoundary.module.css`
- `src/features/profiles/intel-card/PlayerIntelCard.module.css`
- `src/styles/globals.css`
- `src/styles/verzus-visual-system.css`

### Hardcoded backgrounds: 9 file(s)

- `src/app/m3-shell-audit/page.module.css`
- `src/app/page.module.css`
- `src/components/layout/operational-screen/OperationalScreen.module.css`
- `src/components/layout/route-boundary/RouteBoundary.module.css`
- `src/components/layout/widget-boundary/WidgetBoundary.module.css`
- `src/features/profiles/intel-card/PlayerIntelCard.module.css`
- `src/styles/verzus-font-reference.css`
- `src/styles/verzus-reference-lock.css`
- `src/styles/verzus-visual-system.css`

### Body atmosphere pseudo-elements: 1 file(s)

- `src/styles/verzus-reference-lock.css`

### Raw font-family declarations: 13 file(s)

- `src/app/page.module.css`
- `src/components/layout/operational-screen/OperationalScreen.module.css`
- `src/components/layout/system-state/SystemStateScreen.module.css`
- `src/features/profiles/intel-card/PlayerIntelCard.module.css`
- `src/features/profiles/ui/ProfileScreen.module.css`
- `src/features/search/ui/SearchScreen.module.css`
- `src/features/settings/ui/SettingsScreen.module.css`
- `src/styles/fonts.css`
- `src/styles/globals.css`
- `src/styles/reset.css`
- `src/styles/typography.css`
- `src/styles/verzus-font-reference.css`
- `src/styles/verzus-reference-lock.css`

### Hardcoded transition or animation durations: 4 file(s)

- `src/styles/globals.css`
- `src/styles/reset.css`
- `src/styles/verzus-reference-lock.css`
- `src/styles/verzus-visual-system.css`

### !important usage: 4 file(s)

- `src/styles/globals.css`
- `src/styles/reset.css`
- `src/styles/verzus-reference-lock.css`
- `src/styles/verzus-visual-system.css`

## Preview and design-system routes

### Hardcoded hex colours: 19 file(s)

- `src/app/(platform)/m3-preview/page.module.css`
- `src/app/(platform)/route-boundaries-preview/page.module.css`
- `src/app/(platform)/shell-overlays-preview/page.module.css`
- `src/app/(platform)/widget-boundaries-preview/page.module.css`
- `src/app/(preview)/m4-onboarding-references/onboarding-references.module.css`
- `src/app/(preview)/m4-onboarding-responsive-references/responsive-references.module.css`
- `src/app/avatar-preview/page.module.css`
- `src/app/badge-preview/page.module.css`
- `src/app/bottom-navigation-preview/page.module.css`
- `src/app/card-preview/CardPreview.module.css`
- `src/app/design-system/page.module.css`
- `src/app/feedback-preview/page.module.css`
- `src/app/intel-cards-preview/page.module.css`
- `src/app/shell-preview/page.module.css`
- `src/app/tabs-preview/page.module.css`
- `src/stories/ApplicationShell.module.css`
- `src/stories/DesignSystemBaseline.module.css`
- `src/stories/IntelCards.module.css`
- `src/styles/verzus-esports-design-system.css`

### Nonzero border radii: 12 file(s)

- `src/app/(preview)/m4-onboarding-references/onboarding-references.module.css`
- `src/app/(preview)/m4-onboarding-responsive-references/responsive-references.module.css`
- `src/app/atmosphere-preview/page.module.css`
- `src/app/button-preview/page.module.css`
- `src/app/card-preview/CardPreview.module.css`
- `src/app/design-system/page.module.css`
- `src/app/font-preview/page.module.css`
- `src/app/form-preview/page.module.css`
- `src/app/icon-preview/page.module.css`
- `src/app/token-preview/page.module.css`
- `src/app/typography-preview/page.module.css`
- `src/stories/DesignSystemBaseline.module.css`

### Raw box shadows: 13 file(s)

- `src/app/(preview)/m4-onboarding-references/onboarding-references.module.css`
- `src/app/(preview)/m4-onboarding-responsive-references/responsive-references.module.css`
- `src/app/atmosphere-preview/page.module.css`
- `src/app/avatar-preview/page.module.css`
- `src/app/button-preview/page.module.css`
- `src/app/card-preview/CardPreview.module.css`
- `src/app/design-system/page.module.css`
- `src/app/font-preview/page.module.css`
- `src/app/form-preview/page.module.css`
- `src/app/icon-preview/page.module.css`
- `src/app/shell-preview/page.module.css`
- `src/app/typography-preview/page.module.css`
- `src/stories/DesignSystemBaseline.module.css`

### Hardcoded backgrounds: 25 file(s)

- `src/app/(platform)/m3-preview/page.module.css`
- `src/app/(platform)/shell-overlays-preview/page.module.css`
- `src/app/(platform)/widget-boundaries-preview/page.module.css`
- `src/app/(preview)/m4-onboarding-references/onboarding-references.module.css`
- `src/app/(preview)/m4-onboarding-responsive-references/responsive-references.module.css`
- `src/app/atmosphere-preview/page.module.css`
- `src/app/avatar-preview/page.module.css`
- `src/app/badge-preview/page.module.css`
- `src/app/bottom-navigation-preview/page.module.css`
- `src/app/button-preview/page.module.css`
- `src/app/card-preview/CardPreview.module.css`
- `src/app/design-system/page.module.css`
- `src/app/feedback-preview/page.module.css`
- `src/app/font-preview/page.module.css`
- `src/app/form-preview/page.module.css`
- `src/app/icon-preview/page.module.css`
- `src/app/intel-cards-preview/page.module.css`
- `src/app/navigation-states-preview/page.module.css`
- `src/app/shell-preview/page.module.css`
- `src/app/tabs-preview/page.module.css`
- `src/app/typography-preview/page.module.css`
- `src/stories/ApplicationShell.module.css`
- `src/stories/DesignSystemBaseline.module.css`
- `src/stories/IntelCards.module.css`
- `src/styles/verzus-esports-design-system.css`

### Body atmosphere pseudo-elements: 1 file(s)

- `src/styles/verzus-esports-design-system.css`

### Raw font-family declarations: 21 file(s)

- `src/app/(platform)/m3-preview/page.module.css`
- `src/app/(preview)/m5-play-review/review.module.css`
- `src/app/atmosphere-preview/page.module.css`
- `src/app/avatar-preview/page.module.css`
- `src/app/badge-preview/page.module.css`
- `src/app/bottom-navigation-preview/page.module.css`
- `src/app/card-preview/CardPreview.module.css`
- `src/app/design-system/page.module.css`
- `src/app/feedback-preview/page.module.css`
- `src/app/font-preview/page.module.css`
- `src/app/icon-preview/page.module.css`
- `src/app/intel-cards-preview/page.module.css`
- `src/app/navigation-states-preview/page.module.css`
- `src/app/shell-preview/page.module.css`
- `src/app/tabs-preview/page.module.css`
- `src/app/token-preview/page.module.css`
- `src/app/typography-preview/page.module.css`
- `src/stories/ApplicationShell.module.css`
- `src/stories/DesignSystemBaseline.module.css`
- `src/stories/IntelCards.module.css`
- `src/styles/verzus-esports-design-system.css`

### Hardcoded transition or animation durations: 2 file(s)

- `src/app/card-preview/CardPreview.module.css`
- `src/styles/verzus-esports-design-system.css`

### !important usage: 4 file(s)

- `src/app/(preview)/m4-onboarding-references/onboarding-references.module.css`
- `src/app/icon-preview/page.module.css`
- `src/app/token-preview/page.module.css`
- `src/styles/verzus-esports-design-system.css`

## Summary counts

| Domain                           | Hex | Radius | Shadow | Background | Atmosphere | Font | Duration | Important |
| -------------------------------- | --: | -----: | -----: | ---------: | ---------: | ---: | -------: | --------: |
| Shared shell                     |   2 |      3 |      3 |          3 |          0 |    3 |        1 |         0 |
| Shared primitives                |  16 |     18 |     18 |         18 |          0 |   19 |        2 |         0 |
| Auth                             |   3 |      2 |      2 |          3 |          0 |    2 |        0 |         0 |
| Onboarding                       |   1 |      1 |      1 |          1 |          0 |    1 |        0 |         0 |
| Play                             |   1 |      4 |      3 |          2 |          0 |    5 |        0 |         1 |
| Leaderboards                     |   2 |      1 |      2 |          2 |          0 |    3 |        0 |         1 |
| Crews                            |   0 |      2 |      1 |          1 |          0 |    2 |        0 |         0 |
| Matches                          |   2 |      3 |      2 |          3 |          0 |    4 |        0 |         1 |
| Compete                          |   1 |      2 |      1 |          1 |          0 |    2 |        0 |         0 |
| Rewards                          |   0 |      1 |      0 |          0 |          0 |    1 |        0 |         0 |
| Remaining platform               |   6 |     12 |      8 |          9 |          1 |   13 |        4 |         4 |
| Preview and design-system routes |  19 |     12 |     13 |         25 |          1 |   21 |        2 |         4 |
