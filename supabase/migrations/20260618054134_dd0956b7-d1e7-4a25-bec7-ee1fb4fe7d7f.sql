
-- 1. Tighten profiles SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Transaction counterparties can view profile"
ON public.profiles FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.transactions t
    WHERE (t.sender_id = auth.uid() AND t.receiver_id = profiles.id)
       OR (t.receiver_id = auth.uid() AND t.sender_id = profiles.id)
  )
);

-- 2. Safe directory view exposing only non-sensitive columns
DROP VIEW IF EXISTS public.members_directory;
CREATE VIEW public.members_directory
WITH (security_invoker = off)
AS
SELECT
  id, name, bio, profession, employment_status, zip_code, photo_url,
  is_verified, participant_status, favorite_third_space, open_to_in_person,
  preferred_contact_method, contact_handle, venmo_handle, created_at
FROM public.profiles
WHERE participant_status = 'active'::public.participant_status
   OR participant_status = 'inactive'::public.participant_status;

ALTER VIEW public.members_directory OWNER TO postgres;
GRANT SELECT ON public.members_directory TO authenticated;

-- 3. Restrict calculation_runs reads to admins
DROP POLICY IF EXISTS "Authenticated can view runs" ON public.calculation_runs;

-- 4. Storage: add DELETE for own avatar, restrict listing to authenticated only
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Authenticated can read avatar objects"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'avatars');
-- Public CDN URLs for the public 'avatars' bucket still work without this policy.

-- 5. Lock down SECURITY DEFINER function EXECUTE privileges
REVOKE ALL ON FUNCTION public.promote_existing_admin(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.promote_existing_admin(text) TO authenticated;

REVOKE ALL ON FUNCTION public.revoke_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.revoke_admin(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Trigger-only functions: revoke from all callers
REVOKE ALL ON FUNCTION public.promote_allowlisted_admin() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.log_profile_changes() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
