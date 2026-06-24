
-- Restrict counterparty visibility on profiles
DROP POLICY IF EXISTS "Transaction counterparties can view profile" ON public.profiles;

-- Restrict email_templates SELECT to admins only
DROP POLICY IF EXISTS "Authenticated can view enabled templates" ON public.email_templates;

-- Restrict event_rsvps SELECT to own rows or admins
DROP POLICY IF EXISTS "Members view all RSVPs" ON public.event_rsvps;
CREATE POLICY "Members view own RSVPs"
ON public.event_rsvps
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));
