
-- 1. Profile columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS payment_handle text,
  ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;

-- Backfill payment method from venmo_handle
UPDATE public.profiles
  SET payment_method = 'venmo', payment_handle = venmo_handle
  WHERE payment_method IS NULL AND venmo_handle IS NOT NULL AND length(trim(venmo_handle)) > 0;

UPDATE public.profiles
  SET payment_method = 'zelle', payment_handle = zelle_info
  WHERE payment_method IS NULL AND zelle_info IS NOT NULL AND length(trim(zelle_info)) > 0;

-- Generate referral codes for everyone
UPDATE public.profiles
  SET referral_code = upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 6))
  WHERE referral_code IS NULL;

-- Function: auto-generate referral code on signup
CREATE OR REPLACE FUNCTION public.ensure_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
    NEW.referral_code := upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 6));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ensure_referral_code_trg ON public.profiles;
CREATE TRIGGER ensure_referral_code_trg
BEFORE INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.ensure_referral_code();

-- 2. board_comments
CREATE TABLE IF NOT EXISTS public.board_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.board_posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_board_comments_post ON public.board_comments(post_id, created_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.board_comments TO authenticated;
GRANT ALL ON public.board_comments TO service_role;

ALTER TABLE public.board_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view comments" ON public.board_comments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Members can comment" ON public.board_comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors update own comments" ON public.board_comments
  FOR UPDATE TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors or admins delete comments" ON public.board_comments
  FOR DELETE TO authenticated USING (auth.uid() = author_id OR public.has_role(auth.uid(), 'admin'::public.app_role));

-- 3. neighbor_checkins
CREATE TABLE IF NOT EXISTS public.neighbor_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  matched_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_neighbor_checkins_requester ON public.neighbor_checkins(requester_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_neighbor_checkins_matched ON public.neighbor_checkins(matched_id, created_at DESC);

GRANT SELECT, INSERT ON public.neighbor_checkins TO authenticated;
GRANT ALL ON public.neighbor_checkins TO service_role;

ALTER TABLE public.neighbor_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members see own check-ins" ON public.neighbor_checkins
  FOR SELECT TO authenticated USING (auth.uid() = requester_id OR auth.uid() = matched_id OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Members create own check-ins" ON public.neighbor_checkins
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id);

-- 4. Rebuild members_directory with new fields + referral count + activity counts
DROP VIEW IF EXISTS public.members_directory;
CREATE VIEW public.members_directory
WITH (security_invoker = true)
AS
SELECT
  p.id,
  p.name,
  p.bio,
  p.profession,
  p.employment_status,
  p.zip_code,
  p.photo_url,
  p.is_verified,
  p.participant_status,
  p.favorite_third_space,
  p.open_to_in_person,
  p.preferred_contact_method,
  p.contact_handle,
  p.venmo_handle,
  p.payment_method,
  p.payment_handle,
  p.referral_code,
  p.referred_by,
  p.created_at,
  p.created_at AS joined_at,
  (SELECT count(*) FROM public.profiles r WHERE r.referred_by = p.id) AS referral_count,
  (SELECT count(*) FROM public.board_posts bp WHERE bp.author_id = p.id AND bp.is_example = false) AS posts_count,
  (SELECT count(*) FROM public.board_posts bp WHERE bp.helped_by = p.id) AS helps_count,
  (SELECT count(*) FROM public.event_rsvps r WHERE r.user_id = p.id) AS rsvps_count
FROM public.profiles p
WHERE p.participant_status IN ('active', 'inactive');

GRANT SELECT ON public.members_directory TO authenticated, anon;

-- 5. Realtime publication
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='board_posts') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.board_posts;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='board_comments') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.board_comments;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='event_rsvps') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.event_rsvps;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='neighbor_checkins') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.neighbor_checkins;
  END IF;
END $$;
