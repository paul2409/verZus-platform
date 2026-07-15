<!-- VERZUS M5 STEPS 5.5-5.8 -->

# Step 5.5 — 390px Play Reference Set

## Action

Generate the ten required 390px Play Command Centre states before replacing the
production `/play` route.

## States

```text
normal
check_in_open
checked_in
match_starting_soon
no_match_scheduled
crew_activity_present
no_crew
opportunities_available
partial_api_failure
offline
```

## Opening viewport rule

The first mobile viewport must answer:

```text
What do I need to do now?
Who am I playing next?
Is check-in open?
Have I checked in?
Where do I rank?
What is happening with my Crew?
What can I enter?
```

The next match and check-in must appear before secondary explanation.

## Route

```text
/m5-play-references
```

## Start

```bash
npm run m5:references
```

Open:

```text
http://localhost:3109/m5-play-references
```

## Approval command

After reviewing all ten 390px states:

```bash
VERZUS_M5_MOBILE_APPROVAL=APPROVED \
  bash ./VERZUS_M5_Steps_5_5_to_5_8_Play_References_UI.sh responsive
```
