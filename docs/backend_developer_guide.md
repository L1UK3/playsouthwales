---
meta.contentType: How-to
---

# How to develop and extend the FastAPI backend

This guide explains how to add API routes, define Pydantic validation schemas, implement database services, and run backend tests using `uv`.

## Add an API endpoint

FastAPI separates routes into public and protected router modules.

1. Select the appropriate router module:
    - Public endpoints: [backend/app/routers/public.py](file:///d:/Projects/playsouthwales/backend/app/routers/public.py)
    - Administrative endpoints: [backend/app/routers/protected.py](file:///d:/Projects/playsouthwales/backend/app/routers/protected.py)

2. Define your endpoint handler. Inject the Supabase client using the `get_supabase` dependency:

    ```python
    from fastapi import APIRouter, Depends
    from supabase import Client
    from app.dependencies import get_supabase
    from app.models import LeagueResponse
    from app.services import league

    router = APIRouter()

    @router.get("/api/leagues-list", response_model=list[LeagueResponse])
    async def list_leagues(db: Client = Depends(get_supabase)):
        return await league.get_leagues(db)
    ```

3. To require authentication on admin routes, inject `require_auth`:

    ```python
    from app.auth import require_auth

    @router.post("/api/admin-action")
    async def admin_action(auth: dict = Depends(require_auth)):
        return {"authorized_user": auth.get("sub")}
    ```

## Add data validation models

Define request and response schemas in [backend/app/models.py](file:///d:/Projects/playsouthwales/backend/app/models.py) using Pydantic v2:

```python
from pydantic import BaseModel, ConfigDict, Field

class LeagueCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str = Field(..., min_length=2, max_length=100)
    location: str = Field(..., min_length=2)
    postcode: str | None = Field(default=None)
    brand_color: str | None = Field(default=None, alias="brandColor")
```

Always use `ConfigDict(populate_by_name=True)` when accepting camelCase properties from the frontend.

## Add business logic services

Place database interactions in the [backend/app/services/](file:///d:/Projects/playsouthwales/backend/app/services/) directory to keep routers lightweight:

```python
# backend/app/services/custom.py
from supabase import Client
from app.exceptions import NotFoundError

async def get_league_by_id(db: Client, league_id: int) -> dict:
    response = db.table("leagues").select("*").eq("id", league_id).execute()
    if not response.data:
        raise NotFoundError(f"League {league_id} not found")
    return response.data[0]
```

Handle database errors by raising custom exceptions defined in [backend/app/exceptions.py](file:///d:/Projects/playsouthwales/backend/app/exceptions.py).

## Manage dependencies and run checks

Manage Python packages and virtual environments with `uv`:

```bash
cd backend

# Add a new dependency
uv add httpx

# Run code linters and formatters
uv run ruff check .
uv run ruff format .

# Run the test suite
uv run pytest
```
