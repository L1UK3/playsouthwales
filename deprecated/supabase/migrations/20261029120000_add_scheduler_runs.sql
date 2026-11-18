-- Tracks when each scheduled job last ran so restarts don't repeat it.
CREATE TABLE IF NOT EXISTS public.scheduler_runs (
    job text PRIMARY KEY,
    last_run_on date NOT NULL DEFAULT '1970-01-01'
);

ALTER TABLE public.scheduler_runs ENABLE ROW LEVEL SECURITY;

INSERT INTO public.scheduler_runs (job)
VALUES ('daily_digest'), ('weekly_digest')
ON CONFLICT (job) DO NOTHING;
