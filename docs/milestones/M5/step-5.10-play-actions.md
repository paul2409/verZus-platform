<!-- VERZUS M5 STEPS 5.9-5.13 -->

# Step 5.10 — Play Actions

Implemented actions:

- server-authoritative check-in
- idempotency-key enforcement
- immediate duplicate-click lock
- stale mutation-key protection
- refresh-persistent mock check-in state
- view match
- find match
- enter competition
- view standings
- open Crew HQ
- retry one failed widget
- retry all failed widgets

The check-in mutation is `POST /api/check-ins/current` and the independent read
resource remains `GET /api/check-ins/current`.
