---
meta.contentType: How-to
---

# How do I synchronize events and update database schemas?

This guide covers running manual scraper syncs, excluding recurring event dates, and applying database migrations.

## Trigger manual synchronizations

Send an authorized `POST` request with your Clerk JWT token:

### 1. Sync TCG expansions from Bulbapedia

```bash
curl -X POST http://localhost:5000/api/events/sync-sets \
  -H "Authorization: Bearer <clerk_token>"
```

### 2. Sync local tournaments from Pokédata

```bash
curl -X POST http://localhost:5000/api/events/sync-pokedata \
  -H "Authorization: Bearer <clerk_token>"
```

### 3. Sync Championship Series events

```bash
curl -X POST http://localhost:5000/api/events/sync-championship \
  -H "Authorization: Bearer <clerk_token>"
```

## Exclude a recurring event date

To cancel an occurrence on a holiday without deleting the entire series:

- **Via UI**: In `/admin`, open the event and click **Delete Occurrence**.
- **Via API**:
    ```bash
    curl -X DELETE "http://localhost:5000/api/events/10000000?excludeDate=2026-12-25" \
      -H "Authorization: Bearer <clerk_token>"
    ```

This appends the date to `excluded_dates` in the `weekly_events` table.

## Update database schema

1. Add a raw SQL file in [supabase/migrations/](../supabase/migrations/):
    ```sql
    alter table events add column note text;
    ```
2. Run the SQL script in your Supabase Dashboard SQL editor.
3. Update [backend/app/models.py](../backend/app/models.py) and [frontend/src/types/](../frontend/src/types/) to match.
