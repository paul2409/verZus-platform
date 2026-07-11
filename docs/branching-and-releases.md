# Branching and Releases

## Branches

- `main`: releasable and protected
- `develop`: optional integration branch only when parallel work requires it
- `feature/<scope>`: product capability
- `fix/<scope>`: defect correction
- `chore/<scope>`: repository and platform work
- `release/<version>`: stabilization only when required

## Pull requests

Required checks:

- formatting
- lint
- type-check
- unit and component tests
- architecture boundaries
- production build
- browser smoke tests

## Artifact identity

Every CI build is identified by the Git commit SHA. The same approved artifact should move through preview, staging, and production when the deployment platform supports artifact promotion.
