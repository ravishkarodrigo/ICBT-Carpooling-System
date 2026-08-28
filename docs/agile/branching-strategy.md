# Branching, merging & Git workflow

A trunk-based-ish flow suitable for a small team.

## Branches
- `main` — always deployable; protected. Only updated via reviewed PRs.
- `develop` — integration branch for the current sprint.
- `feature/<short-name>` — one per story/task, branched from `develop`.
- `fix/<short-name>` — bug fixes.

## Workflow
1. `git checkout develop && git pull`
2. `git checkout -b feature/us-6-request-seat`
3. Commit in small, meaningful steps (see message convention below).
4. Push and open a **pull request into `develop`** using the PR template.
5. At least one teammate reviews; CI must be green before merge.
6. Merge with a squash or merge commit; delete the feature branch.
7. At the end of the sprint, PR `develop` → `main` and tag a release.

## Commit message convention
Use a lightweight Conventional Commits style so history is readable:

```
feat(rides): rank search results by route and time overlap
fix(auth): return generic error on bad login to avoid enumeration
test(requests): cover driver-only decision authorization
docs(agile): update sprint 2 velocity
chore(ci): cache npm dependencies
```

## Branch protection (configure on GitHub)
- Require PR review before merging into `main`.
- Require the `CI` workflow to pass.
- Disallow force-push to `main`.

## Ensuring every member contributes
Assign stories across the team on the board and keep authorship real — the rubric
checks that commit history shows contributions from every member. Do not fake
commits; distribute the work.
