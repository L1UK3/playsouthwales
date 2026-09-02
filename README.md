<p align="center">
  <a href="https://playsouthwales.uk/">
    <img src="frontend/src/assets/icons/favicon.jpg" alt="Play! South Wales Logo" width="96" height="96" style="border-radius: 12px;" />
  </a>
</p>

# Play! South Wales

[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

<p align="center"><a href="https://playsouthwales.uk/" >https://playsouthwales.uk/</a></p>

Play! South Wales manages league schedules, player standings, and venue directories across South Wales. The platform provides event calendars, Championship Point leaderboards, and administrative tools for tournament organizers.

## Documentation directory

The project organizes all documentation according to the **Diátaxis Framework**. Choose the quadrant matching your current goal:

| Quadrant          | Document                                                             | Description                                                                            | Target audience           |
| :---------------- | :------------------------------------------------------------------- | :------------------------------------------------------------------------------------- | :------------------------ |
| **Tutorials**     | [docs/SETUP.md](docs/SETUP.md)                                       | Step-by-step walkthrough to configure and run the full stack locally.                  | New contributors          |
| **How-to guides** | [docs/backend_developer_guide.md](docs/backend_developer_guide.md)   | Instructions to create endpoints, declare models, and write tests.                     | Backend engineers         |
| **How-to guides** | [docs/frontend_developer_guide.md](docs/frontend_developer_guide.md) | Instructions for TanStack Router routes, TanStack Query, and design tokens.            | Frontend engineers        |
| **How-to guides** | [docs/bot_guide.md](docs/bot_guide.md)                               | Instructions for Discord bot setup, Express HTTP notifier, and slash commands.         | Bot maintainers           |
| **How-to guides** | [docs/event_sync.md](docs/event_sync.md)                             | Instructions to trigger scraper runs, exclude recurring dates, and run SQL migrations. | Maintainers and admins    |
| **How-to guides** | [CONTRIBUTING.md](CONTRIBUTING.md)                                   | Branching policies, conventional commit standards, and pull request rules.             | All contributors          |
| **Reference**     | [docs/api.md](docs/api.md)                                           | REST API endpoints, query parameters, request bodies, and error schemas.               | Frontend & API developers |
| **Reference**     | [backend/README.md](backend/README.md)                               | Backend settings, environment variables, dependencies, and test commands.              | Backend engineers         |
| **Reference**     | [bot/README.md](bot/README.md)                                       | Discord bot token configuration, Express HTTP endpoints, and slash commands.           | Bot maintainers           |
| **Reference**     | [frontend/design.md](frontend/design.md)                             | Design tokens, OKLCH palette values, typography rules, and CTA conventions.            | UI designers & engineers  |
| **Reference**     | [AGENTS.md](AGENTS.md)                                               | Architecture rules, agent skills mapping, and prose style standards.                   | AI coding assistants      |
| **Reference**     | [SECURITY.md](SECURITY.md)                                           | Supported release versions and vulnerability disclosure policies.                      | Security researchers      |
| **Explanation**   | [docs/architecture.md](docs/architecture.md)                         | Architectural discussions on system topology, virtual event IDs, and auth lifecycles.  | Core architects           |

## Services and ports

You can run each service independently or together using Docker Compose:

| Service          | Directory   | Local port | Health check URL                                                     | Environment template    |
| :--------------- | :---------- | :--------- | :------------------------------------------------------------------- | :---------------------- |
| **Frontend**     | `frontend/` | `5173`     | [http://localhost:5173](http://localhost:5173)                       | `frontend/.env.example` |
| **Backend API**  | `backend/`  | `5000`     | [http://localhost:5000/api/health](http://localhost:5000/api/health) | `backend/.env.example`  |
| **Swagger Docs** | `backend/`  | `5000`     | [http://localhost:5000/docs](http://localhost:5000/docs)             | N/A                     |
| **Discord Bot**  | `bot/`      | `5001`     | [http://localhost:5001/health](http://localhost:5001/health)         | `bot/.env.example`      |

## Tech stack

### Frontend

- **Framework**: React 19 with TypeScript and Vite
- **Routing**: TanStack Router with file-based routing
- **State management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS v4 and OKLCH color design tokens
- **Auth and maps**: Clerk React SDK and Google Maps Platform (`@vis.gl/react-google-maps`)
- **Graphics and icons**: Three.js and Lucide React

### Backend

- **Framework**: FastAPI running on Python 3.14+
- **Validation**: Pydantic v2 and Pydantic Settings
- **Database**: Supabase Python SDK with PostgreSQL
- **Authentication**: Clerk backend API with local JWT verification
- **Scheduler**: Asyncio lifespan background task runner
- **Testing and linting**: Pytest and Ruff

### Discord bot

- **Framework**: Discord.js v14 with DiscordX on Node.js
- **Notifier server**: Express HTTP server on port 5001
- **Commands**: Slash commands including `/ping` and `/help`

### Database and infrastructure

- **Database**: Supabase PostgreSQL for events, leagues, and standings
- **Identity provider**: Clerk authentication and session tokens
- **Asset storage**: Supabase Storage

## Repository structure

```text
playsouthwales/
├── backend/            # FastAPI REST API service
│   ├── app/            # Routers, models, services, lifespan, and scrapers
│   ├── tests/          # Pytest backend test suite
│   ├── Dockerfile      # Backend container configuration
│   └── pyproject.toml  # Python dependencies and tool settings
├── bot/                # Discord bot client and notifier service
│   ├── src/            # Slash commands and Express HTTP endpoints
│   ├── Dockerfile      # Bot container configuration
│   └── package.json    # Bot dependencies and scripts
├── frontend/           # Vite Single Page Application
│   ├── src/            # React components, routes, layouts, and hooks
│   ├── Dockerfile      # Frontend container configuration
│   └── package.json    # Frontend dependencies and scripts
├── docs/               # In-depth Diátaxis documentation
│   ├── SETUP.md        # Tutorial: Local setup walkthrough
│   ├── architecture.md # Explanation: System topology and virtual IDs
│   ├── api.md          # Reference: REST API endpoints and schemas
│   ├── event_sync.md   # How-to: Scraper jobs and database migrations
│   ├── backend_developer_guide.md  # How-to: Extending backend routers and models
│   ├── frontend_developer_guide.md # How-to: TanStack Router and Query workflows
│   └── bot_guide.md    # How-to: Discord bot setup and slash commands
├── supabase/           # Supabase migrations, seeds, and configurations
│   ├── migrations/     # PostgreSQL migration scripts
│   └── seed.sql        # Mock database fixtures for local development
├── docker-compose.yml  # Multi-service container definitions
└── AGENTS.md           # AI assistant development guidelines
```

## Getting started

You can run the application using Docker Compose or configure each service locally.

### Option 1: Run with Docker Compose

1. Clone the repository to your workstation:

    ```bash
    git clone https://github.com/L1UK3/playsouthwales.git
    cd playsouthwales
    ```

2. Copy the template environment files:

    ```bash
    cp backend/.env.example backend/.env
    cp bot/.env.example bot/.env
    cp frontend/.env.example frontend/.env
    ```

3. Populate your credentials in the created `.env` files.

4. Start all containers:
    ```bash
    docker compose up --build
    ```

### Option 2: Run natively on your machine

You can run Python and Node services directly on your operating system. Follow the detailed steps in [docs/SETUP.md](docs/SETUP.md) to initialize your virtual environment, install dependencies, and launch dev servers.

## Quality checks and testing

You must run validation commands before submitting code changes:

### Backend validation

```bash
cd backend
pytest
ruff check .
ruff format . --check
```

### Frontend validation

```bash
cd frontend
npm run lint
npm run format
```

### Discord bot validation

```bash
cd bot
npm run build
```

## Contributing

We welcome community contributions. Read our [CONTRIBUTING.md](CONTRIBUTING.md) guide for branching conventions, conventional commit standards, and pull request procedures. Please review our [CODEOFCONDUCT.md](CODEOFCONDUCT.md) before participating.

## License

This project is licensed under the terms of the [MIT License](LICENSE).
