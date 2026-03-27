ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url text;

COMMENT ON COLUMN public.profiles.avatar_url IS 'Public URL for avatar image (e.g. Supabase Storage avatars bucket: {supabaseUrl}/storage/v1/object/public/avatars/{user_id}/...).';
