<!-- VERZUS M8.1 LEADERBOARD RESPONSIVE FOUNDATION -->

# M8.1 — Responsive Foundation and Approved Screen

## Intent

Install the approved M8 leaderboard composition before adding network contracts. Mobile is a compact ranking list; desktop is a full semantic table. They consume one typed local view model but are not the same presentation compressed across breakpoints.

## Screen purpose

Answer immediately:

- Which leaderboard am I viewing?
- Who is leading?
- Where am I ranked?
- How did ranks move?
- Which period, game and scope are active?

## Modes

- Weekly player standings
- Weekly pool standings
- Game lane rankings
- Crew championship
- Combine rankings

## Viewports

Review at 360, 390, 430, 768, 1024 and 1440 pixels.

## M8.1 boundary

M8.1 uses typed deterministic local data and functional local controls. Query strings, pagination, remote schemas, adapters and caches are deliberately deferred to M8.2 and M8.3.

## Verification

```bash
npm run verify:m8:8.1
```

## Preview

```bash
npm run m8:preview
```

Open `http://127.0.0.1:3120/leaderboards/weekly`.

## Rollback

```bash
bash ./VERZUS_M8_8_1_Leaderboard_Foundation.sh rollback
```
