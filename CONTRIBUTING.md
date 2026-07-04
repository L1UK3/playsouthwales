# Contributing to Play South Wales

---

## Getting Started

1. **Fork & Clone** the repository.
2. Follow the detailed setup instructions in **[SETUP.md](SETUP.md)** to configure your environment variables, database, and local servers.
3. Make sure all local services run successfully before making changes.

---

## Branching Policy

We use a structured branch naming convention. When creating a branch, prefix it based on the type of work:

- `feature/your-feature-name` (for new features)
- `bugfix/your-bugfix-name` (for fixing bugs)
- `docs/your-docs-change` (for documentation updates)
- `refactor/clean-up` (for code refactoring)

---

## Conventional Commits

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages. This helps generate clean changelogs. Format commit messages as follows:

```text
<type>(<scope>): <description>
```

### Examples

- `feat(auth): add Clerk JWT verification middleware`
- `fix(map): repair venue pin display coordinates`
- `docs(setup): document node workspace installation steps`
- `style(frontend): format card layout spacing`

---

## Code Style & Quality Standards

To maintain consistency, we enforce formatting and linting rules.

### Frontend (TypeScript & Vite)

- We use **Prettier** for code formatting and **ESLint** for rule enforcement.
- Running `npm run lint` in the `frontend` directory checks your code.
- If using VS Code, format-on-save is configured to run automatically.

### Backend (FastAPI & Python)

- We use **Ruff** for fast Python linting and formatting.
- If you are using **`uv`**, you can run Ruff directly on-demand (it will auto-install if not present):
  - To check code:
    ```bash
    uv run ruff check .
    ```
  - To format code:
    ```bash
    uv run ruff format .
    ```
- Alternatively, if you have activated your virtual environment and installed ruff:
  - To check code:
    ```bash
    ruff check .
    ```
  - To format code:
    ```bash
    ruff format .
    ```
