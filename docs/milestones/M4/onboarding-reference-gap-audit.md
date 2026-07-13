<!-- VERZUS M4 STEP 4.8 -->

# M4 Step 4.8 — Onboarding Reference Gap Audit

## Current implementation gate

No final onboarding screen is approved for implementation.

## 390px mobile audit

| Screen              | Current status                   | Required action              |
| ------------------- | -------------------------------- | ---------------------------- |
| Welcome             | Generated, not formally approved | Review and approve or revise |
| Choose games        | Generated, not formally approved | Review and approve or revise |
| Location            | Generated, not formally approved | Review and approve or revise |
| Player identity     | Generated, not formally approved | Review and approve or revise |
| Availability        | Missing                          | Generate 390px reference     |
| Crew choice         | Missing                          | Generate 390px reference     |
| Onboarding complete | Missing                          | Generate 390px reference     |

## Tablet audit

All tablet references are blocked until the corresponding mobile reference is
approved and a separate tablet composition is confirmed necessary.

## Desktop audit

All desktop references are blocked until the corresponding mobile reference is
approved.

## Required approval sequence

```text
1. Review the existing 390px welcome reference.
2. Review the existing 390px games reference.
3. Review the existing 390px location reference.
4. Review the existing 390px identity reference.
5. Generate and review the 390px availability reference.
6. Generate and review the 390px Crew reference.
7. Generate and review the 390px completion reference.
8. Mark tablet as required or not required per screen.
9. Generate required tablet references.
10. Generate desktop references from approved mobile direction.
11. Approve desktop references.
12. Audit the repository before writing final screen code.
```

## Blocking rule

A screen can move to final implementation only when:

```text
mobile390 = approved
tablet768 = approved or not_required
desktop1440 = approved
```

## Next action

Review the existing mobile references first. The first unapproved screen is the
welcome screen. No screen implementation should begin during this audit.
