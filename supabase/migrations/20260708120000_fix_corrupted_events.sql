-- Fix the events table
UPDATE public.events
SET 
  name = CASE WHEN name ~ '^£(.[£])*$' THEN rtrim(regexp_replace(name, '£(.)', '\1', 'g'), '£') ELSE name END,
  description = CASE WHEN description ~ '^£(.[£])*$' THEN rtrim(regexp_replace(description, '£(.)', '\1', 'g'), '£') ELSE description END,
  "entryFee" = CASE WHEN "entryFee" ~ '^£(.[£])*$' THEN rtrim(regexp_replace("entryFee", '£(.)', '\1', 'g'), '£') ELSE "entryFee" END
WHERE 
  name ~ '^£(.[£])*$' 
  OR description ~ '^£(.[£])*$' 
  OR "entryFee" ~ '^£(.[£])*$';

-- Fix the weekly_events table
UPDATE public.weekly_events
SET 
  name = CASE WHEN name ~ '^£(.[£])*$' THEN rtrim(regexp_replace(name, '£(.)', '\1', 'g'), '£') ELSE name END,
  description = CASE WHEN description ~ '^£(.[£])*$' THEN rtrim(regexp_replace(description, '£(.)', '\1', 'g'), '£') ELSE description END,
  "entryFee" = CASE WHEN "entryFee" ~ '^£(.[£])*$' THEN rtrim(regexp_replace("entryFee", '£(.)', '\1', 'g'), '£') ELSE "entryFee" END
WHERE 
  name ~ '^£(.[£])*$' 
  OR description ~ '^£(.[£])*$' 
  OR "entryFee" ~ '^£(.[£])*$';
