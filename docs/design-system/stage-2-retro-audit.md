# Stage 2 Retro Shared-UI Audit

Generated: 2026-07-16T12:33:01.530Z

## Boundary

This audit covers the application shell, route/widget boundaries, operational/system-state layouts, and shared primitives. Feature and page compositions remain outside Stage 2.

## Totals After Conversion

- CSS files: 29
- Hardcoded hex colours: 0
- Nonzero border-radius declarations: 0
- Existing `!important` declarations: 0

## File Results

| File                                                                      | Hex | Nonzero Radius | !important |
| ------------------------------------------------------------------------- | --: | -------------: | ---------: |
| `src\components\layout\app-shell\AppShell.module.css`                     |   0 |              0 |          0 |
| `src\components\layout\app-shell\PlatformRoute.module.css`                |   0 |              0 |          0 |
| `src\components\layout\app-shell\ShellOverlays.module.css`                |   0 |              0 |          0 |
| `src\components\layout\operational-screen\OperationalScreen.module.css`   |   0 |              0 |          0 |
| `src\components\layout\route-boundary\RouteBoundary.module.css`           |   0 |              0 |          0 |
| `src\components\layout\system-state\SystemStateScreen.module.css`         |   0 |              0 |          0 |
| `src\components\layout\widget-boundary\WidgetBoundary.module.css`         |   0 |              0 |          0 |
| `src\components\primitives\avatar\Avatar.module.css`                      |   0 |              0 |          0 |
| `src\components\primitives\avatar\Identity.module.css`                    |   0 |              0 |          0 |
| `src\components\primitives\badge\Badge.module.css`                        |   0 |              0 |          0 |
| `src\components\primitives\bottom-navigation\BottomNavigation.module.css` |   0 |              0 |          0 |
| `src\components\primitives\button\Button.module.css`                      |   0 |              0 |          0 |
| `src\components\primitives\button\ButtonGroup.module.css`                 |   0 |              0 |          0 |
| `src\components\primitives\card\Card.module.css`                          |   0 |              0 |          0 |
| `src\components\primitives\checkbox\Checkbox.module.css`                  |   0 |              0 |          0 |
| `src\components\primitives\feedback\Feedback.module.css`                  |   0 |              0 |          0 |
| `src\components\primitives\form-field\FormField.module.css`               |   0 |              0 |          0 |
| `src\components\primitives\icon\Icon.module.css`                          |   0 |              0 |          0 |
| `src\components\primitives\icon\IconButton.module.css`                    |   0 |              0 |          0 |
| `src\components\primitives\input\Input.module.css`                        |   0 |              0 |          0 |
| `src\components\primitives\intel-card\IntelCard.module.css`               |   0 |              0 |          0 |
| `src\components\primitives\overlay\Overlay.module.css`                    |   0 |              0 |          0 |
| `src\components\primitives\panel\Panel.module.css`                        |   0 |              0 |          0 |
| `src\components\primitives\radio\Radio.module.css`                        |   0 |              0 |          0 |
| `src\components\primitives\segmented-control\SegmentedControl.module.css` |   0 |              0 |          0 |
| `src\components\primitives\select\Select.module.css`                      |   0 |              0 |          0 |
| `src\components\primitives\switch\Switch.module.css`                      |   0 |              0 |          0 |
| `src\components\primitives\tabs\Tabs.module.css`                          |   0 |              0 |          0 |
| `src\components\primitives\textarea\Textarea.module.css`                  |   0 |              0 |          0 |

## Stage 3 Inputs

Stage 3 may rebuild the Play composition only after shell and primitive approval at 390px, 768px, and 1440px.
