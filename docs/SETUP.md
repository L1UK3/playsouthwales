---
meta.contentType: Tutorial
---

# How do I set up Play! South Wales locally?

This guide walks you through running the frontend, backend, and Discord bot locally.

## Prerequisites

- **Node.js**: v18+
- **Python**: v3.11+
- **Git**

## Quick start

### 1. Clone the repository

```bash
git clone https://github.com/L1UK3/playsouthwales.git
cd playsouthwales
```

### 2. Configure environment variables

Copy and fill the `.env` templates:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp bot/.env.example bot/.env
```

Key variables to fill:

- `backend/.env`: `CLERK_SECRET_KEY`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`
- `frontend/.env`: `VITE_CLERK_API_KEY`, `VITE_GOOGLE_MAPS_API_KEY`
- `bot/.env`: `BOT_TOKEN`, `CLIENT_ID` (optional for local mock mode)

### 3. Start the backend

```bash
cd backend
python -m venv .venv

# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app:create_app --factory --host 127.0.0.1 --port 5000 --reload
```

### 4. Start the frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

### 5. Start the Discord bot (optional)

In a new terminal:

```bash
cd bot
npm install
npm run watch
```

## Verify services

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API health**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Interactive Swagger docs**: [http://localhost:5000/docs](http://localhost:5000/docs)
- **Bot health**: [http://localhost:5001/health](http://localhost:5001/health)

## Run with Docker Compose

Alternatively, start all services together:

```bash
docker compose up --build
```
