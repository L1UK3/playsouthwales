---
meta.contentType: How-to
---

# How do I develop and extend the FastAPI backend?

This guide covers creating endpoints, models, services, and tests in the backend.

## Add an API endpoint

1. Choose the router:
    - Public: [backend/app/routers/public.py](../backend/app/routers/public.py)
    - Protected: [backend/app/routers/protected.py](../backend/app/routers/protected.py)

2. Define your endpoint:

    ```python
    from fastapi import APIRouter, Depends
    from supabase import Client
    from app.dependencies import get_supabase
    from app.models import LeagueResponse

    router = APIRouter()

    @router.get("/api/leagues-list", response_model=list[LeagueResponse])
    async def list_leagues(db: Client = Depends(get_supabase)):
        from app.services import league
        return await league.get_leagues(db)
    ```

3. To require authentication on admin routes:
    ```python
    from app.auth import require_auth

    @router.post("/api/admin-action")
    async def admin_action(auth: dict = Depends(require_auth)):
        return {"ok": True}
    ```

## Add validation models

Define request/response schemas in [backend/app/models.py](../backend/app/models.py) using Pydantic v2:

```python
from pydantic import BaseModel, Field

class EventCreate(BaseModel):
    name: str = Field(..., min_length=3)
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    league_id: int = Field(..., alias="leagueId")

    class Config:
        populate_by_name = True
```

## Add business logic

Place database operations in [backend/app/services/](../backend/app/services/):

```python
# backend/app/services/custom.py
from supabase import Client

async def get_items(db: Client):
    res = db.table("events").select("*").execute()
    return res.data
```

## Run tests and checks

```bash
cd backend
uv run ruff check .
pytest
```
