# Play South Wales - League Scheduler

An interactive, full-stack league scheduling and management application for South Wales leagues. 

This platform allows organizers to schedule league events, manage player standings, and display interactive maps of venue locations.

---

## Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Routing**: TanStack Router (File-based routing)
- **Styling**: Tailwind CSS v4
- **State Management**: TanStack Query (React Query)
- **Auth**: Clerk
- **Maps**: Google Maps Platform (`@vis.gl/react-google-maps`)

### Backend
- **Framework**: FastAPI (Python 3.12+)
- **Validation**: Pydantic v2
- **ORM / Client**: Supabase Python SDK

### Database & Auth
- **Database**: Postgres (hosted via Supabase)
- **User Authentication**: Clerk (frontend & backend JWT validation)
- **Storage**: Supabase Storage

---

## Repository Structure

```text
playwales/
├── backend/            # FastAPI python backend
│   ├── app/            # Application logic (routers, models, config)
│   ├── Dockerfile      # Backend dev container definition
│   └── requirements.txt
├── frontend/           # Vite + React typescript frontend
│   ├── src/            # Components, pages, routing, hooks, context
│   ├── Dockerfile      # Frontend dev container definition
│   └── package.json
├── supabase/           # Local Supabase configuration, migrations, and seeds
│   ├── migrations/     # Database migration scripts
│   └── seed.sql        # Mock database data for local testing
├── docker-compose.yml  # Docker multi-container setup
└── SETUP.md            # Detailed local development setup guide
```

---

## Getting Started

To get your local development environment up and running:

1. Refer to the **[SETUP.md](SETUP.md)** guide for prerequisites and detailed installation steps.
2. Spin up the local Supabase environment:
   ```bash
   npx supabase start
   ```
3. Run the development environment via Docker Compose:
   ```bash
   docker compose up --build
   ```
