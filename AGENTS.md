---
meta.contentType: Reference
---

# How do AI agents develop Play! South Wales?

This document outlines system architecture, build commands, and coding standards. It guides AI agents (like Antigravity or Claude Code) when modifying code or documentation.

## Plan

- **Overview**: System standards, setup commands, and agent configurations
- **Goal**: Maintain consistency in code architecture, style guidelines, and documentation
- **Audience**: AI assistants modifying files in the repository
- **Content Plan**: Document tech stack, developer command reference, frontend design system, database rules, and agent skills mapping
- **Open Questions**: None

## System topology and tech stack

The application uses a separated client-server design.

- **Vite frontend**: Single Page Application (SPA) written in React 19 and TypeScript, styled with Tailwind CSS v4, and powered by TanStack Query and TanStack Router
- **FastAPI backend**: Python REST API running on Python 3.14+, serving data models from Supabase and validating sessions via Clerk JSON Web Tokens (JWT)
- **Supabase database**: PostgreSQL database storing persistent tables for events, leagues, and leaderboards
- **Clerk authentication**: Identity provider managing user login states

Refer to the system topology diagram:

```mermaid
graph TD
    Client[React Frontend] -->|HTTP Request / JWT Bearer| API[FastAPI Backend]
    API -->|Auth Verification| Clerk[Clerk Auth Service]
    API -->|SQL Queries| DB[Supabase Database]
    Cron[Uvicorn Lifespan background task] -->|HTTP GET Scrapes| Poke[Pokedata.ovh & Bulbapedia]
    Cron -->|Writes Standings| DB
```

