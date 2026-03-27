-- Safe subset for future UserProfile / social; does not expose email or private future columns.
CREATE OR REPLACE FUNCTION public.public_profile_for(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  username text,
  first_name text,
  last_name text,
  avatar_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pr.id, pr.username, pr.first_name, pr.last_name, pr.avatar_url
  FROM public.profiles pr
  WHERE pr.id = p_user_id;
$$;

REVOKE ALL ON FUNCTION public.public_profile_for(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_profile_for(uuid) TO authenticated;
