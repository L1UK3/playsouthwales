---
meta.contentType: How-to
---

# How do I synchronize events and update database schemas?

This guide teaches you how to trigger manual synchronization runs for tournament sets, update Welsh player standings, exclude recurring dates, and apply database migrations.

## Plan

- **Overview**: Step-by-step instructions for data ingestion and schema upgrades.
- **Goal**: Ingest external tournament schedules, modify player standings, and alter Supabase tables safely.
- **Audience**: Backend developers and operations administrators.
- **Content Plan**: Run scraper endpoints, edit recurring exclusion dates, and write matching DDL scripts.
- **Open Questions**: None.

## Triggering data synchronization

You can manually trigger synchronization routines using the API endpoints.

### Sync Pokémon TCG expansions

Bulbapedia hosts the list of official Trading Card Game (TCG) expansions. To sync newly released expansions starting from SV9 onwards:

1. Send an authorized `POST` request to the sync-sets endpoint:

```http
POST /api/events/sync-sets
Authorization: Bearer your_clerk_auth_token_here
```

2. Confirm the successful JSON response payload:

```json
{
    "success": true,
    "message": "TCG sets sync completed",
    "metrics": {
        "success": true,
        "sets_synced": 12
    }
}
```

### Sync local tournament schedules

Pokedata publishes event schedules within geographical coordinates. To pull the latest local tournaments:

1. Send an authorized `POST` request to the sync-pokedata endpoint:

```http
POST /api/events/sync-pokedata
Authorization: Bearer your_clerk_auth_token_here
```

2. Inspect the returned synchronization metrics:

```json
{
    "success": true,
    "message": "Pokedata sync completed",
    "metrics": {
        "inserted": 3,
        "skipped_existing": 14,
        "skipped_no_league": 2
    }
}
```

## Excluding recurring dates

When a weekly event falls on a holiday, you must exclude that specific date.

1. Navigate to the admin dashboard calendar view.
2. Select the specific occurrence you want to cancel.
3. Click **Delete Occurrence**.
4. The system updates the database:
   It appends the selected date string (e.g., `2026-07-25`) to the `excludedDates` list in the `weekly_events` table. The frontend automatically filters out this date.

## Updating the database schema (DDL Sync)

Since the project does not use ORM-managed automated migrations, you must apply database updates manually.

<Steps>

### Write the SQL migration script

Draft a raw SQL script to apply changes in the Supabase SQL editor. Use lowercase for commands and table definitions:

```sql
alter table events
add column registration_limit integer default 32;
```

### Update the Pydantic schema

Add the new column to your backend model structure.

1. Open [models.py](file:///C:/Users/Luke%20Enness/Documents/projects/playsouthwales/backend/app/models.py).
2. Add the field to the matching schema class:

```python
class EventBase(BaseModel):
    name: str
    date: str
    registration_limit: int | None = 32
```

### Apply SQL in Supabase

1. Open your Supabase console dashboard.
2. Navigate to the **SQL Editor** tab.
3. Paste and run your drafted SQL script.

</Steps>
