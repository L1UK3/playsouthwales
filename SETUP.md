# Play South Wales - Local Development Setup Guide



This guide details the steps required to set up, configure, and run the development environment for the **Play South Wales TCG Leagues** application.



---



## 1. Prerequisites



Before starting, ensure you have the following installed on your system:



- **Git** (to clone and manage the codebase)

- **Node.js** (v22+ recommended) & `npm`

- **Python** (v3.12+ recommended) & `pip` (or `uv` package manager)

- **Docker & Docker Compose** (required for Supabase and the containerized services)

- **Supabase CLI** (installed locally as a devDependency, run via `npx supabase`)

- **Note on Node packages**: The repository uses NPM Workspaces. Running `npm install` at the project root will automatically install the root dependencies and all frontend packages.



---



## 2. Supabase Local Setup



The application uses a local instance of Supabase for authentication, database, and storage.



1. **Start Supabase Services**:

   From the project root directory, run:

   ```bash

   npx supabase start

   ```

   This command pulls and starts the local Supabase Docker containers (Postgres, Kong, GoTrue/Auth, Storage, etc.).

   

   > [!IMPORTANT]

   > Running `npx supabase start` also creates the Docker network `supabase_network_playwales`. This network is required by `docker-compose.yml` to allow the backend and frontend to communicate with the local Supabase instance.



2. **Verify Services**:

   Once started, the CLI will output your local service URLs and keys. Make note of these:

   - **Supabase Studio (Dashboard)**: `http://localhost:54323`

   - **Kong (API Gateway / Supabase URL)**: `http://localhost:54321`

   - **Database connection string**: `postgresql://postgres:postgres@localhost:54322/postgres`



3. **Database Migrations and Seeds**:

   Local migrations and seeds are applied automatically on startup. If you ever need to reset the local database and re-apply seeds, run:

   ```bash

   npx supabase db reset

   ```



---



## 3. Environment Variables Configuration



Both the frontend and backend require configuration files containing API keys and endpoints.



### Backend Config

Create or edit `backend/.env` with the following variables:

```ini

CLERK_SECRET_KEY=sk_test_...        # Your Clerk Secret Key

SUPABASE_URL=http://127.0.0.1:54321  # Kong URL from 'supabase start'

SUPABASE_KEY=eyJhbGciOiJIUz...       # Anon key from 'supabase start'

SUPABASE_SECRET_KEY=eyJhbGciOi...  # service_role key from 'supabase start'

DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres

```



### Frontend Config

Create or edit `frontend/.env` with the following variables:

```ini

VITE_GOOGLE_MAPS_API_KEY=AIzaSy...  # Your Google Maps API Key

VITE_CLERK_API_KEY=pk_test_...      # Your Clerk Publishable/Publish Key

VITE_API_URL=/api                   # Routes API calls through Vite proxy to the backend

```



---



## 4. Development Options



You can run the application services using a VS Code Devcontainer, Docker Compose, or natively on your host machine.



### Option A: Run via VS Code Devcontainer (Recommended / Easiest)



If you have VS Code and Docker installed, you can run the entire environment (Supabase, FastAPI backend, Vite frontend) inside a pre-configured Devcontainer.



1. Ensure **Docker Desktop** (or your Docker daemon) is running on your host machine.

2. Open the project folder in VS Code.

3. If you have the *Dev Containers* extension installed, VS Code will prompt you with a pop-up to reopen the folder. Click **Reopen in Container** (or run `Dev Containers: Reopen in Container` from the Command Palette `Ctrl+Shift+P`).

4. The devcontainer will automatically:

   - Connect to the host's Docker socket to run **local Supabase** containers (`npx supabase start`).

   - Sync the python virtual environment (`uv sync`) and Node packages (`npm ci`).

   - Run the **FastAPI backend** in the background (logs saved to `backend/backend.log`).

   - Run the **Vite frontend** in the background (logs saved to `frontend/frontend.log`).

5. Access the services:

   - **Frontend**: `http://localhost:5173`

   - **Backend API**: `http://localhost:5000`

   - **Supabase Studio**: `http://localhost:54323`



To tail logs from inside the devcontainer terminal:

```bash

tail -f backend/backend.log

tail -f frontend/frontend.log

```

To restart the services:

```bash

npx supabase start && docker compose down && docker compose up -d --build

```



---



### Option B: Run via Docker Compose (Containerized)



This will build and run the frontend and backend containers and connect them to the Supabase network.



1. Ensure local Supabase is running (`npx supabase start`).

2. Run Docker Compose from the project root:

   ```bash

   docker compose up --build

   ```

3. Access the services:

   - **Frontend**: `http://localhost:5173`

   - **Backend API**: `http://localhost:5000`

   - **Supabase Studio**: `http://localhost:54323`



---



### Option C: No Docker (Local Host)



#### 1. Running the FastAPI Backend

1. Navigate to the `backend` folder:

   ```bash

   cd backend

   ```

2. Create and activate a Python virtual environment:

   - **Windows (PowerShell)**:

     ```powershell

     python -m venv .venv

     .venv\Scripts\Activate.ps1

     ```

   - **macOS/Linux**:

     ```bash

     python3 -m venv .venv

     source .venv/bin/activate

     ```

3. Install dependencies:

   ```bash

   pip install -r requirements.txt

   ```

   *(If you use `uv`, you can run `uv sync` or `uv pip install -r requirements.txt`)*

4. Run the development server:

   ```bash

   python app/main.py

   ```

   *(Or if using `uv`, you can run it via: `uv run python app/main.py`)*

   The backend will be running on `http://127.0.0.1:5000`.



#### 2. Running the Vite Frontend

1. Install Node dependencies:

   You can install all dependencies from the project root by running:

   ```bash

   npm install

   ```

   *(This uses NPM Workspaces to install both the root and frontend packages).*

2. Navigate to the `frontend` folder:

   ```bash

   cd frontend

   ```

3. Run the development server:

   ```bash

   npm run dev

   ```

   The frontend will be running on `http://localhost:5173`.



---



## 5. Troubleshooting & Useful Commands



### Network errors: `network "supabase_network_playwales" not found`

This occurs when you try to run `docker compose up` before starting Supabase. 

- **Solution**: Run `npx supabase start` first, which creates the network.



### Checking Docker container status

To see the list of running local containers:

```bash

docker ps

```



### Applying database changes

- Generate a new migration file:

  ```bash

  npx supabase migration new <migration_name>

  ```

- Compare changes in your local database schema with current migrations:

  ```bash

  npx supabase db diff -f <migration_name>

  ```



### Stop Supabase Services

When you are done developing, you can stop the local containers to free up system resources:

```bash

npx supabase stop

```

To stop and destroy all local database data (clean slate):

```bash

npx supabase stop --clean

```

