---
meta.contentType: How-to
---

# How to synchronize events and update database schemas

This guide explains how to trigger manual tournament synchronizations, exclude holiday dates from recurring schedules, and execute Supabase database migrations.

## Trigger manual synchronizations

The backend scheduler runs automated syncs periodically. You can also trigger immediate updates by sending authenticated `POST` requests with your Clerk JWT token.

### Trigger a Pokédata tournament sync

Run this command to pull the latest local tournament schedules from Pokédata:

```bash
curl -X POST http://localhost:5000/api/events/sync-pokedata \
  -H "Authorization: Bearer <clerk_token>"
```

The endpoint returns metrics detailing how many events the scraper imported, updated, or skipped.

### Trigger a Championship Series sync

Run this command to refresh global Championship Series tournaments and standings:

```bash
curl -X POST http://localhost:5000/api/events/sync-championship \
  -H "Authorization: Bearer <clerk_token>"
```

The endpoint imports regional, international, and special events into the database.

## Exclude a recurring event date

When a weekly tournament falls on a bank holiday, cancel that specific occurrence without deleting the recurring series.

### Option 1: Use the administrative interface

1. Navigate to `/admin` in your browser and sign in with administrative credentials.
2. Open the recurring tournament entry in the calendar view.
3. Select **Delete Occurrence** and confirm the date to exclude.

### Option 2: Use the REST API

Calculate the virtual event ID or copy it from the frontend URL. Send an authenticated `DELETE` request with the `excludeDate` query parameter:

```bash
curl -X DELETE "http://localhost:5000/api/events/10000000?excludeDate=2026-12-25" \
  -H "Authorization: Bearer <clerk_token>"
```

The backend parses the virtual ID, locates the weekly template record, and appends `2026-12-25` to `excluded_dates`.

## Apply database migrations

Supabase stores schema definitions and table constraints. Follow these steps to apply database updates:

1. Create a new SQL migration file in [supabase/migrations/](file:///d:/Projects/playsouthwales/supabase/migrations/):
    ```sql
    -- Example: supabase/migrations/20260905120000_add_event_notes.sql
    ALTER TABLE events ADD COLUMN note text;
    ```
2. Open your Supabase Dashboard and navigate to the **SQL Editor**.
3. Paste the contents of your migration script and click **Run**.
4. Update the corresponding Pydantic models in [backend/app/models.py](file:///d:/Projects/playsouthwales/backend/app/models.py).
5. Update matching TypeScript interfaces in [frontend/src/types/](file:///d:/Projects/playsouthwales/frontend/src/types/).
