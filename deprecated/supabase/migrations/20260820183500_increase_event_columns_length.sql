ALTER TABLE public.events ALTER COLUMN "entryFee" TYPE text;
ALTER TABLE public.events ALTER COLUMN "startTime" TYPE text;
ALTER TABLE public.events ALTER COLUMN "eventType" TYPE text;
ALTER TABLE public.events ALTER COLUMN date TYPE text;

ALTER TABLE public.weekly_events ALTER COLUMN "entryFee" TYPE text;
ALTER TABLE public.weekly_events ALTER COLUMN "startTime" TYPE text;
ALTER TABLE public.weekly_events ALTER COLUMN "eventType" TYPE text;
ALTER TABLE public.weekly_events ALTER COLUMN date TYPE text;
