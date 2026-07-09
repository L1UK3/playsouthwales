-- Add isChampionshipSeries flag to leagues table
-- Championship series leagues (Regionals, Internationals, Worlds) appear
-- on the schedule calendar but NOT on the leagues map page.
ALTER TABLE public.leagues ADD COLUMN IF NOT EXISTS "isChampionshipSeries" boolean DEFAULT false;
