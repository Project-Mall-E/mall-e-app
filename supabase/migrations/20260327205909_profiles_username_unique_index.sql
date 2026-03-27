-- Partial unique index: non-empty usernames are unique case-insensitively.
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique
ON public.profiles (lower(trim(username)))
WHERE username IS NOT NULL AND btrim(username) <> '';
