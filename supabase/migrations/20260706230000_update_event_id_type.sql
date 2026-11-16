-- Alter events.id to match the guid string from pokedata
ALTER TABLE public.events ALTER COLUMN id TYPE text;
ALTER TABLE public.events ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;