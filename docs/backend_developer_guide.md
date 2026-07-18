---
meta.contentType: How-to
---

# How do I develop and extend the FastAPI backend?

This document outlines how you can add new endpoints, write validation schemas, implement background sync jobs, and write unit tests for the backend.

## Plan

- **Overview**: How-to guide for backend development tasks.
- **Goal**: Author FastAPI endpoints, declare validation models, build sync tasks, and write unit tests.
- **Audience**: Backend engineers modifying the REST API.
- **Content Plan**: Step-by-step instructions for adding endpoints, model declaration, task registration, and test writing.
- **Open Questions**: None.

## Add a new API endpoint

To add a new endpoint, you must register it with either the public or protected routers in the `backend/app/routers/` directory.

### Step 1: Locate the router

Determine the access level of the new endpoint:
- For open routes, use [backend/app/routers/public.py](file:///C:/Users/Luke%20Enness/Documents/projects/playsouthwales/backend/app/routers/public.py)
- For administrative routes requiring Clerk auth headers, use [backend/app/routers/protected.py](file:///C:/Users/Luke%20Enness/Documents/projects/playsouthwales/backend/app/routers/protected.py)

### Step 2: Define the route function

Import the required schemas and dependencies. Add your path decorator to the router instance:

```python
from fastapi import APIRouter, Depends
from app.models import CustomResponseSchema
from app.dependencies import get_supabase
from supabase import Client

router = APIRouter()

@router.get("/new-resource", response_model=list[CustomResponseSchema])
async def get_new_resource(db: Client = Depends(get_supabase)):
    # Your business logic goes here
    pass
```

### Step 3: Integrate service layers

Write the core business logic inside a service file in [backend/app/services/](file:///C:/Users/Luke%20Enness/Documents/projects/playsouthwales/backend/app/services/). Import the service function inside your router endpoint to keep endpoints clean.

---

## Declare validation models

Define all API payload shapes and database schemas using Pydantic v2 models in [backend/app/models.py](file:///C:/Users/Luke%20Enness/Documents/projects/playsouthwales/backend/app/models.py).

### How to write a Pydantic model:

1. Inherit from `BaseModel`
2. Specify explicit type annotations for every attribute
3. Use Pydantic field validators to enforce domain rules

```python
from pydantic import BaseModel, Field

class EventCreateRequest(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    start_time: str = Field(..., alias="startTime")
```

---

## Implement background sync jobs

Uvicorn lifespan tasks handle background synchronizations automatically. 

### How to configure a background task:

1. Open [backend/app/scheduler.py](file:///C:/Users/Luke%20Enness/Documents/projects/playsouthwales/backend/app/scheduler.py)
2. Define your sync logic inside `BackgroundScheduler`
3. Call the sync method inside the main runner loop `_run_scheduler`
4. Register the scheduler startup and shutdown actions in [backend/app/lifespan.py](file:///C:/Users/Luke%20Enness/Documents/projects/playsouthwales/backend/app/lifespan.py)

```python
# app/scheduler.py
class BackgroundScheduler:
    async def perform_sync(self):
        # Sync logic here
        pass
```

---

## Write unit tests

Write unit tests for every router or service modification in the `backend/tests/` directory.

### Step 1: Set up test data and mocks

Use the `supabase_table` fixture in [backend/tests/conftest.py](file:///C:/Users/Luke%20Enness/Documents/projects/playsouthwales/backend/tests/conftest.py) to mock database responses:

```python
def test_get_resource(client, supabase_table):
    mock_data = [{"id": "1", "name": "Cardiff Challenge"}]
    supabase_table("events", mock_data)
    
    response = client.get("/api/events")
    
    assert response.status_code == 200
    assert response.json()[0]["name"] == "Cardiff Challenge"
```

### Step 2: Test administrative endpoints

To test protected routes, mock the administrative user validation using the `mock_user` session context in your test case.

### Step 3: Run validation tests

Execute the test suites and check for style conformance:
```bash
pytest
ruff check .
```
