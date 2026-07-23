# Smart Resume

Smart Resume stores small, schema-validated workflow checkpoints for authenticated players.
It does not persist passwords, access tokens, evidence files, payment details, or arbitrary redirect URLs.

## Supported workflows

- Crew creation: restores the last valid creation step and draft.
- Competition entry: returns to the final terms confirmation.
- Match result: restores the score and optional note until submission succeeds.

## Authority and lifecycle

The server generates every resume path. The client cannot submit a redirect path.
Each `(user, workflow type, workflow key)` has one idempotently upserted checkpoint.
Repeated identical saves do not increment the checkpoint version.
Successful domain completion deletes the checkpoint. Expired checkpoints are excluded from reads and the Action Centre.

## Failure behavior

A failed checkpoint save never blocks the underlying Crew, competition, or match operation.
Crew creation retains its versioned local copy as an offline fallback.
The Action Centre reads checkpoints independently, so its failure cannot disable navigation or domain actions.
