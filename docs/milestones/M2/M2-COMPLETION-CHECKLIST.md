# M2 Completion Checklist

## Build and test gate

- [ ] `npm run format:check`
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test`
- [ ] `npm run check:boundaries`
- [ ] `npm run build`
- [ ] `npm run build-storybook`
- [ ] `npm run visual:test`
- [ ] `npm run verify:m2`

## Visual approval

- [ ] 360 px approved
- [ ] 390 px approved
- [ ] 430 px approved
- [ ] 768 px approved
- [ ] 1024 px approved
- [ ] 1440 px approved
- [ ] No unintended horizontal overflow
- [ ] Typography hierarchy matches the approved visual language
- [ ] Brightness and texture remain controlled
- [ ] Dense tables use dedicated mobile presentations

## Interaction and accessibility

- [ ] Keyboard order is logical
- [ ] Visible focus is preserved
- [ ] Touch targets are at least 44 px where applicable
- [ ] Reduced motion is respected
- [ ] Forced colours remain usable
- [ ] Disabled and loading states remain understandable
- [ ] Decorative graphics are hidden from assistive technology

## Resilience

- [ ] Major widgets fail independently
- [ ] Navigation survives unrelated feature failures
- [ ] Essential actions remain available during partial failure
- [ ] Stories use deterministic local data
- [ ] Storybook performs no production API calls

## Release and rollback

- [ ] `package-lock.json` is committed
- [ ] Visual baselines are committed
- [ ] Storybook static build is reproducible through `npm ci`
- [ ] CI visual-regression workflow passes
- [ ] Step 18 commit hash is recorded
- [ ] Rollback command has been tested or reviewed