For detailed architectural flows, refer to [architecture.md](file:///C:/Users/lukee/Documents/Projects/playwales/docs/architecture.md).

## Local development workflow

You must run the application components in their corresponding environments.

### Installation and build commands

Run the following commands in the workspace root to install dependencies and run the servers:
- **Set up backend**: Navigate to [backend](file:///C:/Users/lukee/Documents/Projects/playwales/backend) to build the virtual environment:
  ```bash
  cd backend
  python -m venv .venv
  .venv\Scripts\Activate.ps1
  pip install -r requirements.txt
  ```
- **Run backend**: Start the development server using Uvicorn:
  ```bash
  uvicorn app.main:app --host 127.0.0.1 --port 5000 --reload
  ```
- **Set up frontend**: Navigate to [frontend](file:///C:/Users/lukee/Documents/Projects/playwales/frontend) to install npm packages:
  ```bash
  cd frontend
  npm install
  ```
- **Run frontend**: Start the Vite developer server:
  ```bash
  npm run dev
  ```

For step-by-step local installation instructions, read [SETUP.md](file:///C:/Users/lukee/Documents/Projects/playwales/docs/SETUP.md).

### Verification and testing

Run these verification scripts to validate changes before pushing:
- **Lint backend**: Run Ruff to lint and format python code:
  ```bash
  ruff check .
  ruff format .
  ```
- **Test backend**: Run backend tests using Pytest:
  ```bash
  pytest
  ```
- **Lint frontend**: Run ESLint to lint typescript code:
  ```bash
  npm run lint
  ```
- **Format frontend**: Run Prettier to format frontend code:
  ```bash
  npm run format
  ```

## Code architecture standards

You must write clean, type-safe code that respects existing project patterns.

### Backend rules

FastAPI routes live in the [backend/app](file:///C:/Users/lukee/Documents/Projects/playwales/backend/app) directory.
- **Model validation**: Use Pydantic v2 schemas for all request payloads and response bodies
- **Endpoint routing**: Use APIRouter instances grouped by domain inside sub-routers
- **Authentication**: Secure administrative routes using the `require_auth` dependency with Clerk JWT headers
- **Synchronizations**: Uvicorn lifespan tasks handle automated event synchronization runs

### Frontend rules

React client files live in the [frontend/src](file:///C:/Users/lukee/Documents/Projects/playwales/frontend/src) directory.
- **File-based routing**: TanStack Router handles page routing, keeping routes in the `routes/` subdirectory
- **Data fetching**: Use TanStack Query hooks to cache and sync API requests
- **Strict typing**: Use TypeScript for all components and utility functions
- **Design tokens**: Follow the styling guidelines in [design.md](file:///C:/Users/lukee/Documents/Projects/playwales/frontend/design.md)

### Database rules

Postgres tables live on Supabase.
- **Migrations**: Write raw DDL SQL files in [supabase/migrations](file:///C:/Users/lukee/Documents/Projects/playwales/supabase/migrations) for schema updates
- **Local testing**: Apply mock data from [seed.sql](file:///C:/Users/lukee/Documents/Projects/playwales/supabase/seed.sql) to populate local tables
- **Row-Level Security (RLS)**: Enforce security policies on all persistent tables

For manual data syncs and database upgrades, follow [event_sync.md](file:///C:/Users/lukee/Documents/Projects/playwales/docs/event_sync.md).

## Frontend design system rules

You must style new interfaces according to the modern-minimal design system defined in [design.md](file:///C:/Users/lukee/Documents/Projects/playwales/frontend/design.md).

### Color palette

Use the following OKLCH colors defined in the global stylesheet:
- **Paper color**: `oklch(0.985 0.006 28)` for background surfaces
- **Card color**: `oklch(0.995 0.004 28)` for container items
- **Ink color**: `oklch(0.20 0.014 28)` for body text
- **Muted text**: `oklch(0.45 0.012 28)` for helper labels
- **Accent color**: `oklch(0.55 0.22 25)` for primary actions
- **Focus ring**: `oklch(0.48 0.15 250)` for interactive states

### Typography and interaction

Follow these design conventions:
- **Fonts**: Outfit for display headings, Geist for body text, and Geist Mono for code snippets
- **Emoji policy**: Use emojis only for event type markers
- **Hover effects**: Apply specific CSS transition transitions instead of broad transition resets
- **Call-to-action (CTA)**: Style primary actions with the accent background and bold Outfit font

## Model Context Protocol servers

The project integrates Model Context Protocol (MCP) servers to enable the agent to query APIs and databases.

### Workspace configuration

Define required workspace-level MCP servers in the `.agents/mcp_config.json` configuration file. The Antigravity IDE and CLI automatically discover and run these servers when you open the project.

### Active workspace servers

The project uses these workspace MCP servers:
- **chrome-devtools-mcp**: Enables browser testing and visual inspections using Playwright
- **gmp-code-assist**: Provides Google Maps Platform API documentation and reference guides

### Management and reloading

You can manage and inspect MCP connections using the `/mcp` command in the Antigravity CLI. This interactive manager allows you to:
- **Check status**: View connection states and active tool schemas
- **Reload configurations**: Apply updates made to `.agents/mcp_config.json` without restarting
- **Inspect logs**: Debug server startup errors or execution parameters

## Agent skills reference

Manage and execute agent skills using the Skills Command Line Interface (CLI) (`npx skills`). All skills are installed locally within the gitignored `.agents` directory and do not commit to the repository.

### Locked skills

The project uses [skills-lock.json](file:///C:/Users/lukee/Documents/Projects/playwales/skills-lock.json) to lock all local and project-specific skills.

To include all locally installed skills in the lock file, run:
```bash
npx skills add ./.agents/skills -y
```

To restore the locked skills on a new machine, run:
```bash
npx skills experimental_install
```

### Active skills in the lock file

The lock file records and tracks these local skills split by development domain:

#### Frontend and React development
- **frontend-developer**: Builds React 19 components and manages client-side states
- **frontend-design**: Guides visual aesthetics, typography, and theme styling decisions
- **next-dev-loop**: Verifies runtime behavior in Next.js applications
- **nextjs-app-router-patterns**: Master Next.js App Router with Server Components and advanced data fetching
- **nextjs-best-practices**: Recommends Next.js App Router performance and rendering patterns
- **react-best-practices**: Standardizes React and Next.js performance optimizations
- **responsive-design**: Implements fluid typography and container query layouts
- **shadcn**: Manages shadcn/ui components and design system templates
- **tailwind-design-system**: Standardizes styling systems using Tailwind CSS v4 tokens
- **tailwind-patterns**: Guides custom layouts using Tailwind CSS v4 container queries
- **tailwind-v4-shadcn**: Integrates shadcn/ui components with Tailwind CSS v4
- **typescript-advanced-types**: Implements type-safe logic and complex TypeScript signatures
- **vercel-react-best-practices**: Standardizes React component rendering patterns from Vercel Engineering

#### Backend and database engineering
- **api-design-principles**: Guides Representational State Transfer (REST) and GraphQL API design structures and schemas
- **fastapi-templates**: Provides patterns for routers, dependency injection, and Pydantic validation
- **flaskapi**: Scaffolds lightweight Python web APIs using Flask blueprints and extensions
- **supabase**: Orchestrates database, auth, and edge functions within Supabase
- **supabase-postgres-best-practices**: Optimizes PostgreSQL schemas, indexes, and Row-Level Security (RLS) policies

#### Testing, quality, and performance
- **accessibility**: Audits and improves web accessibility following Web Content Accessibility Guidelines (WCAG) 2.2 standards
- **fixing-accessibility**: Audits and repairs page accessibility and keyboard navigation
- **form-cro**: Optimizes surveys, lead capture forms, and general checkout experiences
- **kaizen**: Guides continuous code improvements and error-proofing integrations
- **lint-and-validate**: Runs validation commands after code edits to ensure correctness
- **performance**: Audits and optimizes loading speeds for web applications
- **seo-audit**: Audits pages for search engine technical optimizations
- **systematic-debugging**: Follows structured protocols to debug runtime failures
- **webapp-testing**: Tests frontend functionalities using automated Playwright browser scripts

#### DevOps, git, and productivity
- **algorithm-design**: Designs algorithms with LaTeX pseudocode and Unified Modeling Language (UML) diagrams
- **concise-planning**: Generates clear, actionable, and atomic plans for coding tasks
- **devcontainer-setup**: Creates devcontainers with development tooling and sandboxed environments
- **docker-expert**: Optimizes, secures, and configures Docker containerization setups
- **find-skills**: Discovers and installs skills from the open agent skills ecosystem
- **git-guardrails-claude-code**: Sets up hooks to block destructive git commands
- **git-pushing**: Stages changes, writes conventional commits, and pushes to remote
- **github-actions-docs**: Writes and troubleshoots GitHub Actions workflows and CI/CD runs
- **hallmark**: Governs the visual design and UX standards for page layouts
- **theme-factory**: Standardizes typography and color palettes for document styling

## Writing guidelines compliance

You must follow the project writing guidelines when generating comments, docstrings, or markdown files.

### Core prose rules

Apply these principles to your written output:
- **Active voice**: Use active verbs and specify the subject doing the action
- **Direct address**: Use `you` to address the reader directly
- **Concise phrasing**: Keep sentences under 20 words
- **No marketing fluff**: Avoid words like `easy`, `simple`, `quick`, `very`, `just`, or `really`
- **Paragraph structure**: Keep body paragraphs between 2 and 4 sentences
- **Heading style**: Use sentence case for headings and subheadings
