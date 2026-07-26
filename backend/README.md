---
meta.contentType: Reference
---

# How do I configure and run the FastAPI backend?

This document guides you through setting up, configuring, and testing the Play! South Wales FastAPI REST API.

## Plan

- **Overview**: Reference documentation for the backend server.
- **Goal**: Configure environment variables, install dependencies, run the API server, and run tests.
- **Audience**: Backend developers and contributors.
- **Content Plan**: Setup commands, configuration variable details, project structure layout, and test verification steps.
- **Open Questions**: None.

## System requirements

Ensure you have the following software installed before proceeding:
- Python 3.14 or later
- Node.js (for managing project dependencies at the root)

## Setup instructions

Follow these sequential steps to initialize your local development environment:

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Initialize a Python virtual environment:
   ```bash
   python -m venv .venv
   ```
3. Activate the virtual environment:
   - On Windows:
     ```powershell
     .venv\Scripts\Activate.ps1
     ```
   - On macOS or Linux:
     ```bash
     source .venv/bin/activate
     ```
4. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
5. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
6. Populate the `.env` file with your credentials before launching the application.

## Configuration variables

The server relies on the following environment variables defined in your `.env` file:

- **`CLERK_SECRET_KEY`**: Your Clerk private API key.
- **`CLERK_JWT_KEY`**: Public PEM key to verify JSON Web Tokens (JWT) locally.
- **`CLERK_AUTHORIZED_PARTIES`**: Comma-separated list of allowed origins.
- **`CLERK_WEBHOOK_SIGNING_SECRET`**: Key used to verify inbound webhook signatures from Clerk.
- **`SUPABASE_URL`**: The HTTP URL of your local or remote Supabase instance.
- **`SUPABASE_KEY`**: Supabase anonymous public key.
- **`SUPABASE_SECRET_KEY`**: Supabase `service_role` secret key to bypass Row-Level Security (RLS).
- **`DATABASE_URL`**: Connection string for PostgreSQL migrations and local database access.
- **`ALLOWED_ORIGINS`**: Comma-separated origins allowed to request API resources.
- **`DISCORD_BOT_URL`**: HTTP API address of the Discord notification agent.
- **`DISCORD_ANNOUNCEMENTS_CHANNEL_ID`**: Discord channel identifier for daily or weekly announcements.

## Run the API server

To run the Uvicorn development server with live reload enabled:
```bash
uvicorn app:create_app --factory --host 127.0.0.1 --port 5000 --reload
```

The API server runs at `http://127.0.0.1:5000`. You can view the interactive documentation at `http://127.0.0.1:5000/docs`.

## Project structure

The backend code organizes around modular domains inside the `app/` folder:

- **`app/auth.py`**: Handles user authentication and Clerk JWT token parsing.
- **`app/config.py`**: Manages environment variables using Pydantic settings.
- **`app/dependencies.py`**: Provides reusable FastAPI dependencies like the Supabase client.
- **`app/exceptions.py`**: Declares application-specific exceptions.
- **`app/lifespan.py`**: Manages startup and shutdown routines.
- **`app/models.py`**: Houses request payload and response Pydantic schemas.
- **`app/scheduler.py`**: Schedules recurring cron tasks.
- **`app/routers/`**: Defines API routes separated by public and protected access.
- **`app/services/`**: Orchestrates event, league, and leaderboard business logic.
- **`app/integrations/`**: Connects the backend to the Discord bot HTTP API.
- **`app/web/`**: Scrapes external sources like Limitless TCG and Pokédata.

## Run tests and verification

To run the unit test suite:
```bash
pytest
```

To run the Ruff linter and formatter checks:
```bash
ruff check .
ruff format . --check
```
