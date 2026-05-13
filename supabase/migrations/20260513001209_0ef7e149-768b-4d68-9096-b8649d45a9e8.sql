CREATE TABLE IF NOT EXISTS public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  link TEXT,
  host_name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can view events" ON public.events;
CREATE POLICY "Authenticated can view events"
  ON public.events FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can create events" ON public.events;
CREATE POLICY "Authenticated can create events"
  ON public.events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Creators can update own events" ON public.events;
CREATE POLICY "Creators can update own events"
  ON public.events FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Admins can manage all events" ON public.events;
CREATE POLICY "Admins can manage all events"
  ON public.events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Public can view events" ON public.events;
CREATE POLICY "Public can view events"
  ON public.events FOR SELECT TO anon USING (true);

CREATE TABLE IF NOT EXISTS public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  title TEXT,
  body TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view site content" ON public.site_content;
CREATE POLICY "Anyone can view site content"
  ON public.site_content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage site content" ON public.site_content;
CREATE POLICY "Admins can manage site content"
  ON public.site_content FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.site_content (section, sort_order, title, body)
SELECT * FROM (VALUES
  ('faq', 1, 'How much do I contribute each month?', 'Each member contributes 7% of their post-tax monthly income. Student loan payments are subtracted before the 7% is calculated.'),
  ('faq', 2, 'Where does my money go?', 'Directly to another member via Venmo or Zelle. There is no pool, no middleman, and no overhead. The steward calculates who sends to whom each month.'),
  ('faq', 3, 'What if my income changes?', 'Just update your profile before the 1st of the month. The math adjusts automatically.'),
  ('faq', 4, 'Do I have to come to gatherings?', 'Nope — but we hope you will. Gatherings are how we stay neighbors instead of strangers. No pressure, just good food and good people.'),
  ('faq', 5, 'Is this a charity?', 'No. This is mutual aid — neighbors carrying each other. Everyone contributes, everyone benefits. The direction of money just depends on where you are relative to the group average.'),
  ('faq', 6, 'How do I join?', 'Apply on the signup page. An existing member will reach out to welcome you and walk you through how it works.')
) AS v(section, sort_order, title, body)
WHERE NOT EXISTS (SELECT 1 FROM public.site_content WHERE section = 'faq');