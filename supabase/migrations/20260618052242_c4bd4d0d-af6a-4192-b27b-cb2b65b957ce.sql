
-- event_rsvps
CREATE TABLE public.event_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.event_rsvps TO authenticated;
GRANT ALL ON public.event_rsvps TO service_role;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view all RSVPs" ON public.event_rsvps FOR SELECT TO authenticated USING (true);
CREATE POLICY "Members add own RSVP" ON public.event_rsvps FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members remove own RSVP" ON public.event_rsvps FOR DELETE TO authenticated USING (auth.uid() = user_id);

ALTER TABLE public.board_posts
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS helped_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_example boolean NOT NULL DEFAULT false;

DROP POLICY IF EXISTS "Admins update any board post" ON public.board_posts;
CREATE POLICY "Admins update any board post" ON public.board_posts FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_contact_method text,
  ADD COLUMN IF NOT EXISTS contact_handle text;

INSERT INTO public.site_content (section, sort_order, title, body)
SELECT v.section, v.sort_order, v.title, v.body FROM (VALUES
  ('about', 1, 'Our story', E'We started in April 2025, after watching peers lose jobs in global health and federal work. A handful of us pooled a small percentage of our income each month and sent it directly to whoever needed it most.\n\nThat pilot ran for 20 people without a single hiccup. Today the Baltimore chapter is 50+ members and growing — with a goal of 150 by the end of the year.\n\nThe Club started in Baltimore, but it''s designed to spread. Wherever there are neighbors who want to carry something together, a chapter can take root.'),
  ('about', 2, 'What''s a chapter?', E'A chapter is a local group of neighbors — small enough to know each other''s names, big enough to make a real dent each month. Baltimore is the first.\n\nWant to start one where you live? Reach out — we''re sketching out the playbook.'),
  ('about', 3, 'How it works', E'Every member contributes 7% of their post-tax monthly income. That money is divided equally across the club — those above the average send, those below receive.\n\nPayments go directly from neighbor to neighbor via Venmo or Zelle. No pool. No overhead. The club is the people, not the platform.\n\nResearch shows the most effective anti-poverty tool is direct cash, no strings. An extra $100–$200/month is groceries, gas, the dentist, breathing room.'),
  ('about', 4, 'Beyond the money', E'Money is the easiest currency to count, but it''s not the only one we trade. We host monthly gatherings — potlucks, skill shares, Sunday coffee. We have a board for offers and needs. We welcome new members in person.')
) AS v(section, sort_order, title, body)
WHERE NOT EXISTS (SELECT 1 FROM public.site_content WHERE section='about');

INSERT INTO public.board_posts (type, title, body, author_id, is_example, created_at)
SELECT v.type::public.board_post_type, v.title, v.body, (SELECT id FROM public.profiles ORDER BY created_at LIMIT 1), v.is_example, v.created_at
FROM (VALUES
  ('offer', 'Free haircuts this Saturday', 'I''m a stylist and I''ll be doing free haircuts at my place in Hampden, 1–4pm. DM me to book.', true, now() - interval '2 days'),
  ('need', 'Ride to BWI on May 9', 'Flight at 6am — anyone heading that direction? Happy to chip in for gas.', true, now() - interval '4 hours'),
  ('lead', 'Part-time admin role at a nonprofit', 'My org is hiring a part-time office coordinator. ~20 hrs/wk, $22/hr. Reply if interested.', true, now() - interval '1 day')
) AS v(type, title, body, is_example, created_at)
WHERE NOT EXISTS (SELECT 1 FROM public.board_posts WHERE is_example = true)
  AND EXISTS (SELECT 1 FROM public.profiles);

CREATE OR REPLACE FUNCTION public.promote_existing_admin(_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Only admins can promote';
  END IF;
  SELECT id INTO uid FROM auth.users WHERE lower(email) = lower(_email) LIMIT 1;
  IF uid IS NULL THEN RETURN false; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION public.promote_existing_admin(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.revoke_admin(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Only admins can revoke';
  END IF;
  DELETE FROM public.user_roles WHERE user_id = _user_id AND role = 'admin'::public.app_role;
  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION public.revoke_admin(uuid) TO authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
