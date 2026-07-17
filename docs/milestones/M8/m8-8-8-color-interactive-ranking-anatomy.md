<!-- VERZUS M8.8 COLOR AND INTERACTIVE RANKING ANATOMY -->

# M8.8 — Color System and Interactive Ranking Anatomy

## Intent

Turn leaderboards into an information surface rather than a static table while preserving semantic table and ordered-list behavior.

## Color policy

Rows expose semantic attributes for rank zone, tier, game and entity type. CSS tokens determine the visual treatment. Every color meaning also has text or accessible-label support.

Rank zones:

- champion;
- podium;
- promotion;
- contender;
- current position;
- standard.

## Interaction policy

The complete row is never clickable. Explicit player, Crew and match triggers open a URL-addressable intel card:

```text
?intel=player&entityId=player-prismo
?intel=crew&entityId=crew-xenon
?intel=match&entityId=match-player-prismo
```

The card is a bottom sheet on mobile and a drawer on desktop. Escape closes it, focus starts on the close control, and existing leaderboard filters remain in the URL.

M8.8 uses data already present in the validated leaderboard row. M8.9 will replace the local snapshot with independent player, Crew and match intel APIs without changing the trigger contract.

## Verification

```bash
npm run verify:m8:8.8
```

## Rollback

```bash
bash ./VERZUS_M8_8_8_Color_Interactive_Ranking_Anatomy.sh rollback
```
