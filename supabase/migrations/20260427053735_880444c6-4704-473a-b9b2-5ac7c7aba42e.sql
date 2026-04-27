
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_steward_managed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS contact_method text NOT NULL DEFAULT 'email',
  ADD COLUMN IF NOT EXISTS contact_notes text;

CREATE POLICY "Admins can update any transaction"
  ON public.transactions
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
