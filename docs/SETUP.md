---
meta.contentType: Tutorial
---

# How to set up Play! South Wales locally

This tutorial guides you through configuring and running the entire application stack on your local machine. You will start the FastAPI backend, the React Single Page Application, and the Discord bot service.

## Prerequisites

Before starting, install the following software tools on your operating system:

- **Git**: Version control client to clone the repository.
- **Python**: Version 3.14 or later.
- **uv**: Fast Python package and environment manager.
- **Node.js**: Version 20 or later with `npm`.
- **Docker Desktop**: Optional, for running containerized services.

## Step 1: Clone the repository

Open your terminal and clone the repository to your local machine:

```bash
git clone https://github.com/L1UK3/playsouthwales.git
cd playsouthwales
```

## Step 2: Configure environment files

Copy each example environment template to create your active configuration files:

```bash
# In the project root
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp bot/.env.example bot/.env
```

Open each `.env` file in your editor and configure your secrets:

- [backend/.env](file:///d:/Projects/playsouthwales/backend/.env): Set `CLERK_SECRET_KEY`, `SUPABASE_URL`, and `SUPABASE_SECRET_KEY`.
- [frontend/.env](file:///d:/Projects/playsouthwales/frontend/.env): Set `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_GOOGLE_MAPS_API_KEY`.
- [bot/.env](file:///d:/Projects/playsouthwales/bot/.env): Set `BOT_TOKEN`, `CLIENT_ID`, and `GUILD_ID`. Leave `BOT_TOKEN` blank to run in offline mock mode.

## Step 3: Start the backend service

Open a terminal window and navigate to the backend directory. Use `uv` to synchronize dependencies and start the development server:

```bash
cd backend
uv sync
uv run uvicorn app:create_app --factory --host 127.0.0.1 --port 5000 --reload
```

The Uvicorn server starts at `http://127.0.0.1:5000` with hot code reloading enabled.

## Step 4: Start the frontend client

Open a second terminal window and navigate to the frontend directory. Install the npm packages and start the Vite development server:

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server starts at `http://localhost:5173`. Open this URL in your web browser to view the client interface.

## Step 5: Start the Discord bot

Open a third terminal window and navigate to the bot directory. Install dependencies and start the bot with file watching:

```bash
cd bot
npm install
npm run watch
```

The bot listens for Discord events and opens an Express HTTP notifier server on port `5001`. If you left `BOT_TOKEN` empty, the service runs in mock mode for local testing.

## Step 6: Verify all services

Verify that each service responds to HTTP health checks:

- **Frontend client**: Open [http://localhost:5173](http://localhost:5173) to view the interactive calendar.
- **Backend health**: Open [http://localhost:5000/api/health](http://localhost:5000/api/health) to confirm the status returns `{"status": "healthy"}`.
- **Backend API docs**: Open [http://localhost:5000/docs](http://localhost:5000/docs) to explore the interactive Swagger documentation.
- **Bot service health**: Open [http://localhost:5001/health](http://localhost:5001/health) to confirm the bot server responds.

## Alternative: Run with Docker Compose

You can also run all three services inside Docker containers. Start the entire application using Docker Compose:

```bash
docker compose up --build
```

This command builds the images defined in the [docker](file:///d:/Projects/playsouthwales/docker) directory and joins the Supabase network.
