# VERZUS public-state contract

Production screens must render from confirmed domain records. They must not invent players, Crews, matches, rankings, rewards, notifications, or activity to fill empty space.

## State rules

- **Loading:** retain the final layout dimensions and show bounded skeletons.
- **Success:** show only schema-validated production data.
- **Empty:** explain why the collection is empty and offer one useful next action.
- **Stale:** keep the last confirmed data visible and label its age.
- **Offline:** keep navigation and cached reads available; disable network mutations.
- **Error:** isolate the failed route or widget and expose a retry action and request reference.
- **Maintenance:** identify the unavailable capability without blocking unrelated navigation.
- **Partial failure:** healthy widgets remain interactive while the failed widget owns its fallback.
- **Unauthorized:** redirect to the authentication destination.
- **Forbidden:** preserve the shell and explain that the current role lacks permission.
- **Not found:** preserve the shell and return to the nearest valid product route.

## Public URL rule

Production URLs may contain product filters and pagination. They must not expose scenario, fixture, crash, delay, viewer-override, or mock controls.

## Empty database rule

A newly registered and onboarded player with no domain records must see:

- no scheduled match;
- no competition entries;
- no Crew membership;
- no leaderboard rank;
- no rewards or achievements;
- zero notifications;
- no activity records;
- a production identity derived from their account and profile only.
