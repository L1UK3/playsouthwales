<p align="center">
  <a href="https://playsouthwales.uk/">
    <img src="frontend/src/assets/icons/favicon.jpg" alt="Play! South Wales Logo" width="96" height="96" style="border-radius: 12px;" />
  </a>
</p>

# Play! South Wales

https://playsouthwales.uk/

An interactive, full-stack league scheduling and management application for South Wales leagues.

This platform allows organizers to schedule league events, manage player standings, and display interactive maps of venue locations.

---

## Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript powered by Vite
- **Routing**: TanStack Router (file-based routing)
- **State management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS v4
- **Auth & Maps**: Clerk React SDK and Google Maps Platform (`@vis.gl/react-google-maps`)
- **Visuals**: Lucide React icons and Three.js

### Backend
- **Framework**: FastAPI running on Python 3.14+
- **Validation**: Pydantic v2 and Pydantic Settings
- **Database**: Supabase Python SDK with PostgreSQL
- **Auth**: Clerk backend API and JWT verification
- **Scheduler**: Asyncio lifespan scheduler syncing sets, tournaments, and rankings
- **Testing & linting**: Pytest and Ruff

### Discord bot
- **Framework**: Discord.js v14 + DiscordX on Node.js
- **HTTP notifier**: Express REST server on port 5001 to receive backend alerts
- **Commands**: Handy slash commands like `/ping` and `/help`

### Database & storage
- **PostgreSQL**: Hosted on Supabase for events, leagues, and standings
- **Auth**: Clerk user management and session verification
- **File storage**: Supabase Storage

---

## Repository structure

```text
playsouthwales/
├── backend/            # FastAPI REST API service
│   ├── app/            # Routers, models, services, lifespan, and scrapers
│   ├── tests/          # Pytest backend test suite
│   ├── Dockerfile      # Backend container definition
│   └── pyproject.toml  # Python dependencies and tool settings
├── bot/                # Discord bot client and notifier service
│   ├── src/            # Slash commands and Express HTTP endpoints
│   ├── Dockerfile      # Bot container definition
│   └── package.json    # Bot dependencies and scripts
├── frontend/           # Vite Single Page Application
│   ├── src/            # React components, routes, layouts, and hooks
│   ├── Dockerfile      # Frontend container definition
│   └── package.json    # Frontend dependencies and scripts
├── docs/               # In-depth guides and architecture docs
│   ├── SETUP.md        # Step-by-step local setup tutorial
│   ├── architecture.md # Architectural explanation and diagrams
│   ├── api.md          # REST API endpoints and payload schemas
│   ├── event_sync.md   # Event sync and database migration guide
│   └── backend_developer_guide.md # Backend developer guide
├── supabase/           # Supabase migrations, seeds, and configs
│   ├── migrations/     # PostgreSQL migration scripts
│   └── seed.sql        # Mock database data for local development
├── docker-compose.yml  # Docker multi-service configuration
└── AGENTS.md           # AI assistant development guidelines
```

---

## Documentation

Looking for deeper guides? Check out our documentation:

| Guide | Description |
| :--- | :--- |
| [docs/SETUP.md](docs/SETUP.md) | Step-by-step tutorial to get everything installed and running locally. |
| [docs/architecture.md](docs/architecture.md) | Deep-dive into system design, virtual event IDs, and auth flows. |
| [docs/backend_developer_guide.md](docs/backend_developer_guide.md) | How to add new endpoints, models, and tests to the backend. |
| [docs/event_sync.md](docs/event_sync.md) | How to trigger scraper syncs, exclude dates, and run SQL migrations. |
| [docs/api.md](docs/api.md) | Complete REST API endpoint reference and error schemas. |
| [backend/README.md](backend/README.md) | Backend settings, environment variables, and test instructions. |
| [bot/README.md](bot/README.md) | Discord bot setup, token configuration, and slash commands. |
| [frontend/design.md](frontend/design.md) | Design tokens, color palette (OKLCH), and typography rules. |
| [AGENTS.md](AGENTS.md) | Coding guidelines and developer setup for AI assistants. |

---

## Getting started

You can spin up everything with Docker Compose or run the services locally.

### Option 1: Quick start with Docker Compose

1. Clone the repository:
   ```bash
   git clone https://github.com/L1UK3/playsouthwales.git
   cd playsouthwales
   ```

2. Copy the sample environment files:
   ```bash
   cp backend/.env.example backend/.env
   cp bot/.env.example bot/.env
   cp frontend/.env.example frontend/.env
   ```

3. Add your Clerk and Supabase credentials to the `.env` files.

4. Start all containers:
   ```bash
   docker compose up --build
   ```

### Option 2: Running locally without Docker

If you prefer running Python and Node directly on your machine, check out the [docs/SETUP.md](docs/SETUP.md) tutorial for step-by-step instructions.

---

## Check your services

Once the services are running, test them out in your browser:

- **Frontend app**: [http://localhost:5173](http://localhost:5173)
- **Backend health check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Interactive API docs (Swagger)**: [http://localhost:5000/docs](http://localhost:5000/docs)
- **Discord bot status**: [http://localhost:5001/health](http://localhost:5001/health)

---

## Quality checks and testing

Run these checks to make sure your changes pass all tests and lint rules:

### Backend checks
```bash
cd backend
pytest
ruff check .
ruff format . --check
```

### Frontend checks
```bash
cd frontend
npm run lint
npm run format
```

---

## License

This project is licensed under the [LICENSE](LICENSE) file.
