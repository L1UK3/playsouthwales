#!/bin/bash
set -e

echo "=== Playwales Devcontainer Startup ==="

# 1. Start Supabase
echo "Starting Supabase local services..."
npx supabase start

# 2. Stop any existing background servers on ports 5000 and 5173
echo "Stopping any existing background processes on ports 5000 and 5173..."
npx kill-port 5000 || true
npx kill-port 5173 || true

# 3. Start Backend (FastAPI) in the background
echo "Starting backend development server (FastAPI)..."
cd backend
# Make sure .venv is in place
if [ ! -d ".venv" ]; then
    uv sync
fi
# Start the FastAPI server using uv run
uv run python app/main.py > backend.log 2>&1 &

# 4. Start Frontend (Vite) in the background
echo "Starting frontend development server (Vite)..."
cd ../frontend
# Make sure node_modules is in place
if [ ! -d "node_modules" ]; then
    npm ci
fi
npm run dev > frontend.log 2>&1 &

echo "=== Startup Complete ==="
echo "Logs are available in:"
echo "  - backend/backend.log"
echo "  - frontend/frontend.log"
echo "Services are running on:"
echo "  - Frontend: http://localhost:5173"
echo "  - Backend API: http://localhost:5000"
echo "  - Supabase Studio Dashboard: http://localhost:54323"
