---
meta.contentType: Tutorial
---

# How do I set up Play! South Wales locally?

This tutorial teaches you how to clone, configure, and run the Play! South Wales backend and frontend servers on your local machine.

## Plan

- **Overview**: Local environment installation and server execution.
- **Goal**: Launch both the frontend and backend servers to verify local API routing.
- **Audience**: Active contributors installing the workspace for the first time.
- **Content Plan**: Configure dependencies, launch the FastAPI server, launch the Vite dev server, and check health endpoints.
- **Open Questions**: None.

## Prerequisites

You need the following tools installed on your system:
- **Node.js**: Version 18.0.0 or higher
- **Python**: Version 3.11.0 or higher
- **Git**: Command line client

## Steps to run the application

<Steps>

### Clone the repository

Clone the source code from your repository host:

```bash
git clone https://github.com/your_username/playsouthwales.git
cd playsouthwales
```

### Configure environment variables

Create the local configuration files to store credentials.

1. Navigate to the backend directory and copy the template:

```bash
cd backend
cp .env.example .env
```

2. Open the `.env` file and input your Supabase and Clerk secrets:

```env
SUPABASE_URL=your_supabase_url_here
SUPABASE_SECRET_KEY=your_supabase_secret_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here
CLERK_JWT_KEY=your_clerk_jwt_key_here
```

3. Navigate to the frontend directory and create a `.env` file to redirect local traffic:

```bash
cd ../frontend
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

### Install and run the backend

Set up your Python virtual environment and start the FastAPI server.

1. Move to the backend folder and create a virtual environment:

```bash
cd ../backend
python -m venv .venv
```

2. Activate the virtual environment:
   - On Windows:
     ```powershell
     .venv\Scripts\Activate.ps1
     ```
   - On macOS/Linux:
     ```bash
     source .venv/bin/activate
     ```

3. Install the required Python packages:

```bash
pip install -r requirements.txt
```

4. Start the development server using uvicorn:

```bash
uvicorn app.main:app --host 127.0.0.1 --port 5000 --reload
```

### Install and run the frontend

Install node packages and launch the Vite development server.

1. Open a new terminal session, navigate to the frontend folder, and install dependencies:

```bash
cd frontend
npm install
```

2. Launch the developer server:

```bash
npm run dev
```

### Verify server connection

Open your browser and navigate to the local environment urls.

1. Confirm the backend API is live:
   Open [http://localhost:5000/api/health](http://localhost:5000/api/health). You should see:

   ```json
   {
       "status": "healthy"
   }
   ```

2. Access the user interface:
   Open [http://localhost:5173](http://localhost:5173) to view the homepage.

</Steps>
