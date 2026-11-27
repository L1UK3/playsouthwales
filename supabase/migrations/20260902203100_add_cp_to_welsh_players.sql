-- Add cp (Championship Points) column to welsh_players table
ALTER TABLE public.welsh_players ADD COLUMN IF NOT EXISTS cp integer DEFAULT 0;

