# Branch naming

## Standalone branches

A branch that targets `main` directly uses a type prefix and a kebab-case
name: `feat/discord`, `fix/db`, `chore/deps`. The prefixes match the
conventional-commit types used in commit messages.

## Feature trees

A feature that is split across several branches gets its own namespace. The
parent branch is `<feature>/main`. Each child is `<feature>/<part>` and
branches from the parent.

```
web-services/main            parent, targets main
web-services/regs            child, targets web-services/main
web-services/sets            child, targets web-services/main
web-services/events          child, targets web-services/main
web-services/champ-points    child, targets web-services/main
```

Rules:

- Names are kebab-case: `champ-points`, not `champ_points`.
- The parent is always `<feature>/main`. Git cannot hold both `web-services`
  and `web-services/regs`, because one ref would have to be a file and a
  folder at once.
- A child's pull request targets `<feature>/main`. The parent's pull request
  targets `main`.
- When the parent changes, merge it into every child so the children stay
  current.
- A child of a child is not allowed. Split the work into more siblings
  instead.
