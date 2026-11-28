<!-- intent-skills:start -->
## Skill Loading

Use the repository’s installed Intent. If it is unavailable, report the missing dependency instead of downloading a replacement.
Before editing files for a substantial task:
- Run `npm exec --no -- intent list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `npm exec --no -- intent load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues for `L1UK3/playsouthwales` via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Branch naming

Type-prefixed names for standalone branches; `<feature>/main` and `<feature>/<part>` for feature trees. See `docs/agents/branching.md`.

### Triage labels

Vocabulary: `needs-triage`, `question` (needs info), `bug` (needs reproduction), `ready`, `in-progress`, `on-hold`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Repository layout

The TanStack Start app and the legacy stack it replaces live side by side while the migration runs. Each folder has its own tooling; use the one listed for the folder you are changing.

| Folder | What it is | Tooling |
| --- | --- | --- |
| `app/` | TanStack Start app on Cloudflare Workers and D1. npm workspace `@playsouthwales/app` | Run npm scripts from the root (`npm run dev`, `npm test`, `npm run typecheck`). Biome |
| `frontend/` | Legacy Vite + React frontend | Not an npm workspace: it has its own `package-lock.json`, so run `npm ci` and its scripts inside `frontend/`. Format with Biome from the root config (`npm run format`). Do not add it to the root `workspaces`; its dependencies clash with `app/` |
| `backend/` | Legacy FastAPI backend | Python 3.14 with uv, inside `backend/`: `uv sync`, `uv run ruff check .`, `uv run ruff format .`, `uv run pytest`. Biome does not cover it |
| `supabase/` | Legacy Supabase config, migrations and seed | Supabase CLI from the repo root: `npx supabase start` |
| `docker/`, `docker-compose.yml` | Legacy dev services for `frontend/` and `backend/` | `docker compose up` from the repo root |
| `.devcontainer/app/`, `.devcontainer/old/` | Dev containers for `app/` and for the legacy stack | |
| `docs/legacy/` | Docs for the legacy stack | |

`frontend/` still has Biome lint errors, so its CI job checks formatting and import order only (`biome ci frontend --linter-enabled=false`). Running `npm run check` from the root lints `frontend/` too and will report them.
