-- Drop existing foreign key constraints
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS event_league_id_fkey;
ALTER TABLE public.weekly_events DROP CONSTRAINT IF EXISTS "weekly_events_leagueId_fkey";

-- Re-create constraints with ON UPDATE CASCADE
ALTER TABLE public.events
  ADD CONSTRAINT event_league_id_fkey
  FOREIGN KEY ("leagueId") REFERENCES public.leagues(id)
  ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.weekly_events
  ADD CONSTRAINT "weekly_events_leagueId_fkey"
  FOREIGN KEY ("leagueId") REFERENCES public.leagues(id)
  ON UPDATE CASCADE ON DELETE CASCADE;