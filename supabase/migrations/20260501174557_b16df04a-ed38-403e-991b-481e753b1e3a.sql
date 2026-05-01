-- Admin allowlist table
CREATE TABLE IF NOT EXISTS public.admin_allowlist (
  email text PRIMARY KEY,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_allowlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view allowlist"
  ON public.admin_allowlist FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert allowlist"
  ON public.admin_allowlist FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete allowlist"
  ON public.admin_allowlist FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed Alex
INSERT INTO public.admin_allowlist (email, note)
VALUES ('alexanderthezhu@gmail.com', 'Lead steward — Baltimore chapter')
ON CONFLICT (email) DO NOTHING;

-- Trigger: on new auth user, if email is allowlisted, grant admin
CREATE OR REPLACE FUNCTION public.promote_allowlisted_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.admin_allowlist
    WHERE lower(email) = lower(NEW.email)
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_promote_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_promote_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.promote_allowlisted_admin();

-- Backfill any existing users
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::public.app_role
FROM auth.users u
JOIN public.admin_allowlist a ON lower(a.email) = lower(u.email)
ON CONFLICT (user_id, role) DO NOTHING;